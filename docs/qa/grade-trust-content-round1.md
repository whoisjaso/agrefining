# Trust-content grade - round 1

Date: 2026-08-04
Grader: `/root/grade_trust_content_r1`
Scope: `AGQA-CLAIM-001`, `AGQA-PRIV-001`, `AGQA-CLAIM-002`, `AGQA-PRIV-002`, and `AGQA-MED-001`

## Verdict

**PASS: 5 of 5 findings.** The generated implementation resolves each audited defect, the source and all 39 generated HTML documents are free of the prohibited claims, the disclosure matches the attribution collected by the site, and the hospital hero places the protected-record boundary before its material-prefilled pickup action. Each focused regression was independently mutation-tested and failed when its original defect was reintroduced.

## Evidence reviewed

- Read `docs/qa/audit-trust-conversion.md`, `docs/qa/adversarial-persona-ledger.md`, and `docs/qa/fix-trust-content.md` in full.
- Reviewed the complete diffs of `scripts/build.mjs` and `scripts/verify.mjs`.
- Rebuilt all generated output and ran the focused verifier:

```text
npm run build && node scripts/verify.mjs && git diff --check
Verified 12 production assets
Built 38 public pages in dist
AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)
Exit code: 0
```

- Ran an independent scan over every generated HTML document, including title, description, Open Graph metadata, JSON-LD, and body markup:

```text
Generated HTML inspected: 39
Residual prohibited matches: 0
Source exact_timing matches: 0
Source unsupported_value matches: 0
Source absolute_confidentiality matches: 0
```

- The broader adjacent-phrase scan also found no `instant`, `same day`, `on the spot`, `top`, `best`, `highest`, `full value`, `competitive`, `no hidden fee`, or equivalent Spanish exact-timing variants in generated HTML.
- Independently mutation-tested the generated fixtures in an isolated temporary tree. Each mutation exited `1` with the intended focused verifier message:

```text
AGQA-CLAIM-001: MUTATION_CAUGHT
AGQA-CLAIM-002: MUTATION_CAUGHT
AGQA-PRIV-001: MUTATION_CAUGHT
AGQA-PRIV-002: MUTATION_CAUGHT
AGQA-MED-001: MUTATION_CAUGHT
```

## Finding grades

### AGQA-CLAIM-001 - PASS

The unqualified `immediate payment`, `same-day`, `pay on the spot`, and `pago inmediato` promises are absent from `scripts/build.mjs` and from all 39 generated documents, including metadata. The affected English routes now say that payment timing or terms are confirmed with the offer and depend on the approved material and transaction. `/espanol` now says `El plazo de pago se confirma con la oferta...`, which preserves the same conditional boundary.

The regression scans all generated markup for each original exact-timing form. Replacing the homepage trust fact with `Immediate payment` caused the focused verifier to fail with `Generated pages contain an unqualified exact payment-timing claim`.

Actionable critique: none required for this finding.

### AGQA-PRIV-001 - PASS

The jewelry-store route no longer promises that inventory and volumes `stay between us`. Its replacement states the operational purpose of the data and links directly to `/privacy`: `We use inventory and volume details to review your request and plan service.` This removes the absolute confidentiality boundary instead of substituting another unsupported promise.

The generated jewelry-store page contains the qualified wording and no absolute-confidentiality match. Reintroducing the original promise caused the focused verifier to fail with `Jewelry-store page contains an absolute confidentiality promise`.

Actionable critique: none required for this finding.

### AGQA-CLAIM-002 - PASS

The affected route titles, descriptions, reasons, and body copy replace `top prices`, `top value`, `competitive pricing`, `recover the full value`, and `No hidden fees` with concrete evaluation inputs such as confirmed silver content, purity, weight, condition, and current market values. The full generated scan found zero prohibited value or fee matches in body or metadata.

Reintroducing `Competitive pricing` on the coin route caused the focused verifier to fail with `Generated pages contain an unsupported price, fee, or full-value superlative`.

The extra edited descriptions for laboratory silver, dental scrap, batteries, X-ray services, and silver bars are within the same claim-discipline scope; they remove adjacent unsupported value language rather than creating unrelated churn.

Actionable critique: none required for this finding.

### AGQA-PRIV-002 - PASS

The implementation and disclosure agree:

- `src/site.js` sends `submission_page`, the first-touch `landing_page`, `referrer`, UTM fields, `gclid`, and `fbclid`.
- The contact form and privacy page both name the `form page`, `first landing page`, `referring page`, and `campaign or ad identifiers`.
- Both generated notices state that these fields are sent with the request.

The generated check reported all four disclosure terms in both documents. Removing `first landing page` from the contact notice caused the focused verifier to fail with `Contact and privacy notices must disclose the first landing page`.

Actionable critique: none required for this finding.

### AGQA-MED-001 - PASS

The hospital hero now presents this guardrail before the primary pickup action:

```text
Do not upload patient information or readable X-ray images. Confirm your organization's record-retention and privacy duties before transfer.
```

The same sentence links to `/medical-x-ray-recycling`, and the immediately following pickup action preselects `material=xray_film`. Generated ordering inspection confirmed the guardrail precedes the action in `service-hero-copy`.

Replacing the guardrail's required phrase caused the focused verifier to fail with `Hospital hero must show the protected-record guardrail before its pickup action`.

Actionable critique: none required for this finding.

## Scope and copy review

The production-source diff is confined to the generator copy and the generated-output verifier. All generator edits map to one of the five graded findings. No API contract, client attribution collection, route inventory, sitemap count, or unrelated page structure changed in this batch. The revised language is internally consistent: evaluation claims name their inputs, payment language remains conditional, privacy wording names the data that accompanies a request, and the hospital action has a visible healthcare boundary.

## Grade recommendation

Close all five findings for round 1. No repair round is required for this batch.
