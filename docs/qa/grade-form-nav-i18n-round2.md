# Independent grade: touch regression integrity - round 2

Date: 2026-08-04
Grader: `/root/grade_form_nav_i18n_fast`
Implementation under grade: `/root/fix_touch_test_integrity`

## Verdict

**PASS: `AGQA-TOUCH-001` is closed.**

Round 1 already proved the current rendered coarse-pointer labels are at least 44 CSS pixels high and that tapping away from the radio glyph activates the associated control. This bounded regrade independently confirms that the automated guard now detects regressions to either required dimension without becoming sensitive to harmless declaration order or media-query formatting.

No browser rerun was performed because the round-2 assignment was limited to regression integrity and explicitly reused the rendered evidence from round 1.

## Fresh authoritative evidence

The focused generated-contract test completed with exit 0:

```text
tests 6
pass 6
fail 0
```

The full repository release gate completed with exit 0:

```text
Verified 12 production assets
Built 38 public pages in dist
tests 14
pass 14
fail 0
AG_REFINING_CHECK_OK
AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)
```

`git diff --check` completed independently with exit 0 and no output.

## Independent mutation sensitivity

The grader copied the authoritative generated site and corrected test into isolated fixtures under `/tmp/ag-touch-grade-r2-7bVcz6`. No repository or generated production file was mutated.

| Isolated case | Expected result | Observed result |
|---|---|---|
| Current `min-height: 44px; min-width: 44px` | Pass | **PASS**, 6/6, exit 0 |
| Change only preferred-contact `min-height` to `40px` | Named touch test fails | **Expected failure**, 5/6, exit 1, `radio-label min-height must be at least 44px` |
| Change only preferred-contact `min-width` to `40px` | Named touch test fails | **Expected failure**, 5/6, exit 1, `radio-label min-width must be at least 44px` |
| Reorder the three declarations and compact `@media(pointer:coarse)` | Remain green | **PASS**, 6/6, exit 0 |

The prior false green is therefore eliminated. The guard extracts the balanced coarse-pointer media block, finds the exact `.preferred-contact label` rule, parses that rule's declarations, and validates both pixel minima within the rule boundary. It cannot satisfy the assertion from the later unrelated `min-height: 44px` declaration.

## Scope integrity

The round-2 implementation changes only `tests/generated-interaction-contract.test.mjs` and its evidence report. The production files already modified by the larger form/navigation/i18n batch all predate the correction: their latest modification time is 11:18:31, while the corrected test was written at 11:37:19. No production source, API handler, build script, package file, ledger, 3D asset, or `dist/` file was manually changed for this correction or grade.

## Batch closure

Combining this result with round 1's independent passes yields:

| Finding | Final verdict |
|---|---|
| `AGQA-FORM-001` | **PASS** |
| `AGQA-NAV-001` | **PASS** |
| `AGQA-I18N-001` | **PASS** |
| `AGQA-TOUCH-001` | **PASS** |
