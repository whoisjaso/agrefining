# Independent grade: 3D assay hero, round 1

Date: 2026-08-04
Grader: fresh read-only production review
Scope: homepage assay-monolith enhancement, fallback, runtime, accessibility, packaging, and performance evidence

## Verdict

**FAIL.** The progressive-enhancement and fallback engineering is strong, but the WebGL result does not meet the required visual thresholds or the user's Porsche-level luxury bar. The canvas replaces a materially convincing poured-silver fallback with a smoother gray-blue object that shows broad repeated surface bands. The assay bowl also lacks convincing concavity in the side and grazing evidence. In addition, the required yaw mutation is not detected by the current test because the expectation is derived from the mutated exported constant.

The static fallback is release-quality within this scope. The WebGL enhancement is not approved for production in its current form.

## Evidence reviewed

I read the full integration plan, reconstruction report, implementation evidence, current scene source, relevant bootstrap/CSS/build integration, both assay test suites, `browser-matrix.json`, and `performance-evidence.json`.

I inspected the owned reference and every PNG under `docs/qa/3d-captures/` at original resolution:

- reference, comparison, match, side, and grazing views;
- wide, tablet, 390px, and 320px layouts;
- reduced-motion, save-data, no-WebGL, no-JavaScript desktop/mobile, and context-loss fallbacks.

The visual scores below come from rendered inspection. The comparison utility and browser-matrix PASS labels are evidence packaging, not acceptance authority.

## Fresh automated verification

| Command | Result |
|---|---|
| `npm run verify` | PASS, exit 0 |
| `node --check src/assay-scene.js` | PASS, exit 0 |
| `git diff --check` | PASS, exit 0 |

Fresh `npm run verify` evidence:

- 14 form/navigation/API tests passed;
- 13 assay tests passed;
- `AG_REFINING_CHECK_OK`;
- `AG_REFINING_VERIFY_OK (39 HTML files, 38 indexed pages)`.

The npm process emitted the existing `http-proxy` configuration deprecation warning. It did not produce a test, build, or application failure.

## Independent packaging and import audit

| Check | Evidence | Grade |
|---|---|---|
| Exact dependency | `three` is locked to `0.185.1`, MIT | PASS |
| Scene imports | one dynamic import: `/assets/vendor/three.module.min.js` | PASS |
| Three entry dependency | local `./three.core.min.js` only | PASS |
| Remote/addon paths | no remote URL, controls, composer, bloom, room environment, examples, or addons in the scene | PASS |
| Authoring-state privacy | no `.img2threejs` reference in deployed HTML/CSS/JS | PASS |
| Scene budget | 25,089 bytes against 36 KiB | PASS |
| Three entry budget | 365,552 bytes against 380 KiB | PASS |
| Three core sibling | 385,386 bytes and locally packaged | PASS against the implementation's documented same-package correction |
| License | local file contains `MIT License` | PASS |

The production test's 380 KiB core limit is `380 * 1024 = 389,120` bytes, so the 385,386-byte core passes the executable contract.

## Required mutation sensitivity

All mutations were made only in isolated copies under `/tmp/agrefining-grade3d.0Fc362`. Production, committed tests, captures, packages, and `dist` were not edited by the grader.

| Isolated mutation | Expected | Observed | Grade |
|---|---|---|---|
| Change `yawRadians` from 7 degrees to 8 degrees | runtime test fails | 6 passed, 0 failed, exit 0 | **FAIL** |
| Allow enhancement for a coarse pointer | capability test fails | 5 passed, 1 failed, exit 1 | PASS |
| Remove the `onFallback("context-lost")` contract from deployed scene | production contract fails | 6 passed, 1 failed, exit 1 | PASS |
| Remove lower industrial image from generated homepage | production contract fails | 6 passed, 1 failed, exit 1 | PASS |
| Delete the lower industrial asset assertion itself, matching the plan's literal wording | a required-guard integrity check fails | 7 passed, 0 failed, exit 0 | **FAIL** |

The yaw test is self-referential: it asserts pointer output against `ASSAY_LIMITS.yawRadians`, so changing the public limit changes both implementation and expectation. The test name still says seven degrees while accepting eight.

The behavior-level lower-image guard is effective. Removing `ag-silver-hero-1600.webp` from generated HTML fails the production contract. Literal deletion of the assertion is not independently detected. If the release process intends the literal assertion-deletion mutation, it needs an explicit guard-manifest integrity check; otherwise the required mutation should be stated as removal of the generated lower industrial asset.

## Visual scorecard

### Layer scores

| Layer | Threshold | Score | Result | Evidence |
|---|---:|---:|---|---|
| Silhouette and proportion | 0.82 | **0.85** | PASS | Long low mass, softened ends, and complete silhouette remain recognizable across match and side views. |
| Component structure | 0.82 | **0.84** | PASS | Body, three rings, central bowl system, blue top/end line, `Ag / 47`, and three front ticks are present and attached. |
| Form detail | 0.80 | **0.73** | FAIL | The center relief reads primarily as stacked rings with a shallow disc; concavity is not convincingly proven in the required side/grazing captures. The line end wraps read as upright tabs rather than a flush finish. |
| Material and surface | 0.75 | **0.54** | FAIL | The canvas loses the fallback's cast scratches, pits, and tactile roughness. Broad rectangular bands repeat across the top and front, and the side reads gray-blue/plastic rather than poured silver. |
| Lighting and camera | 0.75 | **0.70** | FAIL | Exposure avoids clipped chrome and the creme stage is stable, but the match object is undersized relative to the planned roughly 90 percent stage-width framing and the soft shadow does not ground it as convincingly as the fallback. |
| Overall | 0.78 | **0.69** | FAIL | Recognizable procedural model with good integration discipline, but not a luxury-grade replacement for the owned image. |

### Critical feature scores

| Critical feature | Threshold | Score | Result |
|---|---:|---:|---|
| Long, low rounded cast body | 0.80 | **0.82** | PASS |
| Three-ring relief plus concave bowl | 0.80 | **0.72** | FAIL |
| Blue wrapped line, `Ag / 47`, and three ticks | 0.80 | **0.81** | PASS |
| Satin poured-silver response | 0.75 | **0.53** | FAIL |

No average is used to hide the failed bowl or material features.

## Automatic reject

The material condition triggers an automatic reject: the rendered surface reads as flat gray-blue plastic with obvious broad banding/repetition, especially on the top and front faces in `match-1440x960.png`, `grazing-1440x960.png`, and `wide-1920x1080.png`.

The fallback comparison makes the regression unambiguous. The static image has irregular cast highlights, edge wear, fine scratches, a grounded contact shadow, and a clearly recessed bowl. After enhancement, those cues are replaced by a smoother and more uniform object. A luxury enhancement cannot be accepted when it makes the hero less convincing than first paint.

I did not apply the bowl automatic reject separately because the source does contain concave lathed geometry. The rendered proof is still below its critical threshold because that depth is not legible at the required viewing angles.

## Runtime grade

**PASS for observed local behavior, FAIL for mutation-complete release evidence.**

Positive evidence from the committed matrix and source review:

- 14 local browser cases report PASS with no console or page errors;
- match, side, grazing, wide, and fine-pointer tablet use one decorative canvas;
- normal idle remains at two frames;
- pointer motion settles at frame 51 and remains 51;
- offscreen count remains 56 to 56;
- context loss returns to the image, clears the canvas, and does not request Three again;
- no autonomous spin, free orbit, touch listener, scroll listener, post-processing, or external runtime dependency is present.

The runtime release grade remains blocked by the uncaught yaw mutation.

## Fallback grade

**PASS.**

- The fallback image is complete and materially stronger than the current canvas.
- Reduced motion, save data, coarse pointer, no WebGL, no JavaScript, and context loss keep the picture.
- Blocked-capability cases request the small assay controller but do not request either Three module.
- The picture, hero content, phone path, intake, and lower industrial image remain in generated markup.
- No horizontal overflow was recorded at 320px, 390px, 768px, 1440px, or 1920px.

The 1440px match/side/grazing matrix records the in-hero CTA below the initial viewport, while the global nav CTA remains visible. That is a broader hero-density issue, not evidence that the 3D fallback removed the conversion path.

## Accessibility grade

**PASS for the 3D enhancement contract.**

- The fallback retains meaningful alt text.
- The host remains `aria-hidden="true"`.
- The created canvas is `role="presentation"`, `aria-hidden="true"`, and `tabIndex=-1`.
- The canvas has no pointer interception and creates no focus target.
- Coarse-pointer users receive the image, not an interactive canvas.
- Print forces the fallback and hides the canvas.

No release-preview keyboard or assistive-technology session was available to this grader. The grade is limited to the implementation and local browser evidence.

## Performance grade

**CONDITIONAL PASS locally; preview gate remains open.**

- Desktop: 3,238 triangles, 8 draw calls, DPR 1 or capped 1.5.
- Compact fine pointer: 2,342 triangles, 8 draw calls, DPR capped 1.25.
- One renderer, one canvas, two initial idle frames, bounded spring.
- Fallback and ready rectangles are identical; local CLS is 0.
- The fallback WebP is the LCP candidate before scene and Three requests.

The available Chromium reports ANGLE SwiftShader, not a hardware GPU. It records 225ms and 345ms mount long tasks, so the required representative-hardware rule of no mount task over 50ms is not verified. Local synthetic evidence also does not establish release-preview INP or field Core Web Vitals.

## Positive craft findings

- The cream/navy page composition is restrained and coherent.
- The owned fallback is well framed on desktop and mobile and is not attention-cropped.
- The 3D identity is recognizable rather than generic: three rings, blue wrap, ticks, and `Ag / 47` are all present.
- No background flash, featureless-white clipping, canvas rectangle, perpetual motion, mobile WebGL, or lower-industrial-image regression was observed.
- The local, lazy, decorative implementation is substantially more disciplined than the generated authoring scaffold.

## Bounded correction for round 2

1. **Rebuild the silver response.** Remove the broad low-frequency albedo/UV bands and blue-gray plastic side response. Use independent subtle roughness and normal detail with stable face mapping, irregular cast scratches/pits, and controlled neutral reflections. The new match and grazing captures must be at least as materially convincing as the static fallback, with no visible repetition.
2. **Strengthen form proof and presentation.** Make the bowl concavity legible in side and grazing views, integrate the blue wraps as flush surface finish rather than upright end tabs, and reframe the object near the planned 90 percent stage width with a tighter grounded contact shadow. Preserve all existing identity systems and budget caps.
3. **Repair mutation integrity.** Assert the literal 7-degree and 4-degree limits independently of exported mutable expectations, then rerun all four required mutations. Clarify or explicitly guard the required lower-industrial assertion-deletion mutation; keep the already effective generated-asset removal mutation.

Do not lower any visual threshold. A fresh implementer should make these changes, and a different fresh grader should recapture and rescore match, side, grazing, wide, tablet, and fallback states.

## Unverified limitations

- No Vercel release preview was available.
- No representative hardware-GPU trace was available.
- Field LCP, CLS, and INP were not available.
- The committed browser matrix is local headless Chromium evidence; the harness source was not retained in the repository for an exact fresh replay.
