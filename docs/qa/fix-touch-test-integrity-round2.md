# Touch regression integrity fix - round 2

Date: 2026-08-04
Implementer: `/root/fix_touch_test_integrity`
Scope: `tests/generated-interaction-contract.test.mjs` only; no production source changed.

## Review requirement

The round-one grader found that the coarse-pointer assertion could leave the `.preferred-contact label` declaration block and satisfy `min-height: 44px` from a later, unrelated rule. The current production CSS already provides a 44px by 44px minimum, so this round changes only the regression test.

## Required meta-failure before correction

I built the current site, copied `dist/` and the original generated-contract test into an isolated `/tmp` fixture, and changed only the preferred-contact label height from `44px` to `40px` in that fixture.

Command shape:

```sh
node --test /tmp/ag-touch-red-NuD4bo/tests/generated-interaction-contract.test.mjs
```

Result before correcting the test:

```text
preferred-contact min-height in isolated CSS: 40px
later unrelated coarse-pointer min-height: 44px
tests 6
pass 6
fail 0
exit 0
```

This reproduced the false green. The root cause was the original unbounded `[^]`-style regex: its match could cross the preferred-contact rule's closing brace before finding `min-height: 44px` in the next selector group.

## Test correction

The test now:

1. walks balanced CSS rule blocks while respecting comments, quoted strings, and nested braces;
2. locates an `@media` block whose condition semantically contains `(pointer: coarse)`;
3. extracts the exact `.preferred-contact label` rule, including when it appears in a selector list;
4. parses declarations without depending on declaration order; and
5. converts explicit pixel values to numbers and requires both `min-height >= 44` and `min-width >= 44` inside that exact rule.

## Mutation sensitivity after correction

All mutations were applied only to temporary generated copies.

| Isolated generated-CSS case | Expected | Observed |
|---|---|---|
| Preferred-contact `min-height: 40px` | Named touch-target test fails | FAIL with `radio-label min-height must be at least 44px`; exit 1 |
| Preferred-contact `min-width: 40px` | Named touch-target test fails | FAIL with `radio-label min-width must be at least 44px`; exit 1 |
| Reordered declarations, compact media formatting, selector whitespace, `min-height: 44.5px`, `min-width: 48px` | Test remains formatting/order independent | PASS, 6/6 |
| Authoritative generated CSS at 44px by 44px | Test passes | PASS, 6/6 |

Focused authoritative command:

```sh
node --test tests/generated-interaction-contract.test.mjs
```

Focused authoritative result:

```text
tests 6
pass 6
fail 0
```

## Repository verification

After the controller normalized an out-of-scope punctuation issue in the prior grader report, a fresh `npm run verify` completed with exit 0:

```text
Built 38 public pages in dist
tests 14
pass 14
fail 0
AG_REFINING_CHECK_OK
AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)
```

The same final verification command ran `git diff --check`, which also exited 0.

No file in `dist/` was edited by hand, and no production source, package/build script, ledger, 3D file, or prior report was modified in this round.
