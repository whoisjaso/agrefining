# Assemble the af_heart takes on the calm timeline: trim, voice chain, 12 ms fades, loudnorm -15 (Liquid voice slot).
import json, subprocess, numpy as np, soundfile as sf
SR = 48000
TAKES = [f'take/{i:02d}' for i in range(12)]
GAP_BEFORE = [0.05, 0.18, 0.36, 0.10, 0.42, 0.30, 0.26, 0.38, 0.60, 0.22, 1.05, 0.45]   # uneven, like a person
TAIL = 1.9
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p + '.wav', '-ac', '1', '-ar', str(SR), '-af',
        'highpass=f=80,equalizer=f=220:t=q:w=1:g=1.2,equalizer=f=3200:t=q:w=1.4:g=2,acompressor=threshold=0.1:ratio=2.5:attack=6:release=120:makeup=1.4',
        '-f', 'f32le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32).astype(float)
    env = np.convolve(np.abs(a), np.ones(480) / 480, 'same'); on = np.where(env > env.max() * 0.03)[0]
    a = a[max(0, on[0] - 240):on[-1] + 1200]
    f = int(0.012 * SR); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    return a
clips = [load(t) for t in TAKES]; t = 0.0; place = []
for g, c in zip(GAP_BEFORE, clips): t += g; place.append(round(t, 3)); t += len(c) / SR
N = int((t + TAIL) * SR); out = np.zeros(N)
for p, c in zip(place, clips): s = int(p * SR); out[s:s + len(c)] += c
rng = np.random.default_rng(4); irn = int(0.35 * SR); ir = rng.standard_normal(irn) * np.exp(-np.arange(irn) / SR * 14); ir[:int(0.008 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum())
F_ = 1 << (len(out) + irn).bit_length(); wet = np.fft.irfft(np.fft.rfft(out, F_) * np.fft.rfft(ir, F_), F_)[:len(out)]
out = out + wet * 0.09
out = out / np.abs(out).max() * 0.7
sf.write('vo_raw.wav', out.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'vo_raw.wav', '-af', 'loudnorm=I=-15:TP=-2:LRA=11', '-ar', str(SR), '-c:a', 'pcm_s24le', 'vo.wav'], check=True)
json.dump({'lines': place, 'durs': [round(len(c) / SR, 3) for c in clips], 'len': round(N / SR, 3)}, open('vo_place.json', 'w'))
print(place, round(N / SR, 2))
