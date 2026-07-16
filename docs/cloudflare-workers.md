# Cloudflare Workers

The current tools are browser-only and should remain on Pages. Add a Worker
when a feature needs trusted server-side code, secrets, scheduled jobs, shared
APIs, or persistent Cloudflare storage.

This repository includes a small shared API Worker in `workers/api`. It exposes
`GET /api/health` and can later host endpoints used by multiple tools.

## Run locally

From the repository root:

```bash
npm install
npm run dev:api
```

Wrangler prints a local URL. Test it with:

```bash
curl http://localhost:8787/api/health
```

## Deploy

Authenticate once, then deploy:

```bash
npx wrangler login
npm run deploy:api
```

In the Cloudflare dashboard, attach `api.77toolkit.com` as the Worker's custom
domain. Frontend tools can then call endpoints such as:

```js
const response = await fetch("https://api.77toolkit.com/api/health");
const result = await response.json();
```

## Secrets and storage

Never place API keys in frontend code or commit them to Git. Store a production
secret with:

```bash
npx wrangler secret put API_KEY --config workers/api/wrangler.jsonc
```

As features grow, add bindings to `workers/api/wrangler.jsonc`:

- **D1** for relational records and saved tool data;
- **KV** for small configuration and cached lookups;
- **R2** for uploaded or generated files;
- **Queues** for background work;
- **Durable Objects** for coordinated real-time state;
- **Cron Triggers** for scheduled maintenance.

For a single small endpoint tied to only one Pages site, Pages Functions is
also reasonable. Prefer the shared Worker when several tools use the same API
or when you need Workers-only features such as Durable Objects and Cron.

