// Shared sale records (src/desk/records.mjs) and dashboard numbers (src/admin/stats.mjs).
import assert from "node:assert/strict";
import test from "node:test";
import { IDBFactory } from "fake-indexeddb";
import {
  CSV_HEADER, LEGACY_HISTORY_KEY, cleanRecord, cloudClient, indexedDbAdapter, localStorageAdapter, memoryAdapter,
  mergeRecords, openRecords, planSync, toCsv
} from "../src/desk/records.mjs";
import { barChartSvg, dayKey, filterRecords, greeting, rangeFor, startOfWeek, summarize } from "../src/admin/stats.mjs";

class FakeStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

let counter = 0;
function sale(overrides = {}) {
  counter += 1;
  const suffix = ["ABCD", "EFGH", "JKLM", "NPQR", "STUV", "WXYZ", "2345", "6789"][counter % 8];
  return {
    receiptNo: `AG-2610${String(10 + (counter % 20)).padStart(2, "0")}-${suffix}`,
    createdAt: new Date(Date.UTC(2026, 9, 13, 15, counter)).toISOString(),
    seller: { name: `Seller ${counter}`, phone: "", email: "", address: "", idType: "State ID", idNumber: `ID${counter}0000` },
    payment: "Cash",
    items: [{ title: "Sterling silver", detail: "100 grams · Sterling .925", offer: 100 }],
    total: 100,
    signature: "",
    private: { spot: 60, fine: 2.97, marketValue: 178, expectedReturn: 169, spread: 69, lines: [] },
    esign: { consent: true, signedAt: "2026-10-13T15:00:00.000Z", device: "test", fingerprint: "f".repeat(64) },
    ...overrides
  };
}

const adapters = {
  memory: () => memoryAdapter(),
  indexeddb: () => indexedDbAdapter(new IDBFactory()),
  localstorage: () => localStorageAdapter(new FakeStorage())
};

for (const [name, make] of Object.entries(adapters)) {
  test(`${name}: migration imports legacy localStorage receipts once, then removes them`, async () => {
    const a = sale();
    const b = sale();
    const legacy = new FakeStorage({ [LEGACY_HISTORY_KEY]: JSON.stringify([a, b, { junk: true }, null]) });
    const adapter = make();
    const records = openRecords({ adapter, legacy });
    const list = await records.list();
    assert.deepEqual(list.map((r) => r.receiptNo).sort(), [a.receiptNo, b.receiptNo].sort());
    assert.equal(legacy.getItem(LEGACY_HISTORY_KEY), null, "the old copy is removed after import");
    assert.equal(list.every((r) => r._synced === false), true, "imported receipts are queued for the cloud");

    // A second open (another page) does not import again, even if an old desk wrote the key back.
    legacy.setItem(LEGACY_HISTORY_KEY, JSON.stringify([sale()]));
    const again = openRecords({ adapter, legacy });
    assert.equal((await again.list()).length, 2);
  });

  test(`${name}: save is an upsert by receipt number and list is newest first`, async () => {
    const records = openRecords({ adapter: make(), legacy: new FakeStorage() });
    const older = sale({ createdAt: "2026-10-01T10:00:00.000Z" });
    const newer = sale({ createdAt: "2026-10-12T10:00:00.000Z" });
    await records.save(older);
    await records.save(newer);
    await records.save({ ...older, total: 250 });
    const list = await records.list();
    assert.equal(list.length, 2);
    assert.equal(list[0].receiptNo, newer.receiptNo);
    assert.equal(list[1].total, 250);
  });

  test(`${name}: delete removes one receipt, delete all removes every receipt`, async () => {
    const records = openRecords({ adapter: make(), legacy: new FakeStorage() });
    const a = sale();
    const b = sale();
    const c = sale();
    for (const r of [a, b, c]) await records.save(r);
    await records.remove(b.receiptNo);
    assert.deepEqual((await records.list()).map((r) => r.receiptNo).sort(), [a.receiptNo, c.receiptNo].sort());
    assert.deepEqual(await records.tombstones(), {}, "no tombstones while the cloud has never been seen");
    assert.equal(await records.removeAll(), 2);
    assert.deepEqual(await records.list(), []);
  });
}

test("mergeRecords unions by receipt number, prefers the local copy, and honors deletions", () => {
  const shared = sale();
  const localCopy = { ...shared, signature: "data:image/png;base64,AAAA" };
  const cloudOnly = sale();
  const deleted = sale();
  const merged = mergeRecords([localCopy], [shared, cloudOnly, deleted, { not: "a record" }], { [deleted.receiptNo]: "2026-10-13" });
  assert.deepEqual(merged.map((r) => r.receiptNo).sort(), [shared.receiptNo, cloudOnly.receiptNo].sort());
  assert.equal(merged.find((r) => r.receiptNo === shared.receiptNo).signature, localCopy.signature);
});

test("planSync covers push, pull, deletes in both directions, and acknowledgement", () => {
  const pushed = { ...sale(), _synced: false };
  const confirmed = { ...sale(), _synced: false };
  const goneElsewhere = { ...sale(), _synced: true };
  const kept = { ...sale(), _synced: true };
  const fromCloud = sale();
  const deletedHere = sale();
  const plan = planSync({
    local: [pushed, confirmed, goneElsewhere, kept],
    cloud: [cleanRecord(confirmed), cleanRecord(kept), fromCloud, deletedHere],
    tombstones: { [deletedHere.receiptNo]: "t", "AG-000000-AAAA": "t" }
  });
  assert.deepEqual(plan.push.map((r) => r.receiptNo), [pushed.receiptNo]);
  assert.deepEqual(plan.markSynced, [confirmed.receiptNo]);
  assert.deepEqual(plan.deleteHere, [goneElsewhere.receiptNo]);
  assert.deepEqual(plan.saveHere.map((r) => r.receiptNo), [fromCloud.receiptNo]);
  assert.deepEqual(plan.deleteInCloud, [deletedHere.receiptNo]);
  assert.deepEqual(plan.forgetTombstones, ["AG-000000-AAAA"]);
});

function fakeCloud({ on = true, fail = false } = {}) {
  const store = new Map();
  const calls = [];
  return {
    store,
    calls,
    async status() { return { cloud: on }; },
    async list() { calls.push("list"); if (fail) throw new Error("down"); return [...store.values()].map((r) => structuredClone(r)); },
    async put(record) { calls.push(`put ${record.receiptNo}`); store.set(record.receiptNo, structuredClone(record)); },
    async remove(id) { calls.push(`delete ${id}`); store.delete(id); }
  };
}

test("sync with the cloud: push, pull, delete here and there", async () => {
  const records = openRecords({ adapter: indexedDbAdapter(new IDBFactory()), legacy: new FakeStorage() });
  const cloud = fakeCloud();
  const mine = sale();
  const theirs = sale();
  cloud.store.set(theirs.receiptNo, theirs);
  await records.save(mine);

  let result = await records.sync(cloud);
  assert.deepEqual({ cloud: result.cloud, ok: result.ok, changed: result.changed }, { cloud: true, ok: true, changed: true });
  assert.ok(cloud.store.has(mine.receiptNo), "pushed up");
  assert.ok(!("_synced" in cloud.store.get(mine.receiptNo)), "bookkeeping fields stay local");
  assert.equal((await records.list()).length, 2, "pulled down");
  assert.equal((await records.get(mine.receiptNo))._synced, true);

  // Delete here: the cloud copy goes on the next sync.
  await records.remove(theirs.receiptNo);
  assert.ok((await records.tombstones())[theirs.receiptNo]);
  await records.sync(cloud);
  assert.ok(!cloud.store.has(theirs.receiptNo));
  assert.deepEqual(await records.tombstones(), {});

  // Deleted on another device: gone here too.
  cloud.store.delete(mine.receiptNo);
  result = await records.sync(cloud);
  assert.equal(result.changed, true);
  assert.deepEqual(await records.list(), []);

  // Nothing to do: no changes reported.
  assert.equal((await records.sync(cloud)).changed, false);
});

test("sync stays local when the cloud is off or unreachable", async () => {
  const records = openRecords({ adapter: memoryAdapter(), legacy: new FakeStorage() });
  await records.save(sale());
  const off = fakeCloud({ on: false });
  assert.deepEqual(await records.sync(off), { cloud: false, ok: true, changed: false });
  assert.deepEqual(off.calls, []);
  const broken = { status: async () => { throw new Error("offline"); } };
  assert.equal((await records.sync(broken)).cloud, false);
  const down = fakeCloud({ fail: true });
  const result = await records.sync(down);
  assert.equal(result.ok, false);
  assert.equal((await records.list()).length, 1, "local records untouched");
});

test("push sends one sale and marks it synced; delete all leaves tombstones once the cloud is known", async () => {
  const records = openRecords({ adapter: memoryAdapter(), legacy: new FakeStorage() });
  const cloud = fakeCloud();
  const a = sale();
  await records.save(a);
  assert.equal(await records.push(a, cloud), true);
  assert.equal((await records.get(a.receiptNo))._synced, true);
  assert.equal(await records.push(a, fakeCloud({ on: false })), false);
  await records.sync(cloud);
  await records.save(sale());
  assert.equal(await records.removeAll(), 2);
  assert.equal(Object.keys(await records.tombstones()).length, 2);
});

test("cloudClient sends the desk code and reads status without it", async () => {
  const seen = [];
  const fetchImpl = async (url, init = {}) => {
    seen.push({ url, method: init.method || "GET", code: init.headers?.["x-desk-code"], body: init.body });
    if (url.includes("status=1")) return { ok: true, json: async () => ({ cloud: true }) };
    if (init.method === "PUT") return { ok: true, json: async () => ({ ok: true }) };
    if (init.method === "DELETE") return { ok: false, status: 401, json: async () => ({ message: "Desk access code is not recognized." }) };
    return { ok: true, json: async () => ({ records: [sale()] }) };
  };
  const client = cloudClient({ code: "4747", fetchImpl });
  assert.deepEqual(await client.status(), { cloud: true });
  assert.equal(seen[0].code, undefined, "status needs no code");
  assert.equal((await client.list()).length, 1);
  assert.equal(seen[1].code, "4747");
  await client.put({ ...sale(), _synced: false });
  assert.ok(!JSON.parse(seen[2].body).record._synced);
  await assert.rejects(client.remove("AG-261013-ABCD"), /not recognized/);
  assert.match(seen[3].url, /receiptNo=AG-261013-ABCD/);
  const offline = cloudClient({ fetchImpl: async () => { throw new Error("offline"); } });
  assert.deepEqual(await offline.status(), { cloud: false });
});

test("toCsv keeps the desk's spreadsheet columns", () => {
  const csv = toCsv([sale({ seller: { name: 'Lee, "Mac"', idNumber: "TX1", idType: "State ID" } })]);
  const [header, row] = csv.split("\n");
  assert.equal(header, CSV_HEADER.join(","));
  assert.equal(CSV_HEADER.length, 20);
  assert.match(row, /"Lee, ""Mac"""/);
  assert.match(row, /,100\.00,60\.000,2\.9700,178\.00,169\.00,69\.00,/);
  assert.ok(row.endsWith("f".repeat(64)));
});

test("summarize counts today, the week from Monday, the month, spread, and 14 days of bars", () => {
  const now = new Date(2026, 9, 13, 15, 0); // Tuesday, October 13 2026, local time
  const at = (y, m, d, h = 12) => new Date(y, m, d, h).toISOString();
  const list = [
    sale({ createdAt: at(2026, 9, 13), total: 100, private: { spread: 20 } }),
    sale({ createdAt: at(2026, 9, 13, 9), total: 50, private: { spread: 5 } }),
    sale({ createdAt: at(2026, 9, 12), total: 200, private: { spread: 40 } }), // Monday
    sale({ createdAt: at(2026, 9, 11), total: 300, private: { spread: 60 } }), // Sunday, last week
    sale({ createdAt: at(2026, 9, 1), total: 400, private: { spread: 80 } }),
    sale({ createdAt: at(2026, 8, 30), total: 999, private: { spread: 99 } }) // September
  ];
  const s = summarize(list, now);
  assert.equal(s.todayPaid, 150);
  assert.equal(s.todayCount, 2);
  assert.equal(s.weekPaid, 350);
  assert.equal(s.weekCount, 3);
  assert.equal(s.monthPaid, 1050);
  assert.equal(s.monthCount, 5);
  assert.equal(s.monthSpread, 205);
  assert.equal(s.totalCount, 6);
  assert.equal(s.series.length, 14);
  assert.equal(s.series.at(-1).key, "2026-10-13");
  assert.equal(s.series.at(-1).paid, 150);
  assert.equal(s.series[0].key, "2026-09-30");
  assert.equal(s.series.reduce((t, d) => t + d.paid, 0), 2049, "September 30 is inside the 14 days");
  assert.equal(dayKey(startOfWeek(now)), "2026-10-12");
});

test("filterRecords searches name and receipt number and filters by inclusive date range", () => {
  const a = sale({ receiptNo: "AG-261013-K7QP", createdAt: new Date(2026, 9, 13, 10).toISOString(), seller: { name: "Ruth Ames" } });
  const b = sale({ receiptNo: "AG-261001-ZZ22", createdAt: new Date(2026, 9, 1, 10).toISOString(), seller: { name: "Marcus Lee" } });
  assert.deepEqual(filterRecords([a, b], { query: "ruth" }), [a]);
  assert.deepEqual(filterRecords([a, b], { query: "k7qp" }), [a]);
  assert.deepEqual(filterRecords([a, b], { query: "marcus lee" }), [b]);
  assert.deepEqual(filterRecords([a, b], { from: "2026-10-01", to: "2026-10-01" }), [b]);
  assert.deepEqual(filterRecords([a, b], { from: "2026-10-02" }), [a]);
  assert.deepEqual(filterRecords([a, b], {}), [a, b]);
  const now = new Date(2026, 9, 13, 15);
  assert.deepEqual(rangeFor("week", now), { from: "2026-10-12", to: "2026-10-13" });
  assert.deepEqual(rangeFor("month", now), { from: "2026-10-01", to: "2026-10-13" });
  assert.deepEqual(rangeFor("all", now), { from: "", to: "" });
});

test("greeting and chart markup", () => {
  assert.equal(greeting(new Date(2026, 9, 13, 8)), "Good morning");
  assert.equal(greeting(new Date(2026, 9, 13, 13)), "Good afternoon");
  assert.equal(greeting(new Date(2026, 9, 13, 19)), "Good evening");
  const s = summarize([sale({ createdAt: new Date().toISOString(), total: 120 })]);
  const svg = barChartSvg(s.series, { width: 600, height: 240 });
  assert.match(svg, /^<svg viewBox="0 0 600 240"/);
  assert.equal((svg.match(/class="bar bar-today"/g) || []).length, 1);
  assert.equal((svg.match(/class="bar-empty"/g) || []).length, 13);
  assert.match(svg, />Today</);
  assert.ok(!/NaN|undefined/.test(svg));
  assert.ok(!/NaN|undefined/.test(barChartSvg(summarize([]).series)));
});
