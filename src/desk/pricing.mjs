// AG Refining Buy Desk pricing engine.
// Pure functions only: every number the desk shows is derived here so it can be tested.

export const TROY_OZ_PER = Object.freeze({
  g: 1 / 31.1034768,
  dwt: 0.05,
  ozt: 1,
  oz: 28.349523125 / 31.1034768,
  lb: 453.59237 / 31.1034768,
  kg: 1000 / 31.1034768
});

export const UNIT_LABELS = Object.freeze({
  g: "grams",
  dwt: "pennyweight",
  ozt: "troy oz",
  oz: "ounces",
  lb: "pounds",
  kg: "kilograms"
});

// Fine silver per piece for U.S. coinage (troy ounces of pure silver).
export const COINS = Object.freeze([
  { id: "dime90", label: "Dime (1964 and earlier)", short: "90% dimes", fine: 0.07234, face: 0.1 },
  { id: "quarter90", label: "Quarter (1964 and earlier)", short: "90% quarters", fine: 0.18084, face: 0.25 },
  { id: "half90", label: "Half dollar (1964 and earlier)", short: "90% halves", fine: 0.36169, face: 0.5 },
  { id: "half40", label: "Kennedy half (1965–1970)", short: "40% halves", fine: 0.14792, face: 0.5 },
  { id: "dollar90", label: "Morgan or Peace dollar", short: "Silver dollars", fine: 0.77344, face: 1 },
  { id: "nickel35", label: "War nickel (1942–1945)", short: "War nickels", fine: 0.05626, face: 0.05 },
  { id: "eagle", label: "Silver Eagle or 1 oz round", short: "1 oz rounds", fine: 1, face: 0 }
]);

// Material catalog. `purity` is the fraction of the weight that is fine silver.
// `payout` is the default share of market value offered to the seller.
// `recovery` is the default share of market value the refinery returns to AG Refining.
// Estimated-purity materials (film, batteries, plate, dental) are flagged so the
// desk can remind the owner that the figure is an estimate, never shown to the client.
export const MATERIALS = Object.freeze([
  {
    id: "sterling", name: "Sterling silver", note: "Flatware, hollowware, jewelry marked 925",
    image: "/assets/material-sterling-flatware-800.webp", mode: "weight", unit: "g",
    purities: [[0.925, "Sterling .925"], [0.958, "Britannia .958"], [0.95, "Mexican .950"], [0.9, "Coin .900"], [0.835, ".835"], [0.8, "European .800"]],
    purity: 0.925, payout: 0.8, recovery: 0.95
  },
  {
    id: "coins", name: "Silver coins", note: "Pre-1965 U.S. coins, dollars, Eagles",
    image: "/assets/material-coins-800.webp", mode: "coins",
    purity: 0.9, payout: 0.9, recovery: 0.98
  },
  {
    id: "bullion", name: "Bars and rounds", note: "Fine silver .999 bullion",
    image: "/assets/material-silver-bars-800.webp", mode: "weight", unit: "ozt",
    purities: [[0.999, "Fine .999"], [0.9999, "Fine .9999"]],
    purity: 0.999, payout: 0.92, recovery: 0.99
  },
  {
    id: "scrap", name: "Scrap and jewelry", note: "Mixed sterling scrap, broken pieces",
    image: "/assets/material-scrap-silver-800.webp", mode: "weight", unit: "g",
    purities: [[0.925, "Sterling .925"], [0.9, ".900"], [0.8, ".800"], [0.6, "Mixed (est.)"]],
    purity: 0.925, payout: 0.75, recovery: 0.93
  },
  {
    id: "industrial", name: "Industrial silver", note: "Flake, grain, contacts, anodes",
    image: "/assets/material-industrial-silver-800.webp", mode: "weight", unit: "g",
    purities: [[0.999, "Fine .999"], [0.99, ".990"], [0.9, "Contacts .900"], [0.85, "Ag-CdO .850"]],
    purity: 0.99, payout: 0.8, recovery: 0.95
  },
  {
    id: "solder", name: "Silver solder", note: "Brazing alloy wire, rod, strip",
    image: "/assets/material-silver-solder-1280.webp", mode: "weight", unit: "g",
    purities: [[0.56, "56%"], [0.45, "45%"], [0.5, "50%"], [0.35, "35%"], [0.15, "15%"], [0.06, "6%"]],
    purity: 0.45, payout: 0.7, recovery: 0.9
  },
  {
    id: "lab", name: "Laboratory silver", note: "Silver nitrate, chloride, sludge",
    image: "/assets/material-laboratory-silver-1280.webp", mode: "weight", unit: "g",
    purities: [[0.635, "Silver nitrate"], [0.753, "Silver chloride"], [0.5, "Sludge (est.)"]],
    purity: 0.635, payout: 0.65, recovery: 0.88, estimate: true
  },
  {
    id: "dental", name: "Dental scrap", note: "Amalgam and alloy, estimated",
    image: "/assets/material-dental-800.webp", mode: "weight", unit: "dwt",
    purities: [[0.3, "Amalgam (est.)"], [0.35, "High-silver alloy (est.)"], [0.2, "Mixed (est.)"]],
    purity: 0.3, payout: 0.6, recovery: 0.85, estimate: true
  },
  {
    id: "batteries", name: "Watch batteries", note: "Silver-oxide button cells",
    image: "/assets/material-watch-batteries-real-1280.webp", mode: "weight", unit: "lb",
    purities: [[0.3, "Silver-oxide (est.)"], [0.2, "Mixed cells (est.)"]],
    purity: 0.3, payout: 0.55, recovery: 0.85, estimate: true
  },
  {
    id: "xray", name: "X-ray film", note: "Medical and industrial film",
    image: "/assets/material-xray-film-800.webp", mode: "weight", unit: "lb",
    purities: [[0.01, "Medical film (est.)"], [0.02, "Industrial NDT (est.)"], [0.006, "Newer thin film (est.)"]],
    purity: 0.01, payout: 0.5, recovery: 0.8, estimate: true
  },
  {
    id: "plated", name: "Silver-plated", note: "EPNS plate and plated ware",
    image: "/assets/material-silver-plated-1280.webp", mode: "weight", unit: "lb",
    purities: [[0.015, "Plated ware (est.)"], [0.03, "Heavy plate (est.)"]],
    purity: 0.015, payout: 0.45, recovery: 0.75, estimate: true
  }
]);

export const DEFAULT_SETTINGS = Object.freeze({
  payout: Object.freeze(Object.fromEntries(MATERIALS.map((m) => [m.id, m.payout]))),
  recovery: Object.freeze(Object.fromEntries(MATERIALS.map((m) => [m.id, m.recovery]))),
  rounding: "cents" // "cents" | "dollar"
});

export function materialById(id) {
  return MATERIALS.find((m) => m.id === id) || null;
}

export function coinById(id) {
  return COINS.find((c) => c.id === id) || null;
}

function finite(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function toTroyOunces(amount, unit) {
  const factor = TROY_OZ_PER[unit];
  if (!factor) throw new RangeError(`Unknown unit: ${unit}`);
  return finite(amount) * factor;
}

// Fine troy ounces of pure silver in one line item.
export function fineOunces(item) {
  if (item.mode === "coins") {
    const coin = coinById(item.coin);
    if (!coin) return 0;
    if (item.byFace && coin.face > 0) return (finite(item.amount) / coin.face) * coin.fine;
    return finite(item.amount) * coin.fine;
  }
  const purity = Math.min(1, finite(item.purity));
  return toTroyOunces(item.amount, item.unit) * purity;
}

function share(table, materialId, fallback) {
  const value = Number(table?.[materialId]);
  return Number.isFinite(value) && value >= 0 && value <= 1.5 ? value : fallback;
}

// Price one line. `spot` is USD per troy ounce of fine silver.
export function priceItem(item, spot, settings = DEFAULT_SETTINGS) {
  const material = materialById(item.material);
  if (!material) throw new RangeError(`Unknown material: ${item.material}`);
  const fine = fineOunces(item);
  const marketValue = fine * finite(spot);
  const payoutRate = item.payoutOverride != null
    ? share({ x: item.payoutOverride }, "x", material.payout)
    : share(settings.payout, material.id, material.payout);
  const recoveryRate = share(settings.recovery, material.id, material.recovery);
  let offer = marketValue * payoutRate;
  offer = settings.rounding === "dollar" ? Math.floor(offer) : roundCents(offer);
  const expectedReturn = roundCents(marketValue * recoveryRate);
  return {
    fine,
    marketValue: roundCents(marketValue),
    payoutRate,
    recoveryRate,
    offer,
    expectedReturn,
    spread: roundCents(expectedReturn - offer)
  };
}

export function priceLot(items, spot, settings = DEFAULT_SETTINGS) {
  const lines = items.map((item) => ({ item, ...priceItem(item, spot, settings) }));
  const sum = (key) => roundCents(lines.reduce((total, line) => total + line[key], 0));
  const offer = sum("offer");
  const expectedReturn = sum("expectedReturn");
  const spread = roundCents(expectedReturn - offer);
  return {
    lines,
    fine: lines.reduce((total, line) => total + line.fine, 0),
    marketValue: sum("marketValue"),
    offer,
    expectedReturn,
    spread,
    spreadPct: offer > 0 ? spread / expectedReturn : 0
  };
}

// The description a client sees for a line: what it is and how much, never the rate.
export function describeItem(item) {
  const material = materialById(item.material);
  if (item.mode === "coins") {
    const coin = coinById(item.coin);
    const qty = finite(item.amount);
    if (item.byFace) return { title: coin?.label || "Silver coins", detail: `${formatMoney(qty)} face value` };
    return { title: coin?.label || "Silver coins", detail: `${formatNumber(qty, 0)} ${qty === 1 ? "piece" : "pieces"}` };
  }
  const purityLabel = material?.purities?.find(([p]) => p === item.purity)?.[1]?.replace(/\s*\(est\.\)/, "") || "";
  return {
    title: item.label || material?.name || "Silver",
    detail: [`${formatNumber(finite(item.amount), item.unit === "lb" || item.unit === "kg" || item.unit === "ozt" ? 2 : 1)} ${UNIT_LABELS[item.unit] || item.unit}`, purityLabel].filter(Boolean).join(" · ")
  };
}

export function formatMoney(value, { cents = true } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0
  }).format(Number(value) || 0);
}

export function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(Number(value) || 0);
}

// Receipt numbers: AG-YYMMDD-XXXX, unambiguous characters only.
export function receiptNumber(date = new Date(), random = Math.random) {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const stamp = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  let tail = "";
  for (let i = 0; i < 4; i += 1) tail += alphabet[Math.floor(random() * alphabet.length)];
  return `AG-${stamp}-${tail}`;
}

export function maskId(value) {
  const clean = String(value || "").replace(/\s+/g, "");
  if (clean.length <= 4) return clean;
  return `${"•".repeat(Math.min(6, clean.length - 4))}${clean.slice(-4)}`;
}
