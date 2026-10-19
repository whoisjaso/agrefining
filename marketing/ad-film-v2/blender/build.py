# build.py : AG Refining "The silver inside" in Blender (Cycles).  blender -b -P build.py -- OUT.blend [--quick]
# Everything animated is evaluated from one timeline (the same constants as the score) and keyed on every frame.
import bpy, bmesh, math, sys, os, json
from mathutils import Vector, Matrix, Euler, Quaternion
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/ag.blend'
HERE = os.path.dirname(os.path.abspath(__file__)); MAPS = os.path.join(HERE, 'maps')
FPS = 24; DUR = 15.0; NF = int(DUR * FPS)

# ═════════ timeline (seconds) ═════════
T = dict(slap=2.40, drops=[3.18, 3.52, 3.70, 4.26], heat=(4.80, 5.45), melt=(5.40, 7.15), rise=(7.35, 8.55), strike=9.30, sweep=11.0, lock=12.55)
clamp = lambda x, a=0.0, b=1.0: max(a, min(b, x))
lerp = lambda a, b, k: a + (b - a) * k
seg = lambda t, a, b: clamp((t - a) / (b - a))
sst = lambda k: k * k * (3 - 2 * k)
E = dict(
    sineIO=lambda k: 0.5 - 0.5 * math.cos(math.pi * k),
    cubicIO=lambda k: 4 * k ** 3 if k < 0.5 else 1 - (-2 * k + 2) ** 3 / 2,
    quintIO=lambda k: 16 * k ** 5 if k < 0.5 else 1 - (-2 * k + 2) ** 5 / 2,
    out=lambda k: 1 - (1 - k) ** 3, outQ=lambda k: 1 - (1 - k) ** 5, inn=lambda k: k ** 3)
def shake(t, th, amp, decay=10, freq=19, seed=1.0):
    d = t - th
    if d < 0 or d > 1.2: return (0.0, 0.0)
    e = amp * math.exp(-decay * d)
    return (e * math.sin(freq * d * 6.283 + seed), e * math.sin(freq * 0.83 * d * 6.283 + seed * 2.1))

# three.js world (y up) -> Blender (z up)
M3 = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
V = lambda x, y, z: Vector((x, -z, y))
def world3(loc, rot3=Matrix.Identity(3), scl=(1, 1, 1)):
    """object matrix authored in three.js space -> Blender world matrix"""
    S = Matrix.Diagonal(Vector((scl[0], scl[1], scl[2], 1)))
    W = Matrix.Translation(Vector(loc)) @ rot3.to_4x4() @ S
    return M3 @ W @ M3.inverted()

# ═════════ scene ═════════
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene
bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'
sc.render.engine = 'CYCLES'; cy = sc.cycles
cy.device = 'CPU'; cy.samples = 28; cy.adaptive_threshold = 0.03; cy.adaptive_min_samples = 8; cy.use_denoising = True; cy.denoiser = 'OPENIMAGEDENOISE'
cy.max_bounces = 5; cy.glossy_bounces = 4; cy.diffuse_bounces = 1; cy.transmission_bounces = 0; cy.transparent_max_bounces = 2
cy.caustics_reflective = False; cy.caustics_refractive = False; cy.sample_clamp_indirect = 4.0; cy.blur_glossy = 0.4
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 720, 1280, 100
sc.render.fps = FPS; sc.frame_start = 1; sc.frame_end = NF
sc.render.use_motion_blur = '--nomb' not in argv; sc.render.motion_blur_shutter = 0.45
sc.render.film_transparent = False
try: sc.view_settings.view_transform = 'Khronos PBR Neutral'
except Exception: sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'None'; sc.view_settings.exposure = 0.15
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_depth = '8'
cy.use_animated_seed = True

# world: dark gradient dome with a faint cool horizon band (for the chrome to reflect)
w = bpy.data.worlds.new('Studio'); sc.world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); ramp = nt.nodes.new('ShaderNodeValToRGB')
bg = nt.nodes.new('ShaderNodeBackground'); outw = nt.nodes.new('ShaderNodeOutputWorld'); lp = nt.nodes.new('ShaderNodeLightPath'); mixw = nt.nodes.new('ShaderNodeMixShader'); bk = nt.nodes.new('ShaderNodeBackground')
nt.links.new(tc.outputs['Generated'], sep.inputs[0]); nt.links.new(sep.outputs['Z'], ramp.inputs[0])
cr = ramp.color_ramp; cr.elements[0].position = 0.42; cr.elements[0].color = (0.004, 0.004, 0.005, 1); cr.elements[1].position = 0.98; cr.elements[1].color = (0.11, 0.115, 0.12, 1)
e = cr.elements.new(0.52); e.color = (0.03, 0.04, 0.055, 1)
nt.links.new(ramp.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = 1.0
bk.inputs[0].default_value = (0, 0, 0, 1)
nt.links.new(lp.outputs['Is Camera Ray'], mixw.inputs[0]); nt.links.new(bg.outputs[0], mixw.inputs[1]); nt.links.new(bk.outputs[0], mixw.inputs[2])
nt.links.new(mixw.outputs[0], outw.inputs[0])

def link(o):
    sc.collection.objects.link(o); return o

# ═════════ materials ═════════
def mat_new(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    return m, nt, nt.nodes.new('ShaderNodeOutputMaterial')
HEAT_MATS = []
def silver(name, rough=0.12, rough_tex=None, bump_tex=None, bump_strength=0.4, uv='UV', aniso=0.0, heat=True):
    m, nt, out = mat_new(name)
    p = nt.nodes.new('ShaderNodeBsdfPrincipled'); p.inputs['Metallic'].default_value = 1.0
    p.inputs['Base Color'].default_value = (0.962, 0.955, 0.945, 1); p.inputs['Roughness'].default_value = rough
    p.inputs['Anisotropic'].default_value = aniso
    # silver's own tint: a whisper of warmth at grazing angles
    p.inputs['Specular Tint'].default_value = (0.99, 0.975, 0.95, 1)
    uvn = nt.nodes.new('ShaderNodeUVMap') if uv == 'UV' else None
    if rough_tex:
        it = nt.nodes.new('ShaderNodeTexImage'); it.image = bpy.data.images.load(os.path.join(MAPS, rough_tex)); it.image.colorspace_settings.name = 'Non-Color'
        if uvn: nt.links.new(uvn.outputs[0], it.inputs[0])
        nt.links.new(it.outputs[0], p.inputs['Roughness'])
    # micro surface: very fine scratches/noise so mirrors read as metal, not CG
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 900; nz.inputs['Detail'].default_value = 4
    bmp = nt.nodes.new('ShaderNodeBump'); bmp.inputs['Strength'].default_value = 0.015; bmp.inputs['Distance'].default_value = 0.002
    nt.links.new(nz.outputs[0], bmp.inputs['Height'])
    if bump_tex:
        bi = nt.nodes.new('ShaderNodeTexImage'); bi.image = bpy.data.images.load(os.path.join(MAPS, bump_tex)); bi.image.colorspace_settings.name = 'Non-Color'
        if uvn: nt.links.new(uvn.outputs[0], bi.inputs[0])
        b2 = nt.nodes.new('ShaderNodeBump'); b2.inputs['Strength'].default_value = bump_strength; b2.inputs['Distance'].default_value = 0.01
        nt.links.new(bi.outputs[0], b2.inputs['Height']); nt.links.new(bmp.outputs[0], b2.inputs['Normal']); nt.links.new(b2.outputs[0], p.inputs['Normal'])
    else:
        nt.links.new(bmp.outputs[0], p.inputs['Normal'])
    if heat:
        p.inputs['Emission Color'].default_value = (1.0, 0.33, 0.07, 1); p.inputs['Emission Strength'].default_value = 0.0
        HEAT_MATS.append(p)
    nt.links.new(p.outputs[0], out.inputs[0])
    return m, p

def emissive(name, color=(1, 1, 1), strength=10.0, soft=True):
    m, nt, out = mat_new(name)
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs[0].default_value = (*color, 1); em.inputs[1].default_value = strength
    if soft:   # soft edges: the strip falls off toward its border like a diffused softbox
        tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['UV'], sep.inputs[0])
        def edge(ch):
            mr = nt.nodes.new('ShaderNodeMath'); mr.operation = 'PINGPONG'; mr.inputs[1].default_value = 0.5; nt.links.new(sep.outputs[ch], mr.inputs[0])
            sm = nt.nodes.new('ShaderNodeMapRange'); sm.interpolation_type = 'SMOOTHSTEP'; sm.inputs['From Min'].default_value = 0.0; sm.inputs['From Max'].default_value = 0.16
            nt.links.new(mr.outputs[0], sm.inputs['Value']); return sm
        a, b = edge('X'), edge('Y'); mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
        nt.links.new(a.outputs[0], mul.inputs[0]); nt.links.new(b.outputs[0], mul.inputs[1])
        mm = nt.nodes.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; mm.inputs[1].default_value = strength; nt.links.new(mul.outputs[0], mm.inputs[0])
        nt.links.new(mm.outputs[0], em.inputs[1]); em['strength_node'] = mm.name
    nt.links.new(em.outputs[0], out.inputs[0])
    return m

# ═════════ studio: strip lights (seen only by reflections) ═════════
def strip(name, w, h, loc3, look3=(0, 1, 0), strength=8.0, color=(1, 1, 1)):
    bpy.ops.mesh.primitive_plane_add(size=1); o = bpy.context.active_object; o.name = name
    o.scale = (w, h, 1); o.location = V(*loc3)
    d = (V(*look3) - o.location).normalized(); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    m = emissive(name + 'M', color, strength); o.data.materials.append(m)
    o.visible_camera = False; o.visible_shadow = False
    return o, m
S = {}
S['L'] = strip('stripL', 4, 26, (-13, 6, -6), (0, 2, 0), 9)
S['R'] = strip('stripR', 4, 26, (13, 6, -4), (0, 2, 0), 7)
S['T'] = strip('softTop', 22, 10, (0, 18, 2), (0, 0, 0), 3.2)
S['K'] = strip('key', 9, 4, (-9, 12, 12), (0, 0, 0), 5)
S['B'] = strip('backCard', 34, 9, (0, 7, -22), (0, 0, 0), 3.0)
S['F'] = strip('frontCard', 36, 7, (0, 3, 26), (0, 1, 0), 1.4)
S['H'] = strip('horizon', 60, 1.6, (0, 2.5, -24), (0, 2.5, 0), 3.5)
S['A'] = strip('accent', 10, 10, (8, 3, 14), (0, 1, 0), 1.4, (0.33, 0.55, 0.85))
S['W'] = strip('sweep', 2.2, 34, (0, 4, 16), (0, 1, 0), 0.0)
# a gentle area light for the floor sheen and soft shadows under objects

# floor: black mirror that fades to black (no horizon line)
bpy.ops.mesh.primitive_plane_add(size=200); fl = bpy.context.active_object; fl.name = 'floor'
m, nt, out = mat_new('floorM')
p = nt.nodes.new('ShaderNodeBsdfPrincipled'); p.inputs['Base Color'].default_value = (0.004, 0.0042, 0.0046, 1); p.inputs['Roughness'].default_value = 0.07
p.inputs['IOR'].default_value = 1.6; p.inputs['Specular IOR Level'].default_value = 0.22
nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 6
rr = nt.nodes.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = 0.16; rr.inputs['To Max'].default_value = 0.28; nt.links.new(nz.outputs[0], rr.inputs['Value']); nt.links.new(rr.outputs[0], p.inputs['Roughness'])
dk = nt.nodes.new('ShaderNodeBsdfDiffuse'); dk.inputs[0].default_value = (0, 0, 0, 1)
tc = nt.nodes.new('ShaderNodeTexCoord'); vl = nt.nodes.new('ShaderNodeVectorMath'); vl.operation = 'LENGTH'; nt.links.new(tc.outputs['Object'], vl.inputs[0])
fr = nt.nodes.new('ShaderNodeMapRange'); fr.interpolation_type = 'SMOOTHSTEP'; fr.inputs['From Min'].default_value = 3; fr.inputs['From Max'].default_value = 9.5
nt.links.new(vl.outputs['Value'], fr.inputs['Value'])
mx = nt.nodes.new('ShaderNodeMixShader'); nt.links.new(fr.outputs[0], mx.inputs[0]); nt.links.new(p.outputs[0], mx.inputs[1]); nt.links.new(dk.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs[0])
fl.data.materials.append(m)

# ═════════ the coin ═════════
R_COIN, H_COIN, RELIEF = 1.6, 0.21, 0.026
def image_tex(name):
    tx = bpy.data.textures.new(name, 'IMAGE'); tx.image = bpy.data.images.load(os.path.join(MAPS, name + '.png')); tx.image.colorspace_settings.name = 'Non-Color'; tx.extension = 'EXTEND'; return tx
coin_h = image_tex('coin_height')
QUICK = '--quick' in argv
def coin_face(name, top=True, res=1200):
    if QUICK: res = 400
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=res, y_segments=res, size=R_COIN)
    kill = [f for f in bm.faces if all(v.co.xy.length > R_COIN + 1e-4 for v in f.verts)]
    bmesh.ops.delete(bm, geom=kill, context='FACES')
    loose = [v for v in bm.verts if not v.link_faces]; bmesh.ops.delete(bm, geom=loose, context='VERTS')
    for v in bm.verts:
        r = v.co.xy.length
        if r > R_COIN: v.co.xy *= R_COIN / r
    uvl = bm.loops.layers.uv.new('UV')
    for f in bm.faces:
        for l in f.loops: l[uvl].uv = ((l.vert.co.x / R_COIN) * 0.5 + 0.5, (l.vert.co.y / R_COIN) * 0.5 + 0.5)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); link(o)
    for poly in me.polygons: poly.use_smooth = True
    dm = o.modifiers.new('relief', 'DISPLACE'); dm.texture = coin_h; dm.texture_coords = 'UV'; dm.uv_layer = 'UV'; dm.strength = RELIEF; dm.mid_level = 0.0; dm.direction = 'Z'
    o.location.z = H_COIN / 2
    if not top:
        o.rotation_euler = (math.pi, 0, 0); o.location.z = -H_COIN / 2
    return o
coin_mat, coin_p = silver('coinM', rough_tex='coin_rough.png')
coin = bpy.data.objects.new('coin', None); link(coin)
for top in (True, False):
    f = coin_face('coinFace' + ('T' if top else 'B'), top); f.data.materials.append(coin_mat); f.parent = coin
# the edge: reeded wall, tall enough to meet the raised rim on both faces
rim_top = H_COIN / 2 + 0.82 * RELIEF
bpy.ops.mesh.primitive_cylinder_add(vertices=2400 if not QUICK else 600, radius=R_COIN, depth=2 * rim_top, end_fill_type='NOTHING')
edge = bpy.context.active_object; edge.name = 'coinEdge'; edge.parent = coin
for poly in edge.data.polygons: poly.use_smooth = True
edge_mat, _ = silver('edgeM', rough=0.18, bump_tex='reed.png', bump_strength=0.9)
edge.data.materials.append(edge_mat)

# ═════════ sterling spoon: lofted shell, solidified, subdivided ═════════
def spoon_mesh():
    NS, NU = 220, 34
    L = 5.6
    def prof(s):            # width, bowl depth, centre height along the length (s: 0 bowl tip -> 1 handle end)
        if s < 0.36:
            k = (s - 0.18) / 0.18; wid = 1.30 * math.sqrt(max(0, 1 - k * k)) ** 0.9
            dep = 0.30 * math.sqrt(max(0, 1 - k * k)) ** 1.2; zc = 0.33
        elif s < 0.47:
            k = (s - 0.36) / 0.11; wid = lerp(0.18, 0.14, k); dep = 0.0; zc = lerp(0.33, 0.50, sst(k))
        else:
            k = (s - 0.47) / 0.53; wid = 0.14 + 0.36 * (k ** 1.6)
            if k > 0.86: wid *= math.sqrt(max(0, 1 - ((k - 0.86) / 0.14) ** 2))
            dep = -0.015; zc = 0.50 - 0.16 * math.sin(k * math.pi * 0.9) + 0.05 * k
        return wid, dep, zc
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UV'); rows = []
    for i in range(NS + 1):
        s = i / NS; wid, dep, zc = prof(s); row = []
        for j in range(NU + 1):
            u = j / NU * 2 - 1
            x = s * L; y = u * wid / 2; z = zc - dep * (1 - u * u)
            row.append(bm.verts.new((x, y, z)))
        rows.append(row)
    for i in range(NS):
        for j in range(NU):
            f = bm.faces.new((rows[i][j], rows[i + 1][j], rows[i + 1][j + 1], rows[i][j + 1]))
            for l, (a, b) in zip(f.loops, [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]): l[uvl].uv = (a / NS, b / NU)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    me = bpy.data.meshes.new('spoon'); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new('spoon', me); link(o)
    for p in me.polygons: p.use_smooth = True
    so = o.modifiers.new('thick', 'SOLIDIFY'); so.thickness = 0.06; so.offset = -1; so.use_even_offset = True; so.use_rim = True
    ss = o.modifiers.new('smooth', 'SUBSURF'); ss.levels = 1; ss.render_levels = 2
    o.data.transform(Matrix.Translation((-L * 0.42, 0, 0)))   # origin near the balance point
    return o
spoon = spoon_mesh(); sm, _ = silver('spoonM', rough=0.09, bump_tex='spoon_engrave.png', bump_strength=0.6); spoon.data.materials.append(sm)

# ═════════ ring: a comfort-fit band with milgrain edges ═════════
def ring_mesh():
    bm = bmesh.new(); NA, NP = 720, 48; R0 = 0.82; Wd, Th = 0.34, 0.13; rows = []; uvl = bm.loops.layers.uv.new('UV')
    for i in range(NA):
        a = i / NA * 2 * math.pi; row = []
        for j in range(NP):
            b = j / NP * 2 * math.pi
            # D-profile: domed outside, flat-ish inside
            px = math.cos(b); pz = math.sin(b)
            r = R0 + (Th / 2) * (px if px > 0 else 0.35 * px) ; h = (Wd / 2) * (abs(pz) ** 0.7) * (1 if pz >= 0 else -1)
            row.append(bm.verts.new((r * math.cos(a), r * math.sin(a), h + Wd / 2)))
        rows.append(row)
    for i in range(NA):
        for j in range(NP):
            a, b = rows[i][j], rows[(i + 1) % NA][j]; c, d = rows[(i + 1) % NA][(j + 1) % NP], rows[i][(j + 1) % NP]
            f = bm.faces.new((a, b, c, d))
            for l, (x, y) in zip(f.loops, [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]): l[uvl].uv = (x / NA, y / NP)
    me = bpy.data.meshes.new('ring'); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new('ring', me); link(o)
    for p in me.polygons: p.use_smooth = True
    return o
ring = ring_mesh(); rm_, rp = silver('ringM', rough=0.07); ring.data.materials.append(rm_)
# milgrain: beads along both edges, as bump from a wave across U, masked to the edge band
nt = rm_.node_tree; uvn = nt.nodes.new('ShaderNodeUVMap'); sp = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(uvn.outputs[0], sp.inputs[0])
wv = nt.nodes.new('ShaderNodeMath'); wv.operation = 'SINE'; mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = 2 * math.pi * 260
nt.links.new(sp.outputs['X'], mul.inputs[0]); nt.links.new(mul.outputs[0], wv.inputs[0])
band = nt.nodes.new('ShaderNodeMapRange'); band.interpolation_type = 'SMOOTHSTEP'; band.inputs['From Min'].default_value = 0.3; band.inputs['From Max'].default_value = 0.22
pp = nt.nodes.new('ShaderNodeMath'); pp.operation = 'PINGPONG'; pp.inputs[1].default_value = 0.5; nt.links.new(sp.outputs['Y'], pp.inputs[0])
d2 = nt.nodes.new('ShaderNodeMath'); d2.operation = 'ABSOLUTE'; s2 = nt.nodes.new('ShaderNodeMath'); s2.operation = 'SUBTRACT'
nt.links.new(pp.outputs[0], s2.inputs[0]); s2.inputs[1].default_value = 0.25; nt.links.new(s2.outputs[0], d2.inputs[0]); nt.links.new(d2.outputs[0], band.inputs['Value'])
hh = nt.nodes.new('ShaderNodeMath'); hh.operation = 'MULTIPLY'; nt.links.new(wv.outputs[0], hh.inputs[0]); nt.links.new(band.outputs[0], hh.inputs[1])
bb = nt.nodes.new('ShaderNodeBump'); bb.inputs['Strength'].default_value = 0.35; bb.inputs['Distance'].default_value = 0.004; nt.links.new(hh.outputs[0], bb.inputs['Height'])
nt.links.new(bb.outputs[0], rp.inputs['Normal'])

# ═════════ shared: a dense rounded box (for the bullion and the struck bar) ═════════
def rounded_box(name, dims, n=120, e=0.14, stamp=None, relief=0.02, subsurf=1):
    if QUICK: n = 48
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UV')
    def face(axis, sgn):
        vs = []
        for i in range(n + 1):
            row = []
            for j in range(n + 1):
                a, b = -1 + 2 * i / n, -1 + 2 * j / n; p = [0, 0, 0]; o = [k for k in range(3) if k != axis]
                p[axis] = sgn; p[o[0]] = a; p[o[1]] = b; row.append(bm.verts.new(p))
            vs.append(row)
        for i in range(n):
            for j in range(n):
                q = (vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1])
                bm.faces.new(q if sgn > 0 else q[::-1])
    for ax in range(3):
        for sg in (1, -1): face(ax, sg)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for v in bm.verts:   # cube -> unit sphere -> superellipsoid (rounded box) -> real dims
        u = v.co.normalized(); q = [math.copysign(abs(c) ** e, c) for c in u]
        v.co = Vector((q[0] * dims[0] / 2, q[1] * dims[1] / 2, q[2] * dims[2] / 2))
    for f in bm.faces:
        for l in f.loops: l[uvl].uv = (l.vert.co.x / dims[0] + 0.5, l.vert.co.y / dims[1] + 0.5)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); link(o)
    for p in me.polygons: p.use_smooth = True
    if subsurf:
        s = o.modifiers.new('sub', 'SUBSURF'); s.levels = 0; s.render_levels = subsurf; s.subdivision_type = 'SIMPLE'
    if stamp:
        vg = o.vertex_groups.new(name='top')
        top = [v.index for v in me.vertices if v.co.z > dims[2] / 2 - 0.02]; vg.add(top, 1.0, 'REPLACE')
        tx = image_tex(stamp); dm = o.modifiers.new('stamp', 'DISPLACE'); dm.texture = tx; dm.texture_coords = 'UV'; dm.uv_layer = 'UV'
        dm.strength = -relief; dm.mid_level = 0.0; dm.direction = 'Z'; dm.vertex_group = 'top'
    return o
def stamp_material(name, stamp, field_rough=0.06, letter_rough=0.32):
    m, p = silver(name, rough=field_rough)
    nt = m.node_tree; it = nt.nodes.new('ShaderNodeTexImage'); it.image = bpy.data.images.load(os.path.join(MAPS, stamp + '.png')); it.image.colorspace_settings.name = 'Non-Color'
    uvn = nt.nodes.new('ShaderNodeUVMap'); nt.links.new(uvn.outputs[0], it.inputs[0])
    gz = nt.nodes.new('ShaderNodeNewGeometry'); sz = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(gz.outputs['Normal'], sz.inputs[0])
    up = nt.nodes.new('ShaderNodeMapRange'); up.inputs['From Min'].default_value = 0.6; up.inputs['From Max'].default_value = 0.9; nt.links.new(sz.outputs['Z'], up.inputs['Value'])
    k = nt.nodes.new('ShaderNodeMath'); k.operation = 'MULTIPLY'; nt.links.new(it.outputs[0], k.inputs[0]); nt.links.new(up.outputs[0], k.inputs[1])
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = field_rough; mr.inputs['To Max'].default_value = letter_rough; nt.links.new(k.outputs[0], mr.inputs['Value'])
    rv = nt.nodes.new('ShaderNodeValue'); rv.name = 'reveal'; rv.outputs[0].default_value = 1.0
    k2 = nt.nodes.new('ShaderNodeMath'); k2.operation = 'MULTIPLY'; nt.links.new(k.outputs[0], k2.inputs[0]); nt.links.new(rv.outputs[0], k2.inputs[1])
    nt.links.new(k2.outputs[0], mr.inputs['Value'])
    nt.links.new(mr.outputs[0], p.inputs['Roughness'])
    return m

bullion = rounded_box('bullion', (2.2, 1.14, 0.44), n=110, e=0.12, stamp='bullion_stamp', relief=0.012)
bullion.data.materials.append(stamp_material('bullionM', 'bullion_stamp', 0.16, 0.38))

# ═════════ scrap: crumpled pieces, a bent wire, a broken chain ═════════
scrap = bpy.data.objects.new('scrap', None); link(scrap)
scm, _ = silver('scrapM', rough=0.2)
noise = bpy.data.textures.new('crumple', 'VORONOI'); noise.noise_scale = 0.22; noise.distance_metric = 'DISTANCE'
clouds = bpy.data.textures.new('crumple2', 'CLOUDS'); clouds.noise_scale = 0.35
for i, (x, y, r) in enumerate([(0, 0, 0.55), (0.62, 0.42, 0.42), (-0.5, 0.55, 0.36)]):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=6 if not QUICK else 4, radius=r, location=(x, y, r * 0.42))
    o = bpy.context.active_object; o.name = f'nugget{i}'; o.scale = (1, 1, 0.48); o.rotation_euler = (0.1 * i, 0.2, i * 1.3); o.parent = scrap
    d1 = o.modifiers.new('a', 'DISPLACE'); d1.texture = noise; d1.strength = 0.16 * r
    d2 = o.modifiers.new('b', 'DISPLACE'); d2.texture = clouds; d2.strength = 0.1 * r
    for p in o.data.polygons: p.use_smooth = True
    o.data.materials.append(scm)
cu = bpy.data.curves.new('wire', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.035; cu.bevel_resolution = 6
spl = cu.splines.new('NURBS'); pts = [(-0.9, -0.5, 0.05), (-0.3, -0.8, 0.07), (0.4, -0.6, 0.04), (0.8, -0.1, 0.09), (0.5, 0.3, 0.12), (0.0, 0.1, 0.18), (-0.2, -0.3, 0.06)]
spl.points.add(len(pts) - 1)
for p, c in zip(spl.points, pts): p.co = (*c, 1)
spl.use_endpoint_u = True; spl.order_u = 4; spl.resolution_u = 24
wo = bpy.data.objects.new('wire', cu); link(wo); wo.parent = scrap; cu.materials.append(scm)
for k in range(6):   # chain links in a loose arc
    a = -0.6 + k * 0.28
    bpy.ops.mesh.primitive_torus_add(major_radius=0.13, minor_radius=0.03, major_segments=64, minor_segments=16,
                                     location=(0.95 + 0.26 * math.cos(a + 1.2), -0.75 + 0.26 * k * 0.9, 0.04 + (0.06 if k % 2 else 0)))
    o = bpy.context.active_object; o.name = f'link{k}'; o.scale = (1.5, 1, 1); o.rotation_euler = ((math.pi / 2) * (k % 2) + 0.15, 0, 0.5 + k * 0.12); o.parent = scrap
    for p in o.data.polygons: p.use_smooth = True
    o.data.materials.append(scm)

# ═════════ the melt: metaballs ═════════
mb = bpy.data.metaballs.new('melt'); mb.resolution = 0.06; mb.render_resolution = 0.025 if not QUICK else 0.06; mb.threshold = 0.6
melt = bpy.data.objects.new('melt', mb); link(melt)
mm_, _ = silver('meltM', rough=0.05); mb.materials.append(mm_)

# ═════════ the struck bar: a sphere (cast) that becomes the bar ═════════
BAR = (3.8, 2.04, 1.04); R_DROP = 1.3
bar = rounded_box('bar', BAR, n=140, e=0.13, stamp='hero_stamp', relief=0.024, subsurf=1)
bar.data.materials.append(stamp_material('barM', 'hero_stamp', 0.045, 0.3))
cast = bar.modifiers.new('sphere', 'CAST'); cast.cast_type = 'SPHERE'; cast.factor = 1.0; cast.size = R_DROP; cast.use_radius_as_size = False; cast.use_x = cast.use_y = cast.use_z = True
# the cast must come after the stamp so the sphere is clean and the letters arrive with the strike
bar.modifiers.move(bar.modifiers.find('sphere'), len(bar.modifiers) - 1)

# ═════════ camera ═════════
cd = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cd); link(cam); sc.camera = cam
cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 24; cd.lens = 12 / math.tan(math.radians(17)); cd.clip_start = 0.1; cd.clip_end = 500
tgt = bpy.data.objects.new('focus', None); link(tgt)
tr = cam.constraints.new('TRACK_TO'); tr.target = tgt; tr.track_axis = 'TRACK_NEGATIVE_Z'; tr.up_axis = 'UP_Y'
cd.dof.use_dof = True; cd.dof.focus_object = tgt; cd.dof.aperture_fstop = 0.9; cd.dof.aperture_blades = 7; cd.dof.aperture_ratio = 1.0
FOCUS_OFF = {}

KEYS = [
    (0.00, (0.7, 1.6, 14.0), (0, 2.3, 0), None),
    (2.36, (0.3, 9.6, 10.6), (0, 1.3, 0.4), 'cubicIO'),
    (3.05, (0.3, 9.6, 10.6), (0, 1.3, 0.4), None),
    (4.55, (0.05, 29.0, -1.4), (0, 0, -3.1), 'quintIO'),
    (7.25, (0.05, 20.0, -1.0), (0, 0, -2.3), 'sineIO'),
    (8.55, (0.0, 3.1, 16.5), (0, 1.75, 0), 'cubicIO'),
    (9.24, (0.0, 3.1, 16.5), (0, 1.75, 0), None),
    (9.42, (0.0, 3.9, 15.5), (0, 0.75, 0), 'outQ'),
    (9.95, (0.0, 3.9, 15.5), (0, 0.75, 0), None),
    (12.4, (-9.6, 4.4, 10.6), (0, 0.45, 0), 'sineIO'),
    (13.55, (-7.6, 11.0, 10.8), (0, 1.6, 0), 'cubicIO'),
]
def cam_at(t):
    i = 0
    while i < len(KEYS) - 1 and t >= KEYS[i + 1][0]: i += 1
    A = KEYS[i]; B = KEYS[min(i + 1, len(KEYS) - 1)]
    k = 0 if B is A else E[B[3] or 'sineIO'](seg(t, A[0], B[0]))
    eye = [lerp(A[1][j], B[1][j], k) for j in range(3)]; at = [lerp(A[2][j], B[2][j], k) for j in range(3)]
    hold = lambda a, b: 1 - sst(seg(t, a - 0.25, a)) * (1 - sst(seg(t, b, b + 0.25)))
    env = sst(seg(t, 0.1, 0.6)) * hold(2.36, 3.05) * hold(8.55, 9.24) * hold(9.42, 9.95) * (1 - sst(seg(t, 13.2, 13.55)))
    hx = 0.05 * env * (math.sin(1.7 * t) + 0.6 * math.sin(2.9 * t + 1)); hy = 0.04 * env * (math.sin(1.3 * t + 2) + 0.5 * math.sin(3.3 * t))
    sx = sy = 0.0
    for th, amp in [(T['slap'], 0.05), (T['drops'][0], 0.05), (T['drops'][1], 0.03), (T['drops'][2], 0.05), (T['drops'][3], 0.035), (T['strike'] + 0.02, 0.11)]:
        s = shake(t, th, amp, 10, 19, th * 7); sx += s[0]; sy += s[1]
    return [eye[0] + hx + sx, eye[1] + hy + sy, eye[2]], at

# ═════════ the coin's spin (Euler disk) ═════════
SP_N = 4800; SP_DT = T['slap'] / SP_N; SPH = [0.0] * (SP_N + 1); _a = 0.0; B0 = 1.2; W0 = 6.283 * 1.15
for i in range(SP_N + 1):
    SPH[i] = _a; tt_ = i * SP_DT; beta = B0 * max(1e-4, (T['slap'] - tt_) / T['slap']) ** (1 / 3); _a += W0 * math.sqrt(B0 / max(beta, 0.03)) * SP_DT
def coin_pose(t):
    if t < T['slap']:
        phi = SPH[min(SP_N, int(t / SP_DT))]; beta = B0 * max(0.0, (T['slap'] - t) / T['slap']) ** (1 / 3)
        q = Quaternion(Vector((math.cos(phi), 0, math.sin(phi))), beta) @ Quaternion(Vector((0, 1, 0)), -phi * 0.18)
        return q.to_matrix(), R_COIN * math.sin(beta) + (H_COIN / 2) * math.cos(beta)
    d = t - T['slap']; hop = 0.06 * math.sin(d / 0.22 * math.pi) * math.exp(-d * 6) if d < 0.22 else 0
    return Quaternion(Vector((0, 1, 0)), -SPH[-1] * 0.18).to_matrix(), H_COIN / 2 + hop
# the coin is authored flat in Blender (face +Z); in three space its axis is +Y: rotate so they agree
COIN_FIX = Matrix.Rotation(-math.pi / 2, 3, 'X')    # Blender-local -> three-local (z up -> y up)

OBJS = [  # name, three-space at (x,z), rot about y, drop time, metaball centres in local three coords [(x,y,z,radius)]
    (spoon, (-0.7, -4.2), 0.4, T['drops'][0], [(-1.35, 0.25, 0, 0.62), (0.0, 0.2, 0, 0.4), (1.2, 0.2, 0, 0.4), (2.4, 0.2, 0, 0.45)]),
    (ring, (1.55, 2.55), 0.0, T['drops'][1], [(0.62, 0.15, 0, 0.32), (-0.62, 0.15, 0, 0.32), (0, 0.15, 0.62, 0.32), (0, 0.15, -0.62, 0.32)]),
    (bullion, (-1.45, 3.35), -0.3, T['drops'][2], [(-0.6, 0.22, 0, 0.55), (0.6, 0.22, 0, 0.55)]),
    (scrap, (1.75, -1.75), 0.0, T['drops'][3], [(0, 0.2, 0, 0.48), (0.6, 0.2, -0.45, 0.36), (-0.5, 0.2, -0.55, 0.32)]),
]
FALL, H0 = 0.42, 9.0
def drop_pose(t, td):
    tf = td - FALL
    if t < tf: return None
    if t < td: k = (t - tf) / FALL; return H0 * (1 - k * k), (1 - k) * 0.5, 1.0
    d = t - td; b = 0.32 * abs(math.sin(min(d, 0.36) / 0.36 * math.pi)) * math.exp(-d * 4) * (1 if d < 0.36 else 0)
    return b, 0.05 * math.exp(-d * 6) * math.sin(d * 30), 1 - 0.18 * math.exp(-d * 18) * math.cos(d * 40)
def heat_k(t): return sst(seg(t, *T['heat'])) * (1 - sst(seg(t, 6.2, 6.9)))
BL2THREE = M3.inverted().to_3x3()   # Blender-local axes into three-local axes (objects are authored z-up)
def obj_matrix(loc3, rot3, scl3):
    """three-space placement of an object authored in Blender local axes"""
    R = rot3 @ BL2THREE
    W = Matrix.Translation(Vector(loc3)) @ R.to_4x4() @ Matrix.Diagonal(Vector((scl3[0], scl3[2], scl3[1], 1)))
    return M3 @ W

# metaball elements: one per object centre + one for the coin's own silver
ELEMS = []
for (o, at, rot, td, balls) in OBJS:
    for b in balls: ELEMS.append((o, at, rot, b))
EL = [mb.elements.new() for _ in range(len(ELEMS) + 1)]
for e in EL: e.type = 'BALL'; e.stiffness = 2.0

def ball_radius(r_world):   # metaball radius that gives a sphere of r_world at this threshold/stiffness
    return r_world * 1.0

def frame_state(t):
    st = {}
    eye, at = cam_at(t); st['cam'] = (V(*eye), V(*at))
    R, y = coin_pose(t); m = ease_in = (lambda k: k ** 3)(seg(t, T['melt'][0], T['melt'][0] + 0.9))
    st['coin'] = (obj_matrix((0, y, 0), R, (1 - 0.3 * m, 1 - 0.9 * m, 1 - 0.3 * m)), t < T['melt'][0] + 0.95)
    hk = heat_k(t); st['heat'] = hk
    for (o, at2, rot, td, balls) in OBJS:
        p = drop_pose(t, td)
        if p is None: st[o.name] = (None, False); continue
        yb, tilt, sq = p; s = 0.78 if o in (spoon,) else 1.0
        R3 = Euler((tilt, rot, tilt * 0.6), 'XYZ').to_matrix()
        st[o.name] = (obj_matrix((at2[0], yb * (1 - m), at2[1]), R3, (s * (1 - 0.35 * m), s * sq * (1 - 0.92 * m), s * (1 - 0.35 * m))), t < T['melt'][0] + 0.95)
    # metaballs
    els = []
    if T['melt'][0] < t < T['strike'] - 0.12:
        g = E['out'](seg(t, T['melt'][0] + 0.05, T['melt'][0] + 0.8)); j = E['cubicIO'](seg(t, T['melt'][0] + 0.35, T['melt'][1]))
        rise = E['cubicIO'](seg(t, *T['rise']))
        for (o, at2, rot, (bx, by, bz, w)) in ELEMS:
            c, s_ = math.cos(rot), math.sin(rot); S_ = 0.78 if o is spoon else 1.0
            wx = at2[0] + (bx * c - bz * s_) * S_; wz = at2[1] + (bx * s_ + bz * c) * S_
            r = w * S_ * g * (1 - j ** 3)
            els.append((V(lerp(wx, 0, j), lerp(0.2, R_DROP * 0.85, j), lerp(wz, 0, j)), r))
        rc = lerp(0.55 * E['out'](seg(t, T['melt'][0], T['melt'][0] + 0.7)), R_DROP, j)
        yc = lerp(0.2, R_DROP * 0.85, j) if t < T['rise'][0] else lerp(R_DROP * 0.85, 1.9, rise)
        els.append((V(0, yc, 0), rc))
    st['els'] = els
    # bar
    vis = t >= T['strike'] - 0.12
    if vis:
        d = t - (T['strike'] - 0.12); fall = clamp(d / 0.12) ** 3; k = clamp((t - T['strike']) / 0.10)
        ringk = math.exp(-(t - T['strike']) * 7) * math.sin((t - T['strike']) * 46) if t > T['strike'] else 0
        cast_f = 1 - E['outQ'](k)
        # sphere centre sits at its radius above the floor until struck; the bar's centre at half its height
        yc = lerp((1 - fall) * (1.9 - R_DROP) + R_DROP, BAR[2] / 2, E['outQ'](k))
        st['bar'] = (obj_matrix((0, yc, 0), Matrix.Identity(3), (1 + 0.05 * ringk, 1 - 0.07 * ringk, 1 + 0.05 * ringk)), True, cast_f)
    else:
        st['bar'] = (None, False, 1.0)
    # the sweep strip, behind the camera
    sw = lambda tc, wd: math.exp(-((t - tc) / wd) ** 2)
    swk = max(sw(1.15, 0.45), sw(T['sweep'], 0.42), sw(8.9, 0.6) * 0.55)
    az = math.atan2(eye[0] - at[0], eye[2] - at[2])
    sa = az + (lerp(-1.1, 1.1, seg(t, 0.6, 1.7)) if t < 4 else lerp(-1.0, 1.0, seg(t, 8.3, 9.5)) if t < 9.9 else lerp(-1.2, 1.2, seg(t, T['sweep'] - 0.55, T['sweep'] + 0.55)))
    st['sweep'] = (V(math.sin(sa) * 16, 4, math.cos(sa) * 16), 26.0 * swk)
    st['accent'] = 1.4 * (1 + 2.5 * sw(T['strike'] + 0.15, 0.35))
    return st

def key_matrix(o, Mw, f):
    o.matrix_world = Mw
    o.keyframe_insert('location', frame=f); o.keyframe_insert('rotation_euler', frame=f); o.keyframe_insert('scale', frame=f)
def key_vis(o, vis, f):
    for ch in [o] + list(o.children):
        ch.hide_render = not vis; ch.hide_viewport = not vis
        ch.keyframe_insert('hide_render', frame=f); ch.keyframe_insert('hide_viewport', frame=f)
def strength_input(mat):
    nt = mat.node_tree; em = [n for n in nt.nodes if n.type == 'EMISSION'][0]
    nm = em.get('strength_node'); return nt.nodes[nm].inputs[1] if nm else em.inputs[1]
SW_IN = strength_input(S['W'][1]); AC_IN = strength_input(S['A'][1])

FRAMES = range(1, NF + 1)
if '--frames' in argv: FRAMES = [int(x) for x in argv[argv.index('--frames') + 1].split(',')]
for f in FRAMES:
    t = (f - 1) / FPS; st = frame_state(t)
    cam.location = st['cam'][0]; cam.keyframe_insert('location', frame=f)
    tgt.location = st['cam'][1]; tgt.keyframe_insert('location', frame=f)
    Mc, vis = st['coin']; key_matrix(coin, Mc @ COIN_FIX.to_4x4() if False else Mc, f); key_vis(coin, vis, f)
    for (o, *_r) in OBJS:
        Mo, v = st[o.name]
        if Mo is not None: key_matrix(o, Mo, f)
        key_vis(o, v, f)
    for p in HEAT_MATS:
        p.inputs['Emission Strength'].default_value = 0.35 * st['heat']; p.inputs['Emission Strength'].keyframe_insert('default_value', frame=f)
    els = st['els']; melt.hide_render = not els; melt.keyframe_insert('hide_render', frame=f)
    for i, e in enumerate(EL):
        if i < len(els): e.co, e.radius = els[i][0], max(0.001, els[i][1])
        else: e.radius = 0.001
        e.keyframe_insert('co', frame=f); e.keyframe_insert('radius', frame=f)
    Mb, bv, cf = st['bar']
    if Mb is not None: key_matrix(bar, Mb, f)
    bar.hide_render = not bv; bar.keyframe_insert('hide_render', frame=f)
    cast.factor = cf; cast.keyframe_insert('factor', frame=f)
    rv = bar.data.materials[0].node_tree.nodes['reveal'].outputs[0]; rv.default_value = 1 - cf; rv.keyframe_insert('default_value', frame=f)
    sw_loc, sw_s = st['sweep']; so = S['W'][0]; so.location = sw_loc; so.rotation_euler = (V(0, 1, 0) - sw_loc).normalized().to_track_quat('-Z', 'Y').to_euler()
    so.keyframe_insert('location', frame=f); so.keyframe_insert('rotation_euler', frame=f)
    SW_IN.default_value = sw_s; SW_IN.keyframe_insert('default_value', frame=f)
    AC_IN.default_value = st['accent']; AC_IN.keyframe_insert('default_value', frame=f)

# per-frame keys: hold between frames (no Bezier overshoot); motion blur still interpolates linearly
for a in bpy.data.actions:
    for fc in getattr(a, 'fcurves', []):
        for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
# label anchors on screen (for the type layer): pixel coords at 1080x1920
from bpy_extras.object_utils import world_to_camera_view
LBL = {}
ANCH = [('Sterling', V(-0.7, 0.3, -4.2)), ('Jewelry', V(1.55, 0.3, 2.55)), ('Bullion', V(-1.45, 0.3, 3.35)), ('Scrap', V(1.75, 0.3, -1.75)), ('Coins', V(0, 0.3, 0))]
for f in range(int(3.0 * FPS), int(5.4 * FPS)):
    sc.frame_set(f); LBL[f] = [[n, *[round(c, 1) for c in (lambda p: (p.x * 1080, (1 - p.y) * 1920))(world_to_camera_view(sc, cam, a))]] for n, a in ANCH]
json.dump({'fps': FPS, 'labels': LBL}, open(os.path.join(HERE, 'labels.json'), 'w'))
bpy.ops.wm.save_as_mainfile(filepath=OUT)
print('saved', OUT)
