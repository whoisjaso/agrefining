# anchors.py : old (v2 timeline the scenes were authored on) -> new (refined Orpheus onsets), matched beat by beat.
import json, re, numpy as np
OLD = json.load(open('../v2/vo_words.json')); OP = json.load(open('../v2/vo_place.json'))['lines']
NEWB = json.load(open('words_by_beat.json')); REF = json.load(open('wb_sync.json')); W = json.load(open('warp.json'))
ORDER = ['b00', 'b01', 'b02', 'b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09', 'b10', 'b11']
SAME = {'em': 'm', 'them': 'm', 'rents': 'rent', 'rent': 'rent', 'do': 'due', 'dew': 'due', 'sitting': 'sittin', 'sit': 'sittin', 'cause': 'cause',
        'because': 'cause', 'cuz': 'cause', 'causeman': 'cause', 'drawers': 'drawer', 'bills': 'bill', 'houstons': 'houston', 'there': 'there', 'theres': 'theres'}
norm = lambda w: SAME.get(re.sub(r"[^a-z0-9]", '', w.lower()), re.sub(r"[^a-z0-9]", '', w.lower()))
new = [dict(s=r['s_snap'] if 's_snap' in r else r['s_frame'] / 60, w=n[2], b=n[3]) for r, n in zip(REF, NEWB)]
oldb = []
for w in OLD:
    k = max([i for i, p in enumerate(OP) if p <= w[0] + 0.15] or [0]); oldb.append(dict(s=w[0], w=w[2], b=ORDER[k]))
pairs = []
for b in ORDER:
    o = [x for x in oldb if x['b'] == b]; n = [x for x in new if x['b'] == b]
    if not o or not n: continue
    a, c = [norm(x['w']) for x in o], [norm(x['w']) for x in n]
    d = [[0] * (len(c) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) - 1, -1, -1):
        for j in range(len(c) - 1, -1, -1): d[i][j] = d[i + 1][j + 1] + 1 if a[i] == c[j] else max(d[i + 1][j], d[i][j + 1])
    i = j = 0; got = {}
    while i < len(a) and j < len(c):
        if a[i] == c[j]: got[i] = n[j]['s']; i += 1; j += 1
        elif d[i + 1][j] >= d[i][j + 1]: i += 1
        else: j += 1
    # 1:1 substitutions (old "a" vs new "that"): one unmatched old and one unmatched new between the same matched neighbours pair up
    mj = {i: next(k for k in range(len(n)) if n[k]['s'] == got[i]) for i in got}
    bnd = [(-1, -1)] + sorted((i, mj[i]) for i in got) + [(len(o), len(n))]
    for (i0, j0), (i1, j1) in zip(bnd, bnd[1:]):
        if i1 - i0 == 2 and j1 - j0 == 2: got[i0 + 1] = n[j0 + 1]['s']
    # unmatched old words inside a beat: interpolate between matched neighbours (beat-local), never across beats
    ks = sorted(got); 
    for i in range(len(o)):
        if i in got: t = got[i]
        elif ks:
            t = float(np.interp(o[i]['s'], [o[k]['s'] for k in ks], [got[k] for k in ks])) if len(ks) > 1 else got[ks[0]] + (o[i]['s'] - o[ks[0]]['s'])
        else: continue
        pairs.append((o[i]['s'], t, o[i]['w'], i in got))
pairs.sort()
clean = []
for p in pairs:
    if not clean or (p[0] > clean[-1][0] + 1e-6 and p[1] > clean[-1][1] + 1e-6): clean.append(p)
W.update(old=[p[0] for p in clean], new=[p[1] for p in clean],
         vo_words_new=[[round(x['s'], 4), round(r['e'], 4), x['w']] for x, r in zip(new, REF)])
json.dump(W, open('warp.json', 'w'), indent=1)
print('anchors', len(clean), 'exact', sum(p[3] for p in clean), 'of', len(OLD)); print([ (p[2], round(p[0],2), round(p[1],2), p[3]) for p in clean if not p[3]])
