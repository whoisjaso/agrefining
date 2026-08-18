# Task 3 Report - Material card and responsive asset system

## Outcome

Task 3 was completed in `/workspace/scratch/1ea8cd8d5cff/agrefining/.worktrees/ag-release-correction` on Monday, August 17, 2026.

- Rebuilt the material image system around 4:3 `1280x960` and `800x600` WebPs.
- Added a route-to-asset manifest with focal-position metadata and responsive `srcset` / `sizes`.
- Reworked homepage and accepted-materials editorial cards into separated boxes.
- Preserved and completed the untracked `tests/material-image-contract.test.mjs`, then added it to `npm test`.
- Copied the ten approved PNG masters into the worktree as source inputs.

## Approved source masters copied into the worktree

Source copies live under `assets/material-masters/`.

| Asset basename | Source PNG copied into worktree |
| --- | --- |
| `material-industrial-ndt` | `exec-25ae9b04-d7fe-4755-b6b4-1da9864f9cb4.png` |
| `material-medical-xray` | `exec-4595fd7a-a7b7-46dc-8cd1-cbb060183784.png` |
| `material-xray-film` | `exec-c82f311b-77bf-41f7-9781-f42fffcea312.png` |
| `material-industrial-silver` | `exec-a468d68b-d297-4208-a4f4-043d785190df.png` |
| `material-scrap-silver` | `exec-8d61d383-385f-48a2-9e47-db79df12a235.png` |
| `material-lab-silver` | `exec-af156493-0aea-4489-8985-afba61099d43.png` |
| `material-coins` | `exec-4db50b07-46d6-4f34-91c2-4adde2f6f5fd.png` |
| `material-scrap-jewelry` | `exec-1d9e0bee-f34d-4f0e-b261-a51ff7c8939c.png` |
| `material-sterling-flatware` | `exec-3bf9cccc-0aa6-4845-881d-e19ec283ff77.png` |
| `material-electronics` | `exec-523f1c44-10fd-4f62-b72e-1ae9f35ceb58.png` |

## Route manifest used by the generator

| Route | Asset basename | Source type |
| --- | --- | --- |
| `silver-oxide-watch-battery-recycling-houston` | `material-watch-batteries` | preserved existing image, padded to 4:3 |
| `scrap-silver-buyer-houston` | `material-scrap-silver` | approved new master |
| `scrap-silver-jewelry` | `material-scrap-jewelry` | approved new master |
| `sell-silver-coins-houston` | `material-coins` | approved new master |
| `sell-silver-bars-houston` | `material-silver-bars` | preserved existing image, padded to 4:3 |
| `silver-flatware-buyer-houston` | `material-sterling-flatware` | approved new master |
| `silver-plated-materials-buyer-houston` | `material-silver-plated` | preserved existing image, padded to 4:3 |
| `industrial-silver-scrap` | `material-industrial-silver` | approved new master |
| `electronics-silver-recovery` | `material-electronics` | approved new master |
| `silver-flake-buyer-houston` | `material-silver-flake` | preserved existing image, padded to 4:3 |
| `silver-solder-buyer-houston` | `material-silver-solder` | preserved existing image, padded to 4:3 |
| `laboratory-silver-buyer-houston` | `material-lab-silver` | approved new master |
| `industrial-x-ray-silver-recycling` | `material-industrial-ndt` | approved new master |
| `medical-x-ray-recycling` | `material-medical-xray` | approved new master |
| `dental-scrap-buyer-houston` | `material-dental` | preserved existing image, padded to 4:3 |
| `x-ray-recycling-services-houston` | `material-xray-film` | approved new master |
| `jewelry-store-silver-recycling-houston` | `material-scrap-jewelry` | approved new master reused intentionally |

## Derivatives written

Each material basename above now has:

- `<basename>-1280.webp` at `1280x960`
- `<basename>-800.webp` at `800x600`

For preserved legacy subjects, I used `scripts/optimize-asset.mjs --fit contain --background '#f1ede4'` so the old approved photos were kept intact and placed onto the new 4:3 canvas instead of being stretched.

## Source changes

- `scripts/build.mjs`
  - added the material route manifest and focal metadata
  - switched homepage, route heroes, and accepted-materials cards to responsive 4:3 imagery
  - added safe fallbacks for non-manifest taxonomy pages
- `src/style.css`
  - converted material cards from merged rows into separated editorial boxes
  - added 4:3 handling and focal-position support
- `scripts/optimize-asset.mjs`
  - changed the material preset to `1280x960` + `800x600`
  - added `--fit`, `--background`, and `--position`
- `tests/material-image-contract.test.mjs`
  - preserved the untracked file and completed the responsive-image contract
- `package.json`
  - added the material image contract to `npm test`
- `scripts/fetch-assets.mjs`, `scripts/check.mjs`, `scripts/verify.mjs`
  - aligned supporting verification with the new asset names / dimensions

## Commands run and results

1. `npm run build`
   - passed
2. `npm test`
   - passed
3. `npm run test:media`
   - passed
4. `npm run check`
   - passed with `AG_REFINING_CHECK_OK`
5. `node scripts/verify.mjs`
   - passed with `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`
6. `npm run test:browser`
   - not stable; browser-process closures interrupted the tablet no-JavaScript path even after rerun

## Self-review

- Verified that the 17 route entries resolve to real responsive assets.
- Verified `width="1280" height="960"` plus `srcset`, `sizes`, and lazy-loading expectations in generated markup.
- Verified the derivative files are real WebPs at exact 4:3 dimensions.
- Verified obsolete mobile/legacy material filenames are no longer consumed by homepage, taxonomy, or the 17 material destinations.
- Verified the broader static build still passes repository checks and verifier output.

## Concerns

- `tests/cinematic-hero-browser.mjs` remains flaky in this environment. The failure mode was browser-process closure during the tablet no-JavaScript scenario, not a deterministic material-image regression. I did not commit the generated QA capture artifacts from those runs.
