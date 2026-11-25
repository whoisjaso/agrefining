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

## Parity check (local, no deploy, no DNS)

`npm run build && npm run test:cloudflare` runs `cloudflare/worker.mjs` in Node against `dist/` and checks it
against `vercel.json`: all 34 redirects (308/307 and destinations), every sitemap page (200 + security headers),
apex to www 308, trailing slash and `.html` cleanUrls, the 404 page, the sitemap and `/desk` headers, video
Range (206), `/api/leads?status=health`, and whether `/review` was built. Last run Nov 25, 2026: all green.

## Cutover checklist (needs Jason's OK; Dennis does the nameserver step)

1. Worker secrets (Cloudflare dashboard, Worker `agrefining`, Settings, Variables): `RESEND_API_KEY`,
   `AG_LEAD_FROM_EMAIL`, `AG_LEAD_TO_EMAIL`, `AG_LEAD_BCC_EMAIL`, `DESK_ACCESS_CODE`. Copy the values from Vercel;
   never paste them into the repo or chat.
2. Build-time env for `npm run build` before `node cloudflare/build.mjs`: `GOOGLE_REVIEW_URL` (without it
   `/review` is a 404, and the printed counter card points there), `AG_SAME_AS`, `GOOGLE_SITE_VERIFICATION`,
   `BING_SITE_VERIFICATION` if set on Vercel.
3. Upload: `node cloudflare/build.mjs`, run `.cf-deploy/kv*.js` then `.cf-deploy/deploy.js` with the Cloudflare
   MCP `execute` tool. Check https://agrefining.apohenia.workers.dev (pages, `/review`, a test lead marked TEST).
4. DNS in the Cloudflare zone (copy every Bluehost record first, including MX and any TXT for email), then
   add Worker routes or custom domains for `agrefining.com` and `www.agrefining.com`.
5. Dennis switches nameservers at Bluehost to `marvin.ns.cloudflare.com` and `nelly.ns.cloudflare.com`.
6. After DNS moves: verify `agrefining.com` in Resend and switch `AG_LEAD_FROM_EMAIL` to an `@agrefining.com`
   address; resubmit sitemaps; keep the Vercel project until Cloudflare has served cleanly for a week.

Not handled: `app.agrefining.com` (attached on Vercel since Oct 11, 2026, no DNS record at Bluehost; `/app`
already redirects to `/desk`). Content changes still need `node cloudflare/build.mjs` and a KV upload, since
the Worker does not auto-deploy from GitHub the way Vercel does.
