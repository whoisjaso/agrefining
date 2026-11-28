# score2.py : the AG "silver inside" film. Action sound first, restrained music under it, one room for everything.
# Timeline constants copied from film.html T (one source; keep in sync).
import subprocess, numpy as np
SR = 48000; DUR = 15.0; N = int(DUR * SR)
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


# ═════ Exhibit A / Exhibit B ═════  (times from textlayer2.html and build2.py)
CPS = 34
TYPE = [(1.43, "A spoon from a kitchen drawer.", 34), (3.76, "Stamped on the back: 925", 18.1), (7.14, "A silver bar.", 34), (7.69, "Stamped: 999", 34.6)]
FLIP, CUT, PULL, LOCK = (3.0, 3.55), 6.0, (8.55, 10.4), 10.8
SILENCE = (9.55, 10.75)

# room tone in the kitchen: faint air and a fridge hum (stops dead on the cut to the studio)
n = int(CUT * SR); tr = tt(n)
room = bandnoise(n, 120, 2400) * 0.05 + 0.03 * np.sin(2 * np.pi * 60 * tr) + 0.015 * np.sin(2 * np.pi * 120 * tr)
room *= np.minimum(1, tr / 0.3)
put(fx, room, 0.0, -22, send=0.1)
# captions: a soft key per word, panels arrive with a click
for t0, s, cps in TYPE:
    for i, ch in enumerate(s):
        if i == 0 or s[i - 1] == ' ':
            place('pack5/typing_2.wav', t0 + i / cps, -31 - 2 * (i % 3), pan=-0.35)
for tc in (0.45, 6.12): place('pack6/ui_sfx.wav', tc, -24, pan=-0.3)
# the spoon turns over: a lift, then it lands on the liner (dull, not a ring)
place('pack3/woosh.wav', 3.27, -30, onset=False)
put(fx, ring([(1850, 1, 26), (3720, 0.5, 34), (5900, 0.25, 45)], 0.4, 1.4) + 0.0, FLIP[1], -13, pan=0.1, send=0.3)
put(fx, ring([(1850, 1, 30), (3720, 0.4, 40)], 0.3, 1.0), FLIP[1] + 0.09, -22, pan=0.1)
put(fx, 0.6 * sub(140, 80, 0.2), FLIP[1], -16)
# the dive to the mark
place('pack3/cinematic_woosh.wav', 4.05, -24, onset=False)
# EVIDENCE: the same hit on 925 and on 999, so the ear pairs them before the head does
EVID = [4.92, 7.95]
for te in EVID:
    put(fx, sub(95, 46, 1.2, 1.0), te, -9, send=0.2)
    place('ui/reverb_hit.wav', te, -18)
    put(fx, ring([(880, 1, 5), (1320, 0.5, 7), (2640, 0.25, 10)], 1.6, 0.3), te, -24, send=0.5)
# the cut to the studio: a camera-shutter snap, like a photograph entered into evidence
place('pack3/camera_click.wav', CUT, -15)
put(fx, 0.5 * sub(120, 60, 0.3), CUT, -15)
place('pack3/shine.wav', 6.8, -24, onset=False)
# the pull back: air, then nothing
place('pack3/cinematic_woosh.wav', 9.2, -27, onset=False)

# ═════ music: a news-desk tension bed under the exhibits ═════
A1, E2, D3 = 33, 40, 50
bed_end = SILENCE[0]
put(mus, pad([A1, E2, 57, 60], bed_end + 0.4, 0.55, atk=1.2, rel=0.4), 0.0, -18, send=0.1)
for i in range(int(bed_end / 0.5)):                       # the clock: a filtered tick on every half second
    tm = 0.25 + i * 0.5
    if tm > bed_end - 0.05: break
    put(mus, bandnoise(int(0.03 * SR), 3000, 9000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 160), tm, -30 + (4 if i % 4 == 0 else 0), pan=0.25)
for i in range(int((bed_end - 1.0) / 0.857)):              # a slow heartbeat pulse (70 bpm), entering after the first statement
    tm = 1.0 + i * 0.857
    if tm > bed_end - 0.1: break
    put(mus, kick(0.9), tm, -20); put(mus, kick(0.5), tm + 0.16, -26)
for tm, m in [(0.55, 69), (2.0, 72), (6.2, 69)]:  # sparse glass notes on the statements
    put(mus, glass(m, 1.6, 0.6), tm, -25)
# the answer: a warm major chord and the sound of being paid
put(mus, pad([D3 - 12, 50, 57, 62, 66, 69], DUR - LOCK, 0.9, atk=0.05, rel=2.4), LOCK, -16)
put(mus, glass(74, 3.5, 0.9) + glass(78, 3.5, 0.5), LOCK + 0.02, -18)
put(mus, sub(70, 37, 2.0, 0.6), LOCK, -13)
place('ios/ios_success.wav', LOCK + 0.42, -19)
place('pack3/swoosh.wav' if False else 'swoosh.wav', LOCK + 0.25, -27, onset=False)
place('pack3/shine.wav', LOCK + 0.75, -25, onset=False)
for tm, m in [(LOCK + 1.3, 74), (LOCK + 1.6, 81)]: put(mus, glass(m, 2.2, 0.6), tm, -24)

VO = [('a1', 0.55), ('a2', 3.76), ('b1', 6.20), ('b2', 7.95), ('l1', 10.85), ('l2', 13.45)]
TTS = '/tmp/claude-0/-home-user-agrefining/9fbaafbb-3210-5aca-8623-467a5c6680b5/scratchpad/tts/'
vox = np.zeros((N, 2)); duck = np.zeros(N)
def load_abs(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-af', 'highpass=f=90,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=0.12:ratio=3.5:attack=4:release=90:makeup=2', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)
for key, at in VO:
    v = load_abs(TTS + 'af_heart_' + key + '.wav'); v = v / (np.abs(v).max() + 1e-9)
    st = int(at * SR); e = min(N, st + len(v)); vox[st:e] += v[:e - st, None] * 10 ** (-4 / 20); room_send[st:e] += v[:e - st, None] * 0.06
    duck[max(0, st - 2400):e + 9600] = 1
k = int(0.12 * SR); duck = np.convolve(duck, np.ones(k) / k, 'same')
mus *= (1 - 0.68 * duck)[:, None]            # music down ~10 dB under the voice
fx += vox
# true silence while the viewer puts the two pieces together
s0, s1 = int(SILENCE[0] * SR), int(SILENCE[1] * SR)
for Bf in (fx, mus, room_send):
    Bf[s0 - 960:s0] *= np.linspace(1, 0, 960)[:, None]; Bf[s0:s1] = 0
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
                    '-af', 'highpass=f=28,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000,alimiter=limit=0.8:attack=1:release=60:level=false', '-ar', '48000', '-c:a', 'pcm_s16le', name + '.wav'], check=True)
    print(name, 'ok')
