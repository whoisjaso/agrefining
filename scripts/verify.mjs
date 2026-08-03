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

const seoPages = [
  {
    path: "sell-silver-coins-houston",
    title: "Sell Silver Coins in Houston | Top Prices | AG Refining",
    description: "Sell silver coins in Houston for top prices. AG Refining offers expert evaluations, fast payment, and trusted local service.",
    h1: "Sell your silver coins in Houston."
  },
  {
    path: "silver-flake-buyer-houston",
    title: "Silver Flake Buyer in Houston, TX | AG Refining",
    description: "Sell silver flake in Houston for competitive prices. AG Refining offers expert evaluations, fast payment, and trusted refining services.",
    h1: "Sell silver flake in Houston."
  },
  {
    path: "laboratory-silver-buyer-houston",
    title: "Laboratory Silver Buyer in Houston, TX | AG Refining",
    description: "Sell laboratory silver in Houston for top value. AG Refining offers expert evaluations, fair pricing, and fast payment for silver materials.",
    h1: "Sell laboratory silver in Houston."
  },
  {
    path: "silver-solder-buyer-houston",
    title: "Silver Solder Buyer in Houston, TX | AG Refining",
    description: "Sell silver solder in Houston for competitive prices. AG Refining offers expert evaluations, fast payment, and trusted refining services.",
    h1: "Sell silver solder in Houston."
  },
  {
    path: "silver-plated-materials-buyer-houston",
    title: "Silver-Plated Materials Buyer in Houston, TX | AG Refining",
    description: "Sell silver-plated materials in Houston. AG Refining offers fair pricing, expert evaluations, and fast payment for silver-plated scrap.",
    h1: "Sell silver-plated materials in Houston."
  },
  {
    path: "dental-scrap-buyer-houston",
    title: "Dental Scrap Buyer Houston | Sell Dental Scrap | AG Refining",
    description: "Sell dental scrap in Houston with AG Refining. Competitive pricing, free pickup, on-site service, and fast payment for dental practices.",
    h1: "Sell your dental scrap with confidence."
  },
  {
    path: "silver-oxide-watch-battery-recycling-houston",
    title: "Silver Oxide Watch Battery Recycling Houston | AG Refining",
    description: "Recycle silver oxide watch batteries in Houston with AG Refining. Competitive pricing, fast service, and professional precious metal recovery.",
    h1: "Recycle silver oxide watch batteries in Houston."
  },
  {
    path: "houston-silver-buyer",
    title: "Houston Silver Buyer | Sell Scrap Silver in Houston | AG Refining",
    description: "Sell silver in Houston with AG Refining. Free pickup, on-site weighing, immediate payment, and honest pricing for commercial accounts.",
    h1: "Sell your silver with confidence."
  },
  {
    path: "x-ray-recycling-services-houston",
    title: "X-Ray Recycling Services Houston | X-Ray Film Recycling | AG Refining",
    description: "Houston X-ray recycling services for medical and industrial film. Secure silver recovery, competitive pricing, and professional service.",
    h1: "Secure X-ray film recycling in Houston."
  },
  {
    path: "scrap-silver-buyer-houston",
    title: "Scrap Silver Buyer Houston | Sell Scrap Silver | AG Refining",
    description: "Sell scrap silver in Houston with AG Refining. Top prices, free pickup, on-site weighing, and immediate payment",
    h1: "Turn your scrap silver into cash."
  }
];

for (const page of seoPages) {
  const source = readFileSync(join(out, page.path, "index.html"), "utf8");
  const expected = [
    `<title>${page.title}</title>`,
    `<meta name="description" content="${page.description}">`,
    `<link rel="canonical" href="https://agrefining.com/${page.path}">`,
    `<h1>${page.h1}</h1>`
  ];
  for (const check of expected) {
    if (!source.includes(check)) failures.push(`${page.path}: missing exact SEO field ${check}`);
  }
}

const notFound = readFileSync(join(out, "404.html"), "utf8");
if (!notFound.includes('<meta name="robots" content="noindex,follow">')) {
  failures.push("404 page must be noindex");
}

const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
const sitemapEntries = (sitemap.match(/<url>/g) || []).length;
if (sitemapEntries !== 38) failures.push(`Expected 38 sitemap pages, found ${sitemapEntries}`);

for (const page of seoPages) {
  if (!sitemap.includes(`<loc>https://agrefining.com/${page.path}</loc>`)) {
    failures.push(`Sitemap is missing ${page.path}`);
  }
}

const replacedPaths = [
  "silver-coin-buyers-houston",
  "dental-scrap",
  "silver-oxide-battery-recycling",
  "silver-scrap-buyer-houston"
];
for (const path of replacedPaths) {
  if (sitemap.includes(`<loc>https://agrefining.com/${path}</loc>`)) {
    failures.push(`Sitemap still includes replaced route ${path}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`AG_REFINING_VERIFY_OK (${htmlFiles.length} HTML files, ${sitemapEntries} indexed pages)`);
