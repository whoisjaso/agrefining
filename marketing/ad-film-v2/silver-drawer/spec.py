# spec.py : every on-screen text line with its role (agrefining brand, type-motion-rules.json) -> assets.html
import json
GRAD = 'background:linear-gradient(180deg,#FFFFFF 18%,#C9D3DE 92%);-webkit-background-clip:text;background-clip:text;color:transparent;'
ROLE = {
 'hook':    'font-family:MR;font-weight:800;letter-spacing:-0.03em;text-transform:uppercase;' + GRAD,
 'hero':    'font-family:MR;font-weight:800;letter-spacing:-0.045em;' + GRAD,
 'number':  'font-family:MR;font-weight:800;letter-spacing:-0.04em;font-variant-numeric:tabular-nums;' + GRAD,
 'leadin':  'font-family:TG;font-weight:400;letter-spacing:-0.03em;color:#C9D3DE;',
 'emphasis':'font-family:MR;font-weight:800;letter-spacing:-0.03em;color:#E8604C;',
 'caption': 'font-family:MR;font-weight:700;letter-spacing:-0.01em;color:#FFFFFF;',
}
# id, role, text, size_px (1080 frame), unit
LINES = [
 ('hook_q',  'hook',    'Okay, real quick question.',               160, 'word'),
 ('l1_lead', 'leadin',  'you got a drawer full of old',  62,  'word'),
 ('l1_hero', 'hero',    'silverware?',                   150, 'line'),
 ('l1_lead2','leadin',  'that nobody even uses.',                  62,  'word'),
 ('l2_lead', 'leadin',  '’cause, man… rent’s due',       66,  'word'),
 ('l2_hero', 'hero',    'friday.',                       230, 'line'),
 ('l2_lead2','leadin',  'light bill’s',             62,  'word'),
 ('l2_emph', 'emphasis','due.',                          62,  'line'),
 ('l3_lead', 'leadin',  'and that damn drawer’s just',   62,  'word'),
 ('l3_hero', 'hero',    'sittin’ there.',                150, 'line'),
 ('l4_hero', 'hero',    'flip',                          230, 'line'),
 ('l4_lead', 'leadin',  'one of ’em over.',                 66,  'word'),
 ('l5_lead', 'leadin',  'look real close. there’s a tiny little',         62,  'word'),
 ('l5_hero', 'hero',    'stamp.',                   230, 'line'),
 ('l6_num',  'number',  '925',                           200, 'line'),
 ('l6_lead', 'leadin',  'or it straight up says',                   62,  'word'),
 ('l6_hero', 'hero',    'sterling.',                     190, 'line'),
 ('l7_lead', 'leadin',  'that ain’t plated.',       66,  'word'),
 ('l7_lead2','leadin',  'that’s',                   66,  'word'),
 ('l7_hero', 'hero',    'real silver.',                  170, 'line'),
 ('cap1',    'caption', 'so… rent’s due.',         60,  'word'),
 ('cap2',    'caption', 'and you got real silver,',  60,  'word'),
 ('cap3',    'caption', 'just sittin’ in a drawer.',               60,  'word'),
 ('cap4',    'caption', 'yeah. now you see it.',             60,  'word'),
 ('end_lead','leadin',  'houston’s silver buyer.',  66,  'word'),
]
css = '''@font-face{font-family:MR;src:url(src/manrope.ttf);font-weight:200 800}
@font-face{font-family:TG;src:url(src/termes.otf);font-weight:400}
*{box-sizing:border-box}html,body{margin:0;background:transparent}
.ln{display:inline-block;white-space:pre;line-height:1.15;padding:40px 60px;margin:20px;vertical-align:top}
.ln .u{display:inline-block;padding:0.14em 0.16em;margin:0 -0.16em;-webkit-box-decoration-break:clone}
.ob{display:inline-block;margin:30px;position:relative;vertical-align:top}'''
h = ['<!doctype html><html><head><meta charset=utf-8><style>', css, '</style></head><body>']
for lid, role, text, size, unit in LINES:
    parts = text.split(' ') if unit == 'word' else [text]
    inner = ' '.join(f'<span class="u">{p}</span>' for p in parts)
    h.append(f'<div class="ln" id="{lid}" data-role="{role}" style="font-size:{size}px;{ROLE[role]}">{inner}</div>')
# objects (graphics, not role text)
h.append('''<div class="ob" id="cal" style="width:430px;height:470px;border-radius:44px;background:#F4F5F8;overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.5) inset">
 <div style="height:120px;background:#E8604C;color:#fff;font:800 50px MR;letter-spacing:.12em;display:flex;align-items:center;justify-content:center">FRIDAY</div>
 <div style="font:800 250px/1 MR;letter-spacing:-.05em;color:#102A43;text-align:center;margin-top:44px">17</div></div>''')
h.append('''<div class="ob" id="bill" style="width:420px;height:540px;border-radius:26px;background:#FBFBFC;padding:46px 44px">
 <div style="font:700 44px MR;color:#102A43;letter-spacing:-.02em">Light bill</div>
 <div style="font:600 26px MR;color:#7b8794;margin-top:8px;letter-spacing:.06em">STATEMENT</div>
 <div style="margin-top:44px;display:grid;gap:22px">''' + ''.join(f'<div style="height:16px;border-radius:8px;background:#E3E7ED;width:{w}%"></div>' for w in (92, 70, 84, 60, 78)) + '''</div>
 <div style="position:absolute;right:34px;bottom:46px;transform:rotate(-12deg);border:7px solid #E8604C;color:#E8604C;border-radius:16px;padding:6px 22px;font:800 64px MR;letter-spacing:.06em">DUE</div></div>''')
h.append('<div class="ob" id="loupe" style="width:560px;height:560px;border-radius:50%;box-shadow:0 0 0 7px #F4F5F8, 0 0 0 9px rgba(16,42,67,.6), 0 0 60px 6px rgba(255,255,255,.25), inset 0 0 50px rgba(255,255,255,.18)"></div>')
h.append('<div class="ob" id="brackets" style="width:560px;height:200px"><svg width="560" height="200" viewBox="0 0 560 200" fill="none" stroke="#F4F5F8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 56V6h50M504 6h50v50M554 144v50h-50M56 194H6v-50"/></svg></div>')
h.append('<div class="ob" id="strike" style="width:300px;height:14px;border-radius:7px;background:#E8604C"></div>')
h.append('<div class="ob" id="glow" style="width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle,rgba(201,211,222,.85) 0%,rgba(159,179,200,.28) 32%,rgba(159,179,200,0) 68%)"></div>')
h.append('<div class="ob" id="bokeh" style="width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.5) 0%,rgba(255,255,255,.12) 46%,rgba(255,255,255,0) 70%)"></div>')
h.append('<div class="ob" id="sweep" style="width:500px;height:2400px;background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.55) 42%,rgba(255,255,255,.95) 50%,rgba(255,255,255,.55) 58%,rgba(255,255,255,0) 100%)"></div>')
h.append('<div class="ob" id="cta" style="padding:22px 46px;border-radius:60px;background:#F4F5F8;font:700 44px MR;letter-spacing:.02em;color:#102A43">agrefining.com</div>')
h.append('<div class="ob" id="mark" style="width:300px;height:300px;border-radius:70px;background:url(src/agmark.png) center/cover,#102a43;box-shadow:0 0 0 2px rgba(255,255,255,.25)"></div>')
h.append('<div class="ob" id="wordmark" style="font-family:MR;font-size:150px;letter-spacing:-0.035em;color:#F4F5F8;white-space:nowrap;padding:10px 20px"><span style="font-weight:800">AG</span><span style="font-weight:400"> Refining</span></div>')
h.append('</body></html>')
open('assets.html', 'w').write('\n'.join(h)); json.dump(LINES, open('lines.json', 'w'))
print(len(LINES), 'lines')
