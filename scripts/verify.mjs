import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "dist");
const failures = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function localTarget(url) {
  const path = url.split(/[?#]/)[0];
  if (path === "/") return join(out, "index.html");
  if (path === "/api/leads") return join(root, "api", "leads.js");
  const target = join(out, path.replace(/^\//, ""));
  if (existsSync(target) && statSync(target).isFile()) return target;
  return join(target, "index.html");
}

const htmlFiles = walk(out).filter((path) => path.endsWith(".html"));
for (const path of htmlFiles) {
  const source = readFileSync(path, "utf8");
  const displayPath = relative(out, path);
  const titles = source.match(/<title>[^<]*<\/title>/g) || [];
  const descriptions = source.match(/<meta name="description" content="[^"]*">/g) || [];
  const h1s = source.match(/<h1(?:\s[^>]*)?>/g) || [];
  if (titles.length !== 1) failures.push(`${displayPath}: expected one title`);
  if (descriptions.length !== 1) failures.push(`${displayPath}: expected one meta description`);
  if (h1s.length !== 1) failures.push(`${displayPath}: expected one h1`);
  if (/\b(?:undefined|NaN)\b/.test(source)) failures.push(`${displayPath}: contains unresolved output`);

  const ids = [...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) failures.push(`${displayPath}: duplicate id ${duplicateIds[0]}`);

  const urls = [...source.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const url of urls) {
    if (!url.startsWith("/") || url.startsWith("//")) continue;
    const target = localTarget(url);
    if (!existsSync(target)) failures.push(`${displayPath}: missing local target ${url}`);
  }
}

const home = readFileSync(join(out, "index.html"), "utf8");
const exactHomeChecks = [
  "<title>Houston Silver Buyer | Sell Scrap Silver in Houston | AG Refining</title>",
  '<meta name="description" content="Sell silver in Houston with AG Refining. Free pickup, on-site weighing, immediate payment, and honest pricing for commercial accounts.">',
  "<h1>Turn silver-bearing material into cash.</h1>"
];
for (const expected of exactHomeChecks) {
  if (!home.includes(expected)) failures.push(`Homepage is missing: ${expected}`);
}

const notFound = readFileSync(join(out, "404.html"), "utf8");
if (!notFound.includes('<meta name="robots" content="noindex,follow">')) {
  failures.push("404 page must be noindex");
}

const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
const sitemapEntries = (sitemap.match(/<url>/g) || []).length;
if (sitemapEntries !== 30) failures.push(`Expected 30 sitemap pages, found ${sitemapEntries}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`AG_REFINING_VERIFY_OK (${htmlFiles.length} HTML files, ${sitemapEntries} indexed pages)`);
