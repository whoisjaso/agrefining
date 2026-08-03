# AG Refining website

Production-oriented publishing system for AG Refining. It is designed for Vercel and expands through the data-driven material, industry, and service-area registries in `scripts/build.mjs`.

The front end uses the Silver Atelier design system: warm mineral surfaces, restrained silver and champagne accents, editorial material photography, calibrated assay-line details, and one consistent pickup journey across every route. See `DESIGN.md` for the complete visual and structural contract.

## Local verification

```bash
npm run check
npm run build
npm run verify
```

The generated site is written to `dist`. Verification covers 39 generated HTML files, 38 indexed routes, the shared Silver Atelier shell, representative page families, exact protected SEO fields, local route and asset targets, and the homepage conversion sequence.

## Lead delivery

The pickup form posts to `/api/leads`. Configure these Vercel environment variables:

- `RESEND_API_KEY` (required for online delivery)
- `AG_LEAD_FROM_EMAIL` (optional, defaults to `AG Refining <website@agrefining.com>`)
- `AG_LEAD_TO_EMAIL` (optional, defaults to `dennis@agrefining.com`)

The `agrefining.com` domain must remain verified in Resend. If online delivery is unavailable, the form gives the visitor a prefilled email fallback instead of dropping the request.

## Content system

The build currently publishes the homepage plus dedicated material, industry, and Houston Metro service-area pages. Add future weekly SEO pages to the matching registry in `scripts/build.mjs`. Every new page should answer a distinct customer question, use plain language, and link to the pickup funnel.

The public copy qualifies pickup and payment claims by material, location, account type, and schedule. Do not strengthen claims about insurance, assay method, fees, exact payment timing, compliance, licenses, minimums, or shipping without client approval.
