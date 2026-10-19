# orpheus_gen.py : Orpheus-3B (Q8 GGUF, llama.cpp on CPU) -> SNAC 24 kHz decode. One take per (beat, voice, seed).
#   orpheus_gen.py OUTDIR VOICE SEED [beat_id ...]
import sys, os, re, json, time, numpy as np, soundfile as sf, torch
from llama_cpp import Llama
from snac import SNAC
out, voice, seed = sys.argv[1], sys.argv[2], int(sys.argv[3]); only = set(sys.argv[4:])
os.makedirs(out, exist_ok=True)
llm = Llama(model_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'orpheus-q8.gguf'), n_ctx=4096, n_threads=4, verbose=False, seed=seed)
snac = SNAC.from_pretrained('hubertsiuzdak/snac_24khz').eval()
TOK = re.compile(r'<custom_token_(\d+)>')
def decode(ids):
    n = len(ids) // 7; f = ids[:n * 7]
    c0 = torch.tensor([f[7 * j] for j in range(n)]).unsqueeze(0)
    c1 = torch.tensor([x for j in range(n) for x in (f[7 * j + 1], f[7 * j + 4])]).unsqueeze(0)
    c2 = torch.tensor([x for j in range(n) for x in (f[7 * j + 2], f[7 * j + 3], f[7 * j + 5], f[7 * j + 6])]).unsqueeze(0)
    for c in (c0, c1, c2):
        if (c < 0).any() or (c > 4096).any(): raise ValueError('code out of range')
    with torch.inference_mode(): return snac.decode([c0, c1, c2]).squeeze().numpy()
for bid, text in json.load(open(os.environ.get('BEATS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'beats.json'))):
    if only and bid not in only: continue
    t0 = time.time(); prompt = f'<|audio|>{voice}: {text}<|eot_id|>'
    res = llm.create_completion(prompt, max_tokens=1600, temperature=0.6, top_p=0.9, repeat_penalty=1.1, seed=seed)
    ids, k = [], 0
    for m in TOK.finditer(res['choices'][0]['text']):
        v = int(m.group(1)) - 10 - ((k % 7) * 4096)
        if v > 0: ids.append(v); k += 1
    try: audio = decode(ids)
    except Exception as e: print(bid, 'FAILED', e, flush=True); continue
    sf.write(f'{out}/{bid}.wav', audio, 24000)
    print(bid, voice, seed, f'{len(audio) / 24000:.2f}s audio in {time.time() - t0:.0f}s', flush=True)
