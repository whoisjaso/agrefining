# "Sunday silver" (current cut, 20 s, 9:16)

A daughter remembers her mother's Sunday dinners. The family is clearing out the house, and the daughter almost gives the silver away. The film then cuts to a real spoon stamped STERLING, in silence, and the viewer makes the connection. The end card reads AG Refining · Houston's silver buyer · "Check the back before you give it away."

## Sources (all cleared for commercial use)

- **Film.** Prelinger Archives on the Internet Archive, each item explicitly marked public domain:
  - *Dinner Party* (1945): `DinnerPa1945`
  - *Texas Farm Family* (1952): `TexasFar1952`
- **Photo.** "Medallion" Pattern Sifting Spoon, Ball, Black & Co., 1862, from Cooper Hewitt, Smithsonian Design Museum. Released under CC0.
- **Voice.** A synthetic narrator made with Chatterbox TTS (Resemble AI, MIT license). It does not clone or imitate any real person. Every line was checked with speech-to-text.
- **Music.** An original fingerpicked guitar part, synthesized in code (`guitar.py`).
- **Brand.** AG Refining's own Ag tile (`assets/ag-mark-path.svg`).

## Compliance

- On-screen fine print reads: "Dramatization. Archival film: Prelinger Archives (public domain). Photo: Cooper Hewitt, Smithsonian (CC0)."
- The ad contains no testimonials, no customer claims, no prices, and no promises about payment speed.
- The people in the archival film are anonymous, and the ad does not suggest that any of them endorse AG Refining.

## Build

1. `vo.py` generates the narration (in a Chatterbox venv).
2. `compose.py` renders the frames (1080x1920 at 24 fps, built from the extracted source clips).
3. `mix.py` produces the sound mix.
4. ffmpeg muxes the frames and audio.
