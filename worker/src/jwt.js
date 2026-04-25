// Apple identity-token verification.
//
// What this does:
//   1. Fetches Apple's public JWKs from https://appleid.apple.com/auth/keys
//      (cached in KV for 24h since the keys rotate maybe once per quarter)
//   2. Decodes the JWT (header.payload.signature)
//   3. Picks the matching JWK by `kid` and converts to a CryptoKey
//   4. Verifies the RS256 signature
//   5. Validates iss / aud / exp claims
//   6. Returns the verified payload (sub = stable Apple user ID, email)
//
// Cloudflare Workers have crypto.subtle natively. No external deps.
const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER = 'https://appleid.apple.com';
const KEYS_CACHE_KEY = 'apple:jwks';
const KEYS_CACHE_TTL_S = 24 * 60 * 60;

export async function verifyAppleIdentityToken(idToken, expectedAudience, kvCache) {
  // 1. Decode header + payload (no verification yet — just to get kid + alg).
  const [headerB64, payloadB64, sigB64] = idToken.split('.');
  if (!headerB64 || !payloadB64 || !sigB64) {
    throw new Error('Malformed JWT (expected three segments)');
  }
  const header = JSON.parse(b64UrlDecodeText(headerB64));
  const payload = JSON.parse(b64UrlDecodeText(payloadB64));

  if (header.alg !== 'RS256') {
    throw new Error(`Unexpected JWT alg: ${header.alg}`);
  }
  if (!header.kid) {
    throw new Error('JWT missing kid');
  }

  // 2. Get Apple's JWKs (cached) and pick the matching one by kid.
  const jwks = await getAppleJwks(kvCache);
  const jwk = jwks.keys.find(k => k.kid === header.kid);
  if (!jwk) {
    throw new Error(`No matching Apple JWK for kid ${header.kid}`);
  }

  // 3. Import the JWK as a CryptoKey for verification.
  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  // 4. Verify the signature over `header.payload`.
  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = b64UrlDecodeBytes(sigB64);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    signature,
    signedData,
  );
  if (!valid) {
    throw new Error('JWT signature failed verification');
  }

  // 5. Validate claims.
  if (payload.iss !== APPLE_ISSUER) {
    throw new Error(`Unexpected issuer: ${payload.iss}`);
  }
  if (payload.aud !== expectedAudience) {
    throw new Error(`Unexpected audience: ${payload.aud} (expected ${expectedAudience})`);
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < nowSec) {
    throw new Error('JWT expired');
  }

  return payload;
}

async function getAppleJwks(kvCache) {
  if (kvCache) {
    try {
      const cached = await kvCache.get(KEYS_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // KV miss or corrupt — fall through to fetch.
    }
  }
  const res = await fetch(APPLE_KEYS_URL);
  if (!res.ok) throw new Error(`Failed to fetch Apple JWKs: ${res.status}`);
  const jwks = await res.json();
  if (kvCache) {
    // Fire-and-forget cache write
    kvCache
      .put(KEYS_CACHE_KEY, JSON.stringify(jwks), { expirationTtl: KEYS_CACHE_TTL_S })
      .catch(() => {});
  }
  return jwks;
}

// ─── Base64-URL helpers ────────────────────────────────────────────
function b64UrlDecodeText(s) {
  return new TextDecoder().decode(b64UrlDecodeBytes(s));
}

function b64UrlDecodeBytes(s) {
  // base64url → base64
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  // pad to multiple of 4
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
