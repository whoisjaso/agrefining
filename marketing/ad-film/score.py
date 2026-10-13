# score.py CUES.json : composes the AG film score in code and mixes picture-computed SFX.
# Brand personality: precise and expensive -> sparse felt-piano tones, a low pad, one warm chord on the drop.
# 120 BPM, bar = 2.0 s = 120 f. Chords change on downbeats; the progress motif climbs one scale step per drop
# and resolves to the tonic on the name. The music stops on the bar line at f720; then near-silence; one bell on the name.
import json, subprocess, sys, numpy as np
SR = 48000; LEN = 15.0; N = int(LEN * SR); F = lambda f: f / 60
C = json.load(open(sys.argv[1]))
rng = np.random.default_rng(47)
t_all = np.arange(N) / SR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def env_adsr(n, a, d, s, r_len):
    e = np.ones(n); A = max(1, int(a * SR)); e[:A] = np.linspace(0, 1, A)
    D = max(1, int(d * SR)); e[A:A + D] = np.linspace(1, s, len(e[A:A + D])); e[A + D:] = s
    R = max(1, int(r_len * SR)); e[-R:] *= np.linspace(1, 0, len(e[-R:]))
    return e

def piano(m, dur=2.4, vel=1.0):                                   # felt-piano: inharmonic partials, fast attack, exp decay
    n = int(dur * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n)
    for k, amp in enumerate([1, 0.42, 0.22, 0.12, 0.06, 0.03], 1):
        fk = f0 * k * np.sqrt(1 + 0.0004 * k * k)
        y += amp * np.sin(2 * np.pi * fk * t + rng.random() * 6.28) * np.exp(-t * (1.6 + 0.9 * k))
    y *= np.minimum(1, t / 0.004) * vel
    y += 0.08 * vel * rng.standard_normal(n) * np.exp(-t * 90)    # felt hammer noise
    return y

def pad(ms, dur, lvl=0.18, atk=0.15, rel=0.6):                    # warm low pad: detuned sines, slow breath
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for m in ms:
        for det in (-0.07, 0.0, 0.08):
            f = hz(m) * 2 ** (det / 12)
            y += np.sin(2 * np.pi * f * t + rng.random() * 6.28) + 0.18 * np.sin(2 * np.pi * 2 * f * t)
    y /= 3 * len(ms)
    y *= env_adsr(n, atk, 0.4, 0.85, rel) * (1 + 0.04 * np.sin(2 * np.pi * 0.5 * t)) * lvl
    return y

def sub(f_start=72, f_end=42, dur=1.6, lvl=0.9):                  # sub boom on the root
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f_end + (f_start - f_end) * np.exp(-t * 9)) / SR
    return np.sin(ph) * np.exp(-t * 2.4) * np.minimum(1, t / 0.006) * lvl

def bell(m, dur=3.2, lvl=0.5):                                    # soft resolved bell
    n = int(dur * SR); t = np.arange(n) / SR; f0 = hz(m); y = np.zeros(n)
    for ratio, amp, dec in [(1, 1, 1.1), (2.0, 0.35, 1.8), (2.76, 0.22, 2.6), (5.4, 0.08, 4.0)]:
        y += amp * np.sin(2 * np.pi * f0 * ratio * t) * np.exp(-t * dec)
    return y * np.minimum(1, t / 0.003) * lvl

mus = np.zeros(N)
def put(x, at_s, buf=mus):
    st = int(at_s * SR); a, b = max(0, st), min(N, st + len(x))
    if b > a: buf[a:b] += x[a - st:b - st]

D3, A2, B2, G2, D2 = 50, 45, 47, 43, 38
CHORDS = {0: [D3, 57, 61, 64], 1: [B2, 54, 57, 62], 2: [G2, 54, 59, 62], 3: [D2, 50, 57, 61, 64], 4: [B2, 54, 57, 62], 5: [A2, 52, 57, 59]}   # Dmaj9, Bm9, Gmaj7, D (drop), Bm, Asus (V)
for bar, ch in CHORDS.items():
    lvl = 0.22 if bar == 3 else (0.12 if bar == 5 else 0.16)
    put(pad(ch, 2.06 if bar < 5 else 2.0, lvl=lvl, atk=0.15 if bar else 0.05), bar * 2.0)
# felt-piano pulse on 8ths in bars 2-5 (not in the hook, not in the lull)
for bar in (1, 2, 3, 4):
    ch = CHORDS[bar]
    for e in range(8):
        tm = bar * 2.0 + e * 0.25
        if bar == 2 and tm >= F(C["silence"][0]): continue        # the suck before the drop
        m = ch[1 + (e % (len(ch) - 1))] + (12 if e % 4 == 2 else 0)
        put(piano(m, 1.2, 0.10 if e % 2 else 0.16), tm)
# the drop: one warm low chord + sub boom on the downbeat (the loudest moment)
put(piano(D2, 3.0, 0.9) + piano(D3, 3.0, 0.6) + piano(57, 3.0, 0.4), F(C["drop"]))
put(sub(76, 41, 1.8, 1.1), F(C["drop"]))
# progress motif: one scale step per drop (D E F# G A B), resolving on the name
for i, f in enumerate(C["ticks"]):
    put(piano([62, 64, 66, 67, 69, 71][i], 2.0, 0.5), F(f) + 0.004)
# hook: the first note lands with the bead
put(piano(62, 2.2, 0.55), F(C["land"]))
# lull: the long hold sits on the pad alone; a soft swell into the strike
sw = np.linspace(0, 1, int(0.9 * SR)) ** 2.2 * 0.14
put(sw * np.sin(2 * np.pi * hz(57) * np.arange(len(sw)) / SR) * (1 + rng.standard_normal(len(sw)) * 0.02), F(C["strike"]) - 0.9)
# the music stops on the bar line
st = int(F(C["stop"]) * SR); mus[st:st + int(0.04 * SR)] *= np.linspace(1, 0, int(0.04 * SR)); mus[st + int(0.04 * SR):] = 0
# true silence before the drop
s0, s1 = int(F(C["silence"][0]) * SR), int(F(C["drop"]) * SR); mus[s0 - int(0.02 * SR):s0] *= np.linspace(1, 0, int(0.02 * SR)); mus[s0:s1 - 30] = 0
# the name: one soft resolved element (tonic bell + quiet sub), after near-silence
put(bell(74, 3.4, 0.42) + bell(62, 3.4, 0.25), F(C["name"]) + 0.02)
put(sub(60, 38, 1.4, 0.35), F(C["name"]) + 0.02)

# ── SFX by measured peak ──
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def peak(x, onset=False):
    m = np.abs(x).mean(1)
    if onset: return int(np.argmax(m > m.max() * 0.3))
    w = int(SR * 0.004); return int(np.argmax(np.convolve(m, np.ones(w) / w, 'same')))
EV = []
for f in C["ticks"]: EV.append((F(f) + 0.008, 'sfx/ios/ios_tink.wav', -21, True))      # every drop: one tink, all equal
EV.append((F(C["land"]) + 0.008, 'sfx/ios/ios_tink.wav', -21, True))
for f in C["swaps"]: EV.append((F(f), 'sfx/pack3/ui_02.wav', -30, True))               # quiet shimmer on the hook swaps
for w in C["whoosh"]: EV.append((F(w["apex"]), 'sfx/pack3/woosh.wav', -20, False))      # apex on the velocity peak
EV.append((F(C["silence"][0]) - 0.20, 'sfx/pack5/deep_whoosh.wav', -18, False))        # the implosion into the bead
EV.append((F(C["flip"]), 'sfx/swoosh.wav', -24, False))                                # the iris back to paper
EV.append((F(C["pan"]), 'sfx/ui/reverb_hit.wav', -26, True))                           # the pan takes the weight
EV.append((F(C["morph"]), 'sfx/pack3/ui_02.wav', -27, True))                           # hides -> pays
EV.append((F(C["strike"]) + 0.01, 'sfx/metallic_hit.wav', -16, False))                 # struck into a bar
EV.append((F(C["turn"]), 'sfx/pack3/cinematic_woosh.wav', -24, False))                 # the hero turn
fx = np.zeros((N, 2), np.float32); cache = {}
for t, f, g, ons in EV:
    if f not in cache: x = load(f); cache[f] = (x, peak(x, ons))
    x, pk = cache[f]; st = int(t * SR) - pk; a, b = max(0, st), min(N, st + len(x))
    if b > a: fx[a:b] += x[a - st:b - st] * 10 ** (g / 20)
music = np.stack([mus, mus], 1).astype(np.float32)
music[:, 0] = np.roll(mus, 0); music[:, 1] = np.roll(mus, int(0.0006 * SR))           # a touch of width on the bed only
for name, mix in [('fx_only', fx), ('with_music', fx + music * 0.9)]:
    mix.astype(np.float32).tofile(name + '.f32')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', name + '.f32',
                    '-af', 'highpass=f=25,loudnorm=I=-14:TP=-1.5:LRA=7', '-ar', '48000', name + '.wav'], check=True)
print('events', len(EV))
