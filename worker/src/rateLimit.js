// KV-backed per-IP daily rate limit. Prevents runaway cost if the URL
// leaks or gets scraped. Keys expire at midnight UTC so the window
// rolls cleanly.

const DAILY_LIMIT = 50;

function todayKey(ip) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `rl:${ip}:${yyyy}-${mm}-${dd}`;
}

function secondsUntilMidnightUTC() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0,
  ));
  return Math.max(60, Math.ceil((tomorrow - now) / 1000));
}

/**
 * Increments the counter for this IP and returns { allowed, remaining, limit }.
 * Fails open (allows the request) if KV is unavailable, to avoid taking the
 * app down over a rate-limit infrastructure issue.
 */
export async function checkAndIncrementRateLimit(kv, ip) {
  if (!ip) return { allowed: true, remaining: DAILY_LIMIT, limit: DAILY_LIMIT };
  try {
    const key = todayKey(ip);
    const current = parseInt((await kv.get(key)) || '0', 10);
    if (current >= DAILY_LIMIT) {
      return { allowed: false, remaining: 0, limit: DAILY_LIMIT };
    }
    await kv.put(key, String(current + 1), {
      expirationTtl: secondsUntilMidnightUTC(),
    });
    return {
      allowed: true,
      remaining: DAILY_LIMIT - (current + 1),
      limit: DAILY_LIMIT,
    };
  } catch {
    return { allowed: true, remaining: DAILY_LIMIT, limit: DAILY_LIMIT };
  }
}
