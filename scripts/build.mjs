import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "dist");

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "assets"), { recursive: true });
cpSync(join(root, "assets"), join(out, "assets"), { recursive: true });
cpSync(join(root, "src", "style.css"), join(out, "style.css"));
cpSync(join(root, "src", "site.js"), join(out, "site.js"));

const siteUrl = "https://agrefining.com";
const phoneDisplay = "(281) 898-2719";
const phoneHref = "+12818982719";
const email = "dennis@agrefining.com";
const street = "9125 Airport Blvd., Suite B-1";
const cityLine = "Houston, TX 77061";
const primaryCta = "Schedule a Free Pickup";
const arrow = '<span class="icon-arrow" aria-hidden="true"></span>';

const materialPages = [
  {
    path: "scrap-silver-jewelry",
    title: "Scrap Silver Jewelry Buyer in Houston | AG Refining",
    description: "Sell scrap silver jewelry in Houston. AG Refining offers clear weighing, honest pricing, free qualifying pickup, and fast payment.",
    eyebrow: "Scrap silver jewelry",
    heading: "Sell scrap silver jewelry with a clear process.",
    intro: "AG Refining buys qualifying silver jewelry from Houston businesses and commercial accounts. Tell us what you have, and we will explain the next step.",
    image: "material-scrap-silver-1280.webp",
    imageAlt: "Sorted silver jewelry, flatware, wire, and silver scrap",
    answerHeading: "We buy silver for its recoverable metal.",
    answerText: "Broken, worn, outdated, or mixed silver jewelry may still have value. The amount depends on the material, weight, silver content, and current market price.",
    details: [
      ["What we review", "Sterling jewelry, broken silver items, silver findings, flatware, coins, and other qualifying silver-bearing pieces."],
      ["What to share", "Tell us the weight, visible markings, condition, source, and whether the lot is sorted or mixed."],
      ["How pickup works", "Free pickup may be available for qualifying commercial accounts in the Houston Metro Area. We confirm the material and schedule first."]
    ],
    faqs: [
      ["Do you buy broken silver jewelry?", "Yes. Broken or worn jewelry may qualify if it contains recoverable silver."],
      ["Do markings matter?", "Yes. Marks such as sterling or 925 can help with the first review, but the material still needs to be checked."],
      ["Can you pick up from my business?", "Free pickup may be available for qualifying commercial accounts in the Houston Metro Area."]
    ]
  },
  {
    path: "industrial-x-ray-silver-recycling",
    title: "Industrial X-Ray Silver Recycling in Houston | AG Refining",
    description: "Recycle qualifying industrial X-ray film in Houston with AG Refining. Get clear guidance, free qualifying pickup, and on-site weighing.",
    eyebrow: "Industrial X-ray film",
    heading: "Recover silver from industrial X-ray film.",
    intro: "AG Refining works with Houston companies that have qualifying industrial X-ray film, NDT film, and related silver-bearing imaging material.",
    image: "material-xray-film-1280.webp",
    imageAlt: "Industrial radiographic film and archive boxes prepared for review",
    answerHeading: "Old film can hold recoverable silver.",
    answerText: "The type, age, condition, quantity, and storage method can affect the review. Start with a clear count or weight and a short description.",
    details: [
      ["Common sources", "Oil and gas testing, weld inspection, aerospace work, manufacturing, laboratories, and non-destructive testing programs."],
      ["Records and privacy", "Remove protected, private, or controlled records before transfer. Do not upload private images or records through the public form."],
      ["Pickup planning", "For qualifying commercial lots, AG Refining can discuss free pickup, on-site weighing, and the right handling plan."]
    ],
    faqs: [
      ["Do you take industrial radiography film?", "Qualifying industrial and NDT film can be reviewed. Contact us before moving the material."],
      ["Can you pick up a large archive?", "Free pickup may be available for qualifying commercial lots in the Houston Metro Area."],
      ["Should I send sample images online?", "No. Do not send protected, private, or controlled records through the public form."]
    ]
  },
  {
    path: "silver-coin-buyers-houston",
    title: "Silver Coin Buyers in Houston | AG Refining",
    description: "Sell qualifying silver coins in Houston with clear weighing, honest pricing, and a direct review from AG Refining.",
    eyebrow: "Silver coins",
    heading: "Sell silver coins with clear weighing and pricing.",
    intro: "AG Refining reviews qualifying silver coins, rounds, and mixed silver lots. We explain the process before the material changes hands.",
    image: "material-scrap-silver-1280.webp",
    imageAlt: "Silver items and coins arranged for a material review",
    answerHeading: "Metal value and collector value are not the same.",
    answerText: "Some coins may be worth more as collectibles. AG Refining buys for recoverable silver value, so ask before selling rare or graded coins for refining.",
    details: [
      ["What to identify", "Share the coin type, year range, quantity, total weight, and any visible silver markings."],
      ["Mixed lots", "Separate known silver coins from plated, clad, foreign, or unknown coins when possible."],
      ["Before you sell", "Ask about the buying method and offer before you approve the transaction."]
    ],
    faqs: [
      ["Do you buy old silver coins?", "Qualifying silver coins can be reviewed for recoverable silver value."],
      ["Do you grade rare coins?", "No collector-grade promise is made on this page. Rare coins may need a coin specialist."],
      ["Can I bring a mixed lot?", "Yes, but sorting known silver from unknown coins can make the review faster."]
    ]
  },
  {
    path: "silver-oxide-battery-recycling",
    title: "Silver Oxide Battery Recycling in Houston | AG Refining",
    description: "Recycle qualifying silver oxide watch batteries in Houston. AG Refining reviews sorted commercial lots and pickup options.",
    eyebrow: "Silver oxide batteries",
    heading: "Turn sorted watch batteries into recoverable silver.",
    intro: "AG Refining reviews commercial quantities of qualifying silver oxide button cells from watch shops, jewelers, distributors, and recyclers.",
    image: "material-watch-batteries-1280.webp",
    imageAlt: "Sorted silver oxide button batteries arranged by size",
    answerHeading: "Correct sorting makes the lot easier to review.",
    answerText: "Not every button cell contains silver. Share the markings, total weight, condition, and whether the cells are sorted or mixed.",
    details: [
      ["Good starting information", "Battery codes, approximate weight, box count, source, condition, and storage method."],
      ["Mixed batteries", "Lithium, alkaline, damaged, leaking, recalled, and unknown cells may need a different handling path."],
      ["Commercial lots", "Larger sorted lots are usually easier to review because each cell contains a small amount of silver."]
    ],
    faqs: [
      ["Do all watch batteries contain silver?", "No. The markings and chemistry must be reviewed."],
      ["Do you take mixed button cells?", "Mixed lots need a manual review and may need sorting before pickup."],
      ["Can you pick up commercial quantities?", "Free pickup may be available for qualifying commercial lots in the Houston Metro Area."]
    ]
  },
  {
    path: "medical-x-ray-recycling",
    title: "Medical X-Ray Film Recycling in Houston | AG Refining",
    description: "Request medical X-ray film recycling in Houston. AG Refining reviews qualifying film, pickup needs, and on-site weighing.",
    eyebrow: "Medical X-ray film",
    heading: "Clear old film and recover qualifying silver.",
    intro: "Hospitals, clinics, dental offices, and imaging centers can request a review of qualifying silver-bearing X-ray film.",
    image: "material-xray-film-1280.webp",
    imageAlt: "Medical X-ray film and storage sleeves organized for review",
    answerHeading: "Patient privacy comes before pickup.",
    answerText: "Do not send patient names, birth dates, medical record numbers, or readable patient images through this website. Contact AG Refining for the correct review path.",
    details: [
      ["What to describe", "The film type, date range, box count, estimated weight, storage method, and whether records have been cleared for disposal."],
      ["Who we serve", "Hospitals, clinics, dental offices, imaging centers, laboratories, and approved records projects."],
      ["Before pickup", "Your organization must confirm its own retention, privacy, and disposal duties before material leaves the site."]
    ],
    faqs: [
      ["Do you recycle medical X-ray film?", "Qualifying traditional silver-bearing film can be reviewed."],
      ["Can I upload patient images?", "No. Do not upload or email protected patient information through this website."],
      ["Do you provide free pickup?", "Free pickup may be available for qualifying commercial projects in the Houston Metro Area."]
    ]
  },
  {
    path: "silver-scrap-buyer-houston",
    title: "Silver Scrap Buyer in Houston | AG Refining",
    description: "Sell commercial silver scrap in Houston. AG Refining offers free qualifying pickup, on-site weighing, honest pricing, and fast payment.",
    eyebrow: "Silver scrap",
    heading: "Sell silver scrap in Houston without the hassle.",
    intro: "AG Refining buys qualifying silver scrap from Houston commercial and industrial accounts. We come to you when the lot and schedule qualify.",
    image: "ag-silver-hero-1600.webp",
    imageAlt: "Industrial silver wire, sheet, contacts, and clean offcuts",
    answerHeading: "Know the weight before you accept an offer.",
    answerText: "AG Refining offers on-site weighing for qualifying pickups so you can see the weight before payment.",
    details: [
      ["Materials we review", "Sterling, wire, contacts, tubing, solder, sheet, clean offcuts, production scrap, and other qualifying silver-bearing material."],
      ["Commercial pickup", "Free pickup is available for qualifying commercial and industrial accounts in the Houston Metro Area."],
      ["Pricing", "Offers depend on the material, recoverable silver, weight, condition, and current silver market values."]
    ],
    faqs: [
      ["Do you buy industrial silver scrap?", "Yes. Qualifying industrial silver-bearing material can be reviewed."],
      ["Will you weigh it at my facility?", "On-site weighing is available for qualifying pickups."],
      ["When will I get paid?", "Immediate payment is available for most qualifying transactions. Timing depends on the material and agreed terms."]
    ]
  },
  {
    path: "dental-scrap",
    title: "Dental Scrap Buyer in Houston | AG Refining",
    description: "Sell qualifying dental scrap in Houston. AG Refining reviews commercial dental material and offers clear pickup guidance.",
    eyebrow: "Dental scrap",
    heading: "A simple review for qualifying dental scrap.",
    intro: "Dental offices and laboratories can request a review of crowns, bridges, inlays, and other qualifying silver-bearing dental material.",
    image: "material-dental-1280.webp",
    imageAlt: "Clean dental alloy pieces sorted for a material review",
    answerHeading: "Dental material can contain different metals.",
    answerText: "Tell us what the material is, how much you have, and whether it includes sharps, liquids, biological material, or unknown items.",
    details: [
      ["What to describe", "Approximate weight, material type, source, condition, and whether the lot is sorted."],
      ["Do not include", "Patient records, extracted teeth, sharps, liquids, or unidentified clinical waste through ordinary pickup."],
      ["Commercial service", "Qualifying Houston dental offices and labs can ask about free pickup and on-site weighing."]
    ],
    faqs: [
      ["Do you buy dental crowns and bridges?", "Qualifying dental metal can be reviewed."],
      ["Can I send patient information?", "No. Never send patient records or protected information through this website."],
      ["Do you serve dental labs?", "Yes. Commercial dental laboratories can request a material review."]
    ]
  },
  {
    path: "industrial-silver-scrap",
    title: "Industrial Silver Scrap Buyer in Houston | AG Refining",
    description: "Sell industrial silver scrap in Houston with AG Refining. Free qualifying pickup, on-site weighing, and honest pricing.",
    eyebrow: "Industrial silver",
    heading: "A repeatable way to sell industrial silver.",
    intro: "AG Refining helps Houston plants, shops, and manufacturers sell qualifying silver-bearing production material.",
    image: "ag-silver-hero-1600.webp",
    imageAlt: "Industrial silver wire, tubing, sheet, and contacts",
    answerHeading: "Recurring material needs a clear plan.",
    answerText: "Tell us what process creates the material, how often it is produced, how it is stored, and the normal lot size.",
    details: [
      ["Common material", "Wire, tubing, contacts, sheet, solder, clean offcuts, production scrap, and qualifying silver-bearing parts."],
      ["Recurring accounts", "AG Refining can review one-time cleanouts and repeat material streams."],
      ["On-site service", "Qualifying accounts can ask about free pickup, on-site weighing, and fast payment in the Houston Metro Area."]
    ],
    faqs: [
      ["Do you work with manufacturers?", "Yes. Manufacturing and industrial accounts can request a review."],
      ["Can you handle repeat pickups?", "Repeat pickup plans can be discussed after the material and normal volume are reviewed."],
      ["How is the offer set?", "The offer depends on the material, recoverable silver, weight, condition, and current market values."]
    ]
  }
];

const industryPages = [
  ["hospital-silver-recycling", "Hospital Silver Recycling in Houston", "Hospitals", "medical X-ray film, dental material, lab material, and other qualifying silver-bearing items", "material-xray-film-1280.webp"],
  ["dental-lab-silver-recycling", "Dental Lab Silver Recycling in Houston", "Dental laboratories", "qualifying crowns, bridges, inlays, filings, and silver-bearing dental material", "material-dental-1280.webp"],
  ["oil-gas-silver-recovery", "Oil and Gas Silver Recovery in Houston", "Oil and gas companies", "industrial X-ray film, NDT film, contacts, and qualifying silver-bearing maintenance or production material", "material-xray-film-1280.webp"],
  ["manufacturing-silver-recovery", "Manufacturing Silver Recovery in Houston", "Manufacturers", "wire, contacts, sheet, solder, clean offcuts, parts, and recurring production scrap", "ag-silver-hero-1600.webp"],
  ["university-silver-recycling", "University Silver Recycling in Houston", "Universities", "qualifying lab material, old X-ray film, electronics, batteries, and approved silver-bearing inventory", "material-xray-film-1280.webp"],
  ["electronics-silver-recovery", "Electronics Silver Recovery in Houston", "Electronics companies", "qualifying contacts, switches, components, solder, and silver-bearing production scrap", "ag-silver-hero-1600.webp"]
].map(([path, heading, audience, materials, image]) => ({
  path,
  title: `${heading} | AG Refining`,
  description: `${heading} with free qualifying pickup, on-site weighing, honest pricing, and direct service from AG Refining.`,
  eyebrow: "Industry service",
  heading,
  intro: `AG Refining helps ${audience.toLowerCase()} review and sell ${materials}.`,
  image,
  imageAlt: `${audience} silver-bearing material prepared for review`,
  answerHeading: `A direct silver service for ${audience.toLowerCase()}.`,
  answerText: "We come to qualifying Houston accounts, weigh material on-site, explain the offer, and provide fast payment when available.",
  details: [
    ["Start with the material", `Tell us what you have, the normal quantity, its condition, and whether it is a one-time lot or a repeat stream.`],
    ["Plan the pickup", "Free pickup may be available for qualifying commercial accounts in the Houston Metro Area. We confirm the lot and schedule first."],
    ["Keep the process clear", "You can see the on-site weight before payment. Final pricing depends on the confirmed material and current silver market values."]
  ],
  faqs: [
    [`Does AG Refining work with ${audience.toLowerCase()}?`, `Yes. ${audience} can request a commercial material review.`],
    ["Do you offer free pickup?", "Yes, for qualifying commercial and industrial accounts in the Houston Metro Area."],
    ["Can you weigh material on-site?", "Yes, on-site weighing is available for qualifying pickups."]
  ]
}));

const locationPages = [
  ["houston-silver-buyer", "Houston", "the City of Houston"],
  ["silver-buyer-pearland", "Pearland", "Pearland and nearby south Houston businesses"],
  ["silver-buyer-pasadena", "Pasadena", "Pasadena, Deer Park, and nearby industrial areas"],
  ["silver-buyer-sugar-land", "Sugar Land", "Sugar Land, Stafford, and nearby southwest Houston businesses"],
  ["silver-buyer-katy", "Katy", "Katy and west Houston businesses"],
  ["silver-buyer-the-woodlands", "The Woodlands", "The Woodlands, Spring, and north Houston businesses"],
  ["silver-buyer-conroe", "Conroe", "Conroe and nearby Montgomery County businesses"]
].map(([path, city, area]) => ({
  path,
  title: `Silver Buyer in ${city}, TX | Free Qualifying Pickup | AG Refining`,
  description: `Sell qualifying silver in ${city}. AG Refining offers free commercial pickup, on-site weighing, honest pricing, and fast payment.`,
  eyebrow: "Houston Metro service",
  heading: `${city} silver buyer for commercial accounts.`,
  intro: `AG Refining serves ${area}. Qualifying commercial accounts can ask for free pickup, on-site weighing, and fast payment.`,
  image: "ag-silver-hero-1600.webp",
  imageAlt: `Silver-bearing commercial material for pickup near ${city}, Texas`,
  answerHeading: `We come to qualifying businesses in ${city}.`,
  answerText: "You do not have to move a large lot before you know the process. Tell us what you have, and we will confirm whether the pickup qualifies.",
  details: [
    ["What we buy", "Qualifying scrap silver, industrial silver, dental material, silver oxide batteries, X-ray film, coins, jewelry, and other silver-bearing material."],
    ["How pickup works", `We review the material, amount, condition, and location. If the lot qualifies, we schedule pickup in ${city}.`],
    ["How you get paid", "We weigh qualifying material on-site and provide an offer based on the material and current silver market values. Fast payment is available when the transaction qualifies."]
  ],
  faqs: [
    [`Do you pick up silver in ${city}?`, `Yes. Free pickup may be available for qualifying commercial accounts in ${city}.`],
    ["Do you weigh the material at my location?", "Yes. On-site weighing is available for qualifying pickups."],
    ["Do you buy from individuals?", "AG Refining reviews individual and business inquiries, but free pickup is focused on qualifying commercial accounts."]
  ]
}));

const allServicePages = [...materialPages, ...industryPages, ...locationPages];

const nav = `
  <header class="site-header" data-site-header>
    <div class="utility-bar">
      <div class="shell utility-inner">
        <p>Houston-based silver buyer</p>
        <div>
          <a href="tel:${phoneHref}">${phoneDisplay}</a><span></span>
          <a href="mailto:${email}">${email}</a><span></span>
          <a href="/espanol">Español</a>
        </div>
      </div>
    </div>
    <nav class="nav shell" aria-label="Primary navigation">
      <a class="brand" href="/" aria-label="AG Refining home">
        <img src="/assets/ag-mark-path.svg" alt="" width="48" height="48">
        <span class="brand-word">AG <strong>Refining</strong></span>
      </a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-links" aria-label="Open navigation"><span></span><span></span></button>
      <div class="nav-links" id="primary-links" data-nav>
        <a href="/accepted-materials">Materials</a>
        <a href="/industries">Industries</a>
        <a href="/service-areas">Service areas</a>
        <a href="/how-it-works">How it works</a>
        <a href="/about">Our story</a>
        <a class="button button-navy nav-review" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
      </div>
    </nav>
    <button class="nav-scrim" type="button" data-nav-scrim aria-label="Close navigation" tabindex="-1"></button>
  </header>`;

const footer = `
  <footer class="footer">
    <div class="shell footer-grid">
      <div>
        <a class="brand" href="/"><img src="/assets/ag-mark-path.svg" alt="" width="48" height="48"><span class="brand-word">AG Refining</span></a>
        <p>Houston silver buying and pickup for qualifying commercial, industrial, medical, and business accounts.</p>
      </div>
      <nav aria-label="Materials">
        <a href="/silver-scrap-buyer-houston">Silver scrap</a>
        <a href="/industrial-x-ray-silver-recycling">Industrial X-ray film</a>
        <a href="/silver-oxide-battery-recycling">Watch batteries</a>
        <a href="/accepted-materials">All materials</a>
      </nav>
      <nav aria-label="Contact">
        <a href="tel:${phoneHref}">${phoneDisplay}</a>
        <a href="mailto:${email}">${email}</a>
        <a href="/contact?intent=pickup">${primaryCta}</a>
      </nav>
    </div>
    <div class="shell footer-bottom">
      <p>Copyright 2026 AG Refining. Free pickup and fast payment depend on material, location, account type, and schedule.</p>
      <nav aria-label="Legal"><a href="/privacy">Privacy</a></nav>
    </div>
  </footer>`;

const materialGuide = `
  <details class="material-guide">
    <summary><span class="guide-mark" aria-hidden="true"></span><span>Not sure what you have?</span></summary>
    <div class="material-guide-panel">
      <h2>Start with the material.</h2>
      <a href="/accepted-materials">See what we buy ${arrow}</a>
      <a href="/how-it-works">See how pickup works ${arrow}</a>
      <a href="/contact">Request a review ${arrow}</a>
      <a href="tel:${phoneHref}">Call ${phoneDisplay}</a>
    </div>
  </details>`;

const mobileActions = `<nav class="mobile-actions" aria-label="Quick actions"><a href="tel:${phoneHref}">Call</a><a href="/contact?intent=pickup">${primaryCta} ${arrow}</a></nav>`;

function schemaTag(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "AG Refining",
  url: `${siteUrl}/`,
  logo: `${siteUrl}/assets/ag-mark-path.svg`,
  telephone: phoneHref,
  email,
  address: {
    "@type": "PostalAddress",
    streetAddress: street,
    addressLocality: "Houston",
    addressRegion: "TX",
    postalCode: "77061",
    addressCountry: "US"
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Greater Houston Metro Area"
  }
};

function document({
  title,
  description,
  path = "",
  content,
  lang = "en",
  bodyClass = "",
  pageSchema = [],
  image = "ag-silver-social.jpg",
  robots = "index,follow,max-image-preview:large"
}) {
  const canonical = path ? `${siteUrl}/${path}` : `${siteUrl}/`;
  const schema = [organizationSchema, ...pageSchema];
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <meta name="robots" content="${robots}">
    <meta name="theme-color" content="#061724">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="AG Refining">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${siteUrl}/assets/${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="675">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="/assets/ag-mark-path.svg" type="image/svg+xml">
    <link rel="preload" href="/assets/fonts/newsreader-latin-opsz.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/assets/fonts/manrope-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/style.css?v=20260730-houston-buyer">
    ${schemaTag({ "@context": "https://schema.org", "@graph": schema })}
  </head>
  <body${bodyClass ? ` class="${bodyClass}"` : ""}>
    <a class="skip" href="#main">Skip to content</a>
    ${nav}
    <main id="main">${content}</main>
    ${mobileActions}
    ${footer}
    ${materialGuide}
    <script src="/site.js?v=20260730-houston-buyer" defer></script>
  </body>
</html>`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items.map(([label, href], index) => `<li>${href && index < items.length - 1 ? `<a href="${href}">${label}</a>` : label}</li>`).join("")}</ol></nav>`;
}

function faqMarkup(items) {
  return `<div class="faq-list">${items.map(([question, answer]) => `<details><summary>${question}<span aria-hidden="true"></span></summary><div><p>${answer}</p></div></details>`).join("")}</div>`;
}

function faqSchema(items) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text }
    }))
  };
}

const featuredMaterials = [
  ["Scrap silver jewelry", "scrap-silver-jewelry", "material-scrap-silver-1280.webp", "material-scrap-silver-mobile.webp", "Jewelry, flatware, coins, and mixed silver items."],
  ["Industrial X-ray film", "industrial-x-ray-silver-recycling", "material-xray-film-1280.webp", "material-xray-film-mobile.webp", "Industrial radiography and NDT film from qualifying accounts."],
  ["Silver coins", "silver-coin-buyers-houston", "material-scrap-silver-1280.webp", "material-scrap-silver-mobile.webp", "Qualifying coins and mixed silver lots reviewed for metal value."],
  ["Silver oxide batteries", "silver-oxide-battery-recycling", "material-watch-batteries-1280.webp", "material-watch-batteries-mobile.webp", "Sorted commercial lots from watch and jewelry businesses."],
  ["Medical X-ray film", "medical-x-ray-recycling", "material-xray-film-1280.webp", "material-xray-film-mobile.webp", "Qualifying film from medical, dental, and imaging facilities."],
  ["Industrial silver scrap", "industrial-silver-scrap", "ag-silver-hero-1600.webp", "ag-silver-hero-mobile.webp", "Wire, contacts, sheet, solder, offcuts, and production material."]
];

const homeFaqs = [
  ["What types of customers does AG Refining serve?", "We work with commercial, industrial, medical, educational, manufacturing, and recycling businesses throughout the Houston Metro Area."],
  ["Do you offer free pickup?", "Yes. We provide free pickup throughout the Houston Metro Area for qualifying commercial and industrial accounts."],
  ["Do you weigh materials on-site?", "Yes. We perform on-site weighing for qualifying pickups so you can see the weight before payment."],
  ["When do I get paid?", "Immediate payment is available for most qualifying transactions. Same-day service depends on the material, schedule, and agreed terms."],
  ["What areas do you serve?", "We serve Houston, Pearland, Pasadena, Sugar Land, Katy, Cypress, Spring, The Woodlands, Conroe, Humble, Baytown, League City, Friendswood, Missouri City, Richmond, Rosenberg, Tomball, Bellaire, Deer Park, La Porte, Texas City, Galveston, and nearby communities."],
  ["Why choose AG Refining?", "Customers choose AG Refining for honest pricing, professional service, free qualifying pickup, on-site weighing, and direct Houston-based support."]
];

const home = `
  <section class="hero hero-commercial">
    <div class="hero-media">
      <picture>
        <source media="(max-width: 700px)" srcset="/assets/ag-silver-hero-mobile.webp">
        <img src="/assets/ag-silver-hero-1600.webp" alt="Industrial silver wire, sheet, contacts, and clean offcuts" width="1600" height="900" fetchpriority="high">
      </picture>
    </div>
    <div class="shell hero-commercial-grid">
      <div class="hero-copy" data-reveal>
        <p class="hero-kicker"><span>Ag</span> Houston silver buyer</p>
        <h1>Turn silver-bearing material into cash.</h1>
        <p class="hero-lede">AG Refining helps Houston businesses sell silver-bearing material. We offer free pickup for qualifying accounts, on-site weighing, honest pricing, and fast payment.</p>
        <div class="hero-actions">
          <a class="button button-blue" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
          <a class="button button-outline" href="/contact?intent=quote">Request a quote</a>
        </div>
        <p class="shipping-note"><span></span>Contact AG before shipping or visiting.</p>
      </div>
      <form class="hero-review-card" action="/contact" method="get" data-reveal>
        <input type="hidden" name="intent" value="pickup">
        <p class="hero-review-label">Start here</p>
        <h2>What silver do you have?</h2>
        <p>Choose the closest type. We will review the details and confirm the next step.</p>
        <label for="hero-material">Material type</label>
        <select id="hero-material" name="material" required>
          <option value="">Select a material</option>
          <option value="scrap_silver">Scrap silver</option>
          <option value="industrial_silver">Industrial silver</option>
          <option value="dental_material">Dental material</option>
          <option value="silver_oxide_batteries">Watch batteries</option>
          <option value="xray_film">X-ray film</option>
          <option value="unknown">Not sure</option>
        </select>
        <label for="hero-quantity">Approximate amount <span>Optional</span></label>
        <input id="hero-quantity" name="quantity" type="text" maxlength="120" placeholder="Weight, boxes, drums, or pallets">
        <button class="button button-blue" type="submit">${primaryCta} ${arrow}</button>
        <small>Free pickup depends on the material, location, account type, and schedule.</small>
      </form>
    </div>
  </section>

  <section class="material-shortcuts" aria-label="Popular material pages">
    <div class="shell material-shortcuts-grid">
      <a href="/silver-scrap-buyer-houston"><span>01</span><div><strong>Silver scrap</strong><small>View material</small></div>${arrow}</a>
      <a href="/industrial-x-ray-silver-recycling"><span>02</span><div><strong>Industrial X-ray</strong><small>View material</small></div>${arrow}</a>
      <a href="/silver-oxide-battery-recycling"><span>03</span><div><strong>Watch batteries</strong><small>View material</small></div>${arrow}</a>
      <a href="/medical-x-ray-recycling"><span>04</span><div><strong>Medical X-ray</strong><small>View material</small></div>${arrow}</a>
      <a href="/industrial-silver-scrap"><span>05</span><div><strong>Industrial silver</strong><small>View material</small></div>${arrow}</a>
    </div>
  </section>

  <div class="trust-line">
    <div class="shell trust-line-inner trust-line-four">
      <p>Houston-based</p>
      <p>Free qualifying pickup</p>
      <p>On-site weighing</p>
      <p>Fast payment</p>
    </div>
  </div>

  <section class="section answer-home">
    <div class="shell answer-home-grid">
      <div><p class="eyebrow">Houston's trusted silver buyer</p><h2>Sell your silver with confidence.</h2></div>
      <div>
        <p class="answer-lede">Experience, honesty, and service matter when you sell silver.</p>
        <p>AG Refining makes the process simple. We help with small commercial lots and large industrial loads. You see the weight, hear the offer, and choose what happens next.</p>
        <div class="inline-actions">
          <a class="text-link" href="/how-it-works">See how it works ${arrow}</a>
          <a class="text-link" href="/about">Meet the family ${arrow}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section featured-section">
    <div class="shell">
      <div class="section-title-row">
        <div><p class="eyebrow">Materials we buy</p><h2>Start with what you have.</h2></div>
        <p class="section-intro-small">Each page explains what to share, what may qualify, and how pickup works.</p>
      </div>
      <div class="featured-materials-grid">
        ${featuredMaterials.map(([name, path, desktop, mobile, copy], index) => `<a class="featured-material" href="/${path}" data-reveal>
          <picture class="featured-material-image"><source media="(max-width: 700px)" srcset="/assets/${mobile}"><img src="/assets/${desktop}" alt="${name} prepared for review" width="1280" height="819" loading="lazy"></picture>
          <div class="featured-material-copy"><span>${String(index + 1).padStart(2, "0")}</span><h3>${name}</h3><p>${copy}</p><strong>View material ${arrow}</strong></div>
        </a>`).join("")}
      </div>
    </div>
  </section>

  <section class="industrial-feature">
    <div class="industrial-feature-grid">
      <div class="industrial-feature-media">
        <picture class="industrial-feature-picture"><source media="(max-width: 700px)" srcset="/assets/ag-silver-hero-mobile.webp"><img src="/assets/ag-silver-hero-1600.webp" alt="Industrial silver material prepared for pickup and weighing" width="1600" height="900" loading="lazy"></picture>
      </div>
      <div class="industrial-feature-copy" data-reveal>
        <p class="eyebrow">Why businesses choose AG Refining</p>
        <h2>We come to your facility.</h2>
        <p>Qualifying Houston accounts save time and avoid the trouble of moving valuable material before the process is clear.</p>
        <ul class="plain-checks">
          <li>Family-owned, Houston-based company</li>
          <li>Free pickup for qualifying accounts</li>
          <li>On-site weighing you can see</li>
          <li>Honest, market-based pricing</li>
          <li>Fast payment when available</li>
          <li>Commercial and industrial accounts welcome</li>
        </ul>
        <a class="button button-light" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
      </div>
    </div>
  </section>

  <section class="section process-premium">
    <div class="shell">
      <div class="section-title-row">
        <div><p class="eyebrow">A simple process</p><h2>Six steps from silver to cash.</h2></div>
        <p class="section-intro-small">You stay informed from the first call to final payment.</p>
      </div>
      <div class="process process-six" data-reveal>
        <article><span>01</span><h3>Contact us</h3><p>Tell us what silver you have.</p></article>
        <article><span>02</span><h3>Schedule</h3><p>Choose a pickup time that works.</p></article>
        <article><span>03</span><h3>We arrive</h3><p>Our team comes to your location.</p></article>
        <article><span>04</span><h3>We weigh</h3><p>See the material weight on-site.</p></article>
        <article><span>05</span><h3>Get an offer</h3><p>Review clear, market-based pricing.</p></article>
        <article><span>06</span><h3>Get paid</h3><p>Receive fast payment when available.</p></article>
      </div>
      <a class="button button-ghost process-link" href="/how-it-works">See the full process ${arrow}</a>
    </div>
  </section>

  <section class="section related">
    <div class="shell">
      <div class="section-title-row">
        <div><p class="eyebrow">Industries we serve</p><h2>Built for business accounts.</h2></div>
        <p class="section-intro-small">AG Refining works with organizations that create or store silver-bearing material.</p>
      </div>
      <div class="related-grid">
        ${industryPages.slice(0, 6).map((page) => `<a class="related-card" href="/${page.path}"><span>Industry page</span><h3>${page.heading.replace(" in Houston", "")}</h3><p>${page.intro}</p><b>${arrow}</b></a>`).join("")}
      </div>
    </div>
  </section>

  <section class="section service-area-section">
    <div class="shell service-area-layout">
      <div>
        <p class="eyebrow">Serving the Houston Metro Area</p>
        <h2>Local pickup across Southeast Texas.</h2>
        <p>We serve Houston, Pearland, Pasadena, Sugar Land, Katy, Cypress, Spring, The Woodlands, Conroe, Humble, Baytown, League City, Friendswood, Missouri City, Richmond, Rosenberg, Tomball, Bellaire, Deer Park, La Porte, Texas City, Galveston, and nearby communities.</p>
        <a class="button button-dark" href="/service-areas">View service areas ${arrow}</a>
      </div>
      <div class="service-area-links">
        ${locationPages.map((page) => `<a href="/${page.path}">${page.heading.replace(" for commercial accounts.", "")} ${arrow}</a>`).join("")}
      </div>
    </div>
  </section>

  <section class="section legacy-section">
    <div class="shell legacy-editorial">
      <div><p class="legacy-number">Ag</p><p class="legacy-caption">The Stevens family</p></div>
      <div>
        <p class="eyebrow">A family legacy</p>
        <blockquote>“My father taught us the importance of honesty, hard work, and respect.”</blockquote>
        <cite>Dennis Stevens</cite>
        <p>John Stevens built his name by treating customers fairly. Dennis carries that lesson into every silver transaction today.</p>
        <a class="text-link" href="/about">Read the family story ${arrow}</a>
      </div>
    </div>
  </section>

  <section class="section location-section">
    <div class="shell location-grid">
      <div class="location-map"><iframe title="Map of ${street} in Houston, Texas" src="https://www.google.com/maps?q=${encodeURIComponent(`${street}, ${cityLine}`)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
      <div class="location-copy">
        <p class="eyebrow">Contact and location</p>
        <h2>Call before shipping or visiting.</h2>
        <p>We will confirm the material, pickup option, and next step before anything moves.</p>
        <dl>
          <div><dt>Address</dt><dd>${street}<br>${cityLine}</dd></div>
          <div><dt>Phone</dt><dd><a href="tel:${phoneHref}">${phoneDisplay}</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${email}">${email}</a></dd></div>
        </dl>
        <div class="location-actions">
          <a class="button button-dark" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
          <a class="button button-quiet" href="tel:${phoneHref}">Call AG Refining</a>
        </div>
        <p class="location-note">Please call before visiting. Pickup and same-day service depend on the material and schedule.</p>
      </div>
    </div>
  </section>

  <section class="section faq-section">
    <div class="shell faq-grid">
      <div><p class="eyebrow">Common questions</p><h2>Clear answers before pickup.</h2></div>
      ${faqMarkup(homeFaqs)}
    </div>
  </section>

  <section class="cta-band">
    <div class="shell" data-reveal>
      <p class="eyebrow">Ready to sell your silver?</p>
      <h2>Let us come to you.</h2>
      <p>Tell us what you have, how much there is, and where it is located. We will confirm whether the lot qualifies for free pickup.</p>
      <div class="hero-actions hero-actions-center">
        <a class="button button-light" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
        <a class="button button-ghost" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
      </div>
    </div>
  </section>`;

writeFileSync(join(out, "index.html"), document({
  title: "Houston Silver Buyer | Sell Scrap Silver in Houston | AG Refining",
  description: "Sell silver in Houston with AG Refining. Free pickup, on-site weighing, immediate payment, and honest pricing for commercial accounts.",
  content: home,
  bodyClass: "home-page",
  pageSchema: [faqSchema(homeFaqs)]
}));

function servicePage(page) {
  const related = allServicePages.filter((candidate) => candidate.path !== page.path).slice(0, 3);
  const materialByPath = {
    "scrap-silver-jewelry": "scrap_silver",
    "industrial-x-ray-silver-recycling": "xray_film",
    "silver-coin-buyers-houston": "silver_coins",
    "silver-oxide-battery-recycling": "silver_oxide_batteries",
    "medical-x-ray-recycling": "xray_film",
    "silver-scrap-buyer-houston": "scrap_silver",
    "dental-scrap": "dental_material",
    "industrial-silver-scrap": "industrial_silver"
  };
  const materialQuery = materialByPath[page.path] ? `&material=${materialByPath[page.path]}` : "";
  const content = `
    <section class="service-hero">
      <div class="shell">
        ${breadcrumbs([["Home", "/"], [page.eyebrow, null]])}
        <div class="service-hero-grid">
          <div class="service-hero-copy" data-reveal>
            <p class="eyebrow">${page.eyebrow}</p>
            <h1>${page.heading}</h1>
            <p>${page.intro}</p>
            <a class="button button-blue" href="/contact?intent=pickup${materialQuery}">${primaryCta} ${arrow}</a>
          </div>
          <figure class="service-visual"><img src="/assets/${page.image}" alt="${page.imageAlt}" width="1280" height="819" fetchpriority="high"></figure>
        </div>
      </div>
    </section>
    <section class="answer-band">
      <div class="shell answer-grid">
        <p class="answer-index">What to know</p>
        <div><h2>${page.answerHeading}</h2><p>${page.answerText}</p></div>
      </div>
    </section>
    <section class="section detail-section">
      <div class="shell detail-grid">
        <aside class="detail-rail"><p class="eyebrow">Simple next steps</p><h2>Know what happens next.</h2><a class="text-link" href="/how-it-works">See the full process ${arrow}</a></aside>
        <div class="detail-copy">${page.details.map(([heading, text], index) => `<article data-reveal><span>${String(index + 1).padStart(2, "0")}</span><h3>${heading}</h3><p>${text}</p></article>`).join("")}</div>
      </div>
    </section>
    <section class="section faq-section">
      <div class="shell faq-grid"><div><p class="eyebrow">Common questions</p><h2>Answers before pickup.</h2></div>${faqMarkup(page.faqs)}</div>
    </section>
    <section class="section related">
      <div class="shell"><div class="section-title-row"><div><p class="eyebrow">Keep exploring</p><h2>More ways we can help.</h2></div></div>
        <div class="related-grid">${related.map((item) => `<a class="related-card" href="/${item.path}"><span>${item.eyebrow}</span><h3>${item.heading}</h3><p>${item.intro}</p><b>${arrow}</b></a>`).join("")}</div>
      </div>
    </section>
    <section class="cta-band"><div class="shell" data-reveal><p class="eyebrow">Start with the material</p><h2>Schedule a Houston pickup.</h2><p>Tell us what you have and where it is. We will confirm whether the lot qualifies.</p><a class="button button-light" href="/contact?intent=pickup">${primaryCta} ${arrow}</a></div></section>`;
  const dir = join(out, page.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), document({
    title: page.title,
    description: page.description,
    path: page.path,
    content,
    image: page.image,
    pageSchema: [faqSchema(page.faqs)]
  }));
}

allServicePages.forEach(servicePage);

function taxonomyPage({ path, title, description, eyebrow, heading, intro, items }) {
  const cards = items.map((page, index) => `<a class="taxonomy-card" href="/${page.path}" data-reveal>
    <figure class="taxonomy-image"><img src="/assets/${page.image}" alt="" width="1280" height="819" loading="lazy"></figure>
    <div><p class="eyebrow">${String(index + 1).padStart(2, "0")}</p><h3>${page.heading}</h3><p>${page.intro}<b>View page ${arrow}</b></p></div>
  </a>`).join("");
  const content = `
    <section class="page-intro"><div class="shell">${breadcrumbs([["Home", "/"], [eyebrow, null]])}<div class="page-intro-grid"><div><p class="eyebrow">${eyebrow}</p><h1>${heading}</h1></div><p>${intro}</p></div></div></section>
    <section class="section decision-section"><div class="shell"><div class="taxonomy-grid">${cards}</div></div></section>
    <section class="cta-band"><div class="shell"><p class="eyebrow">Not sure?</p><h2>Tell us what you have.</h2><p>We will help you find the right material page and pickup path.</p><a class="button button-light" href="/contact">${primaryCta} ${arrow}</a></div></section>`;
  const dir = join(out, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), document({ title, description, path, content }));
}

taxonomyPage({
  path: "accepted-materials",
  title: "Silver Materials We Buy | AG Refining Houston",
  description: "See the scrap silver, X-ray film, silver oxide batteries, coins, jewelry, dental material, and industrial silver AG Refining reviews.",
  eyebrow: "Materials",
  heading: "Silver materials we buy.",
  intro: "Choose the closest material. Each page explains what to share, what may qualify, and how pickup works.",
  items: materialPages
});

taxonomyPage({
  path: "industries",
  title: "Industries We Serve | Houston Silver Buyer | AG Refining",
  description: "AG Refining serves hospitals, dental labs, oil and gas companies, manufacturers, universities, and electronics companies in Houston.",
  eyebrow: "Industries",
  heading: "Silver service built for business.",
  intro: "Different industries create different silver-bearing material. Start with the page that best matches your operation.",
  items: industryPages
});

taxonomyPage({
  path: "service-areas",
  title: "Houston Metro Silver Pickup Service Areas | AG Refining",
  description: "See AG Refining silver pickup service areas across Houston, Pearland, Pasadena, Sugar Land, Katy, The Woodlands, Conroe, and nearby cities.",
  eyebrow: "Service areas",
  heading: "Silver pickup across the Houston Metro Area.",
  intro: "Free pickup may be available for qualifying commercial and industrial accounts. Choose your closest service area.",
  items: locationPages
});

const howItWorks = `
  <section class="page-intro page-intro-dark"><div class="shell">${breadcrumbs([["Home", "/"], ["How it works", null]])}<div class="page-intro-grid"><div><p class="eyebrow">How it works</p><h1>Six clear steps from silver to cash.</h1></div><p>You know what happens before the material moves.</p></div></div></section>
  <section class="section process-page"><div class="shell"><ol class="process-rail">
    <li><span>01</span><div><h2>Tell us what you have.</h2><p>Call or use the form. Share the material type, amount, condition, location, and whether it is a one-time or repeat lot.</p></div></li>
    <li><span>02</span><div><h2>We review the details.</h2><p>We may ask for markings, weights, photos, box counts, or other simple facts needed to understand the lot.</p></div></li>
    <li><span>03</span><div><h2>Schedule the pickup.</h2><p>If the lot qualifies, we choose a time that works for your facility. Free pickup is available for qualifying Houston Metro commercial accounts.</p></div></li>
    <li><span>04</span><div><h2>We weigh on-site.</h2><p>You can see the material weight before payment. This keeps the process clear.</p></div></li>
    <li><span>05</span><div><h2>Review the offer.</h2><p>The offer depends on the confirmed material, recoverable silver, weight, condition, and current silver market values.</p></div></li>
    <li><span>06</span><div><h2>Get paid.</h2><p>Fast payment is available for qualifying transactions. Timing depends on the material and agreed terms.</p></div></li>
  </ol></div></section>
  <section class="cta-band"><div class="shell"><p class="eyebrow">Start now</p><h2>Schedule a free pickup.</h2><p>Tell us what silver you have and where it is.</p><a class="button button-light" href="/contact?intent=pickup">${primaryCta} ${arrow}</a></div></section>`;
mkdirSync(join(out, "how-it-works"), { recursive: true });
writeFileSync(join(out, "how-it-works", "index.html"), document({
  title: "How to Sell Silver in Houston | AG Refining",
  description: "See the six-step AG Refining process: contact, schedule, pickup, on-site weighing, offer, and fast qualifying payment.",
  path: "how-it-works",
  content: howItWorks
}));

const about = `
  <section class="page-intro"><div class="shell">${breadcrumbs([["Home", "/"], ["Our story", null]])}<div class="page-intro-grid"><div><p class="eyebrow">The Stevens family</p><h1>Built on fairness and hard work.</h1></div><p>AG Refining is a Houston-based family business with a direct promise: treat people fairly and make the silver-selling process clear.</p></div></div></section>
  <section class="section about-story"><div class="shell legacy-editorial"><div><p class="legacy-number">Ag</p><p class="legacy-caption">Silver, atomic number 47</p></div><div><p class="eyebrow">The family story</p><blockquote>“My father taught us the importance of honesty, hard work, and respect.”</blockquote><cite>Dennis Stevens</cite><p>John Stevens built his reputation by working hard and treating customers fairly. Years later, Dennis returned to silver refining after his youngest son asked him to melt a small amount of old silver. The work felt familiar. It also showed him what the family could build next.</p><p>Today, AG Refining helps Houston businesses turn silver-bearing material into cash through clear pickup, weighing, pricing, and payment.</p></div></div></section>
  <section class="cta-band"><div class="shell"><p class="eyebrow">Work with AG Refining</p><h2>Let us earn your business.</h2><p>Start with a clear review of your material.</p><a class="button button-light" href="/contact">${primaryCta} ${arrow}</a></div></section>`;
mkdirSync(join(out, "about"), { recursive: true });
writeFileSync(join(out, "about", "index.html"), document({
  title: "About AG Refining | Houston Family-Owned Silver Buyer",
  description: "Meet the Stevens family and learn how AG Refining brings fairness, hard work, and clear service to Houston silver buying.",
  path: "about",
  content: about
}));

function reviewForm() {
  return `<form id="review-form" class="review-form" data-review-form action="/api/leads" method="post" novalidate>
    <div class="form-errors field-wide" data-form-errors tabindex="-1" hidden></div>
    <input type="hidden" name="intent" value="pickup">
    <input type="hidden" name="form_started" value="">
    <input type="hidden" name="submission_key" value="">
    <div class="field"><label for="name">Name <span>Required</span></label><input id="name" name="name" autocomplete="name" required></div>
    <div class="field"><label for="business">Business</label><input id="business" name="business" autocomplete="organization"></div>
    <div class="field"><label for="phone">Phone <span>Required</span></label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
    <div class="field"><label for="email">Email <span>Required</span></label><input id="email" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="material">Material <span>Required</span></label><select id="material" name="material" required>
      <option value="">Select one</option><option value="scrap_silver">Scrap silver</option><option value="industrial_silver">Industrial silver</option><option value="dental_material">Dental material</option><option value="silver_oxide_batteries">Watch batteries</option><option value="xray_film">X-ray film</option><option value="silver_coins">Silver coins</option><option value="unknown">Not sure</option>
    </select></div>
    <div class="field"><label for="quantity">Approximate amount</label><input id="quantity" name="quantity" maxlength="120" placeholder="Weight, boxes, drums, or pallets"></div>
    <div class="field"><label for="location">Pickup location <span>Required</span></label><input id="location" name="location" maxlength="180" placeholder="City or business address" required></div>
    <div class="field"><label for="frequency">How often?</label><select id="frequency" name="frequency"><option value="one_time">One-time lot</option><option value="recurring">Recurring material</option><option value="unknown">Not sure</option></select></div>
    <div class="field field-wide"><label for="details">What should we know? <span>Required</span></label><textarea id="details" name="details" required minlength="20" placeholder="Describe the material, condition, source, and anything that may affect pickup."></textarea></div>
    <fieldset class="field field-wide preferred-contact"><legend>Preferred contact</legend><label><input type="radio" name="preferred_contact" value="phone" checked> Phone</label><label><input type="radio" name="preferred_contact" value="email"> Email</label></fieldset>
    <div class="honeypot" aria-hidden="true"><label for="company_url">Company website</label><input id="company_url" name="company_url" tabindex="-1" autocomplete="off"></div>
    <p class="form-note field-wide">This request is not a final quote or pickup promise. Free pickup and fast payment depend on the material, location, account type, and schedule. Do not send patient records, passwords, financial data, or identity documents. See our <a href="/privacy">privacy notice</a>.</p>
    <div class="form-actions field-wide"><button class="button button-blue" type="submit" data-submit-button>Send pickup request ${arrow}</button><p class="form-status" data-form-status aria-live="polite"></p></div>
  </form>`;
}

const contact = `
  <section class="page-intro page-intro-contact"><div class="shell">${breadcrumbs([["Home", "/"], ["Contact", null]])}<div class="page-intro-grid"><div><p class="eyebrow">Schedule pickup</p><h1>Tell us what silver you have.</h1></div><p>Share the material, amount, and location. We will confirm whether it qualifies and explain the next step.</p></div></div></section>
  <section class="section contact-section"><div class="shell contact-grid">
    <aside class="contact-aside"><p class="eyebrow">Contact AG Refining</p><h2>Prefer to talk first?</h2>
      <a class="contact-line" href="tel:${phoneHref}"><span>Phone</span><strong>${phoneDisplay}</strong></a>
      <a class="contact-line" href="mailto:${email}"><span>Email</span><strong>${email}</strong></a>
      <div class="contact-line"><span>Address</span><strong>${street}<br>${cityLine}</strong></div>
      <div class="contact-boundary"><h3>Before you ship or visit</h3><p>Call first. We will confirm the material, pickup option, and next step.</p></div>
    </aside>
    <div><p class="eyebrow">Pickup and quote request</p><h2>Start with a few details.</h2>${reviewForm()}</div>
  </div></section>`;
mkdirSync(join(out, "contact"), { recursive: true });
writeFileSync(join(out, "contact", "index.html"), document({
  title: "Schedule Silver Pickup in Houston | Contact AG Refining",
  description: "Schedule a qualifying silver pickup or request a quote from AG Refining in Houston. Share your material, amount, and location.",
  path: "contact",
  content: contact
}));

const spanish = `
  <section class="page-intro"><div class="shell">${breadcrumbs([["Inicio", "/"], ["Español", null]])}<div class="page-intro-grid"><div><p class="eyebrow">Servicio en español</p><h1>Venda su plata en Houston.</h1></div><p>AG Refining ofrece recogida gratis para cuentas comerciales que califican, pesaje en su local y precios claros.</p></div></div></section>
  <section class="section"><div class="shell spanish-materials">
    <article><h3>Recogida</h3><p>Cuéntenos qué material tiene, cuánto pesa y dónde está. Confirmaremos si la recogida califica.</p></article>
    <article><h3>Pesaje</h3><p>Pesamos el material en su presencia para que pueda ver el peso antes del pago.</p></article>
    <article><h3>Pago</h3><p>El pago rápido está disponible para transacciones que califican. El tiempo depende del material y los términos acordados.</p></article>
    <article><h3>Llame primero</h3><p>No envíe material ni visite sin confirmar el siguiente paso. Llame al ${phoneDisplay}.</p></article>
  </div></section>
  <section class="cta-band"><div class="shell"><p class="eyebrow">Comience hoy</p><h2>Solicite una recogida.</h2><a class="button button-light" href="/contact">Enviar solicitud ${arrow}</a></div></section>`;
mkdirSync(join(out, "espanol"), { recursive: true });
writeFileSync(join(out, "espanol", "index.html"), document({
  title: "Comprador de Plata en Houston | AG Refining",
  description: "Venda plata en Houston con AG Refining. Recogida gratis para cuentas que califican, pesaje en su local y precios claros.",
  path: "espanol",
  lang: "es",
  content: spanish
}));

const privacy = `
  <section class="page-intro"><div class="shell">${breadcrumbs([["Home", "/"], ["Privacy", null]])}<div class="page-intro-grid"><div><p class="eyebrow">Privacy</p><h1>How we handle website requests.</h1></div><p>This page explains the information collected through the AG Refining website.</p></div></div></section>
  <section class="section"><div class="shell legal-grid"><nav><a href="#collect">What we collect</a><a href="#use">How we use it</a><a href="#avoid">What not to send</a><a href="#contact-privacy">Contact</a></nav><div>
    <section id="collect"><h2>What we collect</h2><p>The pickup form asks for your name, business, phone, email, material, amount, location, preferred contact method, and details you choose to provide. Basic website attribution may also be stored to understand how you found the site.</p></section>
    <section id="use"><h2>How we use it</h2><p>AG Refining uses the information to review your request, contact you, plan a possible pickup, and improve the website. We do not promise a quote or pickup from a form submission alone.</p></section>
    <section id="avoid"><h2>What not to send</h2><p>Do not send patient records, passwords, financial account data, identity documents, controlled records, or other sensitive information through the public form.</p></section>
    <section id="contact-privacy"><h2>Contact</h2><p>Questions can be sent to <a href="mailto:${email}">${email}</a> or discussed by phone at <a href="tel:${phoneHref}">${phoneDisplay}</a>.</p></section>
  </div></div></section>`;
mkdirSync(join(out, "privacy"), { recursive: true });
writeFileSync(join(out, "privacy", "index.html"), document({
  title: "Privacy | AG Refining",
  description: "Learn what information the AG Refining website collects and how pickup and quote requests are handled.",
  path: "privacy",
  content: privacy
}));

writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);

const staticPaths = ["", "accepted-materials", "industries", "service-areas", "how-it-works", "about", "contact", "espanol", "privacy"];
const sitemapPaths = [...staticPaths, ...allServicePages.map((page) => page.path)];
const sitemapUrls = sitemapPaths.map((path) => `<url><loc>${siteUrl}/${path}</loc><lastmod>2026-07-30</lastmod></url>`).join("");
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls}</urlset>`);

writeFileSync(join(out, "404.html"), document({
  title: "Page Not Found | AG Refining",
  description: "The requested AG Refining page could not be found.",
  path: "404",
  robots: "noindex,follow",
  content: `<section class="page-intro"><div class="shell"><p class="eyebrow">404</p><h1>That page is not here.</h1><p>View the materials we buy or schedule a pickup.</p><p><a class="button button-dark" href="/accepted-materials">View materials ${arrow}</a></p></div></section>`
}));

console.log(`Built ${sitemapPaths.length} public pages in dist`);
