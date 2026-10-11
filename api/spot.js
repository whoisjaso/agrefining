// Live silver spot price for the Buy Desk, with ordered failover across public feeds.
// Responds with { price, bid, ask, source, updatedAt, fetchedAt } in USD per troy ounce.

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

export default async function handler(req, res) {
  res.setHeader("X-Robots-Tag", "noindex");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Use GET." });
  }
  try {
    const spot = await fetchSpot();
    // Shared 20s edge cache keeps every tablet on the same number without hammering the feeds.
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=20, stale-while-revalidate=40");
    return res.status(200).json(spot);
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ message: "Live silver price is unavailable.", details: error.details || [] });
  }
}
