// AG Refining on Cloudflare Workers (free plan).
// Static files live in the KV namespace bound as SITE (keys are content hashes, see build.mjs);
// MANIFEST maps every public path to its KV key and content type. The three Vercel functions in /api
// run unchanged through a small req/res adapter. Behavior mirrors vercel.json (cleanUrls, no trailing
// slash, redirects, headers) plus Vercel's apex -> www domain redirect.
import { MANIFEST } from "./manifest.generated.mjs";
import leads from "../api/leads.js";
import receipt from "../api/receipt.js";
import spot from "../api/spot.js";

const API = { "/api/leads": leads, "/api/receipt": receipt, "/api/spot": spot };

const REDIRECTS = {
  "/home": ["/", 308], "/about-us": ["/about", 308],
  "/silver-coin-buyers-houston": ["/sell-silver-coins-houston", 308],
  "/dental-scrap": ["/dental-scrap-buyer-houston", 308], "/dental-scrap-buyer": ["/dental-scrap-buyer-houston", 308],
  "/silver-oxide-battery-recycling": ["/silver-oxide-watch-battery-recycling-houston", 308],
  "/watch-battery-recycling": ["/silver-oxide-watch-battery-recycling-houston", 308],
  "/silver-oxide-watch-batteries": ["/silver-oxide-watch-battery-recycling-houston", 308],
  "/x-ray-recycling": ["/x-ray-recycling-services-houston", 308], "/x-ray-film-recycling": ["/x-ray-recycling-services-houston", 308],
  "/silver-scrap-buyer-houston": ["/scrap-silver-buyer-houston", 308], "/sell-scrap-silver": ["/scrap-silver-buyer-houston", 308],
  "/contact-us": ["/contact", 308], "/index": ["/sitemap", 308], "/site-map": ["/sitemap", 308], "/site-index": ["/sitemap", 308],
  "/faqs": ["/faq", 308], "/frequently-asked-questions": ["/faq", 308], "/app": ["/desk", 307]
};

function baseHeaders(path) {
  const h = new Headers({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  });
  if (/^\/(sitemap\.xml|robots\.txt|llms\.txt|llms-full\.txt)$/.test(path)) h.set("Cache-Control", "public, max-age=0, s-maxage=3600, must-revalidate");
  if (path.startsWith("/desk")) { h.set("X-Robots-Tag", "noindex, nofollow"); h.set("Cache-Control", "public, max-age=0, must-revalidate"); }
  return h;
}

function redirect(location, status, path) {
  const h = baseHeaders(path); h.set("Location", location);
  return new Response(null, { status, headers: h });
}

async function runApi(handler, request, url) {
  const headers = {};
  request.headers.forEach((v, k) => { headers[k] = v; });
  headers["x-forwarded-for"] = request.headers.get("cf-connecting-ip") || headers["x-forwarded-for"] || "";
  let body;
  if (!["GET", "HEAD"].includes(request.method)) {
    const raw = await request.text();
    const type = (headers["content-type"] || "").split(";")[0].trim().toLowerCase();
    body = raw;
    if (type === "application/json") { try { body = JSON.parse(raw); } catch { body = raw; } }
    else if (type === "application/x-www-form-urlencoded") body = Object.fromEntries(new URLSearchParams(raw));
  }
  const query = {};
  for (const [k, v] of url.searchParams) query[k] = k in query ? [].concat(query[k], v) : v;
  const req = { method: request.method, url: url.pathname + url.search, headers, query, body, socket: {} };
  const out = baseHeaders(url.pathname);
  let status = 200, payload = null;
  const res = {
    setHeader(k, v) { out.set(k, String(v)); return res; },
    getHeader(k) { return out.get(k); },
    status(code) { status = code; return res; },
    json(obj) { if (!out.has("Content-Type")) out.set("Content-Type", "application/json; charset=utf-8"); payload = JSON.stringify(obj); return res; },
    send(data) { payload = data; return res; },
    end(data) { if (data !== undefined) payload = data; return res; }
  };
  await handler(req, res);
  return new Response(request.method === "HEAD" ? null : payload, { status, headers: out });
}

async function readAsset(env, ctx, entry) {
  const cache = caches.default;
  const cacheKey = new Request("https://kv-asset.internal/" + entry.k);
  const hit = await cache.match(cacheKey);
  if (hit) return hit.arrayBuffer();
  const buf = await env.SITE.get(entry.k, "arrayBuffer");
  if (buf) ctx.waitUntil(cache.put(cacheKey, new Response(buf.slice(0), { headers: { "Cache-Control": "public, max-age=31536000, immutable" } })));
  return buf;
}

async function serveAsset(request, env, ctx, path, entry, status = 200) {
  const h = baseHeaders(path);
  h.set("Content-Type", entry.t);
  if (!h.has("Cache-Control")) h.set("Cache-Control", "public, max-age=0, must-revalidate");
  h.set("ETag", `"${entry.k}"`);
  h.set("Accept-Ranges", "bytes");
  if (status === 200 && request.headers.get("If-None-Match") === `"${entry.k}"`) return new Response(null, { status: 304, headers: h });
  const buf = await readAsset(env, ctx, entry);
  if (!buf) return new Response("Asset missing", { status: 500 });
  const range = status === 200 && request.headers.get("Range");
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (m && (m[1] || m[2])) {
    const size = buf.byteLength;
    let start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
    let end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
    if (start >= size || start > end) { h.set("Content-Range", `bytes */${size}`); return new Response(null, { status: 416, headers: h }); }
    h.set("Content-Range", `bytes ${start}-${end}/${size}`);
    return new Response(request.method === "HEAD" ? null : buf.slice(start, end + 1), { status: 206, headers: h });
  }
  return new Response(request.method === "HEAD" ? null : buf, { status, headers: h });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === "agrefining.com") { url.hostname = "www.agrefining.com"; return redirect(url.toString(), 308, url.pathname); }
    let path = url.pathname;
    try { path = decodeURIComponent(path); } catch {}

    const r = REDIRECTS[path];
    if (r) return redirect(r[0] + url.search, r[1], path);

    const api = API[path];
    if (api) return runApi(api, request, url);

    if (MANIFEST[path] && !path.endsWith(".html")) return serveAsset(request, env, ctx, path, MANIFEST[path]);
    // cleanUrls + trailingSlash:false, as on Vercel
    if (path.length > 1 && path.endsWith("/")) return redirect(path.replace(/\/+$/, "") + url.search, 308, path);
    if (path.endsWith("/index.html")) return redirect((path.slice(0, -11) || "/") + url.search, 308, path);
    if (path.endsWith(".html")) return redirect(path.slice(0, -5) + url.search, 308, path);
    const page = MANIFEST[(path === "/" ? "" : path) + "/index.html"] || MANIFEST[path + ".html"];
    if (page && ["GET", "HEAD"].includes(request.method)) return serveAsset(request, env, ctx, path, page);
    if (page) return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    return serveAsset(request, env, ctx, path, MANIFEST["/404.html"], 404);
  }
};
