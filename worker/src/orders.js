// Order + payment handlers.
//
// /create-payment-intent — app calls before showing PaymentSheet:
//   1. Validates kit + shipping selection
//   2. Computes amount in cents (kit price + shipping cost)
//   3. Creates Stripe PaymentIntent via REST API
//   4. Writes draft order to KV (status='pending')
//   5. Returns { orderId, clientSecret, amount }
//
// /stripe-webhook — Stripe → us when payment succeeds/fails:
//   1. Verifies Stripe-Signature header (HMAC-SHA256 with whsec)
//   2. On payment_intent.succeeded: flips order to status='paid'
//      and emails Marissa via MailChannels
//   3. On payment_intent.payment_failed: flips to status='failed'
//
// /order/:id — app polling endpoint, returns current status snapshot.
//
// /admin/order/:id/status — Marissa-only, behind ADMIN_SHARED_SECRET
// header, lets her flip statuses manually until v0.2 mylabkit API.
//
// Stripe API access uses fetch + Basic auth (sk_test as username),
// avoiding the heavy stripe npm package. Webhook verification uses
// crypto.subtle for HMAC-SHA256 — no deps.

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const ORDER_STATUSES = [
  'pending',                // PaymentIntent created, awaiting payment
  'paid',                   // payment_intent.succeeded received
  'placed_with_mylabkit',   // Marissa placed the order manually
  'shipped',                // Kit shipped (Marissa-flipped, v0.2 webhook)
  'sample_received',        // Lab received the sample
  'results_ready',          // Results available
  'failed',                 // payment_intent.payment_failed
  'refunded',               // Manual refund via Stripe dashboard
];

// ─── /create-payment-intent ─────────────────────────────────────────

export async function handleCreatePaymentIntent(request, env, corsHeaders) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe not configured' }, 500, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, corsHeaders);
  }

  const { kit, shipping, customer } = body || {};
  if (!kit?.id || !kit?.price || !shipping?.id || !customer?.email) {
    return json({ error: 'Missing required fields' }, 400, corsHeaders);
  }

  // Look up the user from the session token (optional — anonymous
  // checkout is allowed for v0.1, just no order history).
  const userId = await userIdFromAuthHeader(request, env);

  const kitCents = Math.round(kit.price * 100);
  const shippingCents = Number(shipping.costCents) || 0;
  const totalCents = kitCents + shippingCents;

  const orderId = `ord_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;

  // Create the Stripe PaymentIntent. Pass shipping into Stripe's built-in
  // shipping field so the full address shows in the Dashboard payment page
  // — important for manual fulfillment via mylabkit until the v0.2 API
  // integration lands. Customer name/phone/email also get attached.
  let intent;
  try {
    intent = await createStripePaymentIntent(env.STRIPE_SECRET_KEY, {
      amount: totalCents,
      currency: 'usd',
      receiptEmail: customer.email,
      shipping: {
        name: customer.name,
        phone: customer.phone,
        address: shipping.address || null,
      },
      metadata: {
        orderId,
        kitId: kit.id,
        kitName: kit.name || kit.id,
        userId: userId || 'anonymous',
        shippingMethod: shipping.label || shipping.id,
        customerName: customer.name || '',
        customerPhone: customer.phone || '',
      },
    });
  } catch (err) {
    console.error('Stripe PaymentIntent failed:', err.message);
    return json({ error: 'Payment setup failed', detail: err.message }, 502, corsHeaders);
  }

  // Persist the draft order. status:pending until the webhook flips it.
  const order = {
    id: orderId,
    createdAt: Date.now(),
    status: 'pending',
    userId: userId || null,
    kit: { id: kit.id, name: kit.name || null, price: kit.price },
    shipping: {
      id: shipping.id,
      label: shipping.label || null,
      costCents: shippingCents,
      address: shipping.address || null,
      estimatedDeliveryAt: shipping.estimatedDeliveryAt || null,
    },
    customer: {
      email: customer.email,
      name: customer.name || null,
      phone: customer.phone || null,
    },
    amountCents: totalCents,
    stripePaymentIntentId: intent.id,
    paidAt: null,
    statusHistory: [{ status: 'pending', at: Date.now() }],
  };
  await env.CACHE.put(`order:${orderId}`, JSON.stringify(order));
  // Index by user so we can fetch their order history later.
  if (userId) {
    await appendUserOrder(env.CACHE, userId, orderId);
  }

  return json(
    { orderId, clientSecret: intent.client_secret, amount: totalCents },
    200,
    corsHeaders,
  );
}

// ─── /stripe-webhook ────────────────────────────────────────────────

export async function handleStripeWebhook(request, env, ctx) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook not configured', { status: 500 });
  }

  const signature = request.headers.get('Stripe-Signature') || '';
  const rawBody = await request.text();

  // Verify the Stripe-Signature header — rejects forged calls.
  const valid = await verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return new Response('Invalid signature', { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const intent = event.data?.object;
  const orderId = intent?.metadata?.orderId;
  if (!orderId) {
    // Webhook fired but no orderId in metadata — log and 200 so Stripe
    // doesn't retry forever.
    console.warn('Webhook event without orderId:', event.type);
    return new Response('OK', { status: 200 });
  }

  const orderKey = `order:${orderId}`;
  const existing = await env.CACHE.get(orderKey);
  if (!existing) {
    console.warn('Webhook for unknown order:', orderId);
    return new Response('OK', { status: 200 });
  }
  const order = JSON.parse(existing);

  console.log('[webhook] event:', event.type, 'order:', orderId);

  if (event.type === 'payment_intent.succeeded') {
    order.status = 'paid';
    order.paidAt = Date.now();
    order.statusHistory.push({ status: 'paid', at: Date.now() });
    await env.CACHE.put(orderKey, JSON.stringify(order));
    // Email Marissa synchronously so any errors land in tail logs.
    // (Was ctx.waitUntil but its logs don't show in pretty tail mode.)
    try {
      await emailMarissaPaidOrder(env, order);
    } catch (err) {
      console.error('[email] Threw:', err?.message || err);
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    order.status = 'failed';
    order.statusHistory.push({
      status: 'failed',
      at: Date.now(),
      note: intent.last_payment_error?.message || 'Payment failed',
    });
    await env.CACHE.put(orderKey, JSON.stringify(order));
  }

  return new Response('OK', { status: 200 });
}

// ─── /order/:id ────────────────────────────────────────────────────

export async function handleGetOrder(request, env, corsHeaders, orderId) {
  const raw = await env.CACHE.get(`order:${orderId}`);
  if (!raw) return json({ error: 'Order not found' }, 404, corsHeaders);

  const order = JSON.parse(raw);

  // Auth: only the owner can fetch their order. Anonymous orders are
  // readable by anyone with the orderId (acceptable for v0.1 since
  // orderIds are unguessable UUIDs).
  if (order.userId) {
    const userId = await userIdFromAuthHeader(request, env);
    if (userId !== order.userId) {
      return json({ error: 'Forbidden' }, 403, corsHeaders);
    }
  }

  // Slim down the response — drop internal Stripe id, statusHistory.
  return json(
    {
      id: order.id,
      status: order.status,
      kit: order.kit,
      shipping: order.shipping,
      amountCents: order.amountCents,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    },
    200,
    corsHeaders,
  );
}

// ─── /admin/order/:id/status ───────────────────────────────────────

export async function handleAdminUpdateOrderStatus(request, env, corsHeaders, orderId) {
  const provided = request.headers.get('X-Admin-Secret') || '';
  if (!env.ADMIN_SHARED_SECRET || provided !== env.ADMIN_SHARED_SECRET) {
    return json({ error: 'Forbidden' }, 403, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, corsHeaders);
  }
  const { status, note } = body || {};
  if (!ORDER_STATUSES.includes(status)) {
    return json({ error: 'Invalid status', allowed: ORDER_STATUSES }, 400, corsHeaders);
  }

  const orderKey = `order:${orderId}`;
  const raw = await env.CACHE.get(orderKey);
  if (!raw) return json({ error: 'Order not found' }, 404, corsHeaders);

  const order = JSON.parse(raw);
  order.status = status;
  order.statusHistory.push({ status, at: Date.now(), note: note || null });
  await env.CACHE.put(orderKey, JSON.stringify(order));

  return json({ id: orderId, status }, 200, corsHeaders);
}

// ─── Stripe REST helpers ───────────────────────────────────────────

async function createStripePaymentIntent(secretKey, { amount, currency, receiptEmail, shipping, metadata }) {
  const params = new URLSearchParams();
  params.set('amount', String(amount));
  params.set('currency', currency);
  params.set('automatic_payment_methods[enabled]', 'true');
  if (receiptEmail) params.set('receipt_email', receiptEmail);

  // Stripe's built-in shipping field — surfaces in Dashboard's payment
  // detail page as a "Shipping address" section, which is what's useful
  // for manual fulfillment via mylabkit.
  if (shipping?.name && shipping?.address) {
    const a = shipping.address;
    params.set('shipping[name]', shipping.name);
    if (shipping.phone) params.set('shipping[phone]', shipping.phone);
    if (a.line1) params.set('shipping[address][line1]', a.line1);
    if (a.line2) params.set('shipping[address][line2]', a.line2);
    if (a.city) params.set('shipping[address][city]', a.city);
    if (a.state) params.set('shipping[address][state]', a.state);
    if (a.zip) params.set('shipping[address][postal_code]', a.zip);
    params.set('shipping[address][country]', a.country || 'US');
  }

  for (const [k, v] of Object.entries(metadata || {})) {
    params.set(`metadata[${k}]`, String(v));
  }

  const res = await fetch(`${STRIPE_API_BASE}/payment_intents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(secretKey + ':'),
    },
    body: params.toString(),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '(no body)');
    throw new Error(`Stripe ${res.status}: ${errBody.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Stripe webhook signature verification ─────────────────────────
// Stripe-Signature header looks like:
//   t=1234567890,v1=abc123def..., v0=...
// We reconstruct `${t}.${rawBody}` and HMAC-SHA256 with whsec, then
// constant-time compare against v1.

async function verifyStripeSignature(rawBody, header, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map(p => p.split('=', 2)),
  );
  const timestamp = parts.t;
  const v1 = parts.v1;
  if (!timestamp || !v1) return false;

  // Reject signatures older than 5 minutes — replay protection.
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (ageSeconds > 5 * 60) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signedPayload),
  );
  const expected = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return constantTimeEqual(expected, v1);
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ─── Auth helpers ──────────────────────────────────────────────────

async function userIdFromAuthHeader(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  if (!token) return null;
  try {
    const raw = await env.CACHE.get(`session:${token}`);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.expiresAt && session.expiresAt < Date.now()) return null;
    return session.userId || null;
  } catch {
    return null;
  }
}

async function appendUserOrder(kv, userId, orderId) {
  const key = `user-orders:${userId}`;
  let list = [];
  try {
    const existing = await kv.get(key);
    if (existing) list = JSON.parse(existing);
  } catch {
    list = [];
  }
  list.unshift(orderId);
  await kv.put(key, JSON.stringify(list.slice(0, 50)));
}

// ─── Email Marissa via Resend ──────────────────────────────────────
// Was MailChannels but Cloudflare's free integration ended mid-2024.
// Resend has a free tier (100/day, 3000/month) and lets us send from
// onboarding@resend.dev without verifying a domain — fine for v0.1.
//
// Set: `wrangler secret put RESEND_API_KEY` (re_xxx from resend.com).
// Pre-TestFlight: verify the eve.fertility domain so emails come from
// our brand instead of resend.dev.

async function emailMarissaPaidOrder(env, order) {
  console.log('[email] Send attempt for order', order.id);
  const to = env.ADMIN_NOTIFY_EMAIL;
  if (!to) {
    console.warn('[email] ADMIN_NOTIFY_EMAIL not configured — skipping');
    return;
  }
  if (!env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not configured — skipping');
    return;
  }
  console.log('[email] Sending to', to, 'via Resend');

  const dollars = (order.amountCents / 100).toFixed(2);
  const ship = order.shipping?.address || {};
  const subject = `New paid Eve Kit order: ${order.kit.name || order.kit.id} ($${dollars})`;
  const text = `New order received:

Order ID: ${order.id}
Kit: ${order.kit.name || order.kit.id} ($${order.kit.price})
Shipping: ${order.shipping.label || order.shipping.id} ($${(order.shipping.costCents / 100).toFixed(2)})
Total: $${dollars}

Customer:
  ${order.customer.name || '(no name)'}
  ${order.customer.email}
  ${order.customer.phone || '(no phone)'}

Ship to:
  ${ship.line1 || ''}
  ${ship.line2 || ''}
  ${ship.city || ''}, ${ship.state || ''} ${ship.zip || ''}

Place this order with mylabkit.com, then mark as 'placed_with_mylabkit' via:

  curl -X POST https://eve-ai.eve-prototype.workers.dev/admin/order/${order.id}/status \\
    -H "Content-Type: application/json" \\
    -H "X-Admin-Secret: <ADMIN_SHARED_SECRET>" \\
    -d '{"status":"placed_with_mylabkit"}'
`;

  const fromAddress = env.FROM_EMAIL || 'Eve Orders <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      text,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '(no body)');
    console.error('[email] Resend rejected:', res.status, err.slice(0, 300));
  } else {
    const ok = await res.json().catch(() => null);
    console.log('[email] Resend accepted, id:', ok?.id);
  }
}

// ─── JSON helper ───────────────────────────────────────────────────

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
