// Eve Kit shipping options + disclaimers.
//
// Single source of truth for:
//   - The three shipping methods offered at checkout
//   - The legal / operational disclaimers that display on both the
//     kit page (before purchase) and the checkout page (Day 18)
//
// Cost stored as both cents (for Stripe) and a display label.
export const shippingOptions = [
  {
    id: 'usps-first-class',
    carrier: 'USPS',
    service: 'First Class',
    eta: '5 days',
    etaBusinessDays: 5,
    costCents: 0,
    costLabel: 'Free',
    default: true,
  },
  {
    id: 'ups-3day',
    carrier: 'UPS',
    service: '3-Day',
    eta: 'usually within 3 business days',
    etaBusinessDays: 3,
    costCents: 1650,
    costLabel: '$16.50',
  },
  {
    id: 'ups-next-day',
    carrier: 'UPS',
    service: 'Next Day',
    eta: 'overnight next business day',
    etaBusinessDays: 1,
    costCents: 4500,
    costLabel: '$45',
  },
];

// Disclaimers shown on both the kit page and the checkout page.
// Order matters — this is the display order.
export const shippingDisclaimers = [
  'Please allow 1–2 extra days for processing during holidays.',
  'Orders placed on Friday after 11:00 AM PT and on Saturday will be shipped on Monday morning and delivered on Tuesday.',
];

// Compact summary used on the kit chooser (pre-purchase). Gives
// users the upfront "3–5 days depending on shipping" expectation
// without dumping the full pricing table until checkout.
export const shippingSummary = 'Arrives in 3–5 days depending on shipping option chosen at checkout.';

// Business-day delivery-date estimator. Day 18 checkout uses this to
// render "Estimated delivery date is by Apr 29, 2026." under the
// selected shipping method. Returns a Date.
//
// Rules encoded:
//   - Orders placed Friday after 11 AM PT, Saturday, or Sunday ship Monday.
//   - Otherwise ship next business day.
//   - etaBusinessDays is counted forward from the ship date, skipping
//     weekends. (Holidays are handled via the +1-2 day disclaimer — we
//     don't maintain a US-holiday calendar for v0.1.)
export function estimateDelivery(now, etaBusinessDays) {
  const d = new Date(now);
  // Ship date: push to next business day if late Friday, Saturday, or Sunday.
  const day = d.getDay(); // 0=Sun..6=Sat
  const hourPT = new Date(d.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })).getHours();
  const shipDate = new Date(d);
  if (day === 0) shipDate.setDate(shipDate.getDate() + 1); // Sun → Mon
  else if (day === 6) shipDate.setDate(shipDate.getDate() + 2); // Sat → Mon
  else if (day === 5 && hourPT >= 11) shipDate.setDate(shipDate.getDate() + 3); // Fri post-11 → Mon
  else shipDate.setDate(shipDate.getDate() + 1); // next business day

  // Add ETA business days.
  let remaining = etaBusinessDays;
  while (remaining > 0) {
    shipDate.setDate(shipDate.getDate() + 1);
    const d2 = shipDate.getDay();
    if (d2 !== 0 && d2 !== 6) remaining -= 1;
  }
  return shipDate;
}
