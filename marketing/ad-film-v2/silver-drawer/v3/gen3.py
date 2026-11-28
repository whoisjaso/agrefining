# gen2.py : AG Refining "Silver drawer" (Style: Liquid Motion + Kinetic Captions, brand agrefining).
# Builds piece.jsx for EffectCraft (2160x3840, 60 fps, comp motion blur 180 deg) and events.json for the mix + cue sheet.
# Coordinates are authored on a 1080x1920 grid (U) and doubled at emit. Text presets are exact ports of
# video-editing-standard/presets/text-presets.js (wordsUp, blurSettle, stamp, pop) plus the Liquid hold drift and
# blurred staggered exits. Every unit onset sits on its spoken syllable (vo_words.json).
import json, math, sys
FPS = 60; LEN = 34.85; K = 2.0                     # U -> master px
FAST = '--fast' in sys.argv
MAN = json.load(open('manifest.json'))
VW = json.load(open('../v2/vo_words.json'))          # [t0, t1, word] (v2 timeline the scenes were authored on)
import numpy as _np
WARP = json.load(open('warp.json'))                 # {"old": [...], "new": [...], "len_new": s, "vo_words_new": [...], "vo_path": ...}
_O, _N = _np.array(WARP['old']), _np.array(WARP['new'])
def warp(t):      # old -> new, linear between word onsets, shift-extrapolated outside
    if t <= _O[0]: return t + (_N[0] - _O[0])
    if t >= _O[-1]: return t + (_N[-1] - _O[-1])
    return float(_np.interp(t, _O, _N))
def warp_inv(t):
    if t <= _N[0]: return t - (_N[0] - _O[0])
    if t >= _N[-1]: return t - (_N[-1] - _O[-1])
    return float(_np.interp(t, _N, _O))
LEN_NEW = WARP['len_new']; M = 0.5                  # 1080x1920 master (Oct 19 resolution rule): half the old 4K scale

def clamp(x, a=0.0, b=1.0): return a if x < a else b if x > b else x
def mix(a, b, k): return a + (b - a) * k
def fade(t, t0, d): return clamp((t - t0) / d)
def e_expo(p): return 1.0 if p >= 1 else 1 - 2 ** (-10 * p)
def e_back(p, s=1.7): return 1 + (s + 1) * (p - 1) ** 3 + s * (p - 1) ** 2
def e_quint(p): return 1 - (1 - p) ** 5
def e_incub(p): return p ** 3
def e_sine(p): return -(math.cos(math.pi * p) - 1) / 2
def ez(t, t0, d, f): return f(clamp((t - t0) / d))
def spr(t, t0, dur=0.5, zeta=0.6):
    p = t - t0
    if p <= 0: return 0.0
    w = 4.6 / (zeta * dur); wd = w * math.sqrt(1 - zeta * zeta)
    return 1 - math.exp(-zeta * w * p) * (math.cos(wd * p) + zeta * w / wd * math.sin(wd * p))

def W(word, after=0.0):
    """start time of the first VO word matching `word` at or after `after`"""
    for a, b, w in VW:
        if a >= after - 1e-6 and w.lower().strip('.,?!').startswith(word.lower()): return a
    raise KeyError(word)

layers, events = [], {'text': [], 'obj': []}
def L(id, src, f, tin, tout, sc=50.0, mb=True, blur=False, blend=None):
    layers.append(dict(id=id, src=src, f=f, tin=max(0, tin), tout=min(LEN, tout), sc=sc, mb=mb, blur=blur, blend=blend))
def P(x, y, s=1.0, o=1.0, rot=0.0, sx=1.0, sy=1.0, blur=0.0):
    return dict(x=x, y=y, s=s, o=o, rot=rot, sx=sx, sy=sy, blur=blur)

# ── the house presets (text-presets.js), per unit; returns (dy_em, scale, opacity, blur_px) ──
VPEAK = {'stamp': 0.05, 'wordsUp': 0.08, 'blurSettle': 0.15, 'pop': 0.08, 'cut': 0.0}
def preset(name, lt):
    if lt < 0: return 0, 1, 0, 0
    if name == 'wordsUp':
        p = clamp(lt / 0.20); e = e_expo(p); return 0.25 * (1 - e), 1, clamp(0.35 + p * 1.3), 6 * (1 - clamp(p * 1.4))
    if name == 'blurSettle':
        p = clamp(lt / 0.30); e = e_expo(p); return 0, 1.10 + (1 - 1.10) * e, clamp(0.3 + 0.7 * e), 26 * (1 - e)
    if name == 'stamp':
        return 0, 1 + 0.15 * (1 - clamp(lt / 0.08)), 1, 0
    if name == 'pop':
        p = clamp(lt / 0.28); return 0, 0.6 + 0.4 * e_back(p), clamp(p * 3), 0
    return 0, 1, 1, 0

SYNC = json.load(open('../v3/wb_sync.json')); SFR = [r['s_frame'] for r in SYNC]
def snap_words(onsets):
    """snap each unit onset to the spoken word it names (nearest v2 onset within 120 ms) and return the refined word index"""
    out, idx = [], []
    for t in onsets:
        a = min(VW, key=lambda w: abs(w[0] - t))
        if abs(a[0] - t) <= 0.12:
            fr = int(round(warp(a[0]) * FPS)); j = min(range(len(SFR)), key=lambda k: abs(SFR[k] - fr))
            out.append(a[0]); idx.append(j if abs(SFR[j] - fr) <= 1 else None)
        else: out.append(t); idx.append(None)
    return out, idx

def text(lid, role, cx, cy, onsets, pre, t_out, size_scale=1.0, glow=0.0, off=None, replace=False, exit_mode='blur',
         karaoke=None, silent=False, silent_reason='', extra=None):
    """Place one manifest line. onsets: one time per unit (word) or one for a line. off(t) -> (dx, dy) scene offset."""
    m = MAN[lid]; us = m['units']; n = len(us)
    if len(onsets) == 1 and n > 1: onsets = onsets * n
    onsets, widx = snap_words(onsets) if (n > 1 or len(onsets) == 1) else (onsets, [None] * len(onsets))
    t_in = onsets[0]
    for i, u in enumerate(us):
        ti = onsets[i]; nxt = onsets[i + 1] if i + 1 < n else None
        hpx = u['h']
        def f(t, i=i, u=u, ti=ti, nxt=nxt, hpx=hpx):
            dy, s, o, b = preset(pre, t - ti)
            if replace and nxt is not None and t >= nxt: o = 0          # stamp: each word replaces the last
            if karaoke is not None: o = (0.55 if t < karaoke[i] else 1.0) if t >= ti else 0
            if t < ti - 1e-6: o = 0                                         # never visible before its spoken word (word-sync rule)
            settle = ti + {'stamp': 0.08, 'wordsUp': 0.2, 'blurSettle': 0.3, 'pop': 0.28}.get(pre, 0)
            hold = e_sine(clamp((t - settle) / max(0.3, t_out - settle)))
            s *= 1 + 0.035 * hold * size_scale ** 0                       # Liquid hold drift 1.000 -> 1.035
            if exit_mode == 'blur':                                        # Liquid: staggered, blurred easeInCubic exit
                e = ez(t, t_out - 0.25 + 0.03 * i, 0.25, e_incub); o *= 1 - e; b += 12 * e; dy -= 0.12 * e
            dx0, dy0 = off(t) if off else (0, 0)
            x = cx + (0 if replace else u['cx']) * size_scale * (1 + 0.035 * hold) + dx0
            y = cy + (u['cy'] + dy * hpx / 1.43) * size_scale + dy0
            return P(x, y, s * size_scale, o, blur=b)
        if glow > 0:
            def g(t, f=f):
                d = dict(f(t)); d['o'] *= glow; d['blur'] = d['blur'] + 26; return d
            L(f'{lid}_g{i}', u['f'], g, ti - 0.02, t_out + 0.1, blur=True, blend='ADD', mb=False)
        L(f'{lid}_{i}', u['f'], f, ti - 0.02, t_out + (0.1 if exit_mode == 'blur' else 0), blur=True)
    events['text'].append(dict(id=lid, role=role, text=' '.join(u['t'] for u in us), preset=pre, t_in=round(t_in, 3),
                               t_out=round(t_out, 3), units=[round(x, 3) for x in onsets],
                               peaks=[round(x + VPEAK.get(pre, 0), 3) for x in onsets], silent=silent,
                               silent_reason=silent_reason, word_idx=widx, **(extra or {})))

def obj(kind, t, **kw): events['obj'].append(dict(kind=kind, t=round(t, 3), **kw))

# ═══════════ scene offsets (blur whips between scenes: every design change rides a smear) ═══════════
def whip_out(t, t0, d=0.18, dist=-1100): return dist * ez(t, t0, d, e_incub)
def whip_in(t, t0, d=0.26, dist=1100): return dist * (1 - ez(t, t0, d, e_quint))
T1 = 5.9; T2 = 9.2; T3 = 11.55; T7 = 19.62; T8 = 22.6; T10 = 30.0

# ═══════════ background (always) ═══════════
L('bg', 'png/bg.png', lambda t: P(540, 960, 1.0 + 0.02 * t / LEN), 0, LEN, sc=100, mb=False)
def glow_c(t):
    o = 0.22 + 0.06 * math.sin(t * 1.3)
    if 27.3 <= t < 28.34: o += 0.25 * e_sine(clamp((t - 27.3) / 1.0))        # breathing glow in the silence
    p = t - 28.34
    if p >= 0: o += 0.55 * math.exp(-p * 5)                                    # the snap
    if t >= T10: o = 0.30 + 0.05 * math.sin(t * 1.1)
    return P(540, 980, 1.6 + 0.1 * math.sin(t * 0.4), o)
L('glow', 'png/glow.png', glow_c, 0, LEN, mb=False, blend='ADD')

# ═══════════ S1  hook: "Quick question. You got a drawer full of old silverware nobody uses?" ═══════════
def off1(t): return (0, whip_out(t, T1))
L('box_blur', 'png/plate_box_blur.jpg', lambda t: P(540, 990 + off1(t)[1], 0.98 + 0.03 * t / T1, 0.5 * (1 - fade(t, T1, 0.18))), 0, T1 + 0.2, sc=100)
text('hook_q', 'hook', 540, 430, [0.0, W('real'), W('quick'), W('question')], 'stamp', W('you') - 0.05, replace=True, glow=0.32, off=off1)
text('l1_lead', 'leadin', 540, 640, [W('you'), W('got'), W('a', 2.1), W('drawer'), W('full'), W('of'), W('old')], 'wordsUp', T1,
     off=off1, silent=True, silent_reason='long lead-in (7 words): silence allowed for leadin; hero carries the signature')
text('l1_hero', 'hero', 540, 1000, [W('silverware')], 'blurSettle', T1, glow=0.2, off=off1)
# the spoon crosses in front of the hero word (text behind the object)
def spoon1(t):
    k = e_quint(clamp(t / 1.2))
    return P(mix(640, 560, k) + 30 * math.sin(t * 0.8), 1020 + mix(160, 0, k) + off1(t)[1], 0.84 * 2160 / 3089 / 2, 1.0,
             rot=mix(-64, -58, t / T1))
L('spoon1', 'png/spoon_front.png', spoon1, 0, T1 + 0.2, sc=200)
text('l1_lead2', 'leadin', 540, 1490, [W('that', 3.9), W('nobody'), W('even'), W('uses')], 'wordsUp', T1, off=off1)
obj('whip', T1 + 0.09, note='S1 -> S2')

# ═══════════ S2  pain: "'cause rent is due Friday... the light bill is due..." ═══════════
def off2(t): return (0, whip_in(t, T1) + 0) if t < T2 else (0, 0)
def zoom2(t): return ez(t, T2, 0.2, e_incub)           # S2 exits on a zoom blur
def card(t):
    tc = T1 + 0.08; dy, s, o, b = preset('pop', t - tc); z = zoom2(t)
    return P(540, 1150 + off2(t)[1], s * (1 + 0.035 * e_sine(clamp((t - tc) / 3))) * (1 + 0.6 * z), o * (1 - z), rot=-6, blur=30 * z)
L('cal', 'png/cal.png', card, T1 + 0.06, T2 + 0.25, blur=True)
obj('pop', T1 + 0.08 + 0.08, note='calendar card')
def l2off(t): z = zoom2(t); return (0, off2(t)[1] - 200 * z)
text('l2_lead', 'leadin', 540, 450, [6.36, 6.48, 7.12, 7.18], 'wordsUp', T2, off=l2off)
text('l2_hero', 'hero', 540, 760, [W('friday')], 'blurSettle', T2, glow=0.25, off=l2off)
def bill(t):
    tb = W('light') - 0.12; k = spr(t, tb, 0.55); z = zoom2(t)
    return P(mix(1300, 690, k), mix(1420, 1270, k) + off2(t)[1], 0.92 * (1 + 0.6 * z), fade(t, tb, 0.08) * (1 - z), rot=mix(30, 9, k), blur=30 * z)
L('bill', 'png/bill.png', bill, W('light') - 0.14, T2 + 0.25, blur=True)
obj('slide', W('light') - 0.12 + 0.2, note='bill card')
text('l2_lead2', 'leadin', 467, 1640, [W('light'), W('bills')], 'wordsUp', T2, off=l2off,
     silent=True, silent_reason='second lead-in of the line; the emphasis swap carries it')
text('l2_emph', 'emphasis', 665, 1640, [8.78], 'cut', T2, off=l2off,
     silent=True, silent_reason='emphasis under VO: silence (role default)')

# ═══════════ S3  "and that drawer's just sitting there." ═══════════
def plate3(t):
    a = fade(t, T2, 0.22); z = ez(t, T3, 0.18, e_incub)
    return P(540, 1010 + 900 * z, 0.98 - 0.02 * e_sine(clamp((t - T2) / 2.2)) + 0.25 * (1 - a), a * (1 - z), rot=0.6 * (t - T2), blur=24 * (1 - a) + 10 * z)
L('box', 'png/plate_box.png', plate3, T2, T3 + 0.2, sc=100, blur=True)
def off3(t): return (0, 900 * ez(t, T3, 0.18, e_incub))
text('l3_lead', 'leadin', 540, 300, [9.3, 9.46, 9.64, 9.96, 10.54], 'wordsUp', T3, off=off3)
text('l3_hero', 'hero', 540, 1560, [10.66], 'blurSettle', T3, glow=0.2, off=off3)
for i, (bx, by, bs) in enumerate([(220, 700, 0.35), (860, 1200, 0.5), (420, 1500, 0.28), (760, 520, 0.22)]):
    L(f'mote{i}', 'png/bokeh.png', lambda t, bx=bx, by=by, bs=bs, i=i: P(bx + 20 * math.sin(t * 0.5 + i), by - 25 * (t - T2), bs,
      0.45 * fade(t, T2 + 0.2, 0.5) * (1 - fade(t, T3, 0.15))), T2, T3 + 0.2, mb=False, blend='ADD')
obj('whip', T3 + 0.09, note='S3 -> S4')

# ═══════════ S4-S6  the spoon: flip, push to the stamp, 925 / sterling ═══════════
SPW = 3089.0                                    # cutout width (px)
STER = (1592 - 3083 / 2, 329 - 637 / 2)         # STERLING in the back cutout, relative to its centre (px)
T_FLIP = W('over') - 0.02; T_PUSH = 13.35; T_X = 14.4
def spoon_state(t):
    """(centre_x, centre_y, length_master_px, rot_deg) of the spoon group, plus the flip angle"""
    k_in = e_quint(clamp((t - (T3 + 0.02)) / 0.5))
    rot = mix(-80, -35, k_in) + 4 * math.sin((t - T3) * 0.9)
    length = mix(1500, 2150, k_in)
    cx, cy = 540, mix(2300, 1020, k_in)
    p = ez(t, T_PUSH, 1.05, e_sine)               # the push to the stamp
    if p > 0:
        L_end = 3.6 * SPW                           # handle grows until STERLING is ~300 px wide
        length = mix(length, L_end, p ** 1.6); rot = mix(rot, 0, p)
        sc = length / SPW
        th = math.radians(rot)
        wx = math.cos(th) * STER[0] * sc - math.sin(th) * STER[1] * sc
        wy = math.sin(th) * STER[0] * sc + math.cos(th) * STER[1] * sc
        cx = mix(cx, 540 - wx / K, p); cy = mix(cy, 1020 - wy / K, p)
    flip = ez(t, T_FLIP, 0.36, e_sine) * 180     # 0 = front, 180 = back (rotation about the long axis)
    return cx, cy, length, rot, flip
def spoon_face(face):
    def f(t):
        cx, cy, length, rot, flip = spoon_state(t)
        c = math.cos(math.radians(flip)); vis = (c > 0) if face == 'front' else (c <= 0)
        o = (1.0 if vis else 0.0) * fade(t, T3 + 0.02, 0.08) * (1 - fade(t, T_X, 0.3))
        return P(cx, cy, length / SPW / K, o, rot=rot, sy=max(0.02, abs(c)))
    return f
def off4(t): return (0, -700 * ez(t, T_PUSH - 0.1, 0.25, e_incub))
text('l4_hero', 'hero', 540, 880, [W('flip')], 'stamp', T_PUSH, glow=0.3, off=off4)
L('spoon_f', 'png/spoon_front.png', spoon_face('front'), T3, T_FLIP + 0.4, sc=200)
L('spoon_b', 'png/spoon_back.png', spoon_face('back'), T_FLIP + 0.1, T_X + 0.35, sc=200)
obj('flip', T_FLIP + 0.18, note='spoon flip')
obj('push', T_PUSH, end=T_X + 0.6, note='push to the stamp (riser end on 925)')
text('l4_lead', 'leadin', 540, 1380, [12.08, 12.34, 12.48, 12.68], 'wordsUp', T_PUSH, off=off4)
# macro plate: STERLING at plate (-51, +106) px from its centre; continues the push seamlessly
MAC = (999 - 1050, 1391 - 1284.5)
T_PE = T_PUSH + 1.05
def macro(t):
    if t < T_PE:
        cx, cy, length, rot, flip = spoon_state(t); s = length / SPW * 125 / 422
    else:
        rot = 0; s = mix(3.6 * 125 / 422, 1.12, ez(t, T_PE, 1.1, e_quint)) + 0.07 * e_sine(clamp((t - (T_PE + 1.1)) / 2.8))
    out = ez(t, T7, 0.22, e_incub); s *= 1 - 0.55 * out
    th = math.radians(rot); wx = (math.cos(th) * MAC[0] - math.sin(th) * MAC[1]) * s; wy = (math.sin(th) * MAC[0] + math.cos(th) * MAC[1]) * s
    return P(540 - wx / K, 1020 - wy / K, s, fade(t, T_X - 0.1, 0.25) * (1 - out), rot=rot, blur=18 * out)
L('macro', 'png/plate_macro.png', macro, T_X - 0.12, T7 + 0.25, sc=100, blur=True)
def off5(t): return (0, -600 * ez(t, W('925') - 0.25, 0.2, e_incub))
text('l5_lead', 'leadin', 540, 380, [13.56, 13.76, 14.1, 14.86, 15.06, 15.18, 15.5], 'wordsUp', W('925') - 0.05, off=off5,
     silent=True, silent_reason='5-word lead-in under VO; the hero carries the signature')
text('l5_hero', 'hero', 540, 1450, [W('stamp')], 'blurSettle', W('925') - 0.05, glow=0.2, off=lambda t: (0, 500 * ez(t, W('925') - 0.25, 0.2, e_incub)))
def loupe(t):
    tl = W('stamp') - 0.02; dy, s, o, b = preset('pop', t - tl)
    return P(540, 1020, s * (1 + 0.02 * math.sin((t - tl) * 3)), o * (1 - fade(t, W('sterling') - 0.12, 0.15)))
L('loupe', 'png/loupe.png', loupe, W('stamp') - 0.04, W('sterling') + 0.1)
obj('pop', W('stamp') - 0.02 + 0.08, note='loupe')
text('l6_num', 'number', 540, 560, [W('925')], 'stamp', T7, glow=0.35)
text('l6_lead', 'leadin', 540, 1300, [17.8, 17.84, 17.94, 18.22, 18.38], 'wordsUp', T7)
text('l6_hero', 'hero', 540, 1440, [W('sterling')], 'blurSettle', T7, glow=0.25)
def brackets(t):
    tb = W('sterling'); k = spr(t, tb - 0.02, 0.45)
    return P(540, 1022, mix(1.25, 0.84, k), fade(t, tb - 0.02, 0.1) * (1 - fade(t, T7, 0.15)))
L('brackets', 'png/brackets.png', brackets, W('sterling') - 0.04, T7 + 0.2)
def sweep6(t):
    p = clamp((t - (W('sterling') + 0.1)) / 0.55)
    return P(mix(250, 830, e_sine(p)), 1020, 0.35, 0.55 * math.sin(math.pi * p), rot=18)
L('sweep6', 'png/sweep.png', sweep6, W('sterling') + 0.08, W('sterling') + 0.7, blend='ADD', mb=False)
obj('glint', W('sterling') + 0.25, note='light sweep over the stamp')

# ═══════════ S7  "That's not plated. That's real silver." ═══════════
def spoon7(t):
    k = e_quint(clamp((t - T7) / 0.45)); out = ez(t, T8, 0.2, e_incub)
    return P(560 + 1300 * out, 1030, mix(3.2, 1.0, k) * 1900 / SPW / K, fade(t, T7, 0.1),
             rot=mix(-10, -30, k) + 3 * math.sin((t - T7) * 0.8), blur=26 * (1 - k))
text('l7_hero', 'hero', 540, 1000, [21.28], 'blurSettle', T8, glow=0.25)
L('spoon7', 'png/spoon_front.png', spoon7, T7, T8 + 0.25, sc=200, blur=True)
L('spoon7m', 'png/spoon_front.png', spoon7, 21.48 + 0.05, 21.48 + 0.8, sc=200)   # matte for the glint
def sweep7(t):
    p = clamp((t - (21.48 + 0.1)) / 0.6)
    return P(mix(-100, 1180, e_sine(p)), 1030, 0.9, 0.85, rot=22)
L('sweep7', 'png/sweep.png', sweep7, 21.48 + 0.08, 21.48 + 0.75, blend='ADD', mb=False)
layers[-1]['matte'] = 'spoon7m'
obj('glint', 21.48 + 0.38, note='light sweep over the spoon')
text('l7_lead', 'leadin', 540, 420, [19.76, 19.98, 20.32], 'wordsUp', T8 - 0.2)
def strike(t):
    p = ez(t, W('plated') + 0.3, 0.22, e_quint); u = MAN['l7_lead']['units'][2]
    return P(540 + u['cx'] - u['w'] / 2 * (1 - p) * 0 + (u['w'] / 2) * (p - 1), 425, 1.0, fade(t, W('plated') + 0.3, 0.03) * (1 - fade(t, T8 - 0.2 - 0.25 + 0.06, 0.2)),
             sx=max(0.01, p) * u['w'] / 300)
L('strike', 'png/strike.png', strike, W('plated') + 0.28, T8 + 0.1)
obj('strike', W('plated') + 0.3, note='strike-through')
text('l7_lead2', 'leadin', 540, 835, [20.96], 'wordsUp', T8 - 0.2)

# ═══════════ S8  the two pieces: "So... rent is due. And there's real silver in your drawer."  [silence]  "Yeah." ═══════════
T_SNAP = W('yeah')
def piece_card(t):
    tc = 22.85; k = spr(t, tc, 0.9)
    drift = 30 * e_sine(clamp((t - 27.3) / 1.04))                          # the held breath: they creep closer
    p = t - T_SNAP; snap = ez(t, T_SNAP - 0.07, 0.07, e_incub)
    x = mix(-400, 330, k) + drift + 70 * snap; out = ez(t, T10, 0.2, e_incub)
    sc = 0.86 * (1 + 0.04 * math.exp(-max(p, 0) * 10) * (p >= 0))
    return P(x, 1000 - 1000 * out, sc, fade(t, tc, 0.08), rot=mix(-20, -7, k) * (1 - 0.6 * snap), blur=20 * out)
L('cal2', 'png/cal.png', piece_card, 22.83, T10 + 0.25, blur=True)
obj('slide', 22.85 + 0.33, note='card in')
def piece_spoon(t):
    ts = 24.76 - 0.2; k = spr(t, ts, 0.6)
    drift = 30 * e_sine(clamp((t - 27.3) / 1.04)); snap = ez(t, T_SNAP - 0.07, 0.07, e_incub)
    x = mix(1500, 790, k) - drift - 70 * snap; out = ez(t, T10, 0.2, e_incub); p = t - T_SNAP
    sc = (1 + 0.04 * math.exp(-max(p, 0) * 10) * (p >= 0))
    return P(x, 1010 - 1000 * out, 1250 / SPW / K * sc, fade(t, ts, 0.08), rot=mix(-120, -96, k) + 2 * math.sin(t), blur=20 * out)
L('spoon8', 'png/spoon_front.png', piece_spoon, 24.76 - 0.22, T10 + 0.25, sc=200, blur=True)
obj('slide', 24.76 - 0.2 + 0.22, note='spoon in')
obj('snap', T_SNAP, note='the two pieces meet: the one big hit')
def seam(t):
    p = t - T_SNAP
    return P(565, 1000, 0.5 + 0.9 * (1 - math.exp(-p * 6)), 0.9 * math.exp(-max(p, 0) * 4) * (p >= 0))
L('seam', 'png/glow.png', seam, T_SNAP, T_SNAP + 1.0, blend='ADD', mb=False)
CAPY = 1540
def cap(lid, words_t, t_out):
    text(lid, 'caption', 540, CAPY, words_t, 'cut', t_out, exit_mode='cut',
         silent=True, silent_reason='caption riding the voice: silent')
cap('cap1', [22.76, 23.38, 23.54], 24.28)
cap('cap2', [24.3, 24.42, 24.54, 24.76, 25.08], 25.6)
cap('cap3', [25.62, 26.08, 26.58, 26.68, 26.82], 27.6)
cap('cap4', [28.34, 28.74, 28.92, 29.14, 29.38], T10 - 0.05)

# ═══════════ S10  end card: "A G Refining. Houston's silver buyer." ═══════════
def mark(t):
    tm = 30.14 - 0.03; dy, s, o, b = preset('pop', t - tm)
    return P(540, 690, s * 0.95 * (1 + 0.03 * e_sine(clamp((t - tm) / 4))), o)
L('mark', 'png/mark.png', mark, 30.14 - 0.05, LEN)
obj('pop', 30.14 - 0.03 + 0.08, note='logo tile')
def wordmark(t):
    tw = W('refining') - 0.02; dy, s, o, b = preset('blurSettle', t - tw)
    return P(540, 1010, s * 0.82 * (1 + 0.03 * e_sine(clamp((t - tw) / 4))), o, blur=b)
L('wordmark', 'png/wordmark.png', wordmark, W('refining') - 0.04, LEN, blur=True)
obj('logo', W('refining') - 0.02 + 0.15, note='wordmark settles (brand logo, not role text)')
text('end_lead', 'leadin', 540, 1150, [31.52, 32.08, 32.34], 'wordsUp', LEN + 1, exit_mode='none')
def cta(t):
    tc = 33.0; dy, s, o, b = preset('pop', t - tc)
    return P(540, 1330, s * (1 + 0.025 * e_sine(clamp((t - tc) / 1.7))), o)
L('cta', 'png/cta.png', cta, 32.98, LEN)
events['text'].append(dict(id='cta', role='cta', text='agrefining.com', preset='pop', t_in=33.0, t_out=LEN, units=[33.0], peaks=[33.08],
                           silent=False, silent_reason=''))

# ═══════════ emit ═══════════
def r(v, n=2): return round(v, n)
out = []; w = out.append
w('var comp = app.project.items.addComp("Silver Drawer", 1080, 1920, 1, %s, 60);' % LEN_NEW)
w('comp.motionBlur = true; comp.shutterAngle = 180; comp.shutterPhase = -90; comp.motionBlurSamplesPerFrame = %d;' % (4 if FAST else 8))
w('function imp(p){ return app.project.importFile(new ImportOptions(new File(p))); }')
w('function TG(l){ return l.property("ADBE Transform Group"); }')
w('comp.layers.addSolid([0.024,0.063,0.11], "Base", 1080, 1920, 1);')
cache, names = {}, {}
for d in layers:
    path = d['src']
    if path not in cache: cache[path] = 'it%d' % len(cache); w('var %s = imp("%s");' % (cache[path], path))
    w('var l = comp.layers.add(%s); l.name = "%s"; l.motionBlur = %s;' % (cache[path], d['id'], 'true' if d['mb'] else 'false'))
    names[d['id']] = True
    if d['blend'] == 'ADD': w('l.blendingMode = BlendingMode.ADD;')
    if d['blur']: w('var fb = l.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");')
    t0, t1 = max(0.0, warp(d['tin'])), min(LEN_NEW, warp(d['tout']) if d['tout'] < LEN else LEN_NEW)
    ts = [k / FPS for k in range(int(math.floor(t0 * FPS)), int(math.ceil(t1 * FPS)) + 1)]
    vals = [d['f'](warp_inv(t)) for t in ts]
    def emit(target, get, tol, scalar=False):
        seq = [get(v) for v in vals]; keep = [0]
        for k in range(1, len(seq) - 1):
            a, b, c = seq[keep[-1]], seq[k], seq[k + 1]
            same = (abs(b - a) < tol and abs(c - b) < tol) if scalar else (all(abs(y - x) < tol for x, y in zip(a, b)) and all(abs(z - y) < tol for y, z in zip(b, c)))
            if not same: keep.append(k)
        keep.append(len(seq) - 1); keep = sorted(set(keep))
        if len(keep) <= 2 and (seq[0] == seq[-1] if scalar else all(abs(x - y) < tol for x, y in zip(seq[0], seq[-1]))):
            w('%s.setValue(%s);' % (target, json.dumps(r(seq[0], 3) if scalar else [r(x) for x in seq[0]]))); return
        w('%s.setValuesAtTimes(%s,%s);' % (target, json.dumps([r(ts[k], 4) for k in keep]),
          json.dumps([r(seq[k], 3) if scalar else [r(x) for x in seq[k]] for k in keep])))
    sc = d['sc']
    emit('TG(l).property("ADBE Position")', lambda v: [v['x'] * K * M, v['y'] * K * M], 0.005)
    emit('TG(l).property("ADBE Scale")', lambda v: [v['s'] * v['sx'] * sc * M, v['s'] * v['sy'] * sc * M], 0.0005)
    emit('TG(l).property("ADBE Opacity")', lambda v: 100 * clamp(v['o']), 0.01, True)
    if any(v['rot'] for v in vals): emit('TG(l).property("ADBE Rotate Z")', lambda v: v['rot'], 0.001, True)
    if d['blur']: emit('fb.property("Blurriness")', lambda v: v['blur'] * K * M, 0.01, True)
    w('l.inPoint = %s; l.outPoint = %s;' % (r(t0, 4), r(t1, 4)))
    if d.get('matte'):
        w('l.setTrackMatte(comp.layer("%s"), TrackMatteType.ALPHA);' % d['matte'])
w('app.project.save(new File("piece3.ecproj"));')
w('"layers " + comp.numLayers;')
open('piece3.jsx', 'w').write('\n'.join(out))
def _wl(x): return [round(warp(v), 4) for v in x]
for e in events['text']:
    e['t_in'] = round(warp(e['t_in']), 4); e['t_out'] = round(min(LEN_NEW, warp(e['t_out'])), 4); e['units'] = _wl(e['units']); e['peaks'] = _wl(e['peaks'])
for o in events['obj']:
    o['t'] = round(warp(o['t']), 4)
    if 'end' in o: o['end'] = round(warp(o['end']), 4)
json.dump(dict(events, len=LEN_NEW, vo_words=WARP['vo_words_new'], vo_path=WARP['vo_path'],
               cuts=_wl([5.9 + 0.09, 9.2, 11.55 + 0.09, 19.62, 22.6, 30.0])), open('events.json', 'w'), indent=1)
print(len(layers), 'layers;', sum(len(x) for x in out) // 1024, 'KB;', len(events['text']), 'text events')
