import sys, torch, torchaudio
from chatterbox.tts import ChatterboxTTS
m = ChatterboxTTS.from_pretrained(device='cpu')
L = {'v1': ("Rent is due Friday.", 0.55, 0.4), 'v2': ("Hold on.", 0.6, 0.4)}
for k, (txt, ex, cfg) in L.items():
    for j in range(3):
        torch.manual_seed(200 + j); w = m.generate(txt, exaggeration=ex, cfg_weight=cfg, temperature=0.75)
        torchaudio.save(f'vo/{k}_{j}.wav', w, m.sr); print(k, j, round(w.shape[-1] / m.sr, 2), flush=True)
