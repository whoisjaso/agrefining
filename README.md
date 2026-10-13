# AG Refining website

Production-oriented publishing system for AG Refining. It is designed for Vercel and expands through the data-driven material, industry, and service-area registries in `scripts/build.mjs`.

The front end uses the Silver Atelier design system: warm creme surfaces, tailored ink-blue structure, restrained mineral-blue accents, editorial material photography, calibrated assay-line details, and one consistent pickup journey across every route. See `DESIGN.md` for the complete visual and structural contract.

## Local verification

```bash
npm run check
npm run build
npm run verify
```

The generated site is written to `dist`. Verification covers 42 generated HTML files, 41 indexed routes, the shared Silver Atelier shell, representative page families, exact protected SEO fields, local route and asset targets, and the homepage conversion sequence.

## Lead delivery

The pickup form posts to `/api/leads`. Configure these Vercel environment variables:

- `RESEND_API_KEY` (required for online delivery)
- `AG_LEAD_FROM_EMAIL` (optional, defaults to `AG Refining <website@agrefining.com>`)
- `AG_LEAD_TO_EMAIL` (optional, defaults to `dennis@agrefining.com`)

The `agrefining.com` domain must remain verified in Resend. If online delivery is unavailable, the form gives the visitor a prefilled email fallback instead of dropping the request.

Each request emails AG Refining (reply-to the visitor, with a one-tap call button) and sends the visitor a short confirmation in English or Spanish. Visitors can name a preferred pickup day and time; the confirmation says the exact time will be confirmed by phone or email. Check delivery configuration at `/api/leads?status=health`, which returns `{"delivery": true}` once `RESEND_API_KEY` is set.

## Buy Desk

`/desk` is a private, noindex tablet app for buying silver at the counter: live silver pricing from three market feeds (`/api/spot`), offers per material and purity, a client-facing presentation that never shows spot price or rates, a signed sale agreement, and a PDF receipt that can be emailed (`/api/receipt`), shared, or printed. See `docs/buy-desk-guide.md` for the owner guide.

- `DESK_ACCESS_CODE` (optional): enables receipt email and the hallmark reader. Must match the code chosen on the tablet. Without it, the desk shares or prints the PDF instead.
- `ANTHROPIC_API_KEY` (optional): enables "Read the hallmark" (`/api/identify`). The desk photographs an item, and Claude (`claude-sonnet-5-5`, vision) reads the marks and suggests a material, purity, or coin from the desk catalog. The suggestion only pre-selects the item sheet; the owner still weighs, confirms, and adds the item. Without the key (or without `DESK_ACCESS_CODE`) the button is hidden.
- `GOOGLE_REVIEW_URL` (optional): the Google review link used by the review QR code and "Text the link" on the sale-complete screen, and by the one-line review invitation in receipt emails. Defaults to the Google Maps search for AG Refining in `src/desk/review-link.mjs`; set it to the direct "write a review" link from Google Business Profile when available.

Desk source lives in `src/desk/` and is published by `scripts/build-desk.mjs`, which also vendors `qrcode-generator` (MIT, pinned) for the review QR code. Tests: `tests/desk-pricing.test.mjs`, `tests/desk-api.test.mjs`, `tests/desk-identify.test.mjs`, and the browser simulation `npm run test:desk` (screenshots with `node tests/desk-browser.mjs --shots`).

## Houston silver price page

`/silver-price-houston` shows the live silver spot price per troy ounce (from `/api/spot`, refreshed every minute), a 30-day chart of daily closes (`/api/spot?range=30d`, COMEX silver futures, cached for an hour), and a reference table of fine silver content in sterling and U.S. silver coins. By business decision it never shows melt values, offer rates, or other pricing math. Without JavaScript the page shows a call-for-price fallback. Tests: `tests/silver-price-page.test.mjs` and `npm run test:price`.

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
