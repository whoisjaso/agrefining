// Sale records shared by the Buy Desk (/desk) and the owner dashboard (/admin).
// The source of truth is the "agdesk" IndexedDB database on the device. Older desks kept
// receipts in localStorage under "agdesk:history"; those are imported once, then removed.
// An optional cloud copy lives behind /api/records (Vercel Blob, private access).

export const LEGACY_HISTORY_KEY = "agdesk:history";
export const DB_NAME = "agdesk";
export const DB_VERSION = 1;
const SALES = "sales";
const META = "meta";
const TOMBSTONES = "tombstones";
const MIGRATED = "migratedLegacyHistory";

// ---------- storage adapters ----------
// Every adapter offers the same small interface, so the record logic can be tested
// against memory and run against IndexedDB (or localStorage when IndexedDB is missing).

export function memoryAdapter(seed = []) {
  const sales = new Map(seed.map((record) => [record.receiptNo, structuredClone(record)]));
  const meta = new Map();
  return {
    kind: "memory",
    async all() { return [...sales.values()].map((record) => structuredClone(record)); },
    async get(id) { return sales.has(id) ? structuredClone(sales.get(id)) : undefined; },
    async put(record) { sales.set(record.receiptNo, structuredClone(record)); },
    async remove(id) { sales.delete(id); },
    async clear() { sales.clear(); },
    async getMeta(key) { return meta.has(key) ? structuredClone(meta.get(key)) : undefined; },
    async setMeta(key, value) { meta.set(key, structuredClone(value)); }
  };
}

export function indexedDbAdapter(idb = globalThis.indexedDB) {
  if (!idb) throw new Error("IndexedDB is not available");
  let opening;
  const open = () => {
    opening = opening || new Promise((resolve, reject) => {
      const request = idb.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(SALES)) db.createObjectStore(SALES, { keyPath: "receiptNo" });
        if (!db.objectStoreNames.contains(META)) db.createObjectStore(META, { keyPath: "key" });
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); opening = null; };
        resolve(db);
      };
      request.onerror = () => { opening = null; reject(request.error); };
    });
    return opening;
  };
  const run = async (store, mode, work) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const request = work(tx.objectStore(store));
      let result;
      if (request) request.onsuccess = () => { result = request.result; };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("Storage transaction aborted"));
    });
  };
  return {
    kind: "indexeddb",
    async all() { return (await run(SALES, "readonly", (s) => s.getAll())) || []; },
    get: (id) => run(SALES, "readonly", (s) => s.get(id)),
    put: (record) => run(SALES, "readwrite", (s) => s.put(record)),
    remove: (id) => run(SALES, "readwrite", (s) => s.delete(id)),
    clear: () => run(SALES, "readwrite", (s) => s.clear()),
    async getMeta(key) { return (await run(META, "readonly", (s) => s.get(key)))?.value; },
    setMeta: (key, value) => run(META, "readwrite", (s) => s.put({ key, value }))
  };
}

// Fallback for browsers without IndexedDB (rare, such as some private modes).
export function localStorageAdapter(storage = globalThis.localStorage, key = "agdesk:records") {
  const read = (name, fallback) => {
    try {
      const raw = storage.getItem(name);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  };
  const write = (name, value) => storage.setItem(name, JSON.stringify(value));
  const sales = () => read(key, []);
  return {
    kind: "localstorage",
    async all() { return sales(); },
    async get(id) { return sales().find((r) => r.receiptNo === id); },
    async put(record) { write(key, [record, ...sales().filter((r) => r.receiptNo !== record.receiptNo)]); },
    async remove(id) { write(key, sales().filter((r) => r.receiptNo !== id)); },
    async clear() { write(key, []); },
    async getMeta(name) { return read(`${key}:meta`, {})[name]; },
    async setMeta(name, value) { write(`${key}:meta`, { ...read(`${key}:meta`, {}), [name]: value }); }
  };
}

export function defaultAdapter() {
  try {
    if (globalThis.indexedDB) return indexedDbAdapter(globalThis.indexedDB);
  } catch { /* fall through */ }
  return localStorageAdapter();
}

// ---------- pure record logic ----------

export const isRecord = (value) => Boolean(value && typeof value === "object" && typeof value.receiptNo === "string" && value.receiptNo && value.createdAt);

const newestFirst = (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || String(b.receiptNo).localeCompare(String(a.receiptNo));

// Fields that start with "_" are local bookkeeping (such as _synced) and never leave the device.
export function cleanRecord(record) {
  return Object.fromEntries(Object.entries(record || {}).filter(([key]) => !key.startsWith("_")));
}

// Union by receipt number, newest first. Local copies win; deleted receipts stay deleted.
export function mergeRecords(local = [], cloud = [], tombstones = {}) {
  const byId = new Map();
  for (const record of [...cloud, ...local]) {
    if (isRecord(record) && !tombstones[record.receiptNo]) byId.set(record.receiptNo, record);
  }
  return [...byId.values()].sort(newestFirst);
}

// Work out what a two-way sync has to do. Pure, so it can be tested on its own.
// - a receipt deleted here is deleted in the cloud;
// - a receipt only in the cloud is copied here (unless it was deleted here);
// - a receipt that was synced before but is gone from the cloud was deleted on another device;
// - a receipt never synced is pushed up.
export function planSync({ local = [], cloud = [], tombstones = {} }) {
  const cloudIds = new Set(cloud.filter(isRecord).map((r) => r.receiptNo));
  const localIds = new Set(local.map((r) => r.receiptNo));
  const deleted = Object.keys(tombstones);
  return {
    deleteInCloud: deleted.filter((id) => cloudIds.has(id)),
    forgetTombstones: deleted.filter((id) => !cloudIds.has(id)),
    saveHere: cloud.filter((r) => isRecord(r) && !localIds.has(r.receiptNo) && !tombstones[r.receiptNo]),
    deleteHere: local.filter((r) => r._synced && !cloudIds.has(r.receiptNo)).map((r) => r.receiptNo),
    push: local.filter((r) => !r._synced && !cloudIds.has(r.receiptNo)),
    markSynced: local.filter((r) => !r._synced && cloudIds.has(r.receiptNo)).map((r) => r.receiptNo)
  };
}

// ---------- the records store ----------

export function openRecords({ adapter = defaultAdapter(), legacy = globalThis.localStorage } = {}) {
  const tombstones = async () => (await adapter.getMeta(TOMBSTONES)) || {};
  const setTombstones = (value) => adapter.setMeta(TOMBSTONES, value);

  // One-time import of receipts saved by older versions of the desk.
  async function migrate() {
    if (await adapter.getMeta(MIGRATED)) return 0;
    let legacyList = [];
    try {
      const raw = legacy?.getItem(LEGACY_HISTORY_KEY);
      legacyList = raw ? JSON.parse(raw) : [];
    } catch {
      legacyList = [];
    }
    let imported = 0;
    for (const record of Array.isArray(legacyList) ? legacyList : []) {
      if (!isRecord(record) || (await adapter.get(record.receiptNo))) continue;
      await adapter.put({ ...record, _synced: false });
      imported += 1;
    }
    await adapter.setMeta(MIGRATED, new Date().toISOString());
    // The receipts now live in the database. Remove the old copy so a deleted receipt
    // cannot linger in the browser's storage.
    try { legacy?.removeItem(LEGACY_HISTORY_KEY); } catch { /* private mode */ }
    return imported;
  }

  const ready = migrate().catch(() => 0);

  return {
    adapter,
    ready,
    async list() {
      await ready;
      return (await adapter.all()).filter(isRecord).sort(newestFirst);
    },
    async get(id) {
      await ready;
      return adapter.get(id);
    },
    async save(sale, { synced = false } = {}) {
      await ready;
      const record = { ...cleanRecord(sale), _synced: synced };
      await adapter.put(record);
      return record;
    },
    async markSynced(id) {
      const record = await adapter.get(id);
      if (record && !record._synced) await adapter.put({ ...record, _synced: true });
    },
    async remove(id) {
      await ready;
      const record = await adapter.get(id);
      await adapter.remove(id);
      // Remember the deletion so a sync can remove the cloud copy too.
      if (record?._synced || (await adapter.getMeta("cloudSeen"))) {
        await setTombstones({ ...(await tombstones()), [id]: new Date().toISOString() });
      }
    },
    async removeAll() {
      await ready;
      const all = await adapter.all();
      const stamp = new Date().toISOString();
      const marks = { ...(await tombstones()) };
      const cloudSeen = await adapter.getMeta("cloudSeen");
      for (const record of all) if (record._synced || cloudSeen) marks[record.receiptNo] = stamp;
      await setTombstones(marks);
      await adapter.clear();
      return all.length;
    },
    tombstones,
    // Two-way sync with the cloud copy. Returns { cloud, ok, changed, error? }.
    async sync(cloud) {
      await ready;
      let status;
      try {
        status = await cloud.status();
      } catch {
        return { cloud: false, ok: true, changed: false };
      }
      if (!status.cloud) return { cloud: false, ok: true, changed: false };
      await adapter.setMeta("cloudSeen", true);
      try {
        const remote = await cloud.list();
        const plan = planSync({ local: await adapter.all(), cloud: remote, tombstones: await tombstones() });
        const marks = { ...(await tombstones()) };
        for (const id of plan.deleteInCloud) {
          await cloud.remove(id);
          delete marks[id];
        }
        for (const id of plan.forgetTombstones) delete marks[id];
        await setTombstones(marks);
        for (const record of plan.saveHere) await adapter.put({ ...cleanRecord(record), _synced: true });
        for (const id of plan.deleteHere) await adapter.remove(id);
        for (const id of plan.markSynced) await this.markSynced(id);
        for (const record of plan.push) {
          await cloud.put(cleanRecord(record));
          await this.markSynced(record.receiptNo);
        }
        const changed = Object.values(plan).some((list) => list.length > 0);
        return { cloud: true, ok: true, changed };
      } catch (error) {
        return { cloud: true, ok: false, changed: false, error: error?.message || "Sync failed" };
      }
    },
    // Push a single sale right after it is completed. Quiet on failure: the next sync retries.
    async push(sale, cloud) {
      try {
        const status = await cloud.status();
        if (!status.cloud) return false;
        await cloud.put(cleanRecord(sale));
        await this.markSynced(sale.receiptNo);
        return true;
      } catch {
        return false;
      }
    }
  };
}

// ---------- cloud client (/api/records) ----------

export function cloudClient({ code = "", fetchImpl = globalThis.fetch?.bind(globalThis), base = "/api/records" } = {}) {
  let statusPromise;
  const call = async (url, init = {}) => {
    const response = await fetchImpl(url, {
      ...init,
      headers: { Accept: "application/json", "x-desk-code": code, ...(init.body ? { "Content-Type": "application/json" } : {}), ...(init.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || `Cloud request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return data;
  };
  return {
    status() {
      statusPromise = statusPromise || fetchImpl(`${base}?status=1`, { headers: { Accept: "application/json" }, cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { cloud: false }))
        .then((d) => ({ cloud: d?.cloud === true }))
        .catch(() => ({ cloud: false }));
      return statusPromise;
    },
    async list() {
      const data = await call(base, { cache: "no-store" });
      return Array.isArray(data.records) ? data.records : [];
    },
    put: (record) => call(base, { method: "PUT", body: JSON.stringify({ record: cleanRecord(record) }) }),
    remove: (receiptNo) => call(`${base}?receiptNo=${encodeURIComponent(receiptNo)}`, { method: "DELETE" })
  };
}

// ---------- spreadsheet ----------

export const CSV_HEADER = ["Receipt", "Date", "Time", "Seller", "Phone", "Email", "Address", "ID type", "ID number", "Payment", "Items", "Paid", "Silver spot", "Fine oz", "Market value", "Refinery return", "Spread", "Signed at", "Signing device", "Record fingerprint"];

export function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(records) {
  const rows = records.map((sale) => {
    const when = new Date(sale.createdAt);
    const p = sale.private || {};
    return [
      sale.receiptNo, when.toLocaleDateString("en-US"), when.toLocaleTimeString("en-US"),
      sale.seller?.name, sale.seller?.phone, sale.seller?.email, sale.seller?.address, sale.seller?.idType, sale.seller?.idNumber,
      sale.payment, (sale.items || []).map((i) => `${i.title} (${i.detail})`).join("; "),
      Number(sale.total || 0).toFixed(2), p.spot?.toFixed?.(3) ?? "", p.fine?.toFixed?.(4) ?? "", p.marketValue?.toFixed?.(2) ?? "", p.expectedReturn?.toFixed?.(2) ?? "", p.spread?.toFixed?.(2) ?? "",
      sale.esign?.signedAt || "", sale.esign?.device || "", sale.esign?.fingerprint || ""
    ].map(csvCell).join(",");
  });
  return [CSV_HEADER.join(","), ...rows].join("\n");
}
