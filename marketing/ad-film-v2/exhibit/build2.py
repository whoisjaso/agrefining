# build2.py : AG Refining "Exhibit A / Exhibit B" (Blender 4.5, Cycles).  blender -b -P build2.py -- OUT.blend [--quick] [--nomb]
# Two facts, placed next to each other. The film never connects them; the viewer does.
import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib_part.py')).read())

T = dict(flip=(3.0, 3.55), cutB=6.0, pull=(8.55, 10.4), lock=10.8)
D0 = Vector((0, 300, 0))                                    # the kitchen drawer lives far from the studio

# ═════════ materials ═════════
def tarnished(name):
    m, nt, out = mat_new(name)
    p = nt.nodes.new('ShaderNodeBsdfPrincipled'); p.inputs['Metallic'].default_value = 1.0
    uvn = nt.nodes.new('ShaderNodeUVMap')
    # patchy tarnish: warm grey-brown film in the low spots and along the edges, cleaner on the high points
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.5; nz.inputs['Detail'].default_value = 9; nz.inputs['Roughness'].default_value = 0.62
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].position = 0.38; cr.color_ramp.elements[1].position = 0.66
    nt.links.new(nz.outputs[0], cr.inputs[0])
    mixc = nt.nodes.new('ShaderNodeMix'); mixc.data_type = 'RGBA'
    mixc.inputs[6].default_value = (0.47, 0.40, 0.31, 1); mixc.inputs[7].default_value = (0.90, 0.885, 0.86, 1)
    nt.links.new(cr.outputs[0], mixc.inputs[0]); nt.links.new(mixc.outputs[2], p.inputs['Base Color'])
    rr = nt.nodes.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = 0.42; rr.inputs['To Max'].default_value = 0.16
    nt.links.new(cr.outputs[0], rr.inputs['Value']); nt.links.new(rr.outputs[0], p.inputs['Roughness'])
    # fine wear: hairline scratches
    sc_ = nt.nodes.new('ShaderNodeTexNoise'); sc_.inputs['Scale'].default_value = 400; sc_.inputs['Detail'].default_value = 3
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 18, 1); nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs[0], sc_.inputs['Vector'])
    b1 = nt.nodes.new('ShaderNodeBump'); b1.inputs['Strength'].default_value = 0.05; b1.inputs['Distance'].default_value = 0.002; nt.links.new(sc_.outputs[0], b1.inputs['Height'])
    # the hallmark, only on the underside (object-space normal pointing down)
    hm = nt.nodes.new('ShaderNodeTexImage'); hm.image = bpy.data.images.load(os.path.join(MAPS, 'hallmark.png')); hm.image.colorspace_settings.name = 'Non-Color'; hm.interpolation = 'Cubic'
    nt.links.new(uvn.outputs[0], hm.inputs[0])
    geo = nt.nodes.new('ShaderNodeNewGeometry'); vt = nt.nodes.new('ShaderNodeVectorTransform'); vt.vector_type = 'NORMAL'; vt.convert_from = 'WORLD'; vt.convert_to = 'OBJECT'
    nt.links.new(geo.outputs['Normal'], vt.inputs[0]); sz = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(vt.outputs[0], sz.inputs[0])
    lt = nt.nodes.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'; lt.inputs[1].default_value = -0.3; nt.links.new(sz.outputs['Z'], lt.inputs[0])
    mk = nt.nodes.new('ShaderNodeMath'); mk.operation = 'MULTIPLY'; nt.links.new(hm.outputs[0], mk.inputs[0]); nt.links.new(lt.outputs[0], mk.inputs[1])
    inv = nt.nodes.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0; nt.links.new(mk.outputs[0], inv.inputs[1])
    b2 = nt.nodes.new('ShaderNodeBump'); b2.inputs['Strength'].default_value = 1.0; b2.inputs['Distance'].default_value = 0.012
    nt.links.new(inv.outputs[0], b2.inputs['Height']); nt.links.new(b1.outputs[0], b2.inputs['Normal']); nt.links.new(b2.outputs[0], p.inputs['Normal'])
    # tarnish collects in the punched letters
    dk = nt.nodes.new('ShaderNodeMix'); dk.data_type = 'RGBA'; dk.inputs[7].default_value = (0.2, 0.17, 0.13, 1)
    nt.links.new(mk.outputs[0], dk.inputs[0]); nt.links.new(mixc.outputs[2], dk.inputs[6]); nt.links.new(dk.outputs[2], p.inputs['Base Color'])
    nt.links.new(p.outputs[0], out.inputs[0]); return m
def plain(name, color, rough=0.5, metal=0.0, coat=0.0):
    m, nt, out = mat_new(name); p = nt.nodes.new('ShaderNodeBsdfPrincipled')
    p.inputs['Base Color'].default_value = (*color, 1); p.inputs['Roughness'].default_value = rough; p.inputs['Metallic'].default_value = metal; p.inputs['Coat Weight'].default_value = coat
    nt.links.new(p.outputs[0], out.inputs[0]); return m
def wood(name):
    m, nt, out = mat_new(name); p = nt.nodes.new('ShaderNodeBsdfPrincipled'); tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.4, 6, 0.4); nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    wv = nt.nodes.new('ShaderNodeTexWave'); wv.inputs['Scale'].default_value = 3; wv.inputs['Distortion'].default_value = 7; wv.inputs['Detail'].default_value = 6
    nt.links.new(mp.outputs[0], wv.inputs['Vector'])
    cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (0.33, 0.2, 0.1, 1); cr.color_ramp.elements[1].color = (0.56, 0.38, 0.22, 1)
    nt.links.new(wv.outputs[1], cr.inputs[0]); nt.links.new(cr.outputs[0], p.inputs['Base Color']); p.inputs['Roughness'].default_value = 0.45; p.inputs['Coat Weight'].default_value = 0.3
    nt.links.new(p.outputs[0], out.inputs[0]); return m
def liner(name):   # a speckled shelf liner: the most ordinary surface in the house
    m, nt, out = mat_new(name); p = nt.nodes.new('ShaderNodeBsdfPrincipled'); tc = nt.nodes.new('ShaderNodeTexCoord')
    vo = nt.nodes.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 26; nt.links.new(tc.outputs['Object'], vo.inputs['Vector'])
    cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].position = 0.06; cr.color_ramp.elements[0].color = (0.33, 0.32, 0.3, 1); cr.color_ramp.elements[1].position = 0.12; cr.color_ramp.elements[1].color = (0.55, 0.54, 0.51, 1)
    nt.links.new(vo.outputs['Distance'], cr.inputs[0]); nt.links.new(cr.outputs[0], p.inputs['Base Color']); p.inputs['Roughness'].default_value = 0.85
    nt.links.new(p.outputs[0], out.inputs[0]); return m

# ═════════ Exhibit A: the kitchen drawer ═════════
def box(name, size, loc, mat, bevel=0.02):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.active_object; o.name = name; o.scale = size
    bv = o.modifiers.new('bv', 'BEVEL'); bv.width = bevel; bv.segments = 3
    o.data.materials.append(mat); return o
WD, LN = wood('woodM'), liner('linerM')
DW, DL, DH, TH = 6.6, 9.8, 1.5, 0.22
box('drawerBottom', (DW, DL, 0.1), D0 + Vector((0, 0, -0.05)), LN, 0.005)
box('drawerL', (TH, DL + 2 * TH, DH), D0 + Vector((-DW / 2 - TH / 2, 0, DH / 2 - 0.1)), WD)
box('drawerR', (TH, DL + 2 * TH, DH), D0 + Vector((DW / 2 + TH / 2, 0, DH / 2 - 0.1)), WD)
box('drawerF', (DW, TH, DH), D0 + Vector((0, -DL / 2 - TH / 2, DH / 2 - 0.1)), WD)
box('drawerB', (DW, TH, DH), D0 + Vector((0, DL / 2 + TH / 2, DH / 2 - 0.1)), WD)
box('counter', (40, 40, 0.3), D0 + Vector((0, 0, -0.3)), plain('floorDark', (0.05, 0.045, 0.04), 0.6), 0.0)
# clutter
def cyl(name, r, h, loc, rot, mat, verts=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc, rotation=rot); o = bpy.context.active_object; o.name = name
    bv = o.modifiers.new('bv', 'BEVEL'); bv.width = min(r, h) * 0.15; bv.segments = 3
    for p in o.data.polygons: p.use_smooth = True
    o.data.materials.append(mat); return o
BAT, CU, BR, YEL, RB1, RB2, COPPER, NICKEL = (plain('batBody', (0.02, 0.02, 0.022), 0.35, 0, 0.6), plain('batTop', (0.75, 0.42, 0.18), 0.3, 1.0),
    plain('brass', (0.78, 0.6, 0.32), 0.28, 1.0), plain('pencil', (0.85, 0.62, 0.08), 0.4, 0, 0.4), plain('band1', (0.66, 0.48, 0.3), 0.6), plain('band2', (0.62, 0.12, 0.08), 0.55),
    plain('copper', (0.72, 0.4, 0.26), 0.35, 1.0), plain('nickel', (0.74, 0.73, 0.71), 0.32, 1.0))
for i, (x, y, a) in enumerate([(-2.2, 2.6, 0.3), (-1.85, 2.95, 0.25)]):
    cyl(f'battery{i}', 0.17, 1.0, D0 + Vector((x, y, 0.17)), (0, math.pi / 2, a), BAT)
    cyl(f'batCap{i}', 0.172, 0.18, D0 + Vector((x + 0.5 * math.cos(a), y + 0.5 * math.sin(a), 0.17)), (0, math.pi / 2, a), CU)
for i, (x, y, mt) in enumerate([(2.1, -2.4, RB1), (2.35, -2.2, RB2), (-2.3, -3.4, RB1)]):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.42, minor_radius=0.03, major_segments=96, minor_segments=10, location=D0 + Vector((x, y, 0.03)))
    o = bpy.context.active_object; o.scale = (1.15, 0.75, 0.5); o.rotation_euler = (0, 0, i * 0.9); o.data.materials.append(mt)
    for p in o.data.polygons: p.use_smooth = True
# key: bow + blade
cyl('keyBow', 0.36, 0.06, D0 + Vector((2.0, 2.9, 0.04)), (0, 0, 0), BR, 64)
box('keyBlade', (1.3, 0.22, 0.05), D0 + Vector((2.0 - 0.95 * math.cos(0.6), 2.9 - 0.95 * math.sin(0.6), 0.035)), BR, 0.01).rotation_euler = (0, 0, 0.6)
# pencil
pc = cyl('pencil', 0.11, 3.4, D0 + Vector((-2.4, -0.4, 0.11)), (math.pi / 2, 0, 0.12), YEL, 6)
# coins: pennies and two worn silver-coloured coins (one of them old enough to be silver: the third clue, never named)
for i, (x, y, r, mt) in enumerate([(1.4, 0.9, 0.29, COPPER), (1.85, 1.25, 0.29, COPPER), (2.3, 0.6, 0.36, NICKEL), (1.65, 0.3, 0.36, NICKEL)]):
    cyl(f'coin{i}', r, 0.055, D0 + Vector((x, y, 0.028 + 0.002 * i)), (0.02 * i, 0, 0), mt, 64)
# the spoon (tarnished), lying diagonally in the clutter
SPM = tarnished('spoonTarnish')
spoon = spoon_mesh(); spoon.data.materials.append(SPM)
SP_S = 0.78; SP_ROT = math.radians(28); SP_AT = D0 + Vector((0.1, -0.4, 0.0))
# warm, flat kitchen light: a big soft source overhead and a dim bounce
bpy.ops.object.light_add(type='AREA', location=D0 + Vector((1.5, -3, 9))); kl = bpy.context.active_object; kl.data.size = 7; kl.data.energy = 1700; kl.data.color = (1.0, 0.86, 0.7)
kl.rotation_euler = (math.radians(18), math.radians(8), 0)
bpy.ops.object.light_add(type='AREA', location=D0 + Vector((-6, 4, 5))); fl2 = bpy.context.active_object; fl2.data.size = 6; fl2.data.energy = 700; fl2.data.color = (0.8, 0.86, 1.0)
fl2.rotation_euler = (math.radians(-40), math.radians(-45), 0)

# ═════════ Exhibit B: the bar, in the studio ═════════
bar = rounded_box('bullion', (2.2, 1.14, 0.44), n=200, e=0.12, stamp='bullion_stamp', relief=0.014, subsurf=2)
bar.data.materials.append(stamp_material('bullionM', 'bullion_stamp', 0.07, 0.36))
bar.location = (0, 0, 0.22)
spoon2 = bpy.data.objects.new('spoonStudio', spoon.data); link(spoon2)
for md in spoon.modifiers:
    n2 = spoon2.modifiers.new(md.name, md.type)
    for k in ('thickness', 'offset', 'use_even_offset', 'use_rim', 'levels', 'render_levels'):
        if hasattr(md, k): setattr(n2, k, getattr(md, k))
spoon2.scale = (SP_S,) * 3; spoon2.rotation_euler = (0, 0, math.radians(62)); spoon2.location = (-2.15, -0.75, 0.0)

# ═════════ the spoon's flip (Exhibit A) ═════════
def spoon_world(t):
    k = seg(t, *T['flip']); ek = E['cubicIO'](k)
    lift = 0.55 * math.sin(math.pi * k)
    land = t - T['flip'][1]; bounce = 0.05 * abs(math.sin(land * 22)) * math.exp(-land * 9) if land > 0 else 0
    R = Matrix.Rotation(SP_ROT, 4, 'Z') @ Matrix.Rotation(math.pi * ek, 4, 'X')
    # turning over about its length: the spoon's thickness is ~0.5 at the bowl, keep it resting on the liner both ways up
    z = 0.06 + lift + bounce + (0.42 * SP_S if ek > 0.5 else 0) * sst(clamp((ek - 0.5) * 4))
    return Matrix.Translation(SP_AT + Vector((0, 0, z))) @ R @ Matrix.Diagonal(Vector((SP_S, SP_S, SP_S, 1)))
HALL_LOCAL = Vector((0.865 * 5.6 - 0.42 * 5.6, 0.0, 0.5 - 0.16 * math.sin(((0.865 - 0.47) / 0.53) * math.pi * 0.9) + 0.05 * ((0.865 - 0.47) / 0.53) - 0.03))

# ═════════ cameras: A (drawer), B (studio), cut on a marker at 6.0 s ═════════
def make_cam(name):
    cd = bpy.data.cameras.new(name); c = bpy.data.objects.new(name, cd); link(c)
    cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 24; cd.lens = 12 / math.tan(math.radians(17)); cd.clip_start = 0.02; cd.clip_end = 500
    tg = bpy.data.objects.new(name + 'Focus', None); link(tg)
    tr = c.constraints.new('TRACK_TO'); tr.target = tg; tr.track_axis = 'TRACK_NEGATIVE_Z'; tr.up_axis = 'UP_Y'
    cd.dof.use_dof = True; cd.dof.focus_object = tg; cd.dof.aperture_blades = 7
    return c, tg, cd
camA, tgA, cdA = make_cam('camA'); camB, tgB, cdB = make_cam('camB')
sc.camera = camA
mA = sc.timeline_markers.new('A', frame=1); mA.camera = camA
mB = sc.timeline_markers.new('B', frame=int(T['cutB'] * FPS) + 1); mB.camera = camB

def hand(t, amp=0.02):
    return Vector((amp * (math.sin(1.7 * t) + 0.6 * math.sin(2.9 * t + 1)), amp * (math.sin(1.3 * t + 2) + 0.5 * math.sin(3.3 * t)), 0))
def camA_at(t):
    if t < T['flip'][0]:
        k = E['sineIO'](seg(t, 0, 3.0))
        eye = D0 + Vector((lerp(0.5, 0.35, k), lerp(-3.2, -2.2, k), lerp(16.5, 11.5, k))); at = D0 + Vector((lerp(0.1, 0.2, k), lerp(-0.2, -0.4, k), 0.2))
        return eye + hand(t, 0.03), at, lerp(2.2, 1.8, k)
    # dive to the mark: the hallmark is where the camera lands, from the side, the spoon's length left-right
    H = spoon_world(max(t, T['flip'][1] + 0.4)) @ HALL_LOCAL
    axis = Vector((math.cos(SP_ROT), math.sin(SP_ROT), 0)); side = Vector((-axis.y, axis.x, 0))
    k = E['quintIO'](seg(t, T['flip'][0] + 0.15, 4.75)); push = E['sineIO'](seg(t, 4.75, T['cutB']))
    dist = lerp(1.32, 1.12, push); el = math.radians(lerp(58, 52, push))
    macro_eye = H - side * dist * math.cos(el) + Vector((0, 0, dist * math.sin(el)))
    e0 = D0 + Vector((0.35, -2.2, 11.5)); a0 = D0 + Vector((0.2, -0.4, 0.2))
    eye = e0.lerp(macro_eye, k) + Vector((0, 0, 1.6 * math.sin(math.pi * k)))
    return eye + hand(t, 0.006 * (1 - push)), a0.lerp(H, E['cubicIO'](seg(t, T['flip'][0] + 0.1, 4.6))), lerp(1.8, 0.55, k)
P999 = Vector((0, (0.27 - 0.5) * 1.14, 0.44)); AIM999 = P999 + Vector((0, -0.075, 0))
def camB_at(t):
    k = E['sineIO'](seg(t, T['cutB'], T['pull'][0])); dist = lerp(1.22, 1.04, k); el = math.radians(lerp(52, 50, k))
    macro_eye = AIM999 + Vector((0, -dist * math.cos(el), dist * math.sin(el)))
    wide_eye = Vector((0.2, -13.4, 7.6)); wide_at = Vector((-1.0, 0.0, 0.55))
    j = E['cubicIO'](seg(t, *T['pull']))
    eye = macro_eye.lerp(wide_eye, j); at = AIM999.lerp(wide_at, j)
    return eye + hand(t, 0.004 * (1 - j)), at, lerp(0.55, 1.6, j)

# ═════════ key every frame ═════════
FRAMES = range(1, NF + 1)
if '--frames' in argv: FRAMES = [int(x) for x in argv[argv.index('--frames') + 1].split(',')]
SW_IN = None
nt_sw = S['W'][1].node_tree; em = [n for n in nt_sw.nodes if n.type == 'EMISSION'][0]; SW_IN = nt_sw.nodes[em['strength_node']].inputs[1]
for f in FRAMES:
    t = (f - 1) / FPS
    spoon.matrix_world = spoon_world(t); spoon.keyframe_insert('location', frame=f); spoon.keyframe_insert('rotation_euler', frame=f); spoon.keyframe_insert('scale', frame=f)
    e, a, fs = camA_at(t); camA.location = e; tgA.location = a; cdA.dof.aperture_fstop = fs
    camA.keyframe_insert('location', frame=f); tgA.keyframe_insert('location', frame=f); cdA.dof.keyframe_insert('aperture_fstop', frame=f)
    e, a, fs = camB_at(t); camB.location = e; tgB.location = a; cdB.dof.aperture_fstop = fs
    camB.keyframe_insert('location', frame=f); tgB.keyframe_insert('location', frame=f); cdB.dof.keyframe_insert('aperture_fstop', frame=f)
    # one strip of light glides across the 999 just after the cut
    sw = math.exp(-((t - 6.75) / 0.38) ** 2); so = S['W'][0]
    sa = lerp(-0.9, 0.9, seg(t, 6.3, 7.2)); so.location = Vector((math.sin(sa) * 14, -math.cos(sa) * 14, 8)); so.rotation_euler = (Vector((0, 0, 0.3)) - so.location).normalized().to_track_quat('-Z', 'Y').to_euler()
    so.keyframe_insert('location', frame=f); so.keyframe_insert('rotation_euler', frame=f)
    SW_IN.default_value = 22 * sw if sw > 0.004 else 0.0; SW_IN.keyframe_insert('default_value', frame=f)

bpy.ops.wm.save_as_mainfile(filepath=OUT)
print('saved', OUT)
