# score.py : rank Orpheus takes. intelligibility (whisper float32 word match, homophone-tolerant), expressiveness (pitch range),
# cleanliness (whisper confidence, no long dead air, no clipping). Writes scores.json.
import glob, json, re, os, numpy as np, soundfile as sf, librosa
from faster_whisper import WhisperModel
m = WhisperModel('small.en', device='cpu', compute_type='float32')
B = dict(json.load(open('beats.json')))
SAME = {'rents': "rent's", 'do': 'due', 'dew': 'due', 'them': "'em", 'em': "'em", 'm': "'em", 'sitting': "sittin'", 'cause': "'cause",
        'drawers': "drawer's", 'bills': "bill's", '925': 'nine twenty five', 'a.g.': 'a g', 'ag': 'a g'}
def norm(s):
    s = re.sub(r'<[^>]+>', ' ', s.lower()).replace('-', ' ').replace('...', ' ')
    out = []
    for w in re.findall(r"[a-z0-9'.]+", s):
        w = w.strip('.'); w = SAME.get(w, w); out += w.split()
    return [w.replace("'", '') for w in out if w]
def lcs(a, b):
    d = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a)):
        for j in range(len(b)): d[i + 1][j + 1] = d[i][j] + 1 if a[i] == b[j] else max(d[i][j + 1], d[i + 1][j])
    return d[-1][-1]
res = {}
for f in sorted(glob.glob('takes/*/*.wav')):
    run, bid = f.split('/')[1], os.path.basename(f)[:-4]
    y, sr = sf.read(f, dtype='float32'); y16 = librosa.resample(y, orig_sr=sr, target_sr=16000)
    segs, _ = m.transcribe(y16, language='en', beam_size=5, word_timestamps=True); segs = list(segs)
    txt = ' '.join(s.text for s in segs); ref = norm(B[bid]); hyp = norm(txt.replace('925', 'nine twenty five'))
    acc = lcs(ref, hyp) / max(1, len(ref)); extra = max(0, len(hyp) - len(ref))
    f0, vf, _ = librosa.pyin(y16, fmin=60, fmax=400, sr=16000, frame_length=1024); f0 = f0[vf & ~np.isnan(f0)]
    rng = float(np.percentile(12 * np.log2(f0 / np.median(f0)), 95) - np.percentile(12 * np.log2(f0 / np.median(f0)), 5)) if len(f0) > 10 else 0
    env = np.convolve(np.abs(y16), np.ones(1600) / 1600, 'same'); quiet = env < env.max() * 0.02
    runs, cur = [], 0
    for q in quiet:
        cur = cur + 1 if q else 0; runs.append(cur)
    longest_gap = max(runs) / 16000
    conf = float(np.mean([w.probability for s in segs for w in s.words])) if segs else 0
    res[f] = dict(run=run, beat=bid, acc=round(acc, 3), extra=extra, pitch_range=round(rng, 2), conf=round(conf, 3), gap=round(longest_gap, 2),
                  dur=round(len(y) / sr, 2), clip=bool(np.abs(y).max() >= 0.999), text=txt.strip())
json.dump(res, open('scores.json', 'w'), indent=1)
# voice ranking: mean over beats of the best of its two seeds
runs = sorted({v['run'] for v in res.values()}); voices = sorted({r.split('_')[0] for r in runs})
def take_score(v): return (v['acc'] >= 0.85) * (2 * v['acc'] + 0.08 * min(v['pitch_range'], 14) + v['conf'] - 0.4 * max(0, v['gap'] - 0.9) - 0.3 * v['extra'] - v['clip'])
for vo in voices:
    per = {}
    for v in res.values():
        if v['run'].startswith(vo + '_'): per.setdefault(v['beat'], []).append(take_score(v))
    print(vo, 'beats', len(per), 'score', round(np.mean([max(x) for x in per.values()]), 3), 'mean acc', round(np.mean([v['acc'] for v in res.values() if v['run'].startswith(vo + '_')]), 3),
          'pitch', round(np.mean([v['pitch_range'] for v in res.values() if v['run'].startswith(vo + '_')]), 1))
