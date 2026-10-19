# gen.py : builds piece2.jsx for EffectCraft. One continuous take: four depth planes, a 3D camera that pushes
# through them, every move a baked spring (single ~10% overshoot) or an expo curve, comp motion blur on.
import json, math, sys
from PIL import Image
FPS = 60; LEN = 18.6; W, H = 1080, 1920; CAMD = 1500.0
T = dict(n=[0.30, 0.62, 0.94], h1=1.05, clear=2.55, grid=2.75, tap=4.30, flip=4.95, zoom=5.55, live=6.35, spot=7.15, type=7.45,
         res=8.35, wait=8.95, gather=9.55, snap=10.70, thread=11.05, typeMsg=11.45, send=13.70, dots=13.95, m2=14.40, m3=14.90,
         logo=15.55, word=16.10, tag=17.05, url=17.40)
WORDS = {'Rent': 1.05, 'is': 1.27, 'due': 1.45, 'Friday.': 1.59}
ZA, ZB, ZE, ZF = 0.0, 2500.0, 5000.0, 7500.0
FAST = '--fast' in sys.argv

# ── curves ──
def clamp(x, a=0.0, b=1.0): return a if x < a else b if x > b else x
def spr(t, t0, dur=0.5, zeta=0.6):
    """Damped spring 0 -> 1 starting at t0, settles in ~dur, one ~10% overshoot."""
    p = t - t0
    if p <= 0: return 0.0
    w = 4.6 / (zeta * dur); wd = w * math.sqrt(1 - zeta * zeta)
    return 1 - math.exp(-zeta * w * p) * (math.cos(wd * p) + zeta * w / wd * math.sin(wd * p))
def crit(t, t0, dur=0.5):
    """Critically damped: fast and soft, no overshoot."""
    p = t - t0
    if p <= 0: return 0.0
    w = 6.6 / dur; return 1 - math.exp(-w * p) * (1 + w * p)
def ez(t, t0, dur, kind='io'):
    p = clamp((t - t0) / dur)
    if kind == 'io': return 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2
    if kind == 'out': return 1 - (1 - p) ** 4
    if kind == 'in': return p ** 3
    if kind == 'expo':
        if p in (0.0, 1.0): return p
        return 2 ** (20 * p - 10) / 2 if p < 0.5 else (2 - 2 ** (-20 * p + 10)) / 2
    if kind == 'lin': return p
def mix(a, b, k): return a + (b - a) * k
def fade(t, t0, dur): return clamp((t - t0) / dur)

# ── camera: rests 1500 in front of a plane, whips between planes on an expo curve, always drifting ──
MOVES = [(2.55, 0.55, ZA, ZB), (9.30, 0.50, ZB, ZE), (10.98, 0.45, ZE, ZF)]
DRIFT = 11.0
def rest(plane, t, s0): return plane - CAMD - 60 + DRIFT * (t - s0)
def camz(t):
    z = rest(ZA, t, 0.0); s0 = 0.0; pl = ZA
    for t0, d, a, b in MOVES:
        if t >= t0:
            e = ez(t, t0, d, 'expo'); z = mix(rest(a, t, s0), rest(b, t, t0), e); pl = mix(a, b, e)
            if t >= t0 + d: s0 = t0
    return z, pl
def cam(t):
    z, pl = camz(t); drift = 0
    x = 540 + 48 * math.sin(t * 0.42); y = 960 + 26 * math.sin(t * 0.31 + 1)
    for tk, amp in ((WORDS['Friday.'] + 0.1, 9), (T['wait'] + 0.22, 8), (9.15 + 0.22, 7)):
        q = t - tk
        if 0 <= q < 0.4: g = amp * math.exp(-q * 13); x += g * math.sin(q * 90); y += g * math.cos(q * 120)
    # the snap: a short decaying shake
    p = t - T['snap']
    if 0 <= p < 0.5:
        a = 16 * math.exp(-p * 11); x += a * math.sin(p * 97); y += a * math.cos(p * 131)
    return [x, y, z]

layers = []   # dicts: id, src, sc, tin, tout, f(t)->props, fx
def L(id, src, f, tin=0.0, tout=LEN, sc=50.0, mb=True, fx=None, solid=None, blend=None):
    layers.append(dict(id=id, src=src, f=f, tin=tin, tout=tout, sc=sc, mb=mb, fx=fx or {}, solid=solid, blend=blend))
def P(x, y, z=0.0, s=1.0, o=1.0, ry=0.0, rz=0.0, sx=None, blur=None, wipe=None, rx=0.0):
    d = dict(x=x, y=y, z=z, s=s, o=o, ry=ry, rz=rz, rx=rx)
    if blur is not None: d['blur'] = blur
    if wipe is not None: d['wipe'] = wipe
    return d
def popin(t, t0, dur=0.5, dy=60.0, s0=0.86):
    k = spr(t, t0, dur); a = fade(t, t0, 0.16)
    return k, a, dy * (1 - k), mix(s0, 1.0, k)


KIN = json.load(open('kin.json'))
def kline(lid, cx, cy, z, times, style, t_exit, tout):
    m = KIN[lid]; n = len(m['chars'])
    for i, c in enumerate(m['chars']):
        ti = times[i]; x0, y0, h = cx + c['cx'], cy + c['cy'], c['h']
        def f(t, ti=ti, x0=x0, y0=y0, h=h, i=i, cxo=c['cx']):
            a = fade(t, ti, 0.1); bl = 12 * (1 - fade(t, ti, 0.22))
            if style == 'cascade':
                k = spr(t, ti, 0.5); x, y, zz, s, rx = x0, y0 + 0.5 * h * (1 - k), z + 220 * (1 - k), 1.0, 80 * (1 - k)
            elif style == 'track':
                k = spr(t, ti, 0.6, 0.75); x, y, zz, s, rx = x0 + cxo * 0.9 * (1 - k), y0, z, 1.0, 0.0
            elif style == 'slam':      # from just in front of the lens down onto its mark
                k = crit(t, ti, 0.34); x, y, zz, s, rx = x0, y0 + 60 * (1 - k), z - 1100 * (1 - k), 1.0, -20 * (1 - k)
                bl = 22 * (1 - fade(t, ti, 0.2))
            elif style == 'fly':       # out of the deep: streaks in from far behind the plane
                k = ez(t, ti, 0.26, 'out'); x, y, zz, s, rx = x0, y0, z + 3200 * (1 - k), 1.0, 0.0
                bl = 0.0; a = fade(t, ti, 0.05)
            if t_exit is not None:
                e = ez(t, t_exit + 0.014 * i, 0.3, 'in')
                y -= 300 * e; rx -= 70 * e; a *= 1 - e; bl += 16 * e
            return P(x, y, zz, s, a, rx=rx, blur=bl)
        L(f'{lid}_{i}', 'kin:' + c['f'], f, ti - 0.02, tout, fx={'blur': 1})

# ════════ A. lock screen (plane ZA) ════════
def wall(t):
    o = 1.0
    return P(540, 960, ZA + 120, 1.22, o)
L('wallpaper', 'wallpaper', wall, 0, 3.1, mb=False)
for i, (bx, by, bs, bz) in enumerate([(180, 420, 1.1, -500), (900, 300, 0.7, 300), (820, 1500, 1.4, -700), (260, 1650, 0.8, 200), (640, 700, 0.5, 600)]):
    def bok(t, bx=bx, by=by, bs=bs, bz=bz, i=i):
        return P(bx + 30 * math.sin(t * 0.4 + i), by - 18 * t, ZA + bz, bs, (0.35 + 0.15 * math.sin(t * 1.3 + i)) * (1 - fade(t, 2.6, 0.25)))
    L(f'bokehA{i}', 'bokeh', bok, 0, 3.0, mb=False, blend='ADD')
def clock(t):
    dim = fade(t, 1.0, 0.3)
    up = ez(t, 2.5, 0.35, 'in')
    return P(540, 400 - 260 * up, ZA, 1 - 0.04 * dim, (1 - 0.45 * dim) * (1 - up), blur=10 * dim)
L('clock', 'clock', clock, 0, 3.0, fx={'blur': 1})
NOTE = [('n_rent', 0), ('n_bank', 1), ('n_bill', 2)]
def slot_y(k): return 1255 + k * 228
for nid, i in NOTE:
    def note(t, i=i):
        t0 = T['n'][i]
        k, a, dy, s = popin(t, t0, 0.5, 170, 0.9)
        # each newer notification pushes this one down a slot
        sl = 0.0
        for j in range(i + 1, 3): sl += spr(t, T['n'][j], 0.45)
        y = slot_y(sl) + dy
        dim = fade(t, 1.0, 0.3)
        fl = ez(t, T['clear'] + 0.05 * (2 - i), 0.32, 'in')       # swipe-to-clear: flung up, last-in first-out
        return P(540, y - 1900 * fl, ZA, s * (1 - 0.03 * dim), a * (1 - 0.35 * dim))
    L(nid, nid, note, T['n'][i] - 0.02, 3.0)
def homeA(t): return P(540, 1890, ZA, 1, 0.9 * (1 - fade(t, 2.55, 0.2)))
L('homebarA', 'homebar_w', homeA, 0, 2.9, mb=False)
# kinetic type: "Rent is due / Friday." per letter
kline('k_rent1', 540, 745, ZA - 60, [WORDS[w] - 0.03 + 0.028 * j for w, n in (('Rent', 4), ('is', 2), ('due', 3)) for j in range(n)], 'cascade', T['clear'] - 0.12, 2.95)
kline('k_friday', 540, 935, ZA - 60, [WORDS['Friday.'] - 0.02 + 0.016 * j for j in range(7)], 'slam', T['clear'] - 0.04, 2.95)
# ════════ B. Photos (plane ZB) ════════
def plateB(t): return P(540, 960, ZB + 700, 1.3 * 4800 / 1500, 1.0)
L('plateB', None, plateB, 2.55, 5.0, sc=100, mb=False, solid=([0.985, 0.985, 0.99], 'White'))
kline('k_mean', 540, 885, ZB, [2.86 + 0.022 * j for j in range(10)], 'track', 3.6, 4.0)
kline('k_drawer', 540, 1005, ZB, [3.02 + 0.03 * j + (0.16 if j >= 9 else 0) + 0.06 * (j - 9) * (j >= 9) for j in range(12)], 'cascade', 3.66, 4.0)
GT = 3.66
def album(t):
    k, a, dy, s = popin(t, GT, 0.5, 40, 0.97)
    return P(44 + 500, 255 + dy, ZB, s, a * (1 - fade(t, 4.42, 0.2)))
L('album', 'album', album, GT - 0.02, 4.8)
TILE = 358.0; PICS = ['p1', 'p2', 'p3', 'p5', 'p8', 'p4', 'p6', 'p9', 'p7']
for i, pid in enumerate(PICS):
    c, r = i % 3, i // 3
    tx, ty = 179 + c * 361, 380 + 179 + r * 361
    hero = pid == 'p8'
    def tile(t, tx=tx, ty=ty, c=c, r=r, hero=hero):
        t0 = GT + 0.05 + (r + c) * 0.04
        k, a, dy, s = popin(t, t0, 0.5, 50, 0.9)
        base = TILE / 520
        if not hero:
            return P(tx, ty + dy, ZB, s * base * (1 - 0.04 * fade(t, 4.42, 0.25)), a * (1 - fade(t, 4.42, 0.22)))
        press = math.sin(math.pi * fade(t, T['tap'], 0.14)) * 0.05
        ex = spr(t, 4.40, 0.55)                                # shared element: tile -> full-screen viewer
        flip = ez(t, T['flip'], 0.27, 'in')
        return P(mix(tx, 540, ex), mix(ty, 960, ex), ZB - 4, (s - press) * mix(base, 1080 / 520, ex), a, ry=90 * flip)
    L(f'tile_{pid}', 'src:' + pid + '.jpg', tile, GT, 5.3 if hero else 4.75, sc=100)
def touch(t):
    a = fade(t, T['tap'] - 0.04, 0.06) * (1 - fade(t, T['tap'] + 0.12, 0.2))
    return P(540, 921, ZB - 8, mix(0.7, 1.0, ez(t, T['tap'] - 0.04, 0.2, 'out')), a * 0.9)
L('touch', 'touch', touch, 4.2, 4.6, mb=False)
def black(t): return P(540, 960, ZB + 600, 1.3 * 2160 / 1500, ez(t, 4.42, 0.4, 'io'))
L('viewerbg', None, black, 4.4, 9.6, sc=100, mb=False, solid=([0.02, 0.02, 0.025], 'Black'))
for i, (bx, by, bs, bz) in enumerate([(160, 520, 1.3, -500), (930, 1450, 1.0, 400), (760, 380, 0.6, 250), (300, 1500, 0.9, -300)]):
    def bokC(t, bx=bx, by=by, bs=bs, bz=bz, i=i):
        return P(bx + 40 * math.sin(t * 0.5 + i), by - 20 * (t - 5), ZB + bz, bs, 0.16 * fade(t, 5.2, 0.6) * (1 - fade(t, 9.3, 0.2)))
    L(f'bokehC{i}', 'bokeh', bokC, 5.1, 9.5, mb=False, blend='ADD')

# ════════ C. the spoon: flip, push in, Live Text ════════
SIMG = Image.open('src/sterling_hi.jpg').size                       # 1162 x 338
SC0 = 1080 / SIMG[0]; ZOOM = 2.25
OFF = (717 - SIMG[0] / 2, 155 - SIMG[1] / 2)                        # STERLING relative to the image centre
def spoon(t):
    fl = ez(t, T['flip'] + 0.27, 0.42, 'out')
    k = ez(t, T['zoom'], 0.85, 'io') + 0.06 * ez(t, 6.4, 2.6, 'lin')
    s = SC0 * mix(1, ZOOM, k)
    kk = clamp(k); x = 540 - OFF[0] * s * kk; y = 960 - OFF[1] * s * kk
    sp = ez(t, T['spot'], 0.35, 'io'); hold = ez(t, T['wait'], 0.4, 'io')
    return P(x, y, ZB - 4, s, 1 - 0.55 * sp, ry=-90 * (1 - fl), blur=26 * sp)
L('spoon', 'src:sterling_hi.jpg', spoon, T['flip'] + 0.25, 9.5, sc=100, fx={'blur': 1})
def brackets(t):
    k = spr(t, T['live'], 0.45); a = fade(t, T['live'], 0.1)
    sp = ez(t, T['spot'], 0.35, 'io')
    return P(540, 960, ZB - 10, mix(0.95, 0.62, k), a * (1 - sp))
L('brackets', 'brackets', brackets, T['live'] - 0.02, 7.6)
def ltbtn(t):
    k, a, dy, s = popin(t, T['live'] + 0.08, 0.45, 0, 0.5)
    sp = ez(t, T['spot'], 0.3, 'io')
    return P(975, 1720, ZB - 10, s, a * (1 - sp))
L('ltbtn', 'ltbtn', ltbtn, T['live'], 7.5)

# ════════ D. Spotlight + Dictionary, "Hold on." ════════
def spotY(t): return mix(-120, 300, spr(t, T['spot'], 0.5))
def back(t): return ez(t, T['wait'], 0.45, 'io')                   # cards step back for "Hold on."
def spotph(t):
    return P(540, spotY(t), ZB - 20, 1 - 0.06 * back(t), fade(t, T['spot'], 0.12) * (1 - fade(t, T['type'], 0.05)) * (1 - 0.5 * back(t)))
L('spotph', 'spotph', spotph, T['spot'] - 0.02, 7.6)
TXT = 'sterling silver'; TYPED = 0.62
def spotTxt(t):
    n = int(clamp((t - T['type']) / TYPED) * len(TXT) + (1 if t >= T['type'] else 0)); n = min(n, len(TXT))
    reveal = (118 + 330 * n / len(TXT)) / 993 if n < len(TXT) else 1.0     # wipe: per keystroke, like a real keyboard
    b = back(t); out = fade(t, 9.25, 0.15)
    return P(540, spotY(t), ZB - 21, 1 - 0.06 * b, fade(t, T['type'], 0.02) * (1 - 0.5 * b) * (1 - out), wipe=100 * (1 - reveal))
L('spot', 'spot', spotTxt, T['type'] - 0.01, 9.45, fx={'wipe': 1})
def dict_(t):
    k, a, dy, s = popin(t, T['res'], 0.55, 160, 0.92)
    b = back(t); out = fade(t, 9.25, 0.15)
    return P(540, 620 + dy - 30 * b, ZB - 20, s * (1 - 0.06 * b), a * (1 - 0.5 * b) * (1 - out), blur=8 * b)
L('dict', 'dict', dict_, T['res'] - 0.02, 9.45, fx={'blur': 1})
kline('k_hold', 540, 1250, ZB - 40, [T['wait'] - 0.03, 9.15], 'fly', None, 9.7)

# ════════ E. the two pieces (plane ZE) ════════
def plateE(t): return P(540, 960, ZE + 800, 1.3 * 5000 / 1500, 1.0)
L('plateE', None, plateE, 9.2, 11.3, sc=100, mb=False, solid=([0.05, 0.10, 0.17], 'Navy'))
def glow(t):
    d = _glow(t); d['o'] *= 1 - fade(t, 10.99, 0.12); return d
def _glow(t):
    p = t - T['snap']
    if p < 0: return P(540, 960, ZE + 700, 1.0, 0.18 * fade(t, 9.6, 0.6))
    return P(540, 960, ZE + 700, 1.0 + 1.6 * crit(t, T['snap'], 0.35), 0.18 + 0.82 * math.exp(-p * 6) + 0.12 * (1 - math.exp(-p * 6)))
L('glow', 'glow', glow, 9.3, 11.3, mb=False, blend='ADD')
PS = 0.84; REST_R, REST_S = 540 - 490 * PS + 315 * PS - 0, 540 + 245 * PS          # snapped: knob seated in the notch, the pair centred
def approach(t, side):
    a = crit(t, T['gather'], 0.9)                                  # fly in from depth, slow down into a hover
    gap = mix(40, 18, ez(t, 10.3, 0.4, 'io'))                       # the held breath: they drift closer in silence
    p = t - T['snap']
    if p >= 0: gap = 18 * (1 - ez(t, T['snap'] - 0.0, 0.05, 'in')) - 6 * math.exp(-p * 18) * math.sin(p * 40) * (p > 0.05)
    x0 = -500 if side < 0 else 1580
    rest = (REST_R if side < 0 else REST_S) + side * gap
    x = mix(x0, rest, a); z = ZE + mix(900, 0, a)
    ry = mix(-55 * side, -8 * side, a) * (1 - ez(t, T['snap'], 0.12, 'out'))
    float_y = 10 * math.sin((t - 9.55) * 2.2 + (0 if side < 0 else 1.2)) * (1 - ez(t, T['snap'], 0.1, 'out'))
    pulse = 1 + 0.035 * math.exp(-max(p, 0) * 9) * (p >= 0)
    return P(x, 960 + float_y, z, pulse * PS, fade(t, T['gather'], 0.2) * (1 - fade(t, 10.99, 0.1)), ry=ry)
L('piece_rent', 'piece_rent', lambda t: approach(t, -1), 9.5, 11.3)
L('piece_spoon', 'piece_spoon', lambda t: approach(t, 1), 9.5, 11.3)
def flash(t): return P(540, 960, ZE - 20, 1.3, 0.22 * math.exp(-max(0, t - T['snap']) * 14) * (t >= T['snap']))
L('flash', None, flash, T['snap'], 11.1, sc=100, mb=False, solid=([1, 0.96, 0.85], 'Flash'), blend='ADD')

# ════════ F. Messages (plane ZF) ════════
def plateF(t): return P(540, 960, ZF + 600, 1.3 * 4300 / 1500, 1.0)
L('plateF', None, plateF, 10.9, LEN, sc=100, mb=False, solid=([1, 1, 1], 'WhiteF'))
def endbg(t): return P(540, 960, ZF + 500, 1.3 * 2060 / 1500, ez(t, T['logo'], 0.5, 'io'))
L('endbg', None, endbg, T['logo'], LEN, sc=100, mb=False, solid=([0.957, 0.961, 0.973], 'EndBG'))
def fout(t): return 1 - ez(t, T['logo'], 0.35, 'io')
def headin(t, d=0.0): return popin(t, T['thread'] + 0.2 + d, 0.5, -40, 0.94)
AV0 = (540, 250); AVS0 = 138 / 360
def avatar(t):
    k, a, dy, s = headin(t)
    m = spr(t, T['logo'], 0.65)
    return P(mix(AV0[0], 540, m), mix(AV0[1] + dy, 760, m), ZF - 2, s * mix(AVS0, 300 / 360, m), a)
L('avatar', 'avatar', avatar, T['thread'], LEN)
def namepill(t):
    k, a, dy, s = headin(t, 0.05)
    return P(540, 250 + 69 + 16 + 35 + dy, ZF, s, a * fout(t))
L('namepill', 'namepill', namepill, T['thread'], 16.2)
INY = 1770
def input2(t):
    k, a, dy, s = popin(t, T['thread'] + 0.25, 0.5, 120, 0.97)
    return P(540, INY + dy, ZF, s, a * fout(t))
L('input2', 'input2', input2, T['thread'], 16.2)
def placeholder(t):
    k, a, dy, s = popin(t, T['thread'] + 0.25, 0.5, 120, 0.97)
    return P(540, INY + dy, ZF - 0.5, s, a * (1 - fade(t, T['typeMsg'], 0.03)))
L('input_ph', 'input', placeholder, T['thread'], T['typeMsg'] + 0.1)
MSG = 'wait… is grandma’s silver worth something??'; SPAN = T['send'] - 0.12 - T['typeMsg']
TXS = 0.86; TXW = 913 * TXS
def itext(t):
    n = min(len(MSG), int(clamp((t - T['typeMsg']) / SPAN) * len(MSG)) + 1)
    rv = n / len(MSG)
    return P(207 + TXW / 2, INY, ZF - 1, TXS, 1 - fade(t, T['send'], 0.04), wipe=100 * (1 - rv))
L('input_text', 'input_text', itext, T['typeMsg'], T['send'] + 0.1, fx={'wipe': 1})
def sendbtn(t):
    k, a, dy, s = popin(t, T['typeMsg'] + 0.03, 0.4, 0, 0.4)
    press = math.sin(math.pi * fade(t, T['send'] - 0.1, 0.14)) * 0.12
    return P(540 + 496 - 18 - 40 - 10, INY, ZF - 1, s - press, a * fout(t))
L('sendbtn', 'sendbtn', sendbtn, T['typeMsg'], 16.2)
SENT = (1036 - 308, 1240)
def bsent(t):
    k = spr(t, T['send'], 0.5); a = fade(t, T['send'], 0.06)
    x = mix(207 + TXW / 2, SENT[0], k); y = mix(INY, SENT[1], k)
    return P(x, y, ZF - 1, mix(0.8, 1, k), a * fout(t))
L('b_sent', 'b_sent', bsent, T['send'] - 0.01, 16.2)
def delivered(t):
    return P(1036 - 68, 1240 + 82 + 26, ZF, 1, fade(t, T['send'] + 0.3, 0.15) * fout(t))
L('delivered', 'delivered', delivered, T['send'] + 0.25, 16.2, mb=False)
def stamp(t): return P(540, 1060, ZF, 1, fade(t, T['send'] + 0.1, 0.25) * fout(t))
L('stamp', 'stamp', stamp, T['send'], 16.2, mb=False)
RX = 1430
def typing(t):
    k, a, dy, s = popin(t, T['dots'], 0.4, 0, 0.5)
    return P(44 + 97, RX, ZF - 1, s * (1 + 0.03 * math.sin((t - T['dots']) * 14)), a * (1 - fade(t, T['m2'], 0.06)))
L('b_typing', 'b_typing', typing, T['dots'] - 0.01, T['m2'] + 0.1)
def recv1(t):
    k, a, dy, s = popin(t, T['m2'], 0.45, 0, 0.6)
    return P(44 + 181 + (1 - s) * -100, RX, ZF - 1, s, a * fout(t))
L('b_recv1', 'b_recv1', recv1, T['m2'] - 0.01, 16.2)
def recv2(t):
    k, a, dy, s = popin(t, T['m3'], 0.45, 0, 0.6)
    return P(44 + 330 + (1 - s) * -180, RX + 52 + 10 + 82, ZF - 1, s, a * fout(t))
L('b_recv2', 'b_recv2', recv2, T['m3'] - 0.01, 16.2)
def homeF(t): return P(540, 1890, ZF, 1, 0.85 * fout(t) * fade(t, T['thread'], 0.3))
L('homebarF', 'homebar', homeF, T['thread'], 16.2, mb=False)

# ════════ G. end card: the name builds letter by letter on the voice ════════
kline('k_brand', 540, 1050, ZF - 2, [15.88, 15.93] + [16.15 + 0.032 * j for j in range(8)], 'cascade', None, LEN)
kline('k_tag', 540, 1205, ZF - 2, [17.08, 17.55, 17.75], 'cascade', None, LEN)
kline('k_url', 540, 1322, ZF - 2, [17.95 + 0.012 * j for j in range(14)], 'track', None, LEN)

# ════════ emit JSX ════════
def r(v, n=2): return round(v, n)
out = []
w = out.append
w('var comp = app.project.items.addComp("Good Eye", 1080, 1920, 1, %s, 60);' % LEN)
w('comp.motionBlur = true; comp.shutterAngle = 180; comp.shutterPhase = -90; comp.motionBlurSamplesPerFrame = %d;' % (6 if FAST else 16))
w('function imp(p){ return app.project.importFile(new ImportOptions(new File(p))); }')
w('function TG(l){ return l.property("ADBE Transform Group"); }')
w('var bg = comp.layers.addSolid([0.02,0.03,0.05], "Base", 1080, 1920, 1);')
cache = {}
# emit bottom-most first: AE stacks newest on top, so emit in reverse paint order = list order reversed? we add in list order and move each to bottom
for li, d in enumerate(layers):
    src = d['src']
    if d['solid']:
        col, nm = d['solid']; w('var l = comp.layers.addSolid(%s, "%s", 1080, 1920, 1);' % (json.dumps(col), nm))
    else:
        path = 'src/' + src[4:] if src.startswith('src:') else 'assets/' + src[4:] if src.startswith('kin:') else 'assets/%s.png' % src
        if path not in cache:
            cache[path] = 'it%d' % len(cache); w('var %s = imp("%s");' % (cache[path], path))
        w('var l = comp.layers.add(%s);' % cache[path])
    w('l.name = "%s"; l.threeDLayer = true; l.motionBlur = %s;' % (d['id'], 'true' if d['mb'] else 'false'))
    if d['blend'] == 'ADD': w('l.blendingMode = BlendingMode.ADD;')
    if d['fx'].get('blur'): w('var fb = l.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");')
    if d['fx'].get('wipe'):
        w('var fw = l.property("ADBE Effect Parade").addProperty("ADBE Linear Wipe"); fw.property("Wipe Angle").setValue(270);')
    # sample
    t0 = max(0.0, d['tin']); t1 = min(LEN, d['tout'])
    # a layer the camera has flown past is cut the frame it goes behind the lens
    for k in range(int(t0 * FPS), int(t1 * FPS) + 1):
        tk = k / FPS
        if camz(tk)[0] > d['f'](tk)['z'] - 40: t1 = tk; break
    fr = range(int(math.floor(t0 * FPS)), int(math.ceil(t1 * FPS)) + 1)
    ts = [k / FPS for k in fr]
    vals = [d['f'](t) for t in ts]
    def keys(name, get, tol):
        seq = [get(v) for v in vals]
        keep = [0]
        for k in range(1, len(seq) - 1):
            a, b, c = seq[keep[-1]], seq[k], seq[k + 1]
            # drop a key if it sits on the straight line between its neighbours
            if isinstance(b, list):
                lin = all(abs((bb - aa) - (cc - bb)) < tol and abs(bb - aa) < tol * 50 for aa, bb, cc in zip(seq[k - 1], b, c))
                same = all(abs(bb - aa) < tol for aa, bb in zip(a, b)) and all(abs(cc - bb) < tol for bb, cc in zip(b, c))
            else:
                same = abs(b - a) < tol and abs(c - b) < tol
            if not same: keep.append(k)
        keep.append(len(seq) - 1)
        keep = sorted(set(keep))
        if all((seq[k] == seq[0]) if not isinstance(seq[0], list) else all(abs(x - y) < tol for x, y in zip(seq[k], seq[0])) for k in keep):
            return 'set', seq[0]
        return 'keys', ([r(ts[k], 4) for k in keep], [[r(x) for x in seq[k]] if isinstance(seq[k], list) else r(seq[k], 3) for k in keep])
    def emit(target, name, get, tol):
        kind, v = keys(name, get, tol)
        if kind == 'set': w('%s.setValue(%s);' % (target, json.dumps([r(x) for x in v] if isinstance(v, list) else r(v, 3))))
        else: w('%s.setValuesAtTimes(%s,%s);' % (target, json.dumps(v[0]), json.dumps(v[1])))
    sc = d['sc']
    emit('TG(l).property("ADBE Position")', 'pos', lambda v: [v['x'], v['y'], v['z']], 0.01)
    emit('TG(l).property("ADBE Scale")', 'scale', lambda v: [v['s'] * sc] * 3, 0.001)
    emit('TG(l).property("ADBE Opacity")', 'op', lambda v: 100 * clamp(v['o']), 0.01)
    if any(v['rx'] for v in vals): emit('TG(l).property("ADBE Rotate X")', 'rx', lambda v: v['rx'], 0.001)
    if any(v['ry'] for v in vals): emit('TG(l).property("ADBE Rotate Y")', 'ry', lambda v: v['ry'], 0.001)
    if d['fx'].get('blur'): emit('fb.property("Blurriness")', 'blur', lambda v: v.get('blur', 0), 0.01)
    if d['fx'].get('wipe'): emit('fw.property("Transition Completion")', 'wipe', lambda v: v.get('wipe', 0), 0.001)
    w('l.inPoint = %s; l.outPoint = %s;' % (r(t0, 4), r(t1, 4)))
# camera
w('var cam = comp.layers.addCamera("Cam", [540, 960]);')
ts = [k / FPS for k in range(int(LEN * FPS) + 1)]
cp = [cam(t) for t in ts]
w('cam.transform.position.setValuesAtTimes(%s,%s);' % (json.dumps([r(t, 4) for t in ts]), json.dumps([[r(x) for x in c] for c in cp])))
w('cam.transform.pointOfInterest.setValuesAtTimes(%s,%s);' % (json.dumps([r(t, 4) for t in ts]), json.dumps([[540, 960, r(c[2] + CAMD)] for c in cp])))
w('cam.cameraOptions.zoom.setValue(%s);' % CAMD)
if not FAST:
    w('cam.cameraOptions.dof.setValue(1); cam.cameraOptions.aperture.setValue(60); cam.cameraOptions.blurLevel.setValue(100);')
    w('cam.cameraOptions.focusDistance.setValuesAtTimes(%s,%s);' % (json.dumps([r(t, 4) for t in ts[::6]]), json.dumps([r(camz(t)[1] - camz(t)[0]) for t in ts[::6]])))
w('app.project.save(new File("piece2.ecproj"));')
w('"layers " + comp.numLayers;')
open('piece2.jsx', 'w').write('\n'.join(out))
print(len(layers), 'layers;', sum(len(x) for x in out) // 1024, 'KB')
