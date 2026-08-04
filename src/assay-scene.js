export const ASSAY_LIMITS = Object.freeze({
  yawRadians: 7 * Math.PI / 180,
  pitchRadians: 4 * Math.PI / 180,
  settleMilliseconds: 1200,
  desktopDpr: 1.5,
  compactDpr: 1.25
});

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function resolveAssayMode(capabilities = {}) {
  if (capabilities.saveData) return { enhance: false, reason: "save-data" };
  if (capabilities.reducedMotion) return { enhance: false, reason: "reduced-motion" };
  if (capabilities.coarsePointer) return { enhance: false, reason: "coarse-pointer" };
  if (!capabilities.hasWebGL) return { enhance: false, reason: "no-webgl" };
  return { enhance: true, reason: "interactive" };
}

export function normalizeAssayReviewView(value) {
  return value === "side" || value === "grazing" ? value : "match";
}

export function assayPointerIntent(clientX, clientY, rect = {}) {
  const width = Number(rect.width);
  const height = Number(rect.height);
  if (!(width > 0) || !(height > 0)) return { yaw: 0, pitch: 0 };

  const x = Number.isFinite(clientX) ? clientX : Number(rect.left) || 0;
  const y = Number.isFinite(clientY) ? clientY : Number(rect.top) || 0;
  const left = Number(rect.left) || 0;
  const top = Number(rect.top) || 0;
  const normalizedX = ((x - left) / width) * 2 - 1;
  const normalizedY = 1 - ((y - top) / height) * 2;

  return {
    yaw: clamp(normalizedX * ASSAY_LIMITS.yawRadians, -ASSAY_LIMITS.yawRadians, ASSAY_LIMITS.yawRadians),
    pitch: clamp(normalizedY * ASSAY_LIMITS.pitchRadians, -ASSAY_LIMITS.pitchRadians, ASSAY_LIMITS.pitchRadians)
  };
}

export function stepAssaySpring(state, target, deltaSeconds) {
  const delta = clamp(Number.isFinite(deltaSeconds) ? deltaSeconds : 0, 0, 1 / 30);
  const wantedYaw = clamp(Number(target?.yaw) || 0, -ASSAY_LIMITS.yawRadians, ASSAY_LIMITS.yawRadians);
  const wantedPitch = clamp(Number(target?.pitch) || 0, -ASSAY_LIMITS.pitchRadians, ASSAY_LIMITS.pitchRadians);
  const stiffness = 75;
  const damping = 16;
  let yawVelocity = Number(state?.yawVelocity) || 0;
  let pitchVelocity = Number(state?.pitchVelocity) || 0;
  let yaw = clamp(Number(state?.yaw) || 0, -ASSAY_LIMITS.yawRadians, ASSAY_LIMITS.yawRadians);
  let pitch = clamp(Number(state?.pitch) || 0, -ASSAY_LIMITS.pitchRadians, ASSAY_LIMITS.pitchRadians);

  yawVelocity += ((wantedYaw - yaw) * stiffness - yawVelocity * damping) * delta;
  pitchVelocity += ((wantedPitch - pitch) * stiffness - pitchVelocity * damping) * delta;
  yaw = clamp(yaw + yawVelocity * delta, -ASSAY_LIMITS.yawRadians, ASSAY_LIMITS.yawRadians);
  pitch = clamp(pitch + pitchVelocity * delta, -ASSAY_LIMITS.pitchRadians, ASSAY_LIMITS.pitchRadians);

  if ((yaw === ASSAY_LIMITS.yawRadians && yawVelocity > 0) || (yaw === -ASSAY_LIMITS.yawRadians && yawVelocity < 0)) yawVelocity = 0;
  if ((pitch === ASSAY_LIMITS.pitchRadians && pitchVelocity > 0) || (pitch === -ASSAY_LIMITS.pitchRadians && pitchVelocity < 0)) pitchVelocity = 0;

  return { yaw, pitch, yawVelocity, pitchVelocity };
}

export function selectAssayPixelRatio(width, devicePixelRatio) {
  const ratio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.min(ratio, Number(width) >= 900 ? ASSAY_LIMITS.desktopDpr : ASSAY_LIMITS.compactDpr);
}

export function normalizedAssayUv(position = {}, normal = {}, bounds = {}) {
  const minimum = bounds.min || {};
  const maximum = bounds.max || {};
  const span = (high, low) => Math.max(0.0001, Number(high) - Number(low));
  const rangeX = span(maximum.x, minimum.x);
  const rangeY = span(maximum.y, minimum.y);
  const rangeZ = span(maximum.z, minimum.z);
  const x = Number(position.x) || 0;
  const y = Number(position.y) || 0;
  const z = Number(position.z) || 0;
  const nx = Math.abs(Number(normal.x) || 0);
  const ny = Math.abs(Number(normal.y) || 0);
  const nz = Math.abs(Number(normal.z) || 0);

  if (ny >= nx && ny >= nz) {
    return { u: clamp((x - minimum.x) / rangeX, 0, 1), v: clamp((z - minimum.z) / rangeZ, 0, 1) };
  }
  if (nz >= nx) {
    return { u: clamp((x - minimum.x) / rangeX, 0, 1), v: clamp((y - minimum.y) / rangeY, 0, 1) };
  }
  return { u: clamp((z - minimum.z) / rangeZ, 0, 1), v: clamp((y - minimum.y) / rangeY, 0, 1) };
}

function hashUnit(x, y, seed) {
  let value = Math.imul((x | 0) ^ seed, 0x45d9f3b) ^ Math.imul((y | 0) + seed, 0x27d4eb2d);
  value = Math.imul(value ^ (value >>> 15), 0x85ebca6b);
  value ^= value >>> 13;
  return (value >>> 0) / 4294967295;
}

function addValueNoise(target, size, cellSize, seed, amount) {
  const stride = Math.ceil((size - 1) / cellSize) + 2;
  const lattice = new Float32Array(stride * stride);
  for (let y = 0; y < stride; y += 1) {
    for (let x = 0; x < stride; x += 1) lattice[y * stride + x] = hashUnit(x, y, seed);
  }
  for (let y = 0; y < size; y += 1) {
    const gridY = Math.floor(y / cellSize);
    const localY = y / cellSize - gridY;
    const fadeY = localY * localY * (3 - 2 * localY);
    for (let x = 0; x < size; x += 1) {
      const gridX = Math.floor(x / cellSize);
      const localX = x / cellSize - gridX;
      const fadeX = localX * localX * (3 - 2 * localX);
      const top = lattice[gridY * stride + gridX] * (1 - fadeX) + lattice[gridY * stride + gridX + 1] * fadeX;
      const bottom = lattice[(gridY + 1) * stride + gridX] * (1 - fadeX) + lattice[(gridY + 1) * stride + gridX + 1] * fadeX;
      target[y * size + x] += (top * (1 - fadeY) + bottom * fadeY - 0.5) * amount;
    }
  }
}

function distanceToSegment(x, y, startX, startY, endX, endY) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY || 1;
  const amount = clamp(((x - startX) * deltaX + (y - startY) * deltaY) / lengthSquared, 0, 1);
  return Math.hypot(x - (startX + deltaX * amount), y - (startY + deltaY * amount));
}

function seededSurfaceFeatures(size) {
  let state = 0x6a09e667;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967295;
  };
  const directions = [[1, 0.12], [0.94, 0.32], [0.82, -0.24], [0.71, 0.46], [0.97, -0.1]];
  const scratches = Array.from({ length: 14 }, () => {
    const startX = size * (0.04 + next() * 0.84);
    const startY = size * (0.06 + next() * 0.84);
    const direction = directions[Math.floor(next() * directions.length)];
    const length = size * (0.08 + next() * 0.1);
    return {
      startX,
      startY,
      endX: clamp(startX + direction[0] * length, 0, size - 1),
      endY: clamp(startY + direction[1] * length, 0, size - 1),
      width: 0.42 + next() * 0.62,
      depth: 0.65 + next() * 0.7
    };
  });
  const pits = Array.from({ length: 34 }, () => ({
    x: size * (0.03 + next() * 0.94),
    y: size * (0.03 + next() * 0.94),
    radius: 0.6 + next() * 1.25,
    depth: 0.7 + next() * 0.8
  }));
  return { scratches, pits };
}

function normalizeField(values, wantedMean, wantedSigma, minimum, maximum) {
  let total = 0;
  for (const value of values) total += value;
  const average = total / values.length;
  let squared = 0;
  for (const value of values) squared += (value - average) ** 2;
  const sigma = Math.sqrt(squared / values.length) || 1;
  const output = new Uint8Array(values.length * 4);
  for (let index = 0; index < values.length; index += 1) {
    const encoded = Math.round(clamp(wantedMean + ((values[index] - average) / sigma) * wantedSigma, minimum, maximum));
    const offset = index * 4;
    output[offset] = encoded;
    output[offset + 1] = encoded;
    output[offset + 2] = encoded;
    output[offset + 3] = 255;
  }
  return output;
}

function removeAxisBias(values, size) {
  let total = 0;
  for (const value of values) total += value;
  const average = total / values.length;
  for (let y = 0; y < size; y += 1) {
    let rowTotal = 0;
    for (let x = 0; x < size; x += 1) rowTotal += values[y * size + x];
    const adjustment = rowTotal / size - average;
    for (let x = 0; x < size; x += 1) values[y * size + x] -= adjustment;
  }
  for (let x = 0; x < size; x += 1) {
    let columnTotal = 0;
    for (let y = 0; y < size; y += 1) columnTotal += values[y * size + x];
    const adjustment = columnTotal / size - average;
    for (let y = 0; y < size; y += 1) values[y * size + x] -= adjustment;
  }
}

export function generateAssaySurfaceFields(size = 256) {
  const edge = Math.max(64, Math.round(Number(size) || 256));
  const count = edge * edge;
  const albedoField = new Float32Array(count);
  const roughnessField = new Float32Array(count);
  const heightField = new Float32Array(count);
  const { scratches, pits } = seededSurfaceFeatures(edge);

  addValueNoise(albedoField, edge, edge * 0.29, 0x1f123bb5, 0.1);
  addValueNoise(albedoField, edge, edge * 0.091, 0x54a32d19, 0.44);
  addValueNoise(albedoField, edge, edge * 0.027, 0x77c4a1e7, 0.34);
  addValueNoise(roughnessField, edge, edge * 0.24, 0x2d5b8f31, 0.12);
  addValueNoise(roughnessField, edge, edge * 0.073, 0x6c8e9cf5, 0.52);
  addValueNoise(roughnessField, edge, edge * 0.021, 0x19a70df3, 0.36);
  addValueNoise(heightField, edge, edge * 0.12, 0x4a2f7c15, 0.34);
  addValueNoise(heightField, edge, edge * 0.039, 0x31f0d8a9, 0.46);
  addValueNoise(heightField, edge, edge * 0.013, 0x7b6d2e41, 0.2);
  for (let index = 0; index < count; index += 1) {
    albedoField[index] += (hashUnit(index % edge, Math.floor(index / edge), 0x5d91c7a3) - 0.5) * 0.12;
  }

  for (const scratch of scratches) {
    const padding = scratch.width * 2.1;
    const minX = Math.max(0, Math.floor(Math.min(scratch.startX, scratch.endX) - padding));
    const maxX = Math.min(edge - 1, Math.ceil(Math.max(scratch.startX, scratch.endX) + padding));
    const minY = Math.max(0, Math.floor(Math.min(scratch.startY, scratch.endY) - padding));
    const maxY = Math.min(edge - 1, Math.ceil(Math.max(scratch.startY, scratch.endY) + padding));
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const index = y * edge + x;
        const distance = distanceToSegment(x, y, scratch.startX, scratch.startY, scratch.endX, scratch.endY);
        const influence = clamp(1 - distance / padding, 0, 1);
        if (influence) {
          const softened = influence * influence;
          albedoField[index] -= softened * scratch.depth * 0.48;
          heightField[index] -= softened * scratch.depth * 1.9;
        }
      }
    }
  }
  for (const pit of pits) {
    const padding = pit.radius * 1.9;
    const minX = Math.max(0, Math.floor(pit.x - padding));
    const maxX = Math.min(edge - 1, Math.ceil(pit.x + padding));
    const minY = Math.max(0, Math.floor(pit.y - padding));
    const maxY = Math.min(edge - 1, Math.ceil(pit.y + padding));
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const index = y * edge + x;
        const influence = clamp(1 - Math.hypot(x - pit.x, y - pit.y) / (pit.radius * 1.9), 0, 1);
        if (influence) {
          const softened = influence * influence;
          albedoField[index] -= softened * pit.depth * 0.72;
          roughnessField[index] += softened * pit.depth * 0.34;
          heightField[index] -= softened * pit.depth * 2.4;
        }
      }
    }
  }

  removeAxisBias(albedoField, edge);
  removeAxisBias(roughnessField, edge);
  const albedo = normalizeField(albedoField, 232, 4.1, 220, 242);
  const roughness = normalizeField(roughnessField, 138, 11.5, 108, 168);
  const normal = new Uint8Array(count * 4);
  for (let y = 0; y < edge; y += 1) {
    const row = y * edge;
    const previousRow = Math.max(0, y - 1) * edge;
    const nextRow = Math.min(edge - 1, y + 1) * edge;
    for (let x = 0; x < edge; x += 1) {
      const index = (row + x) * 4;
      const nx = clamp((heightField[row + Math.max(0, x - 1)] - heightField[row + Math.min(edge - 1, x + 1)]) * 10.5, -28, 28);
      const ny = clamp((heightField[previousRow + x] - heightField[nextRow + x]) * 10.5, -28, 28);
      const normalizedX = nx / 127;
      const normalizedY = ny / 127;
      const nz = Math.sqrt(Math.max(0, 1 - normalizedX * normalizedX - normalizedY * normalizedY));
      normal[index] = Math.round(128 + nx);
      normal[index + 1] = Math.round(128 + ny);
      normal[index + 2] = Math.round(128 + nz * 127);
      normal[index + 3] = 255;
    }
  }
  return { albedo, roughness, normal };
}

export function assayBowlProfile() {
  return [
    { radius: 0, y: 0.378 },
    { radius: 0.07, y: 0.38 },
    { radius: 0.12, y: 0.388 },
    { radius: 0.17, y: 0.417 },
    { radius: 0.22, y: 0.451 },
    { radius: 0.26, y: 0.468 },
    { radius: 0.285, y: 0.472 }
  ];
}

export function assayBowlTone(radius) {
  const amount = clamp((Number(radius) || 0) / 0.285, 0, 1);
  const wall = 0.48;
  const local = amount <= wall ? amount / wall : (amount - wall) / (1 - wall);
  const eased = local * local * (3 - 2 * local);
  const tone = amount <= wall ? 0.48 - eased * 0.26 : 0.22 + eased * 0.64;
  return { r: tone, g: tone + 0.004, b: tone + 0.002 };
}

export function assayCalibrationPaths() {
  const top = Array.from({ length: 17 }, (_, index) => {
    const x = -2.26 + index * (4.52 / 16);
    const edgeAmount = Math.abs(x) / 2.26;
    return { x, y: 0.397 - 0.008 * edgeAmount ** 4, z: -0.36 };
  });
  return {
    top,
    left: [top[0], { x: -2.33, y: 0.374, z: -0.36 }, { x: -2.39, y: 0.345, z: -0.36 }, { x: -2.398, y: 0.282, z: -0.36 }],
    right: [top.at(-1), { x: 2.33, y: 0.374, z: -0.36 }, { x: 2.39, y: 0.345, z: -0.36 }, { x: 2.398, y: 0.282, z: -0.36 }]
  };
}

export function assayCameraPose(view, aspect = 1) {
  const selected = normalizeAssayReviewView(view);
  const safeAspect = clamp(Number(aspect) || 1, 0.75, 1.5);
  const framingScale = clamp(1.12 / safeAspect, 0.82, 1.08);
  const target = { x: 0, y: selected === "grazing" ? 0.16 : 0.14, z: 0 };
  if (selected === "side") return { fov: 32, position: { x: 6.1, y: 3.5, z: 2.8 }, target };
  if (selected === "grazing") return { fov: 31, position: { x: 4.7, y: 2.2, z: 6 }, target };
  return {
    fov: 34,
    position: { x: 4.55 * framingScale, y: 3.25 * framingScale, z: 5.8 * framingScale },
    target
  };
}

function readAssayCapabilities() {
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches === true;
  const saveData = navigator.connection?.saveData === true;
  let context = null;

  try {
    const probe = document.createElement("canvas");
    context = probe.getContext("webgl2", { alpha: true, antialias: false })
      || probe.getContext("webgl", { alpha: true, antialias: false });
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    context = null;
  }

  return { reducedMotion, coarsePointer, saveData, hasWebGL: Boolean(context) };
}

function createRoundedMonolithGeometry(THREE, compact) {
  const width = 4.6;
  const depth = 1.5;
  const radius = 0.16;
  const left = -width / 2;
  const right = width / 2;
  const back = -depth / 2;
  const front = depth / 2;
  const shape = new THREE.Shape();

  shape.moveTo(left + radius, back);
  shape.lineTo(right - radius, back);
  shape.quadraticCurveTo(right, back, right, back + radius);
  shape.lineTo(right, front - radius);
  shape.quadraticCurveTo(right, front, right - radius, front);
  shape.lineTo(left + radius, front);
  shape.quadraticCurveTo(left, front, left, front - radius);
  shape.lineTo(left, back + radius);
  shape.quadraticCurveTo(left, back, left + radius, back);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.52,
    steps: 1,
    curveSegments: 5,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.1,
    bevelThickness: 0.1
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.center();
  geometry.computeBoundingBox();

  const position = geometry.attributes.position;
  const top = geometry.boundingBox.max.y;
  const edgeCandidates = [];
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    if (y > top - 0.13) {
      const radial = Math.min(1, (x / 2.4) ** 2 + (z / 0.85) ** 2);
      position.setY(index, y + 0.025 * (1 - radial));
      if (!compact && Math.max(Math.abs(x) / 2.4, Math.abs(z) / 0.85) > 0.88) edgeCandidates.push(index);
    }
  }

  if (!compact && edgeCandidates.length) {
    for (let offset = 0; offset < 6; offset += 1) {
      const index = edgeCandidates[Math.floor((offset + 0.5) * edgeCandidates.length / 6)];
      const x = position.getX(index);
      const z = position.getZ(index);
      const length = Math.hypot(x / 2.4, z / 0.85) || 1;
      const shift = 0.008 + offset * 0.0015;
      position.setX(index, x + (x / 2.4) / length * shift);
      position.setZ(index, z + (z / 0.85) / length * shift);
    }
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const normal = geometry.attributes.normal;
  const uv = new Float32Array(position.count * 2);
  for (let index = 0; index < position.count; index += 1) {
    const mapped = normalizedAssayUv(
      { x: position.getX(index), y: position.getY(index), z: position.getZ(index) },
      { x: normal.getX(index), y: normal.getY(index), z: normal.getZ(index) },
      geometry.boundingBox
    );
    uv[index * 2] = mapped.u;
    uv[index * 2 + 1] = mapped.v;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.computeBoundingSphere();
  return geometry;
}

function makeTexture(THREE, width, height, pixels, colorSpace) {
  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createSilverSurfaceTextures(THREE) {
  const size = 256;
  const fields = generateAssaySurfaceFields(size);

  return {
    albedo: makeTexture(THREE, size, size, fields.albedo, THREE.SRGBColorSpace),
    roughness: makeTexture(THREE, size, size, fields.roughness, THREE.NoColorSpace),
    normal: makeTexture(THREE, size, size, fields.normal, THREE.NoColorSpace)
  };
}

function createStudioEnvironmentTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  context.fillStyle = "#9da09e";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const warm = context.createRadialGradient(25, 12, 1, 25, 12, 47);
  warm.addColorStop(0, "rgba(255,249,236,0.98)");
  warm.addColorStop(0.42, "rgba(237,231,218,0.72)");
  warm.addColorStop(1, "rgba(237,231,218,0)");
  context.fillStyle = warm;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const neutral = context.createRadialGradient(102, 21, 2, 102, 21, 35);
  neutral.addColorStop(0, "rgba(226,230,228,0.88)");
  neutral.addColorStop(1, "rgba(226,230,228,0)");
  context.fillStyle = neutral;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const floor = context.createRadialGradient(69, 63, 3, 69, 63, 50);
  floor.addColorStop(0, "rgba(54,58,57,0.8)");
  floor.addColorStop(1, "rgba(54,58,57,0)");
  context.fillStyle = floor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createIdentityMarkTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const context = canvas.getContext("2d");

  const traceMark = (dx, dy, color, width) => {
    context.save();
    context.translate(dx, dy);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(18, 134);
    context.lineTo(59, 24);
    context.lineTo(101, 134);
    context.moveTo(37, 87);
    context.lineTo(82, 87);
    context.stroke();
    context.beginPath();
    context.ellipse(153, 79, 34, 35, 0, 0, Math.PI * 2);
    context.moveTo(180, 52);
    context.lineTo(180, 119);
    context.bezierCurveTo(178, 145, 137, 151, 120, 128);
    context.stroke();
    context.beginPath();
    context.moveTo(220, 138);
    context.lineTo(260, 19);
    context.moveTo(331, 20);
    context.lineTo(282, 101);
    context.lineTo(354, 101);
    context.moveTo(332, 21);
    context.lineTo(332, 139);
    context.moveTo(386, 29);
    context.lineTo(477, 29);
    context.lineTo(414, 139);
    context.stroke();
    context.restore();
  };

  traceMark(2, 2, "rgba(242,233,220,0.78)", 11);
  traceMark(0, 0, "rgba(55,60,63,0.82)", 10);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createAssayRelief(THREE, silverMaterial, bowlMaterial, compact) {
  const group = new THREE.Group();
  group.name = "assay-relief";
  const centerX = -0.12;
  const centerZ = 0.08;
  const segments = compact ? 32 : 48;
  const ringData = [[0.51, 0.017, 0.402], [0.39, 0.015, 0.425], [0.285, 0.014, 0.47]];

  ringData.forEach(([radius, tube, height], index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, segments), silverMaterial);
    ring.name = `assay-ring-${index + 1}`;
    ring.rotation.x = Math.PI / 2;
    ring.position.set(centerX, height, centerZ);
    ring.userData.explodeWithParent = true;
    group.add(ring);
  });

  const bowlProfile = assayBowlProfile().map(({ radius, y }) => new THREE.Vector2(radius, y));
  const bowlGeometry = new THREE.LatheGeometry(bowlProfile, segments);
  const position = bowlGeometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  for (let index = 0; index < position.count; index += 1) {
    const tone = assayBowlTone(Math.hypot(position.getX(index), position.getZ(index)));
    colors[index * 3] = tone.r;
    colors[index * 3 + 1] = tone.g;
    colors[index * 3 + 2] = tone.b;
  }
  bowlGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
  bowl.name = "concave-assay-bowl";
  bowl.position.set(centerX, 0, centerZ);
  bowl.userData.explodeWithParent = true;
  group.add(bowl);
  return group;
}

function setInstance(THREE, mesh, index, position, scale) {
  const matrix = new THREE.Matrix4();
  matrix.compose(position, new THREE.Quaternion(), scale);
  mesh.setMatrixAt(index, matrix);
}

function createCalibrationLine(THREE, blueMaterial) {
  const positions = [];
  const indices = [];
  const halfWidth = 0.014;
  for (const path of Object.values(assayCalibrationPaths())) {
    const start = positions.length / 3;
    path.forEach(({ x, y, z }) => {
      positions.push(x, y, z - halfWidth, x, y, z + halfWidth);
    });
    for (let index = 0; index < path.length - 1; index += 1) {
      const current = start + index * 2;
      indices.push(current, current + 2, current + 1, current + 2, current + 3, current + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const line = new THREE.Mesh(geometry, blueMaterial);
  line.name = "wrapped-blue-calibration-line";
  return line;
}

function createIdentityMark(THREE, texture, material) {
  material.map = texture;
  material.needsUpdate = true;
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 0.46), material);
  mark.name = "ag-47-vector-mark";
  mark.rotation.x = -Math.PI / 2;
  mark.position.set(1.3, 0.407, 0.2);
  mark.userData.explodeWithParent = true;
  return mark;
}

function createFrontTicks(THREE, recessedMaterial) {
  const geometry = new THREE.BoxGeometry(0.018, 0.17, 0.026);
  const ticks = new THREE.InstancedMesh(geometry, recessedMaterial, 3);
  ticks.name = "three-recessed-front-ticks";
  const offsets = [0, 0.11, 0.23];
  const heights = [0.92, 1, 0.86];
  offsets.forEach((offset, index) => {
    setInstance(
      THREE,
      ticks,
      index,
      new THREE.Vector3(-1.84 + offset, 0.05 + (0.17 * heights[index]) / 2, 0.844),
      new THREE.Vector3(1, heights[index], 1)
    );
  });
  ticks.instanceMatrix.needsUpdate = true;
  ticks.userData.explodeWithParent = true;
  return ticks;
}

function createMonolith(THREE, compact) {
  const textures = createSilverSurfaceTextures(THREE);
  const silver = new THREE.MeshPhysicalMaterial({
    color: "#e8e9e5",
    metalness: 1,
    roughness: 1,
    clearcoat: 0.01,
    clearcoatRoughness: 0.5,
    envMapIntensity: 1.24,
    map: textures.albedo,
    roughnessMap: textures.roughness,
    normalMap: textures.normal,
    normalScale: new THREE.Vector2(0.16, 0.16)
  });
  const bowlSilver = new THREE.MeshPhysicalMaterial({
    color: "#f1f1ed",
    vertexColors: true,
    metalness: 1,
    roughness: 0.56,
    clearcoat: 0,
    envMapIntensity: 1.12
  });
  const blue = new THREE.MeshPhysicalMaterial({
    color: "#0d5e9c",
    roughness: 0.38,
    metalness: 0.04,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  const recessed = new THREE.MeshStandardMaterial({ color: "#555754", metalness: 0.82, roughness: 0.62 });
  const markMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, alphaTest: 0.04, toneMapped: false });
  const markTexture = createIdentityMarkTexture(THREE);
  const root = new THREE.Group();
  root.name = "ag-assay-monolith";

  const body = new THREE.Mesh(createRoundedMonolithGeometry(THREE, compact), silver);
  body.name = "rounded-crowned-cast-body";
  root.add(body);
  const relief = createAssayRelief(THREE, silver, bowlSilver, compact);
  const calibrationLine = createCalibrationLine(THREE, blue);
  const identityMark = createIdentityMark(THREE, markTexture, markMaterial);
  const ticks = createFrontTicks(THREE, recessed);
  root.add(relief, calibrationLine, identityMark, ticks);
  root.userData.sculptRuntime = {
    nodes: { body, relief, calibrationLine, identityMark, ticks },
    destructionGroups: [{ id: "assay-monolith", members: [body.name, relief.name, calibrationLine.name, identityMark.name, ticks.name] }]
  };
  return root;
}

function configureAssayCamera(THREE, camera, view, aspect) {
  const selected = normalizeAssayReviewView(view);
  const pose = assayCameraPose(selected, aspect);
  camera.aspect = aspect;
  camera.fov = pose.fov;
  camera.position.set(pose.position.x, pose.position.y, pose.position.z);
  camera.lookAt(new THREE.Vector3(pose.target.x, pose.target.y, pose.target.z));
  camera.updateProjectionMatrix();
}

export async function mountAssayScene(stage, options = {}) {
  const onFallback = typeof options.onFallback === "function" ? options.onFallback : () => {};
  const mode = resolveAssayMode(readAssayCapabilities());
  if (!mode.enhance) {
    onFallback(mode.reason);
    return null;
  }

  const host = stage?.querySelector?.("[data-assay-canvas-host]");
  if (!host) {
    onFallback("missing-host");
    return null;
  }

  const THREE = await import("/assets/vendor/three.module.min.js");
  const reviewView = normalizeAssayReviewView(options.reviewView);
  const compact = window.innerWidth < 900;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");
  canvas.tabIndex = -1;
  host.hidden = false;
  host.replaceChildren(canvas);

  const environment = createStudioEnvironmentTexture(THREE);
  scene.environment = environment;
  const root = createMonolith(THREE, compact);
  scene.add(root);
  const key = new THREE.DirectionalLight(0xfff4e4, 3.05);
  key.position.set(-4.8, 7.4, 5.2);
  const rim = new THREE.DirectionalLight(0xdde2e1, 0.78);
  rim.position.set(5.8, 3.2, -5.2);
  const fill = new THREE.HemisphereLight(0xf4eee4, 0x6f7471, 1.08);
  scene.add(key, rim, fill);

  let state = "loading";
  let disposed = false;
  let contextLost = false;
  let manuallyPaused = false;
  let inViewport = true;
  let documentVisible = !document.hidden;
  let active = true;
  let frameCount = 0;
  let triangles = 0;
  let drawCalls = 0;
  let pixelRatio = 1;
  let raf = 0;
  let firstFramePainted = false;
  let lastFrameTime = 0;
  let springStartedAt = 0;
  let motion = { yaw: 0, pitch: 0, yawVelocity: 0, pitchVelocity: 0 };
  let target = { yaw: 0, pitch: 0 };
  let measuredWidth = 0;
  let measuredHeight = 0;
  let resourcesReleased = false;

  const diagnostics = () => ({
    state,
    active,
    disposed,
    frameCount,
    triangles,
    drawCalls,
    pixelRatio,
    reviewView,
    contextLost
  });

  const syncDiagnostics = () => {
    stage.dataset.assayFrameCount = String(frameCount);
    stage.dataset.assayTriangles = String(triangles);
    stage.dataset.assayDrawCalls = String(drawCalls);
    stage.dataset.assayPixelRatio = String(pixelRatio);
  };

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || stage.clientWidth || 1));
    const height = Math.max(1, Math.round(rect.height || stage.clientHeight || 1));
    if (width === measuredWidth && height === measuredHeight) return false;
    measuredWidth = width;
    measuredHeight = height;
    pixelRatio = selectAssayPixelRatio(window.innerWidth, window.devicePixelRatio);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    configureAssayCamera(THREE, camera, reviewView, width / height);
    return true;
  };

  const cancelFrame = () => {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  };

  const applyMotion = () => {
    root.rotation.y = motion.yaw;
    root.rotation.x = motion.pitch;
  };

  const renderFrame = (timestamp) => {
    raf = 0;
    if (!active || disposed || contextLost) return;

    if (springStartedAt) {
      const elapsed = timestamp - springStartedAt;
      if (elapsed >= ASSAY_LIMITS.settleMilliseconds) {
        motion = { yaw: target.yaw, pitch: target.pitch, yawVelocity: 0, pitchVelocity: 0 };
        springStartedAt = 0;
      } else {
        const delta = lastFrameTime ? (timestamp - lastFrameTime) / 1000 : 1 / 60;
        motion = stepAssaySpring(motion, target, delta);
        const error = Math.max(Math.abs(target.yaw - motion.yaw), Math.abs(target.pitch - motion.pitch));
        const velocity = Math.max(Math.abs(motion.yawVelocity), Math.abs(motion.pitchVelocity));
        if (error < 0.0005 && velocity < 0.0005) {
          motion = { yaw: target.yaw, pitch: target.pitch, yawVelocity: 0, pitchVelocity: 0 };
          springStartedAt = 0;
        }
      }
      lastFrameTime = timestamp;
      applyMotion();
    }

    renderer.render(scene, camera);
    frameCount += 1;
    triangles = renderer.info.render.triangles;
    drawCalls = renderer.info.render.calls;
    syncDiagnostics();

    if (!firstFramePainted) {
      firstFramePainted = true;
      raf = window.requestAnimationFrame(renderFrame);
      return;
    }
    if (state === "loading") {
      state = "ready";
      options.onReady?.(diagnostics());
    }
    if (springStartedAt && !raf) raf = window.requestAnimationFrame(renderFrame);
  };

  const requestRender = () => {
    if (!raf && active && !disposed && !contextLost) raf = window.requestAnimationFrame(renderFrame);
  };

  const updateActive = (renderOnResume = true) => {
    const next = inViewport && documentVisible && !manuallyPaused && !contextLost && !disposed;
    const resumed = !active && next;
    active = next;
    if (!active) cancelFrame();
    else if (resumed && renderOnResume) requestRender();
  };

  const startSpring = (nextTarget) => {
    if (reviewView !== "match") return;
    target = nextTarget;
    springStartedAt = performance.now();
    lastFrameTime = 0;
    requestRender();
  };

  const handlePointerMove = (event) => startSpring(assayPointerIntent(event.clientX, event.clientY, stage.getBoundingClientRect()));
  const handlePointerLeave = () => startSpring({ yaw: 0, pitch: 0 });
  const handleVisibility = () => {
    documentVisible = !document.hidden;
    updateActive(true);
  };
  const handleContextRestored = () => {
    state = "fallback";
  };

  let resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(() => {
    if (resize()) requestRender();
  }) : null;
  let intersectionObserver = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
    const next = entries[0]?.isIntersecting !== false;
    const reentered = !inViewport && next;
    inViewport = next;
    updateActive(reentered);
  }, { threshold: 0 }) : null;

  const disposeReachable = (forceContext) => {
    if (resourcesReleased) return;
    resourcesReleased = true;
    cancelFrame();
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    resizeObserver = null;
    intersectionObserver = null;
    stage.removeEventListener("pointermove", handlePointerMove);
    stage.removeEventListener("pointerleave", handlePointerLeave);
    stage.removeEventListener("pointercancel", handlePointerLeave);
    document.removeEventListener("visibilitychange", handleVisibility);
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);

    const geometries = new Set();
    const materials = new Set();
    const textures = new Set([environment]);
    root.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      const objectMaterials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      objectMaterials.forEach((material) => {
        materials.add(material);
        Object.values(material).forEach((value) => {
          if (value?.isTexture) textures.add(value);
        });
      });
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture?.dispose());
    scene.environment = null;
    scene.clear();
    renderer.renderLists.dispose();
    renderer.dispose();
    if (forceContext) renderer.forceContextLoss();
    host.replaceChildren();
    host.hidden = true;
  };

  const handleContextLost = (event) => {
    event.preventDefault();
    if (contextLost || disposed) return;
    contextLost = true;
    state = "fallback";
    active = false;
    stage.dataset.assayState = "fallback";
    stage.dataset.assayFallbackReason = "context-lost";
    disposeReachable(false);
    onFallback("context-lost");
  };

  const controller = {
    pause() {
      manuallyPaused = true;
      updateActive(false);
    },
    resume() {
      manuallyPaused = false;
      updateActive(true);
    },
    requestRender,
    dispose() {
      if (disposed) return;
      disposed = true;
      active = false;
      state = "disposed";
      disposeReachable(true);
    },
    getDiagnostics() {
      return diagnostics();
    }
  };

  resize();
  stage.addEventListener("pointermove", handlePointerMove, { passive: true });
  stage.addEventListener("pointerleave", handlePointerLeave, { passive: true });
  stage.addEventListener("pointercancel", handlePointerLeave, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);
  resizeObserver?.observe(stage);
  intersectionObserver?.observe(stage);
  active = inViewport && documentVisible;
  requestRender();
  return controller;
}
