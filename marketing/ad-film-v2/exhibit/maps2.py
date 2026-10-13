# maps2.py : hallmark for the back of the spoon handle (UV: u along the spoon 0 tip -> 1 end, v across), drawer-coin dates.
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
out = sys.argv[1]; FD = '/tmp/claude-0/-home-user-agrefining/9fbaafbb-3210-5aca-8623-467a5c6680b5/scratchpad/blender/fonts/'
def SANS(size, w=700):
    f = ImageFont.truetype(FD + 'Manrope.ttf', size); f.set_variation_by_axes([w]); return f
def SERIF(size, w=600):
    f = ImageFont.truetype(FD + 'Newsreader.ttf', size); f.set_variation_by_axes([w, 72]); return f
W, H = 8192, 1024
im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im)
# the stamp sits on the widening handle: a punched cartouche with 925, and STERLING beside it
cx = int(0.865 * W); cy = H // 2
d.rounded_rectangle([cx - 300, cy - 170, cx + 300, cy + 170], radius=60, outline=255, width=22)
d.text((cx, cy + 6), '925', font=SERIF(250, 600), fill=255, anchor='mm')
d.text((int(0.735 * W), cy + 4), 'STERLING', font=SANS(150, 700), fill=255, anchor='mm')
a = np.asarray(im.filter(ImageFilter.GaussianBlur(2.0)), np.float32) / 255
a = a[::-1]   # the mark is read after the spoon is turned over: flip so it reads the right way round
Image.fromarray((a * 65535).astype(np.uint16)).save(f'{out}/hallmark.png')
print('hallmark ok')
