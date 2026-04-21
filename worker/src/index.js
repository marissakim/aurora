// Eve AI Worker — proxies dashboard requests to Claude.
// Flow per request:
//   1. CORS preflight
//   2. Rate-limit by IP (50/day via KV)
//   3. Response cache lookup (24h, keyed by SHA-256 of payload)
//   4. Call Claude with tool use + prompt caching
//   5. Extract tool_use block, validate, cache response, return JSON
//
// Front-end on failure falls back to a deterministic mock — the worker
// returning 5xx is not fatal, just graceful degradation.

import { SYSTEM_PROMPT, ANALYSIS_TOOL } from './prompts.js';
import { checkAndIncrementRateLimit } from './rateLimit.js';

const CLAUDE_MODEL = 'claude-sonnet-4-5';
const CACHE_TTL_SECONDS = 24 * 60 * 60;
const REQUEST_TIMEOUT_MS = 45_000;

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    // Allow both the production origin and localhost for dev
    const corsOrigin =
      origin === allowedOrigin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')
        ? origin
        : allowedOrigin;

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }

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

    // Cache lookup — deterministic key from canonicalized inputs
    const cacheKey = 'resp:' + (await hashPayload({ profile, biomarkers: biomarkers || [] }));
    try {
      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        return json(JSON.parse(cached), 200, { ...corsHeaders, 'X-Eve-Cache': 'hit' });
      }
    } catch { /* ignore cache errors */ }

    // Call Claude
    let analysis;
    try {
      analysis = await callClaude(env.ANTHROPIC_API_KEY, profile, biomarkers || []);
    } catch (err) {
      console.error('Claude call failed:', err.message);
      return json({ error: 'Upstream error', detail: err.message }, 502, corsHeaders);
    }

    // Cache successful response (fire-and-forget; don't block the response)
    ctx.waitUntil(
      env.CACHE.put(cacheKey, JSON.stringify(analysis), {
        expirationTtl: CACHE_TTL_SECONDS,
      }).catch(() => { /* ignore */ })
    );

    return json(analysis, 200, {
      ...corsHeaders,
      'X-Eve-Cache': 'miss',
      'X-Eve-Remaining': String(rl.remaining),
    });
  },
};

// ─── Claude API call ────────────────────────────────────────────────

async function callClaude(apiKey, profile, biomarkers) {
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const userMessage = `Please analyze this user's fertility profile and return your response via the aurora_analysis tool.

Profile: ${JSON.stringify(profile, null, 2)}

Biomarkers: ${biomarkers.length === 0
    ? '(none added yet)'
    : JSON.stringify(biomarkers, null, 2)}`;

  // Caching disabled for initial testing — can re-enable once calls succeed.
  const request = {
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: userMessage },
    ],
    tools: [ANALYSIS_TOOL],
    tool_choice: { type: 'tool', name: 'aurora_analysis' },
  };

  let response;
  const startedAt = Date.now();
  try {
    console.log('Claude call starting, model:', CLAUDE_MODEL, 'key-prefix:', apiKey.slice(0, 14));
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    console.log('Claude responded in', Date.now() - startedAt, 'ms, status:', response.status);
  } catch (err) {
    clearTimeout(timeout);
    console.error('Claude fetch error:', err.name, err.message, 'after', Date.now() - startedAt, 'ms');
    if (err.name === 'AbortError') throw new Error('Claude call timed out');
    throw err;
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const errText = await response.text().catch(() => '(no body)');
    console.error('Claude error response:', response.status, errText.slice(0, 500));
    throw new Error(`Claude ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  // Find the tool_use block — Claude may include thinking blocks first
  const toolUse = (data.content || []).find(c => c.type === 'tool_use');
  if (!toolUse || !toolUse.input) {
    throw new Error('Claude response missing tool_use block');
  }

  // Basic shape validation — ensures we return what the frontend expects
  const { summary, insights, pathwayReasoning } = toolUse.input;
  if (typeof summary !== 'string' || !Array.isArray(insights) || !pathwayReasoning) {
    throw new Error('Claude response has invalid shape');
  }

  return { summary, insights, pathwayReasoning, _source: 'claude' };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}

/**
 * Stable SHA-256 hash of a canonicalized payload, used as the cache key.
 * Canonical = JSON-stringified with sorted keys so {a,b} and {b,a} hash equally.
 */
async function hashPayload(obj) {
  const canonical = JSON.stringify(obj, Object.keys(obj).sort());
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(canonical));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
