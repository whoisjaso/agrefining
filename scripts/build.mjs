import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist");
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "assets"), { recursive: true });
cpSync(join(root, "assets"), join(out, "assets"), { recursive: true });
cpSync(join(root, "src", "style.css"), join(out, "style.css"));
cpSync(join(root, "src", "site.js"), join(out, "site.js"));

const phoneDisplay = "(281) 898-2719";
const phoneHref = "+12818982719";
const email = "Dorothy@agrefining.com";

const pages = [
  {
    path: "sell-scrap-silver",
    title: "Sell Scrap Silver | AG Refining",
    eyebrow: "Scrap silver",
    heading: "Every ounce deserves a careful evaluation.",
    intro: "From sterling flatware and jewelry to contacts, wire, solder, and production scrap, begin with a preliminary material review before shipping anything of value.",
    body: [
      ["Materials we can review", "Sterling silver, jewelry, flatware, coins, bullion, wire, tubing, solder, contacts, filings, and qualifying industrial silver-bearing material."],
      ["How value is approached", "The potential value depends on material type, quantity, condition, recoverable silver content, and current market conditions. Final value cannot be established from a generic web form alone."],
      ["Before you send material", "Contact AG Refining for eligibility and handling instructions. Do not send hazardous, contaminated, unidentified, or regulated material without written approval."]
    ]
  },
  {
    path: "dental-scrap",
    title: "Dental Scrap Review | AG Refining",
    eyebrow: "Dental material",
    heading: "A clearer path for accumulated dental scrap.",
    intro: "Practices and laboratories can request a preliminary review of qualifying crowns, bridges, inlays, and silver-bearing dental material.",
    body: [
      ["What to describe", "Tell us the approximate quantity, material form, source, and whether the lot contains amalgam, biological material, sharps, liquids, or any unknown contamination."],
      ["Mixed material requires review", "Dental alloys can contain different metals. AG Refining must review the material before making any statement about eligibility or payable content."],
      ["Safe handling first", "Do not place extracted teeth, sharps, liquids, patient records, or unidentified clinical material into an ordinary shipment."]
    ]
  },
  {
    path: "silver-oxide-watch-batteries",
    title: "Silver Oxide Watch Battery Recycling | AG Refining",
    eyebrow: "Silver oxide batteries",
    heading: "Turn sorted battery inventory into a reviewed recovery opportunity.",
    intro: "AG Refining reviews commercial quantities of qualifying silver-oxide button cells from watch repair, jewelry, distribution, and recycling businesses.",
    body: [
      ["Identification matters", "Not every button cell is silver oxide. Provide visible battery markings, approximate weight, and whether the lot is sorted or mixed."],
      ["Condition matters", "Damaged, swollen, corroded, leaking, recalled, lithium, mixed, or unknown batteries require manual review and may need different handling."],
      ["Quantity affects viability", "Because each cell contains a limited amount of recoverable silver, larger sorted lots are generally more economical to evaluate and process."]
    ]
  },
  {
    path: "x-ray-film-recycling",
    title: "X-Ray Film Recycling | AG Refining",
    eyebrow: "X-ray film",
    heading: "Clear valuable space. Review recoverable film responsibly.",
    intro: "Medical, dental, industrial, NDT, and lithographic film require different handling. Start with a project review before arranging shipment, pickup, or destruction.",
    body: [
      ["Film types", "Describe whether the material is medical film, dental film, industrial radiography, NDT, lithographic film, or another silver-bearing imaging material."],
      ["Sensitive records", "Do not submit patient images, names, dates of birth, medical record numbers, or other protected information through this public website."],
      ["Institutional projects", "Facilities should discuss record-retention authorization, chain of custody, destruction documentation, pickup logistics, and procurement requirements directly with AG Refining."]
    ]
  },
  {
    path: "accepted-materials",
    title: "Accepted Materials | AG Refining",
    eyebrow: "Material guide",
    heading: "Start with the material. We will help define the next step.",
    intro: "Eligibility depends on material type, condition, quantity, contamination risk, and available processing routes. The categories below begin the review, but they do not authorize shipment.",
    body: [
      ["Conventional silver", "Sterling items, silver jewelry, coins, bullion, flatware, contacts, wire, tubing, solder, filings, and qualifying production scrap."],
      ["Specialized material", "Qualifying dental material, sorted silver-oxide batteries, traditional silver-bearing X-ray film, and approved industrial residues."],
      ["Manual review", "Mixed, contaminated, damaged, liquid, powdered, unknown, hazardous, regulated, or unusually large material must be reviewed before logistics are arranged."]
    ]
  },
  {
    path: "how-it-works",
    title: "How It Works | AG Refining",
    eyebrow: "A measured process",
    heading: "Clarity before material changes hands.",
    intro: "A valuable-material transaction should begin with eligibility, expectations, and a clear contact path, not an unexplained shipping label.",
    body: [
      ["1. Describe the material", "Share the material category, approximate quantity, condition, source, location, and whether this is a one-time or recurring stream."],
      ["2. Receive preliminary direction", "AG Refining reviews eligibility and may request photographs, markings, weights, or additional technical information."],
      ["3. Arrange approved logistics", "If the material is eligible, AG Refining provides the next approved step for shipment, appointment, pickup, or additional review."],
      ["4. Evaluation and settlement", "Final evaluation and payment timing depend on the confirmed material, agreed process, and applicable transaction terms."]
    ]
  },
  {
    path: "about",
    title: "About AG Refining | Family Legacy in Silver",
    eyebrow: "A family legacy",
    heading: "Built on fairness. Continued with purpose.",
    intro: "AG Refining carries forward the Stevens family tradition of silver refining, shaped by the belief that repeat relationships matter more than a quick transaction.",
    body: [
      ["The beginning", "John Stevens built his reputation by working long hours and treating customers fairly. His example established the principles the family continues to value."],
      ["The return", "Years later, Dennis Stevens was asked by his youngest son to melt a small amount of old silver. The familiarity of the work brought him back to the craft and clarified the path forward."],
      ["The promise", "AG Refining aims to pair that family foundation with a clearer, more professional experience for individuals, businesses, and organizations evaluating silver-bearing material."]
    ]
  },
  {
    path: "espanol",
    lang: "es",
    title: "AG Refining en Español | Revisión de materiales de plata",
    eyebrow: "Atención en español",
    heading: "Orientación clara antes de enviar su material.",
    intro: "AG Refining ayuda a personas, empresas y organizaciones a solicitar una revisión preliminar de materiales que pueden contener plata.",
    body: [
      ["Materiales que revisamos", "Podemos revisar información sobre plata esterlina, joyería, cubiertos, material dental, baterías de óxido de plata, película de rayos X y ciertos materiales industriales."],
      ["Antes de enviar", "No envíe objetos de valor ni materiales desconocidos, contaminados o regulados hasta recibir instrucciones escritas de AG Refining."],
      ["Cómo comenzar", `Llame al ${phoneDisplay} o envíe un correo a ${email}. Describa el tipo de material, la cantidad aproximada, su condición y su ubicación.`]
    ]
  },
  {
    path: "contact",
    title: "Contact AG Refining | Request a Material Review",
    eyebrow: "Begin here",
    heading: "Tell us what material you have.",
    intro: "Provide enough information for a preliminary review. Do not send valuables, passwords, financial information, identity documents, patient information, or regulated records through this public form.",
    body: []
  }
];

const arrow = '<span class="icon-arrow" aria-hidden="true"></span>';
const nav = `
  <header class="site-header">
    <div class="utility-bar"><div class="shell utility-inner"><p>Family-owned silver recovery</p><div><a href="tel:${phoneHref}">${phoneDisplay}</a><span></span><a href="mailto:${email}">${email}</a><span></span><a href="/espanol">Español</a></div></div></div>
    <nav class="nav shell" aria-label="Primary navigation">
      <a class="brand" href="/" aria-label="AG Refining home"><img src="/assets/ag-mark.svg" alt=""><span class="brand-word">AG <strong>Refining</strong></span></a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-links" aria-label="Open navigation"><span></span><span></span></button>
      <div class="nav-links" id="primary-links" data-nav>
        <a href="/accepted-materials">Materials</a><a href="/how-it-works">How it works</a><a href="/accepted-materials#businesses">For businesses</a><a href="/about">About</a><a href="/how-it-works#resources">Resources</a><a href="/contact">Contact</a>
        <a class="button button-navy nav-review" href="/contact">Review my material ${arrow}</a>
      </div>
    </nav>
  </header>`;

const footer = `
  <footer class="footer">
    <div class="shell footer-grid">
      <div><a class="brand" href="/"><img src="/assets/ag-mark.svg" alt=""><span class="brand-word">AG Refining</span></a><p>Silver material review and recovery guidance for individuals, businesses, and organizations.</p></div>
      <nav aria-label="Services"><a href="/sell-scrap-silver">Scrap silver</a><a href="/dental-scrap">Dental material</a><a href="/silver-oxide-watch-batteries">Watch batteries</a><a href="/x-ray-film-recycling">X-ray film</a></nav>
      <nav aria-label="Contact"><a href="tel:${phoneHref}">${phoneDisplay}</a><a href="mailto:${email}">${email}</a><a href="/contact">Material review</a></nav>
    </div>
    <div class="shell footer-bottom"><p>Copyright 2026 AG Refining. Material eligibility and value require review. Do not ship valuables without approval.</p></div>
  </footer>`;

const questionGuide = `<div class="question-guide" data-question-guide>
  <button class="question-trigger" type="button" data-question-trigger aria-expanded="false" aria-controls="question-panel"><span class="question-icon" aria-hidden="true"></span><span>Questions?</span></button>
  <section class="question-panel" id="question-panel" data-question-panel hidden aria-label="Quick material guidance"><button class="question-close" type="button" data-question-close aria-label="Close quick guidance"></button><p class="eyebrow">Quick guidance</p><h2>Start with the material.</h2><a href="/accepted-materials">See what we review ${arrow}</a><a href="/how-it-works">Understand the process ${arrow}</a><a href="/contact">Request a review ${arrow}</a><a href="tel:${phoneHref}">Call ${phoneDisplay}</a></section>
</div>`;

function document({ title, description, path = "", content, schema = "", lang = "en" }) {
  const canonical = `https://agrefining.com/${path}`.replace(/\/$/, path ? "" : "/");
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#061929"><meta property="og:type" content="website"><meta property="og:site_name" content="AG Refining"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://agrefining.com/assets/ag-silver-social.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="675"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/ag-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css">${schema}</head><body><a class="skip" href="#main">Skip to content</a>${nav}<main id="main">${content}</main>${footer}${questionGuide}<script src="/site.js" defer></script></body></html>`;
}

function form() {
  return `<form class="review-form" data-review-form>
    <div class="field"><label for="name">Name</label><input id="name" name="name" autocomplete="name" required></div>
    <div class="field"><label for="business">Business, if applicable</label><input id="business" name="business" autocomplete="organization"></div>
    <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
    <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="material">Material</label><select id="material" name="material" required><option value="">Select one</option><option>Scrap silver</option><option>Dental material</option><option>Silver-oxide batteries</option><option>X-ray film</option><option>Industrial silver-bearing material</option><option>Not sure</option></select></div>
    <div class="field"><label for="quantity">Approximate quantity</label><input id="quantity" name="quantity" placeholder="Weight, count, boxes, or pallets"></div>
    <div class="field field-wide"><label for="details">What should we know?</label><textarea id="details" name="details" required placeholder="Describe the material, condition, source, location, and whether it is a one-time or recurring lot."></textarea></div>
    <p class="form-note">Submitting opens a prepared email in your device. It is a request for preliminary review, not a quote, offer, shipping authorization, or guarantee of acceptance.</p>
    <div class="field-wide"><button class="button button-dark" type="submit">Prepare review request ${arrow}</button></div>
  </form>`;
}

const home = `
  <section class="hero"><div class="hero-media"><img src="/assets/ag-silver-hero.webp" alt="Industrial silver offcuts, sheet, wire, and tubing arranged on a dark assay surface" width="1672" height="941" fetchpriority="high"></div><div class="shell hero-inner"><div class="hero-copy" data-reveal>
    <p class="hero-kicker"><span>Ag</span> Family-owned silver specialists</p><h1>Silver recovery,<br>without guesswork.</h1>
    <p class="hero-lede">Tell us what you have. We will confirm whether it fits, explain how evaluation works, and give you the right next step before you send anything.</p>
    <div class="hero-actions"><a class="button button-blue" href="/contact">Review my material ${arrow}</a><a class="button button-outline" href="/how-it-works">How it works</a></div>
    <p class="shipping-note"><span></span>Please wait for written shipping instructions.</p>
  </div></div></section>
  <div class="trust-line"><div class="shell trust-line-inner"><p>Material-specific review</p><p>Business and individual inquiries</p><p>Direct human guidance</p></div></div>
  <section class="section section-paper"><div class="shell"><div class="section-head" data-reveal><span class="section-index">01</span><div><p class="eyebrow">Start with what you have</p><h2>Four material paths. One considered process.</h2><p class="section-intro">Different material requires different questions. Choose the closest category and begin with a preliminary review before arranging shipment or pickup.</p></div></div>
    <div class="material-list">
      <article class="material-row" data-reveal><h3>Scrap silver</h3><p>Sterling, jewelry, flatware, coins, contacts, wire, solder, filings, and qualifying production material.</p><a class="text-link" href="/sell-scrap-silver">Explore ${arrow}</a></article>
      <article class="material-row" data-reveal><h3>Dental material</h3><p>Qualifying crowns, bridges, inlays, and other reviewed silver-bearing dental material.</p><a class="text-link" href="/dental-scrap">Explore ${arrow}</a></article>
      <article class="material-row" data-reveal><h3>Silver-oxide batteries</h3><p>Sorted commercial quantities from watch repair, jewelry, distribution, and recycling operations.</p><a class="text-link" href="/silver-oxide-watch-batteries">Explore ${arrow}</a></article>
      <article class="material-row" data-reveal><h3>X-ray film</h3><p>Medical, dental, industrial, NDT, and lithographic film considered through the appropriate review path.</p><a class="text-link" href="/x-ray-film-recycling">Explore ${arrow}</a></article>
    </div>
  </div></section>
  <section class="section section-dark"><div class="shell"><div class="section-head" data-reveal><span class="section-index">02</span><div><p class="eyebrow">How it begins</p><h2>Clarity before material changes hands.</h2><p class="section-intro">The first goal is not to rush a shipment. It is to understand the material well enough to identify the right next step.</p></div></div><div class="process" data-reveal><article><h3>Describe</h3><p>Share the category, quantity, condition, location, and whether the material recurs.</p></article><article><h3>Review</h3><p>AG Refining evaluates the preliminary details and asks for anything missing.</p></article><article><h3>Arrange</h3><p>Eligible material receives appropriate directions for the approved logistics path.</p></article><article><h3>Settle</h3><p>Final evaluation and settlement follow the confirmed material and agreed terms.</p></article></div></div></section>
  <section class="section section-paper"><div class="shell legacy" data-reveal><div class="legacy-mark"><img src="/assets/ag-mark.svg" alt="AG Refining silver element mark"></div><div><p class="eyebrow">The Stevens family</p><h2>A legacy measured in repeat relationships.</h2><blockquote>“My father taught us the importance of honesty, hard work, and respect.”</blockquote><p>John Stevens built his reputation by treating customers fairly. Years later, a small request from Dennis Stevens’s youngest son brought him back to the familiar work of melting silver and renewed the family’s commitment to the craft.</p><a class="text-link" href="/about">Read the family story ${arrow}</a></div></div></section>
  <section class="cta-band"><div class="shell" data-reveal><p class="eyebrow">Your material review</p><h2>Know what to do before you send it.</h2><p>Tell us what material you have, approximately how much, and where it came from. We will help identify the next appropriate step.</p><a class="button button-light" href="/contact">Request a material review ${arrow}</a></div></section>`;

const organizationSchema = `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Organization","name":"AG Refining","url":"https://agrefining.com/","telephone":phoneHref,"email":email})}</script>`;
writeFileSync(join(out, "index.html"), document({ title: "AG Refining | Silver Material Review and Recovery", description: "Request a preliminary review for scrap silver, dental material, silver-oxide batteries, X-ray film, and qualifying industrial silver-bearing material.", content: home, schema: organizationSchema }));

for (const page of pages) {
  const body = page.path === "contact" ? form() : page.body.map(([heading, text]) => `<section data-reveal><h3>${heading}</h3><p>${text}</p></section>`).join("");
  const sectionId = page.path === "accepted-materials" ? "businesses" : page.path === "how-it-works" ? "resources" : "";
  const content = `<section class="page-hero"><div class="shell" data-reveal><p class="eyebrow">${page.eyebrow}</p><h1>${page.heading}</h1><p>${page.intro}</p></div></section><section class="section section-paper"${sectionId ? ` id="${sectionId}"` : ""}><div class="shell content-grid"><aside class="content-nav"><a href="/accepted-materials">Accepted materials</a><a href="/how-it-works">How it works</a><a href="/contact">Request a review</a></aside><div class="prose"><h2>${page.path === "contact" ? "Preliminary material review" : page.path === "espanol" ? "Información importante" : "What to know"}</h2>${body}<div class="notice"><strong>${page.path === "espanol" ? "Importante" : "Important"}:</strong> ${page.path === "espanol" ? "No envíe materiales hasta que AG Refining confirme el siguiente paso por escrito." : "Do not ship material until AG Refining confirms eligibility and provides the appropriate next step."}</div>${page.path === "contact" ? `<p>Prefer to speak directly? Call <a href="tel:${phoneHref}">${phoneDisplay}</a> or email <a href="mailto:${email}">${email}</a>.</p>` : `<a class="button button-dark" href="/contact">${page.path === "espanol" ? "Solicitar una revisión" : "Request a material review"} ${arrow}</a>`}</div></div></section>`;
  const dir = join(out, page.path); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), document({ title: page.title, description: page.intro, path: page.path, content, lang: page.lang || "en" }));
}

writeFileSync(join(out, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://agrefining.com/sitemap.xml\n");
const urls = ["", ...pages.map((page) => page.path)].map((path) => `<url><loc>https://agrefining.com/${path}</loc></url>`).join("");
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
writeFileSync(join(out, "404.html"), document({ title: "Page not found | AG Refining", description: "The requested page could not be found.", content: `<section class="page-hero"><div class="shell"><p class="eyebrow">404</p><h1>That page is not here.</h1><p>Return to the material guide or contact AG Refining directly.</p><p><a class="button button-dark" href="/">Return home ${arrow}</a></p></div></section>` }));
console.log(`Built ${pages.length + 1} public pages in dist`);
