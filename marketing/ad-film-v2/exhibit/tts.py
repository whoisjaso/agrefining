import sys, json, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
LINES = {
  'a1': 'Exhibit A. A spoon, from a kitchen drawer.',
  'a2': 'Stamped on the back. Nine twenty-five.',
  'b1': 'Exhibit B. A silver bar.',
  'b2': 'Nine ninety-nine.',
  'l1': 'A G Refining. Houston\'s silver buyer.',
  'l2': 'Check the back of yours.',
}
voices = sys.argv[1].split(','); speed = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
out = {}
for v in voices:
    for key, txt in LINES.items():
        a, sr = k.create(txt, voice=v, speed=speed, lang='en-us')
        # trim silence
        idx = np.nonzero(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - 240): idx[-1] + 2400]
        sf.write(f'{v}_{key}.wav', a, sr); out[f'{v}_{key}'] = round(len(a) / sr, 2)
print(json.dumps(out, indent=0))
