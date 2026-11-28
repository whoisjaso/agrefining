# build.py : AG Refining "The silver inside" in Blender (Cycles).  blender -b -P build.py -- OUT.blend [--quick]
# Everything animated is evaluated from one timeline (the same constants as the score) and keyed on every frame.
import bpy, bmesh, math, sys, os, json
from mathutils import Vector, Matrix, Euler, Quaternion
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/ag.blend'
HERE = os.path.dirname(os.path.abspath(__file__)); MAPS = os.path.join(HERE, 'maps')
FPS = 24; DUR = 15.0; NF = int(DUR * FPS)

# ═════════ timeline (seconds) ═════════
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


QUICK = '--quick' in argv
def image_tex(name):
    tx = bpy.data.textures.new(name, 'IMAGE'); tx.image = bpy.data.images.load(os.path.join(MAPS, name + '.png')); tx.image.colorspace_settings.name = 'Non-Color'; tx.extension = 'EXTEND'; return tx
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

