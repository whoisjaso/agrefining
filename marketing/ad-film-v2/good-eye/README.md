# "Good eye": iOS motion graphic (18.6 s, 9:16, 60 fps)

## Angle

This ad targets the bottom of Maslow's pyramid (rent, bills, the bank balance) and uses the two-Lego-pieces technique: it shows two facts and never connects them.

1. **Hook (0–2.5 s).** Real-feeling iOS notifications arrive: Rent due Friday, a $112.40 balance, and an electric bill. The voice says "Rent is due Friday."
2. **Delay (2.5–4.3 s).** Memories: Grandma's house, with real CC0 photos of silver flatware. "Meanwhile, in the drawer…"
3. **Piece two (4.3–7.1 s).** Tapping a photo turns the spoon over, and a pinch-zoom finds the stamp. iOS Live Text locks onto **STERLING** (a real 1862 Cooper Hewitt photo, CC0).
4. **Rehook (7.1–9.5 s).** Spotlight defines sterling silver as "92.5% pure, often stamped 925 or STERLING." The voice says "Hold on."
5. **The click (9.5–11 s).** The "Rent due" card and the STERLING card slide together and lock, tab into notch, after one beat of total silence. No words appear: the viewer makes the connection themselves.
6. **Payoff (11–15.5 s).** The viewer's *own* message reads "wait… is grandma's silver worth something??" AG Refining replies "Good eye." with the eyes emoji, which rewards them for being clever, then "925 means sterling silver. Check the back of the rest."
7. **End (15.5–18.6 s).** The avatar becomes the Ag tile logo with an Apple-Pay-style success chime. "AG Refining · Houston's silver buyer · agrefining.com"

## Compliance

- The ad makes no price, payout or speed claims, and never says "sell to pay rent". The viewer infers that.
- The bank, calendar and electric notifications are generic: no real bank or utility brand is shown.
- The voice is synthetic (Chatterbox, MIT) and is not any real person. Every line is checked with speech-to-text.
- Photos are Smithsonian / Cooper Hewitt CC0.

## Build

1. `node render.js stills st <t…>` renders QA stills.
2. `node render.js full sub 4` renders 4 subframes per frame for the 180° shutter.
3. `ffmpeg -framerate 240 -i sub/s%05d.jpg -vf "tmix=frames=4,select='eq(mod(n\,4)\,3)',setpts=N/(60*TB)" -r 60 …` blends the subframes into 60 fps with motion blur.
4. `python3 mix_ios.py` produces `fx_only.wav` and `with_music.wav` at −14 LUFS.
