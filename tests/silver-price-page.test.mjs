import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ago, chartSvg } from "../src/silver-price.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const page = readFileSync(join(dist, "silver-price-houston", "index.html"), "utf8");
const main = page.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
const visibleText = main.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("the price page uses the shared shell, one h1, and the expected search fields", () => {
  assert.match(page, /<title>Silver Price Today in Houston \| Live Spot Price \| AG Refining<\/title>/);
  assert.match(page, /<link rel="canonical" href="https:\/\/www\.agrefining\.com\/silver-price-houston">/);
  assert.match(page, /<body data-design="silver-atelier"/);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  assert.equal((page.match(/class="site-header"/g) || []).length, 1);
  assert.equal((page.match(/class="footer"/g) || []).length, 1);
  assert.match(page, /<script type="module" src="\/silver-price\.js\?v=[\w-]+"><\/script>/);
  assert.match(main, /<nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="\/">Home<\/a><\/li><li>Silver price today<\/li><\/ol><\/nav>/);
});

test("structured data declares a WebPage and a BreadcrumbList for the route", () => {
  const graph = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
  const webPage = graph.find((node) => node["@type"] === "WebPage");
  assert.equal(webPage.url, "https://www.agrefining.com/silver-price-houston");
  const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList");
  assert.deepEqual(crumbs.itemListElement.map((item) => item.name), ["Home", "Silver price today"]);
  assert.ok(graph.some((node) => node["@type"] === "FAQPage"));
});

test("without JavaScript the page shows a call-for-price fallback and no broken values", () => {
  assert.match(main, /<span data-spot-price><a href="tel:\+12818982719">Call for today's price<\/a><\/span>/);
  assert.match(main, /<small data-spot-unit hidden>per troy ounce<\/small>/);
  assert.match(main, /class="price-chart-fallback">The 30-day chart loads in your browser\./);
  assert.doesNotMatch(page, /\b(?:undefined|NaN|null)\b/);
});

test("the plain-language note and the pickup action are present", () => {
  assert.match(visibleText, /The spot price is the market price for pure silver\. Offers depend on the material, purity, and quantity, and are confirmed after weighing\./);
  assert.match(main, /<a class="button button-primary" href="\/contact\?intent=pickup">Schedule a Free Pickup/);
  assert.match(main, /<a class="phone-link" href="tel:\+12818982719">Call \(281\) 898-2719<\/a>/);
});

test("the silver content table lists fine silver weight only, never dollar values or offer math", () => {
  const table = main.match(/<table class="content-table">([\s\S]*?)<\/table>/)[1];
  const rows = [...table.matchAll(/<tr><th scope="row">([^<]+)<\/th><td>([^<]+)<\/td><td>([^<]+)<\/td><\/tr>/g)].map((m) => [m[1], m[3]]);
  assert.deepEqual(rows, [
    ["Sterling silver, 100 grams", "2.9739 troy oz"],
    ["Dime, 1964 and earlier", "0.0723 troy oz"],
    ["Quarter, 1964 and earlier", "0.1808 troy oz"],
    ["Half dollar, 1964 and earlier", "0.3617 troy oz"],
    ["Morgan or Peace dollar", "0.7734 troy oz"],
    ["Kennedy half dollar, 1965 to 1970", "0.1479 troy oz"],
    ["War nickel, 1942 to 1945", "0.0563 troy oz"],
    ["American Silver Eagle, 1 oz", "1.0000 troy oz"],
    ["$1 face value of 90% dimes, quarters, or halves", "0.7234 troy oz"]
  ]);
  // The only dollar sign on the page is the "$1 face value" coin description.
  assert.deepEqual(visibleText.match(/\$[\d.,]+/g), ["$1"]);
  assert.doesNotMatch(visibleText, /\bmelt\b|\bper cent\b|of spot|we pay|payout|\d+\s*%\s*of\b/i);
});

test("the page is linked from the footer, the homepage, the site index, the sitemap, and llms.txt", () => {
  const home = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(home, /<p class="location-note">[^<]*<a href="\/silver-price-houston">See today's silver price<\/a>\.<\/p>/);
  assert.match(page.match(/<footer class="footer"[\s\S]*?<\/footer>/)[0], /<a href="\/silver-price-houston">Silver Price Today<\/a>/);
  assert.match(readFileSync(join(dist, "sitemap", "index.html"), "utf8"), /<li><a href="\/silver-price-houston">Silver Price Today<\/a><\/li>/);
  assert.match(readFileSync(join(dist, "sitemap.xml"), "utf8"), /<url><loc>https:\/\/www\.agrefining\.com\/silver-price-houston<\/loc><lastmod>[\d-]+<\/lastmod><changefreq>daily<\/changefreq>/);
  assert.match(readFileSync(join(dist, "llms.txt"), "utf8"), /- \[Houston silver price today\]\(https:\/\/www\.agrefining\.com\/silver-price-houston\): /);
});

test("the chart is a clean inline SVG line drawn from daily closes", () => {
  const svg = chartSvg([
    { date: "2026-09-14", close: 58.1 },
    { date: "2026-09-15", close: 59.4 },
    { date: "2026-09-16", close: 60.25 }
  ]);
  assert.match(svg, /^<svg class="chart-svg" viewBox="0 0 640 280" role="img" aria-label="Silver daily closes from Sep 14 to Sep 16: low \$58\.10, high \$60\.25, latest \$60\.25\.">/);
  assert.equal((svg.match(/<path class="chart-line" d="M[\d. L]+"\/>/g) || []).length, 1);
  assert.doesNotMatch(svg, /gradient|NaN|undefined|filter/);
  const flat = chartSvg([{ date: "2026-09-14", close: 60 }, { date: "2026-09-15", close: 60 }]);
  assert.doesNotMatch(flat, /NaN|Infinity/);
});

test("updated-ago copy reads naturally", () => {
  assert.equal(ago(3000), "just now");
  assert.equal(ago(42_000), "42 seconds ago");
  assert.equal(ago(60_000), "1 minute ago");
  assert.equal(ago(15 * 60_000), "15 minutes ago");
  assert.equal(ago(3 * 3_600_000), "3 hours ago");
  assert.equal(ago(3 * 86_400_000), "3 days ago");
});
