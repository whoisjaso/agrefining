// Houston silver price page: live spot from /api/spot (refreshed every 60 seconds)
// and a 30-day line chart drawn as inline SVG. Without JavaScript, or when the
// feeds are down, the page keeps its "Call for today's price" fallback.
const REFRESH_MS = 60_000;
const page = typeof document === "undefined" ? null : document;
const panel = page?.querySelector("[data-spot-panel]");
const priceEl = page?.querySelector("[data-spot-price]");
const unitEl = page?.querySelector("[data-spot-unit]");
const updatedEl = page?.querySelector("[data-spot-updated]");
const plot = page?.querySelector("[data-chart-plot]");
const summary = page?.querySelector("[data-chart-summary]");

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
let updatedAt = 0;

export function ago(ms) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  return `${Math.round(hours / 24)} days ago`;
}

function renderAge() {
  if (!updatedAt || !updatedEl) return;
  updatedEl.textContent = `Updated ${ago(Date.now() - updatedAt)}. Refreshes every minute.`;
}

async function refreshSpot() {
  try {
    const response = await fetch("/api/spot", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("spot");
    const data = await response.json();
    const price = Number(data.price);
    if (!(Number.isFinite(price) && price > 0)) throw new Error("spot");
    const stamp = Date.parse(data.updatedAt || data.fetchedAt || "");
    updatedAt = Number.isFinite(stamp) ? Math.min(stamp, Date.now()) : Date.now();
    priceEl.textContent = money.format(price);
    unitEl.hidden = false;
    panel.dataset.state = "live";
    renderAge();
  } catch {
    // Keep the last good price if there is one; otherwise the call-for-price fallback stays.
    if (panel.dataset.state !== "live") {
      panel.dataset.state = "unavailable";
      updatedEl.textContent = "Live pricing is not available right now. Call (281) 898-2719 for today's price.";
    }
  }
}

// Pure so it can be tested: returns SVG markup for a list of { date, close } points.
export function chartSvg(points, { width = 640, height = 280 } = {}) {
  const pad = { top: 18, right: 16, bottom: 34, left: 64 };
  const closes = points.map((p) => p.close);
  const low = Math.min(...closes);
  const high = Math.max(...closes);
  const span = high - low || high * 0.01 || 1;
  const yMin = low - span * 0.12;
  const yMax = high + span * 0.12;
  const x = (i) => pad.left + (i / Math.max(1, points.length - 1)) * (width - pad.left - pad.right);
  const y = (v) => pad.top + (1 - (v - yMin) / (yMax - yMin)) * (height - pad.top - pad.bottom);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.close).toFixed(1)}`).join(" ");
  const ticks = [low, (low + high) / 2, high];
  const grid = ticks.map((v) => `<line class="chart-grid" x1="${pad.left}" x2="${width - pad.right}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="chart-axis" x="${pad.left - 10}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${money.format(v)}</text>`).join("");
  const first = points[0];
  const last = points[points.length - 1];
  const label = (p) => shortDate.format(new Date(`${p.date}T12:00:00Z`));
  const lastX = x(points.length - 1);
  const lastY = y(last.close);
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Silver daily closes from ${label(first)} to ${label(last)}: low ${money.format(low)}, high ${money.format(high)}, latest ${money.format(last.close)}.">
    ${grid}
    <path class="chart-line" d="${line}"/>
    <circle class="chart-dot" cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4"/>
    <text class="chart-axis" x="${pad.left}" y="${height - 10}" text-anchor="start">${label(first)}</text>
    <text class="chart-axis" x="${width - pad.right}" y="${height - 10}" text-anchor="end">${label(last)}</text>
  </svg>`;
}

async function loadChart() {
  if (!plot) return;
  try {
    const response = await fetch("/api/spot?range=30d", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("history");
    const data = await response.json();
    const points = (Array.isArray(data.points) ? data.points : [])
      .filter((p) => typeof p?.date === "string" && Number.isFinite(Number(p.close)) && Number(p.close) > 0)
      .map((p) => ({ date: p.date, close: Number(p.close) }));
    if (points.length < 2) throw new Error("history");
    plot.innerHTML = chartSvg(points);
    plot.dataset.state = "ready";
    const closes = points.map((p) => p.close);
    summary.textContent = `Daily closing prices, COMEX silver futures, U.S. dollars per troy ounce. Range ${money.format(Math.min(...closes))} to ${money.format(Math.max(...closes))}.`;
  } catch {
    plot.dataset.state = "unavailable";
    plot.innerHTML = `<p class="price-chart-fallback">The 30-day chart is not available right now. Call <a href="tel:+12818982719">(281) 898-2719</a> for today's price.</p>`;
  }
}

if (panel && priceEl) {
  refreshSpot();
  loadChart();
  setInterval(() => { if (!document.hidden) refreshSpot(); }, REFRESH_MS);
  setInterval(renderAge, 5000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshSpot(); });
}
