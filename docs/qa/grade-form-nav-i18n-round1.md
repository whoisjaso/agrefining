# Independent grade: form, navigation, Spanish journey, and touch -- round 1

Date: 2026-08-04
Grader: `/root/grade_form_nav_i18n_r1`
Implementation under grade: `/root/fix_form_nav_i18n`

## Integrity verdict

**Round 1 verdict: FAIL -- one bounded P2 regression-integrity defect remains.**

The current rendered repair works for all four findings. Native and enhanced form recovery, mobile navigation state, Spanish continuity, and the coarse-pointer hit area all passed direct browser checks. However, the automated coarse-pointer regression is not mutation-sensitive: changing the exact preferred-contact `min-height` from `44px` to `40px` in an isolated generated copy still leaves `tests/generated-interaction-contract.test.mjs` green. The regex escapes the preferred-contact declaration block and finds a later unrelated `min-height: 44px` rule. Because the requested release process requires a meaningful regression for every repair, `AGQA-TOUCH-001` is graded FAIL until that guard is corrected and re-mutated.

There is no reproduced user-facing Critical, High, or Medium defect in this batch.

| Dimension | Score | Evidence |
|---|---:|---|
| Accessibility | 4/4 | Native validation, linked recovery errors, closed-menu focus exclusion, open-menu focus containment, Escape return, and 44px rendered targets passed. |
| Performance | 4/4 | The repair adds no blocking client dependency; the static path remains usable before `site.js`. |
| Theming | 4/4 | Static and API-rendered recovery pages use the existing Silver Atelier stylesheet and shared form renderer. |
| Responsive resilience | 3/4 | Current mobile and desktop behavior passed. The touch regression itself is not adequately guarded. |
| Implementation integrity | 3/4 | Shared bilingual rendering and negotiated API responses are coherent; one test can produce a false green. |
| **Total** | **18/20** | Strong current implementation, not yet a clean regression grade. |

## Finding verdicts

| Finding | Severity at regrade | Verdict | Release interpretation |
|---|---:|---|---|
| `AGQA-FORM-001` | Former High | **PASS** | Closed by static, API, mutation, and rendered-browser evidence. |
| `AGQA-NAV-001` | Former High | **PASS** | Closed by no-script and enhanced mobile browser evidence. |
| `AGQA-I18N-001` | Former High | **PASS** | Closed by generated, API, mutation, and rendered Spanish-path evidence. |
| `AGQA-TOUCH-001` | P2 regression integrity; current UI passes | **FAIL** | Current targets are correct, but the automated regression does not detect removal of the required 44px height. |

## Fresh repository evidence

`npm run verify` completed with exit 0:

```text
tests 14
pass 14
fail 0
AG_REFINING_CHECK_OK
AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)
```

A final focused rerun of `npm test` again reported 14/14 passing, and `git diff --check` exited 0.

The grade used generated output from the authoritative build. No file in `dist/` was edited by hand, no real lead was submitted, and every browser delivery path was restricted to a loopback server with the Resend boundary disabled or stubbed.

## `AGQA-FORM-001` -- PASS

### Static and enhanced form contract

- The generated English form has `action="/api/leads"`, `method="post"`, `locale=en`, native required/email/minimum-length constraints, and no source `novalidate`.
- With page JavaScript disabled at 390px, the form reported `noValidate: false` and no enhancement marker.
- Activating an empty native form made no `/api/leads` request, kept the visitor on `/contact`, focused `#name`, and exposed the browser's missing-value state.
- With JavaScript enabled, `site.js` attaches input and submit handlers before setting `form.noValidate = true` and `data-enhanced=true`.

### Native HTML recovery

The local browser exercised synthetic, non-delivering submissions through the actual handler:

- **422:** rendered `data-lead-result="validation"`, linked errors including `href="#phone"`, a retry form with preserved safe values, and escaped an input containing a literal script tag.
- **503:** rendered `data-lead-result="delivery-failure"`, the AG Refining phone link, and a prefilled `mailto:` containing the submitted material and location; no outbound delivery call occurred.
- **502:** with the local delivery boundary stubbed to return failure, rendered the same phone/email/form recovery surface.
- **303:** with the local delivery boundary stubbed successful, the POST produced 303 and finished at `/api/leads?status=received&lang=en`. The final URL and receipt HTML contained none of the synthetic name, business, email, or location values; the receipt was `noindex,nofollow`.

### API compatibility and defensive states

The black-box API suite independently passed:

- escaped native validation HTML;
- 502/503 native recovery;
- private POST/Redirect/GET receipt;
- Spanish validation and failure HTML;
- backward-compatible `{ ok: true }`, `{ message, fields }`, and `{ message, fallback_email }` JSON;
- safe content-negotiation defaults;
- recoverable malformed and oversized bodies;
- honeypot suppression without outbound delivery.

## `AGQA-NAV-001` -- PASS

### No-script mobile state

At 390px with JavaScript disabled:

- the enhancement toggle and scrim were hidden;
- the navigation was visible in normal flow, not inert, and had no `aria-hidden`;
- all six navigation links were rendered with non-negative tab indices;
- keyboard order reached `/accepted-materials`, `/industries`, `/service-areas`, `/how-it-works`, `/about`, and the pickup action.

### Enhanced mobile state

At 390px with JavaScript enabled:

- the closed menu was `inert`, `aria-hidden="true"`, and every link had `tabIndex=-1`;
- fourteen consecutive Tab stops included the menu toggle but no element inside the closed navigation;
- opening set `aria-expanded="true"`, removed inert/`aria-hidden`, locked body scrolling, inerted main/footer/mobile actions/material guide, and moved focus to `Materials`;
- Shift+Tab from the toggle wrapped to the final menu link, and Tab from that link wrapped to the toggle;
- Escape closed the menu and returned focus to the toggle;
- activating the scrim closed the menu and returned focus;
- resizing an open menu to 1024px cleared body-open, inert, `aria-hidden`, background inert, and temporary tab-index state; resizing back to 390px restored the closed mobile contract.

## `AGQA-I18N-001` -- PASS

The Spanish browser path verified:

- `<html lang="es">`, `Saltar al contenido`, `locale=es`, and an in-page enhanced form;
- all three sampled pickup actions remained `#solicitud` rather than switching to `/contact`;
- Spanish header destinations visibly contained `en ingles` and `hreflang="en"`;
- Spanish footer, material-guide, privacy, and form English-only destinations carried the same visible disclosure;
- empty enhanced submission focused the Spanish error summary and marked `name`, `phone`, `email`, `material`, `location`, and `details` invalid;
- a local enhanced 503 rendered Spanish setup/fallback copy and a Spanish prefilled email action, with no English recovery heading and no outbound call.

The native API suite also passed Spanish 422 and 503 HTML, Spanish field messages, and return links to `/espanol#solicitud`.

## `AGQA-TOUCH-001` -- FAIL on regression integrity

### Current rendered behavior -- PASS

In Chromium with a real coarse-pointer mobile context:

- `(pointer: coarse)` matched;
- the Phone label measured approximately `94.05 × 44` CSS px;
- the Email label measured approximately `158.13 × 44` CSS px;
- tapping the Email label near its far edge, outside the 16px radio glyph, selected the radio.

### Automated guard -- FAIL

An isolated copy changed only this declaration:

```css
.preferred-contact label {
  min-height: 40px;
  min-width: 44px;
}
```

`node --test tests/generated-interaction-contract.test.mjs` still exited 0. The test's pattern begins at `.preferred-contact label` but permits `min-height: 44px` to be found after that rule's closing brace in a later coarse-pointer selector. It therefore does not prove that the preferred-contact label itself retains a 44px minimum height.

## Mutation-sensitivity results

All mutations were applied only to temporary copies.

| Isolated mutation | Expected guard | Result |
|---|---|---|
| Re-add static `novalidate` | Native-validation generated contract | **Expected failure observed** |
| Expose the enhancement-only menu toggle | All-header no-script contract | **Expected failure observed** |
| Route a Spanish pickup action to `/contact?intent=pickup` | Spanish journey contract | **Expected failure observed** |
| Force native submissions to receive JSON | Native 422/503 API contracts | **Expected failure observed** |
| Add `name=Maria` to the receipt redirect | Private 303 contract | **Expected failure observed** |
| Change preferred-contact `min-height` from 44px to 40px | Coarse-pointer generated contract | **Unexpected pass -- defect** |

## Responsive and browser coverage boundary

The browser harness evaluated `/`, `/contact`, and `/espanol` at 320, 390, 768, 901, 1024, and 1440px, using no-script contexts through 768px and enhanced contexts from 901px upward. Every document/body width assertion completed before teardown and found no horizontal overflow.

The temporary serverless Chromium build then reported `Target page, context or browser has been closed` while the harness was closing its multiple contexts. The stack location was the cleanup loop after all route/width assertions, not a page assertion or site runtime action. It is documented as a harness-cleanup limitation, not counted as a product pass beyond the width assertions already completed. No additional visual clipping claim is made.

## Bounded correction for round 2

1. Replace the coarse-pointer regex with a block-bounded assertion that extracts the `.preferred-contact label { ... }` declaration inside `@media (pointer: coarse)` and asserts both `min-height: 44px` and `min-width: 44px` within that exact block.
2. Re-run the isolated 44px-to-40px mutation and require the named touch-target test to fail, then restore and require `npm run verify` plus `git diff --check` to pass.

No production CSS change is required by the current evidence. A fresh grader should grade only the corrected regression and its red/green mutation before closing `AGQA-TOUCH-001`.
