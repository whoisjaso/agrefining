// Batch-import the generated page images.
//
//   node scripts/import-generated.mjs [--force]
//
// Reads from ../dennis-docs/generated/ and writes optimised WebP into assets/
// at the sizes the markup already expects. Reports anything still missing so a
// partial drop is obvious rather than silent.

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const inbox = join(dirname(root), "dennis-docs", "generated");
const force = process.argv.includes("--force");

// source filename -> [asset basename, preset, webp quality]
// Quality is tuned per subject: busy reflective metal needs a lower number to
// stay under roughly 180 KB, flat studio backgrounds tolerate more.
const JOBS = [
  ["silver-bars", "material-silver-bars", "material", 72],
  ["silver-flake", "material-silver-flake", "material", 74],
  ["silver-solder", "material-silver-solder", "material", 68],
  ["industrial-silver", "material-industrial-silver", "material", 68],
  ["silver-plated", "material-silver-plated", "material", 68],
  ["laboratory-silver", "material-laboratory-silver", "material", 74],
  ["dental-scrap", "material-dental-scrap", "material", 72],
  ["social-card", "ag-silver-social", "social", 78]
];

const EXTS = [".png", ".jpg", ".jpeg", ".webp"];

function findSource(stem) {
  for (const ext of EXTS) {
    const p = join(inbox, stem + ext);
    if (existsSync(p)) return p;
  }
  return null;
}

if (!existsSync(inbox)) {
  console.error(`inbox not found: ${inbox}`);
  process.exit(1);
}

const missing = [];
let done = 0;

for (const [stem, basename, preset, quality] of JOBS) {
  const src = findSource(stem);
  if (!src) {
    missing.push(stem);
    continue;
  }
  console.log(`\n=== ${stem} -> ${basename} (${preset}, q${quality})`);
  const args = [join(root, "scripts", "optimize-asset.mjs"), src, basename, "--preset", preset, "--quality", String(quality)];
  if (force) args.push("--force");
  const r = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`failed on ${stem}`);
    process.exit(r.status || 1);
  }
  done++;
}

console.log(`\n${done}/${JOBS.length} imported`);
if (missing.length) {
  console.log(`missing from ${inbox}:`);
  for (const m of missing) console.log(`  ${m}.png`);
}
