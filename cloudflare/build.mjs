// Builds the Cloudflare Worker for agrefining from dist/ (run `npm run build` first):
//   node cloudflare/build.mjs
// Writes cloudflare/manifest.generated.mjs, .cf-deploy/worker.js (bundled), and MCP `execute`
// scripts in .cf-deploy/: kvN.js (upload site files to KV, one at a time) then deploy.js (upload the Worker).
// With wrangler logged in instead: `npx wrangler deploy` (wrangler.toml) after uploading KV the same way.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, rmSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { execFileSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist"), out = join(root, ".cf-deploy");
const KV_ID = "095a661afd81401fa3b655b3b4663538";
const NAME = "agrefining";
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4", ".webm": "video/webm", ".pdf": "application/pdf", ".glb": "model/gltf-binary", ".bin": "application/octet-stream" };

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(dist).map((p) => {
  const raw = readFileSync(p);
  const ext = extname(p).toLowerCase();
  if (!TYPES[ext]) console.warn("unknown type", p);
  return { path: "/" + relative(dist, p).split("\\").join("/"), k: createHash("sha256").update(raw).digest("hex").slice(0, 32), t: TYPES[ext] || "application/octet-stream", b64: raw.toString("base64"), size: raw.length };
});
const manifest = Object.fromEntries(files.map((f) => [f.path, { k: f.k, t: f.t }]));
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
const redirects = Object.fromEntries((vercel.redirects || []).map((r) => {
  if (/[:(*]/.test(r.source)) throw new Error("pattern redirect not supported: " + r.source);
  return [r.source, [r.destination, r.statusCode || (r.permanent === false ? 307 : 308)]];
}));
writeFileSync(join(root, "cloudflare/manifest.generated.mjs"), "export const MANIFEST = " + JSON.stringify(manifest) + ";\nexport const REDIRECTS = " + JSON.stringify(redirects) + ";\n");
// `--manifest-only` stops here (used by cloudflare/parity-test.mjs); nothing is uploaded either way.
if (process.argv.includes("--manifest-only")) {
  console.log(JSON.stringify({ manifestOnly: true, files: files.length, redirects: Object.keys(redirects).length }));
  process.exit(0);
}

rmSync(out, { recursive: true, force: true }); mkdirSync(out);
execFileSync("npx", ["-y", "esbuild", "cloudflare/worker.mjs", "--bundle", "--format=esm", "--platform=neutral", "--external:node:*", "--main-fields=module,main", `--outfile=${join(out, "worker.js")}`], { cwd: root, stdio: "inherit" });

// unique blobs, grouped <= 2.8 MB base64 per MCP call (the MCP caps a request at 4 MB)
const uniq = [...new Map(files.map((f) => [f.k, f])).values()];
const groups = []; let cur = [], n = 0;
for (const f of uniq) { if (cur.length && n + f.b64.length > 2_800_000) { groups.push(cur); cur = []; n = 0; } cur.push(f); n += f.b64.length; }
if (cur.length) groups.push(cur);
groups.forEach((g, i) => writeFileSync(join(out, `kv${i}.js`),
  `async () => { const body=${JSON.stringify(g.map((f) => ({ key: f.k, value: f.b64, base64: true })))}; const r=await cloudflare.request({method:"PUT",path:"/accounts/"+accountId+"/storage/kv/namespaces/${KV_ID}/bulk",body}); return {group:${i},of:${groups.length},files:body.length,success:r.success,result:r.result}; }`));

const script = readFileSync(join(out, "worker.js"), "utf8");
const metadata = { main_module: "worker.js", compatibility_date: "2026-05-01", compatibility_flags: ["nodejs_compat"], bindings: [{ type: "kv_namespace", name: "SITE", namespace_id: KV_ID }], keep_bindings: ["secret_text"] };
writeFileSync(join(out, "deploy.js"), `async () => {
const script = ${JSON.stringify(script)};
const metadata = ${JSON.stringify(metadata)};
const form = new FormData();
form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
form.append("worker.js", new Blob([script], { type: "application/javascript+module" }), "worker.js");
const up = await cloudflare.request({ method: "PUT", path: "/accounts/" + accountId + "/workers/scripts/${NAME}", body: form });
const sub = await cloudflare.request({ method: "POST", path: "/accounts/" + accountId + "/workers/scripts/${NAME}/subdomain", body: { enabled: true, previews_enabled: false } });
return { uploaded: up.success, etag: up.result && up.result.etag, workersDev: sub.success, size: script.length };
}`);
console.log(JSON.stringify({ files: files.length, uniqueBlobs: uniq.length, bytes: files.reduce((a, f) => a + f.size, 0), kvCalls: groups.length, workerBytes: script.length }));
