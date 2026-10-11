import assert from "node:assert/strict";
import test from "node:test";
import {
  COINS, DEFAULT_SETTINGS, MATERIALS, TROY_OZ_PER,
  describeItem, fineOunces, maskId, priceItem, priceLot, receiptNumber, toTroyOunces
} from "../src/desk/pricing.mjs";
import { STATEMENT, agreementFingerprint, publicSale, renderReceiptHtml } from "../src/desk/receipt.mjs";

const close = (actual, expected, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

test("unit conversions match the troy ounce definition", () => {
  close(toTroyOunces(31.1034768, "g"), 1);
  close(toTroyOunces(20, "dwt"), 1);
  close(toTroyOunces(1, "lb"), 14.583333, 1e-5);
  close(toTroyOunces(1, "oz"), 0.911458, 1e-5);
  close(toTroyOunces(1, "kg"), 32.150747, 1e-5);
  assert.equal(toTroyOunces(-5, "g"), 0);
  assert.equal(toTroyOunces("abc", "g"), 0);
  assert.throws(() => toTroyOunces(1, "stone"), RangeError);
  assert.equal(Object.keys(TROY_OZ_PER).length, 6);
});

test("sterling flatware: 100 g at $60 spot", () => {
  const item = { material: "sterling", mode: "weight", unit: "g", purity: 0.925, amount: 100 };
  const priced = priceItem(item, 60);
  close(priced.fine, 2.973943, 1e-5);
  assert.equal(priced.marketValue, 178.44);
  assert.equal(priced.offer, 142.75); // 80% default
  assert.equal(priced.expectedReturn, 169.51); // 95% refinery return
  assert.equal(priced.spread, 26.76);
});

test("junk silver coins price the same by count or by face value", () => {
  const byCount = fineOunces({ material: "coins", mode: "coins", coin: "dime90", amount: 100 });
  const byFace = fineOunces({ material: "coins", mode: "coins", coin: "dime90", byFace: true, amount: 10 });
  close(byCount, 7.234);
  close(byFace, 7.234);
  // $1 face of 90% silver is 0.7234 oz in uncirculated weight.
  close(fineOunces({ material: "coins", mode: "coins", coin: "quarter90", byFace: true, amount: 1 }), 0.72336);
  close(fineOunces({ material: "coins", mode: "coins", coin: "eagle", amount: 20 }), 20);
  // Rounds have no face value, so face mode must not divide by zero.
  close(fineOunces({ material: "coins", mode: "coins", coin: "eagle", byFace: true, amount: 3 }), 3);
  assert.equal(fineOunces({ material: "coins", mode: "coins", coin: "nope", amount: 3 }), 0);
});

test("x-ray film by the pound uses estimated silver content", () => {
  const priced = priceItem({ material: "xray", mode: "weight", unit: "lb", purity: 0.01, amount: 50 }, 60);
  close(priced.fine, 7.291667, 1e-5);
  assert.equal(priced.offer, Math.round(7.291667 * 60 * 0.5 * 100) / 100);
});

test("purity above 100% is clamped and unknown materials are rejected", () => {
  close(fineOunces({ mode: "weight", unit: "ozt", purity: 3, amount: 2 }), 2);
  assert.throws(() => priceItem({ material: "gold", mode: "weight", unit: "g", purity: 1, amount: 1 }, 60), RangeError);
});

test("custom rates and whole-dollar rounding", () => {
  const settings = { ...DEFAULT_SETTINGS, payout: { ...DEFAULT_SETTINGS.payout, bullion: 0.95 }, rounding: "dollar" };
  const priced = priceItem({ material: "bullion", mode: "weight", unit: "ozt", purity: 0.999, amount: 10 }, 61.37, settings);
  assert.equal(priced.offer, Math.floor(10 * 0.999 * 61.37 * 0.95));
  // Out-of-range rates fall back to material defaults.
  const bad = { ...DEFAULT_SETTINGS, payout: { bullion: "x" } };
  assert.equal(priceItem({ material: "bullion", mode: "weight", unit: "ozt", purity: 0.999, amount: 1 }, 50, bad).payoutRate, 0.92);
});

test("a mixed lot totals each line and reports a spread", () => {
  const items = [
    { material: "sterling", mode: "weight", unit: "dwt", purity: 0.925, amount: 250 },
    { material: "coins", mode: "coins", coin: "half90", amount: 40 },
    { material: "batteries", mode: "weight", unit: "lb", purity: 0.3, amount: 3.5 }
  ];
  const lot = priceLot(items, 60.95);
  assert.equal(lot.lines.length, 3);
  close(lot.offer, lot.lines.reduce((t, l) => t + l.offer, 0), 0.011);
  assert.ok(lot.spread > 0, "the default rates must leave a positive spread");
  assert.ok(lot.offer < lot.marketValue);
  assert.equal(priceLot([], 60).offer, 0);
  assert.equal(priceLot([], 60).spreadPct, 0);
});

test("every material leaves a positive spread at default rates", () => {
  for (const material of MATERIALS) {
    assert.ok(material.recovery > material.payout, `${material.id} offer must be below refinery return`);
    if (material.purities) assert.ok(material.purities.some(([p]) => p === material.purity), `${material.id} default purity should be selectable`);
  }
  assert.ok(COINS.every((coin) => coin.fine > 0));
});

test("zero or missing spot never produces a negative or NaN offer", () => {
  const priced = priceItem({ material: "sterling", mode: "weight", unit: "g", purity: 0.925, amount: 100 }, 0);
  assert.equal(priced.offer, 0);
  assert.equal(priced.spread, 0);
  assert.ok(!Number.isNaN(priceItem({ material: "sterling", mode: "weight", unit: "g", purity: 0.925, amount: 100 }, undefined).offer));
});

test("client descriptions show what and how much, never rates or market value", () => {
  const sterling = describeItem({ material: "sterling", mode: "weight", unit: "g", purity: 0.925, amount: 412.5 });
  assert.deepEqual(sterling, { title: "Sterling silver", detail: "412.5 grams · Sterling .925" });
  const film = describeItem({ material: "xray", mode: "weight", unit: "lb", purity: 0.01, amount: 50 });
  assert.equal(film.detail, "50 pounds · Medical film");
  assert.equal(describeItem({ material: "coins", mode: "coins", coin: "quarter90", amount: 1 }).detail, "1 piece");
  assert.equal(describeItem({ material: "coins", mode: "coins", coin: "quarter90", byFace: true, amount: 20 }).detail, "$20.00 face value");
});

test("receipt numbers are dated and unambiguous", () => {
  const no = receiptNumber(new Date(2026, 9, 11), () => 0.5);
  assert.match(no, /^AG-261011-[2-9A-HJ-NP-Z]{4}$/);
  assert.equal(maskId("12345678"), "••••5678");
  assert.equal(maskId("123"), "123");
});

test("the client receipt never contains private numbers", () => {
  const sale = {
    receiptNo: "AG-261011-ABCD",
    createdAt: "2026-10-11T18:00:00.000Z",
    seller: { name: "Ruth <Ames>", email: "ruth@example.com", idType: "State ID", idNumber: "TX99887766" },
    payment: "Cash",
    items: [{ title: "Sterling silver", detail: "100 grams · Sterling .925", offer: 142.75, payoutRate: 0.8 }],
    total: 142.75,
    signature: "",
    private: { spot: 60.95, marketValue: 178.44, expectedReturn: 169.51, spread: 26.76 }
  };
  const view = publicSale(sale);
  assert.equal(view.private, undefined);
  assert.equal(view.items[0].payoutRate, undefined);
  const html = renderReceiptHtml(sale);
  for (const secret of ["60.95", "178.44", "169.51", "26.76", "spread", "market", "spot", "80%", "TX99887766"]) {
    assert.ok(!html.toLowerCase().includes(secret.toLowerCase()), `receipt leaked ${secret}`);
  }
  assert.ok(html.includes("$142.75"));
  assert.ok(html.includes("Ruth &lt;Ames&gt;"), "seller input must be escaped");
  assert.ok(html.includes("7766"), "masked ID keeps the last four digits");
});

test("electronic signature: consent is in the statement and the record is tamper-evident", async () => {
  assert.match(STATEMENT, /agreed to sign electronically and to receive this receipt electronically/);
  const sale = {
    receiptNo: "AG-261011-ABCD", createdAt: "2026-10-11T18:00:00.000Z",
    seller: { name: "Ruth Ames", idType: "State ID", idNumber: "TX99887766" },
    payment: "Cash", items: [{ title: "Sterling silver", detail: "100 grams", offer: 142.75 }],
    total: 142.75, signature: "data:image/png;base64,AAAA"
  };
  const first = await agreementFingerprint(sale);
  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(await agreementFingerprint({ ...sale, private: { spread: 1 } }), first, "private numbers are not part of the signed record");
  assert.notEqual(await agreementFingerprint({ ...sale, total: 143.75 }), first, "changing the amount changes the fingerprint");
  assert.notEqual(await agreementFingerprint({ ...sale, signature: "data:image/png;base64,BBBB" }), first);
  const html = renderReceiptHtml({ ...sale, esign: { consent: true, signedAt: "2026-10-11T18:01:00.000Z", fingerprint: first } });
  assert.match(html, /Signed electronically/);
  assert.ok(html.includes(first.slice(0, 16).toUpperCase()));
});
