// AG Refining owner dashboard: one calm place for every sale the Buy Desk has made.
// Locked with the same desk code as the Buy Desk; reads the same records store.
import { formatMoney, formatNumber } from "../desk/pricing.mjs";
import { buildReceiptPdf, formatWhen, logoPng, renderReceiptHtml } from "../desk/receipt.mjs";
import { cloudClient, openRecords, toCsv } from "../desk/records.mjs";
import { barChartSvg, filterRecords, greeting, rangeFor, summarize } from "./stats.mjs";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const PIN_KEY = "agdesk:pin";
const CODE_KEY = "agdesk:code";
const LOADER_MS = 1200;
const HOLD_MS = 1200;
const IDLE_LOCK_MS = 10 * 60_000;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const money0 = (n) => formatMoney(n, { cents: false });

const session = {
  get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* private mode */ } },
  remove(key) { try { sessionStorage.removeItem(key); } catch { /* private mode */ } }
};
function readPin() {
  try { return JSON.parse(localStorage.getItem(PIN_KEY)); } catch { return null; }
}
function writePin(value) {
  try { localStorage.setItem(PIN_KEY, JSON.stringify(value)); return true; } catch { return false; }
}
// The desk code is stored only as a SHA-256 hash with the "agdesk:" prefix, exactly as the desk does.
async function sha256(text) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`agdesk:${text}`));
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const records = openRecords();
const state = {
  records: [],
  view: "home",
  query: "",
  range: "all",
  from: "",
  to: "",
  detail: null,
  syncing: null,
  lastActive: Date.now()
};

// ---------- toast ----------
let toastTimer;
function toast(message) {
  const el = $("[data-toast]");
  el.hidden = true;
  void el.offsetWidth;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
}

// ---------- login ----------
const lock = { mode: "unlock", entry: "", first: "", fails: 0, until: 0 };

function renderDots() {
  const saved = readPin();
  const slots = lock.mode === "unlock" && saved ? saved.length : Math.max(4, lock.entry.length);
  $("[data-pin-dots]").innerHTML = Array.from({ length: slots }, (_, i) => `<span class="${i < lock.entry.length ? "on" : ""}"></span>`).join("");
}

function setLoginCopy(title, hint, error = false) {
  $("[data-login-title]").textContent = title;
  const el = $("[data-login-hint]");
  el.textContent = hint;
  el.dataset.state = error ? "error" : "";
}

function startLogin() {
  const saved = readPin();
  lock.mode = saved ? "unlock" : "create";
  lock.entry = "";
  lock.first = "";
  if (lock.mode === "create") setLoginCopy("Choose a desk code", "Four to six digits. The Buy Desk uses the same code.");
  else setLoginCopy("Welcome back", "Enter your desk code.");
  renderDots();
  document.body.dataset.stage = "login";
  const login = $("[data-login]");
  login.hidden = false;
  login.classList.remove("out");
}

function shake(message) {
  const dots = $("[data-pin-dots]");
  dots.classList.remove("shake");
  void dots.offsetWidth;
  dots.classList.add("shake");
  lock.entry = "";
  renderDots();
  setLoginCopy($("[data-login-title]").textContent, message, true);
}

async function submitPin() {
  const entry = lock.entry;
  if (lock.mode === "create") {
    if (entry.length < 4) return shake("Use at least four digits.");
    lock.first = entry;
    lock.entry = "";
    lock.mode = "confirm";
    setLoginCopy("Enter it once more", "To make sure it is right.");
    return renderDots();
  }
  if (lock.mode === "confirm") {
    if (entry !== lock.first) {
      lock.mode = "create";
      lock.first = "";
      setLoginCopy("Choose a desk code", "");
      return shake("Those did not match. Try again.");
    }
    writePin({ hash: await sha256(entry), length: entry.length });
    return enter(entry);
  }
  if (Date.now() < lock.until) return shake("Please wait a moment, then try again.");
  const saved = readPin();
  if (saved && (await sha256(entry)) === saved.hash) {
    lock.fails = 0;
    return enter(entry);
  }
  lock.fails += 1;
  if (lock.fails >= 5) lock.until = Date.now() + 30_000;
  shake(lock.fails >= 5 ? "Too many tries. Wait 30 seconds." : "That code is not right.");
}

function pressKey(key) {
  if (document.body.dataset.stage !== "login") return;
  if (key === "del") lock.entry = lock.entry.slice(0, -1);
  else if (key === "ok") return void submitPin();
  else if (/^\d$/.test(key) && lock.entry.length < 6) lock.entry += key;
  renderDots();
  const saved = readPin();
  if (lock.mode === "unlock" && saved && lock.entry.length === saved.length) submitPin();
}

function buildPad() {
  const pad = $("[data-pin-pad]");
  pad.innerHTML = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"].map((k) => {
    if (k === "del") return `<button class="key key-soft" type="button" data-pin="del" aria-label="Delete"><span class="i i-del" aria-hidden="true"></span></button>`;
    if (k === "ok") return `<button class="key key-soft" type="button" data-pin="ok">OK</button>`;
    return `<button class="key" type="button" data-pin="${k}">${k}</button>`;
  }).join("");
  pad.addEventListener("click", (event) => {
    const key = event.target.closest("[data-pin]")?.dataset.pin;
    if (key) pressKey(key);
  });
}

// ---------- entering the dashboard ----------
async function loadRecords() {
  try {
    state.records = await records.list();
  } catch {
    state.records = [];
    toast("Records could not be opened on this device.");
  }
}

async function enter(code, { quick = false } = {}) {
  session.set(CODE_KEY, code);
  lock.entry = "";
  state.lastActive = Date.now();
  const login = $("[data-login]");
  const loader = $("[data-loader]");
  document.body.dataset.stage = "loading";
  if (!quick) {
    loader.hidden = false;
    loader.classList.remove("out", "run");
    void loader.offsetWidth;
    loader.classList.add("run");
    login.classList.add("out");
  } else {
    login.hidden = true;
  }
  await Promise.all([loadRecords(), wait(quick || reduceMotion ? 0 : LOADER_MS)]);
  login.hidden = true;
  const app = $("[data-app]");
  app.hidden = false;
  app.classList.remove("enter");
  void app.offsetWidth;
  app.classList.add("enter");
  setView(location.hash === "#records" ? "records" : "home", { replace: true });
  render();
  document.body.dataset.stage = "app";
  if (!quick) {
    loader.classList.add("out");
    setTimeout(() => { loader.hidden = true; loader.classList.remove("run", "out"); }, reduceMotion ? 0 : 440);
  }
  syncCloud();
}

function lockNow() {
  session.remove(CODE_KEY);
  closeConfirm();
  closeDetail({ silent: true });
  state.records = [];
  $("[data-recent]").innerHTML = "";
  $("[data-records]").innerHTML = "";
  $("[data-app]").hidden = true;
  startLogin();
}

// ---------- views ----------
function setView(view, { replace = false } = {}) {
  state.view = view;
  $$("[data-page]").forEach((page) => { page.hidden = page.dataset.page !== view; });
  $$(".tab").forEach((tab) => {
    if (tab.dataset.nav === view) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });
  const hash = view === "records" ? "#records" : "";
  if (location.hash !== hash) history[replace ? "replaceState" : "pushState"](null, "", `${location.pathname}${hash}`);
  window.scrollTo(0, 0);
  render();
}

function render() {
  if (state.view === "home") renderHome();
  else renderRecords();
}

function rowHtml(record) {
  const when = new Date(record.createdAt);
  const date = when.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const count = (record.items || []).length;
  return `<li><button type="button" class="row" data-open="${esc(record.receiptNo)}"><b>${esc(record.seller?.name || "Seller")}</b><em>${formatMoney(record.total)}</em><small>${date} at ${time} · ${count} ${count === 1 ? "item" : "items"} · ${esc(record.payment || "Cash")} · ${esc(record.receiptNo)}</small></button></li>`;
}

function renderHome() {
  const now = new Date();
  const s = summarize(state.records, now);
  $("[data-today]").textContent = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  $("[data-greeting]").textContent = `${greeting(now)}, Dennis.`;
  $("[data-kpi='today']").textContent = money0(s.todayPaid);
  $("[data-kpi-sub='today']").textContent = s.todayCount ? `${s.todayCount} ${s.todayCount === 1 ? "sale" : "sales"} today` : "No sales yet today";
  $("[data-kpi='week']").textContent = money0(s.weekPaid);
  $("[data-kpi-sub='week']").textContent = `${s.weekCount} ${s.weekCount === 1 ? "sale" : "sales"} since Monday`;
  $("[data-kpi='month']").textContent = money0(s.monthPaid);
  $("[data-kpi-sub='month']").textContent = now.toLocaleDateString("en-US", { month: "long" });
  $("[data-kpi='count']").textContent = String(s.monthCount);
  $("[data-kpi-sub='count']").textContent = `${s.totalCount} on record`;
  $("[data-kpi='spread']").textContent = money0(s.monthSpread);
  renderChart(s.series);
  const recent = state.records.slice(0, 5);
  $("[data-recent]").innerHTML = recent.length
    ? recent.map(rowHtml).join("")
    : `<li class="empty-note">No receipts yet. Completed sales from the Buy Desk appear here.</li>`;
}

function renderChart(series = summarize(state.records).series) {
  const box = $("[data-chart]");
  const width = Math.max(280, Math.round(box.clientWidth || 640));
  const height = width < 520 ? 220 : 260;
  const total = series.reduce((t, d) => t + d.paid, 0);
  $("[data-chart-total]").textContent = `${money0(total)} in 14 days`;
  box.innerHTML = barChartSvg(series, { width, height, formatMoney: money0 })
    + (total > 0 ? "" : `<p class="chart-empty">No sales in the last 14 days yet.</p>`);
}

function currentRange() {
  if (state.range === "custom") return { from: state.from, to: state.to };
  return rangeFor(state.range);
}

function visibleRecords() {
  return filterRecords(state.records, { query: state.query, ...currentRange() });
}

function renderRecords() {
  const list = visibleRecords();
  const paid = list.reduce((t, r) => t + (Number(r.total) || 0), 0);
  $("[data-records-sum]").textContent = `${list.length} ${list.length === 1 ? "receipt" : "receipts"} · ${formatMoney(paid)} paid`;
  $$("[data-range]").forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.range === state.range)));
  $("[data-custom-range]").hidden = state.range !== "custom";
  const filtered = state.query || state.range !== "all";
  $("[data-records]").innerHTML = list.length
    ? list.map(rowHtml).join("")
    : `<li class="empty-note">${state.records.length ? (filtered ? "No receipts match. Try another name or date." : "No receipts yet.") : "No receipts yet. Completed sales from the Buy Desk appear here."}</li>`;
  $("[data-action='delete-all']").hidden = state.records.length === 0;
}

// ---------- detail ----------
function fact(label, value, cls = "") {
  if (value === "" || value == null) return "";
  return `<div class="${cls}"><dt>${esc(label)}</dt><dd>${value}</dd></div>`;
}

function detailHtml(record) {
  const when = formatWhen(record.createdAt);
  const seller = record.seller || {};
  const p = record.private || {};
  const items = (record.items || []).map((item) => `<li><b>${esc(item.title)}</b><em>${formatMoney(item.offer)}</em><small>${esc(item.detail)}</small></li>`).join("");
  const lines = (p.lines || []).map((line, i) => {
    const title = record.items?.[i]?.title || line.material || "Item";
    return `<li><b>${esc(title)}</b><em>${formatMoney(line.spread || 0)}</em><small>Offer ${Math.round((line.payoutRate || 0) * 100)}% · return ${Math.round((line.recoveryRate || 0) * 100)}% · ${formatNumber(line.fine || 0, 3)} oz fine · market ${formatMoney(line.marketValue || 0)}</small></li>`;
  }).join("");
  const spreadPct = p.expectedReturn > 0 ? ` · ${Math.round((p.spread / p.expectedReturn) * 100)}%` : "";
  const signature = /^data:image\/(png|jpeg);base64,/.test(record.signature || "") ? `<div class="signature"><img src="${esc(record.signature)}" alt="Seller signature" width="320" height="100"></div>` : `<p class="empty-note">No signature image saved.</p>`;
  const e = record.esign || {};
  const signedAt = e.signedAt ? formatWhen(e.signedAt) : null;
  return `
    <div class="detail-head">
      <h1 id="detail-name">${esc(seller.name || "Seller")}</h1>
      <p class="detail-when">${when.date} at ${when.time} · Paid by ${esc(record.payment || "Cash")}</p>
      <p class="detail-total"><span>Total paid</span><strong>${formatMoney(record.total)}</strong></p>
    </div>

    <section class="card" aria-labelledby="d-seller"><header class="card-head"><h2 id="d-seller">Seller</h2></header>
      <dl class="facts">
        ${fact("Name", esc(seller.name))}
        ${fact("Phone", esc(seller.phone))}
        ${fact("Email", esc(seller.email))}
        ${fact("Address", esc(seller.address))}
        ${fact("ID type", esc(seller.idType))}
        ${fact("ID number", esc(seller.idNumber))}
      </dl>
    </section>

    <section class="card" aria-labelledby="d-items"><header class="card-head"><h2 id="d-items">Items</h2></header>
      <ul class="items">${items}<li class="items-total"><b>Total paid</b><em>${formatMoney(record.total)}</em></li></ul>
    </section>

    <section class="card private-card" aria-labelledby="d-private"><header class="card-head"><h2 id="d-private">Private numbers</h2><p>Never shown to the seller</p></header>
      <dl class="facts">
        ${fact("Silver price", p.spot ? `${formatMoney(p.spot)} per oz${p.spotSource === "manual" ? " (manual)" : ""}` : "")}
        ${fact("Fine silver", p.fine != null ? `${formatNumber(p.fine, 3)} oz` : "")}
        ${fact("Market value", p.marketValue != null ? formatMoney(p.marketValue) : "")}
        ${fact("Refinery return", p.expectedReturn != null ? formatMoney(p.expectedReturn) : "")}
        ${fact("Your spread", p.spread != null ? `<span class="spread">${formatMoney(p.spread)}${spreadPct}</span>` : "", "wide")}
      </dl>
      ${lines ? `<ul class="items">${lines}</ul>` : ""}
    </section>

    <section class="card" aria-labelledby="d-sign"><header class="card-head"><h2 id="d-sign">Signature and e-sign record</h2></header>
      ${signature}
      <dl class="facts">
        ${fact("Agreed to sign electronically", e.consent ? "Yes" : "Not recorded")}
        ${fact("Signed", signedAt ? `${signedAt.date} at ${signedAt.time}` : "Not recorded")}
        ${fact("Device", esc(e.device), "wide")}
        ${fact("Record fingerprint (SHA-256)", esc(e.fingerprint), "wide mono")}
      </dl>
    </section>

    <section class="card" aria-labelledby="d-receipt"><header class="card-head"><h2 id="d-receipt">Receipt</h2></header>
      <div class="detail-actions">
        <button type="button" class="btn btn-primary" data-action="share-pdf"><span class="i i-share" aria-hidden="true"></span>Share or save PDF</button>
        <button type="button" class="btn btn-secondary" data-action="print"><span class="i i-print" aria-hidden="true"></span>Print receipt</button>
      </div>
      <p class="detail-status" data-detail-status aria-live="polite"></p>
    </section>

    <section class="danger-zone" aria-label="Delete">
      <p>Remove this receipt from your records.</p>
      <button type="button" class="btn btn-delete" data-action="delete-one"><span class="i i-trash" aria-hidden="true"></span>Delete this receipt</button>
    </section>`;
}

let detailReturnFocus = null;
function openDetail(receiptNo) {
  const record = state.records.find((r) => r.receiptNo === receiptNo);
  if (!record) return;
  state.detail = record;
  detailReturnFocus = document.activeElement;
  $("[data-toast]").hidden = true;
  $("[data-detail-no]").textContent = `Receipt ${record.receiptNo}`;
  $("[data-detail-body]").innerHTML = detailHtml(record);
  const panel = $("[data-detail]");
  panel.hidden = false;
  panel.scrollTop = 0;
  $("[data-action='close-detail']").focus({ preventScroll: true });
}

function closeDetail({ silent = false } = {}) {
  const panel = $("[data-detail]");
  if (panel.hidden) return;
  panel.hidden = true;
  state.detail = null;
  $("[data-detail-body]").innerHTML = "";
  if (!silent && detailReturnFocus?.isConnected) detailReturnFocus.focus({ preventScroll: true });
}

function setDetailStatus(message, kind = "") {
  const el = $("[data-detail-status]");
  if (!el) return;
  el.textContent = message;
  el.dataset.state = kind;
}

async function sharePdf() {
  const record = state.detail;
  if (!record) return;
  try {
    setDetailStatus("Preparing the PDF…");
    if (!window.jspdf?.jsPDF) throw new Error("PDF engine is still loading");
    const logo = await logoPng().catch(() => null);
    const blob = buildReceiptPdf(record, { jsPDF: window.jspdf.jsPDF, logo }).output("blob");
    const file = new File([blob], `AG-Refining-Receipt-${record.receiptNo}.pdf`, { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `AG Refining receipt ${record.receiptNo}` });
      return setDetailStatus("Shared.");
    }
    download(blob, file.name);
    setDetailStatus("PDF saved.");
  } catch (error) {
    if (error?.name === "AbortError") return setDetailStatus("");
    setDetailStatus("The PDF could not be made. Use Print instead.", "error");
  }
}

function printReceipt() {
  if (!state.detail) return;
  $("[data-print-receipt]").innerHTML = renderReceiptHtml(state.detail);
  window.print();
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function exportCsv() {
  const list = visibleRecords();
  if (!list.length) return toast("No receipts to export");
  const name = `AG-Refining-Receipts-${new Date().toISOString().slice(0, 10)}.csv`;
  const blob = new Blob([toCsv(list)], { type: "text/csv" });
  const file = new File([blob], name, { type: "text/csv" });
  if (navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file], title: "AG Refining receipts" }).catch(() => {});
    return;
  }
  download(blob, name);
  toast(`${list.length} ${list.length === 1 ? "receipt" : "receipts"} exported`);
}

// ---------- confirm with press-and-hold ----------
const confirmState = { onConfirm: null, word: "", start: 0, raf: 0, done: false, returnFocus: null };

function openConfirm({ title, text, what = "", word = "", label, onConfirm }) {
  confirmState.onConfirm = onConfirm;
  confirmState.word = word;
  confirmState.done = false;
  confirmState.returnFocus = document.activeElement;
  $("[data-confirm-title]").textContent = title;
  $("[data-confirm-text]").textContent = text;
  $("[data-confirm-what]").textContent = what;
  $("[data-confirm-what]").hidden = !what;
  $("[data-confirm-type]").hidden = !word;
  $("[data-confirm-input]").value = "";
  $("[data-hold-label]").textContent = label;
  resetHold();
  updateHoldEnabled();
  $("[data-confirm]").hidden = false;
  (word ? $("[data-confirm-input]") : $("[data-action='cancel-confirm']")).focus();
}

function closeConfirm() {
  const box = $("[data-confirm]");
  if (box.hidden) return;
  resetHold();
  box.hidden = true;
  if (confirmState.returnFocus?.isConnected) confirmState.returnFocus.focus({ preventScroll: true });
}

function updateHoldEnabled() {
  const ok = !confirmState.word || $("[data-confirm-input]").value.trim().toUpperCase() === confirmState.word;
  $("[data-hold]").disabled = !ok;
}

function resetHold() {
  cancelAnimationFrame(confirmState.raf);
  confirmState.start = 0;
  $("[data-hold]").style.setProperty("--p", "0");
}

function startHold() {
  const button = $("[data-hold]");
  if (button.disabled || confirmState.done || confirmState.start) return;
  confirmState.start = performance.now();
  const step = (now) => {
    if (!confirmState.start) return;
    const p = Math.min(1, (now - confirmState.start) / HOLD_MS);
    button.style.setProperty("--p", String(p));
    if (p >= 1) {
      confirmState.done = true;
      confirmState.start = 0;
      const action = confirmState.onConfirm;
      closeConfirm();
      action?.();
      return;
    }
    confirmState.raf = requestAnimationFrame(step);
  };
  confirmState.raf = requestAnimationFrame(step);
}

function endHold() {
  if (confirmState.done || !confirmState.start) return;
  resetHold();
  toast("Keep holding until the bar fills");
}

function bindHold() {
  const button = $("[data-hold]");
  button.addEventListener("pointerdown", (event) => { event.preventDefault(); startHold(); });
  ["pointerup", "pointerleave", "pointercancel"].forEach((type) => button.addEventListener(type, endHold));
  button.addEventListener("contextmenu", (event) => event.preventDefault());
  button.addEventListener("keydown", (event) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) { event.preventDefault(); startHold(); }
  });
  button.addEventListener("keyup", (event) => { if (event.key === " " || event.key === "Enter") endHold(); });
  $("[data-confirm-input]").addEventListener("input", updateHoldEnabled);
}

async function deleteOne(record) {
  await records.remove(record.receiptNo);
  await loadRecords();
  closeDetail({ silent: true });
  render();
  toast("Receipt deleted");
  syncCloud();
}

async function deleteAll() {
  const count = await records.removeAll();
  await loadRecords();
  closeDetail({ silent: true });
  render();
  toast(`${count} ${count === 1 ? "receipt" : "receipts"} deleted`);
  syncCloud();
}

// ---------- cloud sync ----------
function setSync(kind, text) {
  const el = $("[data-sync]");
  el.dataset.state = kind;
  $("[data-sync-text]").textContent = text;
}

async function syncCloud() {
  if (state.syncing) return state.syncing;
  const client = cloudClient({ code: session.get(CODE_KEY) || "" });
  state.syncing = (async () => {
    const status = await client.status();
    if (!status.cloud) return setSync("local", "Saved on this iPad");
    setSync("syncing", "Syncing with the cloud");
    const result = await records.sync(client);
    if (!result.cloud) return setSync("local", "Saved on this iPad");
    if (!result.ok) return setSync("error", "Saved on this iPad · cloud not reachable right now");
    if (result.changed) {
      await loadRecords();
      if ($("[data-detail]").hidden) render();
    }
    setSync("synced", `Synced to cloud · ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`);
  })().catch(() => setSync("error", "Saved on this iPad · cloud not reachable right now")).finally(() => { state.syncing = null; });
  return state.syncing;
}

// ---------- wiring ----------
function openDesk() {
  document.body.classList.add("leaving");
  setTimeout(() => { window.location.href = "/desk"; }, reduceMotion ? 0 : 300);
}

function bind() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.dataset.nav) return setView(target.dataset.nav);
    if (target.dataset.open) return openDetail(target.dataset.open);
    if (target.dataset.range) {
      state.range = target.dataset.range;
      if (state.range === "custom" && !state.from && !state.to) {
        const month = rangeFor("month");
        state.from = month.from;
        state.to = month.to;
        $("[data-from]").value = state.from;
        $("[data-to]").value = state.to;
      }
      return renderRecords();
    }
    switch (target.dataset.action) {
      case "open-desk": return openDesk();
      case "lock": return lockNow();
      case "close-detail": return closeDetail();
      case "share-pdf": return sharePdf();
      case "print": return printReceipt();
      case "export-csv": return exportCsv();
      case "cancel-confirm": return closeConfirm();
      case "delete-one": {
        const record = state.detail;
        if (!record) return;
        return openConfirm({
          title: "Delete this receipt?",
          text: "This cannot be undone.",
          what: `${record.seller?.name || "Seller"} · ${formatMoney(record.total)} · ${record.receiptNo}`,
          label: "Press and hold to delete",
          onConfirm: () => deleteOne(record)
        });
      }
      case "delete-all":
        return openConfirm({
          title: `Delete all ${state.records.length} ${state.records.length === 1 ? "receipt" : "receipts"}?`,
          text: "This cannot be undone. Export the spreadsheet first if you need a copy.",
          word: "DELETE",
          label: "Press and hold to delete all",
          onConfirm: deleteAll
        });
      default:
    }
  });

  $("[data-search]").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderRecords();
  });
  $("[data-from]").addEventListener("change", (event) => { state.from = event.target.value; renderRecords(); });
  $("[data-to]").addEventListener("change", (event) => { state.to = event.target.value; renderRecords(); });

  document.addEventListener("keydown", (event) => {
    state.lastActive = Date.now();
    if (document.body.dataset.stage === "login") {
      if (/^\d$/.test(event.key)) pressKey(event.key);
      else if (event.key === "Backspace") pressKey("del");
      else if (event.key === "Enter") pressKey("ok");
      return;
    }
    if (event.key === "Escape") {
      if (!$("[data-confirm]").hidden) closeConfirm();
      else closeDetail();
    }
  });
  ["pointerdown", "scroll", "touchstart"].forEach((type) => document.addEventListener(type, () => { state.lastActive = Date.now(); }, { passive: true, capture: true }));
  window.addEventListener("popstate", () => {
    if (document.body.dataset.stage !== "app") return;
    if (!$("[data-detail]").hidden) return closeDetail();
    setView(location.hash === "#records" ? "records" : "home", { replace: true });
  });
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (state.view === "home" && document.body.dataset.stage === "app") renderChart(); }, 150);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden || document.body.dataset.stage !== "app") return;
    loadRecords().then(render);
    syncCloud();
  });
  // Lock after ten quiet minutes so private numbers and ID numbers are not left on screen.
  setInterval(() => {
    if (document.body.dataset.stage === "app" && Date.now() - state.lastActive > IDLE_LOCK_MS) lockNow();
  }, 30_000);
  // Coming back from the desk via the browser's back button restores this page from cache.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) document.body.classList.remove("leaving");
  });
}

async function init() {
  buildPad();
  bindHold();
  bind();
  const code = session.get(CODE_KEY);
  const saved = readPin();
  // Coming straight from an unlocked Buy Desk: no second code entry.
  if (code && saved && (await sha256(code)) === saved.hash) return enter(code, { quick: true });
  session.remove(CODE_KEY);
  startLogin();
}

init();
