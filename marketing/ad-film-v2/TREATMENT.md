# AG Refining: "The silver inside" (v2)

15 s, 1080×1920, 60 fps. Made entirely in code: three.js rendered frame by frame, score and foley synthesized in numpy, plus library SFX. No stock footage and no generated video.

## Why v1 was replaced

v1 was a flat engraving collage. It read as a slideshow: images swapped, and nothing carried from one beat to the next. v2 is **one piece of silver followed by one camera**. Every beat grows out of the one before it.

## Method (what each reference contributed)

- **onetake** (rhythm and carry): every boundary is carried by a surviving element. The coin carries into the pile, the pile melts into one drop, and the drop is struck into the bar. Shot lengths vary from 0.12 s (the strike) to 2.4 s (the hook), and none of them are equal. There are three dead-still rests (2.40–3.05, 8.55–9.24, 13.55–15.0), one burst of four landings, and a camera that chases each beat, with a hand float that dies in the holds and a shake on every landing. The sound is a palette in one room.
  onetake is licensed PolyForm Noncommercial, so its code is **not** used here. Only its published method was applied, written from scratch.
- **lemo-opuscar** (MIT, glass/metal product grammar): a dark-field studio made of strip lights baked to an environment, with a sweep strip behind the camera, a black mirror floor that fades with no horizon line, and Neutral tone mapping. One native move sits at the emotional peak, the strike. There is real silence before the release, and the timeline is the single source for picture and sound.
- **gbro-collage-broll** (MIT): its assemble-from-empty grammar is used for the pile (the frame starts with one coin, and the silver arrives piece by piece). Its halftone paper look and its paid Gemini image pipeline were not used. They conflict with the metal look and need paid API keys.
- **jason-motion-graphics SFX library**: metallic_hit, impact_1/2, snap, ios_tink, riser, cinematic_woosh, deep_whoosh (reversed) and shine, each placed by its measured peak.

## Logline

Whatever silver you have (coins, flatware, jewelry, bullion, scrap) is worth the silver inside it. AG Refining melts the question down to one answer.

## Beat sheet

| t (s) | beat | carry / camera | sound |
|---|---|---|---|
| 0.00–2.40 | HOOK: a fictional proof coin spins down like an Euler disk. "What's your silver really worth?" | low 3/4, rising to a high 3/4 that lands before the coin does (chase) | synthesized rattle that speeds up as the tilt falls, over a drone |
| 2.40 | the coin slaps flat; the words are knocked out | shake | coin clack, then everything stops |
| 2.40–3.05 | REST | dead still | room tail only |
| 3.05–4.60 | BURST: sterling, jewelry, bullion and scrap land around it (3.18 / 3.52 / 3.70 / 4.26), each with a label | crane to overhead | one voice per material; glass-pluck music enters |
| 4.80–7.15 | heat, then everything flows into one drop. "We pay for the silver inside." | slow overhead push | sizzle, blobs meeting, a soft pulse |
| 7.35–8.55 | the drop rises into a mirror sphere | crane down to eye level | a rising glass tone |
| 8.55–9.24 | REST, in true silence | dead still | digital silence, then a reversed breath |
| 9.30 | THE STRIKE: the sphere is struck into an AG bar | slam, then a hard shake | the loudest moment: sub, metal, impact; a D major chord opens |
| 9.95–12.40 | "See the weight. Then decide." A light sweep crosses the bar at 11.0 | slow 3/4 orbit | bells answer each word; shine |
| 12.55–15.00 | AG Refining · Houston's silver buyer · agrefining.com | rise to a high hero angle, dead still from 13.55 | a cadence on the name |

## Claims

Every on-screen line comes from the site's existing claims: offers based on silver content and the current market, and on-site weighing so the seller sees the weight before accepting. Nothing about fees, timing or prices is strengthened. The coin and the bar are fictional designs: there are no real mint designs, and the "AG" stamp is the client's own mark.

## Build

```sh
python3 -m http.server 8471 --bind 127.0.0.1 &      # module imports need http
node render.js frames60 60 3                         # 900 frames, deterministic seek(t)
python3 score2.py                                    # with_music.wav, fx_only.wav (−14 LUFS)
ffmpeg -framerate 60 -i frames60/f%04d.jpg -i with_music.wav -c:v libx264 -crf 16 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest ag-refining-ad-v2.mp4
```
