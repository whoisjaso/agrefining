# Trust-content repair evidence

Date: 2026-08-04
Implementer: `/root/fix_trust_content`
Round: 1

## Scope

- `AGQA-CLAIM-001`: remove unqualified immediate and same-day payment timing.
- `AGQA-PRIV-001`: replace the absolute inventory-confidentiality promise with handling language tied to the privacy notice.
- `AGQA-CLAIM-002`: replace unsupported top-price, competitive-price, full-value, and no-hidden-fee claims with confirmed evaluation facts.
- `AGQA-PRIV-002`: disclose the form page, first landing page, referring page, and supported campaign or ad identifiers that accompany a lead.
- `AGQA-MED-001`: put the protected-record boundary and medical-film route before the hospital pickup action.

## RED evidence

The regression assertions were added to `scripts/verify.mjs` before any production-source change. The mutation each assertion catches is a generated page reintroducing an exact timing promise, unsupported value comparison, absolute confidentiality claim, incomplete attribution notice, or hospital pickup action without the record boundary.

Command:

```text
node scripts/verify.mjs
```

Exit code: `1`

Expected failure output:

```text
Homepage is missing: <meta name="description" content="Sell silver in Houston with AG Refining. Free pickup, on-site weighing, honest pricing, and payment terms confirmed with the offer.">
sell-silver-coins-houston: missing exact SEO field <title>Sell Silver Coins in Houston | Clear Evaluations | AG Refining</title>
sell-silver-coins-houston: missing exact SEO field <meta name="description" content="Sell silver coins in Houston with clear evaluations based on coin type, silver content, weight, condition, and current market values.">
silver-flake-buyer-houston: missing exact SEO field <meta name="description" content="Sell silver flake in Houston with an evaluation based on confirmed silver content, purity, weight, condition, and current market values.">
laboratory-silver-buyer-houston: missing exact SEO field <meta name="description" content="Sell laboratory silver in Houston with evaluations based on confirmed recoverable silver, material condition, and current market values.">
silver-solder-buyer-houston: missing exact SEO field <meta name="description" content="Sell silver solder in Houston with evaluations based on alloy, silver content, weight, condition, and current market values.">
dental-scrap-buyer-houston: missing exact SEO field <meta name="description" content="Sell dental scrap in Houston with material review, free qualifying pickup, on-site service, and pricing based on confirmed precious-metal content.">
silver-oxide-watch-battery-recycling-houston: missing exact SEO field <meta name="description" content="Recycle silver oxide watch batteries in Houston with material review, qualifying pickup, and recovery based on confirmed content and condition.">
houston-silver-buyer: missing exact SEO field <meta name="description" content="Sell silver in Houston with AG Refining. Free pickup, on-site weighing, honest pricing, and payment terms confirmed with the offer.">
x-ray-recycling-services-houston: missing exact SEO field <meta name="description" content="Houston X-ray recycling services for qualifying medical and industrial film, with handling planning, silver recovery review, and professional service.">
scrap-silver-buyer-houston: missing exact SEO field <meta name="description" content="Sell scrap silver in Houston with AG Refining. Free qualifying pickup, on-site weighing, and offers based on confirmed material and current market values.">
Generated pages contain an unqualified exact payment-timing claim
Generated pages contain an unsupported price, fee, or full-value superlative
Jewelry-store page contains an absolute confidentiality promise
Jewelry-store page must qualify inventory handling against the privacy notice
Contact and privacy notices must disclose the form page
Contact and privacy notices must disclose the first landing page
Contact and privacy notices must disclose the referring page
Contact and privacy notices must disclose the campaign or ad identifiers
Contact notice must state that website attribution accompanies the request
Hospital hero must show the protected-record guardrail before its pickup action
Hospital hero must route medical film visitors to the protected-record guidance
```

An adjacent wording review found the same exact-timing defect expressed as "pay on the spot" on the flatware route. The timing-claim assertion was expanded before changing that source copy.

Command:

```text
node scripts/verify.mjs
```

Exit code: `1`

Expected focused failure output:

```text
Generated pages contain an unqualified exact payment-timing claim
```

## GREEN evidence

Focused build and generated-output verification:

```text
npm run build && node scripts/verify.mjs
```

Exit code: `0`

```text
Verified 12 production assets
Built 38 public pages in dist
AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)
```

Fresh verifier after the test-only cleanup:

```text
node scripts/verify.mjs && git diff --check
```

Exit code: `0`

```text
AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)
```

The full command reached the shared source check but is blocked by two audit reports owned outside this repair scope:

```text
npm run verify
```

Exit code: `1`

```text
Banned character in /docs/qa/audit-responsive-resilience.md
Banned character in /docs/qa/external-skill-review.md
```

Both files contain em dashes introduced by separate read-only audit work. The production build and this repair's generated-output assertions pass; the controller must normalize those report characters before the final shared release gate.
