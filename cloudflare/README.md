# Cloudflare Worker (free plan)

Preview: https://agrefining.apohenia.workers.dev (Worker `agrefining`, account Obawemimo). No custom domain attached.

- Site files from `dist/` are stored in KV namespace `agrefining-site` (binding `SITE`), keyed by content hash.
- `cloudflare/worker.mjs` serves them with the same rules as `vercel.json` (cleanUrls, no trailing slash,
  redirects, headers), runs `api/leads.js`, `api/receipt.js`, `api/spot.js` unchanged through a req/res adapter,
  supports video Range requests, and 308-redirects `agrefining.com` to `www.agrefining.com` like Vercel did.

Deploy: `npm run build && node cloudflare/build.mjs`, then run `.cf-deploy/kv*.js` one at a time and then
`.cf-deploy/deploy.js` through the Cloudflare MCP `execute` tool (`{"code": "$file:/abs/path/.cf-deploy/kv0.js"}`).
Old KV keys can stay; new content gets new hash keys.

Optional secrets (Worker settings): RESEND_API_KEY, DESK_ACCESS_CODE, AG_LEAD_FROM_EMAIL, AG_LEAD_TO_EMAIL.
