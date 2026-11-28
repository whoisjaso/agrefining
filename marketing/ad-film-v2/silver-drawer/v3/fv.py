# fv.py : first visible frame per text unit, read back from the emitted piece3.jsx (inPoint + opacity keys), into events.json
import json, re, numpy as np
J = open('piece3.jsx').read().split('\n'); E = json.load(open('events.json')); L = {}
cur = None
for ln in J:
    m = re.search(r'l\.name = "([^"]+)"', ln)
    if m: cur = L.setdefault(m.group(1), {})
    if cur is None: continue
    m = re.search(r'ADBE Opacity"\)\.setValuesAtTimes\((\[[^\]]*\]),(\[[^\]]*\])\)', ln)
    if m: cur['ok'] = (json.loads(m.group(1)), json.loads(m.group(2)))
    m = re.search(r'ADBE Opacity"\)\.setValue\(([-\d.]+)\)', ln)
    if m: cur['ov'] = float(m.group(1))
    m = re.search(r'l\.inPoint = ([\d.]+); l\.outPoint = ([\d.]+)', ln)
    if m: cur['in'], cur['out'] = float(m.group(1)), float(m.group(2))
for e in E['text']:
    fv = []
    for i in range(len(e['units'])):
        d = L.get(f"{e['id']}_{i}") or L.get(e['id']); f0 = int(np.ceil(d['in'] * 60 - 1e-6))
        for k in range(f0, int(d['out'] * 60) + 1):
            o = np.interp(k / 60, *d['ok']) if 'ok' in d else d['ov']
            if o >= 2: fv.append(k); break
        else: fv.append(None)
    e['first_visible'] = fv
json.dump(E, open('events.json', 'w'), indent=1)
