# compose.py : "Sunday silver", a family-album edit of public-domain home movies for AG Refining.
# Frames -> out/f####.png (1080x1920, 24 fps). Timeline constants are shared with mix.py.
import os, math, json, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
FD = os.path.join(HERE, '..', 'blender', 'fonts')
FPS, DUR = 24, 20.0; NF = int(DUR * FPS)
W, H = 1080, 1920
CREME = (241, 237, 228); NAVY = (16, 42, 67); INK2 = (74, 88, 104)

# ── timeline ──
SHOTS = [  # (name, t0, t1, src_offset_frames, kind)
    ('s1', 0.00, 2.90, 0, 'bw'), ('s2', 2.90, 4.60, 0, 'bw'), ('s3', 4.60, 6.60, 4, 'color'),
    ('s4', 6.60, 8.40, 0, 'color'), ('s5', 8.40, 12.60, 0, 'bw'),          # s5 runs out of frames ~10.9 s and holds (the freeze)
    ('sterling', 12.60, 15.40, 0, 'photo'),
]
END = 15.40
VO = [('l1_0', 0.50, 'Every Sunday, Mama laid out the good silver.'), ('l2_0', 4.45, 'Forty years of Sunday dinners.'),
      ('l3_1', 7.30, 'Last spring, we cleaned out her house.'), ('l4_0', 10.45, 'I almost gave her silver away.'),
      ('l5_0', 15.75, 'Check the back before you give it away.')]
WORDS = json.load(open(os.path.join(HERE, 'vo_words.json')))
json.dump({'shots': SHOTS, 'end': END, 'vo': VO, 'dur': DUR}, open(os.path.join(HERE, 'timeline.json'), 'w'))

def font(fam, size, w, opsz=None):
    if fam == 'serif':
        f = ImageFont.truetype(os.path.join(FD, 'Newsreader.ttf'), size); f.set_variation_by_axes([w, opsz or min(72, max(6, size / 2))])
    else:
        f = ImageFont.truetype(os.path.join(FD, 'Manrope.ttf'), size); f.set_variation_by_axes([w])
    return f
rng = np.random.default_rng(1952)
clamp = lambda x, a=0.0, b=1.0: max(a, min(b, x))
ease = lambda k: k * k * (3 - 2 * k)

# ── paper page (static) ──
def paper():
    a = np.ones((H, W, 3), np.float32) * np.array(CREME, np.float32)
    n = rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32)
    n = np.asarray(Image.fromarray(((n * 18) + 128).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2)), np.float32) - 128
    fib = np.asarray(Image.fromarray((rng.random((H // 8, W // 2)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255 - 0.5
    a += (n * 0.12)[..., None] + (fib * 4)[..., None]
    yy, xx = np.mgrid[0:H, 0:W]; v = ((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.7)) ** 2
    a *= (1 - 0.10 * v)[..., None]
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))
PAPER = paper()

# ── the print: content -> warm film look -> white border, album corners, shadow ──
PW, PH = 920, 690; BORDER = 22; ROT = -1.1; CX, CY = W // 2, 820
def film(img, kind, t, f):
    im = img.convert('RGB').resize((PW, PH), Image.LANCZOS)
    a = np.asarray(im, np.float32)
    if kind == 'bw':
        g = a.mean(2, keepdims=True); a = g * np.array([1.06, 1.0, 0.88]) + 6       # warm silver-gelatin tone
    elif kind == 'color':
        a = a * np.array([1.04, 1.0, 0.94]) + np.array([4, 2, -2])
    else:
        a = a * np.array([1.03, 1.0, 0.95])
    if kind != 'photo':
        a *= 1 + 0.035 * math.sin(f * 2.1) * rng.normal(0, 0.6)                  # projector flicker
        a += rng.normal(0, 9, (PH, PW, 1)).astype(np.float32)                      # grain
        if rng.random() < 0.18:                                                    # a speck of dust now and then
            x, y = rng.integers(0, PW), rng.integers(0, PH); r = rng.integers(1, 4)
            a[max(0, y - r):y + r, max(0, x - r):x + r] = 20 if rng.random() < 0.5 else 235
    else:
        a += rng.normal(0, 3, (PH, PW, 1)).astype(np.float32)
    yy, xx = np.mgrid[0:PH, 0:PW]; v = ((xx - PW / 2) / PW) ** 2 + ((yy - PH / 2) / PH) ** 2
    a *= (1 - 0.55 * v)[..., None]
    im = Image.fromarray(a.clip(0, 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(1.6, 45, 3))
    return im

def frame_src(name, t0, t, off):
    if name == 'sterling':
        ph = Image.open(os.path.join(SRC, 'sterling.jpg')).convert('RGB')        # 1162x338, STERLING at ~x 650-780
        k = ease(clamp((t - t0) / 2.8)); z = 1.0 + 0.16 * k
        cw = 290 / z; ch = cw * 3 / 4; cx, cy = 728, 158
        return ph.crop((int(cx - cw / 2), int(cy - ch / 2), int(cx + cw / 2), int(cy + ch / 2)))
    d = os.path.join(SRC, name); n = len(os.listdir(d))
    i = min(n, 1 + off + int((t - t0) * FPS))
    im = Image.open(os.path.join(d, f'{i:04d}.png'))
    # slow push inside the print (a hand-held projector feel); the freeze keeps pushing
    k = clamp((t - t0) / 4.0); z = 1.0 + 0.06 * k + (0.08 * ease(clamp((t - 10.6) / 2.0)) if name == 's5' else 0)
    w, h = im.size; cw, ch = w / z, h / z
    jx, jy = (rng.normal(0, 0.6), rng.normal(0, 0.6)) if i < n else (0, 0)
    return im.crop((w / 2 - cw / 2 + jx, h / 2 - ch / 2 + jy, w / 2 + cw / 2 + jx, h / 2 + ch / 2 + jy))

def print_card(content):
    card = Image.new('RGBA', (PW + 2 * BORDER, PH + 2 * BORDER), (250, 248, 243, 255))
    card.paste(content, (BORDER, BORDER))
    d = ImageDraw.Draw(card); s = 46                                               # black album corners
    for (x, y, dx, dy) in [(0, 0, 1, 1), (card.width, 0, -1, 1), (0, card.height, 1, -1), (card.width, card.height, -1, -1)]:
        d.polygon([(x, y), (x + dx * s, y), (x, y + dy * s)], fill=(28, 26, 24, 255))
    return card.rotate(ROT, resample=Image.BICUBIC, expand=True)
SHADOW = None
def place_print(page, card):
    global SHADOW
    if SHADOW is None:
        m = Image.new('L', card.size, 0); m.paste(card.split()[3], (0, 0)); SHADOW = m.filter(ImageFilter.GaussianBlur(18))
    x, y = CX - card.width // 2, CY - card.height // 2
    sh = Image.new('RGBA', card.size, (40, 30, 20, 0)); sh.putalpha(SHADOW.point(lambda v: int(v * 0.38)))
    page.alpha_composite(sh, (x + 6, y + 16)); page.alpha_composite(card, (x, y))

# ── captions: the line types in with her words ──
CAP = font('serif', 58, 420)
def caption(page, t):
    layer = Image.new('RGBA', page.size, (0, 0, 0, 0)); _caption(ImageDraw.Draw(layer), t); page.alpha_composite(layer)
def _caption(d, t):
    live = [v for v in VO if v[0] != 'l5_0' and v[1] - 0.05 <= t]
    for key, t0, text in live[-1:]:
        ws = WORDS.get(key + '.wav', []); toks = text.split()
        dur = (ws[-1][2] if ws else 2.0) + 0.9
        if not (t0 - 0.05 <= t < t0 + dur + 0.9): continue
        n = sum(1 for i, w in enumerate(ws) if t >= t0 + w[1] - 0.04) if ws else len(toks)
        n = min(len(toks), max(n, 0))
        fade = 1 - clamp((t - (t0 + dur + 0.5)) / 0.4)
        if key == 'l4_0': fade = min(fade, 1 - clamp((t - 12.25) / 0.3))
        lines = wrap(toks, CAP, 900); y = 1270; drawn = 0
        for ln in lines:
            wl = d.textlength(' '.join(ln), font=CAP); x = W / 2 - wl / 2
            for tok in ln:
                col = NAVY if drawn < n else None
                if col: d.text((x, y), tok, font=CAP, fill=(*col, int(255 * fade)))
                x += d.textlength(tok + ' ', font=CAP); drawn += 1
            y += 76
def wrap(toks, f, maxw):
    d = ImageDraw.Draw(Image.new('L', (1, 1))); lines, cur = [], []
    for tok in toks:
        if d.textlength(' '.join(cur + [tok]), font=f) > maxw and cur: lines.append(cur); cur = []
        cur.append(tok)
    return lines + [cur]

# ── the end card ──
MARK = Image.open(os.path.join(HERE, 'agmark.png')).convert('RGBA').resize((190, 190), Image.LANCZOS)
F_AG, F_REF = font('sans', 124, 800), font('sans', 124, 400)
F_TAG = font('serif', 54, 400); F_CHECK = font('serif', 60, 460); F_URL = font('sans', 30, 650); F_LEGAL = font('sans', 20, 500)
def endcard(page, t):
    layer = Image.new('RGBA', page.size, (0, 0, 0, 0)); _endcard(page, ImageDraw.Draw(layer), t); page.alpha_composite(layer)
def _endcard(page, d, t):
    k = lambda a, d=0.5: ease(clamp((t - a) / d))
    a = k(END + 0.05); m = MARK.copy(); m.putalpha(m.split()[3].point(lambda v: int(v * a)))
    page.alpha_composite(m, (W // 2 - 95, int(500 - 20 * (1 - a))))
    wa, wr = d.textlength('AG', font=F_AG), d.textlength(' Refining', font=F_REF); x = W / 2 - (wa + wr) / 2; y = 735 - 24 * (1 - k(END + 0.2))
    al = int(255 * k(END + 0.2)); d.text((x, y), 'AG', font=F_AG, fill=(*NAVY, al)); d.text((x + wa, y), ' Refining', font=F_REF, fill=(*NAVY, al))
    tg = "Houston’s silver buyer"; d.text((W / 2 - d.textlength(tg, font=F_TAG) / 2, 925), tg, font=F_TAG, fill=(*INK2, int(255 * k(END + 0.45))))
    # the line arrives with her voice
    ws = WORDS['l5_0.wav']; t0 = 15.75; toks = 'Check the back before you give it away.'.split()
    n = sum(1 for w in ws if t >= t0 + w[1] - 0.04)
    lines = wrap(toks, F_CHECK, 960); yy = 1120; drawn = 0
    for ln in lines:
        wl = d.textlength(' '.join(ln), font=F_CHECK); xx = W / 2 - wl / 2
        for tok in ln:
            if drawn < n: d.text((xx, yy), tok, font=F_CHECK, fill=(*NAVY, 255))
            xx += d.textlength(tok + ' ', font=F_CHECK); drawn += 1
        yy += 80
    u = 'AGREFINING.COM'; sp = 6
    uw = sum(d.textlength(c, font=F_URL) + sp for c in u) - sp; xx = W / 2 - uw / 2
    for c in u: d.text((xx, 1330), c, font=F_URL, fill=(*NAVY, int(255 * k(17.9)))); xx += d.textlength(c, font=F_URL) + sp
    lg = 'Dramatization. Archival film: Prelinger Archives (public domain). Photo: Cooper Hewitt, Smithsonian (CC0).'
    d.text((W / 2 - d.textlength(lg, font=F_LEGAL) / 2, 1846), lg, font=F_LEGAL, fill=(*INK2, int(170 * k(END + 0.3))))

# ── render ──
only = [int(x) for x in sys.argv[1].split(',')] if len(sys.argv) > 1 else range(NF)
for fi in only:
    t = fi / FPS; page = PAPER.copy().convert('RGBA')
    if t < END:
        cur = [s for s in SHOTS if s[1] <= t < s[2]][0]; name, t0, t1, off, kind = cur
        img = film(frame_src(name, t0, t, off), kind, t, fi)
        # a short cross-dissolve between shots (projector feel), a hard cut into STERLING
        prev = [s for s in SHOTS if s[2] == t0]
        if prev and t - t0 < 0.25 and name != 'sterling':
            p = prev[0]; pim = film(frame_src(p[0], p[1], t0 - 1 / FPS, p[3]), p[4], t0, fi)
            img = Image.blend(pim, img, ease((t - t0) / 0.25))
        card = print_card(img)
        # the print lifts off the page into the end card
        if t > END - 0.35:
            a = ease(clamp((t - (END - 0.35)) / 0.35)); card.putalpha(card.split()[3].point(lambda v: int(v * (1 - a))))
        place_print(page, card); caption(page, t)
    if t >= END - 0.1: endcard(page, t)
    page.convert('RGB').save(os.path.join(OUT, f'f{fi:04d}.png'))
print('frames', len(list(only)))
