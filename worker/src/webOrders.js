// Web Orders admin page — Stripe Checkout Sessions from Payment Links.
//
// Different flow from the iOS app:
//   - iOS app:        app POSTs /create-payment-intent → Stripe PaymentIntent
//                     → KV order:${id} record → confirmation in app
//   - Payment Links:  customer visits buy.stripe.com/... → Stripe Checkout
//                     Session → payment → Stripe-hosted receipt
//                     (no Worker involvement, no KV record)
//
// To surface payment-link transactions in our admin we read Stripe's
// /v1/checkout/sessions list directly. iOS app orders use PaymentIntents
// (not Checkout Sessions), so this list never overlaps with the Orders
// tab — clean separation.
//
// Tracking codes: Stripe Payment Links can be configured to capture
// URL params (UTM, Google source, etc.) as session metadata or via
// client_reference_id. We surface both so you can correlate orders
// with the marketing source.

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export async function listStripeCheckoutSessions(env, { limit = 50 } = {}) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  const url = new URL(`${STRIPE_API_BASE}/checkout/sessions`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.append('expand[]', 'data.line_items');
  url.searchParams.append('expand[]', 'data.payment_link');

  const res = await fetch(url, {
    headers: {
      Authorization: 'Basic ' + btoa(env.STRIPE_SECRET_KEY + ':'),
    },
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '(no body)');
    throw new Error(`Stripe ${res.status}: ${errBody.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.data || [];
}

export async function handleAdminWebOrdersPage(request, env) {
  const url = new URL(request.url);
  const providedKey =
    url.searchParams.get('key') || readCookie(request, 'eve_admin');
  if (!env.ADMIN_SHARED_SECRET || providedKey !== env.ADMIN_SHARED_SECRET) {
    return signinPage();
  }

  let sessions = [];
  let error = null;
  try {
    sessions = await listStripeCheckoutSessions(env, { limit: 100 });
  } catch (err) {
    error = err.message || String(err);
  }

  const html = renderWebOrdersPage(sessions, providedKey, error);
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': `eve_admin=${providedKey}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`,
    },
  });
}

// ─── helpers (duplicated from admin.js, kept local to avoid coupling) ───

function readCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function signinPage() {
  return new Response(
    `<!doctype html>
<html><head><meta charset="utf-8"><title>Eve Admin · Sign in</title>
<style>
  body { font: 15px/1.5 -apple-system, sans-serif; background: #EDEAE0; color: #2B2B2B; padding: 40px; }
  .card { max-width: 360px; margin: 80px auto; background: #fff; padding: 28px; border-radius: 14px; border: 1px solid #DDD8CC; }
  h1 { font-family: Georgia, serif; font-weight: 400; font-size: 24px; margin: 0 0 8px; color: #3D2E3D; }
  p { color: #7A7574; font-size: 13px; margin: 0 0 16px; }
  input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #DDD8CC; font: 14px/1 -apple-system, sans-serif; box-sizing: border-box; margin-bottom: 12px; }
  button { width: 100%; padding: 12px; border-radius: 999px; border: none; background: #7A4232; color: #FBF9F5; font-weight: 600; font-size: 14px; cursor: pointer; }
</style></head>
<body><div class="card">
  <h1>Eve Admin</h1>
  <p>Enter the admin secret to access the order console.</p>
  <form onsubmit="event.preventDefault();window.location='?key='+encodeURIComponent(document.getElementById('k').value)">
    <input id="k" type="password" autofocus placeholder="ADMIN_SHARED_SECRET">
    <button type="submit">Sign in</button>
  </form>
</div></body></html>`,
    { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

// ─── Renderer ──────────────────────────────────────────────────────

function renderWebOrdersPage(sessions, key, error) {
  const stripeBase = 'https://dashboard.stripe.com';

  const fmtDate = ts =>
    ts
      ? new Date(ts * 1000).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '—';
  const fmtMoney = (cents, currency = 'usd') => {
    if (cents == null) return '—';
    const code = String(currency).toUpperCase();
    return `${code === 'USD' ? '$' : ''}${(cents / 100).toFixed(2)}${code !== 'USD' ? ' ' + code : ''}`;
  };
  const esc = s =>
    String(s ?? '').replace(/[<>&"']/g, c => ({
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));

  const trackingInfo = session => {
    const md = session.metadata || {};
    const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'source', 'campaign', 'gclid'];
    const tracked = utmFields
      .filter(f => md[f])
      .map(f => `<div class="kv"><span class="k">${esc(f)}</span><span class="v">${esc(md[f])}</span></div>`)
      .join('');
    const ref = session.client_reference_id
      ? `<div class="kv"><span class="k">ref</span><span class="v">${esc(session.client_reference_id)}</span></div>`
      : '';
    const linkName =
      session.payment_link && typeof session.payment_link === 'object'
        ? session.payment_link.id
        : session.payment_link || null;
    const linkChip = linkName
      ? `<div class="kv"><span class="k">link</span><span class="v mono">${esc(linkName)}</span></div>`
      : '';
    return tracked + ref + linkChip || '<span class="dim">—</span>';
  };

  const lineItemsText = session => {
    const items = session.line_items?.data || [];
    if (items.length === 0) return '<span class="dim">—</span>';
    return items
      .map(
        li =>
          `<div>${esc(li.description || li.price?.product || 'item')} <span class="dim">× ${li.quantity}</span></div>`,
      )
      .join('');
  };

  const shippingText = session => {
    const s = session.shipping_details || session.collected_information?.shipping_details;
    if (!s) return '<span class="dim">—</span>';
    const name = s.name || '';
    const a = s.address || {};
    const parts = [
      a.line1,
      a.line2,
      [a.city, a.state, a.postal_code].filter(Boolean).join(', '),
    ].filter(Boolean);
    return [name, ...parts].map(p => `<div>${esc(p)}</div>`).join('');
  };

  const statusBadge = session => {
    const paid = session.payment_status;
    const cls = paid === 'paid' ? 'good' : paid === 'unpaid' ? 'warn' : 'dim';
    return `<span class="badge badge-${cls}">${esc(paid || 'unknown')}</span>`;
  };

  const rows = sessions
    .filter(s => s.status === 'complete' || s.payment_status === 'paid')
    .map(s => {
      const customerEmail =
        s.customer_details?.email ||
        s.customer_email ||
        s.collected_information?.shipping_details?.email ||
        '';
      const customerName =
        s.customer_details?.name ||
        s.collected_information?.shipping_details?.name ||
        '';
      const piId =
        typeof s.payment_intent === 'string'
          ? s.payment_intent
          : s.payment_intent?.id;
      const stripeLink = piId
        ? `${stripeBase}/payments/${piId}`
        : `${stripeBase}/payments`;

      return `
<tr>
  <td>
    <div class="mono">${esc(s.id)}</div>
    <div class="dim">${fmtDate(s.created)}</div>
  </td>
  <td>
    <div><strong>${esc(customerName) || '—'}</strong></div>
    <div><a href="mailto:${esc(customerEmail)}">${esc(customerEmail) || '—'}</a></div>
  </td>
  <td>${lineItemsText(s)}</td>
  <td>${shippingText(s)}</td>
  <td>${trackingInfo(s)}</td>
  <td>
    <div><strong>${fmtMoney(s.amount_total, s.currency)}</strong></div>
    <div>${statusBadge(s)}</div>
  </td>
  <td><a href="${stripeLink}" target="_blank">Stripe ↗</a></td>
</tr>`;
    })
    .join('');

  const empty =
    sessions.filter(s => s.status === 'complete' || s.payment_status === 'paid').length === 0
      ? `<tr><td colspan="7" class="empty">No web orders yet. Transactions from your Stripe Payment Links will appear here once paid.</td></tr>`
      : '';

  const errorBanner = error
    ? `<div class="error-banner">⚠ Couldn't load from Stripe: ${esc(error)}</div>`
    : '';

  return `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>Eve Admin · Web Orders</title>
${ADMIN_STYLES}
</head>
<body>
  <div class="header">
    <h1>Eve Admin</h1>
    ${renderTabs(key, 'web-orders')}
  </div>
  <div class="subheader">
    <span class="count">${sessions.length} session${sessions.length === 1 ? '' : 's'} · live from Stripe · <a href="?key=${encodeURIComponent(key)}">refresh</a></span>
  </div>
  ${errorBanner}
  <table>
    <thead>
      <tr>
        <th>Session</th>
        <th>Customer</th>
        <th>Items</th>
        <th>Ship to</th>
        <th>Tracking</th>
        <th>Amount</th>
        <th>Stripe</th>
      </tr>
    </thead>
    <tbody>
      ${rows}${empty}
    </tbody>
  </table>
</body></html>`;
}

// ─── Shared styles + nav (mirrors admin.js — kept here to avoid
// cross-file imports of internals) ─────────────────────────────────

const ADMIN_STYLES = `<style>
  body { font: 14px/1.5 -apple-system, BlinkMacSystemFont, sans-serif; background: #EDEAE0; color: #2B2B2B; margin: 0; padding: 24px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; max-width: 1400px; margin-left: auto; margin-right: auto; gap: 16px; flex-wrap: wrap; }
  .subheader { max-width: 1400px; margin: 0 auto 20px; color: #7A7574; font-size: 13px; }
  h1 { font-family: Georgia, serif; font-weight: 400; font-size: 26px; color: #3D2E3D; margin: 0; }
  .tabs { display: flex; gap: 4px; }
  .tabs a { font: 600 13px/1 -apple-system, sans-serif; color: #7A7574; padding: 8px 14px; border-radius: 999px; text-decoration: none; transition: background .15s; }
  .tabs a:hover { background: rgba(122,66,50,0.06); }
  .tabs a.active { background: #3D2E3D; color: #FBF9F5; }
  table { width: 100%; max-width: 1400px; margin: 0 auto; border-collapse: collapse; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
  th, td { text-align: left; padding: 14px 16px; border-bottom: 1px solid #EDEAE0; vertical-align: top; }
  th { font-size: 11px; font-weight: 700; color: #7A7574; text-transform: uppercase; letter-spacing: 0.6px; background: #FBF8F3; }
  tr:last-child td { border-bottom: none; }
  .mono { font-family: ui-monospace, Menlo, monospace; font-size: 12px; }
  .dim { color: #7A7574; font-size: 12px; margin-top: 2px; }
  .empty { text-align: center; padding: 60px; color: #7A7574; font-style: italic; }
  a { color: #7A4232; text-decoration: none; font-weight: 600; }
  a:hover { text-decoration: underline; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge-good { background: #E8F5E9; color: #2E7D32; }
  .badge-warn { background: #FFF8E1; color: #B8924A; }
  .badge-dim { background: #EDEAE0; color: #7A7574; }
  .kv { display: flex; gap: 6px; align-items: baseline; font-size: 12px; margin-bottom: 2px; }
  .kv .k { color: #7A7574; font-weight: 600; min-width: 64px; }
  .kv .v { color: #2B2B2B; }
  .error-banner { max-width: 1400px; margin: 0 auto 16px; background: #FFF3E0; border: 1px solid #E0901A; color: #A87030; padding: 12px 16px; border-radius: 10px; font-size: 13px; }
</style>`;

function renderTabs(key, active) {
  const k = encodeURIComponent(key);
  const tab = (slug, label) =>
    `<a href="/admin${slug ? '/' + slug : ''}?key=${k}"${active === slug || (active === 'orders' && !slug) ? ' class="active"' : ''}>${label}</a>`;
  return `<nav class="tabs">${tab('', 'Orders')}${tab('telehealth', 'Telehealth')}${tab('web-orders', 'Web Orders')}</nav>`;
}
