# maps.py OUTDIR : high-resolution relief maps for the Blender assets (16-bit PNG heightmaps).
# Coin: fictional proof design (no real mint design): raised rim, bead border, ring legend, compass rose, "Ag" and "47".
import sys, math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
out = sys.argv[1]
FD = '/tmp/claude-0/-home-user-agrefining/9fbaafbb-3210-5aca-8623-467a5c6680b5/scratchpad/blender/fonts/'
def SANSF(size, w=700):
    f = ImageFont.truetype(FD + 'Manrope.ttf', size); f.set_variation_by_axes([w]); return f
def SERIFF(size, w=600):
    f = ImageFont.truetype(FD + 'Newsreader.ttf', size); f.set_variation_by_axes([w, 72]); return f

def to16(a, path):
    a = np.clip(a, 0, 1); Image.fromarray((a * 65535).astype(np.uint16)).save(path)

def soften(img, r):   # relief has rounded shoulders, not vertical walls
    return np.asarray(img.filter(ImageFilter.GaussianBlur(r)), np.float32) / 255

# ── coin obverse ──
S = 4096; c = S / 2; R = S / 2
L = lambda: Image.new('L', (S, S), 0)
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32); rr = np.hypot(xx - c, yy - c) / R
h = np.zeros((S, S), np.float32)
# field: very slightly dished toward the centre (proof fields are not flat)
h += 0.06 * (rr ** 2)
# raised rim with a rounded inner shoulder
rim = np.clip((rr - 0.925) / 0.02, 0, 1); rim = rim * rim * (3 - 2 * rim); h = np.maximum(h, 0.82 * rim)
# bead border
im = L(); d = ImageDraw.Draw(im)
for i in range(150):
    a = i / 150 * 2 * math.pi; x, y = c + math.cos(a) * R * 0.875, c + math.sin(a) * R * 0.875; r = R * 0.0145
    d.ellipse([x - r, y - r, x + r, y + r], fill=255)
bead = soften(im, 6); h = np.maximum(h, 0.55 * np.sqrt(bead))
# legend around the ring
im = L(); d = ImageDraw.Draw(im); f = SANSF(int(S * 0.052))
txt = 'AG REFINING  ·  HOUSTON, TEXAS  ·  ONE TROY OUNCE  ·  FINE SILVER  ·  '
n = len(txt); rad = R * 0.76
for i, ch in enumerate(txt):
    a = -math.pi / 2 + i / n * 2 * math.pi
    g = Image.new('L', (int(S * 0.08), int(S * 0.08)), 0); gd = ImageDraw.Draw(g); gd.text((g.width / 2, g.height / 2), ch, font=f, fill=255, anchor='mm')
    g = g.rotate(-math.degrees(a + math.pi / 2), resample=Image.BICUBIC)
    im.paste(g, (int(c + math.cos(a) * rad - g.width / 2), int(c + math.sin(a) * rad - g.height / 2)), g)
leg = soften(im, 3); h = np.maximum(h, 0.5 * leg)
# inner ring line
ring = np.exp(-((rr - 0.665) / 0.0032) ** 2); h = np.maximum(h, 0.42 * ring)
# compass rose: faceted points (each point has a ridge, so light breaks across it)
ang = np.arctan2(yy - c, xx - c); rose = np.zeros_like(h)
for k in range(16):
    a0 = k / 16 * 2 * math.pi - math.pi / 2; L_ = [0.6, 0.3, 0.45, 0.3][k % 4]; W = [0.085, 0.04, 0.06, 0.04][k % 4]
    da = np.angle(np.exp(1j * (ang - a0)))
    across = rr * np.sin(da); along = rr * np.cos(da)
    inside = (along > 0) & (along < L_)
    halfw = W * (1 - along / L_)
    t = np.where(inside, 1 - np.abs(across) / np.maximum(halfw, 1e-4), 0)
    t = np.clip(t, 0, 1) * (0.55 + 0.45 * (1 - along / L_))
    rose = np.maximum(rose, t * [1.0, 0.7, 0.85, 0.7][k % 4])
h = np.maximum(h, 0.62 * rose)
# frosted fine lines radiating in the field behind the rose (engine turning)
guil = 0.5 + 0.5 * np.sin(ang * 180 + 14 * np.sin(rr * 30))
field_mask = ((rr > 0.17) & (rr < 0.64)).astype(np.float32) * (rose < 0.05)
h += 0.025 * guil * field_mask
# central medallion: a raised boss with a bevelled edge carrying "Ag" and 47
MR = 0.2
med = np.clip((MR - rr) / 0.012, 0, 1); med = med * med * (3 - 2 * med)
h = np.where(rr < MR + 0.004, np.maximum(h * (rr > MR), 0.3 * med), h)
im = L(); d = ImageDraw.Draw(im)
d.text((c, c + S * 0.018), 'Ag', font=SERIFF(int(S * 0.115), 500), fill=255, anchor='mm')
d.text((c, c - S * 0.064), '47', font=SANSF(int(S * 0.026), 700), fill=255, anchor='mm')
ag = soften(im, 3); h = np.where(rr < MR, 0.3 * med + 0.4 * ag, h)
to16(h, f'{out}/coin_height.png')
# roughness: mirror field, frosted relief (proof finish)
relief = np.clip((h - 0.08) * 4, 0, 1) * (rr < 0.92)
Image.fromarray((np.clip(0.04 + 0.32 * relief, 0, 1) * 255).astype(np.uint8)).resize((2048, 2048), Image.LANCZOS).save(f'{out}/coin_rough.png')

# ── reeded edge (tileable strip) ──
W_, H_ = 4096, 64; x = np.arange(W_) / W_
reed = 0.5 + 0.5 * np.cos(x * 2 * math.pi * 200); to16(np.tile(reed[None], (H_, 1)), f'{out}/reed.png')

# ── spoon handle engraving: a scrolled border + the 925 hallmark (UV space, u along length) ──
W_, H_ = 4096, 1024; im = Image.new('L', (W_, H_), 0); d = ImageDraw.Draw(im)
for i in range(0, 60):
    u = 0.55 + i * 0.0072; x0 = int(u * W_)
    for s in (-1, 1):
        cy = H_ / 2 + s * H_ * 0.36; d.arc([x0 - 26, cy - 22, x0 + 26, cy + 22], 0 if s > 0 else 180, 180 if s > 0 else 360, fill=255, width=7)
d.text((int(0.80 * W_), H_ / 2), '925', font=SANSF(150), fill=255, anchor='mm')
d.ellipse([int(0.93 * W_) - 120, H_ / 2 - 120, int(0.93 * W_) + 120, H_ / 2 + 120], outline=255, width=12)
eng = soften(im, 2.5); to16(1 - eng, f'{out}/spoon_engrave.png')
print('maps ok')

# ── bar stamps (top face, UV = planar over the face) ──
def stamp(path, W, H, lines, frame=True):
    im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im)
    if frame:
        m = int(H * 0.09); d.rounded_rectangle([m, m, W - m, H - m], radius=int(H * 0.06), outline=255, width=max(6, H // 90))
    for txt, y, size, wt, fam in lines:
        f = SANSF(size, wt) if fam == 's' else SERIFF(size, wt)
        d.text((W / 2, y * H), txt, font=f, fill=255, anchor='mm')
    a = soften(im, 2.2); to16(a, path)
stamp(f'{out}/hero_stamp.png', 4096, 2200, [('AG', 0.42, 820, 800, 's'), ('FINE SILVER  999.9', 0.71, 150, 700, 's'), ('AG REFINING · HOUSTON', 0.84, 96, 600, 's')])
stamp(f'{out}/bullion_stamp.png', 2048, 1080, [('10 OZ', 0.30, 150, 800, 's'), ('FINE SILVER', 0.52, 120, 700, 's'), ('999', 0.73, 170, 800, 's')])
print('stamps ok')
