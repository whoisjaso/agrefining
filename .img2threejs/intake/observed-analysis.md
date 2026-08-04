# Observed image analysis

Reference: `docs/qa/references/ag-assay-monolith-reference.png`

## Admission decision

`pass` for a procedural, reference-guided Three.js approximation. The image contains one isolated opaque object on a neutral background. Its silhouette is uninterrupted, its front/top/right depth is visible, the material families are legible, and the construction can be approximated from procedural hard-surface solids. This is not evidence for manufacturing dimensions or exact hidden-face geometry.

## Observation before inference

- Observed: one low rectangular metallic body with rounded plan corners and softened vertical and top edges. Inference: a cast or poured silver assay monolith.
- Observed: the body is wider along its longitudinal axis than its depth, and its height is shallow relative to both. The visible projection suggests approximate object-space proportions of 4.8:1.7:0.72 (length:depth:height), subject to perspective.
- Observed: the top face is slightly crowned/irregular rather than optically flat. The perimeter transition is a broad, uneven bevel with highlight breakup.
- Observed: the front long face is near-vertical with a brushed horizontal/irregular grain and a softened lower edge.
- Observed: one thin saturated-blue line traverses the top near the rear third and wraps visibly over the lateral ends. It appears flush or only minimally recessed; its exact relief is uncertain.
- Observed: a central circular assay feature consists of concentric metallic rings around a recessed bowl/socket. The bowl bottom carries a tiny irregular mark.
- Observed: the top-right region carries recessed dark-edged lettering `Ag / 47` with metallic interior highlights.
- Observed: the front-left region carries three narrow vertical recessed ticks with nonuniform spacing/length.
- Observed: pale pits, shallow dents, scratches, and edge wear break up the top and perimeter. The front face has finer directional grain.
- Observed: the metal is opaque, high-metalness, satin rather than mirror-polished, with broad warm reflections from the cream environment.
- Observed: a warm, large key light comes from upper-front-left; a cooler blue-gray rim/fill is visible on the object’s right edge; a soft contact shadow falls to camera-right/back on a cream ground.

## Object-space hierarchy

- Macro: an organizing root pivot and the single cast monolith body.
- Meso: top crown/bevel zone, assay-well assembly, blue calibration inlay, `Ag / 47` inscription group, and front tick group.
- Micro: concentric ring ridges/grooves, recessed bowl, glyph strokes, three tick grooves, edge dents, top pits, directional brush/scratch fields, and local polish at bevel crests.

## Surface topology classification

- Monolith body: `assembled-solid` because it retains countable planar faces joined by simple softened transitions; implement with a custom rounded/lofted cuboid rather than an unmodified sharp `BoxGeometry` slab.
- Assay rings and bowl: `surface-relief` / `continuous-sculpt`; they require real concentric ridge/groove and cavity geometry because grazing light and occlusion define them.
- Blue line and glyph color: `material-only` where flush; use shallow carrier/decals only if needed to avoid z-fighting.
- Tick and glyph recesses: `surface-relief`; shallow geometry or a carefully layered relief proxy, not painted albedo alone.

## Single-image limits

- The underside, rear long face, and far-left end are hidden.
- Exact dimensions, mass, alloy purity, and manufacturing tolerances are undetermined.
- Whether the blue line is paint, enamel, or a shallow inlay is uncertain.
- Exact ring depths and the central bowl profile are inferred from highlights and shadow.
- The reverse/lateral continuation of the marks is not evidenced except for the visible blue-line wrap.
- The `Ag / 47` glyph style is image-specific; no exact font or vector source was supplied.

## Runtime intent

This is a nonessential luxury-detail enhancement for a commercial website. The core page must show the static reference before WebGL loads and remain usable without JavaScript/WebGL. The model should support a restrained whole-object inspection pivot only; no explode, physics, or decorative autonomous spin is required.
