import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const required = [
  "package.json",
  "vercel.json",
  "src/style.css",
  "src/site.js",
  "scripts/build.mjs",
  "api/leads.js",
  "assets/ag-mark-path.svg",
  "assets/ag-silver-hero-1600.webp",
  "assets/ag-silver-hero-mobile.webp",
  "assets/material-dental-1280.webp",
  "assets/material-scrap-silver-1280.webp",
  "assets/material-watch-batteries-1280.webp",
  "assets/material-xray-film-1280.webp",
  "assets/fonts/newsreader-latin-opsz.woff2",
  "assets/fonts/manrope-latin-wght.woff2"
];
const failures = required.filter((file) => !existsSync(join(root, file))).map((file) => `Missing ${file}`);
const banned = [/\u2014/u, /[\u{1F300}-\u{1FAFF}]/u];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const ignored = [`${sep}.git${sep}`, `${sep}node_modules${sep}`, `${sep}dist${sep}`];
// Binary files are not text: decoding them as utf8 can produce byte sequences
// that land in the banned emoji ranges and fail the build for no reason.
const binary = [".png", ".webp", ".jpg", ".jpeg", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".pdf", ".zip", ".docx"];
for (const path of files(root).filter(
  (path) => !ignored.some((part) => path.includes(part)) && !binary.some((ext) => path.toLowerCase().endsWith(ext))
)) {
  const source = readFileSync(path, "utf8");
  if (banned.some((pattern) => pattern.test(source))) failures.push(`Banned character in ${path.replace(root, "")}`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("AG_REFINING_CHECK_OK");
