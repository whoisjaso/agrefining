// Live silver spot price for the Buy Desk and the public price page, with ordered
// failover across public feeds. Responds with { price, bid, ask, source, updatedAt,
// fetchedAt } in USD per troy ounce.
// `?range=30d` instead returns about a month of daily closes from COMEX silver
// futures: { range, source, points: [{ date, close }], fetchedAt }.

const TIMEOUT_MS = 4500;
const MIN_PLAUSIBLE = 5;
const MAX_PLAUSIBLE = 500;

function plausible(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > MIN_PLAUSIBLE && n < MAX_PLAUSIBLE ? n : null;
}

async function getJson(url, fetchImpl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (AG Refining Buy Desk)" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export const SOURCES = [
  {
    name: "gold-api",
    url: "https://api.gold-api.com/price/XAG",
    parse(data) {
      const price = plausible(data?.price);
      return price ? { price, updatedAt: data.updatedAt || null } : null;
    }
  },
  {
    name: "swissquote",
    url: "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAG/USD",
    parse(data) {
      const quote = Array.isArray(data) ? data[0] : null;
      const prices = quote?.spreadProfilePrices?.[0];
      const bid = plausible(prices?.bid);
      const ask = plausible(prices?.ask);
      if (!bid || !ask) return null;
      return { price: (bid + ask) / 2, bid, ask, updatedAt: quote.ts ? new Date(quote.ts).toISOString() : null };
    }
  },
  {
    name: "comex",
    url: "https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1m&range=1d",
    parse(data) {
      const meta = data?.chart?.result?.[0]?.meta;
      const price = plausible(meta?.regularMarketPrice);
      return price ? { price, updatedAt: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null } : null;
    }
  }
];

export async function fetchSpot(fetchImpl = fetch, sources = SOURCES) {
  const errors = [];
  for (const source of sources) {
    try {
      const parsed = source.parse(await getJson(source.url, fetchImpl));
      if (parsed) {
        return {
          price: Math.round(parsed.price * 1000) / 1000,
          bid: parsed.bid ?? null,
          ask: parsed.ask ?? null,
          source: source.name,
          updatedAt: parsed.updatedAt,
          fetchedAt: new Date().toISOString()
        };
      }
      errors.push(`${source.name}: unparseable`);
    } catch (error) {
      errors.push(`${source.name}: ${error.message || "failed"}`);
    }
  }
  const failure = new Error("All silver price sources failed");
  failure.details = errors;
  throw failure;
}

export const HISTORY_URL = "https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1d&range=1mo";

// Daily closes, oldest first, one point per calendar day (UTC), implausible values dropped.
export function parseHistory(data) {
  const result = data?.chart?.result?.[0];
  const stamps = Array.isArray(result?.timestamp) ? result.timestamp : [];
  const closes = result?.indicators?.quote?.[0]?.close;
  if (!Array.isArray(closes)) return [];
  const byDate = new Map();
  stamps.forEach((stamp, index) => {
    const close = plausible(closes[index]);
    if (!close || !Number.isFinite(stamp)) return;
    byDate.set(new Date(stamp * 1000).toISOString().slice(0, 10), Math.round(close * 1000) / 1000);
  });
  return [...byDate].sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, close]) => ({ date, close }));
}

export async function fetchHistory(fetchImpl = fetch) {
  const points = parseHistory(await getJson(HISTORY_URL, fetchImpl));
  if (points.length < 2) throw new Error("Silver price history is unavailable");
  return { range: "30d", source: "comex", points, fetchedAt: new Date().toISOString() };
}

function requestedRange(req) {
  if (req.query && typeof req.query.range === "string") return req.query.range;
  try {
    return new URL(req.url || "/", "http://localhost").searchParams.get("range") || "";
  } catch {
    return "";
  }
}

export default async function handler(req, res, { fetchImpl = fetch } = {}) {
  res.setHeader("X-Robots-Tag", "noindex");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Use GET." });
  }
  const range = requestedRange(req);
  if (range) {
    if (range !== "30d") return res.status(400).json({ message: "Supported range: 30d." });
    try {
      const history = await fetchHistory(fetchImpl);
      // Daily closes change once a day; an hour of shared edge cache is plenty.
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=7200");
      return res.status(200).json(history);
    } catch {
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ message: "Silver price history is unavailable." });
    }
  }
  try {
    const spot = await fetchSpot(fetchImpl);
    // Shared 20s edge cache keeps every tablet on the same number without hammering the feeds.
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=20, stale-while-revalidate=40");
    return res.status(200).json(spot);
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ message: "Live silver price is unavailable.", details: error.details || [] });
  }
}
