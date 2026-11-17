# guitar.py : a fingerpicked acoustic guitar, physically modelled (extended Karplus-Strong), for "Sunday silver".
# Usage: import and call strum/pick; or run to audition a progression -> guitar_test.wav
import numpy as np
SR = 48000
rng = np.random.default_rng(7)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def pluck(m, dur=3.0, vel=0.8, bright=0.55, pos=0.18):
    """one string: noise burst -> comb (pick position) -> delay loop with loss + fractional delay, body resonance after."""
    f = hz(m); n = int(dur * SR); N = SR / f; L = int(N); frac = N - L
    burst = rng.uniform(-1, 1, L) * vel
    # pick position: comb filter on the excitation (a pick near the bridge is brighter)
    p = max(1, int(pos * L)); burst = burst - np.concatenate([np.zeros(p), burst[:-p]])
    # soften the excitation with velocity
    a = 0.5 + 0.45 * bright * vel
    for i in range(1, L): burst[i] = a * burst[i] + (1 - a) * burst[i - 1]
    y = np.zeros(n); y[:L] = burst
    loss = 0.9975 - 0.0022 * max(0, (m - 52)) / 24     # higher strings decay faster
    s = 0.78 + 0.1 * bright
    # block-vectorised loop: each block of L samples depends only on the previous block
    k = 1.0 - frac * 0.02
    i = L
    while i < n:
        j = min(n, i + L)
        prev = y[i - L:j - L]; prev1 = y[i - L - 1:j - L - 1] if i - L - 1 >= 0 else np.concatenate([[0.0], y[i - L:j - L - 1]])
        y[i:j] = loss * (s * prev + (1 - s) * prev1) * k
        i = j
    fade = np.minimum(1, (n - np.arange(n)) / (0.05 * SR)); return y * fade

def body(x):
    """guitar body: a few resonant modes (~100, 200, 400 Hz) + air, as a short IR."""
    t = np.arange(int(0.08 * SR)) / SR
    ir = np.zeros_like(t); ir[0] = 1
    for f0, g, d in [(98, 0.12, 30), (196, 0.1, 36), (410, 0.1, 50), (2400, 0.04, 120)]:
        ir += g * np.sin(2 * np.pi * f0 * t) * np.exp(-t * d)
    L = len(x) + len(ir) - 1; F = 1 << (L - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)]

def render(events, total):
    """events: (t, midi, vel, dur, pan) -> stereo"""
    out = np.zeros((int(total * SR) + SR, 2))
    for t, m, v, d, pan in events:
        y = body(pluck(m, d, v)); st = int(t * SR); e = min(len(out), st + len(y))
        out[st:e, 0] += y[:e - st] * np.sqrt(0.5 * (1 - pan)); out[st:e, 1] += y[:e - st] * np.sqrt(0.5 * (1 + pan))
    return out[:int(total * SR)]

def fingerpick(chords, t0, beat, bars_each=1, humanize=0.012):
    """travis-style pattern per bar of 4 beats: bass on 1 and 3, alternating, treble on the off-beats"""
    ev = []; t = t0
    for ch in chords:
        bass, alt, *tre = ch
        for b in range(bars_each):
            pat = [(0, bass, 0.85), (0.5, tre[0], 0.45), (1, alt, 0.6), (1.5, tre[1], 0.5), (2, bass, 0.75), (2.5, tre[2], 0.45), (3, alt, 0.55), (3.5, tre[1], 0.42)]
            for off, m, v in pat:
                ev.append((t + off * beat + rng.normal(0, humanize), m, v * (0.9 + 0.2 * rng.random()), 3.2, -0.15 if m < 55 else 0.2))
            t += 4 * beat
    return ev, t

if __name__ == '__main__':
    import subprocess
    G = (43, 50, 59, 62, 67); C = (48, 55, 60, 64, 67); Em = (40, 47, 59, 64, 67); D = (50, 57, 62, 66, 69)
    ev, t = fingerpick([G, Em, C, D, G], 0.2, 0.42)
    a = render(ev, t + 2.5); a /= np.abs(a).max() * 1.15
    a.astype(np.float32).tofile('g.f32')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', 'g.f32', 'guitar_test.wav'], check=True)
    print('ok', t)
