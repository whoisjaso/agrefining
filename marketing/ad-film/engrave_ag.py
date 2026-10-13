# engrave_ag.py SRC OUT [cut|print|screen|cutscreen] : the one treatment for the AG film.
#   print     : grayscale engraving, paper -> AG creme, ink -> AG navy (duotone), no alpha
#   cut       : object on a plain museum backdrop -> alpha cutout (border-colour key + grabCut), then duotone
#   screen    : photo -> line-screen "engraving" (variable-width diagonal lines), duotone
#   cutscreen : cutout + line screen
import sys, numpy as np, cv2
from PIL import Image
INK = np.array([16, 42, 67], float)      # AG navy  #102a43
PAPER = np.array([241, 237, 228], float) # AG creme #f1ede4
src, out, mode = sys.argv[1], sys.argv[2], sys.argv[3]
MAXW = int(sys.argv[4]) if len(sys.argv) > 4 else 1600
im = Image.open(src).convert("RGB"); im.thumbnail((MAXW, MAXW), Image.LANCZOS)
rgb = np.asarray(im).astype(np.uint8); H, W = rgb.shape[:2]
alpha = None
if "cut" in mode:
    mask = np.zeros((H, W), np.uint8)
    r = (int(W * 0.03), int(H * 0.03), int(W * 0.94), int(H * 0.94))
    bgm, fgm = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    small = cv2.resize(rgb[..., ::-1], (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    ms = np.zeros(small.shape[:2], np.uint8)
    cv2.grabCut(small, ms, tuple(v // 2 for v in r), bgm, fgm, 6, cv2.GC_INIT_WITH_RECT)
    mask = cv2.resize(ms, (W, H), interpolation=cv2.INTER_NEAREST)
    a = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(a)                    # keep the largest object only
    if n > 1: a = np.where(lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
    a = cv2.morphologyEx(a, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    alpha = cv2.GaussianBlur(a, (0, 0), 1.2).astype(float) / 255
g = np.asarray(Image.fromarray(rgb).convert("L")).astype(float)
region = g[alpha > 0.5] if alpha is not None else g
lo, hi = np.percentile(region, 1.5), np.percentile(region, 97 if alpha is None else 99.5)
v = np.clip((g - lo) / max(1, hi - lo), 0, 1)                             # 0 = ink, 1 = paper
if "night" in mode:
    INK, PAPER = PAPER.copy(), INK.copy()
if "screen" in mode:
    pitch = max(4.0, W / 260)                                              # ~260 engraved lines across
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    v = cv2.GaussianBlur(v, (0, 0), pitch * 0.35)
    ph = ((xx * 0.42 + yy * 0.91) / pitch) % 1.0                           # diagonal line phase
    tri = np.abs(ph - 0.5) * 2                                             # 1 at line centre .. 0 at gap
    width = np.clip((1 - v) ** 0.9, 0, 1)                                  # darker -> wider line
    aa = 1.6 / pitch
    v = 1 - np.clip((tri - (1 - width)) / aa + 0.5, 0, 1)                  # anti-aliased line coverage
else:
    v = v ** 1.08
c = INK[None, None] * (1 - v[..., None]) + PAPER[None, None] * v[..., None]
c = np.clip(np.rint(c), 0, 255).astype(np.uint8)
if alpha is None and "feather" in mode:                                    # plates melt into the paper
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    fe = 0.16
    ex = np.clip(np.minimum(xx, W - 1 - xx) / (W * fe), 0, 1); ey = np.clip(np.minimum(yy, H - 1 - yy) / (H * fe), 0, 1)
    alpha = (ex * ey) ** 0.8; alpha = alpha * alpha * (3 - 2 * alpha)
if alpha is None:
    Image.fromarray(c).save(out, optimize=True)
else:
    o = Image.fromarray(np.dstack([c, (alpha * 255).astype(np.uint8)]), "RGBA")
    if "feather" not in mode: o = o.crop(o.getbbox())
    o.save(out, optimize=True)
print(out, Image.open(out).size)
