import sys, json
from faster_whisper import WhisperModel
m = WhisperModel('base.en', device='cpu', compute_type='int8')
res = {}
for f in sys.argv[1:]:
    import soundfile as sf, numpy as np
    a, sr = sf.read(f, dtype='float32'); a = a if a.ndim == 1 else a.mean(1)
    n = int(len(a) * 16000 / sr); a = np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32)
    segs, _ = m.transcribe(a, word_timestamps=True, language='en')
    words = [(w.word.strip(), round(w.start, 2), round(w.end, 2)) for s in segs for w in s.words]
    res[f] = words; print(f, ' '.join(w[0] for w in words))
json.dump(res, open('asr.json', 'w'), indent=0)
