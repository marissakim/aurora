# eve-ai-worker

Cloudflare Worker that proxies Eve's dashboard requests to the Claude API.

## One-time setup

```bash
cd worker
npm install

# Authenticate with Cloudflare (opens browser)
npx wrangler login

# Create a KV namespace for rate-limiting + response caching
npx wrangler kv namespace create aurora-cache
# → copy the `id` from the output and paste it into wrangler.toml

# Set your Anthropic API key as a secret (paste when prompted)
npx wrangler secret put ANTHROPIC_API_KEY

# Deploy
npx wrangler deploy
# → note the `https://eve-ai.<subdomain>.workers.dev` URL it prints
```

## Local development

```bash
# Copy the example and add your key for local testing
cp .dev.vars.example .dev.vars
# edit .dev.vars and paste your Anthropic key

npm run dev
# Worker runs at http://localhost:8787
```

Test with:
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"profile":{"age":"Under 30","goal":"Conceive","cycles":"Regular (24–35 days)","conditions":"None that I know of","testing":"Not yet"},"biomarkers":[]}'
```

## Updating the frontend to use this Worker

In the Eve frontend repo:
1. Set `VITE_WORKER_URL` (in GitHub Actions env or local `.env.local`)
2. The Worker URL goes in this env var
3. `src/utils/aiInsights.js` reads it and falls back to the mock if the call fails

## Tail logs

```bash
npm run tail
```
