import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "dist");
const failures = [];
const serviceAreaEmblemPath = join(root, "assets", "service-area-emblems.svg");
const serviceAreaEmblems = existsSync(serviceAreaEmblemPath) ? readFileSync(serviceAreaEmblemPath, "utf8") : "";

if (!serviceAreaEmblems) failures.push("Missing assets/service-area-emblems.svg");
if ((serviceAreaEmblems.match(/<symbol\b/g) || []).length !== 7) failures.push("Service-area emblem sheet must contain seven symbols");
if ((serviceAreaEmblems.match(/viewBox="0 0 160 160"/g) || []).length !== 7) failures.push("Service-area symbols must share the normalized viewBox");
if (/<text\b|<image\b|data:image\/|\bfilter\s*=|<filter\b|<feTurbulence\b/i.test(serviceAreaEmblems)) {
  failures.push("Service-area emblem sheet must remain text-free geometric SVG");
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function localTarget(url) {
  const path = url.split(/[?#]/)[0];
  if (path === "/") return join(out, "index.html");
  if (path === "/api/leads") return join(root, "api", "leads.js");
  const target = join(out, path.replace(/^\//, ""));
  if (existsSync(target) && statSync(target).isFile()) return target;
  return join(target, "index.html");
}

function outerSection(source, className) {
  const opening = new RegExp(`<section\\b[^>]*\\bclass=(?:"[^"]*\\b${className}\\b[^"]*"|'[^']*\\b${className}\\b[^']*')[^>]*>`, "i").exec(source);
  if (!opening || opening.index === undefined) return null;

  const sections = /<\/?section\b[^>]*>/gi;
  sections.lastIndex = opening.index;
  let depth = 0;
  let tag;
  while ((tag = sections.exec(source))) {
    if (tag[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) {
        return {
          html: source.slice(opening.index, sections.lastIndex),
          start: opening.index,
          end: sections.lastIndex
        };
      }
    } else {
      depth += 1;
    }
  }
  return null;
}

function anchorsIn(source) {
  return [...source.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attributes, content]) => ({
    classes: (attributes.match(/\bclass=(["'])(.*?)\1/)?.[2] || "").split(/\s+/),
    href: attributes.match(/\bhref=(["'])(.*?)\1/)?.[2],
    text: content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
  }));
}

// The Buy Desk is a private counter app, not a public page; it has its own tests.
const htmlFiles = walk(out).filter((path) => path.endsWith(".html") && !relative(out, path).startsWith("desk"));
for (const path of htmlFiles) {
  const source = readFileSync(path, "utf8");
  const displayPath = relative(out, path);
  const titles = source.match(/<title>[^<]*<\/title>/g) || [];
  const descriptions = source.match(/<meta name="description" content="[^"]*">/g) || [];
  const h1s = source.match(/<h1(?:\s[^>]*)?>/g) || [];
  if (titles.length !== 1) failures.push(`${displayPath}: expected one title`);
  if (descriptions.length !== 1) failures.push(`${displayPath}: expected one meta description`);
  if (h1s.length !== 1) failures.push(`${displayPath}: expected one h1`);
  if (/\b(?:undefined|NaN)\b/.test(source)) failures.push(`${displayPath}: contains unresolved output`);
  if (!source.includes('data-design="silver-atelier"')) failures.push(`${displayPath}: missing Silver Atelier document marker`);
  // The home film is black, the sell portal sits on its dark backdrop, everything else is cream.
  const expectedThemeColor = displayPath === "index.html" ? "#000000" : /class="portal-page"/.test(source) ? "#060d1c" : "#f1ede4";
  if (!source.includes(`<meta name="theme-color" content="${expectedThemeColor}">`)) failures.push(`${displayPath}: missing expected browser chrome ${expectedThemeColor}`);
  // The standalone sell portal carries no site chrome at all.
  const portal = /class="portal-page"/.test(source);
  if (portal) {
    if (/class="site-header"|class="footer"|mobile-actions|data-nav-toggle/.test(source)) failures.push(`${displayPath}: the portal must not carry the site header, menu, footer or pill`);
  } else {
    if ((source.match(/class="site-header"/g) || []).length !== 1) failures.push(`${displayPath}: expected one shared header`);
    if ((source.match(/class="footer"/g) || []).length !== 1) failures.push(`${displayPath}: expected one shared footer`);
  }

  const ids = [...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) failures.push(`${displayPath}: duplicate id ${duplicateIds[0]}`);

  const urls = [...source.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const url of urls) {
    if (!url.startsWith("/") || url.startsWith("//")) continue;
    const target = localTarget(url);
    if (!existsSync(target)) failures.push(`${displayPath}: missing local target ${url}`);
  }
}

const home = readFileSync(join(out, "index.html"), "utf8");
const exactHomeChecks = [
  "<title>AG Refining | Houston Silver Buyer Near Hobby Airport</title>",
  '<meta name="description" content="Sell silver in Houston with AG Refining. Free pickup, on-site weighing, honest pricing, and payment terms confirmed with the offer.">',
  '<h1 class="visually-hidden">Houston Silver Buyer, Valued Precisely.</h1>'
];
for (const expected of exactHomeChecks) {
  if (!home.includes(expected)) failures.push(`Homepage is missing: ${expected}`);
}

const heroSection = outerSection(home, "atelier-hero");
if (!heroSection) failures.push("Homepage is missing the complete outer atelier hero");
else {
  const hero = heroSection.html;
  const posters = hero.match(/<picture class="cinematic-hero-poster"[\s\S]*?<\/picture>/g) || [];
  if (posters.length !== 1) failures.push("Homepage hero must contain exactly one permanent cinematic poster");
  else {
    const [poster] = posters;
    if (!poster.includes('src="/images/ag-refining-process-01-pile-poster.webp"') || !poster.includes('width="1920" height="1080"')) {
      failures.push("Homepage hero must use the eager, dimensioned process-01 pile poster");
    }
    if (!poster.includes('<source media="(max-width: 767px), (orientation: portrait)" srcset="/images/ag-refining-process-01-pile-poster-mobile.webp"')) {
      failures.push("Homepage hero must serve the portrait 540x960 poster on phones and portrait viewports");
    }
    if (!poster.includes('fetchpriority="high"') || poster.includes('loading="lazy"')) {
      failures.push("Homepage hero picture must remain eager first-paint media");
    }
  }
  const stacks = hero.match(/<div class="cinematic-hero-video-stack"[\s\S]*?<\/div>/g) || [];
  if (stacks.length !== 1) failures.push("Homepage hero must contain one cinematic video stack");
  else {
    const videos = stacks[0].match(/<video class="cinematic-hero-video"[\s\S]*?<\/video>/g) || [];
    if (videos.length !== 2) failures.push("Homepage hero must contain exactly two inert cinematic video layers");
    for (const video of videos) {
      if (!/\bautoplay\b/.test(video) || !/\bmuted\b/.test(video) || !/\bplaysinline\b/.test(video) || !video.includes('aria-hidden="true"') || !video.includes('tabindex="-1"') || /\b(?:controls|loop)\b/.test(video)) {
        failures.push("Homepage hero videos must remain inert decorative layers");
        break;
      }
      const sources = video.match(/<source\b[^>]*>/g) || [];
      if (sources.length !== 2 || !sources[0].includes('data-video-format="webm"') || !sources[1].includes('data-video-format="mp4"') || sources.some((source) => /\bsrc=/.test(source))) {
        failures.push("Homepage hero videos must defer WebM then MP4 sources from server HTML");
        break;
      }
    }
  }
  if ((hero.match(/class="cinematic-hero-overlay"/g) || []).length !== 1) failures.push("Homepage hero must contain one stable cinematic overlay");
  if (/\/assets\/ag-refining-hero-v2-[^"']+\.webp/.test(hero)) failures.push("Homepage hero still references retired V2 artwork");
  if (/class="hero-kicker"/.test(hero)) failures.push("Homepage hero must not restore the retired kicker line");
  const heroAnchors = anchorsIn(hero);
  const primaryAction = heroAnchors.find((anchor) => anchor.href === "/sell?intent=pickup");
  if (!primaryAction) failures.push("Homepage hero must provide a primary pickup anchor that opens the sell portal (/sell?intent=pickup)");
  else {
    if (!primaryAction.classes.includes("button") || !primaryAction.classes.includes("button-primary")) {
      failures.push("Homepage hero pickup anchor must use button button-primary classes");
    }
    if (primaryAction.text !== "Get Paid For Your Silver") failures.push("Homepage hero pickup anchor must use the exact V2 label");
  }
  if (heroAnchors.length !== 1) failures.push("Homepage hero must carry exactly one action");
  const requiredProof = ["Houston-Based", "Free Qualifying Pickup", "On-Site Weighing", "Confirmed Payment Terms"];
  const trustLedger = home.match(/<div class="trust-ledger">[\s\S]*?<\/div>\s*<\/div>/)?.[0] || "";
  for (const proof of requiredProof) {
    if (!trustLedger.includes(proof)) failures.push(`Homepage trust band below the hero is missing ${proof}`);
  }
}
if (!home.includes("/assets/v2/hero-home-1600.webp")) failures.push("Homepage must retain the lower industrial proof image");
if (!home.includes('class="intake-panel"')) failures.push("Homepage is missing the separate material intake panel");
const closingHero = heroSection?.end ?? -1;
const intakeStart = home.indexOf('<form class="intake-panel"');
if (closingHero >= 0 && intakeStart <= closingHero) failures.push("Homepage intake form must begin after the closing hero section");
if (!/<label for="hero-material">(?:(?!<\/label>)[\s\S])*<select id="hero-material"(?:(?!<\/label>)[\s\S])*<\/select>\s*<\/label>/.test(home)) {
  failures.push("Homepage material intake control must be nested inside its label");
}
if (/id="hero-quantity"/.test(home)) failures.push("Homepage intake asks one question only: the amount is asked in the step flow");
if (home.includes('class="hero-review-card"')) failures.push("Homepage still contains the floating glass intake card");
if (/data-assay-stage|assay-canvas-host|assay-fallback/.test(home)) {
  failures.push("Homepage still contains retired assay-stage markup");
}
const siteSource = readFileSync(join(root, "src", "site.js"), "utf8");
if (/import\(\s*["']\/assay-scene\.js(?:[?"'])/.test(siteSource) || /querySelector\(\s*["']\[data-assay-stage\]["']\s*\)/.test(siteSource)) {
  failures.push("Shared site script still boots the retired assay scene");
}
const homepageJourney = [
  "atelier-hero",
  "intake-panel",
  "trust-ledger",
  "material-editorial",
  "assay-process",
  "facility-feature",
  "industry-index",
  "service-area-section",
  "provenance-story",
  "location-section",
  "faq-section",
  "conversion-band"
];
let previousHomeSection = -1;
for (const className of homepageJourney) {
  const position = home.indexOf(className);
  if (position < 0) failures.push(`Homepage is missing ${className}`);
  else if (position < previousHomeSection) failures.push(`Homepage places ${className} outside the approved journey`);
  previousHomeSection = Math.max(previousHomeSection, position);
}
if ((home.match(/class="material-row"/g) || []).length !== 6) {
  failures.push("Homepage must render all six featured materials as editorial rows");
}
if (home.includes("material-shortcuts")) failures.push("Homepage still contains the duplicate material shortcut rail");
if (/featured-material-copy"><span>\d{2}<\/span>/.test(home)) failures.push("Homepage material rows still use decorative numbering");

const seoPages = [
  {
    path: "industrial-x-ray-silver-recycling",
    title: "Industrial NDT Film Silver Recycling in Houston | AG Refining",
    description: "Recycle qualifying industrial NDT film in Houston with AG Refining. Get clear guidance, free qualifying pickup, and on-site weighing.",
    h1: "Recover Silver From Industrial NDT Film."
  },
  {
    path: "sell-silver-coins-houston",
    title: "Sell Silver Coins in Houston | Clear Evaluations | AG Refining",
    description: "Sell silver coins in Houston with clear evaluations based on coin type, silver content, weight, condition, and current market values.",
    h1: "Sell Your Silver Coins In Houston."
  },
  {
    path: "silver-flake-buyer-houston",
    title: "Silver Flake Buyer in Houston, TX | AG Refining",
    description: "Sell silver flake in Houston with an evaluation based on confirmed silver content, purity, weight, condition, and current market values.",
    h1: "Sell Silver Flake In Houston."
  },
  {
    path: "laboratory-silver-buyer-houston",
    title: "Laboratory Silver Buyer in Houston, TX | AG Refining",
    description: "Sell laboratory silver in Houston with evaluations based on confirmed recoverable silver, material condition, and current market values.",
    h1: "Sell Laboratory Silver In Houston."
  },
  {
    path: "silver-solder-buyer-houston",
    title: "Silver Solder Buyer in Houston, TX | AG Refining",
    description: "Sell silver solder in Houston with evaluations based on alloy, silver content, weight, condition, and current market values.",
    h1: "Sell Silver Solder In Houston."
  },
  {
    path: "silver-plated-materials-buyer-houston",
    title: "Silver-Plated Materials Buyer in Houston, TX | AG Refining",
    description: "Sell silver-plated materials in Houston. AG Refining offers fair pricing, expert evaluations, and fast payment for silver-plated scrap.",
    h1: "Sell Silver-Plated Materials In Houston."
  },
  {
    path: "dental-scrap-buyer-houston",
    title: "Dental Scrap Buyer Houston | Sell Dental Scrap | AG Refining",
    description: "Sell dental scrap in Houston with material review, free qualifying pickup, on-site service, and pricing based on confirmed precious-metal content.",
    h1: "Sell Your Dental Scrap With Confidence."
  },
  {
    path: "silver-oxide-watch-battery-recycling-houston",
    title: "Silver Oxide Watch Battery Recycling Houston | AG Refining",
    description: "Recycle silver oxide watch batteries in Houston with material review, qualifying pickup, and recovery based on confirmed content and condition.",
    h1: "Recycle Silver Oxide Watch Batteries In Houston."
  },
  {
    path: "houston-silver-buyer",
    title: "Houston Silver Buyer | Sell Scrap Silver in Houston | AG Refining",
    description: "Houston silver buyer near Hobby Airport. Sell scrap silver, sterling, and silver coins with on-site weighing and free pickup for qualifying accounts.",
    h1: "Sell Your Silver With Confidence."
  },
  {
    path: "x-ray-recycling-services-houston",
    title: "X-Ray Recycling Services Houston | X-Ray Film Recycling | AG Refining",
    description: "Houston X-ray recycling services for qualifying medical and industrial film, with handling planning, silver recovery review, and professional service.",
    h1: "Secure X-Ray Film Recycling In Houston."
  },
  {
    path: "scrap-silver-buyer-houston",
    title: "Scrap Silver Buyer Houston | Sell Scrap Silver | AG Refining",
    description: "Sell scrap silver in Houston with AG Refining. Free qualifying pickup, on-site weighing, and offers based on confirmed material and current market values.",
    h1: "Turn Your Scrap Silver Into Cash."
  }
];

for (const page of seoPages) {
  const source = readFileSync(join(out, page.path, "index.html"), "utf8");
  const expected = [
    `<title>${page.title}</title>`,
    `<meta name="description" content="${page.description}">`,
    `<link rel="canonical" href="https://www.agrefining.com/${page.path}">`,
    `<h1>${page.h1}</h1>`
  ];
  for (const check of expected) {
    if (!source.includes(check)) failures.push(`${page.path}: missing exact SEO field ${check}`);
  }
}

const atelierFamilies = [
  ["scrap-silver-jewelry", ["page-hero", "assay-line", "conversion-band"]],
  ["sell-silver-coins-houston", ["page-hero", "assay-line", "conversion-band"]],
  ["silver-flake-buyer-houston", ["page-hero", "handling-inset", "conversion-band"]],
  ["x-ray-recycling-services-houston", ["page-hero", "pathway-list", "conversion-band"]],
  ["houston-silver-buyer", ["page-hero", "assay-line", "conversion-band"]],
  ["accepted-materials", ["page-hero", "editorial-index", "conversion-band"]],
  ["how-it-works", ["page-hero", "assay-process", "conversion-band"]],
  ["about", ["page-hero", "provenance-story", "conversion-band"]],
  ["contact", ["page-hero", "contact-card", "map-band"]],
  ["espanol", ["page-hero", "conversion-band"]],
  ["privacy", ["page-hero", "legal-grid"]]
];
for (const [route, classes] of atelierFamilies) {
  const source = readFileSync(join(out, route, "index.html"), "utf8");
  for (const className of classes) {
    if (!source.includes(className)) failures.push(`${route}: missing ${className}`);
  }
}

const generatedMarkup = htmlFiles.map((path) => readFileSync(path, "utf8")).join("\n");
if (/industrial x-ray/i.test(generatedMarkup)) {
  failures.push("Generated customer-facing output still uses industrial X-ray wording");
}
if ((generatedMarkup.match(/Industrial Non-Destructive Testing film/g) || []).length !== 1) {
  failures.push("Industrial NDT guidance must expand Non-Destructive Testing exactly once");
}

const acceptedMaterials = readFileSync(join(out, "accepted-materials", "index.html"), "utf8");
const acceptedCards = [...acceptedMaterials.matchAll(/<a class="([^"]*\btaxonomy-card\b[^"]*)" href="([^"]+)"/g)];
if (acceptedCards.length !== 17) failures.push(`Accepted materials must contain 17 taxonomy cards, found ${acceptedCards.length}`);
if (acceptedCards[0]?.[2] !== "/silver-oxide-watch-battery-recycling-houston" || !acceptedCards[0]?.[1].split(/\s+/).includes("taxonomy-card-featured")) {
  failures.push("Accepted materials must lead with a full-width Silver oxide card");
}
if (new Set(acceptedCards.map((match) => match[2])).size !== acceptedCards.length) {
  failures.push("Accepted materials contains a duplicate taxonomy destination");
}
if (!acceptedMaterials.includes("<h1>We Purchase.</h1>")) failures.push("Accepted materials must use the exact We purchase. heading");

const serviceAreas = readFileSync(join(out, "service-areas", "index.html"), "utf8");
const serviceAreaRoutes = [
  "/houston-silver-buyer",
  "/silver-buyer-pearland",
  "/silver-buyer-pasadena",
  "/silver-buyer-sugar-land",
  "/silver-buyer-katy",
  "/silver-buyer-the-woodlands",
  "/silver-buyer-conroe"
];
const cityArtifactRoutes = [...serviceAreas.matchAll(/<a class="[^"]*\bcity-artifact\b[^"]*" href="([^"]+)"/g)].map((match) => match[1]);
if (JSON.stringify(cityArtifactRoutes) !== JSON.stringify(serviceAreaRoutes)) failures.push("Service areas must keep the seven routed city artifacts in order");
const serviceCoverageLedger = serviceAreas.match(/<ul\b[^>]*data-service-coverage(?:="")?[^>]*>[\s\S]*?<\/ul>/)?.[0] || "";
const serviceCoverageAnchors = [...serviceCoverageLedger.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(([, href, text]) => ({ href, text: text.trim() }));
if (
  (serviceCoverageLedger.match(/<li\b/g) || []).length !== 23
  || serviceCoverageAnchors.length !== 23
  || !serviceCoverageAnchors.some(({ href, text }) => href === "/silver-buyer-sugar-land" && text === "Stafford")
) {
  failures.push("Service areas must keep the marked 23-city coverage ledger");
}
const emittedServiceEmblems = [...serviceAreas.matchAll(/<svg\b([^>]*)>[\s\S]*?<use\b[^>]*href="\/assets\/service-area-emblems\.svg#[^"]+"[^>]*>[\s\S]*?<\/svg>/g)];
if (emittedServiceEmblems.length !== 7 || emittedServiceEmblems.some(([, attributes]) => !attributes.includes('aria-hidden="true"') || !attributes.includes('focusable="false"'))) {
  failures.push("Service-area emblems must remain decorative and unfocusable");
}

if (/<input(?![^>]*\btype=)[^>]*>/.test(generatedMarkup)) {
  failures.push("Generated form markup contains an input without an explicit type");
}
const exactPaymentTimingClaims = [
  /\bimmediate payment\b/i,
  /\bsame-day(?: payment| service)?\b/i,
  /\bpay on the spot\b/i,
  /\bpago inmediato\b/i
];
if (exactPaymentTimingClaims.some((pattern) => pattern.test(generatedMarkup))) {
  failures.push("Generated pages contain an unqualified exact payment-timing claim");
}
const unsupportedValueClaims = [
  /\btop (?:prices?|value)\b/i,
  /\bcompetitive pric(?:e|es|ing)\b/i,
  /\brecover(?:ing)? (?:the )?full value\b/i,
  /\bno hidden fees\b/i
];
if (unsupportedValueClaims.some((pattern) => pattern.test(generatedMarkup))) {
  failures.push("Generated pages contain an unsupported price, fee, or full-value superlative");
}

const jewelryStore = readFileSync(join(out, "jewelry-store-silver-recycling-houston", "index.html"), "utf8");
if (/your inventory and volumes stay between us/i.test(jewelryStore)) {
  failures.push("Jewelry-store page contains an absolute confidentiality promise");
}
if (!/inventory and volume details[\s\S]{0,240}privacy notice/i.test(jewelryStore)) {
  failures.push("Jewelry-store page must qualify inventory handling against the privacy notice");
}

// The pickup form and its notice now live on the standalone sell portal.
const contactPage = readFileSync(join(out, "sell", "index.html"), "utf8");
const privacyPage = readFileSync(join(out, "privacy", "index.html"), "utf8");
const attributionDisclosureTerms = ["form page", "first landing page", "referring page", "campaign or ad identifiers"];
for (const term of attributionDisclosureTerms) {
  if (!contactPage.toLowerCase().includes(term) || !privacyPage.toLowerCase().includes(term)) {
    failures.push(`Contact and privacy notices must disclose the ${term}`);
  }
}
if (!/sent with your request/i.test(contactPage)) {
  failures.push("Contact notice must state that website attribution accompanies the request");
}

const hospital = readFileSync(join(out, "hospital-silver-recycling", "index.html"), "utf8");
const hospitalHeroStart = hospital.indexOf('<div class="service-hero-copy"');
const hospitalHeroEnd = hospital.indexOf('<figure class="service-visual"', hospitalHeroStart);
const hospitalHero = hospitalHeroStart >= 0 && hospitalHeroEnd > hospitalHeroStart
  ? hospital.slice(hospitalHeroStart, hospitalHeroEnd)
  : "";
const hospitalGuardrailPosition = hospitalHero.indexOf("Do not upload patient information");
const hospitalActionPosition = hospitalHero.indexOf('href="/sell?intent=pickup');
if (hospitalGuardrailPosition < 0 || hospitalActionPosition < 0 || hospitalGuardrailPosition > hospitalActionPosition) {
  failures.push("Hospital hero must show the protected-record guardrail before its pickup action");
}
if (!hospitalHero.includes('href="/medical-x-ray-recycling"')) {
  failures.push("Hospital hero must route medical film visitors to the protected-record guidance");
}
const decorativeNumberPatterns = [
  /<article data-reveal><span>\d{2}<\/span><h3>/,
  /<li><span>\d{2}<\/span>[^<]+<\/li>/,
  /<a href="[^"]+" data-reveal><span>\d{2}<\/span><h3>/,
  /<a href="[^"]+" data-reveal><span>\d{2} ·/,
  /class="taxonomy-card"[\s\S]{0,500}<p class="eyebrow">\d{2}<\/p>/
];
if (decorativeNumberPatterns.some((pattern) => pattern.test(generatedMarkup))) {
  failures.push("Non-sequential editorial content still uses decorative numbering");
}
if (/class="button [^"]*\b(?:button-blue|button-navy|button-dark|button-light|button-ghost|button-quiet|button-outline)\b/.test(generatedMarkup)) {
  failures.push("Generated pages still use legacy button variants");
}

const notFound = readFileSync(join(out, "404.html"), "utf8");
if (!notFound.includes('<meta name="robots" content="noindex,follow">')) {
  failures.push("404 page must be noindex");
}

if (!privacyPage.includes('<nav aria-label="Privacy sections">')) {
  failures.push("Privacy section navigation needs a unique accessible name");
}

const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
const sitemapEntries = (sitemap.match(/<url>/g) || []).length;
if (sitemapEntries !== 55) failures.push(`Expected 55 sitemap pages, found ${sitemapEntries}`);
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (new Set(sitemapLocations).size !== sitemapLocations.length) failures.push("Sitemap contains a duplicate URL");

// Every indexed page (including new guides and area pages) gets the same
// baseline SEO and accessibility checks, driven by the sitemap so new routes
// are covered without editing this list.
const seenTitles = new Map();
const seenDescriptions = new Map();
for (const location of sitemapLocations) {
  const route = new URL(location).pathname.replace(/^\/+/, "");
  const file = route ? join(out, route, "index.html") : join(out, "index.html");
  if (!existsSync(file)) {
    failures.push(`Sitemap page ${location} has no built HTML file`);
    continue;
  }
  const source = readFileSync(file, "utf8");
  const label = route || "home";
  const title = source.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  const description = source.match(/<meta name="description" content="([^"]+)">/)?.[1]?.trim();
  if (!title) failures.push(`${label}: missing <title>`);
  if (!description) failures.push(`${label}: missing meta description`);
  if (title) {
    if (seenTitles.has(title)) failures.push(`${label}: duplicate <title> shared with ${seenTitles.get(title)}`);
    seenTitles.set(title, label);
  }
  if (description) {
    if (seenDescriptions.has(description)) failures.push(`${label}: duplicate meta description shared with ${seenDescriptions.get(description)}`);
    seenDescriptions.set(description, label);
  }
  if (!source.includes(`<link rel="canonical" href="${location}">`)) failures.push(`${label}: canonical does not match its sitemap URL`);
  if (!/<html lang="(en|es)"/.test(source)) failures.push(`${label}: <html> is missing lang`);
  if ((source.match(/<h1[\s>]/g) || []).length !== 1) failures.push(`${label}: must have exactly one <h1>`);
  if (!/<main id="main"/.test(source)) failures.push(`${label}: missing <main id="main"> skip-link target`);
  if (!source.includes("(281) 898-2719")) failures.push(`${label}: missing the exact phone number`);
  for (const img of source.match(/<img\b[^>]*>/g) || []) {
    if (!/\salt="/.test(img)) failures.push(`${label}: <img> without alt: ${img.slice(0, 80)}`);
  }
  for (const block of source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(block[1]); } catch { failures.push(`${label}: JSON-LD does not parse`); }
  }
}

for (const page of seoPages) {
  if (!sitemap.includes(`<loc>https://www.agrefining.com/${page.path}</loc>`)) {
    failures.push(`Sitemap is missing ${page.path}`);
  }
}

const replacedPaths = [
  "silver-coin-buyers-houston",
  "dental-scrap",
  "silver-oxide-battery-recycling",
  "silver-scrap-buyer-houston"
];
for (const path of replacedPaths) {
  if (sitemap.includes(`<loc>https://www.agrefining.com/${path}</loc>`)) {
    failures.push(`Sitemap still includes replaced route ${path}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`AG_REFINING_VERIFY_OK (${htmlFiles.length} HTML files, ${sitemapEntries} indexed pages)`);
