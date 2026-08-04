# AG assay monolith reconstruction report

Date: 2026-08-04
Profile: generic local-PNG workflow
Reference: `docs/qa/references/ag-assay-monolith-reference.png`
Workflow root: `.img2threejs/`

## Outcome

The reference is admitted as **conditional but suitable** for a procedural, real-time Three.js approximation. The image has one isolated opaque target, an uninterrupted silhouette, visible top/front/end depth, legible materials, and enough hard-surface evidence to build a convincing web-hero object. It does not establish manufacturing dimensions, hidden-face marks, exact recess depths, or exact glyph vectors.

An object-specific `ObjectSculptSpec` now passes the upstream strict-quality validator. The spec contains:

- two macro components, five meso systems, seven mapped local-feature groups, four material layers, and two repeated systems;
- ten evidence-linked identity details spanning bevels, the assay recess, concentric ridges, the blue line, glyphs, ticks, scratches, mottle, polish, and cast dents;
- a root inspection pivot, stable named surface-system pivots, collider intent, and a deliberately nonbreakable action contract;
- desktop and mobile budgets for triangles, draw calls, texture size, DPR, frame rate, and renderer count;
- reference-derived PBR evidence at confidence `0.86` against the required `0.70` threshold.

The upstream generator produced a **review-only blockout factory** at `.img2threejs/generated/ag-assay-monolith.factory.ts`. It is not production-ready and has not been visually accepted. No browser render was created in this isolated workstream, so render capture, multi-angle review, visual grading, and pass advancement remain intentionally blocked.

## Observed reconstruction contract

### Macro form

- Normalized body proportions: approximately `4.8 × 0.72 × 1.7` (length × height × depth).
- Low rounded rectangular body with countable planar faces, broad softened perimeter transitions, slight top crown, and sparse cast asymmetry.
- `+X` is the long axis, `+Y` is top, and `+Z` is the visible front long face.

### Meso systems

1. Cast silver monolith body.
2. Three-ring assay relief slightly left of center.
3. Recessed rotationally symmetric assay bowl.
4. Thin saturated-blue calibration line near the rear third, wrapping over visible ends.
5. Recessed `Ag / 47` mark on the top-right.
6. Three narrow recessed ticks on the front-left face.

### Micro response

- Low-frequency poured value drift.
- Meso directional brushing, sparse pits, and shallow edge dents.
- Fine scratches that break highlights without visibly corrupting the silhouette at mobile size.
- Lower roughness on bevel and ring crests; higher roughness and AO in recesses.

### Camera and lighting

- Reference-review camera: approximately 34° FOV, elevated three-quarter view, 3:2 aspect.
- Warm broad key from upper-front-left, warm-neutral environment fill, restrained cool rear-right rim.
- Cream `#EEE3D4` ground/backdrop and a soft contact shadow falling camera-right/back.
- ACES Filmic intent with exposure around `0.9–1.05`; clipped chrome highlights are a failure.

## Validation evidence

### Intake and state

```text
python3 /root/.codex/skills/remote-skills/skill-6a7226c910fc8191aced6601d6b188ce/forge/state.py init \
  --state /workspace/scratch/bfc565b217a9/agrefining/.img2threejs/state.json \
  --reference docs/qa/references/ag-assay-monolith-reference.png \
  --profile generic --max-per-pass 3 --max-total 6
```

Initial state: `active`, step `image-analysis`, correction budget `0/3` for the pass and `0/6` total.

```text
python3 /root/.codex/skills/remote-skills/skill-6a7226c910fc8191aced6601d6b188ce/forge/stage1_intake/probe_image.py \
  docs/qa/references/ag-assay-monolith-reference.png
```

Probe result: PNG, `1536 × 1024`, 3:2 aspect, `2,216,982` bytes, technical suitability `pass`, no warnings. Reference SHA-256: `5b86deb1febfa7f17088969d7b4f25f78c59408c4ea4e025efd5d737771c4b6f`.

### PBR evidence

```text
python3 /root/.codex/skills/remote-skills/skill-6a7226c910fc8191aced6601d6b188ce/forge/stage1_intake/extract_pbr_evidence.py \
  docs/qa/references/ag-assay-monolith-reference.png \
  --out-dir .img2threejs/intake/pbr-silver \
  --material-id satin-silver --size 512 --palette-size 6 \
  --target-threshold 0.7 \
  --report .img2threejs/intake/pbr-silver-report.json
```

Result: `pass`, confidence and estimated fidelity `0.86`. The extractor isolated a foreground crop at `(106,258)`, size `1427 × 654`, with foreground coverage `0.3167`. It emitted independent albedo, roughness, height, normal, and AO maps. Its own limitation remains binding: this is single-image pixel evidence, not exact inverse rendering or photogrammetry.

### Test-first strict gate

The unmodified scaffold was validated before tailoring:

```text
python3 /root/.codex/skills/remote-skills/skill-6a7226c910fc8191aced6601d6b188ce/forge/stage2_spec/validate_sculpt_spec.py \
  .img2threejs/spec/object-sculpt-spec.json --strict-quality
```

Expected first result: `FAIL`. The failures proved the scaffold was not falsely accepted: one placeholder component; missing mapped details; missing local material response; no usable PBR evidence; generic feature targets; no concrete lighting; and component/material/repetition counts below the contract.

After reference-specific authoring, the same command returned:

```text
PASS
```

No validator workaround or quality-bar reduction was used. Single-image uncertainties were resolved as bounded implementation assumptions rather than silently invented facts.

### Generation

```text
python3 /root/.codex/skills/remote-skills/skill-6a7226c910fc8191aced6601d6b188ce/forge/stage3_build/generate_threejs_factory.py \
  .img2threejs/spec/object-sculpt-spec.json \
  --out .img2threejs/generated/ag-assay-monolith.factory.ts \
  --pass-id blockout
```

Generated factory: 785 lines, 58,164 bytes, SHA-256 `3cdeda474028d21f2fe46638da2fb52239dbd414f84da292999c8cb89757f836`.

Spec SHA-256: `90d9cdbbd60226b3531f762af13b62cd83269ed7a4df40d1e4eb874778602e40`.
PBR report SHA-256: `23c776cd3bb210990bffc3e422926d167d935ac72d35e5975c7c99aab3f262d4`.

Current workflow state is correctly paused at `render-capture`. The remaining gates are render capture, review-contract state transition, Tier-1 diagnostics, multi-angle review, pass gate, visual review record, pipeline sync, part coverage, and action readiness.

## Upstream factory audit

The emitted TypeScript is useful as a schema-to-code reference, not as the application module.

### Blocking geometry gaps

- The blockout includes only the invisible root and macro body by design; assay rings, bowl, line, glyphs, and ticks are absent until later passes.
- The body is emitted as `BoxGeometry(1,1,1,12,12,12)`. The generator records the rounded-chamfer and crowned-top intent in metadata but does not realize either in geometry. A render would therefore show a sharp slab, not the reference form.
- The invisible organizer is emitted as a real transparent box, is configured to cast and receive shadows, and the generator ignores the spec’s `depthWrite:false` field. Remove this mesh entirely; use a `Group` as the root.
- The generic repetition emitter is radial. It does not implement the spec’s concentric scale sequence or linear nonuniform tick spacing. Those two systems require object-specific code.
- The `Ag / 47` starter component is only a plane carrier. Production needs local vector/shape paths and shallow recess/highlight treatment.

### Import and bundle gaps

The blockout imports all of the following at module load:

- `three`;
- `RoomEnvironment`;
- `EffectComposer` and `RenderPass`;
- `BokehPass` and `UnrealBloomPass`;
- `OrbitControls`.

For this use case, remove the composer, render pass, depth-of-field, bloom, and orbit-control imports. The visual language requires precision and restraint, not post-processing or free orbit. `RoomEnvironment` may remain only if it is part of the same lazy-loaded local chunk and proves materially better than a smaller authored environment.

### GPU and memory gaps

- The generated look-dev key uses a `4096 × 4096` shadow map, radius `7`, and 24 blur samples. This is an authoring default, not a web-hero budget.
- The procedural texture fallback can allocate five canvases, five `ImageData` buffers, and multiple float fields at up to `2048²` **for every material**. Because all four materials are constructed eagerly--even utility and invisible materials--the default path can create severe transient memory pressure.
- The reference-map URLs are bare filenames. They do not resolve to an approved production asset path as generated.
- There is no application-level dispose function for geometry, materials, textures, controls, environment texture, or renderer resources.
- The factory provides no capability gate, lazy trigger, visibility pause, reduced-motion handling, coarse-pointer behavior, context-loss recovery, or bounded render loop.

### Interaction mismatch

`OrbitControls` permits arbitrary rotation and damping. The contract calls for a much smaller whole-object response: at most roughly ±7° yaw and ±4° pitch on fine pointers, with spring return and no autonomous spin. Reduced-motion and coarse-pointer users should receive a static model/fallback, not a different continuous animation.

## Tailored production integration recommendation

### 1. Progressive enhancement shell

- Keep the generated static PNG as the first paint and no-JavaScript/WebGL fallback.
- Put the enhancement canvas in the same media frame, `aria-hidden="true"`, `tabindex="-1"`; do not move the CTA or change keyboard order.
- Detect WebGL support, `prefers-reduced-motion`, `pointer: coarse`, `saveData`, document visibility, and intersection before importing Three.js.
- Import a local, pinned Three.js module only after the media is near the viewport. Do not use a runtime CDN.
- Fade from fallback to canvas only after the first successful frame. On any import, shader, texture, context, or render failure, leave the image visible.

### 2. Object-specific geometry

- Use a plain `THREE.Group` root with no hidden mesh.
- Build the body with a custom rounded-box/lofted geometry: roughly `4.8 × 0.72 × 1.7`, radius around `0.16`, 4–5 corner segments, and a very small top-crown deformation. Keep seeded dents sparse and deterministic.
- Build each assay ridge as its own torus or ring strip with decreasing radii; build the bowl with an actual concave lathed profile or contained cavity proxy. Verify from a thickness-axis view that it is not a convex plug.
- Build the blue line from one top strip plus short end-wrap strips; keep it nearly flush and avoid glow.
- Build `Ag / 47` from compact vector paths/`ShapeGeometry` or a pre-authored local SVG path set with a shallow dark recess and metallic edge. Do not load a web font just for the model.
- Build the three front ticks as three explicitly positioned shallow groove/box proxies with slight spacing/height variation. Three meshes are acceptable here; instancing is unnecessary at this count.

### 3. Materials and lights

- Use one primary `MeshPhysicalMaterial`: metalness around `1.0`, base roughness around `0.40–0.46`, restrained clearcoat, and lower roughness on crest masks.
- Treat the extracted maps as authoring evidence. If runtime maps are used, create optimized local assets outside `.img2threejs`, crop out all background influence, and ship only the minimum channels that materially survive hero size.
- Prefer 512px desktop and 384px mobile normal/roughness assets; measure before increasing. Keep albedo sRGB and all data maps linear.
- Use one warm key, one low-cost cool fill/rim, and either a small local environment or simple generated reflection source. Replace the 4096 shadow with a 512–1024 shadow only if a static blob/contact-shadow plane cannot achieve the reference grounding.
- Do not enable bloom or depth of field.

### 4. Render scheduling and budgets

- Render on demand: first frame, resize, pointer change, and a short spring-settle window. Do not run an idle 60fps loop.
- Pause on `IntersectionObserver` exit and `document.hidden`; resume only when needed.
- Cap DPR at `1.5–1.75` desktop and `1.0–1.25` mobile. Keep one renderer/canvas.
- Initial budgets: ≤60k desktop triangles, ≤32k mobile triangles, ≤18/12 draw calls, 1024/768 maximum aggregate texture edge, and ≥60/45 fps while settling.
- Add explicit disposal for animation handles, observers, event listeners, geometries, materials, textures, environment resources, and renderer/context.

### 5. Motion and accessibility

- Fine pointer: map pointer position to bounded yaw/pitch and spring back to rest; do not expose free orbit or zoom.
- Reduced motion: show the static image or render one unmoving frame.
- Coarse pointer: keep the fallback or one static WebGL frame; no drag interception and no touch-scroll conflict.
- The model is decorative. Its meaningful content is already represented by adjacent copy and the fallback image; keep the canvas out of the accessibility tree.

### 6. Required acceptance captures

Before the model replaces the static hero image, capture and inspect:

1. same-camera desktop reference match at 3:2;
2. desktop thickness-axis or side view to prove real volume and concavity;
3. desktop grazing-light close-up to prove bevels and multiscale roughness;
4. mobile 390px-wide composition with the CTA visible and no overflow;
5. reduced-motion, no-WebGL, no-JavaScript, context-loss, and offscreen-pause behavior.

Visual acceptance requires a reference/render comparison sheet, layer scores, and critical feature scores. Until those captures exist, the honest status is **strict spec passed; implementation scaffold generated; visual fidelity ungraded**.
