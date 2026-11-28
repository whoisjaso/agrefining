# AG Refining: "Good eye" (kinetic, EffectCraft build)

One continuous 18.6 s take, 1080x1920 at 60 fps, animated in EffectCraft (open-source, After Effects-style compositor).

- `assets.html`: every iOS element rebuilt to Apple's published measurements (1 pt = 2.75 px); exported at 2x by `export.js` (whole assets) and `export_kin.js` (per-letter kinetic type).
- `gen.py`: bakes every move (springs with one ~10% overshoot, expo camera whips, per-letter cascades and slams) into an EffectCraft JSX script: four depth planes, a 3D camera with depth of field and parallax orbit, comp motion blur (180 degrees, 16 samples).
- `mix.py`: iOS interaction sounds, voice, 120 BPM bed with a silence before the snap; mastered to -14 LUFS.
- `grade.txt`: ffmpeg film finish (halation, vignette, grain) applied at encode.

Compliance: no prices or payout claims, no real brand UI, synthetic voice, CC0 / public-domain photography (Smithsonian, Cooper Hewitt).
