import sys, torch, torchaudio
from chatterbox.tts import ChatterboxTTS
m = ChatterboxTTS.from_pretrained(device='cpu')
LINES = {
  'l1': "Every Sunday, Mama laid out the good silver.",
  'l2': "Forty years of Sunday dinners.",
  'l3': "Last spring, we cleaned out her house.",
  'l4': "I almost gave her silver away.",
  'l5': "Check the back... before you give it away.",
}
out = sys.argv[1]; takes = int(sys.argv[2]) if len(sys.argv) > 2 else 2
ONLY = sys.argv[3].split(',') if len(sys.argv) > 3 else None
for k, txt in LINES.items():
    if ONLY and k not in ONLY: continue
    for j in range(takes):
        torch.manual_seed(100 + j)
        wav = m.generate(txt, exaggeration=0.62, cfg_weight=0.35, temperature=0.75)
        torchaudio.save(f'{out}/{k}_{j}.wav', wav, m.sr)
        print(k, j, round(wav.shape[-1] / m.sr, 2), flush=True)
