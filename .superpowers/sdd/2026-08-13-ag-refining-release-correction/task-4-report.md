# Task 4 Implementation Report

## Status

DONE

## Commit

- `Replace service area visual system`
- Final commit hash is reported in the task handoff response.

## Files Changed

- `scripts/build.mjs`
  - Replaced the seven service-area route image mappings with dedicated city image pairs.
  - Added the new responsive 4:3 city-card markup on `/service-areas`.
  - Kept the seven decorative city emblems and 23-city coverage ledger intact.
  - Cleaned the deferred alt text strings for industrial NDT, lab silver, and mixed X-ray copy.
- `src/style.css`
  - Reworked the service-area grid into separated paper cards with bordered 4:3 media.
  - Added `city-artifact-picture` responsive crop styling and image hover motion.
- `package.json`
  - Added the new service-area image contract to the default test run and `test:service-areas`.
- `tests/service-area-image-contract.test.mjs`
  - Added image-pair, responsive markup, 4:3 dimension, retired-filename, and exact 23-link coverage-ledger assertions.
- `tests/service-area-artifacts-contract.test.mjs`
  - Updated the routed city-image expectations to the new service-area basenames and exact 23-link coverage-ledger assertions.
- `tests/assay-production-contract.test.mjs`
  - Corrected the homepage CTA exact string to Title Case so the verification chain stays aligned with the route-wide Title Case standard.
- `assets/material-masters/service-area-*-master.png`
  - Added the seven approved source masters copied from the generated hyper-realistic city scenes.
- `assets/service-area-*-1280.webp`
- `assets/service-area-*-800.webp`
  - Added the derived responsive WebP pairs for Houston, Pearland, Pasadena, Sugar Land, Katy, The Woodlands, and Conroe.

## TDD Evidence

- RED: `node --test tests/service-area-image-contract.test.mjs`
  - Exit `1`.
  - Failed for missing city image pairs, old 1280x819 route heroes, missing separated-card CSS, and retired material-photo references.
- GREEN: `node scripts/build.mjs && node --test tests/service-area-image-contract.test.mjs tests/service-area-artifacts-contract.test.mjs`
  - Exit `0`.
  - All 10 focused service-area tests passed after the image, markup, and CSS changes.

## Verification Commands And Results

- Focused contracts: `node scripts/build.mjs && node --test tests/service-area-image-contract.test.mjs tests/service-area-artifacts-contract.test.mjs`
  - Exit `0`; 10 passed, 0 failed.
- Full repository verification: `npm run verify`
  - Exit `0`; build passed, `npm test` passed, `npm run test:assay` passed, `npm run check` passed, and `node scripts/verify.mjs` returned `AG_REFINING_VERIFY_OK`.
- Browser smoke: `node tests/site-chrome-browser.mjs`
  - Exit `0`; `SITE_CHROME_BROWSER_OK`.
- Cinematic browser matrix rerun: `npm run test:browser`
  - Exit `1`; the static, reduced-motion, save-data, autoplay, visibility, and most viewport interaction stages ran, but Playwright still hit a browser-process closure during the mobile interactions navigation wait.

## Self-Review Findings

- Confirmed all seven new route heroes now emit `picture` markup with exact `1280x960` / `800x600` WebP pairs.
- Confirmed `/service-areas` now renders seven bordered card links with responsive city imagery while preserving route order and the 23-city ledger as literal canonical anchors.
- Confirmed the legacy arbitrary service-area material filenames are absent from the service-area index and routed city pages.
- Confirmed the deferred alt-text cleanup removed the stale `Labeled` and `archive boxes` wording.
- Confirmed generated browser capture artifacts were restored and left out of the commit.

## Fix Round: Browser Root Cause And Review Updates

- Browser root-cause hypothesis
  - The cinematic browser harness was bootstrapping Sparticuz Chromium with only `FONTCONFIG_PATH` pointed at the extracted font directory, while the passing `site-chrome-browser` flow writes a real `fonts.conf` and exports both `FONTCONFIG_PATH` and `FONTCONFIG_FILE`.
  - Evidence: a bare mobile Playwright repro against `/contact/` and `/contact?intent=pickup` crashed immediately with `page.goto: Target page, context or browser has been closed`, while the same minimal repro passed after copying the `site-chrome-browser` fontconfig bootstrap and reported `HOME_OK` then `CONTACT_OK`.
- RED reproduction
  - Plain mobile Chromium repro before the fix:
    - `/contact/` → `page.goto: Target page, context or browser has been closed`
    - `/contact?intent=pickup` → `page.goto: Target page, context or browser has been closed`
    - `/accepted-materials` loaded successfully in the same debug harness, which isolated the failure to the contact-route load path in the cinematic harness environment.
- Minimal fix
  - Updated `tests/cinematic-hero-browser.mjs` so `pinnedChromiumExecutable()` now mirrors the working `site-chrome-browser` bootstrap:
    - creates `fontconfig/fonts.conf`
    - points `FONTCONFIG_PATH` at that config directory
    - exports `FONTCONFIG_FILE`
- Exact green commands and outputs
  - `node tests/site-chrome-browser.mjs`
    - Exit `0`; `SITE_CHROME_BROWSER_OK`
  - `AG_REFINING_BROWSER_VIEWPORT=compact-desktop AG_REFINING_BROWSER_STAGE=interactions node tests/cinematic-hero-browser.mjs`
    - Exit `0`; `[browser] passed compact-desktop`
  - `AG_REFINING_BROWSER_VIEWPORT=mobile AG_REFINING_BROWSER_STAGE=interactions node tests/cinematic-hero-browser.mjs`
    - Exit `0`; `[browser] passed mobile`
- 23-link evidence
  - Both service-area contract suites now assert the exact 23 canonical city anchors and hrefs rendered inside `data-service-coverage`, not just `<li>` count.
  - The coverage ledger remains literal canonical links while the seven featured 4:3 city cards stay intact.
- Test update note
  - The assay exact-string change is kept and documented as direct Title Case regression alignment for the route-wide standard required by the verification chain, not as unrelated feature work.
- Commit
  - Final fix commit hash is reported in the task handoff response.

## Concerns

- The new The Woodlands 1280 WebP is the heaviest of the seven service-area derivatives at roughly 262 KB. It is still acceptable, but it is the first candidate to recompress if stricter page-weight targets are introduced later.
