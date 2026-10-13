# mix_ios.py : sound for "Good eye": real iOS sounds on every interaction, the voice on top, a 120 BPM bed
# that drops out for the snap and comes back fuller. Writes fx_only.wav and with_music.wav (-14 LUFS).
import subprocess, numpy as np
SR = 48000; LEN = 18.6; N = int(LEN * SR)
SFX = '/tmp/claude-0/-home-user-agrefining/9fbaafbb-3210-5aca-8623-467a5c6680b5/scratchpad/agfilm/sfx/'
T = dict(n=[0.30, 0.62, 0.94], h1=1.05, clear=2.55, grid=2.75, tap=4.30, flip=4.95, zoom=5.55, live=6.35, spot=7.15, type=7.45,
         res=8.35, wait=8.95, gather=9.55, snap=10.70, thread=11.05, typeMsg=11.45, send=13.70, dots=13.95, m2=14.40, m3=14.90,
         logo=15.55, word=16.10)
SIL = (10.30, T['snap'])
rng = np.random.default_rng(5)
tt = lambda n: np.arange(n) / SR
fx, mus, vox = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2))

def load(p, rate=1.0):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(int(SR / rate)), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)
def peak_i(x, onset):
    m = np.abs(x).mean(1)
    if onset: return int(np.argmax(m > m.max() * 0.3))
    w = int(SR * 0.004); return int(np.argmax(np.convolve(m, np.ones(w) / w, 'same')))
def put(buf, x, at, db=0.0, pan=0.0):
    if x.ndim == 1: x = np.stack([x * np.sqrt(1 - pan), x * np.sqrt(1 + pan)], 1) / np.sqrt(2) * np.sqrt(2)
    st = int(at * SR); a, b = max(0, st), min(N, st + len(x))
    if b > a: buf[a:b] += x[a - st:b - st] * 10 ** (db / 20)
def place(name, at, db, onset=True, rate=1.0, pan=0.0):
    x = load(SFX + name, rate); x /= np.abs(x).max() + 1e-9
    if pan: x = x * np.array([np.sqrt(1 - pan), np.sqrt(1 + pan)])
    put(fx, x, at - peak_i(x, onset) / SR, db)

# ── interactions ──
for t, s, db in zip(T['n'], ['ios/ios_tritone.wav', 'ios/ios_note.wav', 'ios/ios_received.wav'], [-15, -17, -17]): place(s, t + 0.02, db)
place('swoosh.wav', T['clear'] + 0.12, -22, onset=False)
place('ui/open_ui.wav', T['grid'] + 0.05, -24)
place('pack5/button_1.wav', T['tap'], -18)
place('pack3/woosh.wav', T['flip'] + 0.27, -23, onset=False)
place('whoosh.wav', T['zoom'] + 0.45, -28, onset=False)
place('ios/ios_tink.wav', T['live'], -12)
place('pack6/ui_sfx.wav', T['spot'], -21)
for i in range(len('sterling silver')):
    if 'sterling silver'[i] != ' ': place('ios/ios_key.wav', T['type'] + i * 0.62 / 15, -27 - 3 * rng.random())
place('pop.wav', T['res'], -22)
place('pack3/cinematic_woosh.wav', T['gather'] + 0.65, -25, onset=False)
place('whoosh.wav', 9.30 + 0.25, -24, onset=False)
place('pack3/woosh.wav', 10.98 + 0.22, -22, onset=False)
place('pack3/woosh.wav', 4.42 + 0.2, -27, onset=False)
# the snap: the loudest UI moment, after a real silence
place('ios/ios_lock.wav', T['snap'], -8)
place('snap.wav', T['snap'] + 0.004, -20)
n = int(0.4 * SR); th = np.sin(2 * np.pi * np.cumsum(55 + 70 * np.exp(-tt(n) * 30)) / SR) * np.exp(-tt(n) * 9)
put(fx, th, T['snap'], -12)
place('ui/open_ui.wav', T['thread'], -25)
# kinetic type: a felt thump under each slam, never louder than the voice
for at, db in ((1.59 + 0.1, -21), (T['wait'] + 0.2, -22), (9.15 + 0.2, -23)): put(fx, th, at, db)
msg = 'wait… is grandma’s silver worth something??'
span = T['send'] - 0.12 - T['typeMsg']
for i, ch in enumerate(msg):
    if ch != ' ': place('ios/ios_key.wav', T['typeMsg'] + i / len(msg) * span, -29 - 3 * rng.random())
place('swoosh.wav', T['send'] + 0.06, -21, onset=False)
place('ios/ios_received.wav', T['m2'], -13)
place('ios/ios_received.wav', T['m3'], -19)
place('ios/ios_success.wav', T['logo'] + 0.05, -14)
place('pack3/shine.wav', T['word'] + 0.2, -26, onset=False)

# ── the voice: high-pass, gentle de-ess, presence, compression ──
VO = [('v1_1', T['h1']), ('v2_0', T['wait']), ('v3_0', T['typeMsg']), ('v4_1', 15.65)]
duck = np.zeros(N)
for k, at in VO:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'../ios/vo/{k}.wav', '-ac', '1', '-ar', str(SR), '-af',
                          'highpass=f=85,deesser=i=0.4,equalizer=f=3500:t=q:w=1.3:g=3,equalizer=f=200:t=q:w=1:g=1,acompressor=threshold=0.09:ratio=3.5:attack=4:release=110:makeup=1.8',
                          '-f', 'f32le', '-'], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).astype(float); v /= np.abs(v).max() + 1e-9
    put(vox, v, at, -2); st = int(at * SR); duck[max(0, st - 2400):min(N, st + len(v) + 6000)] = 1
k = int(0.12 * SR); duck = np.convolve(duck, np.ones(k) / k, 'same')

# ── music: 120 BPM, soft and modern; quiet tension -> silence -> the drop on the snap ──
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(m, d=0.5, v=0.5):
    n = int(d * SR); t = tt(n); f = hz(m)
    y = np.sin(2 * np.pi * f * t + 1.6 * np.exp(-t * 18) * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t * 7)
    return y * np.minimum(1, t / 0.003) * v
def kick(v=1.0):
    n = int(0.3 * SR); t = tt(n); return np.sin(2 * np.pi * np.cumsum(45 + 120 * np.exp(-t * 40)) / SR) * np.exp(-t * 12) * v
def hat(v=0.3):
    n = int(0.05 * SR); x = rng.standard_normal(n); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR); X[f < 7000] = 0
    return np.fft.irfft(X, n) * np.exp(-tt(n) * 90) * v
def pad(ms, d, v):
    n = int(d * SR); t = tt(n); y = sum(np.sin(2 * np.pi * hz(m) * 2 ** (dt / 12) * t + rng.random() * 6) for m in ms for dt in (-0.05, 0.06))
    return y / (2 * len(ms)) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.5).clip(0) * v
B = 0.5
CH = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [58, 62, 65, 69]]   # Fmaj7 Am7 Dm7 Bbmaj7
bar = 0
t = 0.0
while t < SIL[0] - 0.01:                       # section A: plucks on 8ths, soft kick on 1 and 3, a quiet pad
    ch = CH[bar % 4]
    put(mus, pad([c - 12 for c in ch[:2]] + ch[2:], 2.0, 0.22), t)
    for e in range(8):
        te = t + e * B / 2
        if te >= SIL[0] - 0.02: break
        put(mus, pluck(ch[e % 4] + (12 if e in (3, 6) else 0), 0.45, 0.32 if e % 2 else 0.42), te, pan=0.3 * np.sin(e))
        if e % 4 == 0: put(mus, kick(0.6), te)
        put(mus, hat(0.12 if e % 2 else 0.07), te)
    t += 2.0; bar += 1
s0 = int(SIL[0] * SR); mus[s0 - 1200:s0] *= np.linspace(1, 0, 1200)[:, None]; mus[s0:] = 0
t = T['snap']; bar = 0
while t < 18.2:                                # section B: the drop, fuller, four on the floor, then resolve on the logo
    ch = CH[bar % 4] if t < T['logo'] - 0.2 else [53, 57, 60, 65]
    put(mus, pad([ch[0] - 12] + ch, 2.0, 0.3), t)
    put(mus, np.sin(2 * np.pi * hz(ch[0] - 24) * tt(int(1.9 * SR))) * np.exp(-tt(int(1.9 * SR)) * 1.2) * 0.35, t)
    for e in range(8):
        te = t + e * B / 2
        if te > 18.2: break
        if t < T['logo'] - 0.2:
            put(mus, pluck(ch[(e * 3) % 4] + 12, 0.4, 0.3), te, pan=0.35 * np.cos(e))
            if e % 2 == 0: put(mus, kick(0.8), te)
            put(mus, hat(0.16 if e % 2 else 0.09), te)
    t += 2.0; bar += 1
e0 = int(18.1 * SR); mus[e0:] *= np.linspace(1, 0, N - e0)[:, None]
mus *= (1 - 0.65 * duck)[:, None]
# the silence before the snap is total
for buf in (fx, vox):
    pass
a, b = int(SIL[0] * SR), int((SIL[1] - 0.01) * SR); fx[a:b] *= 0.0

def master(x, name):
    x.astype(np.float32).tofile(name + '.f32')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', name + '.f32', '-af',
                    'highpass=f=30,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000,alimiter=limit=0.8:attack=1:release=60:level=false',
                    '-ar', '48000', '-c:a', 'pcm_s16le', name + '.wav'], check=True)
master(fx + vox, 'fx_only'); master(fx + vox + mus * 0.85, 'with_music'); print('ok')
