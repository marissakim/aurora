// Admin console — orders + telehealth requests.
//
// Two pages, both served from this file, both gated by the same
// ADMIN_SHARED_SECRET that mutates work via /admin/order/:id/status
// and /admin/telehealth/:id/status. After first sign-in the secret
// lives in an httpOnly cookie so navigation between /admin and
// /admin/telehealth doesn't require re-entering it.
//
// All UI is HTML + a sprinkle of vanilla JS — no build step, no deps.

import { listAllTelehealthRequests } from './telehealth.js';

const ALL_STATUSES = [
  'pending',
  'paid',
  'placed_with_mylabkit',
  'shipped',
  'sample_received',
  'results_ready',
  'failed',
  'refunded',
];

const TELEHEALTH_STATUSES = [
  'pending',
  'scheduled',
  'completed',
  'cancelled',
  'no-show',
];

export async function handleAdminPage(request, env) {
  const url = new URL(request.url);
  const providedKey = url.searchParams.get('key') || readCookie(request, 'eve_admin');
  if (!env.ADMIN_SHARED_SECRET || providedKey !== env.ADMIN_SHARED_SECRET) {
    return signinPage();
  }

  const orders = await listAllOrders(env.CACHE);
  const html = renderAdminPage(orders, providedKey);
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': `eve_admin=${providedKey}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`,
    },
  });
}

export async function handleAdminTelehealthPage(request, env) {
  const url = new URL(request.url);
  const providedKey = url.searchParams.get('key') || readCookie(request, 'eve_admin');
  if (!env.ADMIN_SHARED_SECRET || providedKey !== env.ADMIN_SHARED_SECRET) {
    return signinPage();
  }

  const requests = await listAllTelehealthRequests(env.CACHE);
  const html = renderTelehealthPage(requests, providedKey);
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': `eve_admin=${providedKey}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`,
    },
  });
}

async function listAllOrders(kv) {
  // Cloudflare KV: list keys with the order: prefix, then bulk-get each.
  // Fine for hundreds of orders; refactor to D1/Postgres at thousands.
  const list = await kv.list({ prefix: 'order:' });
  const orders = await Promise.all(
    list.keys.map(async k => {
      try {
        const raw = await kv.get(k.name);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }),
  );
  return orders
    .filter(Boolean)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function readCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Shared styles + tab nav reused between orders and telehealth pages.

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
  select.status { padding: 6px 10px; border-radius: 6px; border: 1px solid #DDD8CC; background: #fff; font-size: 13px; cursor: pointer; }
  .history-toggle { cursor: pointer; user-select: none; margin-top: 6px; font-size: 11px; }
  .history { display: none; margin-top: 6px; }
  .history.open { display: block; }
  .slot { background: #FBF6F2; padding: 4px 8px; border-radius: 6px; margin-bottom: 4px; font-size: 13px; color: #2B2B2B; }
  .toast { position: fixed; bottom: 24px; right: 24px; background: #2E7D32; color: #fff; padding: 12px 18px; border-radius: 10px; font-size: 13px; opacity: 0; transition: opacity .2s; }
  .toast.show { opacity: 1; }
  .toast.err { background: #C62828; }
</style>`;

function renderTabs(key, active) {
  const k = encodeURIComponent(key);
  const tab = (slug, label) =>
    `<a href="/admin${slug ? '/' + slug : ''}?key=${k}"${active === slug || (active === 'orders' && !slug) ? ' class="active"' : ''}>${label}</a>`;
  return `<nav class="tabs">${tab('', 'Orders')}${tab('telehealth', 'Telehealth')}</nav>`;
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

function renderAdminPage(orders, key) {
  const stripeBase = 'https://dashboard.stripe.com/test/payments';
  const fmtDate = ts =>
    ts
      ? new Date(ts).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '—';
  const fmtMoney = c => `$${(c / 100).toFixed(2)}`;
  const esc = s =>
    String(s ?? '').replace(/[<>&"']/g, c => ({
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));

  const rows = orders
    .map(o => {
      const ship = o.shipping?.address || {};
      const addrParts = [
        ship.line1,
        ship.line2,
        [ship.city, ship.state, ship.zip].filter(Boolean).join(', '),
      ].filter(Boolean);
      const addrHtml = addrParts.map(p => `<div>${esc(p)}</div>`).join('') || '—';
      const stripeUrl = o.stripePaymentIntentId
        ? `${stripeBase}/${o.stripePaymentIntentId}`
        : null;
      const statusOptions = ALL_STATUSES.map(
        s =>
          `<option value="${s}"${s === o.status ? ' selected' : ''}>${s}</option>`,
      ).join('');
      const shippingMethod = o.shipping?.label || o.shipping?.id || '—';
      const eta = o.shipping?.estimatedDeliveryAt
        ? fmtDate(o.shipping.estimatedDeliveryAt)
        : '—';

      return `
<tr>
  <td>
    <div class="mono">${esc(o.id)}</div>
    <div class="dim">${fmtDate(o.createdAt)}</div>
  </td>
  <td>
    <div><strong>${esc(o.kit?.name || o.kit?.id)}</strong> · ${fmtMoney(
      (o.kit?.price || 0) * 100,
    )}</div>
    <div class="dim">${esc(shippingMethod)} · ${fmtMoney(
      o.shipping?.costCents || 0,
    )}</div>
    <div class="dim">Total: ${fmtMoney(o.amountCents || 0)}</div>
    <div class="dim">Est. delivery: ${eta}</div>
  </td>
  <td>
    <div><strong>${esc(o.customer?.name) || '—'}</strong></div>
    <div>${esc(o.customer?.email) || '—'}</div>
    <div class="dim">${esc(o.customer?.phone) || '—'}</div>
  </td>
  <td>${addrHtml}</td>
  <td>
    <select class="status" data-id="${esc(o.id)}">
      ${statusOptions}
    </select>
    <div class="dim history-toggle" onclick="this.nextElementSibling.classList.toggle('open')">history ▾</div>
    <div class="history">
      ${(o.statusHistory || [])
        .map(
          h =>
            `<div class="dim">${esc(h.status)} · ${fmtDate(h.at)}${
              h.note ? ' · ' + esc(h.note) : ''
            }</div>`,
        )
        .join('')}
    </div>
  </td>
  <td>
    ${stripeUrl ? `<a href="${stripeUrl}" target="_blank">Stripe ↗</a>` : '—'}
  </td>
</tr>`;
    })
    .join('');

  const empty =
    orders.length === 0
      ? `<tr><td colspan="6" class="empty">No orders yet. Place a test order on your phone — it'll show up here.</td></tr>`
      : '';

  return `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>Eve Admin · Orders</title>
${ADMIN_STYLES}
</head>
<body>
  <div class="header">
    <h1>Eve Admin</h1>
    ${renderTabs(key, 'orders')}
  </div>
  <div class="subheader">
    <span class="count">${orders.length} order${orders.length === 1 ? '' : 's'} · <a href="?key=${encodeURIComponent(key)}">refresh</a></span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Order</th>
        <th>Kit + shipping</th>
        <th>Customer</th>
        <th>Ship to</th>
        <th>Status</th>
        <th>Stripe</th>
      </tr>
    </thead>
    <tbody>
      ${rows}${empty}
    </tbody>
  </table>
  <div id="toast" class="toast"></div>
  <script>
    const key = ${JSON.stringify(key)};
    const toast = document.getElementById('toast');
    function showToast(msg, err) {
      toast.textContent = msg;
      toast.className = 'toast show' + (err ? ' err' : '');
      setTimeout(() => { toast.className = 'toast' + (err ? ' err' : ''); }, 2400);
    }
    document.querySelectorAll('select.status').forEach(sel => {
      const original = sel.value;
      sel.addEventListener('change', async () => {
        const id = sel.dataset.id;
        const status = sel.value;
        try {
          const res = await fetch('/admin/order/' + encodeURIComponent(id) + '/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': key },
            body: JSON.stringify({ status }),
          });
          if (!res.ok) throw new Error(await res.text());
          showToast('Updated to ' + status);
        } catch (err) {
          sel.value = original;
          showToast('Failed: ' + err.message, true);
        }
      });
    });
  </script>
</body></html>`;
}

function renderTelehealthPage(requests, key) {
  const fmtDate = ts =>
    ts
      ? new Date(ts).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "—";
  const esc = s =>
    String(s ?? "").replace(/[<>&"']/g, c => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "\"": "&quot;",
      "'": "&#39;",
    }[c]));

  const rows = requests
    .map(r => {
      // slotsDisplay is the PT-formatted version from the app; falls
      // back to raw slots if older record.
      const slotsToShow = (r.slotsDisplay && r.slotsDisplay.length)
        ? r.slotsDisplay
        : (r.slots || []);
      const slotsHtml = slotsToShow
        .map(s => `<div class="slot">${esc(s)}</div>`)
        .join("");
      const statusOptions = TELEHEALTH_STATUSES.map(
        s =>
          `<option value="${s}"${s === r.status ? " selected" : ""}>${s}</option>`,
      ).join("");
      return `
<tr>
  <td>
    <div class="mono">${esc(r.id)}</div>
    <div class="dim">${fmtDate(r.createdAt)}</div>
  </td>
  <td>
    <div><strong>${esc(r.name) || "—"}</strong></div>
    <div><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></div>
    ${r.userId ? `<div class="dim mono">${esc(r.userId)}</div>` : ""}
  </td>
  <td>${slotsHtml || "—"}</td>
  <td>
    ${r.notes ? esc(r.notes) : "<span class=\"dim\">—</span>"}
  </td>
  <td>
    <select class="status" data-id="${esc(r.id)}">
      ${statusOptions}
    </select>
    <div class="dim history-toggle" onclick="this.nextElementSibling.classList.toggle('open')">history ▾</div>
    <div class="history">
      ${(r.statusHistory || [])
        .map(
          h =>
            `<div class="dim">${esc(h.status)} · ${fmtDate(h.at)}${
              h.note ? " · " + esc(h.note) : ""
            }</div>`,
        )
        .join("")}
    </div>
  </td>
</tr>`;
    })
    .join("");

  const empty =
    requests.length === 0
      ? `<tr><td colspan="5" class="empty">No telehealth requests yet. They will appear here as users submit Eve Care requests.</td></tr>`
      : "";

  // Header column "From" now shows name + email; column count unchanged.

  return `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>Eve Admin · Telehealth</title>
${ADMIN_STYLES}
</head>
<body>
  <div class="header">
    <h1>Eve Admin</h1>
    ${renderTabs(key, "telehealth")}
  </div>
  <div class="subheader">
    <span class="count">${requests.length} request${requests.length === 1 ? "" : "s"} · <a href="?key=${encodeURIComponent(key)}">refresh</a></span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Request</th>
        <th>From</th>
        <th>Preferred times</th>
        <th>Notes</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows}${empty}
    </tbody>
  </table>
  <div id="toast" class="toast"></div>
  <script>
    const key = ${JSON.stringify(key)};
    const toast = document.getElementById("toast");
    function showToast(msg, err) {
      toast.textContent = msg;
      toast.className = "toast show" + (err ? " err" : "");
      setTimeout(() => { toast.className = "toast" + (err ? " err" : ""); }, 2400);
    }
    document.querySelectorAll("select.status").forEach(sel => {
      const original = sel.value;
      sel.addEventListener("change", async () => {
        const id = sel.dataset.id;
        const status = sel.value;
        try {
          const res = await fetch("/admin/telehealth/" + encodeURIComponent(id) + "/status", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Admin-Secret": key },
            body: JSON.stringify({ status }),
          });
          if (!res.ok) throw new Error(await res.text());
          showToast("Updated to " + status);
        } catch (err) {
          sel.value = original;
          showToast("Failed: " + err.message, true);
        }
      });
    });
  </script>
</body></html>`;
}
