// Owner dashboard numbers: pure functions over sale records, so they can be tested in Node.

const DAY_MS = 86_400_000;

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Weeks start on Monday, the way a counter business counts them.
export function startOfWeek(date) {
  const d = startOfDay(date);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}

export function startOfMonth(date) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const paid = (record) => Number(record.total) || 0;
const spread = (record) => Number(record.private?.spread) || 0;
const sum = (list, pick) => list.reduce((total, record) => total + pick(record), 0);

export function summarize(records, now = new Date(), days = 14) {
  const at = (record) => new Date(record.createdAt).getTime();
  const today = startOfDay(now).getTime();
  const week = startOfWeek(now).getTime();
  const month = startOfMonth(now).getTime();
  const since = (start) => records.filter((record) => at(record) >= start && at(record) <= now.getTime() + DAY_MS);
  const todays = since(today);
  const weeks = since(week);
  const months = since(month);

  const byDay = new Map();
  for (const record of records) {
    const key = dayKey(record.createdAt);
    byDay.set(key, (byDay.get(key) || 0) + paid(record));
  }
  const series = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = startOfDay(now);
    date.setDate(date.getDate() - i);
    series.push({ date, key: dayKey(date), paid: byDay.get(dayKey(date)) || 0 });
  }

  return {
    todayPaid: sum(todays, paid),
    todayCount: todays.length,
    weekPaid: sum(weeks, paid),
    weekCount: weeks.length,
    monthPaid: sum(months, paid),
    monthCount: months.length,
    monthSpread: sum(months, spread),
    totalCount: records.length,
    series
  };
}

// Records page filter: free text over name and receipt number, plus an inclusive date range
// given as yyyy-mm-dd strings (local days).
export function filterRecords(records, { query = "", from = "", to = "" } = {}) {
  const words = String(query).trim().toLowerCase().split(/\s+/).filter(Boolean);
  return records.filter((record) => {
    const key = dayKey(record.createdAt);
    if (from && key < from) return false;
    if (to && key > to) return false;
    if (!words.length) return true;
    const haystack = `${record.seller?.name || ""} ${record.receiptNo || ""}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

export function rangeFor(name, now = new Date()) {
  const today = dayKey(now);
  if (name === "today") return { from: today, to: today };
  if (name === "week") return { from: dayKey(startOfWeek(now)), to: today };
  if (name === "month") return { from: dayKey(startOfMonth(now)), to: today };
  return { from: "", to: "" };
}

export function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// A calm bar chart as inline SVG markup. Colors come from CSS classes on the page.
export function barChartSvg(series, { width = 720, height = 260, formatMoney = (n) => `$${Math.round(n)}` } = {}) {
  const top = 34;
  const bottom = 40;
  const left = 8;
  const right = 8;
  const plotH = height - top - bottom;
  const max = Math.max(...series.map((d) => d.paid), 0);
  const slot = (width - left - right) / Math.max(series.length, 1);
  const barW = Math.max(6, Math.min(36, slot * 0.58));
  const last = series.length - 1;
  const bars = series.map((d, i) => {
    const h = max > 0 ? Math.max(d.paid > 0 ? 4 : 0, (d.paid / max) * plotH) : 0;
    const x = left + slot * i + (slot - barW) / 2;
    const y = top + plotH - h;
    const label = d.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const cls = i === last ? "bar bar-today" : "bar";
    const day = d.date.getDate();
    const showDay = i === last || i % 2 === last % 2;
    return `<g><title>${label}: ${formatMoney(d.paid)}</title>`
      + (h > 0 ? `<rect class="${cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="3"/>` : `<rect class="bar-empty" x="${x.toFixed(1)}" y="${(top + plotH - 2).toFixed(1)}" width="${barW.toFixed(1)}" height="2" rx="1"/>`)
      + (showDay ? `<text class="axis${i === last ? " axis-today" : ""}" x="${(x + barW / 2).toFixed(1)}" y="${height - 12}" text-anchor="middle">${i === last ? "Today" : day}</text>` : "")
      + `</g>`;
  }).join("");
  const peak = max > 0 ? `<line class="grid" x1="${left}" x2="${width - right}" y1="${top}" y2="${top}"/><text class="grid-label" x="${left}" y="${top - 10}">${formatMoney(max)}</text>` : "";
  const base = `<line class="baseline" x1="${left}" x2="${width - right}" y1="${top + plotH}" y2="${top + plotH}"/>`;
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Amount paid each day for the last ${series.length} days">${peak}${base}${bars}</svg>`;
}
