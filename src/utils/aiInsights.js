// Eve's AI layer. When VITE_WORKER_URL is configured, calls our
// Cloudflare Worker (which proxies to Claude Sonnet 4.5). On any failure
// — missing URL, network error, rate limit, upstream timeout — silently
// falls back to the deterministic mock so the UI is never broken.
//
// The mock lives in aiInsightsMock.js and returns the same shape as
// the Claude response, so downstream components don't care which source
// produced the data.

import { generateAnalysisMock } from './aiInsightsMock';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
// Timeout has to be longer than the Worker's own Claude timeout + network
// buffer. Worker is 45s; we give 50s to catch slower paths.
const TIMEOUT_MS = 50_000;

export async function generateAnalysis(profile, biomarkers) {
  if (!WORKER_URL) {
    // No worker configured — straight to mock. This keeps local dev working
    // and also serves as a graceful degradation if the env var is ever lost.
    return withSource(await generateAnalysisMock(profile, biomarkers), 'mock');
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, biomarkers }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`Eve worker returned ${res.status} — falling back to mock`);
      return withSource(await generateAnalysisMock(profile, biomarkers), 'mock');
    }

    const data = await res.json();
    // Worker already tags _source: 'claude' on success
    return data;
  } catch (err) {
    console.warn('Eve worker call failed:', err?.message || err, '— falling back to mock');
    return withSource(await generateAnalysisMock(profile, biomarkers), 'mock');
  }
}

function withSource(data, source) {
  return { ...data, _source: source };
}
