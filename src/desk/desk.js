// AG Refining Buy Desk: counter app for buying silver in front of a client.
import {
  COINS, DEFAULT_SETTINGS, MATERIALS, UNIT_LABELS,
  coinById, describeItem, formatMoney, formatNumber, materialById, priceItem, priceLot, receiptNumber
} from "./pricing.mjs";
import { agreementFingerprint, buildReceiptPdf, logoPng, renderReceiptHtml } from "./receipt.mjs";
import { GOOGLE_REVIEW_URL, reviewTextLink, safeReviewUrl } from "./review-link.mjs";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const KEYS = { pin: "agdesk:pin", settings: "agdesk:settings", lot: "agdesk:lot", history: "agdesk:history", spot: "agdesk:spot" };
const HOLD_MINUTES = 15;
const SPOT_REFRESH_MS = 30_000;
const SPOT_STALE_MS = 10 * 60_000;
const HISTORY_LIMIT = 300;
const IDENTIFY_MAX_PX = 1600;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- storage ----------
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
};
const session = {
  get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* private mode */ } },
  remove(key) { try { sessionStorage.removeItem(key); } catch { /* private mode */ } }
};

function loadSettings() {
  const saved = store.get(KEYS.settings, {});
  return {
    payout: { ...DEFAULT_SETTINGS.payout, ...(saved.payout || {}) },
    recovery: { ...DEFAULT_SETTINGS.recovery, ...(saved.recovery || {}) },
    rounding: saved.rounding === "dollar" ? "dollar" : "cents",
    manualSpot: Number(saved.manualSpot) > 0 ? Number(saved.manualSpot) : null
  };
}

const state = {
  settings: loadSettings(),
  lot: store.get(KEYS.lot, { items: [] }),
  live: store.get(KEYS.spot, null), // { price, source, fetchedAt }
  liveOk: false,
  held: null, // { price, at } while presenting / signing
  draft: null,
  editIndex: -1,
  currentSale: null,
  emailConfigured: null,
  reviewUrl: GOOGLE_REVIEW_URL,
  identifyAvailable: false,
  identifying: false
};
if (!Array.isArray(state.lot.items)) state.lot = { items: [] };

function saveLot() { store.set(KEYS.lot, state.lot); }
function saveSettings() { store.set(KEYS.settings, state.settings); }

// ---------- helpers ----------
function show(screen) {
  document.body.dataset.screen = screen;
  window.scrollTo(0, 0);
  $$(".screen").forEach((el) => { el.scrollTop = 0; });
}

let toastTimer;
function toast(message) {
  const el = $("[data-toast]");
  el.hidden = true;
  void el.offsetWidth;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
}

function animateMoney(el, to, { from = Number(el.dataset.value || 0), duration = 700 } = {}) {
  el.dataset.value = String(to);
  cancelAnimationFrame(Number(el.dataset.raf || 0));
  if (reduceMotion || from === to) {
    el.textContent = formatMoney(to);
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = formatMoney(from + (to - from) * eased);
    if (t < 1) el.dataset.raf = String(requestAnimationFrame(step));
  };
  el.dataset.raf = String(requestAnimationFrame(step));
}

function currentSpot() {
  if (state.held) return state.held.price;
  if (state.settings.manualSpot) return state.settings.manualSpot;
  return state.live?.price || 0;
}

function lotPricing(spot = currentSpot()) {
  return priceLot(state.lot.items, spot, state.settings);
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(`agdesk:${text}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- lock ----------
const lock = { mode: "unlock", entry: "", first: "", fails: 0, until: 0 };

function renderPinDots() {
  const saved = store.get(KEYS.pin, null);
  const slots = lock.mode === "unlock" && saved ? saved.length : Math.max(4, lock.entry.length);
  $("[data-pin-dots]").innerHTML = Array.from({ length: slots }, (_, i) => `<span class="${i < lock.entry.length ? "on" : ""}"></span>`).join("");
}

function setLockCopy(title, hint, error = false) {
  $("[data-lock-title]").textContent = title;
  const hintEl = $("[data-lock-hint]");
  hintEl.textContent = hint;
  hintEl.dataset.state = error ? "error" : "";
}

function startLock(mode) {
  const saved = store.get(KEYS.pin, null);
  lock.mode = mode || (saved ? "unlock" : "create");
  lock.entry = "";
  lock.first = "";
  if (lock.mode === "create") setLockCopy("Choose a desk code", "Four to six digits. You will use it to open the desk.");
  else setLockCopy("Enter your desk code", "Welcome back.");
  renderPinDots();
  show("lock");
}

function shakePin(message) {
  const dots = $("[data-pin-dots]");
  dots.classList.remove("shake");
  void dots.offsetWidth;
  dots.classList.add("shake");
  lock.entry = "";
  renderPinDots();
  setLockCopy($("[data-lock-title]").textContent, message, true);
}

async function submitPin() {
  const entry = lock.entry;
  if (lock.mode === "create") {
    if (entry.length < 4) return shakePin("Use at least four digits.");
    lock.first = entry;
    lock.entry = "";
    lock.mode = "confirm";
    setLockCopy("Enter it once more", "To make sure it is right.");
    renderPinDots();
    return;
  }
  if (lock.mode === "confirm") {
    if (entry !== lock.first) {
      lock.mode = "create";
      lock.first = "";
      setLockCopy("Choose a desk code", "");
      return shakePin("Those did not match. Try again.");
    }
    store.set(KEYS.pin, { hash: await sha256(entry), length: entry.length });
    unlock(entry);
    return;
  }
  if (Date.now() < lock.until) return shakePin("Please wait a moment, then try again.");
  const saved = store.get(KEYS.pin, null);
  if (saved && (await sha256(entry)) === saved.hash) {
    lock.fails = 0;
    unlock(entry);
  } else {
    lock.fails += 1;
    if (lock.fails >= 5) lock.until = Date.now() + 30_000;
    shakePin(lock.fails >= 5 ? "Too many tries. Wait 30 seconds." : "That code is not right.");
  }
}

function unlock(code) {
  session.set("agdesk:code", code);
  lock.entry = "";
  renderDesk();
  show("desk");
  loadDeskConfig();
}

// Server-side switches: receipt email, the review link override, and the hallmark reader.
let configLoaded = false;
async function loadDeskConfig() {
  if (configLoaded) return;
  configLoaded = true;
  const getJson = (url) => fetch(url, { headers: { Accept: "application/json" } }).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  const [receipt, identify] = await Promise.all([getJson("/api/receipt"), getJson("/api/identify")]);
  if (typeof receipt.email === "boolean") state.emailConfigured = receipt.email;
  state.reviewUrl = safeReviewUrl(receipt.reviewUrl) || GOOGLE_REVIEW_URL;
  state.identifyAvailable = identify.available === true;
  $("[data-action='identify']").hidden = !state.identifyAvailable;
  if (state.currentSale) renderReviewCard(state.currentSale);
}

function buildPinPad() {
  const pad = $("[data-pin-pad]");
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"];
  pad.innerHTML = keys.map((k) => {
    if (k === "del") return `<button class="key key-soft" type="button" data-pin="del" aria-label="Delete"><span class="i i-del"></span></button>`;
    if (k === "ok") return `<button class="key key-soft" type="button" data-pin="ok">OK</button>`;
    return `<button class="key" type="button" data-pin="${k}">${k}</button>`;
  }).join("");
  pad.addEventListener("click", (event) => {
    const key = event.target.closest("[data-pin]")?.dataset.pin;
    if (!key) return;
    if (key === "del") lock.entry = lock.entry.slice(0, -1);
    else if (key === "ok") return void submitPin();
    else if (lock.entry.length < 6) lock.entry += key;
    renderPinDots();
    const saved = store.get(KEYS.pin, null);
    if (lock.mode === "unlock" && saved && lock.entry.length === saved.length) submitPin();
  });
}

// ---------- live market ----------
function renderLiveChip() {
  const chip = $("[data-live-chip]");
  const label = $("[data-live-text]");
  if (state.settings.manualSpot) {
    chip.dataset.state = "manual";
    label.textContent = "Manual market price";
    return;
  }
  if (!state.live?.price) {
    chip.dataset.state = "offline";
    label.textContent = "Market offline · set a price in Settings";
    return;
  }
  const age = Date.now() - new Date(state.live.fetchedAt).getTime();
  if (!state.liveOk && age > SPOT_STALE_MS) {
    chip.dataset.state = "offline";
    label.textContent = `Market offline · last price ${Math.round(age / 60000)} min ago`;
    return;
  }
  chip.dataset.state = "live";
  const seconds = Math.max(0, Math.round(age / 1000));
  label.textContent = seconds < 60 ? `Live market · ${seconds}s ago` : `Live market · ${Math.round(seconds / 60)} min ago`;
}

async function refreshSpot() {
  try {
    const response = await fetch("/api/spot", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("spot");
    const data = await response.json();
    if (!(data.price > 0)) throw new Error("spot");
    const changed = state.live?.price !== data.price;
    state.live = { price: data.price, source: data.source, fetchedAt: data.fetchedAt || new Date().toISOString() };
    state.liveOk = true;
    store.set(KEYS.spot, state.live);
    if (changed) {
      const chip = $("[data-live-chip]");
      chip.classList.remove("tick");
      void chip.offsetWidth;
      chip.classList.add("tick");
      if (document.body.dataset.screen === "desk") renderLot();
      if (state.draft) renderDraft();
    }
  } catch {
    state.liveOk = false;
  }
  renderLiveChip();
  updatePresentAvailability();
}

// ---------- desk ----------
function renderTiles() {
  const counts = {};
  state.lot.items.forEach((item) => { counts[item.material] = (counts[item.material] || 0) + 1; });
  $("[data-tiles]").innerHTML = MATERIALS.map((m, n) => `
    <button class="tile" type="button" data-material="${m.id}" style="--n:${n}">
      <img src="${m.image}" alt="" loading="lazy" width="320" height="200">
      <span>${m.name}</span><small>${m.note}</small>
      ${counts[m.id] ? `<b class="tile-count" aria-label="${counts[m.id]} in offer">${counts[m.id]}</b>` : ""}
    </button>`).join("");
}

function renderLot() {
  const priced = lotPricing();
  const list = $("[data-lot-lines]");
  const shown = Number(list.dataset.count || 0);
  list.innerHTML = priced.lines.map((line, index) => {
    const d = describeItem(line.item);
    const fresh = index >= shown ? " is-new" : "";
    return `<li><button class="lot-line${fresh}" type="button" data-edit="${index}"><b>${d.title}</b><em>${formatMoney(line.offer)}</em><small>${d.detail}</small></button></li>`;
  }).join("");
  list.dataset.count = String(priced.lines.length);
  const empty = state.lot.items.length === 0;
  $("[data-lot-empty]").hidden = !empty;
  $("[data-action='clear']").disabled = empty;
  animateMoney($("[data-lot-total]"), priced.offer);
  $("[data-lot-dock]").hidden = empty;
  $("[data-dock-count]").textContent = `${priced.lines.length} ${priced.lines.length === 1 ? "item" : "items"} · offer total`;
  animateMoney($("[data-dock-total]"), priced.offer);
  // Private numbers
  $("[data-p-spot]").textContent = currentSpot() ? `${formatMoney(currentSpot())} /oz` : "–";
  $("[data-p-fine]").textContent = `${formatNumber(priced.fine, 3)} oz`;
  $("[data-p-market]").textContent = formatMoney(priced.marketValue);
  $("[data-p-return]").textContent = formatMoney(priced.expectedReturn);
  $("[data-p-spread]").textContent = `${formatMoney(priced.spread)}${priced.expectedReturn > 0 ? ` · ${Math.round(priced.spreadPct * 100)}%` : ""}`;
  updatePresentAvailability();
}

function updatePresentAvailability() {
  const blocked = state.lot.items.length === 0 || !currentSpot();
  $$("[data-action='present']").forEach((button) => { button.disabled = blocked; });
}

function renderDesk() {
  renderTiles();
  renderLot();
  renderLiveChip();
}

function bindPrivateHold() {
  const button = $("[data-private-hold]");
  const panel = $("[data-private]");
  const on = (event) => {
    event.preventDefault();
    renderLot();
    panel.hidden = false;
    button.classList.add("held");
  };
  const off = () => {
    panel.hidden = true;
    button.classList.remove("held");
  };
  button.addEventListener("pointerdown", on);
  ["pointerup", "pointerleave", "pointercancel", "blur"].forEach((type) => button.addEventListener(type, off));
  button.addEventListener("keydown", (event) => { if (event.key === " " || event.key === "Enter") on(event); });
  button.addEventListener("keyup", off);
  button.addEventListener("contextmenu", (event) => event.preventDefault());
}

// ---------- item sheet ----------
const WEIGHT_UNITS = ["g", "dwt", "ozt", "oz", "lb"];
const UNIT_SHORT = { g: "Grams", dwt: "Pennyweight", ozt: "Troy oz", oz: "Ounces", lb: "Pounds", kg: "Kilograms" };

function openSheet(materialId, editIndex = -1, suggestion = null) {
  const material = materialById(materialId);
  if (!material) return;
  const existing = editIndex >= 0 ? state.lot.items[editIndex] : null;
  state.editIndex = editIndex;
  state.draft = existing ? { ...existing, amount: String(existing.amount) } : {
    material: material.id,
    mode: material.mode,
    unit: material.unit || "g",
    purity: material.purity,
    coin: material.mode === "coins" ? "quarter90" : null,
    byFace: false,
    amount: ""
  };
  $("[data-sheet-img]").src = material.image;
  $("[data-sheet-title]").textContent = material.name;
  $("[data-sheet-note]").textContent = material.note;
  const coins = material.mode === "coins";
  $("[data-coin-group]").hidden = !coins;
  $("[data-purity-group]").hidden = coins || !material.purities;
  $("[data-unit-group]").hidden = coins;
  if (coins) {
    $("[data-coin-chips]").innerHTML = COINS.map((c) => `<button type="button" class="chip" data-coin="${c.id}" aria-pressed="false">${c.short}</button>`).join("");
  } else {
    $("[data-purity-chips]").innerHTML = (material.purities || []).map(([p, label]) => `<button type="button" class="chip" data-purity="${p}" aria-pressed="false">${label}</button>`).join("");
    $("[data-unit-chips]").innerHTML = WEIGHT_UNITS.map((u) => `<button type="button" data-unit="${u}" aria-pressed="false">${UNIT_SHORT[u]}</button>`).join("");
  }
  $("[data-action='remove-item']").hidden = editIndex < 0;
  $("[data-action='save-item']").innerHTML = editIndex >= 0 ? "Update offer" : `Add to offer <span class="i i-arrow" aria-hidden="true"></span>`;
  $("[data-item-offer]").dataset.value = "0";
  renderSuggestion(suggestion);
  $("[data-sheet-backdrop]").hidden = false;
  $("[data-sheet]").hidden = false;
  renderDraft();
}

// A hallmark reading pre-selects chips in a fresh sheet. The owner still enters the
// weight and taps Add, and can change any choice first.
function renderSuggestion(suggestion) {
  const note = $("[data-identify-note]");
  if (!suggestion) {
    note.hidden = true;
    return;
  }
  const d = state.draft;
  const material = materialById(d.material);
  if (material.purities?.some(([p]) => p === suggestion.purity)) d.purity = suggestion.purity;
  if (material.mode === "coins" && coinById(suggestion.coin)) d.coin = suggestion.coin;
  const confidence = ["high", "medium", "low"].includes(suggestion.confidence) ? suggestion.confidence : "low";
  $("[data-identify-confidence]").textContent = `${confidence[0].toUpperCase()}${confidence.slice(1)} confidence`;
  $("[data-identify-confidence]").dataset.level = confidence;
  const marks = Array.isArray(suggestion.marks) ? suggestion.marks.filter(Boolean) : [];
  $("[data-identify-marks]").textContent = marks.length ? `Marks read: ${marks.join(" · ")}` : "No marks could be read.";
  $("[data-identify-text]").textContent = suggestion.note || "";
  note.hidden = false;
}

function closeSheet() {
  $("[data-sheet]").hidden = true;
  $("[data-sheet-backdrop]").hidden = true;
  state.draft = null;
  state.editIndex = -1;
}

function draftItem() {
  const d = state.draft;
  return { ...d, amount: Number(d.amount) || 0 };
}

function renderDraft() {
  const d = state.draft;
  if (!d) return;
  $$("[data-coin]").forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.coin === d.coin)));
  $$("[data-coin-mode] button").forEach((el) => el.setAttribute("aria-pressed", String((el.dataset.value === "face") === Boolean(d.byFace))));
  const coin = coinById(d.coin);
  $("[data-coin-mode]").hidden = d.mode !== "coins" || !coin?.face;
  if (d.mode === "coins" && !coin?.face) d.byFace = false;
  $$("[data-purity]").forEach((el) => el.setAttribute("aria-pressed", String(Number(el.dataset.purity) === d.purity)));
  $$("[data-unit]").forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.unit === d.unit)));

  const amountEl = $("[data-amount]");
  const unitEl = $("[data-amount-unit]");
  if (d.mode === "coins") {
    $("[data-amount-label]").textContent = d.byFace ? "Face value" : "How many coins?";
    amountEl.textContent = d.byFace ? `$${d.amount || "0"}` : (d.amount || "0");
    unitEl.textContent = d.byFace ? "face" : (Number(d.amount) === 1 ? "coin" : "coins");
  } else {
    $("[data-amount-label]").textContent = "Weight";
    amountEl.textContent = d.amount || "0";
    unitEl.textContent = UNIT_LABELS[d.unit];
  }
  amountEl.classList.add("caret");

  const spot = currentSpot();
  const item = draftItem();
  const valid = item.amount > 0 && spot > 0;
  const offer = valid ? priceItem(item, spot, state.settings).offer : 0;
  animateMoney($("[data-item-offer]"), offer, { duration: 360 });
  $("[data-action='save-item']").disabled = !valid;
}

function draftKey(key) {
  const d = state.draft;
  if (!d) return;
  let value = d.amount;
  const allowDecimal = !(d.mode === "coins" && !d.byFace);
  if (key === "del") value = value.slice(0, -1);
  else if (key === "clear") value = "";
  else if (key === ".") {
    if (allowDecimal && !value.includes(".")) value = value ? `${value}.` : "0.";
  } else {
    const [, decimals = ""] = value.split(".");
    if (value.includes(".") && decimals.length >= 3) return;
    if (value.replace(".", "").length >= 8) return;
    value = value === "0" ? key : value + key;
  }
  d.amount = value;
  renderDraft();
}

function buildAmountPad() {
  const pad = $("[data-amount-pad]");
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];
  pad.innerHTML = keys.map((k) => k === "del"
    ? `<button class="key key-soft" type="button" data-key="del" aria-label="Delete. Hold to clear."><span class="i i-del"></span></button>`
    : `<button class="key" type="button" data-key="${k}">${k}</button>`).join("");
  pad.addEventListener("click", (event) => {
    const key = event.target.closest("[data-key]")?.dataset.key;
    if (key) draftKey(key);
  });
  let holdTimer;
  const del = $("[data-key='del']", pad);
  del.addEventListener("pointerdown", () => { holdTimer = setTimeout(() => draftKey("clear"), 600); });
  ["pointerup", "pointerleave", "pointercancel"].forEach((t) => del.addEventListener(t, () => clearTimeout(holdTimer)));
}

function saveDraft() {
  const item = draftItem();
  if (!(item.amount > 0)) return;
  const clean = { material: item.material, mode: item.mode, unit: item.unit, purity: item.purity, coin: item.coin, byFace: Boolean(item.byFace), amount: item.amount };
  const editing = state.editIndex >= 0;
  if (editing) state.lot.items[state.editIndex] = clean;
  else state.lot.items.push(clean);
  saveLot();
  closeSheet();
  renderTiles();
  renderLot();
  toast(editing ? "Offer updated" : "Added to the offer");
}

function removeDraft() {
  if (state.editIndex < 0) return;
  state.lot.items.splice(state.editIndex, 1);
  saveLot();
  closeSheet();
  renderTiles();
  renderLot();
  toast("Removed");
}

// ---------- hallmark reader ----------
function setIdentifying(busy) {
  state.identifying = busy;
  const button = $("[data-action='identify']");
  button.disabled = busy;
  button.classList.toggle("busy", busy);
  $("[data-identify-label]").textContent = busy ? "Reading the hallmark…" : "Read the hallmark";
}

// Downsize on the tablet so the upload is small and fast: longest side 1600 px, JPEG.
function downsizePhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, IDENTIFY_MAX_PX / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1] || "");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That photo could not be opened."));
    };
    img.src = url;
  });
}

async function identifyPhoto(file) {
  if (!file || state.identifying) return;
  setIdentifying(true);
  try {
    const imageBase64 = await downsizePhoto(file);
    const response = await fetch("/api/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code: session.get("agdesk:code") || "", imageBase64 })
    });
    const result = await response.json().catch(() => ({}));
    if (response.status === 503) {
      state.identifyAvailable = false;
      $("[data-action='identify']").hidden = true;
    }
    if (!response.ok) throw new Error(result.message || "The photo could not be read right now.");
    if (!materialById(result.material)) {
      toast(result.note || "Could not read the marks clearly. Choose the material by hand.");
      return;
    }
    closePanels();
    openSheet(result.material, -1, result);
  } catch (error) {
    toast(error.message || "The photo could not be read right now.");
  } finally {
    setIdentifying(false);
    $("[data-identify-input]").value = "";
  }
}

// ---------- presentation ----------
function present() {
  const spot = currentSpot();
  if (!spot || state.lot.items.length === 0) return;
  state.held = { price: spot, at: Date.now() };
  const priced = lotPricing(spot);
  const until = new Date(state.held.at + HOLD_MINUTES * 60_000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  $("[data-present-for]").textContent = `Prepared for you · ${today}`;
  $("[data-present-hold]").textContent = `Based on today's silver market. This offer is held for you until ${until}.`;
  $("[data-present-lines]").innerHTML = priced.lines.map((line, n) => {
    const d = describeItem(line.item);
    return `<li style="--n:${n}"><b>${d.title}</b><em>${formatMoney(line.offer)}</em><small>${d.detail}</small></li>`;
  }).join("");
  const total = $("[data-present-total]");
  total.textContent = formatMoney(0);
  total.dataset.value = "0";
  show("present");
  setTimeout(() => animateMoney(total, priced.offer, { from: 0, duration: 1500 }), 260);
}

function releaseHold() {
  state.held = null;
  renderDesk();
  show("desk");
}

// ---------- agreement ----------
const signature = { ctx: null, drawing: false, empty: true, last: null, bounds: null };

function setupSignature() {
  const canvas = $("[data-sign-pad]");
  const resize = () => {
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    signature.ctx = canvas.getContext("2d");
    signature.ctx.scale(ratio, ratio);
    signature.ctx.lineCap = "round";
    signature.ctx.lineJoin = "round";
    signature.ctx.strokeStyle = "#102a43";
    signature.ctx.lineWidth = 2.6;
    clearSignature();
  };
  signature.resize = resize;
  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const grow = (p) => {
    const b = signature.bounds || { x1: p.x, y1: p.y, x2: p.x, y2: p.y };
    signature.bounds = { x1: Math.min(b.x1, p.x), y1: Math.min(b.y1, p.y), x2: Math.max(b.x2, p.x), y2: Math.max(b.y2, p.y) };
  };
  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    signature.drawing = true;
    signature.last = point(event);
    grow(signature.last);
    signature.ctx.beginPath();
    signature.ctx.arc(signature.last.x, signature.last.y, 1.2, 0, Math.PI * 2);
    signature.ctx.fillStyle = "#102a43";
    signature.ctx.fill();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!signature.drawing) return;
    const events = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];
    for (const e of events) {
      const p = point(e);
      const mid = { x: (signature.last.x + p.x) / 2, y: (signature.last.y + p.y) / 2 };
      signature.ctx.beginPath();
      signature.ctx.moveTo(signature.last.mid?.x ?? signature.last.x, signature.last.mid?.y ?? signature.last.y);
      signature.ctx.quadraticCurveTo(signature.last.x, signature.last.y, mid.x, mid.y);
      signature.ctx.stroke();
      signature.last = { ...p, mid };
      grow(p);
    }
    signature.empty = false;
    $(".sign").classList.remove("invalid");
  });
  const end = () => { signature.drawing = false; };
  ["pointerup", "pointercancel", "pointerleave"].forEach((t) => canvas.addEventListener(t, end));
  window.addEventListener("resize", () => { if (document.body.dataset.screen === "agree" && signature.empty) resize(); });
}

function clearSignature() {
  const canvas = $("[data-sign-pad]");
  signature.ctx?.clearRect(0, 0, canvas.width, canvas.height);
  signature.empty = true;
  signature.bounds = null;
}

function signatureImage() {
  if (signature.empty || !signature.bounds) return "";
  const canvas = $("[data-sign-pad]");
  const ratio = canvas.width / canvas.getBoundingClientRect().width || 1;
  const pad = 8;
  const b = signature.bounds;
  const sx = Math.max(0, (b.x1 - pad) * ratio);
  const sy = Math.max(0, (b.y1 - pad) * ratio);
  const sw = Math.min(canvas.width - sx, (b.x2 - b.x1 + pad * 2) * ratio);
  const sh = Math.min(canvas.height - sy, (b.y2 - b.y1 + pad * 2) * ratio);
  const scale = Math.min(1, 640 / sw, 200 / sh);
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(sw * scale));
  out.height = Math.max(1, Math.round(sh * scale));
  out.getContext("2d").drawImage(canvas, sx, sy, sw, sh, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}

function chipValue(group) {
  return $(`[data-chip-group='${group}'] [aria-pressed='true']`)?.dataset.value || "";
}

function openAgreement() {
  const priced = lotPricing();
  $("[data-agree-total]").textContent = formatMoney(priced.offer);
  $("[data-agree-alert]").hidden = true;
  show("agree");
  requestAnimationFrame(() => { if (signature.empty) signature.resize(); });
}

function resetAgreement() {
  const form = $("[data-agree-form]");
  form.reset();
  $$("[aria-invalid]", form).forEach((el) => el.removeAttribute("aria-invalid"));
  $$("[data-chip-group]", form).forEach((group) => $$(".chip", group).forEach((chip, i) => chip.setAttribute("aria-pressed", String(i === 0))));
  $(".affirm").classList.remove("invalid");
  $(".sign").classList.remove("invalid");
  clearSignature();
}

async function completeSale(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const problems = [];
  const mark = (name, bad) => form.elements[name].toggleAttribute("aria-invalid", bad);
  mark("name", String(data.name || "").trim().length < 2);
  if (String(data.name || "").trim().length < 2) problems.push("the seller's full name");
  mark("idNumber", String(data.idNumber || "").trim().length < 4);
  if (String(data.idNumber || "").trim().length < 4) problems.push("an ID number");
  const email = String(data.email || "").trim();
  const emailBad = email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  mark("email", emailBad);
  if (emailBad) problems.push("a complete email address");
  $(".affirm").classList.toggle("invalid", !data.affirm);
  if (!data.affirm) problems.push("the seller's checkmark on the statement");
  $(".sign").classList.toggle("invalid", signature.empty);
  if (signature.empty) problems.push("a signature");
  const alert = $("[data-agree-alert]");
  if (problems.length) {
    alert.textContent = `Almost there. Please add ${problems.length > 1 ? `${problems.slice(0, -1).join(", ")} and ${problems.at(-1)}` : problems[0]}.`;
    alert.hidden = false;
    alert.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    return;
  }

  const spot = currentSpot();
  const priced = lotPricing(spot);
  const now = new Date();
  const sale = {
    receiptNo: receiptNumber(now),
    createdAt: now.toISOString(),
    seller: {
      name: String(data.name).trim(),
      phone: String(data.phone || "").trim(),
      email,
      address: String(data.address || "").trim(),
      idType: chipValue("idType"),
      idNumber: String(data.idNumber || "").trim()
    },
    payment: chipValue("payment") || "Cash",
    items: priced.lines.map((line) => ({ ...describeItem(line.item), offer: line.offer })),
    total: priced.offer,
    signature: signatureImage(),
    private: {
      spot,
      spotSource: state.settings.manualSpot ? "manual" : state.live?.source || "",
      fine: priced.fine,
      marketValue: priced.marketValue,
      expectedReturn: priced.expectedReturn,
      spread: priced.spread,
      lines: priced.lines.map((line) => ({ ...line.item, fine: line.fine, marketValue: line.marketValue, payoutRate: line.payoutRate, recoveryRate: line.recoveryRate, expectedReturn: line.expectedReturn, spread: line.spread }))
    }
  };

  // Electronic signature record (UETA / E-SIGN): consent, time, device, and a tamper-evident fingerprint.
  sale.esign = { consent: true, signedAt: new Date().toISOString(), device: navigator.userAgent.slice(0, 200) };
  try {
    sale.esign.fingerprint = await agreementFingerprint(sale);
  } catch {
    sale.esign.fingerprint = "";
  }

  const history = store.get(KEYS.history, []);
  history.unshift(sale);
  let saved = store.set(KEYS.history, history.slice(0, HISTORY_LIMIT));
  // If storage is full, keep the record and drop signatures from the oldest receipts.
  for (let i = history.length - 1; !saved && i > 0; i -= 1) {
    history[i].signature = "";
    saved = store.set(KEYS.history, history.slice(0, HISTORY_LIMIT));
  }

  state.lot = { items: [] };
  state.held = null;
  saveLot();
  resetAgreement();
  openDone(sale, { fresh: true, saved });
}

// ---------- done / receipt ----------
let pdfCache = { id: null, blob: null };

function openDone(sale, { fresh = false, saved = true } = {}) {
  state.currentSale = sale;
  pdfCache = { id: null, blob: null };
  $("[data-receipt]").innerHTML = renderReceiptHtml(sale);
  $("#done-title").textContent = fresh ? "Sale complete." : `Receipt ${sale.receiptNo}`;
  $("[data-done-sub]").textContent = fresh
    ? (saved ? `${formatMoney(sale.total)} paid to ${sale.seller.name}. Receipt saved.` : "Receipt created. This tablet's storage is full, so export your receipts soon.")
    : `${sale.seller.name} · ${formatMoney(sale.total)}`;
  const status = $("[data-done-status]");
  status.textContent = "";
  status.dataset.state = "";
  const svg = $(".done-check");
  svg.replaceWith(svg.cloneNode(true));
  $(".done-check").style.display = fresh ? "" : "none";
  renderReviewCard(sale);
  closePanels();
  show("done");
}

// ---------- review card ----------
let qrModule = null;
async function qrSvg(text) {
  qrModule = qrModule || import("/desk/vendor/qrcode.js");
  const { default: qrcode } = await qrModule;
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const quiet = 3;
  let path = "";
  for (let r = 0; r < count; r += 1) {
    for (let c = 0; c < count; c += 1) {
      if (qr.isDark(r, c)) path += `M${c + quiet} ${r + quiet}h1v1h-1z`;
    }
  }
  const size = count + quiet * 2;
  return `<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${size}" height="${size}" class="qr-bg"/><path d="${path}" class="qr-fg"/></svg>`;
}

async function renderReviewCard(sale) {
  const link = state.reviewUrl;
  const box = $("[data-review-qr]");
  const card = $("[data-review-card]");
  card.dataset.reviewUrl = link;
  const sms = reviewTextLink(sale?.seller?.phone, link, String(sale?.seller?.name || "").split(/\s+/)[0]);
  const text = $("[data-review-text]");
  text.hidden = !sms;
  text.href = sms || "#";
  if (box.dataset.for === link && box.innerHTML) return;
  box.dataset.for = link;
  try {
    box.innerHTML = await qrSvg(link);
    box.hidden = false;
  } catch {
    box.innerHTML = "";
    box.hidden = true;
  }
}



async function receiptPdf() {
  const sale = state.currentSale;
  if (pdfCache.id === sale.receiptNo && pdfCache.blob) return pdfCache.blob;
  if (!window.jspdf?.jsPDF) throw new Error("PDF engine is still loading");
  const logo = await logoPng().catch(() => null);
  const doc = buildReceiptPdf(sale, { jsPDF: window.jspdf.jsPDF, logo });
  const blob = doc.output("blob");
  pdfCache = { id: sale.receiptNo, blob };
  return blob;
}

function setDoneStatus(message, kind = "") {
  const status = $("[data-done-status]");
  status.textContent = message;
  status.dataset.state = kind;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function shareReceipt() {
  const sale = state.currentSale;
  try {
    setDoneStatus("Preparing the PDF…");
    const blob = await receiptPdf();
    const file = new File([blob], `AG-Refining-Receipt-${sale.receiptNo}.pdf`, { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `AG Refining receipt ${sale.receiptNo}` });
      setDoneStatus("Shared.", "ok");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement("a"), { href: url, download: file.name });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    setDoneStatus("PDF saved.", "ok");
  } catch (error) {
    if (error?.name === "AbortError") return setDoneStatus("");
    setDoneStatus("The PDF could not be made. Use Print instead.", "error");
  }
}

async function emailReceipt() {
  const sale = state.currentSale;
  let to = sale.seller.email;
  if (!to) {
    to = (window.prompt("Client's email address for the receipt:") || "").trim();
    if (!to) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return setDoneStatus("That email address looks incomplete.", "error");
  }
  if (state.emailConfigured === null) {
    state.emailConfigured = await fetch("/api/receipt").then((r) => r.json()).then((d) => Boolean(d.email)).catch(() => false);
  }
  if (!state.emailConfigured) {
    setDoneStatus("Email sending is not set up yet. Opening Share instead.", "error");
    return shareReceipt();
  }
  try {
    setDoneStatus(`Sending to ${to}…`);
    const pdfBase64 = await blobToBase64(await receiptPdf());
    const response = await fetch("/api/receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code: session.get("agdesk:code") || "", to, name: sale.seller.name, receiptNo: sale.receiptNo, total: formatMoney(sale.total), pdfBase64 })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "The receipt email could not be sent.");
    setDoneStatus(`Receipt emailed to ${to}.`, "ok");
    toast("Receipt sent");
  } catch (error) {
    setDoneStatus(`${error.message} Use Share or Print instead.`, "error");
  }
}

function newClient() {
  state.currentSale = null;
  renderDesk();
  show("desk");
}

// ---------- panels ----------
function openPanel(name) {
  closePanels();
  if (name === "settings") renderSettings();
  if (name === "history") renderHistory();
  $(`[data-panel='${name}']`).hidden = false;
}

function closePanels() {
  $$("[data-panel]").forEach((p) => { p.hidden = true; });
}

function renderSettings() {
  const s = state.settings;
  $("[data-rates]").innerHTML = MATERIALS.map((m) => `
    <div class="rate">
      <b>${m.name}</b>
      <div class="stepper" data-rate="payout" data-id="${m.id}"><label>Offer</label><button type="button" data-step="-1" aria-label="Lower ${m.name} offer">−</button><output>${Math.round(s.payout[m.id] * 100)}%</output><button type="button" data-step="1" aria-label="Raise ${m.name} offer">+</button></div>
      <div class="stepper" data-rate="recovery" data-id="${m.id}"><label>Return</label><button type="button" data-step="-1" aria-label="Lower ${m.name} return">−</button><output>${Math.round(s.recovery[m.id] * 100)}%</output><button type="button" data-step="1" aria-label="Raise ${m.name} return">+</button></div>
    </div>`).join("");
  $("[data-manual-spot]").value = s.manualSpot || "";
  $("[data-manual-spot]").placeholder = state.live?.price ? `Live: ${formatMoney(state.live.price)}` : "Enter price";
  $$("[data-rounding] button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === s.rounding)));
}

function renderHistory() {
  const history = store.get(KEYS.history, []);
  const today = new Date().toDateString();
  const todays = history.filter((sale) => new Date(sale.createdAt).toDateString() === today);
  const sum = (list, pick) => list.reduce((t, sale) => t + (pick(sale) || 0), 0);
  $("[data-history-summary]").innerHTML = `
    <div><span>Today</span><strong>${todays.length}</strong></div>
    <div><span>Paid today</span><strong>${formatMoney(sum(todays, (s) => s.total), { cents: false })}</strong></div>
    <div><span>Spread today</span><strong>${formatMoney(sum(todays, (s) => s.private?.spread), { cents: false })}</strong></div>`;
  $("[data-history]").innerHTML = history.length
    ? history.map((sale, index) => {
      const when = new Date(sale.createdAt);
      return `<li><button type="button" data-receipt-index="${index}"><b>${escapeText(sale.seller?.name || "Seller")}</b><em>${formatMoney(sale.total)}</em><small>${sale.receiptNo} · ${when.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</small></button></li>`;
    }).join("")
    : `<li class="empty-note">Completed sales will appear here.</li>`;
}

function escapeText(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function exportCsv() {
  const history = store.get(KEYS.history, []);
  if (!history.length) return toast("No receipts yet");
  const header = ["Receipt", "Date", "Time", "Seller", "Phone", "Email", "Address", "ID type", "ID number", "Payment", "Items", "Paid", "Silver spot", "Fine oz", "Market value", "Refinery return", "Spread", "Signed at", "Signing device", "Record fingerprint"];
  const rows = history.map((sale) => {
    const when = new Date(sale.createdAt);
    const p = sale.private || {};
    return [
      sale.receiptNo, when.toLocaleDateString("en-US"), when.toLocaleTimeString("en-US"),
      sale.seller?.name, sale.seller?.phone, sale.seller?.email, sale.seller?.address, sale.seller?.idType, sale.seller?.idNumber,
      sale.payment, sale.items.map((i) => `${i.title} (${i.detail})`).join("; "),
      sale.total.toFixed(2), p.spot?.toFixed?.(3) ?? "", p.fine?.toFixed?.(4) ?? "", p.marketValue?.toFixed?.(2) ?? "", p.expectedReturn?.toFixed?.(2) ?? "", p.spread?.toFixed?.(2) ?? "",
      sale.esign?.signedAt || "", sale.esign?.device || "", sale.esign?.fingerprint || ""
    ].map(csvCell).join(",");
  });
  const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
  const name = `AG-Refining-Receipts-${new Date().toISOString().slice(0, 10)}.csv`;
  const file = new File([blob], name, { type: "text/csv" });
  if (navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file], title: "AG Refining receipts" }).catch(() => {});
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

// ---------- wiring ----------
function bind() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, [data-sheet-backdrop]");
    if (!target) return;
    const action = target.dataset.action;
    if (target.matches("[data-sheet-backdrop]")) return closeSheet();
    if (target.dataset.material) return openSheet(target.dataset.material);
    if (target.dataset.edit) return openSheet(state.lot.items[Number(target.dataset.edit)].material, Number(target.dataset.edit));
    if (target.dataset.open) return openPanel(target.dataset.open);
    if (target.dataset.receiptIndex) return openDone(store.get(KEYS.history, [])[Number(target.dataset.receiptIndex)]);
    if (target.dataset.coin && state.draft) { state.draft.coin = target.dataset.coin; return renderDraft(); }
    if (target.dataset.purity && state.draft) { state.draft.purity = Number(target.dataset.purity); return renderDraft(); }
    if (target.dataset.unit && state.draft) { state.draft.unit = target.dataset.unit; return renderDraft(); }
    if (target.closest("[data-coin-mode]") && state.draft) {
      state.draft.byFace = target.dataset.value === "face";
      state.draft.amount = "";
      return renderDraft();
    }
    if (target.closest("[data-chip-group]")) {
      $$(".chip", target.closest("[data-chip-group]")).forEach((chip) => chip.setAttribute("aria-pressed", String(chip === target)));
      return;
    }
    if (target.closest("[data-rounding]")) {
      state.settings.rounding = target.dataset.value;
      saveSettings();
      renderSettings();
      return renderLot();
    }
    const stepper = target.closest(".stepper");
    if (stepper && target.dataset.step) {
      const table = state.settings[stepper.dataset.rate];
      const next = Math.round(table[stepper.dataset.id] * 100) + Number(target.dataset.step);
      table[stepper.dataset.id] = Math.min(100, Math.max(0, next)) / 100;
      saveSettings();
      $("output", stepper).textContent = `${Math.round(table[stepper.dataset.id] * 100)}%`;
      return renderLot();
    }
    switch (action) {
      case "close-sheet": return closeSheet();
      case "save-item": return saveDraft();
      case "remove-item": return removeDraft();
      case "present": return present();
      case "scroll-lot": return $(".lot").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      case "clear":
        if (window.confirm("Start over and clear this offer?")) {
          state.lot = { items: [] };
          saveLot();
          renderDesk();
        }
        return;
      case "back-to-desk": return releaseHold();
      case "accept": return openAgreement();
      case "back-to-present": return show("present");
      case "clear-signature": return clearSignature();
      case "email-receipt": return emailReceipt();
      case "share-receipt": return shareReceipt();
      case "print-receipt": return window.print();
      case "new-client": return newClient();
      case "close-panel":
        closePanels();
        return renderDesk();
      case "lock":
        session.remove("agdesk:code");
        return startLock("unlock");
      case "change-pin":
        closePanels();
        return startLock("create");
      case "reset-rates":
        state.settings.payout = { ...DEFAULT_SETTINGS.payout };
        state.settings.recovery = { ...DEFAULT_SETTINGS.recovery };
        saveSettings();
        renderSettings();
        renderLot();
        return toast("Default rates restored");
      case "export-csv": return exportCsv();
      case "identify": return $("[data-identify-input]").click();
      default:
    }
  });

  $("[data-manual-spot]").addEventListener("input", (event) => {
    const value = Number(event.target.value);
    state.settings.manualSpot = value > 0 ? value : null;
    saveSettings();
    renderLiveChip();
    renderLot();
  });
  $("[data-identify-input]").addEventListener("change", (event) => identifyPhoto(event.target.files?.[0]));
  $("[data-agree-form]").addEventListener("submit", completeSale);
  $("[data-agree-form]").addEventListener("input", (event) => {
    event.target.removeAttribute?.("aria-invalid");
    if (event.target.name === "affirm" && event.target.checked) $(".affirm").classList.remove("invalid");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!$("[data-sheet]").hidden) closeSheet();
      else closePanels();
    }
    if (state.draft && /^[0-9.]$/.test(event.key)) draftKey(event.key);
    if (state.draft && event.key === "Backspace") draftKey("del");
    if (state.draft && event.key === "Enter") saveDraft();
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshSpot(); });
}

function init() {
  buildPinPad();
  buildAmountPad();
  bindPrivateHold();
  setupSignature();
  bind();
  renderLiveChip();
  refreshSpot();
  setInterval(() => { if (!document.hidden) refreshSpot(); }, SPOT_REFRESH_MS);
  setInterval(renderLiveChip, 5000);
  const code = session.get("agdesk:code");
  if (code && store.get(KEYS.pin, null)) unlock(code);
  else startLock();
}

init();
