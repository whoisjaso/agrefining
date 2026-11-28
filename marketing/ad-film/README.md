# AG Refining brand film: "Silver hides"

15 s, 1080×1920, 60 fps. Built as code: a pure `seek(t)` HTML page (`ag.html`) rendered frame by frame with Playwright, then motion-blurred and scored.

- **Idea:** silver hides in what you already have.
- **Device:** one bead of silver, in the cobalt of the Ag tile. Each material it passes (X-ray film, watch batteries, dental scrap, flatware, coins) hands it a drop and it grows; it is weighed, struck into a bar, and turns into the real Ag 47 mark.
- **Copy:** "Silver hides" / "in plain sight" / "Silver hides" morphing to "Silver pays" / AG Refining, agrefining.com.
- **Look:** every image gets one treatment (`engrave_ag.py`): navy ink on AG creme, with photos turned into line engravings.

## Renders
- `renders/ag-refining-ad-v1-with-music.mp4`: original score (composed in `score.py`).
- `renders/ag-refining-ad-v1-sfx-only.mp4`: effects only, for posting with a platform track.
- `renders/ag-refining-ad-v1-poster.png`: the end card, for thumbnails.

## Rebuild
```bash
cd marketing/ad-film
node tools/stills.mjs /tmp/stills 0 360 720 899                      # review stills
python3 -c "import json;json.dump([{'o':f'f{i:04d}.png','t':i/60} for i in range(900)],open('plan.json','w'))"
NODE_PATH=../../node_modules CUES=cues.json node tools/render2.js plan.json sharp 4
CUTS=46,58,70,104,142,180,218,256,294,358,419,486 python3 tools/blurplan.py sharp 900 blur.json speeds.json
NODE_PATH=../../node_modules node tools/render2.js blur.json samples 4
python3 tools/blend.py samples blur.json final
python3 score.py cues.json                                            # -> with_music.wav, fx_only.wav (needs the SFX library in ./sfx)
```
`render2.js` looks for Chromium at `/opt/pw-browsers/chromium-1194`. Image credits are in `CREDITS.md`.
