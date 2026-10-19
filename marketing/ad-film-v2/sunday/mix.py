# mix.py : sound for "Sunday silver": narrator, fingerpicked guitar, projector, one tape rip, a real silence on STERLING.
import json, os, subprocess, numpy as np
from guitar import render, fingerpick, pluck, body, SR
HERE = os.path.dirname(os.path.abspath(__file__)); TL = json.load(open(os.path.join(HERE, 'timeline.json')))
DUR = TL['dur']; N = int(DUR * SR); END = TL['end']; STER = [s for s in TL['shots'] if s[0] == 'sterling'][0]
rng = np.random.default_rng(3)
tt = lambda n: np.arange(n) / SR
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)
def bandnoise(n, lo, hi):
    X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR); X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)
def put(buf, x, at, db=0.0, pan=0.0):
    g = 10 ** (db / 20); st = int(at * SR); a, b = max(0, st), min(N, st + len(x))
    if b <= a: return
    seg = x[a - st:b - st]
    if seg.ndim == 1: seg = np.stack([seg * np.sqrt(0.5 * (1 - pan)), seg * np.sqrt(0.5 * (1 + pan))], 1) * np.sqrt(2)
    buf[a:b] += seg * g

vox, mus, fx = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2))
# ── narrator: gentle cleanup, a little warmth, one small room ──
duck = np.zeros(N)
for key, t0, _ in TL['vo']:
    v = load(os.path.join(HERE, 'vo', key + '.wav'))
    v = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af',
                        'highpass=f=80,equalizer=f=220:t=q:w=1:g=1.5,equalizer=f=3500:t=q:w=1.4:g=2,acompressor=threshold=0.1:ratio=3:attack=5:release=120:makeup=1.6',
                        '-f', 'f32le', '-'], input=v.astype(np.float32).tobytes(), capture_output=True).stdout
    v = np.frombuffer(v, np.float32).astype(float); v /= np.abs(v).max() + 1e-9
    put(vox, v, t0, -3); st = int(t0 * SR); duck[max(0, st - 2400):min(N, st + len(v) + 7200)] = 1
duck[:int(0.6 * SR)] = 1
k = int(0.15 * SR); duck = np.convolve(duck, np.ones(k) / k, 'same')

# ── the guitar: G  Em  C  D | G  Em  C(held) ; stops before STERLING; resolves on the name ──
G = (43, 50, 59, 62, 67); C = (48, 55, 60, 64, 67); Em = (40, 47, 59, 64, 67); D = (50, 57, 62, 66, 69)
beat = 0.42
ev, t_end = fingerpick([G, Em, C, D, G, Em], 0.15, beat)
ev = [e for e in ev if e[0] < STER[1] - 0.5]
ev += [(STER[1] - 1.3 + i * 0.09, m, 0.5, 3.0, 0.1) for i, m in enumerate((48, 55, 60, 64))]       # a last open C, let ring
put(mus, render(ev, STER[1] + 1.0), 0.0, -11)
# cut it clean before STERLING: the silence is the point
s0 = int((STER[1] - 0.12) * SR); mus[s0 - 2400:s0] *= np.linspace(1, 0, 2400)[:, None]; mus[s0:int(END * SR)] = 0
# the resolve on the end card: a slow G arpeggio and a high harmonic
res = [(END + 0.05 + i * 0.11, m, 0.62, 4.5, -0.1 + 0.05 * i) for i, m in enumerate((43, 50, 55, 59, 62, 67))] + [(END + 1.2, 79, 0.35, 3.5, 0.2)]
put(mus, render(res, DUR), 0.0, -9)

# ── projector: motor hum + 24 Hz shutter flutter, under the archival film only ──
n = int(STER[1] * SR); t = tt(n)
hum = 0.4 * np.sin(2 * np.pi * 120 * t) + 0.2 * np.sin(2 * np.pi * 240 * t)
clat = bandnoise(n, 900, 4500) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 24 * t))) * 0.6
proj = (hum * 0.25 + clat) * np.minimum(1, t / 0.4) * np.minimum(1, (STER[1] - t) / 0.08)
put(fx, proj, 0.0, -38)
# ── "we cleaned out her house": packing tape pulled off a roll, then pressed down ──
tn = int(0.62 * SR); tr = tt(tn)
rip = bandnoise(tn, 1500, 9000) * (rng.random(tn) < 0.35) * (0.4 + 0.6 * np.sin(np.pi * tr / tr[-1])) + bandnoise(tn, 300, 1500) * 0.25 * np.sin(np.pi * tr / tr[-1])
put(fx, rip, 9.15, -34, pan=0.25); put(fx, bandnoise(int(0.12 * SR), 120, 900) * np.exp(-tt(int(0.12 * SR)) * 30), 9.82, -33, pan=0.25)
# ── STERLING: near silence. one breath of the room, and the faint ring of a spoon being turned over ──
rn = int((END - STER[1]) * SR); put(fx, bandnoise(rn, 80, 1200) * 0.5, STER[1], -48)
tn = int(1.4 * SR); tr = tt(tn)
ring = sum(a * np.sin(2 * np.pi * f * tr) * np.exp(-tr * d) for f, a, d in [(2650, 1, 4), (4210, 0.5, 6), (6630, 0.25, 9)])
put(fx, ring * np.minimum(1, tr / 0.002), STER[1] + 0.12, -34, pan=0.1)

# ── room, duck, master ──
mus *= (1 - 0.72 * duck)[:, None]
dry = vox + mus + fx
irn = int(0.9 * SR); ir = rng.standard_normal((irn, 2)) * np.exp(-tt(irn) * 7.5)[:, None]; ir[:int(0.01 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum(0))
def conv(a, b):
    L = len(a) + len(b) - 1; F = 1 << (L - 1).bit_length(); return np.fft.irfft(np.fft.rfft(a, F) * np.fft.rfft(b, F), F)[:len(a)]
wet = np.stack([conv((vox * 0.12 + mus * 0.25)[:, c], ir[:, c]) for c in range(2)], 1)
mix = (dry + wet * 0.35).astype(np.float32)
mix[int((STER[1] + 0.02) * SR):int(END * SR)] *= 1.0
mix.tofile(os.path.join(HERE, 'mix.f32'))
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', os.path.join(HERE, 'mix.f32'),
                '-af', 'highpass=f=45,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.8:attack=1:release=60:level=false',
                '-ar', '48000', '-c:a', 'pcm_s16le', os.path.join(HERE, 'mix.wav')], check=True)
print('mix ok')
