import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import test from "node:test";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const clips = [
  ["ag-refining-molten-pour", 6, 10],
  ["ag-refining-silver-ingots", 6, 10],
  ["ag-refining-precision-assay", 6, 10]
];
const posters = [
  { name: "ag-refining-molten-pour-poster.webp", width: 2560, height: 1440, minBytes: 80 * 1024, maxBytes: 600 * 1024 },
  { name: "ag-refining-silver-ingots-poster.webp", width: 1280, height: 720, minBytes: 10 * 1024, maxBytes: 96 * 1024 },
  { name: "ag-refining-precision-assay-poster.webp", width: 1280, height: 720, minBytes: 10 * 1024, maxBytes: 96 * 1024 }
];

function mediaProbe(path) {
  return JSON.parse(execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "stream=codec_type,codec_name,pix_fmt,width,height,r_frame_rate",
    "-show_entries", "format=duration",
    "-of", "json",
    path
  ], { encoding: "utf8" }));
}

function frameRate(value) {
  const [numerator, denominator] = value.split("/").map(Number);
  return numerator / denominator;
}

test("cinematic source videos meet the production media contract", () => {
  for (const [clip, minimumDuration, maximumDuration] of clips) {
    for (const [extension, codec, maximumSize] of [
      ["mp4", "h264", 2.5 * 1024 * 1024],
      ["webm", "vp9", 2 * 1024 * 1024]
    ]) {
      const path = join(root, "videos", `${clip}.${extension}`);
      assert.ok(existsSync(path), `Missing source media: ${path}`);
      assert.ok(statSync(path).size > 100 * 1024, `${path} must be greater than 100 KiB`);
      assert.ok(statSync(path).size <= maximumSize, `${path} exceeds its optimized file-size ceiling`);

      const probe = mediaProbe(path);
      const videoStreams = probe.streams.filter((stream) => stream.codec_type === "video");
      const audioStreams = probe.streams.filter((stream) => stream.codec_type === "audio");
      const subtitleStreams = probe.streams.filter((stream) => stream.codec_type === "subtitle");
      const dataStreams = probe.streams.filter((stream) => stream.codec_type === "data");
      assert.equal(videoStreams.length, 1, `${path} must contain exactly one video stream`);
      assert.equal(audioStreams.length, 0, `${path} must not contain audio streams`);
      assert.equal(subtitleStreams.length, 0, `${path} must not contain subtitle streams`);
      assert.equal(dataStreams.length, 0, `${path} must not contain data streams`);

      const [video] = videoStreams;
      assert.equal(video.codec_name, codec, `${path} must use ${codec}`);
      assert.equal(video.pix_fmt, "yuv420p", `${path} must use yuv420p`);
      assert.equal(video.width, 1280, `${path} must be 1280 pixels wide`);
      assert.equal(video.height, 720, `${path} must be 720 pixels high`);
      assert.equal(frameRate(video.r_frame_rate), 24, `${path} must be 24 fps`);

      const duration = Number(probe.format.duration);
      assert.ok(duration >= minimumDuration && duration <= maximumDuration, `${path} duration must be within ${minimumDuration}-${maximumDuration} seconds`);
    }
  }
});

test("cinematic posters meet the production media contract", async () => {
  for (const poster of posters) {
    const path = join(root, "images", poster.name);
    assert.ok(existsSync(path), `Missing source media: ${path}`);
    assert.ok(statSync(path).size > poster.minBytes, `${path} must be greater than ${Math.round(poster.minBytes / 1024)} KiB`);
    assert.ok(statSync(path).size < poster.maxBytes, `${path} must be smaller than ${Math.round(poster.maxBytes / 1024)} KiB`);

    const metadata = await sharp(path).metadata();
    assert.equal(metadata.format, "webp", `${path} must be WebP`);
    assert.equal(metadata.width, poster.width, `${path} must be ${poster.width} pixels wide`);
    assert.equal(metadata.height, poster.height, `${path} must be ${poster.height} pixels high`);
  }
});

test("a static build publishes every cinematic media file at its public path", () => {
  for (const [clip] of clips) {
    for (const extension of ["mp4", "webm"]) {
      const path = join(root, "dist", "videos", `${clip}.${extension}`);
      assert.ok(existsSync(path), `Missing built media: ${path}`);
    }
  }
  for (const poster of posters) {
    const path = join(root, "dist", "images", poster.name);
    assert.ok(existsSync(path), `Missing built media: ${path}`);
  }
});
