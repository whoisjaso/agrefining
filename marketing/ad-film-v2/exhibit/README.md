# "Exhibit A / Exhibit B" (the current cut)

The ad never says "we buy your silver". It sets two facts side by side, the way a news report does, and lets the viewer connect them:

| t (s) | picture | anchor (voice) | caption |
|---|---|---|---|
| 0–3 | A tarnished spoon in an ordinary kitchen drawer | "Exhibit A. A spoon, from a kitchen drawer." | EXHIBIT A · A spoon from a kitchen drawer. |
| 3–6 | The spoon turns over; the camera dives to the back of the handle | "Stamped on the back. Nine twenty-five." | Stamped on the back: **925** |
| 6–9.4 | Match cut to a silver bar, same framing | "Exhibit B. A silver bar. Nine ninety-nine." | EXHIBIT B · A silver bar. · Stamped: **999** |
| 8.6–10.8 | Pull back: the spoon lies next to the bar | silence (the viewer connects the two) | none |
| 10.8–15 | The Ag tile (the brand mark, built in Blender) turns in | "A G Refining. Houston's silver buyer." "Check the back of yours." | AG Refining · Houston's silver buyer · Check the back of yours. · agrefining.com |

The same evidence hit plays on 925 and on 999, so the ear pairs them. A soft "payment received" chime plays on the brand.

## Compliance

- Every line is a plain fact (925 marks sterling, 999 marks fine silver). There are no claims about price, speed or fees.
- The voice is synthetic: Kokoro v1.0 (Apache-2.0), voice `af_heart`. It is not an imitation of any real person. Each line, and the final mix, is checked with speech-to-text (`asr.py`).
- The coins and bars are fictional designs. The Ag tile is AG Refining's own mark (`assets/ag-mark-path.svg`).

## Build

These scripts were written for the session scratch folders. Adjust the absolute paths, then run:

1. `blender -b -P build2.py -- ex.blend`, after `maps.py` and `maps2.py` have made the relief maps.
2. Render at 720×1280 and 24 fps, with persistent data on.
3. `blender -b -P logo.py -- logo/` for the brand-tile animation.
4. `python3 tts.py af_heart 0.95` for the voice, then `python3 score3.py`.
5. `node textrender2.js tl2` for the type layer.
6. `finalize2.sh` to composite, upscale to 1080×1920 and mux.
