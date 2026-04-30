// Eve Care telehealth request handlers.
//
// /telehealth/request — app POSTs new request, gets stored in KV under
// telehealth:${requestId}, Marissa receives an email so she can
// scheduling-invite the user manually.
//
// v0.2 swaps the manual flow for mylabbox.com's scheduling API.
//
// /admin/telehealth/:id/status — status flips (scheduled / completed /
// cancelled / no-show), gated by ADMIN_SHARED_SECRET.

const REQUEST_STATUSES = [
  'pending',     // app submitted, waiting for Marissa to schedule
  'scheduled',   // calendar invite sent
  'completed',   // consult happened
  'cancelled',   // user or Marissa cancelled
  'no-show',     // user didn't attend
];

// ─── /telehealth/request ───────────────────────────────────────────

export async function handleTelehealthRequest(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, corsHeaders);
  }

  const { name, email, slots, slotsDisplay, notes } = body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return json({ error: 'Name required' }, 400, corsHeaders);
  }
  if (!email || typeof email !== 'string') {
    return json({ error: 'Email required' }, 400, corsHeaders);
  }
  if (!Array.isArray(slots) || slots.filter(s => typeof s === 'string' && s.trim()).length < 3) {
    return json({ error: 'Three preferred times required' }, 400, corsHeaders);
  }

  // Tie request to user if signed in (most cases). Anonymous requests OK.
  const userId = await userIdFromAuthHeader(request, env);

  const requestId = `tlh_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const record = {
    id: requestId,
    createdAt: Date.now(),
    status: 'pending',
    userId: userId || null,
    name: name.trim(),
    email: email.trim(),
    // ISO-string UTC timestamps; admin formats them in PT for display.
    slots: slots.map(s => String(s).trim()).filter(Boolean),
    // Pre-formatted PT strings from the app (e.g., "Mon Apr 28, 2:00 PM PT").
    // Saves us from re-formatting in the admin / email.
    slotsDisplay: Array.isArray(slotsDisplay)
      ? slotsDisplay.map(s => String(s).trim()).filter(Boolean)
      : [],
    notes: notes ? String(notes).trim().slice(0, 1000) : null,
    statusHistory: [{ status: 'pending', at: Date.now() }],
  };
  await env.CACHE.put(`telehealth:${requestId}`, JSON.stringify(record));

  // Email Marissa with the request.
  try {
    await emailMarissaTelehealthRequest(env, record);
  } catch (err) {
    console.error('[telehealth] email failed:', err?.message || err);
    // Still return success to the user — request is in KV either way.
  }

  return json({ ok: true, requestId }, 200, corsHeaders);
}

// ─── /admin/telehealth/:id/status ──────────────────────────────────

export async function handleAdminUpdateTelehealthStatus(request, env, corsHeaders, requestId) {
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
  if (!REQUEST_STATUSES.includes(status)) {
    return json(
      { error: 'Invalid status', allowed: REQUEST_STATUSES },
      400,
      corsHeaders,
    );
  }

  const key = `telehealth:${requestId}`;
  const raw = await env.CACHE.get(key);
  if (!raw) return json({ error: 'Request not found' }, 404, corsHeaders);

  const record = JSON.parse(raw);
  record.status = status;
  record.statusHistory.push({ status, at: Date.now(), note: note || null });
  await env.CACHE.put(key, JSON.stringify(record));

  return json({ id: requestId, status }, 200, corsHeaders);
}

// ─── List all (admin-side helper) ──────────────────────────────────

export async function listAllTelehealthRequests(kv) {
  const list = await kv.list({ prefix: 'telehealth:' });
  const requests = await Promise.all(
    list.keys.map(async k => {
      try {
        const raw = await kv.get(k.name);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }),
  );
  return requests
    .filter(Boolean)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

// ─── Auth helper (duplicated from orders.js, small enough to keep local) ──

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

// ─── Email Marissa via Resend ──────────────────────────────────────

async function emailMarissaTelehealthRequest(env, record) {
  const to = env.ADMIN_NOTIFY_EMAIL;
  if (!to || !env.RESEND_API_KEY) return;

  // Prefer pre-formatted PT display strings; fall back to raw ISO if missing.
  const slotsForEmail = record.slotsDisplay?.length
    ? record.slotsDisplay
    : record.slots;
  const slotsText = slotsForEmail
    .map((s, i) => `  ${i + 1}. ${s}`)
    .join('\n');
  const subject = `New Eve Care request: ${record.name}`;
  const text = `New telehealth consult request:

Request ID: ${record.id}
Name: ${record.name}
Email: ${record.email}
User ID: ${record.userId || '(anonymous)'}

Preferred times:
${slotsText}

Notes: ${record.notes || '(none)'}

Manage: https://eve-ai.eve-prototype.workers.dev/admin/telehealth

Mark as scheduled after sending the calendar invite:
  curl -X POST https://eve-ai.eve-prototype.workers.dev/admin/telehealth/${record.id}/status \\
    -H "Content-Type: application/json" \\
    -H "X-Admin-Secret: <ADMIN_SHARED_SECRET>" \\
    -d '{"status":"scheduled"}'
`;

  const fromAddress = env.FROM_EMAIL || 'Eve Care <onboarding@resend.dev>';

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
    console.error('[telehealth] Resend rejected:', res.status, err.slice(0, 300));
  }
}

// ─── JSON helper ───────────────────────────────────────────────────

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
