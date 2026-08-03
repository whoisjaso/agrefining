// Adopt freshly downloaded images into the generated/ inbox under the names
// import-generated.mjs expects, so nothing has to be renamed by hand.
//
//   node scripts/adopt-downloads.mjs            # dry run, shows the mapping
//   node scripts/adopt-downloads.mjs --apply    # copies the files
//   node scripts/adopt-downloads.mjs --from "C:\some\folder" --apply
//
// Takes the 8 most recent images in the source folder and assigns them in
// download order, which matches the order the images were produced. Always
// dry-runs first: putting the wrong photo on the wrong material page is worse
// than a second command.

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outbox = join(dirname(root), "dennis-docs", "generated");

const argv = process.argv.slice(2);
const apply = argv.includes("--apply");
const fromIdx = argv.indexOf("--from");
const source = fromIdx !== -1 ? argv[fromIdx + 1] : join(process.env.USERPROFILE || "", "Downloads");

// Order matches the order the eight prompts were given.
const ORDER = [
  "silver-bars",
  "silver-flake",
  "silver-solder",
  "industrial-silver",
  "silver-plated",
  "laboratory-silver",
  "dental-scrap",
  "social-card"
];

const EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

if (!existsSync(source)) {
  console.error(`source folder not found: ${source}`);
  process.exit(1);
}

const candidates = readdirSync(source)
  .filter((n) => EXTS.has(extname(n).toLowerCase()))
  .map((n) => {
    const p = join(source, n);
    return { name: n, path: p, mtime: statSync(p).mtimeMs, size: statSync(p).size };
  })
  .sort((a, b) => b.mtime - a.mtime)
  .slice(0, ORDER.length)
  .sort((a, b) => a.mtime - b.mtime);

if (!candidates.length) {
  console.error(`no images found in ${source}`);
  process.exit(1);
}

console.log(`source: ${source}`);
console.log(`found ${candidates.length} image(s), mapping in download order:\n`);

candidates.forEach((c, i) => {
  const target = ORDER[i] ? `${ORDER[i]}${extname(c.name).toLowerCase()}` : "(unassigned)";
  console.log(`  ${String(i + 1).padStart(2)}. ${c.name.padEnd(42)} ${(c.size / 1024).toFixed(0).padStart(6)} KB  ->  ${target}`);
});

if (candidates.length !== ORDER.length) {
  console.log(`\nexpected ${ORDER.length} images, found ${candidates.length}.`);
}

if (!apply) {
  console.log("\ndry run. If the mapping above is right, re-run with --apply");
  process.exit(0);
}

mkdirSync(outbox, { recursive: true });
let n = 0;
candidates.forEach((c, i) => {
  if (!ORDER[i]) return;
  const target = join(outbox, `${ORDER[i]}${extname(c.name).toLowerCase()}`);
  copyFileSync(c.path, target);
  console.log(`copied ${ORDER[i]}${extname(c.name).toLowerCase()}`);
  n++;
});
console.log(`\n${n} copied to ${outbox}`);
console.log("next: node scripts/import-generated.mjs");
