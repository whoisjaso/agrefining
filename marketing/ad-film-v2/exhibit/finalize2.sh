#!/bin/sh
set -e
B=/tmp/claude-0/-home-user-agrefining/9fbaafbb-3210-5aca-8623-467a5c6680b5/scratchpad/agfilm2/../blender; D=/tmp/claude-0/-home-user-agrefining/9fbaafbb-3210-5aca-8623-467a5c6680b5/scratchpad/agfilm2
python3 - <<'PY'
import os
from PIL import Image, ImageFilter
B = '/tmp/claude-0/-home-user-agrefining/9fbaafbb-3210-5aca-8623-467a5c6680b5/scratchpad/agfilm2/../blender'; D = '/tmp/claude-0/-home-user-agrefining/9fbaafbb-3210-5aca-8623-467a5c6680b5/scratchpad/agfilm2'; out = os.path.join(B, 'comp2'); os.makedirs(out, exist_ok=True); last = None
for f in range(1, 361):
    p = os.path.join(B, 'fr2', f'f{f:04d}.png')
    if os.path.exists(p): last = p
    im = Image.open(last).convert('RGB').resize((1080, 1920), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2)).convert('RGBA')
    tx = Image.open(os.path.join(D, 'tl2', f't{f:04d}.png'))
    li = f - 259                                   # the Blender logo tile turns in at 10.8 s (frame 260)
    if li >= 1:
        lg = Image.open(os.path.join(B, 'logo', f'm{min(li, 30):04d}.png')).convert('RGBA').resize((380, 380), Image.LANCZOS)
        im.alpha_composite(lg, (540 - 190, 40))
    Image.alpha_composite(im, tx).convert('RGB').save(os.path.join(out, f'c{f:04d}.png'))
print('composed')
PY
ffmpeg -v error -y -framerate 24 -i $B/comp2/c%04d.png -i $D/with_music.wav -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart /home/user/agrefining/marketing/ad-film-v2/renders/ag-refining-exhibit-ad.mp4
echo FINALIZED
