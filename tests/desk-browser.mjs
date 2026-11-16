// End-to-end simulation of the Buy Desk on a tablet: real clicks, real PDF, mocked market + mail.
// Run after `npm run build`:  node tests/desk-browser.mjs  [--shots]
import assert from "node:assert/strict";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import qrcode from "qrcode-generator";
import sharp from "sharp";
import { priceLot } from "../src/desk/pricing.mjs";
import { GOOGLE_REVIEW_URL } from "../src/desk/review-link.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const shots = process.argv.includes("--shots") ? join(root, "docs", "qa", "buy-desk-captures") : null;
if (shots) mkdirSync(shots, { recursive: true });
// --growth-shots captures only the review card and hallmark reading for docs/qa/growth-captures.
const growthShots = process.argv.includes("--growth-shots") ? join(root, "docs", "qa", "growth-captures") : null;
if (growthShots) mkdirSync(growthShots, { recursive: true });

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

let spot = 60;
let spotDown = false;
const mail = [];
const identifyCalls = [];
const identifyAnswers = [];
const REVIEW_OVERRIDE = "https://g.page/r/ag-refining-test/review";
async function desk(viewport, { emailConfigured = true, isMobile = false, reviewUrl, identify = true } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: true, isMobile, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.route("**/api/spot", (route) => spotDown
    ? route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ message: "down" }) })
    : route.fulfill({ contentType: "application/json", body: JSON.stringify({ price: spot, source: "test", fetchedAt: new Date().toISOString() }) }));
  await page.route("**/api/receipt", (route) => {
    if (route.request().method() === "GET") return route.fulfill({ contentType: "application/json", body: JSON.stringify({ email: emailConfigured, ...(reviewUrl ? { reviewUrl } : {}) }) });
    mail.push(JSON.parse(route.request().postData()));
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.route("**/api/identify", (route) => {
    if (route.request().method() === "GET") return route.fulfill({ contentType: "application/json", body: JSON.stringify({ available: identify }) });
    identifyCalls.push(JSON.parse(route.request().postData()));
    return route.fulfill({ contentType: "application/json", body: JSON.stringify(identifyAnswers.shift()) });
  });
  // Cloud records are off in these scenarios: the desk keeps everything on the tablet.
  await page.route("**/api/records**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ cloud: false }) }));
  await page.goto(`${base}/desk`);
  return { context, page, errors };
}
const shot = async (page, name) => { if (shots) await page.screenshot({ path: join(shots, `${name}.jpg`), type: "jpeg", quality: 82 }); };
const tapKeys = async (page, digits) => { for (const d of digits) await page.click(`[data-amount-pad] [data-key="${d}"]`); };
const pin = async (page, digits) => { for (const d of digits) await page.click(`[data-pin-pad] [data-pin="${d}"]`); };
const text = (page, sel) => page.locator(sel).innerText();
const settle = (page, ms = 1700) => page.waitForTimeout(ms);
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
// The same modules the desk should draw for a link, as an SVG path.
const qrPath = (text) => {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  let path = "";
  for (let r = 0; r < qr.getModuleCount(); r += 1) for (let c = 0; c < qr.getModuleCount(); c += 1) if (qr.isDark(r, c)) path += `M${c + 3} ${r + 3}h1v1h-1z`;
  return path;
};
const counterPhoto = await sharp({ create: { width: 2400, height: 1800, channels: 3, background: { r: 196, g: 199, b: 204 } } }).jpeg({ quality: 80 }).toBuffer();
const readHallmark = async (page, answer) => {
  identifyAnswers.push(answer);
  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.click("[data-action='identify']")]);
  await chooser.setFiles({ name: "hallmark.jpg", mimeType: "image/jpeg", buffer: counterPhoto });
};

// ---------- Scenario 1: a full sale on an iPad in landscape ----------
{
  const { context, page, errors } = await desk({ width: 1180, height: 820 }, { reviewUrl: REVIEW_OVERRIDE });
  await settle(page, 600);
  await shot(page, "01-first-run-code");
  assert.equal(await text(page, "[data-lock-title]"), "Choose a desk code");
  await pin(page, "4747"); await page.click("[data-pin='ok']");
  assert.equal(await text(page, "[data-lock-title]"), "Enter it once more");
  await pin(page, "4746"); await page.click("[data-pin='ok']");
  assert.match(await text(page, "[data-lock-hint]"), /did not match/);
  await pin(page, "4747"); await page.click("[data-pin='ok']");
  await pin(page, "4747"); await page.click("[data-pin='ok']");
  await page.waitForSelector(".screen-desk", { state: "visible" });
  await page.waitForFunction(() => document.querySelector("[data-live-chip]").dataset.state === "live");
  assert.match(await text(page, "[data-live-text]"), /Live market/);
  assert.ok(!(await text(page, ".desk-bar")).includes("60"), "spot price must not be visible on the desk bar");
  assert.equal(await page.locator(".lot-actions [data-action='present']").isDisabled(), true);
  await settle(page, 700);
  await shot(page, "02-desk-empty");

  // Hallmark reader: a photo pre-selects the sheet, the owner stays in control.
  await page.waitForSelector("[data-action='identify']", { state: "visible" });
  assert.equal(await page.locator("[data-identify-input]").getAttribute("capture"), "environment");
  assert.equal(await page.locator("[data-identify-input]").getAttribute("accept"), "image/*");
  await readHallmark(page, { material: "sterling", purity: 0.958, coin: null, marks: ["BRITANNIA", "958"], confidence: "medium", note: "Britannia standard mark on the base." });
  await page.waitForSelector("[data-sheet]", { state: "visible" });
  assert.equal(identifyCalls.length, 1);
  assert.equal(identifyCalls[0].code, "4747", "the desk code travels with the photo");
  const sent = await sharp(Buffer.from(identifyCalls[0].imageBase64, "base64")).metadata();
  assert.deepEqual([sent.format, sent.width, sent.height], ["jpeg", 1600, 1200], "photo is downsized to 1600 px JPEG");
  assert.equal(await text(page, "[data-sheet-title]"), "Sterling silver");
  assert.equal(await page.locator("[data-purity='0.958']").getAttribute("aria-pressed"), "true");
  assert.equal(await page.locator("[data-purity='0.925']").getAttribute("aria-pressed"), "false");
  assert.match(await text(page, "[data-identify-marks]"), /BRITANNIA · 958/);
  assert.match(await text(page, "[data-identify-confidence]"), /medium confidence/i);
  assert.match(await text(page, "[data-identify-note]"), /suggestion only/i);
  assert.equal(await page.locator("[data-action='save-item']").isDisabled(), true, "nothing is added until the owner weighs it");
  await shot(page, "15-hallmark-reading");
  if (growthShots) {
    await settle(page, 500);
    await page.screenshot({ path: join(growthShots, "desk-hallmark-reading.jpg"), type: "jpeg", quality: 84 });
  }
  await page.click("[data-purity='0.925']");
  assert.equal(await page.locator("[data-purity='0.925']").getAttribute("aria-pressed"), "true", "the owner can change the suggestion");
  await page.click("[data-action='close-sheet']");
  assert.equal(await page.locator("[data-lot-lines] li").count(), 0, "a reading never adds an item by itself");

  await readHallmark(page, { material: "coins", purity: null, coin: "dime90", marks: ["1958", "D"], confidence: "high", note: "A 1958-D Roosevelt dime." });
  await page.waitForSelector("[data-sheet]", { state: "visible" });
  assert.equal(await page.locator("[data-coin='dime90']").getAttribute("aria-pressed"), "true");
  await page.click("[data-action='close-sheet']");
  await page.click("[data-material='sterling']");
  assert.equal(await page.locator("[data-identify-note]").isHidden(), true, "a plain tap opens a sheet without the old reading");
  await page.click("[data-action='close-sheet']");

  await readHallmark(page, { material: null, purity: null, coin: null, marks: [], confidence: "low", note: "Could not read the marks clearly. Choose the material by hand." });
  await page.waitForFunction(() => /Choose the material by hand/.test(document.querySelector("[data-toast]").textContent));
  assert.equal(await page.locator("[data-sheet]").isHidden(), true);
  assert.equal(await text(page, "[data-identify-label]"), "Read the hallmark");

  // Sterling flatware, 250 g
  await page.click("[data-material='sterling']");
  await page.waitForSelector("[data-sheet]", { state: "visible" });
  assert.equal(await page.locator("[data-action='save-item']").isDisabled(), true);
  await tapKeys(page, "250");
  await settle(page, 500);
  const sterling = { material: "sterling", mode: "weight", unit: "g", purity: 0.925, amount: 250 };
  assert.equal(await text(page, "[data-item-offer]"), money(priceLot([sterling], 60).offer));
  await shot(page, "03-item-sheet-sterling");
  await page.click("[data-action='save-item']");

  // Quarters by face value, $20
  await page.click("[data-material='coins']");
  await page.click("[data-coin='quarter90']");
  await page.click("[data-coin-mode] [data-value='face']");
  await tapKeys(page, "20");
  assert.equal(await text(page, "[data-amount]"), "$20");
  await page.click("[data-action='save-item']");

  // X-ray film 52.5 lb, with a typo corrected by delete
  await page.click("[data-material='xray']");
  await tapKeys(page, "529");
  await page.click("[data-amount-pad] [data-key='del']");
  await tapKeys(page, ".5");
  assert.equal(await text(page, "[data-amount]"), "52.5");
  await page.click("[data-action='save-item']");

  // Silver Eagles: 10 pieces. Decimals are ignored when counting coins.
  await page.click("[data-material='coins']");
  await page.click("[data-coin='eagle']");
  assert.equal(await page.locator("[data-coin-mode]").isHidden(), true, "rounds have no face value option");
  await tapKeys(page, "1.0");
  assert.equal(await text(page, "[data-amount]"), "10");
  await page.click("[data-action='save-item']");

  const lot = [
    sterling,
    { material: "coins", mode: "coins", unit: "g", purity: 0.9, coin: "quarter90", byFace: true, amount: 20 },
    { material: "xray", mode: "weight", unit: "lb", purity: 0.01, amount: 52.5 },
    { material: "coins", mode: "coins", unit: "g", purity: 0.9, coin: "eagle", byFace: false, amount: 10 }
  ];
  await settle(page);
  assert.equal(await page.locator("[data-lot-lines] li").count(), 4);
  assert.equal(await text(page, "[data-lot-total]"), money(priceLot(lot, 60).offer));
  assert.equal(await text(page, "[data-material='coins'] .tile-count"), "2");

  // Private numbers only while held
  assert.equal(await page.locator("[data-private]").isHidden(), true);
  const hold = page.locator("[data-private-hold]");
  const box = await hold.boundingBox();
  await page.mouse.move(box.x + 20, box.y + 10);
  await page.mouse.down();
  assert.equal(await page.locator("[data-private]").isVisible(), true);
  assert.equal(await text(page, "[data-p-spread]"), `${money(priceLot(lot, 60).spread)} · ${Math.round(priceLot(lot, 60).spreadPct * 100)}%`);
  await shot(page, "04-desk-private-held");
  await page.mouse.up();
  assert.equal(await page.locator("[data-private]").isHidden(), true, "private numbers hide on release");
  await shot(page, "05-desk-offer-built");

  // Edit a line: change sterling to 200 g
  await page.click("[data-edit='0']");
  assert.equal(await text(page, "[data-amount]"), "250");
  await page.click("[data-amount-pad] [data-key='del']");
  await page.click("[data-amount-pad] [data-key='del']");
  await tapKeys(page, "00");
  await page.click("[data-action='save-item']");
  lot[0] = { ...sterling, amount: 200 };
  await settle(page);
  assert.equal(await text(page, "[data-lot-total]"), money(priceLot(lot, 60).offer));

  // Market moves: the desk follows it live
  spot = 62.4;
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await settle(page);
  assert.equal(await text(page, "[data-lot-total]"), money(priceLot(lot, 62.4).offer));

  // Present to the client
  await page.click(".lot-actions [data-action='present']");
  await page.waitForSelector(".screen-present", { state: "visible" });
  await settle(page, 2300);
  const offer = priceLot(lot, 62.4).offer;
  assert.equal(await text(page, "[data-present-total]"), money(offer));
  const presented = (await text(page, ".screen-present")).toLowerCase();
  for (const secret of ["62.4", "spread", "market value", "refinery", "%"]) assert.ok(!presented.includes(secret), `presentation leaked "${secret}"`);
  assert.match(presented, /held for you until/);
  const accept = await page.locator("[data-action='accept']").boundingBox();
  assert.ok(accept && accept.y + accept.height <= 820, `Accept offer must be visible without scrolling (bottom at ${accept?.y + accept?.height})`);
  await shot(page, "06-present-offer");

  // Market moves again while the client is looking: the offer holds.
  spot = 70;
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await settle(page, 600);
  assert.equal(await text(page, "[data-present-total]"), money(offer));

  await page.click("[data-action='accept']");
  await page.waitForSelector(".screen-agree", { state: "visible" });
  assert.equal(await text(page, "[data-agree-total]"), money(offer));
  await page.click(".agree-form button[type='submit']");
  const alert = await text(page, "[data-agree-alert]");
  assert.match(alert, /full name/);
  assert.match(alert, /ID number/);
  assert.match(alert, /signature/);
  await shot(page, "07-agreement-needs-more");

  await page.fill("[name='name']", "Ruth Ames");
  await page.fill("[name='phone']", "(713) 555-0142");
  await page.fill("[name='email']", "ruth.ames@example.com");
  await page.fill("[name='address']", "2210 Bellaire Blvd, Houston, TX 77025");
  await page.fill("[name='idNumber']", "TX44120987");
  await page.click("[data-chip-group='payment'] [data-value='Check']");
  await page.check("[name='affirm']");
  assert.equal(await page.locator(".affirm.invalid").count(), 0, "checking the statement clears its error");
  await page.locator("[data-sign-pad]").scrollIntoViewIfNeeded();
  const pad = await page.locator("[data-sign-pad]").boundingBox();
  await page.mouse.move(pad.x + 40, pad.y + 120);
  await page.mouse.down();
  for (let i = 0; i <= 40; i += 1) await page.mouse.move(pad.x + 40 + i * 9, pad.y + 120 - Math.sin(i / 3) * 40, { steps: 2 });
  await page.mouse.up();
  await shot(page, "08-agreement-signed");
  await page.click(".agree-form button[type='submit']");
  await page.waitForTimeout(500);
  if (await page.locator(".screen-done").isHidden()) throw new Error(`sale did not complete: ${await text(page, "[data-agree-alert]").catch(() => "")} | ${errors.join(" | ")}`);
  await settle(page, 1200);
  const receipt = await text(page, "[data-receipt]");
  assert.match(receipt, /Purchase receipt and bill of sale/i);
  assert.match(receipt, /Ruth Ames/);
  assert.match(receipt, new RegExp(money(offer).replace("$", "\\$")));
  assert.match(receipt, /Paid by Check/);
  assert.match(receipt, /0987/);
  for (const secret of ["TX44120987", "62.4", "spread", "market", "refinery"]) assert.ok(!receipt.toLowerCase().includes(secret.toLowerCase()), `receipt leaked ${secret}`);
  assert.equal(await page.locator("[data-receipt] img[alt='Seller signature']").count(), 1);
  assert.equal(await page.locator("[data-receipt] img[alt='AG Refining']").count(), 1);
  assert.match(receipt, /Signed electronically .* Record fingerprint [0-9A-F]{16}\./, "receipt carries the e-signature record");
  await shot(page, "09-sale-complete-receipt");

  // Review card: QR for the server's review link, plus a prefilled text to the seller's phone.
  await page.waitForSelector("[data-review-qr] svg path");
  assert.equal(await page.locator("[data-review-card]").getAttribute("data-review-url"), REVIEW_OVERRIDE);
  assert.equal(await page.locator("[data-review-qr] path").getAttribute("d"), qrPath(REVIEW_OVERRIDE), "QR encodes the review link");
  const sms = await page.locator("[data-review-text]").getAttribute("href");
  assert.match(sms, /^sms:\+17135550142\?&body=/);
  const smsBody = decodeURIComponent(sms.split("body=")[1]);
  assert.match(smsBody, /^Hi Ruth, thank you for choosing AG Refining today\./);
  assert.ok(smsBody.endsWith(REVIEW_OVERRIDE));
  assert.equal(await page.locator("[data-review-text]").isVisible(), true);
  if (growthShots) {
    await page.screenshot({ path: join(growthShots, "desk-review-card.jpg"), type: "jpeg", quality: 84 });
    await page.locator("[data-review-card]").screenshot({ path: join(growthShots, "desk-review-card-detail.png") });
  }

  // PDF via Share (falls back to a download in a desktop browser)
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("[data-action='share-receipt']")]);
  const pdf = readFileSync(await download.path());
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  const pdfText = pdf.toString("latin1");
  const receiptNo = (await text(page, ".r-meta strong")).trim();
  assert.match(download.suggestedFilename(), new RegExp(`AG-Refining-Receipt-${receiptNo}\\.pdf`));
  assert.ok(pdfText.includes(receiptNo), "PDF carries the receipt number");
  assert.ok(pdfText.includes("Ruth Ames"));
  assert.ok(pdfText.includes(money(offer)), "PDF carries the total");
  assert.ok(/\/Subtype \/Image/.test(pdfText), "PDF embeds the logo and signature");
  assert.ok(pdfText.includes("Signed electronically") && pdfText.includes("Record fingerprint"), "PDF carries the e-signature record");
  for (const secret of ["62.4", "Spread", "Market value", "TX44120987"]) assert.ok(!pdfText.includes(secret), `PDF leaked ${secret}`);
  if (shots) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(join(shots, "sample-receipt.pdf"), pdf);
  }

  // Email the receipt
  await page.click("[data-action='email-receipt']");
  await page.waitForFunction(() => /emailed|could not/.test(document.querySelector("[data-done-status]").textContent));
  assert.match(await text(page, "[data-done-status]"), /emailed to ruth\.ames@example\.com/);
  assert.equal(mail.length, 1);
  assert.equal(mail[0].code, "4747");
  assert.equal(mail[0].to, "ruth.ames@example.com");
  assert.equal(mail[0].receiptNo, receiptNo);
  assert.equal(Buffer.from(mail[0].pdfBase64.slice(0, 8), "base64").toString().slice(0, 4), "%PDF");

  // History and spreadsheet
  await page.click("[data-action='new-client']");
  await page.waitForSelector(".screen-desk", { state: "visible" });
  assert.equal(await page.locator("[data-lot-lines] li").count(), 0, "next client starts clean");
  await page.click("[data-open='history']");
  assert.match(await text(page, "[data-history]"), /Ruth Ames/);
  assert.match(await text(page, "[data-history-summary]"), /1/);
  await shot(page, "10-receipts-history");
  const [csv] = await Promise.all([page.waitForEvent("download"), page.click("[data-action='export-csv']")]);
  const csvText = readFileSync(await csv.path(), "utf8");
  assert.match(csvText.split("\n")[0], /Spread/);
  assert.match(csvText, /Ruth Ames/);
  assert.match(csvText, /TX44120987/, "the owner's spreadsheet keeps the full ID for records");
  assert.match(csvText.split("\n")[0], /Signed at,Signing device,Record fingerprint/);
  assert.match(csvText, /,[0-9a-f]{64}\n?/, "full fingerprint kept for verification");
  await page.click("[data-history] button");
  await page.waitForSelector(".screen-done", { state: "visible" });
  assert.match(await text(page, "#done-title"), /Receipt AG-/);

  // Settings: rates, rounding
  await page.click("[data-action='new-client']");
  await page.click("[data-open='settings']");
  await shot(page, "11-settings");
  await page.click("[data-rate='payout'][data-id='sterling'] [data-step='1']");
  assert.equal(await text(page, "[data-rate='payout'][data-id='sterling'] output"), "81%");
  await page.click("[data-rounding] [data-value='dollar']");
  await page.click("[data-panel='settings'] [data-action='close-panel']");
  await page.click("[data-material='sterling']");
  await tapKeys(page, "100");
  await settle(page, 500);
  assert.match(await text(page, "[data-item-offer]"), /\.00$/, "whole-dollar rounding");
  await page.click("[data-action='close-sheet']");

  // Lock: wrong code shakes, right code opens
  await page.click("[data-action='lock']");
  assert.equal(await text(page, "[data-lock-title]"), "Enter your desk code");
  await pin(page, "1111");
  await page.waitForFunction(() => /not right/.test(document.querySelector("[data-lock-hint]").textContent));
  await pin(page, "4747");
  await page.waitForSelector(".screen-desk", { state: "visible" });

  assert.deepEqual(errors, [], `console errors: ${errors.join(" | ")}`);
  await context.close();
  console.log("desk scenario 1 (full sale, iPad landscape): ok");
}

// ---------- Scenario 2: market feed down, email not configured, portrait tablet ----------
{
  spotDown = true;
  const { context, page, errors } = await desk({ width: 820, height: 1180 }, { emailConfigured: false, identify: false });
  await pin(page, "2468"); await page.click("[data-pin='ok']");
  await pin(page, "2468"); await page.click("[data-pin='ok']");
  await page.waitForFunction(() => document.querySelector("[data-live-chip]").dataset.state === "offline");
  assert.match(await text(page, "[data-live-text]"), /Market offline/);
  await settle(page, 300);
  assert.equal(await page.locator("[data-action='identify']").isHidden(), true, "no reader button when the reader is not set up");
  await page.click("[data-material='bullion']");
  await tapKeys(page, "10");
  assert.equal(await page.locator("[data-action='save-item']").isDisabled(), true, "no price, no offer");
  await page.click("[data-action='close-sheet']");
  await page.click("[data-open='settings']");
  await page.fill("[data-manual-spot]", "59.80");
  await page.click("[data-panel='settings'] [data-action='close-panel']");
  assert.match(await text(page, "[data-live-text]"), /Manual market price/);
  await page.click("[data-material='bullion']");
  await tapKeys(page, "10");
  await page.click("[data-action='save-item']");
  await settle(page);
  assert.equal(await text(page, "[data-lot-total]"), money(priceLot([{ material: "bullion", mode: "weight", unit: "ozt", purity: 0.999, amount: 10 }], 59.8).offer));
  assert.equal(await page.locator("[data-lot-dock]").isVisible(), true, "portrait shows a running-total dock");
  assert.equal(await text(page, "[data-dock-total]"), await text(page, "[data-lot-total]"));
  await shot(page, "12-portrait-manual-price");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(overflow, false, "no sideways scroll in portrait");
  await page.click(".lot-dock [data-action='present']");
  await settle(page, 2000);
  await shot(page, "13-portrait-present");
  await page.click("[data-action='accept']");
  await page.fill("[name='name']", "Marcus Lee");
  await page.fill("[name='idNumber']", "P5521983");
  await page.check("[name='affirm']");
  await page.locator("[data-sign-pad]").scrollIntoViewIfNeeded();
  const pad = await page.locator("[data-sign-pad]").boundingBox();
  await page.mouse.move(pad.x + 30, pad.y + 100); await page.mouse.down();
  await page.mouse.move(pad.x + 200, pad.y + 60, { steps: 12 }); await page.mouse.up();
  await page.click(".agree-form button[type='submit']");
  await page.waitForSelector(".screen-done", { state: "visible" });
  await page.waitForSelector("[data-review-qr] svg path");
  assert.equal(await page.locator("[data-review-card]").getAttribute("data-review-url"), GOOGLE_REVIEW_URL);
  assert.equal(await page.locator("[data-review-text]").isHidden(), true, "no text button without a phone number");
  // No email on file and email not configured: falls back to the PDF.
  page.once("dialog", (dialog) => dialog.accept("marcus@example.com"));
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("[data-action='email-receipt']")]);
  assert.equal(readFileSync(await download.path()).subarray(0, 4).toString(), "%PDF");
  assert.deepEqual(errors.filter((e) => !/502/.test(e)), []);
  await context.close();
  spotDown = false;
  console.log("desk scenario 2 (offline market, manual price, portrait): ok");
}

// ---------- Scenario 3: phone width sanity ----------
{
  const { context, page } = await desk({ width: 390, height: 844 }, { isMobile: true });
  await pin(page, "1357"); await page.click("[data-pin='ok']");
  await pin(page, "1357"); await page.click("[data-pin='ok']");
  await page.waitForSelector(".screen-desk", { state: "visible" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(overflow, false, "no sideways scroll on a phone");
  await settle(page, 800);
  await shot(page, "14-phone-desk");
  await context.close();
  console.log("desk scenario 3 (phone width): ok");
}

await browser.close();
server.close();
console.log("DESK_BROWSER_OK");
