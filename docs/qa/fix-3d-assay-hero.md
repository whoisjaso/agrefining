# Production 3D assay hero implementation evidence

Date: 2026-08-04

Scope: homepage assay-monolith hero only. The existing conversion CTA, phone link, intake panel, lower industrial proof photograph, route copy, legal content, and lead endpoint were preserved.

This is implementer evidence, not a visual grade. A fresh reviewer must inspect the comparison, review views, fallback captures, and runtime evidence.

## Test-first evidence

The required RED gates were captured before production implementation:

1. `node --test tests/assay-scene-runtime.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for `src/assay-scene.js`.
2. `npm run build && node --test tests/assay-production-contract.test.mjs` produced independent failures for the missing stage/fallback assets, Three package, scene module, bootstrap/CSS integration, while the existing 39-document route contract remained intact.
3. A browser run then exposed a real packaging failure: Three `0.185.1`'s `three.module.min.js` imports `./three.core.min.js`. The initial request returned 404, the stage reported `module-error`, and the static fallback remained visible. A focused contract failed with `local Three core dependency is missing` before the build copied the same-package core file.
4. The first ready capture showed a taupe/near-black metal response. A source contract failed before the material/environment were neutralized to satin silver while retaining the plan's `0.16` radius, five curve segments, four bevel segments, `0.10` bevel, and `0.025` crown limit.
5. Browser diagnostics showed a 1920px viewport capped at compact DPR because the stage itself is narrower than 900px. A focused contract failed before compact geometry and DPR policy were keyed to `window.innerWidth`.
6. The assay stage initially lacked the required pointer layer. A CSS production-contract assertion failed before the stage stacking fix.

Final automated state before handoff: 13 assay tests green (six pure runtime tests and seven production-contract tests). The repository-level verification is recorded again at the end of this report.

## Production integration

- Pinned exactly `three@0.185.1`.
- Self-hosted the package's `three.module.min.js`, required sibling `three.core.min.js`, and MIT license. There are no CDN, addon, controls, post-processing, authoring, or `.img2threejs` deploy paths.
- Kept the owned WebP as the eager first-paint, no-JS, no-WebGL, reduced-motion, coarse-pointer, save-data, and error fallback.
- Added one decorative canvas only after `window.load`, near-viewport intersection, idle scheduling, capability checks, and a successful first render.
- Implemented a rounded/crowned extruded body, deterministic desktop-only cast offsets, three torus rings, a concave lathed bowl, wrapped blue calibration line, deterministic vector `Ag / 47` mark, three recessed ticks, three procedural silver textures, a local equirectangular studio environment, and restrained key/rim/hemisphere lighting.
- Added bounded fine-pointer spring motion, review views, on-demand rendering, DPR caps, resize/intersection/visibility suspension, context-loss fallback, and idempotent disposal.
- Kept the canvas hidden from accessibility APIs and keyboard order (`aria-hidden`, `role=presentation`, `tabIndex=-1`). Print and all blocked-capability paths force the static fallback.

## Asset and module budgets

| Artifact | Dimensions | Raw bytes | Limit |
| --- | ---: | ---: | ---: |
| `assets/ag-assay-monolith-1280.webp` | 1280 x 819 | 35,336 | 184,320 |
| `assets/ag-assay-monolith-mobile.webp` | 720 x 461 | 11,172 | 102,400 |
| `dist/assay-scene.js` | n/a | 25,089 | 36,864 |
| `dist/assets/vendor/three.module.min.js` | n/a | 365,552 | 389,120 |
| `dist/assets/vendor/three.core.min.js` | n/a | 385,386 | 389,120 |
| `dist/assets/vendor/three.LICENSE.txt` | n/a | 1,081 | packaged |

The core sibling is an evidence-backed correction to the plan's module-plus-license wording. It is not a second renderer or addon; it is the relative dependency shipped by the same pinned `three@0.185.1` package. The deployable entry remains `/assets/vendor/three.module.min.js`, whose only package-internal dependency is local `./three.core.min.js`.

## Browser matrix

Local Playwright 1.61.1 used `/tmp/chromium` with a local in-process HTTP server. The final matrix is [browser-matrix.json](./3d-captures/browser-matrix.json): 14 passed, 0 failed, and no console/page errors.

All enhanced screenshots waited at least 750ms after `data-assay-state=ready` and asserted computed fallback opacity `0` and canvas-host opacity `1`, so the grade images contain no crossfade ghosting.

| Case | Result | Runtime evidence |
| --- | --- | --- |
| Match, side, grazing at 1440 x 960 | ready | 3,238 triangles, 8 draw calls, DPR 1, two idle frames |
| Wide at 1920 x 1080, device DPR 2 | ready | 3,238 triangles, 8 draw calls, capped DPR 1.5, zero overflow |
| Fine-pointer tablet at 768 x 1024, device DPR 2 | ready | 2,342 triangles, 8 draw calls, capped DPR 1.25, CTA topmost, zero overflow |
| 390 x 844 coarse pointer | fallback | `coarse-pointer`, zero canvases, no Three request, CTA in viewport |
| 320 x 800 coarse pointer | fallback | `coarse-pointer`, zero canvases, no Three request, zero overflow, full static object legible |
| Reduced motion | fallback | `reduced-motion`, zero canvases, no Three request |
| Save data | fallback | `save-data`, zero canvases, no Three request |
| WebGL blocked | fallback | `no-webgl`, zero canvases, no Three request, no console error |
| No JavaScript, mobile and desktop | fallback | picture, copy, CTA, phone, and intake remain present/usable; zero canvases |
| Context loss | fallback | `context-lost`, host hidden/cleared, no retry, CTA retained, Three request count unchanged |
| Pointer settle | pass | frame counter 2 to 18 during first 250ms; settles at 51 and remains 51 |
| Offscreen suspension | pass | frame counter remains 56 to 56 while offscreen |
| Page lifecycle freeze | pass | idle counter remains 86 to 86 across CDP freeze/activation |

Primary capture artifacts:

- [comparison-match.png](./3d-captures/comparison-match.png)
- [match-1440x960.png](./3d-captures/match-1440x960.png)
- [side-1440x960.png](./3d-captures/side-1440x960.png)
- [grazing-1440x960.png](./3d-captures/grazing-1440x960.png)
- [wide-1920x1080.png](./3d-captures/wide-1920x1080.png)
- [tablet-768x1024.png](./3d-captures/tablet-768x1024.png)
- [mobile-390x844.png](./3d-captures/mobile-390x844.png)
- [mobile-320x800.png](./3d-captures/mobile-320x800.png)
- [reduced-motion.png](./3d-captures/reduced-motion.png)
- [save-data.png](./3d-captures/save-data.png)
- [no-webgl.png](./3d-captures/no-webgl.png)
- [no-js.png](./3d-captures/no-js.png)
- [no-js-desktop.png](./3d-captures/no-js-desktop.png)
- [context-loss.png](./3d-captures/context-loss.png)

## Local performance evidence

[performance-evidence.json](./3d-captures/performance-evidence.json) records:

- fallback WebP is the local LCP candidate at 100ms;
- local CLS is 0;
- assay module request starts after `window.load`, and the Three entry starts after the capability module;
- fallback and ready stage rectangles are byte-for-byte identical;
- the renderer id is `ANGLE ... SwiftShader Device (Subzero)`, not a hardware GPU.

The available headless browser therefore cannot honestly close the representative hardware-desktop “no mount task over 50ms” gate. It records two SwiftShader shader/driver tasks (225ms and 345ms). A diagnostic CPU profile localized the blocking work to Three's synchronous shader/uniform discovery and Chromium's software driver; the owned procedural texture loop was approximately 16ms. Disabling Three shader-log checks did not improve the driver cost and was reverted. A hardware-GPU release-preview trace is still required.

INP is not claimed from a synthetic local run. Release-preview LCP, CLS, and INP remain deployment telemetry gates.

## Known approximation limits

- The generated fallback has denser cast scratches and photographic imperfections than the real-time procedural surface. The canvas intentionally uses restrained deterministic texture detail to avoid glitter, obvious tiling, and platform-dependent marks.
- The vector `Ag / 47` is deterministic and legible, but it is a shallow graphic relief rather than a fully Boolean-cut engraving.
- Match framing preserves the whole body inside the existing right-hand hero stage rather than reproducing the reference's full-bleed crop.
- The comparison utility packages the evidence only; it does not provide an acceptance score.
- No release-preview deployment was available to this implementation agent. Hardware-GPU mount timing and field Core Web Vitals remain for deployment verification.

## Final verification commands

Run immediately before merge/deploy:

```text
npm run verify
git diff --check
```

The implementation agent does not grade this work. A fresh visual/runtime reviewer should judge the captured match, side, grazing, mobile, fallback, context-loss, and pause evidence and then verify the deployed preview.
