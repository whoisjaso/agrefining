# AG Assay Monolith Production Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task by task. Use strict test-first red, green, refactor cycles. The integration implementer must not update the adversarial ledger or grade its own work.

**Goal:** Replace only the homepage furnace hero image with the generated AG assay-monolith image and an optional, restrained Three.js reconstruction while preserving the static fallback, conversion CTA, lower-page industrial photography, accessibility, and 39-document build contract.

**Architecture:** The generated image is the first-paint, LCP, no-JavaScript, no-WebGL, reduced-motion, coarse-pointer, and save-data experience. A small local controller module loads after `window.load`, near-viewport intersection, and an idle slot. It evaluates capabilities before dynamically importing a pinned, self-hosted Three.js core module. The renderer draws only on first frame, resize, review-view change, and a bounded pointer spring, then stops.

**Tech stack:** Existing Node static generator, native HTML/CSS/JavaScript, `three@0.185.1`, Node's built-in test runner, existing `sharp` asset optimizer, Vercel static hosting.

## Design read

Reading this as: an overhaul-quality B2B refining homepage for trust-conscious commercial sellers, using a cold-luxury silver, creme, and cobalt language with a Porsche-like level of restraint, not fashion-luxury theater.

- `DESIGN_VARIANCE: 7`: preserve the asymmetric copy and visual split.
- `MOTION_INTENSITY: 5`: one motivated inspection response, no autonomous spectacle.
- `VISUAL_DENSITY: 3`: the monolith gets visual space; the CTA and material intake remain primary.
- The exact Rollgates Luxury font file is not present or licensed in the repository. This integration does not introduce a substitute font or change the current typography stack.

## Current evidence and status

- Owned reference: `docs/qa/references/ag-assay-monolith-reference.png`
- Reference dimensions: `1536 x 1024`, RGB PNG, 3:2.
- Reference SHA-256: `5b86deb1febfa7f17088969d7b4f25f78c59408c4ea4e025efd5d737771c4b6f`
- Strict-quality sculpt spec: `.img2threejs/spec/object-sculpt-spec.json`
- Review-only generated blockout: `.img2threejs/generated/ag-assay-monolith.factory.ts`
- Reconstruction report: `docs/qa/3d-reconstruction-report.md`
- The strict spec passes, but the generated factory is only a blockout and is not production source.
- The current homepage hero uses `ag-silver-pour-1600.webp`; the lower `facility-feature` uses `ag-silver-hero-1600.webp`. Only the first asset is replaced.
- The current shared hero includes the primary pickup CTA, phone fallback, qualification note, and material intake. Their DOM order, hrefs, labels, and behavior stay unchanged.
- Current release contract remains 39 HTML documents and 38 indexed routes.

## Non-negotiable global constraints

1. Pin `three` exactly to `0.185.1`. Do not use `^`, `~`, `latest`, a CDN, an import map, or a second rendering package.
2. Serve only `node_modules/three/build/three.module.min.js` plus the upstream `LICENSE` from local build output.
3. Do not import `OrbitControls`, `RoomEnvironment`, `EffectComposer`, `RenderPass`, `BokehPass`, `UnrealBloomPass`, or any `three/examples` or `three/addons` path.
4. Do not copy the generated factory into production. Re-author the small object-specific scene from the validated spec.
5. Do not deploy `.img2threejs/`, its state, its PBR evidence, or its generated factory.
6. Keep the generated image visible until a successful WebGL frame has painted. Any failure returns to the same image without moving content.
7. JavaScript, WebGL, module loading, and interaction are optional. The CTA, phone link, form, navigation, and all page copy must work without them.
8. Do not import Three.js for reduced-motion, coarse-pointer, save-data, or no-WebGL outcomes.
9. No autonomous spin, drag orbit, zoom, scroll hijack, page-scroll listener, touch handler, custom cursor, bloom, depth of field, outer glow, or audio.
10. Fine-pointer movement is limited to `+/-7deg` yaw and `+/-4deg` pitch and returns to rest with a bounded spring.
11. The canvas is decorative, never focusable, never announced, and never intercepts touch scrolling.
12. The fallback image has meaningful alt text and remains in the accessibility tree after visual enhancement.
13. Keep a single renderer and canvas. Cap DPR at `1.5` for widths at least 900px and `1.25` below 900px.
14. Keep desktop triangles at or below 60,000, mobile fine-pointer triangles at or below 32,000, desktop draw calls at or below 18, and mobile fine-pointer draw calls at or below 12.
15. Prefer a CSS contact shadow and authored environment texture. Do not enable a shadow map unless visual review proves it necessary. If enabled after a graded correction, the map must be at most `1024 x 1024` desktop and `512 x 512` below 900px.
16. Do not add an automatic dark theme or a new accent. Use the existing `--canvas`, `--paper`, `--navy`, and `--mineral-blue` family.
17. Do not change URL structure, schema, SEO title, meta description, navigation labels, form names, analytics-relevant IDs, or the homepage journey order.
18. Do not write production changes until both new regression suites fail for the expected missing-feature reasons.
19. Execute this integration only after the form, navigation, Spanish, and touch-target fix batch is merged. Re-read `scripts/build.mjs`, `src/site.js`, `src/style.css`, `package.json`, and `scripts/verify.mjs` immediately before editing because those files are shared.

## File ownership and responsibilities

### Create

- `src/assay-scene.js`
  - Pure policy and spring helpers at module scope.
  - Object-specific geometry, materials, camera, lighting, renderer lifecycle, scheduling, fallback recovery, and disposal.
  - No top-level Three.js import. Three.js is dynamically imported inside `mountAssayScene` only after the capability decision passes.
- `tests/assay-scene-runtime.test.mjs`
  - Imports only pure exports from `src/assay-scene.js` and verifies decisions, bounds, settling, DPR, and review-view normalization.
- `tests/assay-production-contract.test.mjs`
  - Verifies generated HTML, committed fallback assets, local vendor output, license, homepage preservation, and deployable-module restrictions after `npm run build`.
- `assets/ag-assay-monolith-1280.webp`
  - `1280 x 819`, first-paint desktop fallback.
- `assets/ag-assay-monolith-mobile.webp`
  - `720 x 461`, first-paint mobile fallback.
- `docs/qa/fix-3d-assay-hero.md`
  - Implementer evidence: red output, green output, asset sizes, runtime metrics, capture paths, and remaining approximation limits.
- `docs/qa/3d-captures/`
  - Browser evidence only. The implementation agent may write captures here after code is green.

### Modify

- `package.json`
  - Add exact `three` dev dependency and a `test:assay` script.
  - Merge with any form-contract scripts already present; do not remove them.
- `package-lock.json`
  - Lock exact Three.js package and integrity metadata.
- `scripts/build.mjs`
  - Copy the local Three core module, license, and `src/assay-scene.js` into `dist`.
  - Replace only the homepage hero picture markup with the progressive enhancement shell.
- `src/site.js`
  - Add the load, near-viewport, and idle bootstrap. Keep this file unaware of Three APIs.
- `src/style.css`
  - Add stable fallback, canvas stacking, first-frame crossfade, transparent-canvas contact shadow, responsive behavior, print fallback, and state selectors.
- `scripts/check.mjs`
  - Require the scene source and both fallback assets.
- `scripts/verify.mjs`
  - Extend homepage and artifact assertions without changing the 39/38 contract.

### Do not modify in this batch

- `.img2threejs/**`
- `docs/qa/adversarial-persona-ledger.md`
- `api/leads.js`
- `src/review-form.mjs`
- form response tests
- any route slug, secondary page body, footer, legal copy, or lower-page industrial image

## Exact production markup contract

Replace the current first `.hero-media` picture with this structure. Keep it before `.hero-commercial-grid` so the existing asymmetric desktop composition is unchanged.

```html
<div class="hero-media assay-stage" data-assay-stage data-assay-state="fallback">
  <picture class="assay-fallback" data-assay-fallback>
    <source media="(max-width: 700px)" srcset="/assets/ag-assay-monolith-mobile.webp">
    <img
      src="/assets/ag-assay-monolith-1280.webp"
      alt="Cast-silver AG assay monolith with a blue line, concentric well, and Ag 47 mark"
      width="1280"
      height="819"
      fetchpriority="high"
    >
  </picture>
  <div class="assay-canvas-host" data-assay-canvas-host hidden aria-hidden="true"></div>
</div>
```

Markup rules:

- Do not add `loading="lazy"` to this image.
- Do not put text, pills, tooltips, instructions, or controls over the image.
- Do not wrap the media in a link.
- Do not place a canvas in generated HTML. JavaScript creates it only after capability approval.
- Keep exactly one hero pickup link and the existing telephone fallback inside `.hero-copy`.
- Keep `.intake-panel` after the copy exactly as the latest form/navigation implementation expects.
- Keep the lower `.industrial-feature-picture` and `ag-silver-hero-1600.webp` source unchanged.

## Static fallback asset contract

Run from the repository root after the red tests exist:

```bash
node scripts/optimize-asset.mjs \
  docs/qa/references/ag-assay-monolith-reference.png \
  ag-assay-monolith \
  --preset material \
  --quality 70
```

This existing preset intentionally produces `1280 x 819` and `720 x 461` variants without adding another optimizer path. Acceptance budgets:

- `assets/ag-assay-monolith-1280.webp` at or below 180 KiB.
- `assets/ag-assay-monolith-mobile.webp` at or below 100 KiB.
- Both decode with the declared intrinsic dimensions.
- The entire monolith, both rounded ends, blue line, ring system, and `Ag / 47` remain visible. Use `object-fit: contain`, not an attention crop in CSS.
- The creme backdrop may be retained. Its stage background is `#eee3d4` so the fallback and transparent WebGL scene do not flash between different neutrals.

If the first command exceeds either byte budget, rerun the same command with `--quality 66 --force`; do not change dimensions or switch to JPEG.

## Build and dependency contract

Install the exact runtime source as a build dependency:

```bash
npm install --save-dev --save-exact three@0.185.1
```

`scripts/build.mjs` must perform these copies after creating `dist/assets` and after copying the committed `assets` directory:

```js
mkdirSync(join(out, "assets", "vendor"), { recursive: true });
cpSync(join(root, "node_modules", "three", "build", "three.module.min.js"), join(out, "assets", "vendor", "three.module.min.js"));
cpSync(join(root, "node_modules", "three", "LICENSE"), join(out, "assets", "vendor", "three.LICENSE.txt"));
cpSync(join(root, "src", "assay-scene.js"), join(out, "assay-scene.js"));
```

Expected deploy paths:

- `/assay-scene.js`
- `/assets/vendor/three.module.min.js`
- `/assets/vendor/three.LICENSE.txt`

Raw size gates:

- `three.module.min.js` at or below 380 KiB.
- `assay-scene.js` at or below 36 KiB before transport compression.
- No source map is required or deployed.
- `package.json` must contain exactly `"three": "0.185.1"`.

## `src/assay-scene.js` public interface

The file must have no DOM access that runs at import time. Export these names exactly:

```js
export const ASSAY_LIMITS = Object.freeze({
  yawRadians: 7 * Math.PI / 180,
  pitchRadians: 4 * Math.PI / 180,
  settleMilliseconds: 1200,
  desktopDpr: 1.5,
  compactDpr: 1.25
});

export function resolveAssayMode(capabilities) {}
export function normalizeAssayReviewView(value) {}
export function assayPointerIntent(clientX, clientY, rect) {}
export function stepAssaySpring(state, target, deltaSeconds) {}
export function selectAssayPixelRatio(width, devicePixelRatio) {}
export async function mountAssayScene(stage, options = {}) {}
```

### Pure return contracts

`resolveAssayMode` accepts:

```js
{
  reducedMotion: boolean,
  coarsePointer: boolean,
  saveData: boolean,
  hasWebGL: boolean
}
```

It returns one of:

```js
{ enhance: true, reason: "interactive" }
{ enhance: false, reason: "reduced-motion" }
{ enhance: false, reason: "coarse-pointer" }
{ enhance: false, reason: "save-data" }
{ enhance: false, reason: "no-webgl" }
```

Use deterministic priority `save-data`, `reduced-motion`, `coarse-pointer`, `no-webgl`, then `interactive`. The priority affects only diagnostics; every blocked branch keeps the same fallback.

`normalizeAssayReviewView` returns only `match`, `side`, or `grazing`; every other value returns `match`.

`assayPointerIntent` returns `{ yaw, pitch }`, normalized against the stage rect and clamped to `ASSAY_LIMITS`. It must return `{ yaw: 0, pitch: 0 }` for a zero-sized rect.

`stepAssaySpring` accepts and returns:

```js
{
  yaw: number,
  pitch: number,
  yawVelocity: number,
  pitchVelocity: number
}
```

Use stiffness `75`, damping `16`, and clamp `deltaSeconds` to `1 / 30`. Clamp the resulting angles to the public limits. The scheduler must snap to the target and stop by 1200ms even if a browser stalls.

`selectAssayPixelRatio` returns `min(devicePixelRatio, 1.5)` at widths at least 900px and `min(devicePixelRatio, 1.25)` below 900px. Treat missing or invalid DPR as `1`.

### Mount return contract

On an approved capability path, `mountAssayScene` resolves to:

```js
{
  pause(),
  resume(),
  requestRender(),
  dispose(),
  getDiagnostics()
}
```

`getDiagnostics()` returns a fresh object with:

```js
{
  state,
  active,
  disposed,
  frameCount,
  triangles,
  drawCalls,
  pixelRatio,
  reviewView,
  contextLost
}
```

On a blocked capability path, call `options.onFallback(reason)` and resolve to `null` without importing Three.js or unhiding the canvas host.

Supported options:

```js
{
  reviewView: "match" | "side" | "grazing",
  onReady(diagnostics) {},
  onFallback(reason) {}
}
```

## Capability and load sequence

The bootstrap in `src/site.js` must follow this order:

1. Query one `[data-assay-stage]`; exit on all other pages.
2. Wait for `window.load`. If load already fired, continue without adding a stale listener.
3. Use `IntersectionObserver` with `rootMargin: "200px 0px"` and threshold `0`. If the API is absent, continue to the idle gate.
4. Once near the viewport, disconnect that observer.
5. Use `requestIdleCallback` with a 1500ms timeout. Use a 250ms `setTimeout` fallback where the API is absent.
6. Set `data-assay-state="loading"`. The fallback remains fully opaque.
7. Dynamically import `/assay-scene.js?v=20260804-assay`.
8. Pass the allowlisted `assay_view` query value to `mountAssayScene`.
9. On `onReady`, set `data-assay-state="ready"` and copy diagnostics to numeric data attributes for browser verification.
10. On `onFallback` or any rejected import/mount promise, set `data-assay-state="fallback"`, set `data-assay-fallback-reason`, hide the canvas host, and leave the picture untouched.
11. Keep the bootstrap observer, idle handle, and disposed flag in `src/site.js`. On `pagehide`, disconnect or cancel whichever bootstrap work is still pending; if a controller exists, call `dispose()` once.

The first Three.js import appears only inside `mountAssayScene`, after this capability snapshot passes:

- `matchMedia("(prefers-reduced-motion: reduce)").matches === false`
- `matchMedia("(pointer: coarse)").matches === false`
- `navigator.connection?.saveData !== true`
- a scratch canvas can create `webgl2` or `webgl`

Release the scratch context with `WEBGL_lose_context` when the extension exists.

## First-frame and fallback state machine

Use these states only:

```text
fallback -> loading -> ready
fallback <- any loading or runtime failure
ready -> fallback on webglcontextlost
ready -> disposed on pagehide
```

- `fallback`: picture opacity `1`; host hidden; no canvas.
- `loading`: picture opacity `1`; host unhidden at opacity `0`; canvas may be preparing.
- `ready`: entered only after `renderer.render()` completes without throwing and the next animation frame begins. Canvas fades to `1`; picture fades to `0` but stays in DOM.
- `webglcontextlost`: call `preventDefault()`, cancel scheduling, set fallback state, hide and clear the host, dispose reachable resources, and do not auto-retry.
- `webglcontextrestored`: remain on the static fallback. A reload is the only retry, which prevents a context-loss loop.

Use a 420ms canvas fade and a 520ms fallback fade with the existing `--ease`. The global reduced-motion rule already collapses transitions, but blocked reduced-motion users never enter `loading`.

## Object-specific model contract

Use a plain `THREE.Group` named `ag-assay-monolith`. Do not create an invisible root mesh.

### Coordinate frame

- `+X`: long body axis.
- `+Y`: top normal.
- `+Z`: front face with three ticks.
- Root pivot: body center.
- Body dimensions: `4.8 x 0.72 x 1.7`.

### Rounded cast body

Implement `createRoundedMonolithGeometry(THREE)` with a rounded 2D rectangle `THREE.Shape` extruded across the body height, rotated into the X/Y/Z frame, centered, and recomputed normals.

- Plan corner radius: `0.16`.
- Shape curve segments: `5`.
- Extrusion bevel segments: `4`.
- Extrusion bevel size and thickness: start at `0.10`, then tune only through graded render evidence.
- Crown: deform only top-facing vertices by at most `0.025`, strongest near the X/Z center and zero at the perimeter.
- Cast asymmetry: at most six deterministic, seeded perimeter offsets, each at or below `0.018`. Do not perturb the mobile silhouette.
- Reject an unmodified `BoxGeometry` for the body.

### Assay rings and bowl

Implement `createAssayRelief(THREE, materials)`.

- Center: approximately `x=-0.12`, `z=0.08`.
- Three separate torus ridges with radii `0.50`, `0.39`, and `0.28`.
- Tube radius: `0.025` outer, `0.022` middle, `0.020` inner.
- Torus radial segments: `8`; tubular segments: `48` desktop and `32` compact fine-pointer mode.
- Rotate each torus so its axis is `+Y`.
- Vary ridge height by no more than `0.018` so grazing highlights do not look machined-perfect.
- Build the bowl as a concave `LatheGeometry`, not a disc. The visible profile has a center just above the body top, a rounded inner wall, and a rim about `0.044` higher than its center so the surface is never hidden inside the solid body.
- The side review must show real depth and concavity. A convex plug or painted bullseye fails.

### Blue calibration line

Implement `createCalibrationLine(THREE, blueMaterial)`.

- One nearly flush top strip across the long axis near `z=-0.36`.
- Two short end-wrap strips at the body ends.
- Saturated blue from the spec: `#0d5e9c`.
- Roughness about `0.34`, metalness at most `0.05`.
- Height above the surface at or below `0.012`.
- No emissive channel, bloom, or glow.

### `Ag / 47` mark

Implement `createIdentityMarkTexture(THREE)` and `createIdentityMark(THREE, texture, material)`.

- Create a `512 x 160` local `CanvasTexture` with fixed vector path commands for `Ag / 47`; do not call `fillText` or depend on an operating-system font.
- Draw a dark recessed stroke plus a one-pixel lower-right silver highlight so it reads as shallow engraved relief at hero size.
- Use a single transparent plane carrier, nearly flush with the crowned top, around `x=1.35`, `z=0.18`.
- The carrier must not have a visible rectangular edge.
- The mark must read as `Ag / 47`, not `AG`, `Ag-47`, or an invented logo.

### Three front ticks

Implement `createFrontTicks(THREE, recessedMaterial)` as one `InstancedMesh` with count `3`.

- Place on the front-left face near `x=-1.84`, `z=+0.85`.
- Use slightly nonuniform X positions and heights: offsets `0`, `0.11`, `0.23`; height multipliers `0.92`, `1.0`, `0.86`.
- Sink the geometry into the face so it reads as a groove, not three attached rods.
- The tick system must remain visible at the 390px fallback and at the desktop match render.

## Materials, environment, and lighting

Implement one shared material set. No material is created per frame.

### Satin silver

- `MeshPhysicalMaterial`
- Base color `#b6a699`
- Metalness `1.0`
- Roughness `0.43`
- Clearcoat `0.04`
- Clearcoat roughness `0.42`
- Environment intensity near `1.0`, adjusted only through graded capture.

Implement `createSilverSurfaceTextures(THREE)` with three independent `256 x 256` deterministic textures generated once after the lazy import:

1. Albedo: broad low-frequency poured value drift, amplitude at most `0.07`, sRGB.
2. Roughness: independent macro and meso field centered around `0.43`, `NoColorSpace`.
3. Normal: independent directional micro-scratch and sparse-pit field, `NoColorSpace`, normal scale around `0.20`.

Do not reuse one texture object for more than one channel. Do not deploy the `.img2threejs` extracted maps directly because they contain whole-image projection, lighting, glyph, and background evidence. Keep total generated texture edges at or below `3 x 256`, and dispose all three.

### Studio environment

Implement `createStudioEnvironmentTexture(THREE)` as a local `128 x 64` equirectangular `CanvasTexture`:

- Warm creme upper-front-left band.
- Neutral silver mid band.
- Restrained blue-gray rear-right patch.
- `EquirectangularReflectionMapping`.
- Use as `scene.environment`, not `scene.background`.

The WebGL renderer remains alpha-transparent over the stage's `#eee3d4` CSS background.

### Lights

- One warm directional key from upper-front-left.
- One low-intensity cool directional rim from rear-right.
- One hemisphere fill.
- ACES Filmic tone mapping.
- Exposure starts at `0.95` and must keep highlights below clipping.
- No ambient-only scene.
- No postprocessing.
- No default shadow map. Use a CSS radial contact shadow that appears only in `ready` state.

## Camera and deterministic review views

Implement `configureAssayCamera(THREE, camera, view, aspect)` with exactly three allowlisted views:

- `match`: 34 degree FOV, elevated three-quarter camera aligned with the reference, target near the root center. Frame the object to about 90 percent of the stage width without cropping either rounded end.
- `side`: thickness-axis proof with enough elevation to see the top relief and bowl depth. Do not compare this view pixel-for-pixel to the single reference.
- `grazing`: close three-quarter view with the key lowered enough to expose bevel continuity, roughness variation, and shallow marks without clipping highlights.

Review query examples:

```text
/?assay_view=match
/?assay_view=side
/?assay_view=grazing
```

Pointer interaction is disabled for `side` and `grazing` so capture is deterministic. Invalid query values normalize to `match`.

## On-demand scheduler and interaction

Implement one private scheduler. It may request frames only for:

- first render;
- `ResizeObserver` size change;
- fine-pointer movement inside the stage;
- pointer leave or cancel spring return;
- document visibility resume;
- stage re-entry after intersection pause;
- review-view initialization.

Rules:

- Listen to `pointermove`, `pointerleave`, and `pointercancel` on the stage, never the document.
- Do not listen for touch events.
- The canvas has `pointer-events: none`.
- At most one `requestAnimationFrame` is pending.
- A pointer burst updates the target but does not queue multiple frames.
- Cancel the frame when the stage leaves the viewport or `document.hidden` becomes true.
- On resume, render one current frame. Do not start an idle loop.
- Stop when position error and velocity are each below `0.0005`, or at 1200ms. At the time ceiling, snap to target and render once.
- Keep a monotonic `frameCount` for QA. Normal untouched idle state must remain at one or two frames.

## Visibility, context loss, and disposal

Use:

- one `ResizeObserver` for the stage;
- one runtime `IntersectionObserver` at threshold `0`;
- one `visibilitychange` listener;
- one `pagehide` listener in `src/site.js`;
- `webglcontextlost` and `webglcontextrestored` on the created canvas.

`dispose()` must be idempotent and perform all of the following:

1. Cancel the pending animation frame. The bootstrap in `src/site.js` owns and cancels any not-yet-fired idle callback or timeout.
2. Disconnect both observers.
3. Remove pointer, visibility, context, and resize listeners.
4. Traverse the object tree and dispose each unique geometry once.
5. Dispose each unique material and every reachable texture once.
6. Dispose the environment texture.
7. Call `renderer.renderLists.dispose()` and `renderer.dispose()`.
8. Call `renderer.forceContextLoss()` only during explicit final disposal, not during the context-loss handler.
9. Remove the canvas and clear the host.
10. Mark diagnostics `disposed: true`.

## CSS contract

Add selectors beside the existing homepage hero styles, not in an unrelated global block.

```css
.assay-stage {
  background: #eee3d4;
  isolation: isolate;
}

.assay-fallback,
.assay-canvas-host {
  inset: 0;
  position: absolute;
}

.assay-fallback {
  opacity: 1;
  transition: opacity 520ms var(--ease);
  z-index: 3;
}

.assay-fallback img {
  object-fit: contain;
}

.assay-canvas-host {
  opacity: 0;
  pointer-events: none;
  transition: opacity 420ms var(--ease);
  z-index: 2;
}

.assay-canvas-host canvas {
  display: block;
  height: 100%;
  pointer-events: none;
  width: 100%;
}

.assay-stage[data-assay-state="ready"] .assay-fallback {
  opacity: 0;
}

.assay-stage[data-assay-state="ready"] .assay-canvas-host {
  opacity: 1;
}
```

Also add:

- a `ready`-only radial contact-shadow pseudo-element below the canvas;
- explicit z-index for the existing `.hero-media::after` wash so it remains a restrained top layer;
- `@media (max-width: 700px)` rules that retain the current 13rem media frame and full fallback image;
- `@media print` rules that hide `.assay-canvas-host` and force `.assay-fallback` opacity to `1`;
- no new global `will-change` or continuous animation.

## Accessibility contract

- Fallback alt text is exactly the meaningful description in the markup contract.
- Canvas host has `aria-hidden="true"` before and after enhancement.
- Created canvas has `aria-hidden="true"`, `role="presentation"`, and `tabIndex=-1`.
- No `aria-live` message announces visual enhancement or fallback failure.
- No new focusable element is created.
- Keyboard order remains skip link, shared header, hero CTA/phone, intake controls, then the rest of the page.
- The model never controls or obscures the CTA.
- Contrast and meaning do not depend on the blue line alone; adjacent hero copy carries the commercial message.

## Test-first task sequence

### Task 1: Pure runtime policy and motion contract

**Files:**

- Create: `tests/assay-scene-runtime.test.mjs`
- Create after red: `src/assay-scene.js`

- [ ] Write the runtime test before the source module exists.

The test must cover this table with literal expected results:

```js
const cases = [
  [{ saveData: true, reducedMotion: false, coarsePointer: false, hasWebGL: true }, { enhance: false, reason: "save-data" }],
  [{ saveData: false, reducedMotion: true, coarsePointer: false, hasWebGL: true }, { enhance: false, reason: "reduced-motion" }],
  [{ saveData: false, reducedMotion: false, coarsePointer: true, hasWebGL: true }, { enhance: false, reason: "coarse-pointer" }],
  [{ saveData: false, reducedMotion: false, coarsePointer: false, hasWebGL: false }, { enhance: false, reason: "no-webgl" }],
  [{ saveData: false, reducedMotion: false, coarsePointer: false, hasWebGL: true }, { enhance: true, reason: "interactive" }]
];
```

Add separate tests that:

- clamp extreme pointer coordinates to exactly the public yaw and pitch limits;
- return zero intent for a zero-sized rect;
- keep every spring step within the limits;
- settle within 1200ms when iterated with `1/60` second steps;
- return DPR `1.5` for width `1440`, device DPR `3`;
- return DPR `1.25` for width `768`, device DPR `3`;
- return DPR `1` for invalid DPR;
- normalize invalid review views to `match`.

- [ ] Run the red test:

```bash
node --test tests/assay-scene-runtime.test.mjs
```

Expected red: `ERR_MODULE_NOT_FOUND` for `src/assay-scene.js`. A syntax error or fixture error is not an accepted red.

- [ ] Implement only the pure exports and rerun until this test passes.

### Task 2: Generated production contract

**Files:**

- Create: `tests/assay-production-contract.test.mjs`
- Modify after red: `package.json`, `package-lock.json`, `scripts/build.mjs`, `scripts/check.mjs`, `scripts/verify.mjs`
- Create after red: two committed WebP assets

- [ ] Write the generated contract test against the current build before changing markup or dependencies.

Required assertions:

```js
assert.equal(packageJson.devDependencies.three, "0.185.1");
assert.equal((home.match(/data-assay-stage/g) || []).length, 1);
assert.match(home, /data-assay-state="fallback"/);
assert.match(home, /data-assay-canvas-host hidden aria-hidden="true"/);
assert.match(home, /ag-assay-monolith-mobile\.webp/);
assert.match(home, /ag-assay-monolith-1280\.webp/);
assert.match(home, /fetchpriority="high"/);
assert.doesNotMatch(home.match(/<div class="hero-media assay-stage"[\s\S]*?<\/div>/)?.[0] || "", /loading="lazy"/);
assert.match(home, /ag-silver-hero-1600\.webp/);
assert.equal((hero.match(/href="\/contact\?intent=pickup"/g) || []).length, 1);
assert.match(hero, /href="tel:\+12818982719"/);
```

Also assert:

- both fallback files exist, have exact dimensions, and stay within byte budgets;
- the local Three module and license exist in `dist`;
- the license contains `MIT License`;
- raw Three and scene modules stay within size budgets;
- `dist/assay-scene.js` contains only the local `/assets/vendor/three.module.min.js` runtime import;
- it contains no `http://`, `https://`, `OrbitControls`, `EffectComposer`, `BokehPass`, `UnrealBloomPass`, `RoomEnvironment`, `three/examples`, or `three/addons`;
- no `.img2threejs` path appears in any deployed HTML, CSS, or JavaScript;
- all 39 HTML documents still exist.

- [ ] Run the current build and the new contract:

```bash
npm run build
node --test tests/assay-production-contract.test.mjs
```

Expected red: missing pinned dependency, stage markup, fallback assets, scene module, local vendor module, and license. Existing homepage assertions should remain green.

- [ ] Install exact Three.js, generate fallback assets, and add build copies.
- [ ] Add the markup shell and extend `check`/`verify` assertions.
- [ ] Rerun the production contract to green before adding WebGL behavior.

### Task 3: Object-specific scene and lifecycle

**Files:**

- Modify: `src/assay-scene.js`
- Test: `tests/assay-scene-runtime.test.mjs`

- [ ] Add failing pure tests for any helper behavior introduced by the lifecycle implementation before adding that behavior.
- [ ] Implement the capability snapshot and local Three import inside `mountAssayScene`.
- [ ] Implement rounded body, assay relief, blue line, fixed-vector identity mark, tick instances, materials, environment, lights, and camera views.
- [ ] Implement resize, visibility, intersection, context, scheduling, diagnostics, and idempotent disposal.
- [ ] Rerun the pure and production contract tests.

### Task 4: Lazy bootstrap and visual state

**Files:**

- Modify: `src/site.js`
- Modify: `src/style.css`
- Test: `tests/assay-production-contract.test.mjs`

- [ ] Add failing generated assertions for the script version, stage states, CSS state selectors, print fallback, and absence of an eager Three `<script>` tag.
- [ ] Add the exact load, intersection, idle, import, ready, fallback, and pagehide sequence.
- [ ] Add CSS layering and crossfade without changing hero sizing or CTA layout.
- [ ] Rerun all tests and full verify.

### Task 5: Browser behavior and visual grading

**Files:**

- Create captures under `docs/qa/3d-captures/`
- Create: `docs/qa/fix-3d-assay-hero.md`

- [ ] Serve current `dist` without installing a browser package:

```bash
python3 -m http.server 4173 --directory dist
```

- [ ] Use the already available browser tool to exercise the matrix below.
- [ ] Record runtime diagnostics and create the comparison sheet.
- [ ] Grade against the rubric. If a critical target fails, stop release and open a new bounded correction round with at most three changes.

## Automated test commands

Add this script without removing any existing form/navigation tests:

```json
{
  "scripts": {
    "test:assay": "node --test tests/assay-scene-runtime.test.mjs tests/assay-production-contract.test.mjs"
  }
}
```

The final `verify` chain must run build first, then every generated interaction/API test already introduced by the other fix batch, then `test:assay`, `check`, and `scripts/verify.mjs`.

Final local commands:

```bash
npm run verify
git diff --check
```

Expected success markers must include the existing 39/38 build contract and passing Node tests. No warning, unhandled rejection, missing asset, or browser console error is accepted.

## Render-capture and behavior matrix

| Capture | Viewport and capability | Expected result | Evidence path |
| --- | --- | --- | --- |
| Reference match | 1440 x 960, DPR 1, fine pointer, WebGL | Ready canvas, full body in frame, CTA unchanged | `docs/qa/3d-captures/match-1440x960.png` |
| Thickness proof | 1440 x 960, `assay_view=side` | Real volume, softened body, bowl not a flat disc | `docs/qa/3d-captures/side-1440x960.png` |
| Material proof | 1440 x 960, `assay_view=grazing` | Bevel and multiscale surface response, no clipped chrome | `docs/qa/3d-captures/grazing-1440x960.png` |
| Wide layout | 1920 x 1080 | Hero remains composed, visual does not crowd copy | `docs/qa/3d-captures/wide-1920x1080.png` |
| Tablet | 768 x 1024, compact DPR | Fallback or fine-pointer capped render, no overflow | `docs/qa/3d-captures/tablet-768x1024.png` |
| Mobile | 390 x 844, coarse pointer | Static fallback, no Three request, CTA visible | `docs/qa/3d-captures/mobile-390x844.png` |
| Narrow mobile | 320 x 800, coarse pointer | Static fallback, full object legible, no horizontal overflow | `docs/qa/3d-captures/mobile-320x800.png` |
| Reduced motion | 1440 x 960, reduced motion | Static fallback, no Three request | `docs/qa/3d-captures/reduced-motion.png` |
| Save data | 1440 x 960, `saveData=true` | Static fallback, no Three request | `docs/qa/3d-captures/save-data.png` |
| No WebGL | 1440 x 960, WebGL blocked | Static fallback, no console error | `docs/qa/3d-captures/no-webgl.png` |
| No JavaScript | 390 x 844 and 1440 x 960 | Picture, copy, CTA, phone, and intake remain usable | `docs/qa/3d-captures/no-js.png` |
| Context loss | Desktop after ready | Returns to fallback, does not retry, CTA unaffected | `docs/qa/3d-captures/context-loss.png` |
| Offscreen pause | Desktop, pointer spring then scroll away | `frameCount` stops increasing offscreen | recorded in fix report |
| Hidden pause | Desktop, spring then background tab | `frameCount` stops until visible, then one current render | recorded in fix report |

Create the main comparison artifact with the installed safe pipeline:

```bash
python3 /root/.codex/skills/remote-skills/skill-6a7226c910fc8191aced6601d6b188ce/forge/stage4_review/make_comparison_sheet.py \
  --reference docs/qa/references/ag-assay-monolith-reference.png \
  --render docs/qa/3d-captures/match-1440x960.png \
  --out docs/qa/3d-captures/comparison-match.png \
  --json
```

The comparison utility packages evidence; it is not acceptance authority.

## Visual grading rubric

The fresh grader inspects `comparison-match.png`, `side-1440x960.png`, `grazing-1440x960.png`, and the mobile captures. Pixel similarity is advisory because the reference and render differ in framing and lighting.

### Layer thresholds

- Silhouette and proportion: `>= 0.82`
- Component structure: `>= 0.82`
- Form detail: `>= 0.80`
- Material and surface: `>= 0.75`
- Lighting and camera: `>= 0.75`
- Overall: `>= 0.78`

### Critical feature thresholds

- Long, low rounded cast body: `>= 0.80`
- Three-ring assay relief plus concave bowl: `>= 0.80`
- Blue wrapped line, `Ag / 47`, and three ticks: `>= 0.80`
- Satin poured-silver response: `>= 0.75`

No average can hide a failed critical feature.

### Automatic visual reject conditions

- Sharp or generic box body.
- Bowl reads as a convex plug, flat disc, or painted target.
- Wrong ring count.
- Missing blue end wrap.
- `Ag / 47` missing, mirrored, or illegible at desktop hero size.
- Three ticks missing or reading as attached rods.
- Surface reads as uniform chrome, flat gray plastic, glitter noise, or obvious texture tiling.
- Highlights clip to featureless white.
- Canvas background flashes or forms a visible rectangle against the creme stage.
- Perpetual movement after pointer settle.
- Mobile receives an interactive canvas or loses touch scrolling.
- Any fallback branch removes the image, CTA, phone link, or intake.
- Lower industrial photography is removed, duplicated, or replaced.

## Performance acceptance

Measure after visual acceptance, not before geometry is recognizable.

- One renderer and one canvas.
- No more than 60,000 desktop triangles and 18 draw calls.
- No more than 32,000 compact fine-pointer triangles and 12 draw calls.
- DPR caps exactly match the policy tests.
- Normal idle settles to at most two initial frames and no increasing counter.
- Pointer spring stays at or above 60 fps desktop and 45 fps compact fine-pointer during its bounded settle window.
- No single mount task longer than 50ms in a representative desktop trace.
- No layout shift from fallback to canvas; CLS contribution from the stage is `0`.
- Three.js request starts after `window.load`, intersection, and idle scheduling, not during fallback LCP fetch.
- Homepage LCP remains below 2.5s, INP below 200ms, and CLS below 0.1 on the release preview.
- Raw asset and module byte budgets all pass automated checks.

## Fresh grading and correction loop

The implementer writes evidence but does not approve release. A fresh grader must:

1. Re-run `npm run verify` and `git diff --check`.
2. Run the pure tests with at least these mutations one at a time: raise yaw above 7 degrees, allow coarse enhancement, remove context-loss fallback, and remove the lower industrial asset assertion. Each mutation must make a test fail.
3. Inspect local and preview browser captures.
4. Score every required layer and critical feature.
5. Write `docs/qa/grade-3d-assay-hero-round1.md` with PASS or FAIL and exact evidence.

If the grade fails:

- Open a fresh repair agent, not the grader or original implementer.
- Choose at most three evidence-backed corrections for the round.
- Fix production only after a new failing regression or visual proof exists.
- Spawn a new grader for the next round.
- Stop after five rounds and report the unresolved blocker instead of weakening thresholds.

## Key integration hazards

1. **Shared-file collision:** the form/navigation/Spanish batch also owns `scripts/build.mjs`, `src/site.js`, `src/style.css`, `package.json`, and verify code. Serial execution is mandatory.
2. **Generated factory misuse:** it imports multiple addons, creates a sharp blockout, allocates excessive textures, uses a 4096 shadow, and lacks lifecycle controls. Treat it only as evidence of what not to ship.
3. **Whole-image PBR projection:** extracted evidence maps contain body silhouette, marks, shadow, and background. Applying them directly would create a projected-photo artifact.
4. **Metal without reflection structure:** a metallic material with only ambient or flat direct light reads black or plastic. The small local environment and separated key/fill/rim are required.
5. **Fake bowl depth:** placing a lathed surface below the solid body's top plane will hide it. Keep the visible concave surface just above the body top or perform a real cut; visual side proof decides acceptance.
6. **Mark nondeterminism:** `fillText` changes by operating system and font availability. Fixed vector paths are required for capture stability.
7. **Premature crossfade:** setting `ready` immediately after module import can expose a blank canvas. The state changes only after a completed render and the next frame boundary.
8. **Context-loss loop:** automatic recreation can repeatedly allocate renderers. Context loss falls back for the remainder of the page session.
9. **Idle loop creep:** damping code often leaves a perpetual rAF. The time ceiling, numeric epsilon, frame counter, offscreen tests, and mutation checks guard it.
10. **Hero trust regression:** the 3D object is decorative brand evidence, not the conversion path. CTA count, phone fallback, form order, copy, qualification language, and lower industrial proof stay protected by tests.
11. **Fallback crop:** current `.hero-media img` uses `object-fit: cover`. The assay fallback needs the more specific `object-fit: contain` rule or its rounded ends and identity marks may be cropped.
12. **Deployment packaging:** local development can resolve `node_modules`, but production cannot. Build-copy and license assertions must pass against `dist`, not only source.

## Release definition

The 3D hero is releasable only when:

- both test suites were observed red for the intended missing behavior before implementation;
- all existing form, navigation, Spanish, trust, SEO, and route checks remain green;
- the fresh visual grader passes the match, side, grazing, mobile, fallback, and pause evidence;
- every fallback branch preserves the image and conversion path;
- runtime metrics meet geometry, draw-call, frame, DPR, and byte budgets;
- 39 HTML documents and 38 sitemap entries remain;
- a Vercel preview passes browser smoke and runtime-error inspection before production promotion.
