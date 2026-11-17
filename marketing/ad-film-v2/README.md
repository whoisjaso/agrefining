# AG Refining ad film v2: "The silver inside"

- `TREATMENT.md`: the concept, the beat sheet and how the onetake, lemo-opuscar and gbro-collage-broll methods were applied.
- `preview/`: the real-time three.js cut. Its `film.html` uses the same timeline as the Blender version, and `score2.py` is the shared sound design and score.
- `blender/`: the Blender 4.5 LTS (Cycles) production.
  - `maps.py` makes the relief and stamp maps.
  - `build.py` builds and keys the whole scene.
  - `compose.py` lays the type layer (`preview/textlayer.html`) over the frames.
- `renders/`: finished cuts.

The preview's `film.html` imports three.js 0.185.1 (a dependency of this repo) from `lib/`. Copy `node_modules/three/build/three.module.js`, `three.core.js` and the `MarchingCubes`, `Reflector`, `RoundedBoxGeometry` and `BufferGeometryUtils` add-ons into `preview/lib/`, then serve the folder over http.
