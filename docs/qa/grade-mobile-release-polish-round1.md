# Mobile release polish independent grade - round 1

Date: 2026-08-04

Final verdict: PASS

The bounded mobile release-polish correction closes all four audited findings. No production or test file was edited by this grader. The only repository file written by the grader is this report. Temporary browser and mutation evidence is under `/tmp`.

## Finding verdicts

| Finding | Verdict | Independent evidence |
| --- | --- | --- |
| MOBILE-P1-001 | PASS | Both hidden surfaces computed to `display: none` with zero-area rectangles in all 117 mobile render cases. Direct focus attempts against all 819 surface descendants produced zero successes. Complete sequential Tab cycles on the 404 page at all three widths exposed 13 visible document controls and no descendant of either hidden surface. |
| MOBILE-P1-002 | PASS | The complete English and Spanish forms were traversed at 320x800, 390x844, and 768x1024. The six runs covered 210 visible label, legend, field, validation-summary, validation-link, privacy-link, status, and submit landmarks. Fixed-surface intersection area was zero for every landmark. |
| MOBILE-P2-003 | PASS | `.material-guide` was absent from layout and interaction at every mobile width and on every route. It had zero width, zero height, no exposed focusables, no programmatic focus success, and zero text or target collisions. Its desktop behavior remained available at 901 and 1440 pixels. |
| MOBILE-P2-004 | PASS | `.mobile-actions` was absent from layout and interaction at every mobile width and on every route. It had zero width, zero height, no exposed focusables, no programmatic focus success, and zero text or target collisions. Every route retained an in-flow conversion or contact path. |

## Fresh build and environment

The grade used a fresh `npm run verify` build before browser inspection.

- Chromium: 149.0.7827.0
- Node: v24.14.0
- Published corpus: 39 HTML documents, 38 indexed routes
- Mobile viewports: 320x800, 390x844, and 768x1024
- Desktop viewports: 901x900 and 1440x960
- Input profile on mobile: touch enabled, reduced motion, light color scheme
- Browser services: local static/API test server; no production lead submission

The fresh verification command passed 15 of 15 shared tests, 17 of 17 assay tests, `AG_REFINING_CHECK_OK`, and `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`.

## Mobile route matrix

Every one of the 39 HTML documents was loaded at each of the three mobile viewports, for 117 rendered cases.

The per-case gate asserted:

- HTTP 200 and completed navigation enhancement
- zero horizontal overflow
- `.mobile-actions` computed `display: none`
- `.material-guide` computed `display: none`
- zero-area rectangles for both surfaces
- zero exposed sequential focusables under both surfaces
- zero successful direct-focus attempts under both surfaces
- zero intersections with visible main/footer text and interactive/form targets
- no console error or uncaught page error
- at least one visible, in-flow conversion or contact path appropriate to the document
- closed mobile navigation remained inert and removed its CTA from the Tab order
- open mobile navigation exposed a visible, at least 44px-high, topmost pickup CTA
- Escape and scrim closure each returned focus to the menu toggle

Aggregate result:

- 117 of 117 mobile render cases passed
- 117 of 117 in-flow conversion/contact path checks passed
- 117 of 117 mobile-menu CTA and focus-return checks passed
- 0 horizontal-overflow cases
- 0 text or target collisions
- 0 topmost collisions
- 0 console/page-error cases
- 0 successful programmatic focus attempts among 819 hidden-surface descendants

The current documents produced 5,210 candidate landmark/interval scroll stops using the original audit calculation. The first full-width rerun exercised all 1,910 calculated stops at 320x800 and found zero product failures. Once every route proved that both collision sources computed to `display: none` with zero-area rectangles, the final deterministic run collapsed the remaining scroll checks to document start/end positions. This preserved the geometric proof while avoiding redundant scans of a non-rendered rectangle. The final run sampled 3,562 visible text rectangles and 5,108 visible target rectangles across 233 actual positions, with zero collisions.

The route-path assertion was not satisfied by fixed chrome or hidden navigation. It required an in-flow form, contact link, telephone link, Spanish request anchor, or the 404 material-discovery link. The minimum was one qualifying path per document. Examples include the review form plus telephone link on `/contact`, the Spanish form plus `#solicitud` and telephone paths on `/espanol`, a telephone path on `/privacy`, and `View materials` on the 404 document.

## Complete 404 keyboard path

The 404 document was traversed through a complete sequential Tab cycle at each mobile viewport. Each run visited 13 unique visible document controls before wrapping. The path included the skip link, brand, menu toggle, visible main `View materials` action, and footer links.

At every focus stop:

- the element was rendered and visible inside the viewport after browser focus scrolling
- no `[hidden]` or `[inert]` ancestor was present
- no `.mobile-actions` or `.material-guide` ancestor was present
- display, visibility, and opacity remained exposed

The normal browser-chrome boundary between the last and first document control was ignored as a boundary, not counted as a page focus stop. No invisible page stop was found.

## English and Spanish form traversal

The empty enhanced form submit path was invoked locally to render the validation summary and field error links without sending a valid lead. The grader then traversed every audited landmark on `/contact` and `/espanol` at all three mobile widths.

Each of the six runs covered 35 landmarks, including:

- all visible labels and the preferred-contact legend
- every non-hidden input, select, textarea, and radio control
- the visible validation summary and its field links
- the privacy link
- the submit button and status region

All 210 landmark checks had zero overlap with the two removed mobile surfaces. Both form routes also retained zero horizontal overflow and zero console/page errors.

## Mobile menu preservation

The shared navigation was exercised on every route at every mobile width, not only on representative pages.

In the closed state, the navigation had `inert`, `aria-hidden="true"`, and a `-1` CTA tab index. In the open state, its pickup CTA was within the viewport, topmost at its center point, interactive, and at least 44px high. English pages linked to `/contact?intent=pickup`; the Spanish page linked to `#solicitud`.

For every one of the 117 cases, the grader performed both closure paths:

1. Focus the open-menu CTA and press Escape.
2. Reopen the menu and activate the scrim outside the sheet.

Both paths closed the menu and returned focus to the toggle in all cases.

## Desktop material guide preservation

The guide was tested at the exact desktop boundary, 901x900, and again at 1440x960.

At both widths:

- `.material-guide` computed to `display: block` and was visible
- `.mobile-actions` computed to `display: none` with zero area
- the guide opened from its summary
- the 336x315px panel stayed fully inside the viewport
- the summary and panel had zero geometric overlap with the desktop header/navigation
- exactly four guide links were keyboard reachable in sequence
- every link was topmost at its center and stayed inside the viewport
- Escape closed the guide and returned focus to its summary
- a click on the page outside the guide closed it
- horizontal overflow and console/page errors remained zero

The four reachable paths were `/accepted-materials`, `/how-it-works`, `/contact`, and `tel:+12818982719`.

## Mutation sensitivity

Two isolated copies of the fresh generated output were created under `/tmp`. Production files were not mutated.

1. Mobile actions mutation: changed the mobile `.mobile-actions` value from `none` to `flex` while leaving the guide hidden.
   - Result: exit 1, 6 passed and 1 failed.
   - Expected failure: `320px: mobile actions must not occupy or cover the reading workspace` with actual `flex`, expected `none`.

2. Material guide mutation: changed the mobile `.material-guide` value from `none` to `block` while leaving mobile actions hidden.
   - Result: exit 1, 6 passed and 1 failed.
   - Expected failure: `320px: material guide must not occupy or cover the reading workspace` with actual `block`, expected `none`.

These failures prove that the generated contract detects independent reintroduction of either fixed mobile surface.

## Release decision

PASS. MOBILE-P1-001, MOBILE-P1-002, MOBILE-P2-003, and MOBILE-P2-004 are closed by independent rendered evidence. The correction preserves mobile conversion through in-flow content and the mobile navigation CTA, while preserving the desktop material guide at and above the 901px breakpoint.

No further correction is requested for this bounded batch.
