// Import a generated image into the site's asset set.
//
//   node scripts/import-asset.mjs <url> <filename.webp> [--force]
//
// Downloads one image to assets/<filename.webp> and prints its true intrinsic
// size for the <img> tag, so markup keeps correct sizing and does not shift
// layout while loading.
//
// One file per call, on purpose. There is no image library in this project, so
// nothing here can resize: generate each size natively (gpt-image-2 accepts any
// WxH whose edges are multiples of 16) and import it separately. Desktop and
// mobile sources must be genuinely different files, or phones pay to download
// desktop-sized art.
//
// Generated assets are committed. scripts/fetch-assets.mjs only manages the
// hash-pinned originals and ignores anything else; scripts/build.mjs copies the
// whole assets/ directory into dist.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const assets = join(root, "assets");

const [, , url, filename, ...flags] = process.argv;

if (!url || !filename) {
  console.error("usage: node scripts/import-asset.mjs <url> <filename.webp> [--force]");
  process.exit(1);
}
if (!/^[a-z0-9-]+\.(webp|png|jpg)$/.test(filename)) {
  console.error(`filename must be kebab-case with a .webp/.png/.jpg extension, got "${filename}"`);
  process.exit(1);
}

// Minimal WebP/PNG/JPEG header reader so we can report true intrinsic size
// without adding an image dependency.
function dimensions(buf) {
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") {
    const fmt = buf.slice(12, 16).toString("ascii");
    if (fmt === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (fmt === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
    }
    if (fmt === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  }
  if (buf.slice(1, 4).toString("ascii") === "PNG") {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

const target = join(assets, filename);
if (existsSync(target) && !flags.includes("--force")) {
  console.error(`${filename} already exists. Pass --force to overwrite.`);
  process.exit(1);
}

const res = await fetch(url);
if (!res.ok) {
  console.error(`download failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const bytes = Buffer.from(await res.arrayBuffer());

mkdirSync(assets, { recursive: true });
writeFileSync(target, bytes);

const kb = bytes.length / 1024;
console.log(`wrote assets/${filename}  ${kb.toFixed(1)} KB`);

const dims = dimensions(bytes);
if (dims) {
  console.log(`intrinsic size: ${dims.w}x${dims.h}`);
  console.log(`markup: width="${dims.w}" height="${dims.h}"`);
} else {
  console.log("could not read intrinsic size; set width/height manually");
}

if (kb > 220) {
  console.log(`\nwarning: ${kb.toFixed(0)} KB is heavy for a page image.`);
  console.log("Regenerate with output_format webp and output_compression around 70.");
}
