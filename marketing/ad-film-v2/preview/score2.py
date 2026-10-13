# score2.py : the AG "silver inside" film. Action sound first, restrained music under it, one room for everything.
# Timeline constants copied from film.html T (one source; keep in sync).
import subprocess, numpy as np
SR = 48000; DUR = 15.0; N = int(DUR * SR)
SLAP, DROPS, HEAT, MELT, RISE, STRIKE, SWEEP, LOCK = 2.40, [3.18, 3.52, 3.70, 4.26], (4.80, 5.45), (5.40, 7.15), (7.35, 8.55), 9.30, 11.0, 12.55
SEE = [10.05, 10.28, 10.70, 10.92]
SFX = '../agfilm/sfx/'
rng = np.random.default_rng(47)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
tt = lambda n: np.arange(n) / SR

def fftconv(a, b):
    n = len(a) + len(b) - 1; L = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(a, L) * np.fft.rfft(b, L), L)[:n]

# ── buses (stereo) ──
fx = np.zeros((N, 2)); mus = np.zeros((N, 2)); room_send = np.zeros((N, 2))
def put(buf, x, at, gain_db=0.0, pan=0.0, send=0.25):
    if x.ndim == 1: x = np.stack([x * np.sqrt(0.5 * (1 - pan)), x * np.sqrt(0.5 * (1 + pan))], 1) * np.sqrt(2)
    g = 10 ** (gain_db / 20); st = int(round(at * SR)); a, b = max(0, st), min(N, st + len(x))
    if b > a:
        buf[a:b] += x[a - st:b - st] * g; room_send[a:b] += x[a - st:b - st] * g * send

def load(p, rate=1.0):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', SFX + p, '-ac', '2', '-ar', str(int(SR / rate)), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)          # resampled to SR/rate, played at SR -> pitch x rate
def peak_i(x, onset=False):
    m = np.abs(x).mean(1)
    if onset: return int(np.argmax(m > m.max() * 0.3))
    w = int(SR * 0.004); return int(np.argmax(np.convolve(m, np.ones(w) / w, 'same')))
def place(p, at, gain_db, rate=1.0, onset=True, pan=0.0, send=0.25, buf=None):
    x = load(p, rate); x = x / (np.abs(x).max() + 1e-9)
    if pan: x = x * np.array([np.sqrt(1 - pan), np.sqrt(1 + pan)]) / 1.0
    put(fx if buf is None else buf, x, at - peak_i(x, onset) / SR, gain_db, send=send)

# ── material voices (synthesised) ──
def ring(partials, dur, bright=1.0):                     # struck metal: inharmonic partials, each its own decay + a noise transient
    n = int(dur * SR); t = tt(n); y = np.zeros(n)
    for f, a, d in partials: y += a * np.sin(2 * np.pi * f * t + rng.random() * 6.28) * np.exp(-t * d)
    y += 0.25 * bright * rng.standard_normal(n) * np.exp(-t * 260)
    return y * np.minimum(1, t / 0.0008)
COIN = [(2870, 1, 9), (4630, 0.7, 13), (7080, 0.45, 18), (9810, 0.25, 26), (1450, 0.35, 7)]
def sub(f0, f1, dur, lvl=1.0):
    n = int(dur * SR); t = tt(n); ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t * 9)) / SR
    return np.tanh(1.4 * np.sin(ph)) * np.exp(-t * 2.6) * np.minimum(1, t / 0.004) * lvl
def bubble(f, dur=0.16):                                  # a blob closing: resonance rising as it shrinks
    n = int(dur * SR); t = tt(n); fr = f * (1 + 1.8 * t / dur)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 24) * np.minimum(1, t / 0.002)
def glass(m, dur=2.4, lvl=1.0):
    n = int(dur * SR); t = tt(n); f0 = hz(m); y = np.zeros(n)
    for r, a, d in [(1, 1, 1.4), (2.76, 0.32, 3.2), (5.4, 0.12, 6), (2.0, 0.18, 2.2)]: y += a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * d)
    return y * np.minimum(1, t / 0.002) * lvl
def pad(ms, dur, lvl, atk=0.6, rel=1.2):
    n = int(dur * SR); t = tt(n); y = np.zeros(n)
    for m in ms:
        for det in (-0.06, 0, 0.07): f = hz(m) * 2 ** (det / 12); y += np.sin(2 * np.pi * f * t + rng.random() * 6.28) + 0.12 * np.sin(4 * np.pi * f * t)
    y /= 3 * len(ms); e = np.minimum(1, t / atk) * np.minimum(1, (dur - t) / rel).clip(0)
    return y * e * lvl
def kick(lvl=1.0):
    n = int(0.35 * SR); t = tt(n); return np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-t * 38)) / SR) * np.exp(-t * 11) * lvl
def bandnoise(n, lo, hi):
    X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR); X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)

# ═════ 0 – 2.40  the coin: an Euler disk running down. Rattle rate climbs, it stops dead on the slap ═════
n = int(SLAP * SR); t = tt(n)
rate = np.minimum(95, 7.5 * np.power(np.maximum((SLAP - t) / SLAP, 1e-4), -0.5))
ph = np.cumsum(rate) / SR; idx = np.nonzero(np.diff(np.floor(ph)) > 0)[0]
imp = np.zeros(n); imp[idx] = (0.35 + 0.65 * (t[idx] / SLAP) ** 1.5) * (0.75 + 0.5 * rng.random(len(idx)))
whirr = fftconv(imp, ring(COIN, 0.25, 0.6))[:n]
roll = bandnoise(n, 180, 1400) * (0.04 + 0.22 * (t / SLAP) ** 2)                                   # the rolling contact
spin = whirr / (np.abs(whirr).max() + 1e-9) * 0.8 + roll
spin *= np.minimum(1, t / 0.08)
put(fx, spin, 0.0, -10, send=0.3)
# the slap: the coin falls flat; everything stops
put(fx, ring(COIN, 0.9, 1.0) * 0.6, SLAP, -8, send=0.35); put(fx, 0.5 * sub(130, 70, 0.25), SLAP, -8, send=0.1)
place('snap.wav', SLAP + 0.002, -20)

# ═════ 3.05 – 4.6  silver lands: one voice per material ═════
place('metallic_hit.wav', DROPS[0], -15, rate=1.5, pan=-0.25)                           # sterling: a bright spoon ring
put(fx, ring([(3300, 1, 8), (5200, 0.5, 12), (8100, 0.3, 20)], 0.7), DROPS[0], -16, pan=-0.25)
put(fx, ring([(5240, 1, 11), (8460, 0.6, 15), (11900, 0.3, 22), (2610, 0.4, 9)], 0.8, 0.4), DROPS[1], -14, pan=0.35)   # ring: thin, high
place('ios/ios_tink.wav', DROPS[1] + 0.004, -22, pan=0.35)
put(fx, sub(110, 55, 0.4, 0.9) + 0.4 * ring([(1210, 1, 16), (2950, 0.5, 22)], 0.4), DROPS[2], -9, pan=-0.3)  # bullion: heavy thud
place('pack6/impact_2.wav', DROPS[2], -26)
for k, dt in enumerate([0, 0.035, 0.07, 0.13, 0.21]):                                    # scrap: a clatter of pieces
    put(fx, ring([(2400 + 900 * k, 1, 22), (4100 + 700 * k, 0.5, 30)], 0.25, 0.8), DROPS[3] + dt, -14 - 3 * k, pan=0.3)

# ═════ 4.8 – 7.15  heat, then the melt ═════
hn = int((MELT[1] - HEAT[0]) * SR); th = tt(hn)
sizzle = bandnoise(hn, 2500, 9000) * (rng.random(hn) < 0.02) * 1.0 + bandnoise(hn, 300, 1200) * 0.15
sizzle *= np.clip((th - 0.0) / 0.6, 0, 1) * np.clip((MELT[1] - HEAT[0] - th) / 0.8, 0, 1)
put(fx, sizzle, HEAT[0], -24, send=0.4)
place('pack3/riser.wav', MELT[0] + 0.6, -28, onset=False)
for k, tb in enumerate([5.92, 6.18, 6.41, 6.63, 6.86, 7.05]):                            # blobs meeting
    put(fx, bubble(260 + 70 * ((k * 3) % 5)), tb, -15 - (k % 2) * 3, pan=[-0.3, 0.2, -0.1, 0.3, 0, 0.1][k], send=0.45)

# ═════ 7.35 – 9.30  the drop rises; a dead silence; the strike ═════
place('pack3/cinematic_woosh.wav', 7.95, -21, onset=False)
rn = int((RISE[1] - RISE[0]) * SR); tr = tt(rn); fr = hz(74) * 2 ** (tr / (RISE[1] - RISE[0]) * 7 / 12)
rise = np.sin(2 * np.pi * np.cumsum(fr) / SR) * (tr / tr[-1]) ** 2 * 0.5 + np.sin(2 * np.pi * np.cumsum(fr * 2.76) / SR) * (tr / tr[-1]) ** 3 * 0.12
put(fx, rise, RISE[0], -20, send=0.5)
rw = load('pack5/deep_whoosh.wav')[::-1]; rw = rw / np.abs(rw).max()                      # a reverse breath inside the silence
put(fx, rw[-int(0.32 * SR):], STRIKE - 0.32, -24, send=0.2)
# the strike: the loudest moment
put(fx, sub(150, 42, 1.8, 1.0), STRIKE, -3, send=0.2)
put(fx, ring([(820, 1, 3.2), (1960, 0.7, 4.5), (3410, 0.5, 6), (5530, 0.3, 9)], 2.6, 1.2), STRIKE, -9, send=0.5)
place('metallic_hit.wav', STRIKE, -11)
place('pack6/impact_1.wav', STRIKE, -15)

# ═════ 9.3 – 15  the bar ═════
place('pack3/shine.wav', SWEEP + 0.05, -20, onset=False)
place('pack3/cinematic_woosh.wav', 11.2, -30, onset=False)                               # the orbit's air

# ═════ music: restrained, under the action ═════
D2, A2, D3 = 38, 45, 50
put(mus, pad([D2, A2], 2.6, 0.5, atk=0.8, rel=0.6), 0.0, -16, send=0.1)                  # drone under the spin
ARP = [62, 65, 69, 72, 74, 72, 69, 65]                                                    # D minor 9, glass plucks
beat = 0.5
for i in range(int((RISE[1] - 3.05) / 0.25)):
    tm = 3.05 + i * 0.25
    if tm >= RISE[1] - 0.02: break
    open_ = min(1, (tm - 3.05) / 4.5)
    put(mus, glass(ARP[i % 8] + (12 if i % 16 >= 12 else 0), 0.7, 0.35 + 0.25 * open_), tm, -22 + 6 * open_, pan=0.3 * np.sin(i))
put(mus, pad([D2, 57, 60, 65], RISE[1] - 3.05 + 0.3, 0.7, atk=1.5, rel=0.3), 3.05, -20)
for i in range(int((RISE[1] - 5.55) / beat)):                                              # soft pulse once the line lands
    put(mus, kick(), 5.55 + i * beat, -17 + 2 * (i / 6))
# the strike chord: D major opens; bells answer the words; a cadence on the name
put(mus, pad([D2, 50, 57, 62, 66, 69], DUR - STRIKE, 0.9, atk=0.02, rel=2.2), STRIKE, -15)
put(mus, glass(74, 3.0, 0.9) + glass(62, 3.0, 0.6), STRIKE + 0.02, -17)
for tm, m in [(SEE[0], 69), (SEE[1], 71), (SEE[2], 73), (SEE[3], 74)]: put(mus, glass(m, 1.8, 0.7), tm, -21)
for i in range(6): put(mus, kick(0.8), STRIKE + 1.0 + i * 0.5, -21)
put(mus, glass(62, 4, 1.0) + glass(69, 4, 0.5) + glass(74, 4, 0.6), LOCK, -14)
put(mus, sub(70, 37, 2.0, 0.6), LOCK, -12)

# true silence before the strike: cut every bus, tails included
s0, s1 = int((RISE[1] + 0.02) * SR), int((STRIKE - 0.32) * SR)
for B in (fx, mus, room_send):
    B[s0 - 480:s0] *= np.linspace(1, 0, 480)[:, None]; B[s0:s1] = 0

# ═════ one room ═════
rn = int(1.3 * SR); t_ = tt(rn); ir = np.zeros((rn, 2))
for c in range(2): ir[:, c] = rng.standard_normal(rn) * np.exp(-t_ * 6.9 / 1.1)
ir[:int(0.012 * SR)] = 0
for d, a in [(0.017, 0.5), (0.029, 0.35), (0.041, 0.25)]: ir[int(d * SR), 0] += a; ir[int((d + 0.003) * SR), 1] += a
ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([fftconv(room_send[:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.5
wet[s0:s1] = 0
for name, mix in [('fx_only', fx + wet), ('with_music', fx + wet + mus * 0.8)]:
    mix = mix.astype(np.float32); mix.tofile(name + '.f32')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', name + '.f32',
                    '-af', 'highpass=f=28,loudnorm=I=-14:TP=-1.5:LRA=9,alimiter=limit=0.84:level=false', '-ar', '48000', name + '.wav'], check=True)
    print(name, 'ok')
