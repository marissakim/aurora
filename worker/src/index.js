// Eve AI Worker — single endpoint that grew into a small router.
//
// Routes (v0.1):
//   POST /                       → Claude proxy (backward-compat).
//   POST /insights                → Same. Explicit name for new callers.
//   POST /auth/apple              → Apple identity-token → session token.
//   POST /create-payment-intent   → Stripe PaymentIntent for kit checkout.
//   POST /stripe-webhook          → Stripe → us, marks order paid.
//   GET  /order/:id               → App polls for order status.
//   POST /admin/order/:id/status  → Marissa flips status (shared secret).
//
// Routes (v0.2 will add):
//   POST /webhook/mylabkit
//
// Front-end on failure falls back to a deterministic mock — the worker
// returning 5xx is graceful degradation, not fatal.

import { SYSTEM_PROMPT, ANALYSIS_TOOL } from './prompts.js';
import { checkAndIncrementRateLimit } from './rateLimit.js';
import { verifyAppleIdentityToken } from './jwt.js';
import {
  handleCreatePaymentIntent,
  handleStripeWebhook,
  handleGetOrder,
  handleAdminUpdateOrderStatus,
} from './orders.js';
import { handleAdminPage, handleAdminTelehealthPage } from './admin.js';
import { handleAdminWebOrdersPage } from './webOrders.js';
import {
  handleTelehealthRequest,
  handleAdminUpdateTelehealthStatus,
} from './telehealth.js';

const CLAUDE_MODEL = 'claude-sonnet-4-5';
const CACHE_TTL_SECONDS = 24 * 60 * 60;
const REQUEST_TIMEOUT_MS = 45_000;
const SESSION_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days
const APPLE_AUDIENCE = 'com.eve.fertility'; // our app's bundle ID

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = makeCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // GET routes (read-only — admin pages + /order/:id)
    if (request.method === 'GET') {
      if (url.pathname === '/admin' || url.pathname === '/admin/') {
        return handleAdminPage(request, env);
      }
      if (url.pathname === '/admin/telehealth' || url.pathname === '/admin/telehealth/') {
        return handleAdminTelehealthPage(request, env);
      }
      if (url.pathname === '/admin/web-orders' || url.pathname === '/admin/web-orders/') {
        return handleAdminWebOrdersPage(request, env);
      }
      const orderMatch = url.pathname.match(/^\/order\/([^/]+)$/);
      if (orderMatch) {
        return handleGetOrder(request, env, corsHeaders, orderMatch[1]);
      }
      return json({ error: 'Not found' }, 404, corsHeaders);
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    // POST routes — exact-match first, then patterns.
    if (url.pathname === '/auth/apple') {
      return handleAuthApple(request, env, corsHeaders);
    }
    if (url.pathname === '/auth/delete') {
      return handleAuthDelete(request, env, corsHeaders);
    }
    if (url.pathname === '/create-payment-intent') {
      return handleCreatePaymentIntent(request, env, corsHeaders);
    }
    if (url.pathname === '/stripe-webhook') {
      return handleStripeWebhook(request, env, ctx);
    }
    const adminMatch = url.pathname.match(/^\/admin\/order\/([^/]+)\/status$/);
    if (adminMatch) {
      return handleAdminUpdateOrderStatus(request, env, corsHeaders, adminMatch[1]);
    }
    const tlhAdminMatch = url.pathname.match(/^\/admin\/telehealth\/([^/]+)\/status$/);
    if (tlhAdminMatch) {
      return handleAdminUpdateTelehealthStatus(request, env, corsHeaders, tlhAdminMatch[1]);
    }
    if (url.pathname === '/telehealth/request') {
      return handleTelehealthRequest(request, env, corsHeaders);
    }

    // Default + /insights = the existing Claude analysis flow
    if (url.pathname === '/' || url.pathname === '/insights') {
      return handleInsights(request, env, ctx, corsHeaders);
    }

    return json({ error: 'Not found' }, 404, corsHeaders);
  },
};

// ─── /auth/apple — verify Apple JWT, mint our session token ─────────

async function handleAuthApple(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, corsHeaders);
  }
  const { identityToken, email, fullName } = body || {};
  if (!identityToken || typeof identityToken !== 'string') {
    return json({ error: 'Missing identityToken' }, 400, corsHeaders);
  }

  let payload;
  try {
    payload = await verifyAppleIdentityToken(identityToken, APPLE_AUDIENCE, env.CACHE);
  } catch (err) {
    console.error('Apple JWT verification failed:', err.message);
    return json({ error: 'Invalid identity token', detail: err.message }, 401, corsHeaders);
  }

  const userId = payload.sub;
  // Apple only includes email on the FIRST sign-in for a given user. The
  // client is allowed to pass it back to us in subsequent calls so we
  // can persist it (we only trust the JWT version on first sign-in).
  const verifiedEmail = payload.email || null;

  // Upsert user record in KV. Email + fullName from the client are only
  // stored if we don't already have them — protects against client lies.
  const userKey = `user:${userId}`;
  let user;
  try {
    const existing = await env.CACHE.get(userKey);
    user = existing ? JSON.parse(existing) : null;
  } catch {
    user = null;
  }
  if (!user) {
    user = {
      id: userId,
      email: verifiedEmail || email || null,
      fullName: fullName || null,
      createdAt: Date.now(),
    };
  } else if (!user.email && verifiedEmail) {
    // Pick up the email if we didn't have it before but Apple just returned it
    user.email = verifiedEmail;
  }
  await env.CACHE.put(userKey, JSON.stringify(user));

  // Mint a fresh opaque session token. 90-day TTL.
  const sessionToken = crypto.randomUUID().replace(/-/g, '');
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  await env.CACHE.put(
    `session:${sessionToken}`,
    JSON.stringify({ userId, expiresAt }),
    { expirationTtl: SESSION_TTL_SECONDS },
  );

  return json({
    userId,
    email: user.email,
    fullName: user.fullName,
    sessionToken,
    expiresAt,
  }, 200, corsHeaders);
}

// ─── /auth/delete — delete user account + associated data ───────────
//
// Required by Apple guideline 5.1.1(v): apps with account creation must
// support in-app deletion. Authenticated via the existing session token.
// Deletes:
//   - The session token currently in use (so caller is signed out)
//   - The user record (user:${userId})
//   - The user's order index (user-orders:${userId})
//
// Notes:
//   - Order records themselves (order:${orderId}) are KEPT for tax /
//     accounting compliance per the privacy policy. We strip the userId
//     from each so the order is no longer linked to a person — this is
//     "anonymization" not "retention" from the user's perspective.
//   - Stripe customer + payment records remain on Stripe per their
//     retention policy; users can request deletion via Stripe's privacy
//     controls separately.

async function handleAuthDelete(request, env, corsHeaders) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401, corsHeaders);
  }
  const token = auth.slice(7);
  if (!token) return json({ error: 'Unauthorized' }, 401, corsHeaders);

  // Resolve session → userId.
  let userId;
  try {
    const sessionRaw = await env.CACHE.get(`session:${token}`);
    if (!sessionRaw) return json({ error: 'Unauthorized' }, 401, corsHeaders);
    const session = JSON.parse(sessionRaw);
    if (session.expiresAt && session.expiresAt < Date.now()) {
      return json({ error: 'Session expired' }, 401, corsHeaders);
    }
    userId = session.userId;
  } catch {
    return json({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  // Anonymize the user's orders (strip userId) but retain the records
  // themselves for tax compliance. Best-effort — failure here doesn't
  // block the rest of the deletion.
  try {
    const orderListRaw = await env.CACHE.get(`user-orders:${userId}`);
    if (orderListRaw) {
      const orderIds = JSON.parse(orderListRaw);
      await Promise.all(
        orderIds.map(async oid => {
          try {
            const raw = await env.CACHE.get(`order:${oid}`);
            if (!raw) return;
            const order = JSON.parse(raw);
            order.userId = null;
            order.userDeletedAt = Date.now();
            await env.CACHE.put(`order:${oid}`, JSON.stringify(order));
          } catch {
            // Skip this order, continue.
          }
        }),
      );
    }
  } catch {
    // Anonymization failed; proceed with deletion anyway.
  }

  // Delete user record, order index, and the session in use.
  await Promise.all([
    env.CACHE.delete(`user:${userId}`),
    env.CACHE.delete(`user-orders:${userId}`),
    env.CACHE.delete(`session:${token}`),
  ]);

  return json({ ok: true, deletedUserId: userId }, 200, corsHeaders);
}

// ─── /insights — the existing Claude proxy, factored out ────────────

async function handleInsights(request, env, ctx, corsHeaders) {
  // Rate limit by IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rl = await checkAndIncrementRateLimit(env.CACHE, ip);
  if (!rl.allowed) {
    return json({ error: 'Daily rate limit reached', limit: rl.limit }, 429, corsHeaders);
  }

  // Parse and validate input
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, corsHeaders);
  }
  const { profile, biomarkers } = body || {};
  if (!profile || typeof profile !== 'object') {
    return json({ error: 'Missing profile' }, 400, corsHeaders);
  }

  const cacheKey = 'resp:v2:' + (await hashPayload({ profile, biomarkers: biomarkers || [] }));
  try {
    const cached = await env.CACHE.get(cacheKey);
    if (cached) {
      return json(JSON.parse(cached), 200, { ...corsHeaders, 'X-Eve-Cache': 'hit' });
    }
  } catch { /* ignore cache errors */ }

  let analysis;
  try {
    analysis = await callClaude(env.ANTHROPIC_API_KEY, profile, biomarkers || []);
  } catch (err) {
    console.error('Claude call failed:', err.message);
    return json({ error: 'Upstream error', detail: err.message }, 502, corsHeaders);
  }

  ctx.waitUntil(
    env.CACHE.put(cacheKey, JSON.stringify(analysis), {
      expirationTtl: CACHE_TTL_SECONDS,
    }).catch(() => { /* ignore */ }),
  );

  return json(analysis, 200, {
    ...corsHeaders,
    'X-Eve-Cache': 'miss',
    'X-Eve-Remaining': String(rl.remaining),
  });
}

// ─── Claude API call (unchanged from before refactor) ───────────────

async function callClaude(apiKey, profile, biomarkers) {
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const userMessage = `Please analyze this user's fertility profile and return your response via the aurora_analysis tool.

Profile: ${JSON.stringify(profile, null, 2)}

Biomarkers: ${biomarkers.length === 0
    ? '(none added yet)'
    : JSON.stringify(biomarkers, null, 2)}`;

  const reqBody = {
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    tools: [ANALYSIS_TOOL],
    tool_choice: { type: 'tool', name: 'aurora_analysis' },
  };

  let response;
  const startedAt = Date.now();
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(reqBody),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Claude call timed out');
    throw err;
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const errText = await response.text().catch(() => '(no body)');
    throw new Error(`Claude ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const toolUse = (data.content || []).find(c => c.type === 'tool_use');
  if (!toolUse || !toolUse.input) throw new Error('Claude response missing tool_use block');

  const { summary, insights, pathwayReasoning } = toolUse.input;
  if (typeof summary !== 'string' || !Array.isArray(insights) || !pathwayReasoning) {
    throw new Error('Claude response has invalid shape');
  }
  return { summary, insights, pathwayReasoning, _source: 'claude' };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function makeCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = env.ALLOWED_ORIGIN || '*';
  // Allow web prototype origin, localhost dev, and any origin when called
  // from the iOS app (RN fetches don't send a recognizable Origin header).
  const corsOrigin =
    origin === allowedOrigin
    || origin.startsWith('http://localhost')
    || origin.startsWith('http://127.0.0.1')
    || origin === ''
      ? origin || '*'
      : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function deepCanonicalize(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepCanonicalize);
  const sortedKeys = Object.keys(value).sort();
  const out = {};
  for (const k of sortedKeys) out[k] = deepCanonicalize(value[k]);
  return out;
}

async function hashPayload(obj) {
  const canonical = JSON.stringify(deepCanonicalize(obj));
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(canonical));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
