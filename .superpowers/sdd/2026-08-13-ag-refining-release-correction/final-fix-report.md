# Final Fix Implementation Report

## Status

PASS

## Commit

- `Resolve final release review findings`

## Resolved Findings

1. Expanded shared English and Spanish footer service-area navigation to the exact 23-city coverage inventory plus the service-area overview. Removed shipped `open` attributes, forced the link grids visible on desktop, and restored native collapsed disclosure behavior at the mobile breakpoint.
2. Replaced the one-token loader mark with a visible, browser-tested assay sequence containing `Ag`, atomic number `47`, and purity `99.9`, retaining accessible status text, reduced-motion behavior, and the 1.2-second fail-open.
3. Filtered `assets/material-masters` from `dist` while retaining all 18 authoring masters in source. Added a build-output regression assertion.
4. Synchronized dock state immediately when navigation opens and made dock eligibility explicitly mobile-only. Added live-browser coverage for nav-after-scroll and 900/901 resize transitions.
5. Replaced stale browser provenance with a merge-base resolved from `HEAD` and `main` or `AG_REFINING_BASE_REF`; regenerated the final matrix with merge-base `e37bbbdf1e0e0238bb187c42c9c31eefb2a5f149`.
6. Added `test:site-chrome` to the standard `verify` gate exactly once, without adding it to the cinematic browser command.
7. Tightened the 2560×1440 poster ceiling from 600 KiB to 300 KiB; the asset is 186,232 bytes.
8. Refactored Title Case normalization to operate on text nodes while preserving nested tags and attributes. Added a focused nested-inline regression with unchanged visible copy.

## TDD Evidence

- Focused RED Node run: 35 passed, 9 failed for the intended missing contracts.
- Focused RED browser run: failed on stale `data-visible="true"` / `aria-hidden="false"` dock state immediately after nav open.
- Focused GREEN run: 44/44 Node contracts passed and `SITE_CHROME_BROWSER_OK` covered five site-chrome scenarios.

## Release Evidence

- `npm run verify`: exit 0.
  - Build: 12 production assets verified; 38 public pages emitted.
  - Contract tests: 65 passed, 0 failed.
  - Cinematic runtime: 29 passed, 0 failed.
  - Materials runtime: 11 passed, 0 failed.
  - Assay suite: 20 passed, 0 failed.
  - Repository check: `AG_REFINING_CHECK_OK`.
  - Route verification: `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`.
  - Site chrome: five scenarios passed with `SITE_CHROME_BROWSER_OK`.
- `npm run test:browser`: exit 0; 6 viewport processes and 48 stages passed, with 0 failures and 0 infrastructure retries. Matrix references 60 unique PNG captures.
- `git diff --check`: exit 0 with no output after documentation updates.

## Distribution Measurement

| Measurement | Before | After | Change |
| --- | ---: | ---: | ---: |
| Public bytes | 59,863,380 | 16,695,823 | −43,167,557 (−72.11%) |
| Public files | 161 | 143 | −18 |
| Published material masters | 18 files / 43,205,020 bytes | 0 | −18 files / −43,205,020 bytes |

The net-byte change is 37,463 bytes smaller than the excluded-master payload because the exhaustive footer inventory adds generated HTML across the route set.

## Concerns

- npm continues to print the environment-level `Unknown env config "http-proxy"` warning; it did not affect any exit status.
- Cinematic screenshots are timing-sensitive evidence and some PNG bytes changed during regeneration, but the deterministic matrix assertions passed all stages with no retries.
