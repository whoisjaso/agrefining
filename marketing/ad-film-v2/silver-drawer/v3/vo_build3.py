# vo_build3.py : pick -> assemble the chosen Orpheus takes with human pauses, Liquid Motion voice chain (voiceover-human.md section 6),
# then whisper word timestamps and the old->new warp anchors for gen3.py.   usage: vo_build3.py picks.json
import json, re, subprocess, sys, numpy as np, soundfile as sf
SR = 48000
PICKS = json.load(open(sys.argv[1]))                       # {"b00": "/path/take.wav", ...} in beat order
ORDER = ['b00', 'b01', 'b02', 'b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09', 'b10', 'b11']
GAP = dict(b00=0.05, b01=0.25, b02=0.50, b03=0.10, b04=0.45, b05=0.30, b06=0.35, b07=0.40, b08=0.60, b09=0.22, b10=0.95, b11=0.45)
CHAIN = ('highpass=f=80:poles=2,highpass=f=80:poles=2,equalizer=f=280:t=q:w=1:g=-2.5,equalizer=f=550:t=q:w=1:g=-1.5,'
         'equalizer=f=3400:t=q:w=1:g=2.5,highshelf=f=10000:g=1,deesser=i=0.5,'
         'acompressor=threshold=0.063:ratio=3:attack=6:release=90:knee=6,speechnorm=e=6:r=0.0001:l=1')
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-af', CHAIN, '-f', 'f32le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32).astype(float)
    env = np.convolve(np.abs(a), np.ones(480) / 480, 'same'); on = np.where(env > env.max() * 0.03)[0]
    a = a[max(0, on[0] - 480):on[-1] + 2400]
    f = int(0.012 * SR); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)     # 12 ms fades at every cut
    return a
clips = [load(PICKS[b]) for b in ORDER]; t = 0.0; place = []
for b, c in zip(ORDER, clips): t += GAP[b]; place.append(round(t, 3)); t += len(c) / SR
N = int((t + 2.0) * SR); out = np.zeros(N)
for p, c in zip(place, clips): s = int(p * SR); out[s:s + len(c)] += c
sf.write('vo_raw.wav', (out / np.abs(out).max() * 0.7).astype(np.float32), SR)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'vo_raw.wav', '-af', 'loudnorm=I=-15:TP=-2:LRA=11', '-ar', str(SR), '-c:a', 'pcm_s24le', 'vo.wav'], check=True)
from faster_whisper import WhisperModel
m = WhisperModel('small.en', device='cpu', compute_type='float32')
a, sr = sf.read('vo.wav', dtype='float32'); a = a if a.ndim == 1 else a.mean(1)
n = int(len(a) * 16000 / sr); a16 = np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32)
segs, _ = m.transcribe(a16, word_timestamps=True, language='en', beam_size=5)
NEW = [[round(w.start, 3), round(w.end, 3), w.word.strip()] for s in segs for w in s.words]
OLD = json.load(open('../v2/vo_words.json'))
norm = lambda w: {'em': 'm', 'them': 'm', 'rents': 'rent', "rent's": 'rent', 'do': 'due', 'dew': 'due', 'sitting': "sittin'", '9.25': '925',
                  'causeman': 'cause'}.get(re.sub(r"[^a-z0-9'.]", '', w.lower()).strip('.'), re.sub(r"[^a-z0-9'.]", '', w.lower()).strip('.'))
o, nw = [norm(w[2]) for w in OLD], [norm(w[2]) for w in NEW]
d = [[0] * (len(nw) + 1) for _ in range(len(o) + 1)]
for i in range(len(o) - 1, -1, -1):
    for j in range(len(nw) - 1, -1, -1): d[i][j] = d[i + 1][j + 1] + 1 if o[i] == nw[j] else max(d[i + 1][j], d[i][j + 1])
i = j = 0; pairs = []
while i < len(o) and j < len(nw):
    if o[i] == nw[j]: pairs.append((OLD[i][0], NEW[j][0])); i += 1; j += 1
    elif d[i + 1][j] >= d[i][j + 1]: i += 1
    else: j += 1
pairs = [p for k, p in enumerate(pairs) if k == 0 or (p[0] > pairs[k - 1][0] and p[1] > pairs[k - 1][1])]
json.dump(dict(old=[p[0] for p in pairs], new=[p[1] for p in pairs], len_new=round(N / SR, 3), vo_words_new=NEW,
               vo_path='/tmp/claude-0/-home-user-agrefining/9fbaafbb-3210-5aca-8623-467a5c6680b5/scratchpad/silver/v3/vo.wav', place=place),
          open('warp.json', 'w'), indent=1)
print('len', round(N / SR, 2), 'anchors', len(pairs), 'of', len(OLD), 'old words;', ' '.join(f'{w[2]}@{w[0]}' for w in NEW))
