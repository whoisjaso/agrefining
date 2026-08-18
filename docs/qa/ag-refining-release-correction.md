# AG Refining release correction QA evidence

Date: August 17, 2026

Status: PASS

The homepage hero now uses the approved molten-pour poster, keeps the full-viewport hidden-header behavior, removes the extra kicker line, and preserves lighter unfiltered media with safe white-copy contrast. All required verification commands passed on August 17, 2026.

## Release gate

| Command | Result |
| --- | --- |
| `npm test` | Pass. `62` top-level tests passed, then `29` cinematic hero runtime tests passed, then `11` materials runtime tests passed. |
| `npm run test:assay` | Pass. `20` tests passed. |
| `npm run test:media` | Pass. `3` tests passed. |
| `npm run check` | Pass. Printed `AG_REFINING_CHECK_OK`. |
| `node scripts/verify.mjs` | Pass. Printed `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`. |
| `git diff --check` | Pass. No output. |
| `npm run test:browser` | Pass. Printed `[browser] all 6 viewport processes passed` and rewrote `docs/qa/cinematic-captures/cinematic-browser-matrix.json`. |

Environment note: each npm command also printed `npm warn Unknown env config "http-proxy"`. This was a non-blocking environment warning; every command above still exited `0`.

## Media contract

| Asset | Format | Dimensions | Bytes | Notes |
| --- | --- | ---: | ---: | --- |
| `images/ag-refining-molten-pour-poster.webp` | WebP | 2560×1440 | 186,232 | Exported from the approved generated hero poster with the left navy copy field and right-side pour preserved. |
| `images/ag-refining-silver-ingots-poster.webp` | WebP | 1280×720 | 43,628 | Unchanged. |
| `images/ag-refining-precision-assay-poster.webp` | WebP | 1280×720 | 37,418 | Unchanged. |
| `videos/ag-refining-molten-pour.webm` | VP9 / yuv420p / 24 fps | 1280×720 | 1,249,964 | 8.042 s |
| `videos/ag-refining-molten-pour.mp4` | H.264 / yuv420p / 24 fps | 1280×720 | 1,977,852 | 8.041667 s |
| `videos/ag-refining-silver-ingots.webm` | VP9 / yuv420p / 24 fps | 1280×720 | 1,092,618 | 7.042 s |
| `videos/ag-refining-silver-ingots.mp4` | H.264 / yuv420p / 24 fps | 1280×720 | 1,634,067 | 7.041667 s |
| `videos/ag-refining-precision-assay.webm` | VP9 / yuv420p / 24 fps | 1280×720 | 1,283,235 | 8.042 s |
| `videos/ag-refining-precision-assay.mp4` | H.264 / yuv420p / 24 fps | 1280×720 | 1,658,728 | 8.041667 s |

Result: all three committed clips remained at their 1280×720 source resolution and were not downscaled in source or build output.

## Browser matrix

Browser evidence was generated at `2026-08-17T21:59:18.114Z` with Playwright Core `1.61.1`, Sparticuz Chromium `149.0.0`, and Chromium `149.0.7827.0`.

All six required widths passed every browser stage on the first process attempt: `posterBeforeModule`, `noJavaScript`, `reducedMotion`, `saveData`, `autoplayRejection`, `normal`, `visibility`, and `interactions`.

| Viewport | Result | Keyboard / interactions | Reduced motion / Save-Data | Autoplay rejection | Layout / overflow |
| --- | --- | --- | --- | --- | --- |
| 1440×960 | Pass | Interaction stage passed; hero CTA and nav interactions remained topmost. | Poster opacity `1`; assigned video sources `0` in both static stages. | Poster opacity `1`; video opacities `[0, 0]`. | Hero layout shift `0`; total layout shift `0`; overflow `0`; init long-task count `0`. |
| 901×900 | Pass | Interaction stage passed at the desktop side of the 900/901 breakpoint. | Poster opacity `1`; assigned video sources `0` in both static stages. | Poster opacity `1`; video opacities `[0, 0]`. | Hero layout shift `0`; total layout shift `0`; overflow `0`; init long-task count `0`. |
| 900×900 | Pass | Interaction stage passed at the mobile side of the 900/901 breakpoint. | Poster opacity `1`; assigned video sources `0` in both static stages. | Poster opacity `1`; video opacities `[0, 0]`. | Hero layout shift `0`; total layout shift `0`; overflow `0`; init long-task count `0`. |
| 768×1024 | Pass | Interaction stage passed. | Poster opacity `1`; assigned video sources `0` in both static stages. | Poster opacity `1`; video opacities `[0, 0]`. | Hero layout shift `0`; total layout shift `0`; overflow `0`; init long-task count `0`. |
| 390×844 | Pass | Interaction stage passed. | Poster opacity `1`; assigned video sources `0` in both static stages. | Poster opacity `1`; video opacities `[0, 0]`. | Hero layout shift `0`; total layout shift `0`; overflow `0`; init long-task count `0`. |
| 320×800 | Pass | Interaction stage passed. | Poster opacity `1`; assigned video sources `0` in both static stages. | Poster opacity `1`; video opacities `[0, 0]`. | Hero layout shift `0`; total layout shift `0`; overflow `0`; init long-task count `0`. |

Browser harness summary:

- Failures: `0`
- Infrastructure retries: `0`
- Current matrix-referenced PNG captures: `60`
- Current matrix artifact: `docs/qa/cinematic-captures/cinematic-browser-matrix.json`

Note: the capture directory still contains older compact-desktop PNGs from earlier runs, but the August 17, 2026 matrix JSON references the current 60 captures for the 1440 / 901 / 900 / 768 / 390 / 320 run.

## Final Release Review Fix Wave

Status: PASS on August 17, 2026.

The final review wave closed all eight release findings without changing the approved routes, visible copy, hero geometry, header behavior, navigation placement, pickup dock count, or responsive media system.

- Footer: every English and Spanish footer now includes the service-area overview plus the exact 23-city inventory. All four native disclosure groups ship collapsed; author CSS exposes structured desktop columns, while the 700px mobile rules retain native collapsed disclosures and a no-JavaScript fallback.
- Loader: the visible assay sequence now contains semantic hooks for `Ag`, atomic number `47`, and purity `99.9`, plus a screen-reader status label. Browser coverage verifies the visible sequence, reduced-motion removal, and the existing 1.2-second fail-open.
- Build privacy: `assets/material-masters` remains committed as authoring source but is filtered from the public asset copy. The output changed from 59,863,380 bytes and 161 files to 16,695,823 bytes and 143 files. That is a net reduction of 43,167,557 bytes (72.11%) and 18 files; the excluded source masters themselves total 43,205,020 bytes across 18 files, while expanded footer HTML accounts for the difference between excluded and net bytes.
- Chrome state: opening navigation after the dock becomes eligible now synchronously sets `data-visible="false"`, `aria-hidden="true"`, and inert. Dock eligibility is explicitly mobile-only, and browser coverage crosses both sides of the 900/901 breakpoint.
- Evidence provenance: the cinematic harness dynamically resolves `git merge-base HEAD main` (or `AG_REFINING_BASE_REF`) instead of embedding a stale hash. The regenerated matrix records base `e37bbbdf1e0e0238bb187c42c9c31eefb2a5f149` and was generated at `2026-08-17T21:59:18.114Z`.
- CI coverage: `npm run verify` now invokes `npm run test:site-chrome` exactly once; the separate cinematic `test:browser` gate does not duplicate it.
- Poster budget: the regression ceiling is 300 KiB; the current 2560×1440 WebP is 186,232 bytes.
- Title Case: normalization now transforms text nodes while preserving nested inline tags and attributes. The focused regression wraps the existing `Choose Your Service Area.` copy without changing its visible text.

### Final TDD Evidence

| Phase | Command | Result |
| --- | --- | --- |
| RED contracts | `node scripts/build.mjs && node --test tests/footer-navigation-contract.test.mjs tests/mobile-homepage-contract.test.mjs tests/assay-production-contract.test.mjs tests/generated-interaction-contract.test.mjs tests/cinematic-hero-markup.test.mjs` | Expected failure: 35 passed, 9 failed on the missing footer inventory/disclosure state, assay sequence, private-master filter, dynamic provenance, CI gate, and nested markup contracts. |
| RED browser | `node tests/site-chrome-browser.mjs` | Expected failure: opening the nav left dock state at `data-visible="true"` and `aria-hidden="false"`. |
| Focused GREEN | Same focused Node command, followed by `node tests/site-chrome-browser.mjs` | 44 passed, 0 failed; `SITE_CHROME_BROWSER_OK`. |

### Final Release Gates

| Command | Result |
| --- | --- |
| `npm run verify` | Pass. Build verified 12 production assets and emitted 38 public pages. Contract suite: 65/65; cinematic runtime: 29/29; materials runtime: 11/11; assay: 20/20. `AG_REFINING_CHECK_OK`, `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`, and `SITE_CHROME_BROWSER_OK`. |
| `npm run test:browser` | Pass. Six viewport processes × eight stages = 48/48 stages, zero product failures, zero infrastructure retries, and 60 unique referenced PNG captures. |
| `git diff --check` | Pass after evidence/report updates; no output. |

Environment note: npm printed the existing non-blocking `Unknown env config "http-proxy"` warning. All commands exited `0`.

## Product checks covered by this release correction

- The approved hero poster replaced the old molten-pour poster and now ships with matching `width="2560" height="1440"` markup.
- The three cinematic clips still ship at 1280×720 and stay deferred in static HTML.
- The hero overlay stays in CSS, remains unfiltered, and now uses a lighter gradient so more poster and video detail remains visible.
- The hero kicker line was removed as the requested minor visual/copy simplification.
- The homepage still keeps the full-viewport hero, hidden-header behavior, proof rail, CTA pair, phone fallback, and separate intake section.
- `tests/service-area-artifacts-contract.test.mjs` no longer carries the unused `coverageCities` constant.
