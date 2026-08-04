# 3D assay hero round-2 correction evidence

Date: 2026-08-04

Scope: the three correction groups requested by the round-1 grader only. This is implementation and verification evidence for a different fresh grader; it is not a visual score or release approval.

## Boundaries preserved

- Changed only `src/assay-scene.js`, the assay shadow rule in `src/style.css`, `tests/assay-scene-runtime.test.mjs`, `tests/assay-production-contract.test.mjs`, this report, and the round-2 files in `docs/qa/3d-captures/`.
- Did not change form, navigation, API, route copy, package versions, build packaging, the adversarial ledger, `.img2threejs`, fallback assets, or lower industrial photography.
- Retained one local Three import, one renderer, one decorative canvas, capability gating, image fallback, context-loss recovery, on-demand rendering, and all original geometry budgets.

## Test-first and visual RED evidence

The round-1 grade was the visual RED: overall 0.69, material 0.54, form detail 0.73, and lighting/camera 0.70. Its captured hashes were:

| Artifact | Round-1 SHA-256 prefix recorded before overwrite |
| --- | --- |
| Match | `7b841871...` |
| Side | `0a3d77bb...` |
| Grazing | `2d1e049b...` |
| Comparison | `b733844b...` |

Before source changes, new contracts failed for the missing neutral field generator and statistics, normalized dominant-face UV mapping, rendered bowl/wrap/camera proof, literal motion-limit expectations, and assertion-integrity guard. The round-1 images supplied the visual failure for broad bands, cool plastic response, shallow bowl, upright blue tabs, undersized framing, and detached shadow.

Two additional RED cycles were retained during correction:

- The first localized-feature implementation failed the owned 256px generation gate at 128.4ms because every scratch and pit was still visited by every pixel.
- The stronger bowl proof failed with `bowl floor does not sit tightly above the body cap` before the floor, wall, tones, and stepped rings were revised.
- A full `npm run verify` then caught a 50.7ms cold generation outlier. Cached value-noise lattices and allocation-free byte encoding reduced representative cold generation to 28ms in the browser and 28.6ms in the final Node evidence run.

## Correction group 1: neutral non-periodic cast silver

- Replaced every sine/cosine and modular defect field with deterministic seeded value-noise layers plus an independent pixel-scale albedo field.
- Built each value-noise lattice once, interpolated it into its target field, and rasterized each sparse scratch or pit only inside its bounded neighborhood. No full-frame per-feature nested loop remains.
- Kept albedo, roughness, and normal height sources independently seeded. Normal detail is derived with central differences from the independent height field.
- Recomputed body UVs by dominant face and normalized each face to one 0..1 span. Textures use `ClampToEdgeWrapping`; there is no object-space repetition or texture tiling.
- Replaced the cool striped environment and blue rim response with irregular cream/neutral softbox lobes, a neutral floor lobe, neutral metal color, and desaturated rim lighting.
- Kept sparse cast scratches and pits without glitter, repeating defect lattices, or shared albedo/roughness structure.

Final deterministic 256px field evidence:

| Metric | Observed |
| --- | ---: |
| Albedo mean / sigma / range | 232.015 / 4.029 / 220-242 |
| Roughness mean / sigma / range | 0.5412 / 0.04484 / 0.4235-0.6588 |
| Albedo row / column mean excursion | 0.2578 / 0.2578 luma |
| Albedo lag x64 / y64 | -0.0663 / -0.0888 |
| Albedo lag x128 / y128 | -0.0588 / -0.1428 |
| Albedo-roughness correlation | 0.0303 |
| Roughness-normal-X correlation | -0.00187 |
| Sparse cast-defect ratio | 3.136% |
| Final Node timings, cold then four warm | 28.6 / 13.0 / 12.4 / 15.2 / 16.9ms |

The statistical contract also checks determinism, neutral RGB equality, byte dimensions, ranges, row/column excursions, x/y lag-64 and lag-128 correlations for albedo, roughness, and normal X, cross-field correlation, and sparse-defect bounds.

## Correction group 2: form and presentation

- Rebuilt the assay bowl profile as a distinct floor and steep wall: center y 0.378, rim y 0.472, visible depth 0.094, with a neutral dark wall and bright rim gradient.
- Thinned and vertically stepped the three relief rings into the surface so the grazing proof exposes the cavity rather than a flat stack of wires.
- Replaced the upright end boxes with one segmented ribbon: a crowned top path and short flush paths around both rounded ends. The blue finish has no tall tab or overshoot.
- Moved match framing to an aspect-adaptive 34-degree camera, with dedicated elevated side and grazing proof poses. The complete body now fills approximately the planned high-80-percent stage width while retaining all tilt clearance.
- Tightened and blurred the neutral CSS contact shadow at the base. The earlier broad detached radial is gone; no shadow map or extra draw call was added.
- Preserved the long low rounded body, three ticks, `Ag / 47`, blue identity line, bounded pointer response, and fallback identity.

Final enhanced diagnostics:

| View | Triangles | Draw calls | DPR |
| --- | ---: | ---: | ---: |
| Match / side / grazing, 1440x960 | 3,438 | 8 | 1 |
| Wide, 1920x1080 at device DPR 2 | 3,438 | 8 | 1.5 |
| Fine-pointer tablet, 768x1024 at device DPR 2 | 2,478 | 8 | 1.25 |

The deployable scene is 36,370 bytes against the 36,864-byte limit.

## Correction group 3: mutation integrity

The motion test now defines literal seven-degree and four-degree radians independently of `ASSAY_LIMITS`, asserts the exported public constants against those literals, and asserts both positive and negative clamped output. The production suite constructs an independent protected-assertion string so deleting the actual lower-industrial assertion cannot also satisfy its integrity guard.

All mutations below ran in `/tmp/ag-round2-mutation-proof.qcEUy6/agrefining`, not in the working tree:

| Isolated mutation | Observed proof |
| --- | --- |
| `yawRadians` 7 -> 8 degrees | Runtime test exit 1; actual 0.139626 vs literal 0.122173 |
| `pitchRadians` 4 -> 5 degrees | Runtime test exit 1; actual 0.087266 vs literal 0.069813 |
| Delete `assert.match(home, /ag-silver-hero-1600\\.webp/);` | Integrity test exit 1 with `the lower industrial asset assertion was deleted from this suite` |
| Remove `ag-silver-hero-1600.webp` from generated homepage | Homepage contract exit 1 because the generated asset was absent |

This repairs assertion-deletion sensitivity while preserving the already effective generated-asset-removal behavior.

## Browser and capture evidence

`docs/qa/3d-captures/browser-matrix.json` was regenerated after the final build: 14 passed, 0 failed, no console/page errors. Every enhanced capture waited at least 750ms after `data-assay-state=ready` and verified fallback opacity 0 plus canvas opacity 1.

- Match, side, grazing, wide, and fine-pointer tablet reached `ready` with one decorative canvas and zero overflow.
- Coarse-pointer 390x844 and 320x800, reduced motion, save data, and no WebGL retained the picture with zero canvases and no Three request.
- No-JavaScript desktop/mobile retained picture, copy, CTA, phone, and intake.
- Context loss returned to fallback opacity 1, removed the canvas, hid the host, and kept Three request count at 2 -> 2.
- Pointer evidence moved frame count 2 -> 15, settled at 40 -> 40, stayed offscreen at 44 -> 44, and stayed frozen at 67 -> 67.

Primary final hashes:

| Artifact | SHA-256 |
| --- | --- |
| `match-1440x960.png` | `af5c01e8c9dca6a0a80a1c22e206440f2f2e461ccd3990e41de5c5415a9b1dc1` |
| `side-1440x960.png` | `12d449759a7a6cf1019800bd4b1f232da93da6b29a94e23750d12261da26594b` |
| `grazing-1440x960.png` | `32478c316a7b2871a366b2b625a1181fa4d6b50c05dea1295639e8a1eea14608` |
| `wide-1920x1080.png` | `fef6484076f061593e755ed76b639e3cf4dad5b09b5913dda87d76ed2de0e585` |
| `tablet-768x1024.png` | `ae2168c30fc52da620a30c4ceeaed667aadc845ad1cdd2758bf8fb7970607d92` |
| `comparison-match.png` | `7cf009a1feff50b3dc01f3629f866235b81a33e6e23afdb0ce1361e2fa26dce3` |

The final capture directory also contains regenerated coarse-pointer, reduced-motion, save-data, no-WebGL, no-JavaScript desktop/mobile, and context-loss PNGs.

## Performance evidence

`docs/qa/3d-captures/performance-evidence.json` was regenerated from the final build.

- Fallback WebP remained the local LCP candidate at 104ms.
- Local CLS was 0 and fallback/ready rectangles were identical.
- Scene request began at 116.1ms after `window.load` at 77.3ms; Three began later at 129.7ms.
- Direct same-browser `generateAssaySurfaceFields(256)` evidence: 28.0ms first call; warm calls 11.0-15.1ms; warm median 13.05ms; 50ms gate passed.
- The earliest 56ms mount task is recorded separately as combined module-evaluation/mount work and is not attributed solely to the software GPU.
- The later 278ms and 355ms tasks occurred in an ANGLE SwiftShader render path. They are retained as local evidence, not treated as representative hardware-GPU timing.

## Final verification

| Command | Result |
| --- | --- |
| `npm run verify` | PASS; 14 shared tests + 17 assay tests; `AG_REFINING_CHECK_OK`; `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)` |
| `node --check src/assay-scene.js` | PASS |
| `git diff --check` | PASS |

The existing npm `http-proxy` deprecation warning remained non-fatal.

## Remaining verification limits

- The available browser reports ANGLE SwiftShader. A release-preview hardware-GPU trace is still required for the representative mount long-task gate.
- Synthetic local evidence does not establish field INP or production Core Web Vitals; release-preview LCP, CLS, and INP telemetry remain open.
- The real-time cast response remains a deterministic approximation of the denser photographic imperfections in the fallback.
- The comparison sheet packages reference and final render only; it does not score them. A different fresh grader should inspect the final match, side, grazing, wide, tablet, fallback, comparison, browser matrix, and performance evidence against the unchanged round-1 thresholds.
