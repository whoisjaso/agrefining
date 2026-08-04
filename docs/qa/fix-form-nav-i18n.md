# Form, navigation, Spanish, and touch remediation evidence

Date: 2026-08-04
Implementer: `/root/fix_form_nav_i18n`
Status: **READY FOR GRADE**

## Scope

This batch addresses:

- `AGQA-FORM-001`
- `AGQA-NAV-001`
- `AGQA-I18N-001`
- `AGQA-TOUCH-001`

It preserves the 38 indexed routes, `dist/404.html`, `/api/leads`, the enhanced JSON response shapes, and the existing trust-copy remediation.

## Test-first RED evidence

The regression files were created before production changes.

Baseline build:

```text
Verified 12 production assets
Built 38 public pages in dist
```

`node --test tests/generated-interaction-contract.test.mjs`:

```text
tests 6
pass 1
fail 5
```

The failing contracts demonstrated:

- static `novalidate` and no locale value in the form contract;
- enhancement controls exposed before listeners existed;
- no Spanish in-page form and an English contact destination;
- English labels in Spanish shared chrome;
- no 44px coarse-pointer preferred-contact target.

`node --test tests/leads-response.test.mjs`:

```text
tests 8
pass 1
fail 7
```

The existing enhanced JSON compatibility test passed. The seven native/browser contracts failed for the intended legacy behavior, including raw URL-encoded bodies returning 400 JSON, native success not delivering and not redirecting, no Spanish HTML branch, and oversized requests returning raw JSON rather than recovery actions.

## Implemented behavior

### `AGQA-FORM-001`

- Added `src/review-form.mjs` as the shared, escaped, bilingual form renderer.
- Source forms keep native `required`, email, and minimum-length validation and contain no static `novalidate`.
- `site.js` sets `noValidate` only after input and submit listeners are attached.
- `/api/leads` now accepts Vercel-parsed objects, raw JSON, and raw URL-encoded bodies.
- Native forms receive escaped HTML validation pages with preserved safe values and linked field errors.
- HTML 502/503 pages retain actionable phone, prefilled email, and return-to-form recovery.
- Native success and suppressed honeypot submissions use a 303 redirect to a noindex receipt that contains no lead data.
- The enhanced fetch path retains `{ ok: true }`, `{ message, fields }`, and `{ message, fallback_email }` JSON contracts.
- Malformed, oversized, and method-error HTML requests receive human-readable recovery pages.

### `AGQA-NAV-001`

- Menu toggle and scrim start hidden in all 39 static documents.
- Without enhancement, mobile links remain visible in normal flow and the expanded header is non-sticky.
- After all listeners attach, the header receives `data-nav-enhanced="true"` and the off-canvas menu activates.
- Enhanced mobile closed state uses both `inert` and `aria-hidden`, plus exact stored-tabindex restoration as a fallback.
- Open state restores controls, focuses the first link, contains focus, inerts background regions, and locks body scroll.
- Escape and scrim close with focus return. Link activation closes without focus theft.
- Desktop and mobile media changes clear or restore inert, aria, tabindex, background, and scroll state.

### `AGQA-I18N-001`

- `/espanol` now has localized skip text, utility copy, nav labels and accessible names, mobile actions, footer, material guide, contact aside, form, and client states.
- Every Spanish pickup action targets `#solicitud` on the same page.
- The embedded form sends `locale=es` and uses Spanish labels, options, validation, status, success, and recovery copy.
- English-only destinations are marked `hreflang="en"` with a visible `en ingles` note.
- Native 422, 502/503, request-error, and receipt pages retain `lang="es"` and return to `/espanol#solicitud`.

### `AGQA-TOUCH-001`

- Preferred-contact labels are full native radio labels with pointer affordance.
- Coarse pointers receive a minimum 44px by 44px label target and vertical padding.

## Regression mutation coverage

| Mutation | Guard |
|---|---|
| Restore static `novalidate` | static native-validation contract |
| Expose toggle/scrim before enhancement | all-header fallback contract |
| Route Spanish pickup to English contact | Spanish journey contract |
| Restore English shared labels | Spanish shared-chrome contract |
| Remove 44px target | coarse-pointer CSS contract |
| Return JSON to native forms | native 422/503 response contracts |
| Put lead values in receipt URL | native 303 contract |
| Break enhanced fetch responses | enhanced JSON compatibility contract |
| Reflect unsafe preserved text | escaped HTML recovery contract |
| Deliver honeypot input | no-fetch honeypot contract |

## Intentional plan clarification

The plan's sample static-form test matched only the opening `<form>` tag and then asserted that the hidden locale input was inside that match. The selector was corrected to match the complete form element. The hidden-locale assertion was retained unchanged, so this correction strengthens the intended behavior instead of weakening it.

## Changed files

- `tests/leads-response.test.mjs`
- `tests/generated-interaction-contract.test.mjs`
- `src/review-form.mjs`
- `package.json`
- `scripts/build.mjs`
- `src/site.js`
- `src/style.css`
- `api/leads.js`
- `docs/qa/fix-form-nav-i18n.md`

## GREEN evidence

Focused API contract:

```text
tests 8
pass 8
fail 0
```

Focused generated contract:

```text
tests 6
pass 6
fail 0
```

Repository release gate:

```text
npm run verify
tests 14
pass 14
fail 0
AG_REFINING_CHECK_OK
AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)
```

Whitespace gate:

```text
git diff --check
exit 0
```

Rendered focus cycles, actual coarse-pointer dimensions, off-glyph taps, and 320/390/768/901/1024 viewport behavior remain assigned to the independent grader as required by the remediation plan.
