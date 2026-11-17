# compose.py : Blender frames (720x1280) -> 1080x1920, type layer over, holds filled from the last rendered frame.
import os, sys
from PIL import Image, ImageFilter
B = os.path.dirname(os.path.abspath(__file__)); TL = os.path.join(B, '../agfilm2/tl'); OUT = os.path.join(B, 'comp'); os.makedirs(OUT, exist_ok=True)
last = None
for f in range(1, 361):
    p = os.path.join(B, 'fr', f'f{f:04d}.png')
    if os.path.exists(p): last = p
    im = Image.open(last).convert('RGB').resize((1080, 1920), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2)).convert('RGBA')
    tx = Image.open(os.path.join(TL, f't{f:04d}.png'))
    Image.alpha_composite(im, tx).convert('RGB').save(os.path.join(OUT, f'c{f:04d}.png'))
print('composed')
