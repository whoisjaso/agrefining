# Task 2 Implementation Report

## Status

DONE_WITH_CONCERNS

## Commit

- `Complete title case and footer navigation`

## Files Changed

- `package.json`
  - Adds `tests/footer-navigation-contract.test.mjs` to the main `npm test` contract suite.
- `scripts/build.mjs`
  - Replaces the short footer with exhaustive grouped footer navigation for English and Spanish shared chrome.
  - Introduces desktop footer columns and localized mobile disclosure groups from the generator instead of relying on ad hoc route lists.
  - Promotes homepage eyebrow, H2, H3, CTA, and card-heading copy to authored Title Case.
- `src/style.css`
  - Rebuilds footer layout for a brand column plus four navigation columns on desktop.
  - Adds responsive disclosure styling, 44px mobile summary targets, and stacked mobile footer groups.
- `tests/generated-interaction-contract.test.mjs`
  - Adds exact homepage Title Case assertions for eyebrow labels, compact section labels, H2s, H3s, and related-card headings.
- `tests/footer-navigation-contract.test.mjs`
  - Adds exhaustive footer inventory coverage for every English page.
  - Verifies grouped `<details>/<summary>` footer structure, navigation labeling, responsive footer CSS, and localized Spanish footer output.
- `tests/materials-navigation-contract.test.mjs`
  - Updates exact homepage material and NDT wording expectations to match the new authored Title Case copy.
- `tests/cinematic-hero-markup.test.mjs`
  - Updates exact homepage hero kicker and CTA wording expectations to match the new authored Title Case copy.

## Design And Behavior Decisions

- Kept footer routes canonical: each English footer now exposes the full material, industry, service-area, company, contact, pickup, phone, email, and privacy destinations exactly once.
- Kept Spanish shared chrome localized while marking English destination routes with `hreflang="en"` and preserving the localized pickup CTA anchor target.
- Used authored Title Case directly in generated HTML instead of CSS-only capitalization so tests can reject future sentence-case regressions.
- Used semantic `<details>` / `<summary>` groups so the same footer markup works as static desktop columns and touch-friendly mobile disclosure sections.

## TDD Evidence

- RED: temp copy with current tests plus `HEAD` versions of `scripts/build.mjs`, `src/style.css`, `package.json`, and the updated exact-string tests:
  - Command: `node scripts/build.mjs && node --test tests/footer-navigation-contract.test.mjs tests/generated-interaction-contract.test.mjs tests/materials-navigation-contract.test.mjs tests/cinematic-hero-markup.test.mjs`
  - Exit `1`; 23 passed, 4 failed.
  - Failures identified the incomplete footer inventory, missing grouped footer disclosures, missing responsive footer CSS, and outdated Spanish footer labels.
- GREEN focused:
  - Command: `node scripts/build.mjs && node --test tests/footer-navigation-contract.test.mjs tests/generated-interaction-contract.test.mjs tests/materials-navigation-contract.test.mjs tests/cinematic-hero-markup.test.mjs`
  - Exit `0`; built 38 public pages and passed 29 focused tests.

## Verification Commands And Results

- Source rebuild: `node scripts/build.mjs`
  - Exit `0`; `Built 38 public pages in dist`.
- Focused Task 2 suite: `node --test tests/footer-navigation-contract.test.mjs tests/generated-interaction-contract.test.mjs tests/materials-navigation-contract.test.mjs tests/cinematic-hero-markup.test.mjs`
  - Exit `0`; 29 passed, 0 failed.
- Affected full suite: `npm test`
  - Exit `0`; 91 passed, 0 failed (51 contract/generated tests, 29 hero runtime tests, 11 materials runtime tests).
- Whitespace: `git diff --check`
  - Exit `0`; no output.
- Repository check: `npm run check`
  - Exit `1` on pre-existing repository issues outside Task 2:
    - Missing `assets/ag-silver-hero-1600.webp`
    - Missing `assets/ag-silver-hero-mobile.webp`
    - Missing `assets/material-dental-1280.webp`
    - Missing `assets/material-scrap-silver-1280.webp`
    - Missing `assets/material-watch-batteries-1280.webp`
    - Missing `assets/material-xray-film-1280.webp`
    - Missing `assets/fonts/newsreader-latin-opsz.woff2`
    - Missing `assets/fonts/manrope-latin-wght.woff2`
    - Banned character in `docs/superpowers/specs/2026-08-13-ag-refining-release-correction-design.md`
- Full `npm run build`
  - Exit `1` before generation because `scripts/fetch-assets.mjs` reports `Integrity check failed for ag-silver-hero-1600.webp`.
  - The Task 2 generator rebuild itself is green when run directly via `node scripts/build.mjs`.

## Self-Review Findings

- Confirmed the old `HEAD` generator still emitted sparse footer routes and sentence-case homepage labels, and the new Task 2 tests fail against that baseline.
- Confirmed the current generator emits the exhaustive footer inventory once per English page and the expected localized Spanish shared chrome.
- Confirmed footer markup uses native `<details class="footer-group" open>` groups with labeled navigation wrappers.
- Confirmed responsive CSS keeps four desktop footer columns and switches to one-column disclosure groups with 44px summary targets on mobile.
- Confirmed only Task 2 implementation/test files plus this Task 2 report are intended for staging; generated `dist` output and the worktree-local `node_modules` symlink remain unstaged.

## Concerns

- `npm run build` is still blocked by an existing asset-integrity failure in `scripts/fetch-assets.mjs` for `ag-silver-hero-1600.webp`; Task 2 source generation and tests are otherwise green.
- `npm run check` is still not green because of pre-existing missing assets/fonts and an existing banned character in the release design spec, none of which were modified by Task 2.
- npm prints the existing warning `Unknown env config "http-proxy"` during script runs; it did not affect verification.

---

## Review Fix Round 1

### Status

DONE_WITH_CONCERNS

### Findings Addressed

1. Title Case generation now covers generated interior routes instead of only the homepage, including shared disclosure headings, material-guide labels, eyebrow/small-label slots, H2s, H3s, and card-heading labels.
2. The route-wide regression contract now inspects every generated HTML file and includes explicit interior-route exemplars for accepted-materials, hospital, and Spanish pages.
3. Adjacent exact-string tests were updated where the new authored Title Case intentionally changed previously approved sentence-case output.

### Files Changed

- `scripts/build.mjs`
  - Adds generator-side heading normalization for Title Case across eyebrow/small-label, H2, H3, material-guide summary, and card-heading markup in every generated page.
  - Preserves body-copy sentence casing by limiting normalization to heading-like slots only.
- `tests/generated-interaction-contract.test.mjs`
  - Replaces the homepage-only Title Case checks with a route-wide scan across all built HTML plus explicit interior-route exemplars, including Spanish shared standards.
- `tests/materials-navigation-contract.test.mjs`
  - Updates materials disclosure group and route eyebrow expectations to the new authored Title Case output.
- `tests/service-area-artifacts-contract.test.mjs`
  - Updates the service-coverage H2 expectation to the new authored Title Case output.

### TDD Evidence

- RED: `node --test tests/generated-interaction-contract.test.mjs`
  - Exit `1`; 8 passed, 2 failed.
  - Failures identified route-wide sentence-case output across accepted-materials, hospital, service-area, contact, about, and Spanish pages, plus the missing interior-route exemplar updates.
- GREEN focused: `node scripts/build.mjs && node --test tests/generated-interaction-contract.test.mjs tests/materials-navigation-contract.test.mjs tests/cinematic-hero-markup.test.mjs tests/footer-navigation-contract.test.mjs`
  - Exit `0`; built 38 public pages and passed 29 focused tests.

### Verification Commands And Results

- Completion gate: `node scripts/build.mjs && npm test && git diff --check`
  - Exit `0`; built 38 public pages, passed the full affected suite (51 contract/generated + 29 hero runtime + 11 materials runtime), and produced no diff-check output.
- Repository check remains unchanged:
  - `npm run check` still exits `1` because of pre-existing missing assets/fonts and the existing banned-character spec file.

### Self-Review

- Confirmed the generator now title-cases interior-route disclosure groups, accepted-materials cards, detail-rail headings, service-area headings, and Spanish heading slots without touching paragraph copy.
- Confirmed the new route-wide test fails against the old sentence-case output and catches interior-route regressions outside the homepage.
- Confirmed only the generator, Title Case regression tests, updated exact-string tests, and this appended report are intended for the fix-round commit.
