// Accessibility sweep: runs axe-core (WCAG 2 A and AA rules) on every page in
// the sitemap at phone and desktop widths. New pages are covered automatically
// because the list comes from dist/sitemap.xml.
import { chmodSync, createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, relative, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { createBrotliDecompress } from "node:zlib";
import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";
import tar from "tar-fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const chromiumRoot = "/tmp/agrefining-site-chrome-chromium-149";
const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"]
]);

function requestFile(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://127.0.0.1").pathname);
  const localPath = normalize(pathname).replace(/^[/\\]+/, "");
  let candidate = join(dist, localPath || "index.html");
  const local = relative(dist, candidate);
  if (local === ".." || local.startsWith(`..${sep}`) || local.includes(`${sep}..${sep}`)) return null;
  if (existsSync(candidate) && statSync(candidate).isDirectory()) candidate = join(candidate, "index.html");
  return existsSync(candidate) && statSync(candidate).isFile() ? candidate : null;
}

function staticServer() {
  return createServer((request, response) => {
    const file = requestFile(request.url ?? "/");
    if (!file) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": mimeTypes.get(extname(file)) ?? "application/octet-stream"
    });
    createReadStream(file).pipe(response);
  });
}

async function extractTarBrotli(archive, output, marker) {
  if (existsSync(marker)) return;
  mkdirSync(output, { recursive: true });
  await pipeline(
    createReadStream(archive),
    createBrotliDecompress(),
    tar.extract(output, { chown: false })
  );
  writeFileSync(marker, "complete\n");
}

async function chromiumExecutable() {
  const binary = join(chromiumRoot, "chromium");
  const packageBin = join(root, "node_modules", "@sparticuz", "chromium", "bin");
  const fontConfigRoot = join(chromiumRoot, "fontconfig");
  const fontConfigFile = join(fontConfigRoot, "fonts.conf");
  mkdirSync(chromiumRoot, { recursive: true });
  if (!existsSync(binary) || statSync(binary).size < 10_000_000) {
    await pipeline(
      createReadStream(join(packageBin, "chromium.br")),
      createBrotliDecompress(),
      createWriteStream(binary, { mode: 0o700 })
    );
    chmodSync(binary, 0o700);
  }
  await extractTarBrotli(join(packageBin, "fonts.tar.br"), join(chromiumRoot, "fonts"), join(chromiumRoot, ".fonts-complete"));
  await extractTarBrotli(join(packageBin, "swiftshader.tar.br"), chromiumRoot, join(chromiumRoot, ".swiftshader-complete"));
  mkdirSync(fontConfigRoot, { recursive: true });
  writeFileSync(fontConfigFile, `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${join(chromiumRoot, "fonts", "fonts")}</dir>
  <cachedir>${join(chromiumRoot, "font-cache")}</cachedir>
</fontconfig>\n`);
  process.env.FONTCONFIG_PATH = fontConfigRoot;
  process.env.FONTCONFIG_FILE = fontConfigFile;
  process.env.LD_LIBRARY_PATH = [chromiumRoot, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
  return binary;
}

const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
const routes = [...sitemap.matchAll(/<loc>https:\/\/www\.agrefining\.com([^<]*)<\/loc>/g)].map((match) => match[1] || "/");
// The sell portal is kept out of the sitemap on purpose, so it is added here by hand.
routes.push("/sell", "/vender");
const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 960 }
];

const server = staticServer();
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const browser = await playwrightChromium.launch({ executablePath: await chromiumExecutable(), args: chromium.args, headless: true });
const failures = [];
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route(/\.(?:mp4|webm)(?:\?.*)?$/, (route) => route.abort());
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of routes) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });
      await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
      await page.evaluate(() => document.documentElement.classList.add("is-loaded"));
      await page.waitForTimeout(150);
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } });
        return result.violations.map((violation) => `${violation.id}: ${violation.nodes.slice(0, 3).map((node) => node.target.join(" ")).join(" | ")}`);
      });
      for (const violation of violations) failures.push(`${viewport.name} ${route} ${violation}`);
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`A11Y_BROWSER_OK (${routes.length} pages x ${viewports.length} viewports)`);
