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

The pickup form posts to `/api/leads`. Configure these Vercel environment variables:

- `RESEND_API_KEY` (required for online delivery)
- `AG_LEAD_FROM_EMAIL` (optional, defaults to `AG Refining <website@agrefining.com>`)
- `AG_LEAD_TO_EMAIL` (optional, defaults to `dennis@agrefining.com`)

The `agrefining.com` domain must remain verified in Resend. If online delivery is unavailable, the form gives the visitor a prefilled email fallback instead of dropping the request.

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

The public copy qualifies pickup and payment claims by material, location, account type, and schedule. Do not strengthen claims about insurance, assay method, fees, exact payment timing, compliance, licenses, minimums, or shipping without client approval.
