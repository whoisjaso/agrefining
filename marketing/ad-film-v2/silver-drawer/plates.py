# plates.py : graded plates at 4K master scale. Grade = examples/clip01_v2/prep.py GRADE (benchmark), then a burn for type.
import subprocess, numpy as np
from PIL import Image, ImageFilter
GRADE = ("colorbalance=rs=0.02:gs=0.0:bs=-0.03:rm=0.03:gm=0.01:bm=-0.02:rh=0.015:gh=0.005:bh=-0.02,"
         "curves=r='0/0.02 0.25/0.235 0.5/0.52 0.75/0.775 0.92/0.9 1/0.955':"
         "g='0/0.02 0.25/0.235 0.5/0.505 0.75/0.765 0.92/0.895 1/0.95':"
         "b='0/0.035 0.25/0.25 0.5/0.495 0.75/0.75 0.92/0.88 1/0.935',"
         "eq=saturation=1.06:contrast=1.0")
CMA = '../../cma/'
def grade(rgb):
    rgb.save('/tmp/claude-0/-home-user-agrefining/9fbaafbb-3210-5aca-8623-467a5c6680b5/scratchpad/silver/build/_g_in.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '_g_in.png', '-vf', GRADE, '_g_out.png'], check=True)
    return Image.open('_g_out.png').convert('RGB')
def feather_band(im, top, bot):
    a = np.ones((im.height, im.width))
    y = np.arange(im.height)[:, None]
    a *= np.clip(y / top, 0, 1) ** 1.5 * np.clip((im.height - y) / bot, 0, 1) ** 1.5
    x = np.arange(im.width)[None, :]; a *= np.clip(x / 60, 0, 1) * np.clip((im.width - x) / 60, 0, 1)
    out = im.convert('RGBA'); out.putalpha(Image.fromarray((a * 255).astype(np.uint8))); return out
def burn(im, k=0.7):   # darken toward the edges (Liquid Motion: dark burned background behind the type)
    w, h = im.size; yy, xx = np.mgrid[0:h, 0:w]; r = np.sqrt(((xx - w / 2) / (w * 0.62)) ** 2 + ((yy - h / 2) / (h * 0.58)) ** 2)
    m = np.clip(1 - k * np.clip(r - 0.35, 0, 1) ** 1.2, 0, 1)[..., None]
    return Image.fromarray((np.asarray(im).astype(float) * m).clip(0, 255).astype(np.uint8))
# 1) the drawer: six spoons in their silk case (lid label cropped out)
box = Image.open(CMA + 'P166314_1.jpg').convert('RGB').crop((440, 950, 2830, 3260))
box = burn(grade(box), 0.55); box = Image.fromarray((np.asarray(box) * 0.86).astype(np.uint8))
feather_band(box, 260, 260).save('png/plate_box.png')
Image.fromarray(np.asarray(box)).filter(ImageFilter.GaussianBlur(28)).save('png/plate_box_blur.jpg', quality=95)
# 2) the stamp macro: handle close-up, cropped right of the maker's stamp (x >= 1300) so only STERLING shows
mac = Image.open(CMA + 'P166328_2.jpg').convert('RGB').crop((1300, 0, 3400, 2569))
mac = burn(grade(mac), 0.45); feather_band(mac, 520, 520).save('png/plate_macro.png')
# 3) spoon cutouts: grade the colour, keep the matte
for n in ('front', 'back'):
    c = Image.open(f'../cut/{n}_isnet.png'); g = grade(c.convert('RGB')); g.putalpha(c.getchannel('A')); g.save(f'png/spoon_{n}.png')
# 4) background: deep navy with a soft light pool, dithered so it never bands
W, H = 2160, 3840; yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W * 0.5) / W) ** 2 + ((yy - H * 0.42) / (H * 0.7)) ** 2)
top = np.array([16, 42, 67.]); deep = np.array([6, 16, 28.])
k = np.clip(r / 0.75, 0, 1)[..., None] ** 1.3
bg = top * (1 - k) + deep * k + np.random.default_rng(1).normal(0, 1.1, (H, W, 1))
Image.fromarray(bg.clip(0, 255).astype(np.uint8)).save('png/bg.png')
print('plates ok', box.size, mac.size)
