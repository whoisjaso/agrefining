// Browser check of /silver-price-houston: live price, refresh, 30-day chart, failure and
// no-JavaScript fallbacks. Run after `npm run build`:  node tests/silver-price-browser.mjs [--shots]
import assert from "node:assert/strict";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const shots = process.argv.includes("--shots") ? join(root, "docs", "qa", "growth-captures") : null;
if (shots) mkdirSync(shots, { recursive: true });

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let path = join(dist, normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)));
  if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
  if (!path.startsWith(dist) || !existsSync(path)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[extname(path)] || "application/octet-stream" });
  createReadStream(path).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const candidates = [process.env.CHROME_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/tmp/agrefining-site-chrome-chromium-149/chromium"].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
assert.ok(executablePath, "Set CHROME_PATH to a Chromium binary");
const browser = await chromium.launch({ executablePath, headless: true });

const closes = [58.42, 58.9, 58.61, 59.37, 59.95, 59.6, 60.18, 60.84, 60.3, 61.07, 61.55, 61.2, 60.71, 61.38, 61.9, 62.44, 62.05, 61.66, 62.31, 62.87, 62.58];
const points = closes.map((close, i) => ({ date: new Date(Date.UTC(2026, 8, 14 + i)).toISOString().slice(0, 10), close }));

async function open(viewport, { spot = 62.734, history = true, javaScriptEnabled = true, isMobile = false } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile, hasTouch: isMobile, javaScriptEnabled });
  const page = await context.newPage();
  const errors = [];
  const calls = { spot: 0, history: 0 };
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/spot**", (route) => {
    if (new URL(route.request().url()).searchParams.get("range") === "30d") {
      calls.history += 1;
      return history
        ? route.fulfill({ contentType: "application/json", body: JSON.stringify({ range: "30d", source: "comex", points, fetchedAt: new Date().toISOString() }) })
        : route.fulfill({ status: 502, contentType: "application/json", body: "{}" });
    }
    calls.spot += 1;
    return spot
      ? route.fulfill({ contentType: "application/json", body: JSON.stringify({ price: spot, source: "test", updatedAt: new Date(Date.now() - 25_000).toISOString(), fetchedAt: new Date().toISOString() }) })
      : route.fulfill({ status: 502, contentType: "application/json", body: "{}" });
  });
  await page.goto(`${base}/silver-price-houston`);
  return { context, page, errors, calls };
}
const text = (page, sel) => page.locator(sel).innerText();
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

// ---------- Desktop: live price, chart, refresh ----------
{
  const { context, page, errors, calls } = await open({ width: 1280, height: 900 });
  await page.waitForFunction(() => document.querySelector("[data-spot-panel]").dataset.state === "live");
  assert.equal(await text(page, "[data-spot-price]"), "$62.73");
  assert.equal(await page.locator("[data-spot-unit]").isVisible(), true);
  assert.match(await text(page, "[data-spot-updated]"), /^Updated (just now|\d+ seconds ago)\. Refreshes every minute\.$/);
  await page.waitForSelector("[data-chart-plot] svg.chart-svg path.chart-line");
  assert.match(await page.locator(".chart-svg").getAttribute("aria-label"), /from Sep 14 to Oct 4: low \$58\.42, high \$62\.87, latest \$62\.58\./);
  assert.match(await text(page, "[data-chart-summary]"), /Range \$58\.42 to \$62\.87\./);
  const body = await page.locator("main").innerText();
  assert.doesNotMatch(body, /undefined|NaN/);
  assert.ok(await noOverflow(page), "no sideways scroll on desktop");
  await page.evaluate(() => window.scrollTo(0, 0));
  if (shots) await page.screenshot({ path: join(shots, "price-page-desktop-1280.jpg"), type: "jpeg", quality: 84, fullPage: true });
  // A visibility change refreshes immediately (the same path the 60 s timer uses).
  const before = calls.spot;
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await page.waitForTimeout(300);
  assert.ok(calls.spot > before, "price refreshes");
  assert.equal(calls.history, 1, "history loads once");
  assert.deepEqual(errors, []);
  await context.close();
  console.log("price page desktop: ok");
}

// ---------- Phone: layout and screenshot ----------
{
  const { context, page, errors } = await open({ width: 390, height: 844 }, { isMobile: true });
  await page.waitForFunction(() => document.querySelector("[data-spot-panel]").dataset.state === "live");
  await page.waitForSelector("[data-chart-plot] svg.chart-svg");
  assert.ok(await noOverflow(page), "no sideways scroll on a phone");
  const table = await page.locator(".content-table").boundingBox();
  assert.ok(table.width <= 390 - 16, "table fits the phone width");
  assert.equal(await page.locator("[aria-expanded='true']").count(), 0, "navigation stays closed");
  if (shots) await page.screenshot({ path: join(shots, "price-page-mobile-390.jpg"), type: "jpeg", quality: 84, fullPage: true });
  assert.deepEqual(errors, []);
  await context.close();
  console.log("price page phone: ok");
}

// ---------- Feeds down: the fallback stays readable ----------
{
  const { context, page, errors } = await open({ width: 1280, height: 900 }, { spot: 0, history: false });
  await page.waitForFunction(() => document.querySelector("[data-spot-panel]").dataset.state === "unavailable");
  assert.equal(await text(page, "[data-spot-price]"), "Call for today's price");
  assert.match(await text(page, "[data-spot-updated]"), /not available right now\. Call \(281\) 898-2719/);
  await page.waitForFunction(() => document.querySelector("[data-chart-plot]").dataset.state === "unavailable");
  assert.match(await text(page, "[data-chart-plot]"), /not available right now\. Call \(281\) 898-2719/);
  assert.deepEqual(errors.filter((e) => !/502/.test(e)), []);
  await context.close();
  console.log("price page feeds down: ok");
}

// ---------- JavaScript disabled ----------
{
  const { context, page } = await open({ width: 1280, height: 900 }, { javaScriptEnabled: false });
  assert.equal(await text(page, "[data-spot-price]"), "Call for today's price");
  assert.equal(await page.locator("[data-spot-price] a").getAttribute("href"), "tel:+12818982719");
  assert.match(await text(page, "[data-chart-plot]"), /loads in your browser/);
  assert.equal(await page.locator(".content-table tbody tr").count(), 9);
  assert.doesNotMatch(await page.locator("main").innerText(), /undefined|NaN/);
  await context.close();
  console.log("price page without JavaScript: ok");
}

await browser.close();
server.close();
console.log("SILVER_PRICE_BROWSER_OK");
