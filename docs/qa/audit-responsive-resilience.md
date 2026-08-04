# AG Refining responsive, resilience, and production-parity audit

- Audit date: 2026-08-04
- Scope: existing local production output (`dist/`: 38 sitemap routes plus `404.html`), `src/style.css`, `src/site.js`, `scripts/build.mjs`, `scripts/check.mjs`, `scripts/verify.mjs`, `api/leads.js`, `vercel.json`, copied assets, and the public preview at `https://agrefining.vercel.app/`.
- This was a read-only audit. No lead was sent, no production data was changed, and no build, deploy, or generated output was modified.

## Result and release recommendation

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 0 |

**Recommendation: do not release until TECH-001 and TECH-002 are repaired and independently regraded.** They are reproducible JavaScript-unavailable/script-failure paths. The local structural, route, asset, metadata, and desktop-production smoke checks otherwise passed.

Evidence labels used below:

- **Code-proven**: established from generated markup and the controlling source, without assuming a visual result.
- **Browser-observed**: observed in the public preview through the cloud browser.
- **Inferred**: a bounded consequence of the cited evidence. No finding is based on taste alone.

## Accepted findings

### TECH-001 - Mobile navigation has no JavaScript fallback

| Field | Evidence |
|---|---|
| Scope | Shared header on all 39 generated documents (`/`, every sitemap route, and `/404.html`) |
| Context | JavaScript unavailable or `/site.js` fails; 320px, 390px, and 768px (the `max-width: 900px` mobile-navigation rule applies) |
| Severity | **Medium** - the persistent pickup dock preserves the primary CTA, but a mobile visitor cannot open the primary navigation to inspect materials, industries, service areas, process, or story. This is a reproducible navigation obstacle rather than a total lead-path loss. |
| Classification | **Code-proven** |
| Reproduction | 1. Disable JavaScript (or block `/site.js`) and load any route at 390px. 2. Activate the visible menu button labelled “Open navigation.” 3. Observe that the button has no native behaviour and the navigation remains off-canvas. The same condition applies at 320px and 768px. |
| Observed evidence | `scripts/build.mjs` emits a plain `button` with `data-nav-toggle` and a `div[data-nav]`; only `src/site.js` attaches the open/close behaviour. In `src/style.css` at `@media (max-width: 900px)`, `.nav-links` is `position: fixed` with `transform: translateY(105%)`; only `.nav-open .nav-links` returns it to view. The `nav-open` class is script-created. There is no no-script rule or native disclosure control. |
| Expected behaviour | With scripts absent, expose the navigation in normal document flow, or use a native `details/summary` fallback so the menu control remains operable. |
| Likely affected source | `scripts/build.mjs` (header markup), `src/style.css` (mobile nav), `src/site.js` (enhancement-only state). Regression: a no-JS 390px browser check that can activate every header destination. |

### TECH-002 - Contact form error and delivery recovery become raw JSON without JavaScript

| Field | Evidence |
|---|---|
| Scope | `/contact` and every `Schedule a Free Pickup` path that routes there |
| Context | JavaScript unavailable or `/site.js` fails; empty/invalid submission, successful submission, and online-delivery failure |
| Severity | **Medium** - affected visitors can submit the native form, but receive a JSON API document instead of field recovery or a usable fallback. During delivery failure, the generated email fallback and preserved request details exist only in client JavaScript, adding material friction to the lead-recovery path. |
| Classification | **Code-proven**; local delivery-failure response was exercised without any email provider configuration or outbound delivery |
| Reproduction | 1. Disable JavaScript and open `/contact`. 2. Submit the `novalidate` form empty: the request navigates to `/api/leads`, whose 422 response is JSON rather than page-level field recovery. 3. Submit a valid native form while the endpoint returns 503/502: the response is JSON containing `message` and `fallback_email`; there is no `mailto:` recovery link carrying the visitor’s entered details. |
| Observed evidence | `reviewForm()` in `scripts/build.mjs` emits `<form … method="post" novalidate>`. `api/leads.js` returns only `res.status(...).json(...)` for validation, success, 503 configuration failure, and 502 delivery failure. `showFormIssues()` and `showDeliveryFallback()` in `src/site.js` are the only code that renders field links and the `mailto:` recovery. A local handler invocation with valid synthetic data and `RESEND_API_KEY` disabled returned exactly `503 {"message":"Online delivery is being set up. Call AG Refining or email these details instead.","fallback_email":"dennis@agrefining.com"}`; no provider request occurred. Vercel documents that URL-encoded form submissions are parsed into `req.body`, so the native POST reaches this JSON-only response branch. |
| Expected behaviour | Preserve a server-rendered/form-post recovery surface: re-render the form with an error summary and submitted safe fields, and provide a clickable email/call fallback on 502/503. Keep client scripting as progressive enhancement, not the sole recovery UI. |
| Likely affected source | `scripts/build.mjs` (`reviewForm`), `src/site.js` (client-only recovery), and `api/leads.js` (JSON-only response contract). Regression: JS-disabled invalid and forced-503 form tests that assert HTML error/fallback content and no accidental lead delivery. |

## Required-context assessment

| Context | Result | Evidence type and notes |
|---|---|---|
| 320px | TECH-001 open; no additional code-proven overflow candidate | The `max-width: 700px` composition creates single-column content and the `max-width: 480px` button rules. Mobile nav remains script-dependent at this width. |
| 390px | TECH-001 and TECH-002 open | Same mobile navigation branch; this is the deterministic reproduction width for both findings. |
| 768px | TECH-001 open; no additional code-proven overflow candidate | The `max-width: 900px` mobile nav/dock branch applies; major page grids collapse to one column. |
| 1024px | No accepted finding | Static `max-width: 1100px` layout branch retains bounded grid columns. |
| 1440px | No accepted finding | Baseline desktop CSS applies. Public browser smoke at 1348px client width found `scrollWidth === clientWidth` after full load. |
| Direct deep links and 404 | Pass | **Browser-observed**: `/industrial-x-ray-silver-recycling` rendered its expected title, H1, canonical, marker, and no failed images; an unknown route rendered the custom noindex 404; `/home` redirected to `/`. |
| JavaScript enabled contact form | Pass | **Browser-observed**: `/contact?intent=pickup&material=silver_flake` prefills `material`; an empty submit exposes five linked errors, marks fields invalid, restores button availability, and makes no lead request. |
| JavaScript unavailable / optional script failure | TECH-001 and TECH-002 open | **Code-proven** from the shared off-canvas navigation and client-only form recovery. |
| Reduced motion | Pass | **Code-proven**: `@media (prefers-reduced-motion: reduce)` disables animation and reduces transitions; `html` disables smooth scrolling. |
| Slow or failed below-fold media | Pass, source-level | **Code-proven**: 36 of 144 images are lazy-loaded, and no `fetchpriority="high"` image is lazy-loaded. Browser smoke found no completed image with `naturalWidth === 0` on sampled live routes. Network throttling was not available in the supplied browser surface. |
| Fixed mobile dock | No additional candidate | **Code-proven**: it is present below 900px, hides when scrolled to the footer in enhanced mode, uses safe-area offsets, and mobile body/footer padding reserves space. Its no-JS primary CTA remains available. |
| Mobile menu, focus, and dismissal with JavaScript | No accepted finding | **Code-proven**: focus is placed in the menu, Tab/Shift+Tab are trapped, Escape and scrim close it, and the main/footer/dock/guide are inert while open. The no-JS limitation is TECH-001. |
| Route and local-asset integrity | Pass | **Code-proven**: 39 documents, 38 sitemap entries, and zero missing local asset targets in the exhaustive output scan. |
| SEO/canonical/robots/sitemap/structured data | Pass | **Code-proven**: every output document has exactly one title, description, H1, and canonical; JSON-LD parsed; 404 is `noindex,follow`; robots names the sitemap. **Browser-observed** canonical/robots matched on homepage, contact, industrial X-ray route, and 404. |
| Hero priority, image dimensions, and font behaviour | Pass | **Code-proven**: every image has declared dimensions; 30 priority images are eager; the hero is eager; local Manrope and Newsreader use `font-display: swap` with system fallbacks. Intrinsic WebP dimensions were enumerated. |
| Horizontal overflow and clipping | No accepted finding | **Browser-observed** at live desktop after network idle: homepage `scrollWidth=1348`, `clientWidth=1348`, with no element outside the client bounds. Static viewport branches were reviewed for the five required widths. |
| Console/runtime errors | Pass for site code | **Browser-observed**: the only captured error was from the cloud-browser extension (`chrome-extension://…/content-script.bundle.js`), not an AG Refining source URL. |
| Local/public marker and token parity | Pass, bounded | **Browser-observed** on `/`, `/contact`, deep route, and 404: body marker `data-design="silver-atelier"`; live `--canvas` computed to `#f1ede4`; deployed stylesheet and script use the expected `20260803-silver-atelier` cache marker. This is a marker/token smoke, not a byte-for-byte deployment provenance proof. |

## Exhaustive generated-route coverage

Every row below passed the deterministic output check: exactly one title, meta description, H1, and canonical; valid JSON-LD; Silver Atelier body marker; deferred site script; no missing local asset target; and no dimensionless `<img>`. “Pass - static” does not erase the two shared findings above.

| Family | Route | Result |
|---|---|---|
| Core | `/` | Pass - static; browser smoke |
| Core | `/accepted-materials` | Pass - static |
| Core | `/industries` | Pass - static |
| Core | `/service-areas` | Pass - static |
| Core | `/how-it-works` | Pass - static |
| Core | `/about` | Pass - static |
| Core | `/contact` | Pass - static; TECH-002 shared |
| Core | `/espanol` | Pass - static |
| Core | `/privacy` | Pass - static |
| Utility | `/404.html` | Pass - static; browser 404 smoke |
| Material/service | `/scrap-silver-jewelry` | Pass - static |
| Material/service | `/industrial-x-ray-silver-recycling` | Pass - static; browser deep-link smoke |
| Material/service | `/sell-silver-coins-houston` | Pass - static |
| Material/service | `/silver-flake-buyer-houston` | Pass - static |
| Material/service | `/laboratory-silver-buyer-houston` | Pass - static |
| Material/service | `/silver-solder-buyer-houston` | Pass - static |
| Material/service | `/silver-plated-materials-buyer-houston` | Pass - static |
| Material/service | `/silver-oxide-watch-battery-recycling-houston` | Pass - static |
| Material/service | `/medical-x-ray-recycling` | Pass - static |
| Material/service | `/scrap-silver-buyer-houston` | Pass - static |
| Material/service | `/dental-scrap-buyer-houston` | Pass - static |
| Material/service | `/x-ray-recycling-services-houston` | Pass - static |
| Material/service | `/industrial-silver-scrap` | Pass - static |
| Material/service | `/sell-silver-bars-houston` | Pass - static |
| Material/service | `/silver-flatware-buyer-houston` | Pass - static |
| Material/service | `/jewelry-store-silver-recycling-houston` | Pass - static |
| Industry | `/hospital-silver-recycling` | Pass - static |
| Industry | `/dental-lab-silver-recycling` | Pass - static |
| Industry | `/oil-gas-silver-recovery` | Pass - static |
| Industry | `/manufacturing-silver-recovery` | Pass - static |
| Industry | `/university-silver-recycling` | Pass - static |
| Industry | `/electronics-silver-recovery` | Pass - static |
| Location | `/houston-silver-buyer` | Pass - static |
| Location | `/silver-buyer-pearland` | Pass - static |
| Location | `/silver-buyer-pasadena` | Pass - static |
| Location | `/silver-buyer-sugar-land` | Pass - static |
| Location | `/silver-buyer-katy` | Pass - static |
| Location | `/silver-buyer-the-woodlands` | Pass - static |
| Location | `/silver-buyer-conroe` | Pass - static |

## Commands and browser checks used

No `npm run build` was run, so the concurrent audit lanes’ existing `dist/` output was preserved.

```bash
git status --short
find dist -type f -name '*.html' | sort
rg --files src scripts api assets

npm run check
node scripts/verify.mjs

# Exhaustive, read-only Node scan of all HTML for singleton metadata/H1,
# canonical, JSON-LD parseability, marker, script, local assets, and image dimensions.
node --input-type=module -e '…'

# Read-only image intrinsic-size inventory.
identify -format '%f %w %h\n' dist/assets/*.webp

# Local API handler mock with a valid synthetic payload and Resend disabled;
# asserts the 503 delivery-recovery contract without sending an email.
node --input-type=module -e 'process.env.RESEND_API_KEY = ""; … handler(mockReq, mockRes)'
```

Cloud-browser checks against `https://agrefining.vercel.app/`:

1. Loaded `/`, `/contact?intent=pickup&material=silver_flake`, `/industrial-x-ray-silver-recycling`, an unknown route, and `/home`; recorded final URL, title, H1, marker, canonical, robots, image failures, and scroll metrics.
2. Waited for full load on the homepage and collected document/body widths plus bounds of every element to check horizontal overflow.
3. On the live contact page, verified query prefill and performed only an empty client-side submit; recorded the error summary, invalid fields, busy state, and restored submit button. No request carrying a valid lead was made.
4. Collected warning/error logs. The only errors belonged to the browser extension, not the site.

## Regrade gate

After a repair, a fresh grader should verify at 320px, 390px, and 768px with JavaScript disabled and with `/site.js` blocked:

1. every mobile header destination remains reachable;
2. invalid contact submission provides a field-level recovery page;
3. forced API 503/502 provides an accessible clickable fallback without losing the visitor’s entered details;
4. JavaScript-enabled nav, form validation, and successful delivery paths still work;
5. rerun `npm run check` and `node scripts/verify.mjs`.
