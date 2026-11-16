# AG Refining website

Production-oriented publishing system for AG Refining. It is designed for Vercel and expands through the data-driven material, industry, and service-area registries in `scripts/build.mjs`.

The front end uses the Silver Atelier design system: warm creme surfaces, tailored ink-blue structure, restrained mineral-blue accents, editorial material photography, calibrated assay-line details, and one consistent pickup journey across every route. See `DESIGN.md` for the complete visual and structural contract.

## Local verification

```bash
npm run check
npm run build
npm run verify
```

The generated site is written to `dist`. Verification covers 41 generated HTML files, 40 indexed routes, the shared Silver Atelier shell, representative page families, exact protected SEO fields, local route and asset targets, and the homepage conversion sequence.

## Lead delivery

The form posts to `/api/leads`, which emails each lead through Resend. Set these in Vercel project settings only (never in the repo):

- `RESEND_API_KEY` (required; without it no lead email goes out)
- `LEAD_TO`: comma-separated primary recipients (Dorothy once her address is confirmed). Falls back to `AG_LEAD_TO_EMAIL`, then `dennis@agrefining.com`.
- `LEAD_CC`: comma-separated CC list. Default `dennis@agrefining.com`; an address already in `LEAD_TO` is never repeated. Set it to an empty value to send no CC.
- `LEAD_FROM`: verified sender, default `AG Refining Website <leads@agrefining.com>`. Falls back to `AG_LEAD_FROM_EMAIL`.
- `LEAD_REPLY_TO_SUBMITTER`: `false` stops Reply-To being set to the visitor (default on).
- `LEAD_ROUTES` (optional JSON): `{"business": [...], "individual": [...], "es": [...]}`. Every route defaults to `LEAD_TO`.

`/api/leads?status=health` returns `{"delivery": true, "recipients": N}` once `RESEND_API_KEY` is set (it never shows the addresses). Only name, phone and material are required; email, area and notes are optional. If the email cannot be sent, the visitor sees "Please call (281) 898-2719" with a call button (never a send-it-yourself mail link), and the full lead is written to the Vercel function log under `LEAD_UNDELIVERED`. Setup steps for the key and the sending domain: `docs/lead-delivery-setup.md`.

## Buy Desk

`/desk` is a private, noindex tablet app for buying silver at the counter: live silver pricing from three market feeds (`/api/spot`), offers per material and purity, a client-facing presentation that never shows spot price or rates, a signed sale agreement, and a PDF receipt that can be emailed (`/api/receipt`), shared, or printed. See `docs/buy-desk-guide.md` for the owner guide.

- `DESK_ACCESS_CODE` (optional): enables receipt email. Must match the code chosen on the tablet. Without it, the desk shares or prints the PDF instead.

Desk source lives in `src/desk/` and is published by `scripts/build-desk.mjs`. Tests: `tests/desk-pricing.test.mjs`, `tests/desk-api.test.mjs`, and the browser simulation `npm run test:desk` (screenshots with `node tests/desk-browser.mjs --shots`).

## Search and AI visibility

The build publishes `sitemap.xml` (with hreflang and image entries), an HTML site index at `/sitemap`, an FAQ hub at `/faq`, `robots.txt` that welcomes search and AI answer-engine crawlers, `llms.txt` and `llms-full.txt` for language models, and an IndexNow key file. Every page carries LocalBusiness, WebSite, WebPage, BreadcrumbList, and (where relevant) Service, FAQPage, and Person structured data.

All canonical URLs use `https://www.agrefining.com` because Vercel redirects the apex domain to www. Optional Vercel environment variables `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` print the matching verification meta tags.

After a content deploy, push the URL list to Bing and partners:

```bash
npm run build && npm run submit:indexnow
```

See `docs/seo/search-and-ai-visibility-playbook.md` for Search Console, Bing, Google Business Profile, citation, and Reddit steps.

## Content system

The build currently publishes the homepage plus dedicated material, industry, and Houston Metro service-area pages. Add future weekly SEO pages to the matching registry in `scripts/build.mjs`. Every new page should answer a distinct customer question, use plain language, and link to the pickup funnel.

Public copy (v2, Nov 2026): everyone is welcome, people and businesses alike. The promise is "We come to you. Quote on the spot." Silver first, gold too. Never write qualify, qualifying or eligible, free pickup, fast or same-day payment, or published hours; payment timing is only "agreed when you accept the quote." Do not add claims about insurance, assay method, fees, payment timing, compliance, licenses, minimums, or shipping without client approval. Headings, buttons and FAQ questions are Title Case with every word capitalized and no trailing period (the build applies it).
