# directed read: one blended style, a different pace per line
import sys, json, os, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
L = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
style = k.get_voice_style('am_michael') * 0.5 + k.get_voice_style('am_echo') * 0.5
SPEED = [1.06, 1.03, 0.97, 1.0, 1.03, 0.98, 0.97, 0.98, 0.92, 0.99, 0.93, 0.98]
for i, t in enumerate(L):
    a, sr = k.create(t, voice=style, speed=SPEED[i], lang="en-us"); sf.write(f"{out}/{i:02d}.wav", a, sr)
print('ok')
