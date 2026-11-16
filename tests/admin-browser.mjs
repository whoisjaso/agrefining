// End-to-end simulation of the owner dashboard: a real sale on the desk, then the dashboard.
// Run after `npm run build`:  node tests/admin-browser.mjs  [--shots]
import assert from "node:assert/strict";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const shots = process.argv.includes("--shots") ? join(root, "docs", "qa", "admin-captures") : null;
if (shots) mkdirSync(shots, { recursive: true });

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
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

const money = (n, cents = true) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", ...(cents ? {} : { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }).format(n);
const shot = async (page, name) => { if (shots) await page.screenshot({ path: join(shots, `${name}.jpg`), type: "jpeg", quality: 84 }); };
const text = (page, sel) => page.locator(sel).innerText();
const until = async (check, message, ms = 5000) => {
  const end = Date.now() + ms;
  while (!(await check())) {
    if (Date.now() > end) throw new Error(`Timed out: ${message}`);
    await new Promise((r) => setTimeout(r, 50));
  }
};
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

// A mocked cloud (/api/records) that behaves like the real endpoint: code-checked, keyed by receipt.
function mockCloud({ on, code = "" }) {
  const store = new Map();
  const calls = [];
  return {
    store,
    calls,
    async handle(route) {
      const request = route.request();
      const url = new URL(request.url());
      const json = (status, body) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
      if (request.method() === "GET" && url.searchParams.has("status")) return json(200, { cloud: on });
      if (!on) return json(503, { cloud: false });
      if (request.headers()["x-desk-code"] !== code) return json(401, { message: "Desk access code is not recognized." });
      calls.push(`${request.method()} ${url.searchParams.get("receiptNo") || ""}`.trim());
      if (request.method() === "GET") return json(200, { cloud: true, records: [...store.values()] });
      if (request.method() === "PUT") {
        const { record } = JSON.parse(request.postData());
        store.set(record.receiptNo, record);
        return json(200, { ok: true });
      }
      store.delete(url.searchParams.get("receiptNo"));
      return json(200, { ok: true });
    }
  };
}

async function newContext(viewport, cloud) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: true, acceptDownloads: true });
  await context.route("**/api/spot", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ price: 60, source: "test", fetchedAt: new Date().toISOString() }) }));
  await context.route("**/api/receipt", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ email: false }) }));
  await context.route("**/api/identify", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ available: false }) }));
  await context.route("**/api/records**", (route) => cloud.handle(route));
  return context;
}

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  return errors;
}

const deskPin = async (page, digits) => { for (const d of digits) await page.click(`[data-pin-pad] [data-pin="${d}"]`); };
const adminPin = async (page, digits) => { for (const d of digits) await page.click(`[data-pin-pad] [data-pin="${d}"]`); };

async function deskSale(page, { name, idNumber, grams }) {
  await page.waitForFunction(() => document.querySelector("[data-live-chip]").dataset.state === "live");
  await page.click("[data-material='sterling']");
  for (const d of String(grams)) await page.click(`[data-amount-pad] [data-key="${d}"]`);
  await page.click("[data-action='save-item']");
  await page.click(".lot-actions [data-action='present']");
  await page.waitForSelector(".screen-present", { state: "visible" });
  await page.click("[data-action='accept']");
  await page.waitForSelector(".screen-agree", { state: "visible" });
  await page.fill("[name='name']", name);
  await page.fill("[name='idNumber']", idNumber);
  await page.check("[name='affirm']");
  await page.locator("[data-sign-pad]").scrollIntoViewIfNeeded();
  const pad = await page.locator("[data-sign-pad]").boundingBox();
  await page.mouse.move(pad.x + 40, pad.y + 100);
  await page.mouse.down();
  for (let i = 0; i <= 30; i += 1) await page.mouse.move(pad.x + 40 + i * 10, pad.y + 100 - Math.sin(i / 3) * 36, { steps: 2 });
  await page.mouse.up();
  await page.click(".agree-form button[type='submit']");
  await page.waitForSelector(".screen-done", { state: "visible" });
  return (await text(page, "[data-receipt] .r-meta strong")).trim();
}

async function hold(page, selector, ms) {
  const box = await page.locator(selector).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}

// A legacy receipt as older desks stored it in localStorage.
function legacyRecord(receiptNo, name, total, daysAgo) {
  const at = new Date(Date.now() - daysAgo * 86_400_000);
  return {
    receiptNo,
    createdAt: at.toISOString(),
    seller: { name, phone: "", email: "", address: "", idType: "Texas driver license", idNumber: `TX${receiptNo.slice(-4)}0000` },
    payment: "Cash",
    items: [{ title: "Sterling silver", detail: "100 grams · Sterling .925", offer: total }],
    total,
    signature: "",
    private: { spot: 60, spotSource: "test", fine: 2.97, marketValue: total * 1.25, expectedReturn: total * 1.2, spread: total * 0.2, lines: [] },
    esign: { consent: true, signedAt: at.toISOString(), device: "test", fingerprint: "a".repeat(64) }
  };
}

// ---------- Scenario 1: desk sale, then the dashboard (cloud off) ----------
{
  const cloud = mockCloud({ on: false });
  const context = await newContext({ width: 1180, height: 820 }, cloud);
  const desk = await context.newPage();
  const deskErrors = watchErrors(desk);
  await desk.goto(`${base}/desk`);
  await deskPin(desk, "4747"); await desk.click("[data-pin='ok']");
  await deskPin(desk, "4747"); await desk.click("[data-pin='ok']");
  await desk.waitForSelector(".screen-desk", { state: "visible" });
  const receiptNo = await deskSale(desk, { name: "Ruth Ames", idNumber: "TX44120987", grams: 250 });
  assert.match(receiptNo, /^AG-\d{6}-[2-9A-HJ-NP-Z]{4}$/);
  const stored = await desk.evaluate(() => new Promise((resolve) => {
    const req = indexedDB.open("agdesk");
    req.onsuccess = () => {
      const all = req.result.transaction("sales").objectStore("sales").getAll();
      all.onsuccess = () => resolve(all.result);
    };
  }));
  assert.equal(stored.length, 1, "the desk saves the sale in the shared IndexedDB store");
  assert.equal(stored[0].seller.name, "Ruth Ames");
  const total = stored[0].total;
  const spread = stored[0].private.spread;
  assert.ok(total > 0 && spread > 0);
  assert.deepEqual(deskErrors, []);

  // A fresh tab: the dashboard asks for the desk code.
  const page = await context.newPage();
  const errors = watchErrors(page);
  await page.goto(`${base}/admin`);
  await page.waitForSelector("[data-login]", { state: "visible" });
  assert.equal(await text(page, "[data-login-title]"), "Welcome back");
  assert.equal(await page.getAttribute("meta[name='robots']", "content"), "noindex,nofollow");
  await page.waitForTimeout(600);
  await shot(page, "01-login");
  await adminPin(page, "1234");
  assert.match(await text(page, "[data-login-hint]"), /not right/);
  await adminPin(page, "47");
  await page.waitForTimeout(250);
  await adminPin(page, "47");
  await page.waitForSelector("[data-loader]", { state: "visible" });
  await page.waitForTimeout(650);
  await shot(page, "02-loading");
  await page.waitForSelector("[data-app]", { state: "visible" });
  await page.waitForSelector("[data-loader]", { state: "hidden" });
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(() => sessionStorage.getItem("agdesk:code")), "4747");

  // Home: greeting, KPIs, chart, recent receipts.
  assert.match(await text(page, "[data-greeting]"), /^Good (morning|afternoon|evening), Dennis\.$/);
  assert.equal(await text(page, "[data-kpi='today']"), money(total, false));
  assert.equal(await text(page, "[data-kpi='week']"), money(total, false));
  assert.equal(await text(page, "[data-kpi='month']"), money(total, false));
  assert.equal(await text(page, "[data-kpi='count']"), "1");
  assert.equal(await text(page, "[data-kpi='spread']"), money(spread, false));
  assert.match(await text(page, "[data-kpi-sub='today']"), /1 sale today/);
  assert.equal(await page.locator("[data-chart] svg rect.bar-today").count(), 1, "today's bar is drawn");
  assert.equal(await page.locator("[data-chart] svg rect.bar").count(), 1);
  assert.match(await text(page, "[data-recent]"), /Ruth Ames/);
  assert.match(await text(page, "[data-sync]"), /Saved on this iPad/);
  await shot(page, "03-dashboard");

  // Records: search and dates.
  await page.click(".tab[data-nav='records']");
  await page.waitForSelector("[data-page='records']", { state: "visible" });
  assert.match(await text(page, "[data-records-sum]"), /1 receipt/);
  await page.fill("[data-search]", "ruth");
  assert.equal(await page.locator("[data-records] .row").count(), 1);
  await page.fill("[data-search]", receiptNo.slice(-4).toLowerCase());
  assert.equal(await page.locator("[data-records] .row").count(), 1, "search by receipt number");
  await page.fill("[data-search]", "nobody");
  assert.equal(await page.locator("[data-records] .row").count(), 0);
  assert.match(await text(page, "[data-records]"), /No receipts match/);
  await page.fill("[data-search]", "");
  await page.click("[data-range='today']");
  assert.equal(await page.locator("[data-records] .row").count(), 1);
  await page.click("[data-range='custom']");
  await page.fill("[data-from]", "2020-01-01");
  await page.fill("[data-to]", "2020-01-31");
  await page.locator("[data-to]").dispatchEvent("change");
  await page.locator("[data-from]").dispatchEvent("change");
  assert.equal(await page.locator("[data-records] .row").count(), 0, "custom range filters by date");
  await page.click("[data-range='all']");
  assert.equal(await page.locator("[data-records] .row").count(), 1);
  await page.waitForTimeout(300);
  await shot(page, "04-records");

  // Export CSV with the desk's columns.
  const [csv] = await Promise.all([page.waitForEvent("download"), page.click("[data-action='export-csv']")]);
  const csvText = readFileSync(await csv.path(), "utf8");
  assert.match(csv.suggestedFilename(), /^AG-Refining-Receipts-\d{4}-\d{2}-\d{2}\.csv$/);
  assert.match(csvText.split("\n")[0], /^Receipt,Date,Time,Seller,.*Spread,Signed at,Signing device,Record fingerprint$/);
  assert.match(csvText, /Ruth Ames/);
  assert.match(csvText, /TX44120987/);

  // Detail: everything about the sale.
  await page.click("[data-records] .row");
  await page.waitForSelector("[data-detail]", { state: "visible" });
  const detail = await text(page, "[data-detail]");
  assert.match(detail, /Ruth Ames/);
  assert.match(detail, new RegExp(receiptNo));
  assert.match(detail, /TX44120987/, "the owner sees the full ID number");
  assert.match(detail, /Private numbers/);
  assert.match(detail, new RegExp(money(spread).replace("$", "\\$")));
  assert.match(detail, /\$60\.00 per oz/);
  assert.match(detail, /[0-9a-f]{64}/, "full e-sign fingerprint");
  assert.equal(await page.locator("[data-detail] .signature img").count(), 1, "signature image shown");
  await page.waitForTimeout(450);
  await shot(page, "05-detail");
  await page.evaluate(() => { window.jspdfReady = Boolean(window.jspdf?.jsPDF); });
  const [pdf] = await Promise.all([page.waitForEvent("download"), page.click("[data-action='share-pdf']")]);
  assert.equal(readFileSync(await pdf.path()).subarray(0, 4).toString(), "%PDF", "receipt PDF re-share");
  await page.evaluate(() => { window.print = () => { window.printed = document.querySelector("[data-print-receipt]").innerText; }; });
  await page.click("[data-action='print']");
  const printed = await page.evaluate(() => window.printed);
  assert.match(printed, /Purchase receipt and bill of sale/i);
  assert.ok(!printed.includes("TX44120987"), "printed receipt masks the ID");

  // Delete with confirmation: a tap is not enough, a full hold deletes.
  await page.click("[data-action='delete-one']");
  await page.waitForSelector("[data-confirm]", { state: "visible" });
  assert.equal(await text(page, "[data-confirm-title]"), "Delete this receipt?");
  assert.equal(await text(page, "[data-confirm-text]"), "This cannot be undone.");
  assert.match(await text(page, "[data-confirm-what]"), /Ruth Ames/);
  await page.waitForTimeout(350);
  await shot(page, "06-delete-confirm");
  await hold(page, "[data-hold]", 250);
  assert.equal(await page.locator("[data-confirm]").isVisible(), true, "a short press does not delete");
  await page.click("[data-action='cancel-confirm']");
  assert.equal(await page.locator("[data-confirm]").isHidden(), true);
  await page.click("[data-action='delete-one']");
  await hold(page, "[data-hold]", 1500);
  await page.waitForSelector("[data-detail]", { state: "hidden" });
  await page.waitForFunction(() => /Receipt deleted/.test(document.querySelector("[data-toast]").textContent));
  assert.equal(await page.locator("[data-records] .row").count(), 0);
  const left = await page.evaluate(() => new Promise((resolve) => {
    const req = indexedDB.open("agdesk");
    req.onsuccess = () => {
      const all = req.result.transaction("sales").objectStore("sales").getAll();
      all.onsuccess = () => resolve(all.result.length);
    };
  }));
  assert.equal(left, 0, "deleted from the shared store");

  // Open the Buy Desk: the desk opens unlocked, and its Dashboard button comes back.
  await page.click(".tab[data-nav='home']");
  await page.click("[data-action='open-desk']");
  await page.waitForURL(/\/desk$/);
  await page.waitForSelector(".screen-desk", { state: "visible" });
  await page.click("[data-action='dashboard']");
  await page.waitForURL(/\/admin$/);
  await page.waitForSelector("[data-app]", { state: "visible" });
  assert.equal(await page.locator("[data-login]").isHidden(), true, "no second code entry coming back from the desk");

  // Lock returns to the code screen and clears the screen.
  await page.click("[data-action='lock']");
  await page.waitForSelector("[data-login]", { state: "visible" });
  assert.equal(await page.evaluate(() => sessionStorage.getItem("agdesk:code")), null);
  assert.deepEqual(errors, []);
  await context.close();
  console.log("admin scenario 1 (desk sale, login, KPIs, records, detail, delete, CSV): ok");
}

// ---------- Scenario 2: legacy migration, delete all, layout at three sizes ----------
{
  const cloud = mockCloud({ on: false });
  const context = await newContext({ width: 1180, height: 820 }, cloud);
  const page = await context.newPage();
  const errors = watchErrors(page);
  // An older desk: receipts in localStorage, no code yet. Set them before any app page loads.
  await page.goto(`${base}/assets/ag-mark-path.svg`);
  await page.evaluate((list) => localStorage.setItem("agdesk:history", JSON.stringify(list)), [
    legacyRecord("AG-261013-AB2C", "Marcus Lee", 812.4, 0),
    legacyRecord("AG-261010-QX7P", "Ana Ruiz", 1290, 3),
    legacyRecord("AG-260901-HH4K", "Old Customer", 300, 40)
  ]);
  await page.goto(`${base}/admin`);
  await page.waitForSelector("[data-login]", { state: "visible" });
  assert.equal(await text(page, "[data-login-title]"), "Choose a desk code", "no code yet: create one here");
  await adminPin(page, "2468"); await page.click("[data-pin='ok']");
  assert.equal(await text(page, "[data-login-title]"), "Enter it once more");
  await adminPin(page, "2468"); await page.click("[data-pin='ok']");
  await page.waitForSelector("[data-app]", { state: "visible" });
  await page.waitForTimeout(700);
  const pin = await page.evaluate(() => JSON.parse(localStorage.getItem("agdesk:pin")));
  assert.equal(pin.length, 4);
  assert.match(pin.hash, /^[0-9a-f]{64}$/);
  assert.equal(await page.evaluate(() => localStorage.getItem("agdesk:history")), null, "legacy receipts moved into IndexedDB");
  assert.equal(await text(page, "[data-kpi='count']").then(Number) >= 1, true);
  assert.equal(await page.locator("[data-recent] .row").count(), 3);
  assert.equal(await page.locator("[data-chart] svg rect.bar").count(), 2, "two days with sales in the last 14 days");

  for (const viewport of [{ width: 1180, height: 820 }, { width: 820, height: 1180 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.click(".tab[data-nav='home']");
    await page.waitForTimeout(300);
    assert.ok(await noOverflow(page), `no sideways scroll on home at ${viewport.width}x${viewport.height}`);
    if (viewport.width === 390) await shot(page, "07-dashboard-phone");
    if (viewport.width === 820) await shot(page, "08-dashboard-portrait");
    await page.click(".tab[data-nav='records']");
    await page.waitForTimeout(200);
    assert.ok(await noOverflow(page), `no sideways scroll on records at ${viewport.width}x${viewport.height}`);
    await page.click("[data-records] .row >> nth=0");
    await page.waitForSelector("[data-detail]", { state: "visible" });
    assert.ok(await page.evaluate(() => { const d = document.querySelector("[data-detail]"); return d.scrollWidth <= d.clientWidth; }), `no sideways scroll in detail at ${viewport.width}`);
    await page.click("[data-action='close-detail']");
    const small = await page.evaluate(() => [...document.querySelectorAll(".app *, .detail *")]
      .filter((el) => el.offsetParent && el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
      .map((el) => [el.className || el.tagName, parseFloat(getComputedStyle(el).fontSize)])
      .filter(([, size]) => size < 17));
    assert.deepEqual(small, [], `no text smaller than 17px at ${viewport.width}`);
    const targets = await page.evaluate(() => [...document.querySelectorAll(".app button, .app input")]
      .filter((el) => el.offsetParent)
      .map((el) => [el.className || el.tagName, Math.round(el.getBoundingClientRect().height)])
      .filter(([, h]) => h < 56));
    assert.deepEqual(targets, [], `every control is at least 56px tall at ${viewport.width}`);
  }
  await page.setViewportSize({ width: 1180, height: 820 });

  // Delete all: typed word and a hold.
  await page.click(".tab[data-nav='records']");
  await page.click("[data-action='delete-all']");
  await page.waitForSelector("[data-confirm]", { state: "visible" });
  assert.equal(await text(page, "[data-confirm-title]"), "Delete all 3 receipts?");
  assert.equal(await page.locator("[data-hold]").isDisabled(), true, "the hold stays locked until DELETE is typed");
  await page.fill("[data-confirm-input]", "delete");
  assert.equal(await page.locator("[data-hold]").isDisabled(), false);
  await page.waitForTimeout(400);
  await shot(page, "09-delete-all-confirm");
  await hold(page, "[data-hold]", 1500);
  await page.waitForFunction(() => /3 receipts deleted/.test(document.querySelector("[data-toast]").textContent));
  assert.equal(await page.locator("[data-records] .row").count(), 0);
  await page.reload();
  await page.waitForSelector("[data-app]", { state: "visible" });
  assert.equal(await page.locator("[data-recent] .row").count(), 0, "legacy records are not re-imported after delete all");
  assert.deepEqual(errors, []);
  await context.close();
  console.log("admin scenario 2 (migration, delete all, three sizes): ok");
}

// ---------- Scenario 3: cloud on ----------
{
  const cloud = mockCloud({ on: true, code: "1357" });
  const fromOtherDevice = legacyRecord("AG-261012-ZZ9Y", "Cloud Customer", 450, 1);
  cloud.store.set(fromOtherDevice.receiptNo, fromOtherDevice);
  const context = await newContext({ width: 1180, height: 820 }, cloud);
  const desk = await context.newPage();
  await desk.goto(`${base}/desk`);
  await deskPin(desk, "1357"); await desk.click("[data-pin='ok']");
  await deskPin(desk, "1357"); await desk.click("[data-pin='ok']");
  await desk.waitForSelector(".screen-desk", { state: "visible" });
  const receiptNo = await deskSale(desk, { name: "Pat Gomez", idNumber: "TX55500011", grams: 100 });
  await until(() => cloud.store.has(receiptNo), "the desk pushes each completed sale to the cloud");
  assert.ok(!("_synced" in cloud.store.get(receiptNo)), "local bookkeeping never leaves the device");

  await desk.goto(`${base}/admin`);
  await desk.waitForSelector("[data-app]", { state: "visible" });
  await desk.waitForFunction(() => /Synced to cloud/.test(document.querySelector("[data-sync]").textContent));
  const recent = await text(desk, "[data-recent]");
  assert.match(recent, /Pat Gomez/);
  assert.match(recent, /Cloud Customer/, "receipts from the cloud are merged in by receipt number");
  await desk.waitForTimeout(400);
  await shot(desk, "10-dashboard-synced");

  await desk.click(".tab[data-nav='records']");
  await desk.fill("[data-search]", "cloud");
  await desk.click("[data-records] .row");
  await desk.click("[data-action='delete-one']");
  await hold(desk, "[data-hold]", 1500);
  await desk.waitForSelector("[data-detail]", { state: "hidden" });
  await until(() => !cloud.store.has(fromOtherDevice.receiptNo), "a delete on the dashboard deletes the cloud copy");
  assert.ok(cloud.calls.includes(`DELETE ${fromOtherDevice.receiptNo}`));
  assert.ok(cloud.store.has(receiptNo));

  // Deleted on another device: gone from the cloud, so it disappears here on the next sync.
  cloud.store.delete(receiptNo);
  await desk.fill("[data-search]", "");
  assert.equal(await desk.locator("[data-records] .row").count(), 1);
  await desk.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await until(async () => (await desk.locator("[data-records] .row").count()) === 0, "a receipt deleted elsewhere disappears here");
  await context.close();
  console.log("admin scenario 3 (cloud sync: push, merge, delete both ways): ok");
}

await browser.close();
server.close();
console.log("ADMIN_BROWSER_OK");
