# AG Refining: "Silver drawer" (organic 9:16 short)

34.85 s, 2160x3840 master at 60 fps. Built to the house **video-editing-standard** skill
(`Style: Liquid Motion + Kinetic Captions`, brand `agrefining`).

## The idea
Two pieces, never joined in words. Piece one: rent is due Friday (and the light bill). Piece two: a drawer of old
silverware nobody uses, a spoon flipped over, a tiny stamp, 925 / sterling, "that ain't plated." Then the two pieces
sit side by side in silence and touch on "Yeah. Now you see it." The viewer makes the connection, so it feels like
their idea. Hook: "Okay, real quick question." (hooks-library #2, a real question, answered).

## Voice
Kokoro-82M (Apache-2.0) via kokoro-onnx, a blended style (am_michael 0.5 + am_echo 0.5) chosen by measurement:
15.9 semitone pitch range vs 8.4 for af_heart (flat), 96.4% Whisper word match on single takes (misses are
homophones only). Directed read: per-line pace, uneven human pauses, a small room. Script uses slang and one mild
cuss ("that damn drawer"), contractions, "ain't", "straight up". Synthetic voice, not modelled on a real person.

## Pictures (public domain / CC0, credited)
- Table spoon, "Broom Corn" pattern, c. 1890-1900, Cleveland Museum of Art 2008.168 (CC0): front, back and stamp
  close-up. The maker's stamp is framed out; only STERLING shows.
- Set of six spoons in original box, c. 1895-1910, Cleveland Museum of Art 2008.166 (CC0): the "drawer" plate,
  cropped below the lid label.
- Calendar and bill cards are generic house graphics (no bank, utility or phone UI).

## Sound
No music in the master (song picked in-app at post time: calm piano, voice 100% / music 10-15%).
Font signatures per the standard: Manrope = SIG-GEO (clean whoosh on the cut + click per unit), Termes lead-ins =
SIG-SOFTSERIF pluck; captions silent, exits silent. Cleared creator packs are not distributable, so posted-lane
tiers 2-3 were used: Kenney CC0 (click, pop, impact) + synthesized originals (whoosh, riser, shimmer, sub).

## Gates
| Gate | Result |
|---|---|
| lint_cuesheet.py (brand agrefining, posted lane) | PASS, 0 errors / 0 warnings, sync mean 1.4 ms |
| whisper_check.py (float32, 3 decodes) | 98.8% median, 100% hook: PASS |
| Loudness (no-music master) | -14.3 LUFS, -4.5 dBTP, LRA 1.6 |
| ffprobe | 60/1, 2160x3840, 10-bit HEVC master |
| smoothness_check.py | see the scorecard note (slow hold drift reads as "dup" to the tool; 0 identical frames) |

## Compliance
No prices, payout amounts or payment-speed promises. No real brand UI. Mild profanity only in a small lead-in line.

## Files
`spec.py` (type sprites), `export.js`, `plates.py` (graded plates), `gen2.py` (EffectCraft JSX generator),
`mix.py` (signature mix + cue sheet), `cuesheet.json`, `lint.json`, `whisper.json`, `script.json`,
`renders/ag-silver-drawer_review_1080x1920_60p.mp4` (review copy; 4K masters delivered separately).
