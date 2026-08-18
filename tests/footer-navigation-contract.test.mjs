import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const css = readFileSync(join(dist, "style.css"), "utf8");

const serviceAreaLinks = [
  ["Houston", "/houston-silver-buyer"],
  ["Pearland", "/silver-buyer-pearland"],
  ["Pasadena", "/silver-buyer-pasadena"],
  ["Sugar Land", "/silver-buyer-sugar-land"],
  ["Katy", "/silver-buyer-katy"],
  ["Cypress", "/silver-buyer-katy"],
  ["Spring", "/silver-buyer-the-woodlands"],
  ["The Woodlands", "/silver-buyer-the-woodlands"],
  ["Conroe", "/silver-buyer-conroe"],
  ["Humble", "/houston-silver-buyer"],
  ["Baytown", "/silver-buyer-pasadena"],
  ["League City", "/silver-buyer-pearland"],
  ["Friendswood", "/silver-buyer-pearland"],
  ["Missouri City", "/silver-buyer-sugar-land"],
  ["Richmond", "/silver-buyer-sugar-land"],
  ["Rosenberg", "/silver-buyer-sugar-land"],
  ["Tomball", "/silver-buyer-the-woodlands"],
  ["Bellaire", "/houston-silver-buyer"],
  ["Deer Park", "/silver-buyer-pasadena"],
  ["La Porte", "/silver-buyer-pasadena"],
  ["Texas City", "/silver-buyer-pearland"],
  ["Galveston", "/silver-buyer-pearland"],
  ["Stafford", "/silver-buyer-sugar-land"]
];

const footerGroups = [
  ["Materials", [
    ["All Materials", "/accepted-materials"],
    ["Silver Oxide Watch Batteries", "/silver-oxide-watch-battery-recycling-houston"],
    ["Scrap Silver", "/scrap-silver-buyer-houston"],
    ["Scrap Silver Jewelry", "/scrap-silver-jewelry"],
    ["Silver Coins", "/sell-silver-coins-houston"],
    ["Silver Bars", "/sell-silver-bars-houston"],
    ["Sterling and Flatware", "/silver-flatware-buyer-houston"],
    ["Silver-Plated Materials", "/silver-plated-materials-buyer-houston"],
    ["Industrial Silver", "/industrial-silver-scrap"],
    ["Electronics Silver Recovery", "/electronics-silver-recovery"],
    ["Silver Flake", "/silver-flake-buyer-houston"],
    ["Silver Solder", "/silver-solder-buyer-houston"],
    ["Laboratory Silver", "/laboratory-silver-buyer-houston"],
    ["Industrial NDT Film", "/industrial-x-ray-silver-recycling"],
    ["Medical X-Ray Film", "/medical-x-ray-recycling"],
    ["Dental Scrap", "/dental-scrap-buyer-houston"],
    ["X-Ray Recycling Services", "/x-ray-recycling-services-houston"],
    ["Jewelry-Store Silver Recycling", "/jewelry-store-silver-recycling-houston"]
  ]],
  ["Industries", [
    ["All Industries", "/industries"],
    ["Hospital Silver Recycling", "/hospital-silver-recycling"],
    ["Dental Lab Silver Recycling", "/dental-lab-silver-recycling"],
    ["Oil and Gas Silver Recovery", "/oil-gas-silver-recovery"],
    ["Manufacturing Silver Recovery", "/manufacturing-silver-recovery"],
    ["University Silver Recycling", "/university-silver-recycling"]
  ]],
  ["Service Areas", [
    ["All Service Areas", "/service-areas"],
    ...serviceAreaLinks
  ]],
  ["Company and Contact", [
    ["Our Story", "/about"],
    ["How It Works", "/how-it-works"],
    ["Contact AG Refining", "/contact"],
    ["Schedule a Free Pickup", "/contact?intent=pickup"],
    ["(281) 898-2719", "tel:+12818982719"],
    ["dennis@agrefining.com", "mailto:dennis@agrefining.com"],
    ["Privacy", "/privacy"]
  ]]
];

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function textContent(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function footerOf(html) {
  return html.match(/<footer class="footer"[\s\S]*?<\/footer>/)?.[0] || "";
}

function anchorsOf(html) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attributes, contents]) => ({
    href: attributes.match(/\bhref="([^"]+)"/)?.[1] || "",
    text: textContent(contents)
  }));
}

const documents = walk(dist)
  .filter((path) => path.endsWith(".html"))
  .sort()
  .map((path) => [relative(dist, path), readFileSync(path, "utf8")]);
const englishDocuments = documents.filter(([, html]) => /<html lang="en">/.test(html));
const expectedLinks = [["AG Refining", "/"], ...footerGroups.flatMap(([, links]) => links)];

test("every English footer exposes the exhaustive canonical destination inventory exactly once", () => {
  for (const [name, html] of englishDocuments) {
    const footer = footerOf(html);
    assert.ok(footer, `${name}: missing footer`);
    assert.deepEqual(anchorsOf(footer).map(({ href }) => href), expectedLinks.map(([, href]) => href), `${name}: footer routes changed`);
    assert.deepEqual(anchorsOf(footer).map(({ text }) => text), expectedLinks.map(([label]) => label), `${name}: footer labels changed`);
  }
});

test("footer columns are collapsed native disclosures with accessible navigation labels", () => {
  const home = readFileSync(join(dist, "index.html"), "utf8");
  const footer = footerOf(home);
  const groups = [...footer.matchAll(/<details class="footer-group">([\s\S]*?)<\/details>/g)].map((match) => match[1]);
  assert.equal(groups.length, footerGroups.length);
  assert.doesNotMatch(footer, /<details class="footer-group"\s+open>/);

  for (const [index, [label, expected]] of footerGroups.entries()) {
    const group = groups[index];
    assert.match(group, new RegExp(`<summary>${label.replace(" and ", " (?:and|&amp;) ")}<\\/summary>`));
    assert.match(group, new RegExp(`<nav\\b[^>]*aria-label="Footer ${label}"[^>]*>`));
    assert.deepEqual(anchorsOf(group).map(({ href }) => href), expected.map(([, href]) => href));
  }
});

test("responsive footer styles keep desktop columns and mobile disclosure targets", () => {
  assert.match(css, /\.footer-navigation\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(4,/s);
  assert.match(css, /\.footer-group\s*>\s*\.footer-links\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.footer-navigation\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.footer-group:not\(\[open\]\)\s*>\s*\.footer-links\s*\{[^}]*display:\s*none/s);
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.footer-group\s*>\s*summary\s*\{[^}]*min-height:\s*44px/s);
});

test("Spanish footer preserves localized contact actions and identifies English route links", () => {
  const spanish = readFileSync(join(dist, "espanol", "index.html"), "utf8");
  const footer = footerOf(spanish);
  assert.deepEqual(anchorsOf(footer).map(({ text }) => text), [
    "AG Refining",
    "Todos los Materiales en ingles",
    "Baterías de Reloj de Óxido de Plata en ingles",
    "Plata para Reciclaje en ingles",
    "Recortes de Joyería de Plata en ingles",
    "Monedas de Plata en ingles",
    "Barras de Plata en ingles",
    "Plata de Ley y Cubiertos en ingles",
    "Materiales Plateados en ingles",
    "Plata Industrial en ingles",
    "Recuperación de Plata de Electrónica en ingles",
    "Escamas de Plata en ingles",
    "Soldadura de Plata en ingles",
    "Plata de Laboratorio en ingles",
    "Película Industrial NDT en ingles",
    "Película Médica de Rayos X en ingles",
    "Material Dental en ingles",
    "Servicios de Reciclaje de Rayos X en ingles",
    "Reciclaje de Plata para Joyerías en ingles",
    "Todas las Industrias en ingles",
    "Reciclaje de Plata para Hospitales en ingles",
    "Reciclaje de Plata para Laboratorios Dentales en ingles",
    "Recuperación de Plata de Petróleo y Gas en ingles",
    "Recuperación de Plata para Manufactura en ingles",
    "Reciclaje de Plata para Universidades en ingles",
    "Todas las Áreas de Servicio en ingles",
    "Houston en ingles",
    "Pearland en ingles",
    "Pasadena en ingles",
    "Sugar Land en ingles",
    "Katy en ingles",
    "Cypress en ingles",
    "Spring en ingles",
    "The Woodlands en ingles",
    "Conroe en ingles",
    "Humble en ingles",
    "Baytown en ingles",
    "League City en ingles",
    "Friendswood en ingles",
    "Missouri City en ingles",
    "Richmond en ingles",
    "Rosenberg en ingles",
    "Tomball en ingles",
    "Bellaire en ingles",
    "Deer Park en ingles",
    "La Porte en ingles",
    "Texas City en ingles",
    "Galveston en ingles",
    "Stafford en ingles",
    "Nuestra historia en ingles",
    "Cómo funciona en ingles",
    "Contacto AG Refining en ingles",
    "Programar Una Recogida Gratis",
    "(281) 898-2719",
    "dennis@agrefining.com",
    "Privacidad en ingles"
  ]);
  assert.deepEqual(
    [...footer.matchAll(/<nav\b[^>]*aria-label="([^"]+)"/g)].map((match) => match[1]),
    [
      "Navegación del pie de página: Materiales",
      "Navegación del pie de página: Industrias",
      "Navegación del pie de página: Áreas de Servicio",
      "Navegación del pie de página: Empresa y Contacto"
    ]
  );
  assert.match(footer, />Programar Una Recogida Gratis<\/a>/);
  assert.match(footer, /href="#solicitud"/);
  assert.doesNotMatch(footer, /href="\/contact\?intent=pickup"/);
  for (const anchor of footer.matchAll(/<a\b([^>]*)>/g)) {
    const attributes = anchor[1];
    const href = attributes.match(/\bhref="([^"]+)"/)?.[1] || "";
    if (href.startsWith("/") && href !== "/espanol") {
      assert.match(attributes, /\bhreflang="en"/, `${href} must identify its English destination`);
    }
  }
});
