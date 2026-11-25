// Cloudflare parity check (local only, nothing is deployed and no DNS is touched).
// Runs cloudflare/worker.mjs in Node against dist/ with an in-memory KV and compares it with vercel.json:
//   npm run build && node cloudflare/build.mjs --manifest-only && node cloudflare/parity-test.mjs
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
const { MANIFEST } = await import("./manifest.generated.mjs");
const worker = (await import("./worker.mjs")).default;

const blobs = new Map();
for (const [path, entry] of Object.entries(MANIFEST)) blobs.set(entry.k, readFileSync(join(dist, path)));
for (const [path, entry] of Object.entries(MANIFEST)) {
  const hash = createHash("sha256").update(blobs.get(entry.k)).digest("hex").slice(0, 32);
  assert.equal(hash, entry.k, `manifest is stale for ${path}; rerun node cloudflare/build.mjs --manifest-only`);
}
const env = { SITE: { get: async (key) => { const b = blobs.get(key); return b ? b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) : null; } } };
const ctx = { waitUntil() {} };
globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };
const call = (url, init) => worker.fetch(new Request(url, { redirect: "manual", ...init }), env, ctx);

const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
const failures = [];
const check = (label, fn) => fn().catch((error) => failures.push(`${label}: ${error.message}`));
const site = "https://www.agrefining.com";

// 1. Every vercel.json redirect, with Vercel's status codes (permanent 308, temporary 307).
for (const r of vercel.redirects) {
  await check(`redirect ${r.source}`, async () => {
    const res = await call(site + r.source);
    assert.equal(res.status, r.statusCode || (r.permanent === false ? 307 : 308));
    assert.equal(res.headers.get("location"), r.destination);
  });
}

// 2. Every sitemap page returns 200 HTML with the global security headers.
const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const global = vercel.headers.find((h) => h.source === "/(.*)").headers;
for (const loc of pages) {
  await check(`page ${loc}`, async () => {
    const res = await call(loc);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /text\/html/);
    for (const { key, value } of global) assert.equal(res.headers.get(key), value, key);
  });
}

// 3. Host and URL shape rules Vercel applies (apex -> www, cleanUrls, no trailing slash, 404 page).
await check("apex redirect", async () => {
  const res = await call("https://agrefining.com/contact?x=1");
  assert.equal(res.status, 308);
  assert.equal(res.headers.get("location"), "https://www.agrefining.com/contact?x=1");
});
await check("trailing slash", async () => assert.equal((await call(`${site}/contact/`)).status, 308));
await check("cleanUrls .html", async () => assert.equal((await call(`${site}/contact.html`)).headers.get("location"), "/contact"));
await check("404", async () => assert.equal((await call(`${site}/no-such-page`)).status, 404));

// 4. Path-specific headers from vercel.json.
await check("sitemap cache header", async () => {
  const want = vercel.headers.find((h) => h.source.startsWith("/(sitemap")).headers.find((h) => h.key === "Cache-Control").value;
  assert.equal((await call(`${site}/sitemap.xml`)).headers.get("cache-control"), want);
});
await check("desk noindex", async () => {
  const res = await call(`${site}/desk`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
});

// 5. Video range requests (iOS Safari needs 206 for the hero film).
await check("video range", async () => {
  const res = await call(`${site}/videos/ag-refining-molten-pour.mp4`, { headers: { Range: "bytes=0-1023" } });
  assert.equal(res.status, 206);
  assert.equal((await res.arrayBuffer()).byteLength, 1024);
});

// 6. API routes answer through the adapter (no email is sent: GET only).
await check("api leads health", async () => {
  const res = await call(`${site}/api/leads?status=health`);
  assert.equal(res.status, 200);
  assert.equal(typeof (await res.json()).delivery, "boolean");
});

// 7. /review exists only when the build had GOOGLE_REVIEW_URL (the printed counter card points here).
const reviewBuilt = existsSync(join(dist, "review.html"));
await check("review page", async () => {
  const res = await call(`${site}/review`);
  assert.equal(res.status, reviewBuilt ? 200 : 404);
});

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`CLOUDFLARE_PARITY_OK (${vercel.redirects.length} redirects, ${pages.length} pages, review page ${reviewBuilt ? "built" : "NOT built: set GOOGLE_REVIEW_URL before the Cloudflare build"})`);
