# mix.py : sound for "Silver drawer" by the video-editing-standard rules.
#   font signatures (Manrope = SIG-GEO: clean whoosh + click per unit; Termes lead-ins = SIG-SOFTSERIF pluck), hit on the
#   visual peak, whoosh PEAK on the cut, captions silent, exits silent, gains from the processed segment peak, SFX bus
#   sidechain-ducked by the voice (thr -20 dBFS, ratio 2, 5/120 ms) + -3 dB bell at 2.5 kHz, no-music master -14 LUFS,
#   TP <= -4 dBTP. Writes the cue sheet (cuesheet/v1) for tools/lint_cuesheet.py.
# Sound sources: the cleared Subhan/Ahmad packs are not in the repo (not redistributable), so posted-lane tiers 2-3 are
# used: Kenney CC0 (click, pop, impact) and synthesized originals (whoosh, riser, shimmer, sub, room tone).
import json, os, subprocess, sys, numpy as np, soundfile as sf
SR = 48000
STD = '/home/user/video-editing-standard'; sys.path.insert(0, STD + '/tools'); import sfx_meta
LIB = os.path.abspath('../sfx-library')
E = json.load(open('events.json')); LEN = E['len']; N = int(LEN * SR)
VW = E['vo_words']
FONT = {'hook': 'Manrope', 'hero': 'Manrope', 'number': 'Manrope', 'emphasis': 'Manrope', 'caption': 'Manrope', 'cta': 'Manrope', 'leadin': 'TeX Gyre Termes'}
WEIGHT = {'hook': 800, 'hero': 800, 'number': 800, 'emphasis': 800, 'caption': 700, 'cta': 700, 'leadin': 400}
SIZE = {'hook_q': 160, 'l1_lead': 62, 'l1_hero': 150, 'l1_lead2': 62, 'l2_lead': 66, 'l2_hero': 230, 'l2_lead2': 62, 'l2_emph': 62, 'l3_lead': 62,
        'l3_hero': 150, 'l4_hero': 230, 'l4_lead': 66, 'l5_lead': 62, 'l5_hero': 230, 'l6_num': 200, 'l6_lead': 62, 'l6_hero': 190, 'l7_lead': 66,
        'l7_lead2': 66, 'l7_hero': 170, 'cap1': 60, 'cap2': 60, 'cap3': 60, 'cap4': 60, 'end_lead': 66, 'cta': 44}
PLUCK_LEADINS = {'l2_lead2', 'l4_lead', 'end_lead', 'l7_lead', 'l7_lead2'}
CUTS = [5.9 + 0.09, 9.2, 11.55 + 0.09, 19.62, 22.6, 30.0]

F = {'whoosh': 'synth/orig_whoosh_clean.wav', 'soft': 'synth/orig_whoosh_soft.wav', 'whip': 'synth/orig_whoosh_whip.wav',
     'click': 'kenney/toggle_004.wav', 'pop': 'kenney/switch24.wav', 'riser': 'synth/orig_riser_14.wav', 'shimmer': 'synth/orig_shimmer_glint.wav',
     'impact': 'kenney/impactPunch_heavy_001.wav', 'sub': 'synth/orig_sub_boom.wav', 'room': 'synth/orig_roomtone.wav'}
META = {k: sfx_meta.measure(os.path.join(LIB, v)) for k, v in F.items()}
def load(k):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(LIB, F[k]), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)
AUD = {k: load(k) for k in F}

vo, _ = sf.read('../v2/vo.wav', dtype='float64'); vo = vo if vo.ndim == 2 else np.stack([vo, vo], 1)
vo = np.pad(vo, ((0, max(0, N - len(vo))), (0, 0)))[:N]
VO_PEAK = 20 * np.log10(np.abs(vo).max())
sfx = np.zeros((N, 2)); cues = []

def cue(kind, hit_t, rel_db, family, pairs, text_id=None, unit=None, sig=None, layer=None, anchor='peak'):
    """place file `kind` so its anchor (measured peak, or its end for risers) lands on hit_t, gained rel to the VO peak"""
    m = META[kind]; a = m['end_s'] if anchor == 'end' else m['peak_s']
    t = hit_t - a; x = AUD[kind]; seg = None
    if t < 0: seg = [round(-t, 4), m['dur_s']]; x = x[int(-t * SR):]; a = a + t; t = 0.0   # head trimmed at frame 0: anchor moves with it
    g = rel_db + VO_PEAK - m['peak_dbfs']
    s = int(t * SR); e = min(N, s + len(x)); sfx[s:e] += x[:e - s] * 10 ** (g / 20)
    c = dict(t=round(t, 4), file=F[kind], family=family, gain_db=round(g, 2), rel_vo_db=rel_db, pairs=pairs, hit_t=round(hit_t, 4),
             anchor_s=round(a, 4), seg_peak_dbfs=m['peak_dbfs'])
    if seg: c['seg_s'] = seg
    if text_id is not None: c.update(text_id=text_id, unit=unit, anchor='sig', signature=sig, layer=layer)
    cues.append(c)

text_rows = []
for ev in E['text']:
    role = ev['role']; sig = 'SIG-SOFTSERIF' if FONT[role] == 'TeX Gyre Termes' else 'SIG-GEO'
    silent = ev['silent'] or role in ('caption', 'emphasis') or (role == 'leadin' and ev['id'] not in PLUCK_LEADINS)
    reason = ev['silent_reason'] or ('caption riding the voice: silent' if role == 'caption' else
                                     'emphasis under VO: silence (role default)' if role == 'emphasis' else
                                     'lead-in under VO: silence allowed (font-sound-signatures.md soft_roles); the paired hero carries the signature' if role == 'leadin' else '')
    row = dict(id=ev['id'], role=role, text=ev['text'], font=FONT[role], style='normal', weight=WEIGHT[role], size_px=SIZE[ev['id']],
               preset=ev['preset'], t_in=ev['t_in'], t_out=ev['t_out'], units=ev['units'], peaks=ev['peaks'],
               signature=None if silent else sig, silent=silent, silent_reason=reason if silent else '')
    text_rows.append(row)
    if silent: continue
    if role in ('hook', 'hero', 'number'):
        cut = max([c for c in CUTS if 0 <= ev['t_in'] - c <= 0.35], default=None)
        cue('whoosh', cut if cut is not None else ev['peaks'][0], -16, 'whoosh', 'cut' if cut is not None else ev['id'],
            ev['id'], 0, 'SIG-GEO', 'whoosh_in')
        for i, pk in enumerate(ev['peaks']):
            cue('click', pk, -18, 'click', ev['id'], ev['id'], i, 'SIG-GEO', 'click')
    elif role == 'leadin':
        for i, pk in enumerate(ev['peaks']):
            cue('pop', pk, -20, 'pop', ev['id'], ev['id'], i, 'SIG-SOFTSERIF', 'pluck')
    elif role == 'cta':
        cue('pop', ev['peaks'][0], -16, 'pop', ev['id'], ev['id'], 0, None, 'pop')

for ob in E['obj']:
    k, t = ob['kind'], ob['t']
    if k == 'whip': cue('whip', t, -15, 'whoosh', 'cut')
    elif k == 'pop': cue('pop', t, -19, 'pop', 'object')
    elif k == 'slide': cue('soft', t, -18, 'whoosh', 'object')
    elif k == 'flip': cue('soft', t, -16, 'whoosh', 'object')
    elif k == 'push':   # build -> dropout -> hit: the riser ends ~100 ms before 925 lands
        n925 = next(r for r in text_rows if r['id'] == 'l6_num'); cue('riser', n925['peaks'][0] - 0.1, -17, 'riser', 'l6_num', anchor='end')
    elif k == 'glint': cue('shimmer', t, -19, 'shimmer', 'object')
    elif k == 'strike': cue('click', t, -19, 'click', 'object')
    elif k == 'snap':   # the one big hit of the piece: the two pieces meet
        cue('impact', t, -10, 'impact', 'object'); cue('sub', t + 0.005, -12, 'impact', 'object')
    elif k == 'logo': cue('shimmer', t, -21, 'shimmer', 'object')

# SFX bus: -3 dB bell at 2.5 kHz, then sidechain-ducked by the voice
sf.write('_sfx.wav', sfx.astype(np.float32), SR); sf.write('_vo.wav', vo.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '_sfx.wav', '-i', '_vo.wav', '-filter_complex',
                '[0:a]equalizer=f=2500:t=q:w=1.2:g=-3[s];[s][1:a]sidechaincompress=threshold=0.1:ratio=2:attack=5:release=120[d]',
                '-map', '[d]', '-c:a', 'pcm_f32le', '_sfx_duck.wav'], check=True)
sd, _ = sf.read('_sfx_duck.wav', dtype='float64'); sd = np.pad(sd, ((0, max(0, N - len(sd))), (0, 0)))[:N]
room = np.concatenate([AUD['room'], AUD['room'][::-1]])[:N] * 10 ** ((-72 - META['room']['rms50_dbfs']) / 20)       # never digital zero (silence beat sits on room tone)
win = np.zeros(N); a0, a1 = int(27.2 * SR), int(28.4 * SR); win[a0:a1] = 1          # room tone only under the silent beat
k = int(0.25 * SR); win = np.convolve(win, np.ones(k) / k, 'same')
mixd = vo + sd + room * win[:, None]
sf.write('_mix.wav', mixd.astype(np.float32), SR)
def master(src, dst, tp):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f'loudnorm=I=-14:TP={tp}:LRA=7,aresample=48000,alimiter=limit={10 ** ((tp - 0.3) / 20):.3f}:attack=1:release=60:level=false',
                    '-ar', '48000', '-c:a', 'pcm_s24le', dst], check=True)
master('_mix.wav', 'master_nomusic.wav', -4.5)
master('_vo.wav', 'voice_only_master.wav', -4.5)
sheet = {'schema': 'cuesheet/v1', 'title': 'AG Refining "Silver drawer" v2 (organic short, Kokoro am_michael 0.5 + am_echo 0.5 directed read)',
         'style': ['liquid-motion', 'kinetic-captions'], 'brand': 'agrefining', 'voice': True, 'lane': 'posted', 'posted': True, 'fps': 60,
         'duration': LEN, 'cuts': CUTS, 'voice_words': VW, 'voice_peak_dbfs': round(float(VO_PEAK), 2), 'text': text_rows, 'sfx': cues,
         'music': {'mode': 'none in master', 'in_app_suggestion': 'storytelling lane (docs/music/song-library.md), e.g. SONG-TYSMUSIC-AS-TIME-FLIES (artist likely), voice 100% / music 10-15%', 'fallback': 'any calm piano from the account picker, business-cleared'}}
json.dump(sheet, open('cuesheet.json', 'w'), indent=1)
print('cues', len(cues), 'vo_peak', round(float(VO_PEAK), 2))
