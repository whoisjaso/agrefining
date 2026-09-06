// Submit every indexed URL to IndexNow (Bing, Yandex, Seznam, Naver, and
// partners share the feed). Google does not use IndexNow; submit the sitemap
// in Google Search Console instead. Run after a production deploy:
//
//   npm run build && npm run submit:indexnow
//
// The key file is published by scripts/build.mjs at /<key>.txt, which is how
// IndexNow proves the request came from the site owner.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sitemapPath = join(root, "dist", "sitemap.xml");
if (!existsSync(sitemapPath)) {
  console.error("dist/sitemap.xml is missing. Run npm run build first.");
  process.exit(1);
}

const sitemap = readFileSync(sitemapPath, "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const host = new URL(urlList[0]).host;
const keyMatch = readFileSync(join(root, "scripts", "build.mjs"), "utf8").match(/const indexNowKey = "([a-f0-9]{32})"/);
if (!keyMatch) {
  console.error("Could not read indexNowKey from scripts/build.mjs");
  process.exit(1);
}
const key = keyMatch[1];

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList })
});

if (response.status === 200 || response.status === 202) {
  console.log(`IndexNow accepted ${urlList.length} URLs for ${host} (HTTP ${response.status})`);
} else {
  console.error(`IndexNow rejected the submission: HTTP ${response.status} ${await response.text()}`);
  process.exit(1);
}
