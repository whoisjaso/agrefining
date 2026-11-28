# logo.py : the AG Refining element tile (assets/ag-mark-path.svg) as a physical object: silver-rimmed blue enamel, raised silver type.
# blender -b -P logo.py -- OUTDIR   -> transparent PNG frames of the tile turning into place under a sweep of light (24 fps)
import bpy, math, os, sys
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]; OUT = argv[0]
SVG = '/home/user/agrefining/assets/ag-mark-path.svg'
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; cy = sc.cycles; cy.samples = 48; cy.use_denoising = True
sc.render.resolution_x = sc.render.resolution_y = 520; sc.render.film_transparent = True; sc.render.fps = 24
sc.frame_start, sc.frame_end = 1, 30
sc.view_settings.view_transform = 'Khronos PBR Neutral'
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.02, 0.022, 0.026, 1); bg.inputs[1].default_value = 1

def mat(name, color, metal, rough, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*color, 1); p.inputs['Metallic'].default_value = metal; p.inputs['Roughness'].default_value = rough
    p.inputs['Coat Weight'].default_value = coat; p.inputs['Coat Roughness'].default_value = 0.03
    return m
SILVER = mat('silver', (0.95, 0.945, 0.935), 1.0, 0.12)
ENAMEL = mat('enamel', (0.004, 0.05, 0.13), 0.0, 0.3, coat=0.6)   # #0a4470 under a glassy coat

# the type: import the logo's own outlines (47, Ag, 107.868) and give them depth
before = set(bpy.data.objects)
bpy.ops.import_curve.svg(filepath=SVG)
new = [o for o in bpy.data.objects if o not in before]
curves = [o for o in new if o.type == 'CURVE']
# the SVG's rect is the tile; we build the tile as solid geometry instead
rect = max(curves, key=lambda o: o.dimensions.x * o.dimensions.y)
tile_w = rect.dimensions.x; cx = rect.location.x; ctr = None
bpy.context.view_layer.update()
def bbox_center(o):
    vs = [o.matrix_world @ Vector(c) for c in o.bound_box]; return sum(vs, Vector()) / 8
ctr = bbox_center(rect)
S = 2.0 / tile_w                                          # tile 2 units wide
glyphs = [o for o in curves if o is not rect]
for o in glyphs:
    o.data.extrude = 0.06 / S; o.data.bevel_depth = 0.012 / S; o.data.bevel_resolution = 3
    o.data.materials.clear(); o.data.materials.append(SILVER)
bpy.data.objects.remove(rect, do_unlink=True)
root = bpy.data.objects.new('mark', None); sc.collection.objects.link(root)
for o in glyphs:
    o.parent = root; o.matrix_parent_inverse = root.matrix_world.inverted()
root.location = -ctr; bpy.context.view_layer.update()
pivot = bpy.data.objects.new('pivot', None); sc.collection.objects.link(pivot); root.parent = pivot
pivot.scale = (S, S, S)
for o in glyphs: o.location.z += 0.0
# the tile: a silver rim around a blue enamel field
bpy.ops.mesh.primitive_cube_add(size=1); rim = bpy.context.active_object; rim.scale = (2.0, 2.0, 0.16); rim.location = (0, 0, -0.08)
bv = rim.modifiers.new('bv', 'BEVEL'); bv.width = 0.05; bv.segments = 6; rim.data.materials.append(SILVER)
bpy.ops.mesh.primitive_cube_add(size=1); fld = bpy.context.active_object; fld.scale = (1.9, 1.9, 0.02); fld.location = (0, 0, 0.0)
bv = fld.modifiers.new('bv', 'BEVEL'); bv.width = 0.008; bv.segments = 3; fld.data.materials.append(ENAMEL)
for o in (rim, fld): o.parent = pivot; o.matrix_parent_inverse = pivot.matrix_world.inverted()
for o in glyphs: o.location.z = 0.01 / S
bpy.context.view_layer.update()

# light: strip boxes seen in reflection, plus a sweep that crosses as the tile settles
def strip(name, size, loc, strength):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc); o = bpy.context.active_object; o.name = name; o.scale = (*size, 1)
    o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); e = nt.nodes.new('ShaderNodeEmission'); e.inputs[1].default_value = strength
    o_ = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(e.outputs[0], o_.inputs[0]); o.data.materials.append(m); o.visible_camera = False
    return o, e
strip('top', (8, 2), (0, 4, 5), 3); strip('left', (1.5, 8), (-6, 1, 3), 5); strip('right', (1.5, 8), (6, -1, 3), 3)
sweep, se = strip('sweep', (1.2, 12), (0, 0, 7), 0)
bpy.ops.object.light_add(type='AREA', location=(0, -2, 5)); L = bpy.context.active_object; L.data.size = 4; L.data.energy = 120

cam_d = bpy.data.cameras.new('c'); cam = bpy.data.objects.new('c', cam_d); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (0, -0.6, 7.2); cam.rotation_euler = (math.radians(4.8), 0, 0); cam_d.lens = 80
# animation: the tile turns into place (ease out), the sweep crosses it at the settle
def eo(k): return 1 - (1 - k) ** 4
for f in range(1, 31):
    k = min(1, (f - 1) / 20); e = eo(k)
    pivot.rotation_euler = (math.radians(18 * (1 - e)), math.radians(-62 * (1 - e)), 0); pivot.keyframe_insert('rotation_euler', frame=f)
    s = (f - 12) / 10; sweep.location = (-6 + 12 * min(1, max(0, s)), 0, 6.5); sweep.keyframe_insert('location', frame=f)
    se.inputs[1].default_value = 14 * math.sin(math.pi * min(1, max(0, s))) if 0 < s < 1 else 0; se.inputs[1].keyframe_insert('default_value', frame=f)
sc.render.filepath = os.path.join(OUT, 'm####')
if '--still' in argv:
    sc.frame_set(30); sc.render.filepath = os.path.join(OUT, 'still.png'); bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
print('logo frames done')
