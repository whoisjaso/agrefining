import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

import * as assayScene from "../src/assay-scene.js";

const {
  ASSAY_LIMITS,
  assayBowlProfile,
  assayBowlTone,
  assayCalibrationPaths,
  assayCameraPose,
  assayPointerIntent,
  generateAssaySurfaceFields,
  normalizeAssayReviewView,
  normalizedAssayUv,
  resolveAssayMode,
  selectAssayPixelRatio,
  stepAssaySpring
} = assayScene;

const literalSevenDegrees = 7 * Math.PI / 180;
const literalFourDegrees = 4 * Math.PI / 180;

function scalarChannel(bytes, offset = 0) {
  const values = new Float64Array(bytes.length / 4);
  for (let source = offset, target = 0; source < bytes.length; source += 4, target += 1) values[target] = bytes[source];
  return values;
}

function mean(values) {
  let total = 0;
  for (const value of values) total += value;
  return total / values.length;
}

function standardDeviation(values) {
  const center = mean(values);
  let squared = 0;
  for (const value of values) squared += (value - center) ** 2;
  return Math.sqrt(squared / values.length);
}

function correlation(a, b) {
  assert.equal(a.length, b.length);
  const meanA = mean(a);
  const meanB = mean(b);
  let covariance = 0;
  let varianceA = 0;
  let varianceB = 0;
  for (let index = 0; index < a.length; index += 1) {
    const deltaA = a[index] - meanA;
    const deltaB = b[index] - meanB;
    covariance += deltaA * deltaB;
    varianceA += deltaA ** 2;
    varianceB += deltaB ** 2;
  }
  return covariance / Math.sqrt(varianceA * varianceB);
}

function lagCorrelation(values, size, lag, axis) {
  const first = [];
  const second = [];
  if (axis === "x") {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size - lag; x += 1) {
        first.push(values[y * size + x]);
        second.push(values[y * size + x + lag]);
      }
    }
  } else {
    for (let y = 0; y < size - lag; y += 1) {
      for (let x = 0; x < size; x += 1) {
        first.push(values[y * size + x]);
        second.push(values[(y + lag) * size + x]);
      }
    }
  }
  return correlation(first, second);
}

function meanExcursion(values, size, axis) {
  const means = [];
  for (let outer = 0; outer < size; outer += 1) {
    let total = 0;
    for (let inner = 0; inner < size; inner += 1) {
      const index = axis === "row" ? outer * size + inner : inner * size + outer;
      total += values[index];
    }
    means.push(total / size);
  }
  return Math.max(...means) - Math.min(...means);
}

test("capability policy blocks expensive enhancement before allowing an interactive desktop", () => {
  const cases = [
    [{ saveData: true, reducedMotion: false, coarsePointer: false, hasWebGL: true }, { enhance: false, reason: "save-data" }],
    [{ saveData: false, reducedMotion: true, coarsePointer: false, hasWebGL: true }, { enhance: false, reason: "reduced-motion" }],
    [{ saveData: false, reducedMotion: false, coarsePointer: true, hasWebGL: true }, { enhance: false, reason: "coarse-pointer" }],
    [{ saveData: false, reducedMotion: false, coarsePointer: false, hasWebGL: false }, { enhance: false, reason: "no-webgl" }],
    [{ saveData: false, reducedMotion: false, coarsePointer: false, hasWebGL: true }, { enhance: true, reason: "interactive" }]
  ];

  for (const [capabilities, expected] of cases) {
    assert.deepEqual(resolveAssayMode(capabilities), expected);
  }
});

test("pointer intent clamps extreme coordinates to the public seven-by-four-degree envelope", () => {
  const rect = { left: 100, top: 200, width: 400, height: 200 };
  assert.equal(ASSAY_LIMITS.yawRadians, literalSevenDegrees);
  assert.equal(ASSAY_LIMITS.pitchRadians, literalFourDegrees);
  assert.deepEqual(assayPointerIntent(10_000, -10_000, rect), {
    yaw: literalSevenDegrees,
    pitch: literalFourDegrees
  });
  assert.deepEqual(assayPointerIntent(-10_000, 10_000, rect), {
    yaw: -literalSevenDegrees,
    pitch: -literalFourDegrees
  });
});

test("neutral silver fields are deterministic, independent, and free of broad periodic bands", () => {
  assert.equal(typeof generateAssaySurfaceFields, "function", "the non-periodic field generator is missing");
  const size = 256;
  const startedAt = performance.now();
  const first = generateAssaySurfaceFields(size);
  const generationMilliseconds = performance.now() - startedAt;
  const second = generateAssaySurfaceFields(size);
  assert.ok(generationMilliseconds < 50, `surface field generation took ${generationMilliseconds.toFixed(1)}ms`);
  assert.deepEqual(first, second, "surface fields are not deterministic");
  for (const name of ["albedo", "roughness", "normal"]) {
    assert.ok(first[name] instanceof Uint8Array, `${name} is not byte data`);
    assert.equal(first[name].length, size * size * 4, `${name} dimensions`);
  }

  const albedo = scalarChannel(first.albedo);
  const roughness = scalarChannel(first.roughness);
  const normalX = scalarChannel(first.normal);
  const normalY = scalarChannel(first.normal, 1);

  for (let index = 0; index < first.albedo.length; index += 4) {
    assert.equal(first.albedo[index], first.albedo[index + 1], `albedo green chroma at ${index / 4}`);
    assert.equal(first.albedo[index], first.albedo[index + 2], `albedo blue chroma at ${index / 4}`);
  }

  assert.ok(mean(albedo) >= 230 && mean(albedo) <= 235, `albedo mean ${mean(albedo)}`);
  assert.ok(standardDeviation(albedo) >= 3 && standardDeviation(albedo) <= 5.5, `albedo sigma ${standardDeviation(albedo)}`);
  assert.ok(Math.min(...albedo) >= 220 && Math.max(...albedo) <= 242, "albedo exceeds the neutral silver range");
  assert.ok(mean(roughness) / 255 >= 0.5 && mean(roughness) / 255 <= 0.58, `roughness mean ${mean(roughness) / 255}`);
  assert.ok(standardDeviation(roughness) / 255 >= 0.035 && standardDeviation(roughness) / 255 <= 0.06, `roughness sigma ${standardDeviation(roughness) / 255}`);
  assert.ok(Math.min(...roughness) / 255 >= 0.42 && Math.max(...roughness) / 255 <= 0.66, "roughness exceeds the cast-silver range");

  assert.ok(meanExcursion(albedo, size, "row") <= 4.5, "albedo has a broad horizontal band");
  assert.ok(meanExcursion(albedo, size, "column") <= 4.5, "albedo has a broad vertical band");
  for (const lag of [64, 128]) {
    for (const axis of ["x", "y"]) {
      assert.ok(Math.abs(lagCorrelation(albedo, size, lag, axis)) < 0.18, `albedo periodic correlation at ${axis}${lag}`);
      assert.ok(Math.abs(lagCorrelation(roughness, size, lag, axis)) < 0.18, `roughness periodic correlation at ${axis}${lag}`);
      assert.ok(Math.abs(lagCorrelation(normalX, size, lag, axis)) < 0.18, `normal periodic correlation at ${axis}${lag}`);
    }
  }
  assert.ok(Math.abs(correlation(albedo, roughness)) < 0.3, "albedo and roughness reuse the same field");
  assert.ok(Math.abs(correlation(roughness, normalX)) < 0.3, "roughness and normal reuse the same field");

  let castDefects = 0;
  for (let index = 0; index < albedo.length; index += 1) {
    if (albedo[index] <= 223 || Math.hypot(normalX[index] - 128, normalY[index] - 128) >= 14) castDefects += 1;
  }
  const defectRatio = castDefects / albedo.length;
  assert.ok(defectRatio >= 0.0015 && defectRatio <= 0.08, `cast defects are not sparse (${defectRatio})`);
});

test("dominant-face UVs map every body face once instead of repeating in object-space units", () => {
  assert.equal(typeof normalizedAssayUv, "function", "the dominant-face UV mapper is missing");
  const bounds = { min: { x: -2.4, y: -0.4, z: -0.85 }, max: { x: 2.4, y: 0.4, z: 0.85 } };
  assert.deepEqual(normalizedAssayUv({ x: 0, y: 0.4, z: 0 }, { x: 0, y: 1, z: 0 }, bounds), { u: 0.5, v: 0.5 });
  assert.deepEqual(normalizedAssayUv({ x: 0, y: 0, z: 0.85 }, { x: 0, y: 0, z: 1 }, bounds), { u: 0.5, v: 0.5 });
  assert.deepEqual(normalizedAssayUv({ x: 2.4, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, bounds), { u: 0.5, v: 0.5 });
  assert.deepEqual(normalizedAssayUv({ x: -2.4, y: -0.4, z: -0.85 }, { x: 0, y: 1, z: 0 }, bounds), { u: 0, v: 0 });
  assert.deepEqual(normalizedAssayUv({ x: 2.4, y: 0.4, z: 0.85 }, { x: 0, y: 1, z: 0 }, bounds), { u: 1, v: 1 });
});

test("bowl, blue wrap, and review-camera contracts expose the repaired form at graded angles", () => {
  assert.equal(typeof assayBowlProfile, "function", "the bowl profile contract is missing");
  assert.equal(typeof assayBowlTone, "function", "the bowl tone contract is missing");
  assert.equal(typeof assayCalibrationPaths, "function", "the flush calibration path contract is missing");
  assert.equal(typeof assayCameraPose, "function", "the camera framing contract is missing");

  const bowl = assayBowlProfile();
  assert.ok(bowl.length >= 6);
  assert.ok(bowl.every((point, index) => index === 0 || point.radius > bowl[index - 1].radius), "bowl radii are not ordered");
  assert.ok(bowl[0].y >= 0.375 && bowl[0].y <= 0.388, "bowl floor does not sit tightly above the body cap");
  const floorEdge = bowl.find(({ radius }) => radius >= 0.06);
  const wallTop = bowl.find(({ radius }) => radius >= 0.21);
  assert.ok(floorEdge.y - bowl[0].y <= 0.008, "bowl floor is not a distinct plane");
  assert.ok(wallTop.y - floorEdge.y >= 0.065, "bowl wall is too shallow to read as a recess");
  assert.ok(bowl.at(-1).y - bowl[0].y >= 0.09, "bowl concavity is too shallow to remain legible at the graded angle");
  const centerTone = assayBowlTone(0);
  const innerWallTone = assayBowlTone(bowl.at(-1).radius * 0.48);
  const rimTone = assayBowlTone(bowl.at(-1).radius);
  assert.ok(centerTone.r <= rimTone.r * 0.7, "bowl floor is not dark enough to prove recession");
  assert.ok(innerWallTone.r <= centerTone.r * 0.62, "bowl inner wall does not create a legible recessed edge");
  assert.ok(Math.max(centerTone.r, centerTone.g, centerTone.b) - Math.min(centerTone.r, centerTone.g, centerTone.b) <= 0.015, "bowl floor introduces color cast");
  assert.ok(Math.max(rimTone.r, rimTone.g, rimTone.b) - Math.min(rimTone.r, rimTone.g, rimTone.b) <= 0.015, "bowl rim introduces color cast");

  const calibration = assayCalibrationPaths();
  for (const side of ["left", "right"]) {
    const path = calibration[side];
    assert.ok(path.length >= 4, `${side} wrap does not follow the rounded transition`);
    assert.ok(Math.max(...path.map(({ y }) => y)) - Math.min(...path.map(({ y }) => y)) <= 0.12, `${side} wrap reads as a tall tab`);
    assert.ok(Math.max(...path.map(({ x }) => x)) - Math.min(...path.map(({ x }) => x)) >= 0.1, `${side} wrap does not turn flush around the end`);
  }

  const match = assayCameraPose("match", 691 / 624);
  const wide = assayCameraPose("match", 832 / 624);
  const side = assayCameraPose("side", 691 / 624);
  const grazing = assayCameraPose("grazing", 691 / 624);
  const distance = ({ position, target }) => Math.hypot(position.x - target.x, position.y - target.y, position.z - target.z);
  assert.ok(distance(match) >= 7.2 && distance(match) <= 8.4, `match framing distance is ${distance(match)}`);
  assert.ok(distance(wide) < distance(match), "wide framing does not compensate for the wider stage");
  assert.ok(match.target.y >= 0.1 && match.target.y <= 0.18, "match target does not ground the object in frame");
  assert.ok(Math.abs(side.position.z / side.position.x) >= 0.35, "side proof is too end-on to show the bowl");
  assert.ok(side.position.y / distance(side) >= 0.35, "side proof lacks enough elevation for the bowl");
  assert.ok(grazing.position.y / distance(grazing) >= 0.24, "grazing proof hides the bowl concavity");
});

test("zero-sized stages produce neutral pointer intent", () => {
  assert.deepEqual(assayPointerIntent(120, 80, { left: 0, top: 0, width: 0, height: 200 }), { yaw: 0, pitch: 0 });
  assert.deepEqual(assayPointerIntent(120, 80, { left: 0, top: 0, width: 200, height: 0 }), { yaw: 0, pitch: 0 });
});

test("spring motion stays bounded and settles inside the 1200ms ceiling", () => {
  const target = {
    yaw: ASSAY_LIMITS.yawRadians,
    pitch: -ASSAY_LIMITS.pitchRadians
  };
  let state = { yaw: 0, pitch: 0, yawVelocity: 0, pitchVelocity: 0 };
  let settledAt = null;

  for (let frame = 1; frame <= 72; frame += 1) {
    state = stepAssaySpring(state, target, 1 / 60);
    assert.ok(Math.abs(state.yaw) <= ASSAY_LIMITS.yawRadians);
    assert.ok(Math.abs(state.pitch) <= ASSAY_LIMITS.pitchRadians);
    const error = Math.max(Math.abs(target.yaw - state.yaw), Math.abs(target.pitch - state.pitch));
    const velocity = Math.max(Math.abs(state.yawVelocity), Math.abs(state.pitchVelocity));
    if (error < 0.0005 && velocity < 0.0005) {
      settledAt = frame * (1000 / 60);
      break;
    }
  }

  assert.ok(settledAt !== null, "spring did not settle within 1200ms");
  assert.ok(settledAt <= ASSAY_LIMITS.settleMilliseconds);
});

test("pixel ratio policy caps desktop and compact fine-pointer rendering", () => {
  assert.equal(selectAssayPixelRatio(1440, 3), 1.5);
  assert.equal(selectAssayPixelRatio(768, 3), 1.25);
  assert.equal(selectAssayPixelRatio(1440, Number.NaN), 1);
  assert.equal(selectAssayPixelRatio(768, 0), 1);
});

test("review views are allowlisted and invalid values normalize to match", () => {
  assert.equal(normalizeAssayReviewView("match"), "match");
  assert.equal(normalizeAssayReviewView("side"), "side");
  assert.equal(normalizeAssayReviewView("grazing"), "grazing");
  assert.equal(normalizeAssayReviewView("orbit"), "match");
  assert.equal(normalizeAssayReviewView(undefined), "match");
});
