# Independent grade: 3D assay hero, round 2

Date: 2026-08-04
Grader: fresh independent production review
Scope: homepage assay-monolith WebGL enhancement, visual fidelity, fallback behavior, runtime lifecycle, accessibility, packaging, mutation integrity, and local performance evidence

## Verdict

**PASS for the round-2 3D hero implementation against the unchanged visual and runtime rubric.**

All required visual layer scores and all four critical-feature scores meet their original thresholds. No automatic visual reject condition remains. The most marginal passes are the three-ring relief plus bowl at 0.81 against 0.80 and the satin-silver response at 0.76 against 0.75. Those scores are not raised by averaging. The grazing proof is what establishes actual bowl recession; the match and side views remain more visually subdued. The real-time material is still less photographically dense than the static fallback, but it now reads as neutral brushed and cast metal instead of the round-1 gray-blue plastic surface.

The functional and mutation evidence also passes. A fresh full verify completed with 14 shared tests and 17 assay tests. A fresh local browser replay completed 14 of 14 cases with no console or page errors. Every required isolated mutation caused the intended test failure, including literal yaw and pitch drift, coarse-pointer enhancement, missing context-loss fallback, removal of the actual lower industrial source, and deletion of the lower-image assertion itself.

This verdict is not a claim of representative hardware-GPU or field performance. The only available Chromium renderer is ANGLE SwiftShader. It records a 56ms combined module/mount task, later 263ms and 386ms software-renderer tasks, and about 32.6 fps during a desktop pointer-settle probe. The compact probe records about 55.2 fps. Therefore the representative desktop 60 fps, hardware mount-task, release-preview INP, and field Core Web Vitals gates remain open. The local implementation passes; hardware and field certification do not.

## Evidence reviewed

I read the complete:

- round-1 independent grade;
- round-2 implementation report;
- 870-line production integration plan;
- reconstruction report;
- current scene, bootstrap, CSS, build, check, verification, and assay test sources;
- committed browser matrix and performance evidence.

I inspected the owned 1536 x 1024 reference and every current PNG in docs/qa/3d-captures at original resolution:

- comparison-match.png;
- match-1440x960.png;
- side-1440x960.png;
- grazing-1440x960.png;
- wide-1920x1080.png;
- tablet-768x1024.png;
- mobile-390x844.png;
- mobile-320x800.png;
- reduced-motion.png;
- save-data.png;
- no-webgl.png;
- no-js-desktop.png;
- no-js.png;
- context-loss.png.

I also inspected original-pixel crops of the reference, the three enhanced review stages, and the bowl region in match, side, and grazing views. I inspected the generated albedo, roughness, and normal fields as 256 x 256 images in temporary grading storage. The fresh replay regenerated every browser capture into temporary storage. All fresh capture hashes matched the committed capture hashes exactly, confirming deterministic output.

Primary committed and fresh-matched hashes:

| Artifact | SHA-256 |
| --- | --- |
| Owned reference | 5b86deb1febfa7f17088969d7b4f25f78c59408c4ea4e025efd5d737771c4b6f |
| Match | af5c01e8c9dca6a0a80a1c22e206440f2f2e461ccd3990e41de5c5415a9b1dc1 |
| Side | 12d449759a7a6cf1019800bd4b1f232da93da6b29a94e23750d12261da26594b |
| Grazing | 32478c316a7b2871a366b2b625a1181fa4d6b50c05dea1295639e8a1eea14608 |
| Wide | fef6484076f061593e755ed76b639e3cf4dad5b09b5913dda87d76ed2de0e585 |
| Tablet | ae2168c30fc52da620a30c4ceeaed667aadc845ad1cdd2758bf8fb7970607d92 |
| Comparison | 7cf009a1feff50b3dc01f3629f866235b81a33e6e23afdb0ce1361e2fa26dce3 |

## Fresh automated verification

| Command | Result |
| --- | --- |
| npm run verify | PASS, exit 0 |
| node --check src/assay-scene.js | PASS, exit 0 |
| git diff --check | PASS, exit 0 |

Fresh verify evidence:

- 14 shared form, navigation, API, localization, and touch-target tests passed;
- 17 assay runtime and production tests passed;
- AG_REFINING_CHECK_OK;
- AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages).

The existing npm http-proxy configuration deprecation warning remains non-fatal. No test, syntax, build, check, or route failure occurred.

## Visual scorecard

### Layer scores

| Layer | Threshold | Score | Result | Evidence |
| --- | ---: | ---: | --- | --- |
| Silhouette and proportion | 0.82 | **0.88** | PASS | The long, low mass, complete rounded ends, shallow crown, and softened perimeter remain recognizable in every review angle. The match object occupies about 86 percent of the 692px stage width, which is within the planned high-80-percent framing. |
| Component structure | 0.82 | **0.88** | PASS | Body, three relief rings, central bowl, blue top line and both end wraps, Ag / 47, and three recessed front ticks are present, attached, and legible. |
| Form detail | 0.80 | **0.81** | PASS | The grazing proof shows a dark inner wall and recessed floor rather than a painted target. The match and side views still make the center look shallow, and the low segment count remains visible on the nearest bevel, so this is intentionally a narrow pass. |
| Material and surface | 0.75 | **0.77** | PASS | The surface is neutral, independently varied, and non-periodic. Sparse scratches and pits remain subtle. It is less detailed than the static photograph but no longer reads as blue plastic, tiled noise, glitter, or uniform chrome. |
| Lighting and camera | 0.75 | **0.81** | PASS | Match framing is materially closer, review cameras expose the form, highlights retain edge information, the transparent canvas blends into the creme stage, and the tightened contact shadow overlaps the base instead of floating below it. |
| Overall | 0.78 | **0.80** | PASS | The result is a restrained, recognizable, identity-specific progressive enhancement. The remaining approximation is visible, but no failed layer or critical feature is hidden by the overall score. |

### Critical feature scores

| Critical feature | Threshold | Score | Result |
| --- | ---: | ---: | --- |
| Long, low rounded cast body | 0.80 | **0.86** | PASS |
| Three-ring relief plus concave bowl | 0.80 | **0.81** | PASS |
| Blue wrapped line, Ag / 47, and three ticks | 0.80 | **0.86** | PASS |
| Satin poured-silver response | 0.75 | **0.76** | PASS |

No average is used to hide the two narrow critical passes.

## Round-1 discrepancy resolution

### Periodic banding

Resolved.

- The visible round-1 sine-like broad bands are absent from match, side, grazing, wide, and tablet captures.
- The generated albedo row and column mean excursions are each 0.2578 luma on a 0-255 scale.
- Albedo lag correlations are -0.0663 at x64, -0.0888 at y64, -0.0588 at x128, and -0.1428 at y128.
- The 256px albedo, roughness, and normal images show irregular fields with no repeated tile seam.
- Dominant-face UVs map each face once in normalized 0-1 space, and textures use ClampToEdgeWrapping.

The front face still has directional brushing, which is appropriate to the material. It does not repeat at an obvious fixed interval.

### Blue or plastic cast

Resolved.

- Every albedo pixel has equal red, green, and blue channel values.
- The neutral base, neutral environment lobes, and desaturated rim remove the previous blue-gray side cast.
- Roughness mean is 0.5412 with sigma 0.04484 and range 0.4235-0.6588.
- Albedo-to-roughness correlation is 0.0303, and roughness-to-normal-X correlation is -0.00187, so the channels are not copies of one another.
- The rendered bevel and front-face response provide metallic edge and reflection structure rather than a single flat gray value.

The static fallback remains more photorealistic and more densely scarred. The WebGL version now reads as a controlled neutral-satin approximation, which is enough to clear 0.75 but not enough for a higher material score.

### Bowl depth

Resolved narrowly.

- The pure profile has a center at y 0.378 and a rim at y 0.472, for 0.094 world units of visible depth.
- The bowl uses lathed geometry with a distinct floor and steep wall.
- The grazing capture visibly shows the dark inner wall and recessed center.
- Match and side are less decisive because their higher view and neutral light flatten the center. This residual ambiguity is why form and bowl score only 0.81.

The evidence set no longer supports the flat-disc automatic reject because the grazing view proves real concavity. The model does not rely on a painted target.

### Tab-like blue wraps

Resolved.

- The end paths turn around each rounded end by about 0.138 world units in X.
- Their total Y span is 0.115 world units, below the 0.12 guard.
- Original-resolution match, side, and grazing views show a thin line that follows the end transition, not an upright blue tab.
- No emissive, bloom, or glow is present.

### Detached shadow

Resolved.

- The ready-only CSS shadow is inset to the lower body area and blurred by 8px.
- In match and grazing crops, the shadow overlaps the lower silhouette and does not leave a visible creme gap.
- It remains neutral and soft, with no large detached radial.
- No shadow map or extra draw call was introduced.

### Undersized framing

Resolved.

- The match body spans about 86 percent of the stage width, versus the planned approximate 90 percent.
- Wide and tablet remain composed without clipping either rounded end.
- The match target is grounded at y 0.14, and the complete line, mark, rings, and ticks remain in frame.

## Automatic reject review

No automatic reject condition is triggered.

| Reject condition | Evidence |
| --- | --- |
| Sharp or generic box body | Not present. The plan silhouette, rounded ends, bevel, and crown remain visible. |
| Convex plug, flat disc, or painted target | Not triggered. Match and side are shallow, but grazing proves a real recessed bowl and dark wall. |
| Wrong ring count | Not present. Three separate relief rings are visible and present in source geometry. |
| Missing blue end wrap | Not present. Both source paths exist; the visible end wrap is flush in all relevant review angles. |
| Missing, mirrored, or illegible Ag / 47 | Not present. The mark is legible and correctly oriented at desktop hero size. |
| Missing ticks or attached rods | Not present. Three recessed-looking front ticks are visible. |
| Uniform chrome, flat gray plastic, glitter, or obvious tiling | Not present. Neutral independent fields and irregular cast response are visible. |
| Featureless clipped highlights | Not present. Bright bevel bands retain edge shape and adjacent tonal detail. |
| Canvas flash or visible rectangle | Not present. The canvas is transparent over the same creme stage; fallback and ready rectangles are identical. |
| Perpetual movement | Not present. Frame counts stop after settle and remain fixed offscreen and while frozen. |
| Interactive mobile canvas or lost touch scrolling | Not present. Coarse-pointer cases keep the image and request no Three module. |
| Fallback removes image or conversion path | Not present. Image, CTA, phone, and intake remain in generated and no-JavaScript markup. |
| Lower industrial photography changed | Not present. The source and generated homepage keep ag-silver-hero-1600.webp, and source removal is caught by the test suite. |

## Fresh browser and runtime replay

The reusable local Chromium harness was copied to temporary grading storage so it could not overwrite committed evidence. Fresh result: **14 passed, 0 failed**, with no console or page errors.

| Case | Fresh result | Key evidence |
| --- | --- | --- |
| Match 1440 x 960 | PASS | ready, one decorative canvas, 3,438 triangles, 8 draws, DPR 1, two idle frames |
| Side 1440 x 960 | PASS | ready, deterministic side view, same budgets |
| Grazing 1440 x 960 | PASS | ready, deterministic grazing view, same budgets |
| Wide 1920 x 1080 | PASS | ready, DPR capped at 1.5, zero overflow |
| Fine-pointer tablet 768 x 1024 | PASS | ready, 2,478 triangles, 8 draws, DPR 1.25, zero overflow |
| Coarse 390 x 844 | PASS | fallback, zero canvases, no Three module request |
| Coarse 320 x 800 | PASS | fallback, zero canvases, no Three module request, zero overflow |
| Reduced motion | PASS | fallback, zero canvases, no Three module request |
| Save data | PASS | fallback, zero canvases, no Three module request |
| No WebGL | PASS | fallback, zero canvases, no Three module request |
| No JavaScript mobile | PASS | picture, CTA, phone, intake, and zero canvas |
| No JavaScript desktop | PASS | picture, CTA, phone, intake, and zero canvas |
| Context loss | PASS | returns to fallback, removes canvas, Three requests remain 2 to 2 |
| Pointer and pause | PASS | bounded settle, offscreen pause, frozen-page pause, no perpetual loop |

Fresh pointer and pause counters:

- untouched idle: 2 frames;
- moving after the initial burst: 16 frames;
- settled: 41 then 41;
- offscreen: 45 then 45;
- lifecycle freeze: 67 then 67;
- context loss: controller state fallback, active false, contextLost true.

I also called controller.dispose() twice in a fresh browser session. It remained idempotent, produced no page or console error, marked state disposed and disposed true, marked active false, removed the canvas, and hid the host.

## Required mutation sensitivity

Every mutation was isolated under temporary grading copies. No production, committed tests, capture, package, or build evidence was modified.

| Isolated mutation | Expected | Fresh observed result | Grade |
| --- | --- | --- | --- |
| Change yawRadians from 7 degrees to 8 degrees | Runtime test fails against literal 7-degree value | Exit 1; 8 passed, 1 failed; actual 0.1396263402 versus expected 0.1221730476 | PASS |
| Change pitchRadians from 4 degrees to 5 degrees | Runtime test fails against literal 4-degree value | Exit 1; 8 passed, 1 failed; actual 0.0872664626 versus expected 0.0698131701 | PASS |
| Allow enhancement for coarse pointer | Capability test fails | Exit 1; 8 passed, 1 failed; actual interactive versus expected coarse-pointer fallback | PASS |
| Remove onFallback("context-lost") from source, then rebuild | Production contract fails | Build exit 0; test exit 1; 7 passed, 1 failed on the required deployed callback | PASS |
| Remove ag-silver-hero-1600.webp from the actual build source, then rebuild | Homepage contract fails | Build exit 0; test exit 1; 7 passed, 1 failed on the required lower image | PASS |
| Delete the literal lower-image assertion from the test suite | Integrity test fails | Exit 1; 7 passed, 1 failed with "the lower industrial asset assertion was deleted from this suite" | PASS |

This closes both round-1 mutation gaps. The motion expectations no longer derive their allowed values from the mutated export, and the lower-image assertion has an independent integrity guard.

## Material-field evidence and generator performance

Fresh Node statistics at 256px:

| Metric | Fresh value |
| --- | ---: |
| Albedo mean | 232.0154 |
| Albedo sigma | 4.0292 |
| Albedo range | 220-242 |
| Roughness mean | 0.54121 |
| Roughness sigma | 0.04484 |
| Roughness range | 0.4235-0.6588 |
| Row mean excursion | 0.2578 luma |
| Column mean excursion | 0.2578 luma |
| Maximum absolute listed lag correlation | 0.1428 |
| Albedo-roughness correlation | 0.03034 |
| Roughness-normal-X correlation | -0.00187 |
| Sparse cast-defect ratio | 3.136 percent |

Fresh Node timings were 28.79ms cold, then 13.29ms, 13.44ms, 14.13ms, and 14.79ms warm.

Fresh same-browser direct generator evidence:

- module import: 4.0ms;
- first 256px call: 28.8ms;
- six warm calls: 10.9ms to 17.3ms;
- warm median: 11.35ms;
- 50ms owned-generator gate: PASS.

These values measure the exported owned field generator only. They do not represent total module evaluation, Three evaluation, scene construction, shader compilation, or first render.

## Performance interpretation

Fresh local trace:

- window load completed at 41.8ms;
- assay scene request began at 121.9ms;
- Three entry request began at 136.7ms;
- static fallback was the local LCP candidate at 108ms;
- local stage CLS was 0;
- fallback and ready stage rectangles were identical;
- combined mount-related long tasks were 56ms, 263ms, and 386ms;
- renderer was ANGLE SwiftShader.

The earliest 56ms task is combined module evaluation and mount work. It must not be attributed solely to the 28.8ms field generator, and it must not be attributed solely to SwiftShader. The later 263ms and 386ms tasks occur in the software-rendered WebGL path and are retained as observed evidence.

An additional pointer-settle sampling probe measured:

- desktop 1440 x 960: about 32.6 fps mean, 33.3ms median changed-frame interval, 49.9ms p95 interval;
- compact fine pointer 768 x 1024: about 55.2 fps mean, 16.7ms median changed-frame interval, 33.3ms p95 interval.

The desktop software result is below the planned 60 fps target. It is not hidden or called a pass. Because the renderer is SwiftShader, it also is not representative evidence that a normal hardware GPU fails. The scene remains only 3,438 triangles and 8 draws on desktop, and 2,478 triangles and 8 draws on compact, so no bounded source correction is justified from software-renderer cadence alone.

Performance release status:

| Gate | Status |
| --- | --- |
| Asset and module byte budgets | PASS |
| Triangle and draw-call budgets | PASS |
| DPR caps | PASS |
| One renderer and one canvas | PASS |
| Idle and pause behavior | PASS |
| Owned field generator under 50ms | PASS |
| Local stage CLS | PASS at 0 |
| Module starts after window load | PASS |
| Representative desktop pointer 60 fps | UNVERIFIED; SwiftShader observed about 32.6 fps |
| Representative hardware mount task under 50ms | UNVERIFIED |
| Release-preview LCP under 2.5s | UNVERIFIED |
| Release-preview INP under 200ms | UNVERIFIED |
| Field Core Web Vitals | UNVERIFIED |

## Packaging and privacy grade

**PASS.**

| Item | Fresh evidence |
| --- | --- |
| Exact Three version | 0.185.1 |
| Scene source and deployed size | 36,370 bytes, 494 bytes below the 36 KiB cap |
| Three module | 365,552 bytes, local |
| Required Three core sibling | 385,386 bytes, local and under 380 KiB |
| License | 1,081-byte local file containing MIT License |
| Scene imports | One dynamic import of /assets/vendor/three.module.min.js |
| Remote scene paths | None |
| Addons, controls, composer, bloom, or room environment | None |
| Authoring path leakage | None in deployed HTML, CSS, or JavaScript |
| HTML and sitemap contract | 39 HTML documents, 38 indexed URLs |
| Fallback assets | 35,336-byte desktop and 11,172-byte mobile WebP, exact required dimensions |

The scene is very close to its raw byte cap. This is a future maintenance constraint, not a current failure.

## Accessibility, fallback, and lifecycle grade

**PASS.**

- The fallback retains the exact meaningful alt description.
- The canvas host remains aria-hidden.
- The one created canvas is role presentation, aria-hidden true, tabIndex -1, and pointer-events none.
- No new focus target, control, instruction, live region, or touch handler is created.
- Coarse pointer, reduced motion, save data, and no WebGL retain the static image and avoid both Three module requests.
- No JavaScript retains the picture, conversion links, and intake.
- Print hides the canvas and forces fallback opacity to 1.
- Context loss calls preventDefault, stops scheduling, returns to the picture, releases reachable resources, removes the canvas, and does not retry.
- Explicit final disposal is idempotent and removes observers, listeners, resources, renderer state, and canvas.
- The lower industrial photograph remains present exactly once.

At 1440 x 960, the in-hero CTA and phone are below the initial viewport in the recorded layout, while the global navigation CTA remains visible. At 320 x 800, the main CTA is also below the initial viewport. The conversion elements remain present and usable, and this behavior predates the round-2 3D correction. It is not scored as a 3D failure.

The fixed material-guide control visibly overlaps mobile copy in the screenshots. Per scope direction, this is an out-of-scope release observation and does not alter the 3D score.

## Final release boundary

The round-2 implementation is approved to proceed to a Vercel preview and production smoke sequence. That next gate must still:

1. match the preview deployment to the exact reviewed commit;
2. confirm the production branch and alias;
3. replay fallback, context-loss, coarse-pointer, reduced-motion, and no-WebGL behavior;
4. inspect preview runtime errors;
5. retain the hardware-GPU and field-vitals limitations unless representative evidence becomes available.

No additional correction round is required by the unchanged visual rubric or the required mutation suite.
