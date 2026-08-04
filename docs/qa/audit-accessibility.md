# AG Refining perceptual-accessibility audit

- Audit date: 2026-08-04
- Scope: existing `dist/` production build, 38 sitemap routes plus `dist/404.html`; shared `src/style.css`, `src/site.js`, generated shell/form markup in `scripts/build.mjs`, and `api/leads.js`.
- Result: **do not release**. Two High findings block the release gate.
- Evidence labels: **Code-proven** means deterministic source/build inspection or an isolated handler invocation. **Browser-observed** means rendered in a browser. **Inference** is a stated consequence derived from the code. The cloud-browser local preview was blocked with `ERR_BLOCKED_BY_CLIENT`, so no rendered-browser facts are claimed.

## Method and checks

Read the QA-loop and Silver Atelier specs, persona ledger, Apohenia frontend-design quality rubric, and shared source. Static inspection covered all 39 generated documents. The following read-only checks were run against the existing build; no build, generated page, production source, API, or deployment was changed.

```text
find dist -type f -name '*.html' | wc -l
# 39

node static semantic inventory
# 39 documents; exactly one h1 each; no heading-level skips; one header/main/footer
# each; a skip link on each; all 129 rendered img elements have alt attributes.

node contrast calculation
# #20354c on #f1ede4 = 10.73:1
# #40566d on #f1ede4 = 6.49:1
# #586b7e on #f1ede4 = 4.71:1
# #416b94 on #f1ede4 = 4.79:1
# #1d5e96 on #f1ede4 = 5.81:1
# #984b3e on #f4e7e2 = 5.09:1
# #476653 on #faf8f2 = 6.00:1

node isolated /api/leads invalid POST invocation
# 422 JSON: {message, fields}; no HTML recovery document
```

The CSS media rules were inspected at the required reflow breakpoints: 320px and 390px use the 700px and 480px layouts, 768px uses the 900px layout, 1024px uses the 1100px layout, and 1440px uses the base layout. This source review found responsive single-column fallbacks and no static minimum-width conflict that proves overflow. Browser verification at those exact sizes remains required after fixes because the available cloud preview cannot access the local server.

## Accepted findings

### A11Y-001 - Form is not resilient when its required JavaScript is unavailable

- **Scope:** `/contact`; every pickup CTA routes there. Shared `reviewForm()` and `/api/leads` behavior.
- **Persona/context/viewport:** keyboard-only, switch-like, low-bandwidth or script-blocked visitor; 320px, 390px, 768px, 1024px, and 1440px (viewport independent).
- **Severity:** High. A major failure mode cannot complete or understand the primary pickup-request journey.
- **Reproduction:** Disable JavaScript. Open `/contact`, submit the empty form, then submit a fully valid form. The form has `novalidate`, so the browser does not supply native validation. It posts directly to `/api/leads`; the API returns JSON for validation, success, delivery failure, and fallback conditions rather than an HTML recovery page.
- **Observed evidence:** **Code-proven.** `scripts/build.mjs` renders `<form ... action="/api/leads" method="post" novalidate>` with no `<noscript>` alternative. The isolated invalid POST returned status 422 and JSON `{ "message": "Please review the highlighted fields.", "fields": { ... } }`. `api/leads.js` also returns JSON for 200, 502, and 503. The accessible in-page summary, status announcement, and mailto fallback are created only by `src/site.js`.
- **Expected behavior:** The pickup form must retain an HTML, keyboard-operable validation, success, and delivery-failure path without client JavaScript, including a human-readable email/call fallback.
- **Likely affected source:** `scripts/build.mjs:1830-1851`, `api/leads.js:144-188`, and the client-only recovery in `src/site.js:192-354`.
- **Regression location:** Add a no-JavaScript form submission check that asserts an HTML recovery response and a reachable fallback link for 422, 502/503, and success.

### A11Y-002 - Closed mobile menu leaves invisible links in keyboard focus order

- **Scope:** shared header on all 39 documents.
- **Persona/context/viewport:** keyboard-only, switch-like, low vision at 200% zoom; 320px, 390px, and 768px (all `max-width: 900px`).
- **Severity:** High. Keyboard users encounter six visually off-screen navigation controls before continuing through the page, disrupting the primary journey and making focus location unavailable.
- **Reproduction:** At a viewport of 900px or narrower, load any route with the menu closed. Tab from the menu toggle. Continue tabbing: Materials, Industries, Service areas, How it works, Our story, and Schedule a Free Pickup receive focus while the menu remains translated below the viewport. Do not open the menu first.
- **Observed evidence:** **Code-proven.** `src/style.css:2581-2597` keeps `.nav-links` rendered, fixed, and focusable while hiding it only with `transform: translateY(105%)`; it does not use `display: none`, `visibility: hidden`, `hidden`, `inert`, or `aria-hidden`. `scripts/build.mjs:717-723` supplies six normal anchors. `src/site.js:1-56` only makes main/footer/dock/guide inert after opening, and does not disable or inert the closed menu. Global `:focus-visible` cannot make an off-screen focus target visible.
- **Expected behavior:** While closed, the menu and its descendants must be absent from sequential keyboard focus and the accessibility tree. When opened, focus should move into it, remain managed, and return to the toggle when closed.
- **Likely affected source:** `src/style.css:2581-2611`, `src/site.js:1-56`, `scripts/build.mjs:707-726`.
- **Regression location:** Add a keyboard-state test at 320px and 768px asserting no `#primary-links a` can receive sequential focus until `[aria-expanded="true"]`, then assert the close/return-focus sequence.

### A11Y-003 - English shared chrome is announced as Spanish on the Spanish page

- **Scope:** `/espanol` shared header, mobile actions, footer, and material guide.
- **Persona/context/viewport:** Spanish-first screen-reader user; all required viewports.
- **Severity:** Medium. Navigation and recovery labels are read with the wrong language pronunciation, and the Spanish CTA opens the English-only contact form.
- **Reproduction:** Use a screen reader with `/espanol`. The document root is `lang="es"`; move through the shared header or footer. English strings including "Materials", "How it works", "Schedule a Free Pickup", "Call", and "Identify your material" have no `lang="en"` wrapper. Activate "Enviar solicitud" and arrive at the English `/contact` form.
- **Observed evidence:** **Code-proven.** `scripts/build.mjs:804-855` applies the document root language to all injected shared chrome. The `/espanol` call at `scripts/build.mjs:1873-1889` sets `lang: "es"`, but the shared `nav`, `mobileActions`, `footer`, and `materialGuide` templates at `scripts/build.mjs:707-767` are English without a language override. **Inference:** a Spanish voice will apply Spanish pronunciation rules to those English controls.
- **Expected behavior:** Translate the shared chrome and contact journey, or mark intentional English fragments with `lang="en"` and make the cross-language destination explicit before activation.
- **Likely affected source:** `scripts/build.mjs:707-767`, `scripts/build.mjs:1873-1889`.
- **Regression location:** Add an `/espanol` language audit asserting Spanish labels or explicit `lang="en"` on every English shared-control label and an announced language change for any English contact route.

### A11Y-004 - Preferred-contact radio labels are below a practical coarse-touch target

- **Scope:** `/contact` form.
- **Persona/context/viewport:** limited fine motor control and coarse touch; 320px and 390px.
- **Severity:** Low. The default phone choice permits submission, but changing to email requires a small target.
- **Reproduction:** On a coarse-touch phone, try to select Email by tapping its label. The label has only its text and a 16px radio; no minimum height or padding creates a 44px target.
- **Observed evidence:** **Code-proven.** `src/style.css:2320-2343` gives `.preferred-contact label` a 0.84rem line-height-sized flex box and its input `height`/`width: 1rem`; neither label nor fieldset has `min-height: 44px` or vertical padding. The coarse-pointer rule at `src/style.css:3094-3102` does not include `.preferred-contact label`.
- **Expected behavior:** Each radio-label hit area should be at least 44 by 44 CSS pixels where practical, without relying on the 16px radio glyph.
- **Likely affected source:** `src/style.css:2320-2343`, `src/style.css:3094-3102`.
- **Regression location:** Add a 390px/coarse-pointer computed-size assertion for both preferred-contact labels.

## Coverage table

All routes passed the static baseline checks for one H1, logical heading sequence, document language, header/main/footer landmarks, skip link, and image alt attributes. "Shared A11Y-002" means the shared mobile-header issue applies. The route-specific exceptions are named in the final column.

| Route | Family | Result |
|---|---|---|
| `/` | core | Shared A11Y-002 |
| `/accepted-materials` | core | Shared A11Y-002 |
| `/industries` | core | Shared A11Y-002 |
| `/service-areas` | core | Shared A11Y-002 |
| `/how-it-works` | core | Shared A11Y-002 |
| `/about` | core | Shared A11Y-002 |
| `/contact` | core/form | A11Y-001, Shared A11Y-002, A11Y-004 |
| `/espanol` | core/language | Shared A11Y-002, A11Y-003 |
| `/privacy` | core/legal | Shared A11Y-002 |
| `/404.html` | utility | Shared A11Y-002 |
| `/scrap-silver-jewelry` | material | Shared A11Y-002 |
| `/industrial-x-ray-silver-recycling` | material | Shared A11Y-002 |
| `/sell-silver-coins-houston` | material | Shared A11Y-002 |
| `/silver-flake-buyer-houston` | material | Shared A11Y-002 |
| `/laboratory-silver-buyer-houston` | material | Shared A11Y-002 |
| `/silver-solder-buyer-houston` | material | Shared A11Y-002 |
| `/silver-plated-materials-buyer-houston` | material | Shared A11Y-002 |
| `/silver-oxide-watch-battery-recycling-houston` | material | Shared A11Y-002 |
| `/medical-x-ray-recycling` | material | Shared A11Y-002 |
| `/scrap-silver-buyer-houston` | material | Shared A11Y-002 |
| `/dental-scrap-buyer-houston` | material | Shared A11Y-002 |
| `/x-ray-recycling-services-houston` | material | Shared A11Y-002 |
| `/industrial-silver-scrap` | material | Shared A11Y-002 |
| `/sell-silver-bars-houston` | material | Shared A11Y-002 |
| `/silver-flatware-buyer-houston` | material | Shared A11Y-002 |
| `/jewelry-store-silver-recycling-houston` | material | Shared A11Y-002 |
| `/hospital-silver-recycling` | industry | Shared A11Y-002 |
| `/dental-lab-silver-recycling` | industry | Shared A11Y-002 |
| `/oil-gas-silver-recovery` | industry | Shared A11Y-002 |
| `/manufacturing-silver-recovery` | industry | Shared A11Y-002 |
| `/university-silver-recycling` | industry | Shared A11Y-002 |
| `/electronics-silver-recovery` | industry | Shared A11Y-002 |
| `/houston-silver-buyer` | location | Shared A11Y-002 |
| `/silver-buyer-pearland` | location | Shared A11Y-002 |
| `/silver-buyer-pasadena` | location | Shared A11Y-002 |
| `/silver-buyer-sugar-land` | location | Shared A11Y-002 |
| `/silver-buyer-katy` | location | Shared A11Y-002 |
| `/silver-buyer-the-woodlands` | location | Shared A11Y-002 |
| `/silver-buyer-conroe` | location | Shared A11Y-002 |

## Checks with no accepted finding

- Static semantic checks found one H1 per document, no skipped heading levels, named navigation landmarks, a `#main` skip link, root `lang`, and `alt` on every rendered image. Decorative logos and assay marks are correctly hidden or empty-alt.
- The shared focus outline is a 3px `#1d5e96` outline. Required text/status color pairs calculated between 4.71:1 and 13.79:1; error and success messages include explicit text, so color is not the only state signal.
- The contact form labels, fieldset/legend, client-side error links, `aria-invalid`, `aria-busy`, and polite status region are present when JavaScript runs. This does not mitigate A11Y-001's non-script failure mode.
- `prefers-reduced-motion: reduce` removes transition and animation duration, and static content is not hidden awaiting reveal. No motion finding accepted.
- At the CSS level, mobile layouts collapse major grids to one column and body/footer padding reserves space for the mobile dock. Exact visual overflow and fixed-dock obscuration remain browser checks after repair.

## Release recommendation

**Block release.** There are 2 High, 1 Medium, and 1 Low findings. Repair A11Y-001 and A11Y-002 before any release consideration, then run the proposed regression checks plus browser verification at 320px, 390px, 768px, 1024px, and 1440px for keyboard order, form validation/success/failure recovery, focus visibility, dock clearance, and reduced motion. A fresh grader should verify the repaired paths independently.
