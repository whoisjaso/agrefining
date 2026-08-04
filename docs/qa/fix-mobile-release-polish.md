# Mobile release polish implementation evidence

Date: 2026-08-04

Status: Ready for independent grading. This report is implementation evidence, not a self-grade.

## Scope and decision

The bounded release-polish decision is implemented at `max-width: 900px`:

- `.mobile-actions` computes to `display: none`.
- `.material-guide` computes to `display: none`.
- The obsolete mobile body bottom reservation and footer bottom reservation were removed.
- Dead narrow-screen material-guide positioning was removed.
- The desktop material guide remains unchanged above 900px.
- No JavaScript, form, API, build, package, or 3D production source was changed for this fix.

The mobile menu still contains the global pickup CTA, and generated pages retain their in-flow CTA and contact paths.

## Test-driven evidence

The semantic generated-CSS contract was added before the production CSS change.

RED command:

`npm run build && node --test tests/generated-interaction-contract.test.mjs`

RED result: 6 passed, 1 failed. The intended failure was:

`320px: mobile actions must not occupy or cover the reading workspace; actual flex, expected none`

After the minimal CSS change, the same command passed 7 of 7 tests.

The contract evaluates generated CSS cascade behavior at 320, 390, 768, and 900 pixels with a coarse-pointer profile. It also requires the material guide to remain `block` at 1440 pixels with a desktop input profile.

## Browser evidence

The existing local Chromium binary at `/tmp/chromium` was exercised against a local server built from current `dist` output. Evidence JSON is at `/tmp/ag-mobile-release-verify.json`.

| Viewport | Hidden surfaces | Focusable descendants | Form intersections | Overflow | In-flow CTAs | Mobile menu CTA | Errors |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: |
| 320x800 | both `display: none`, zero-area rects | 0 | 0 | 0px | contact 2, home 11 | 283x44.86px, topmost, navigated | 0 |
| 390x844 | both `display: none`, zero-area rects | 0 | 0 | 0px | contact 2, home 11 | 353x44.86px, topmost, navigated | 0 |
| 768x1024 | both `display: none`, zero-area rects | 0 | 0 | 0px | contact 2, home 11 | 707x44.86px, topmost, navigated | 0 |

At every mobile width, 24 sequential Tab presses on the 404 route produced zero focus entries inside either hidden surface. Direct focus attempts also produced zero focus successes. Contact form controls had zero geometric intersections with either surface by construction.

At 1440x960, the desktop material guide computed to `block`, its summary was visible, it opened successfully, its panel was visible, and all 4 guide links remained present. The desktop check produced zero console or page errors and zero horizontal overflow.

## Mutation evidence

Two isolated copies of generated CSS were mutated under `/tmp/ag-mobile-mutation.2VaMp7`:

- Changing the mobile action surface to `display: flex` failed the contract with the expected mobile-actions assertion.
- Changing the mobile material guide to `display: block` failed the contract with the expected material-guide assertion.

Both mutation runs exited with status 1. The unmutated contract passes.

## Fresh verification

`npm run verify` completed with exit status 0:

- 15 of 15 general tests passed.
- 17 of 17 assay tests passed.
- `AG_REFINING_CHECK_OK`.
- `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`.

`git diff --check` completed with exit status 0.

## Files in this bounded change

- `src/style.css`
- `tests/generated-interaction-contract.test.mjs`
- `docs/qa/fix-mobile-release-polish.md`

The fresh grader should perform the full 39-route mobile crawl and independently decide the release grade.
