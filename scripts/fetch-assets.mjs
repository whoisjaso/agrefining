import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = "https://agrefining-9ot1qdivq-whoisjasos-projects.vercel.app/assets";
const manifest = {
  "ag-silver-hero-1600.webp": "f0dd368191d0aa662e5edd61948d5b59a1a1da59ad08cc7b325c65ce924f0b37",
  "ag-silver-hero-mobile.webp": "07e416764613a6f5cd7bf9e06eee0d695955e7cb81c7411128ebf286ffbdec87",
  "material-dental-1280.webp": "14a7893a0ecb9d6069f30f269d62da734c29a184768a7e4113dac4139a8ae585",
  "material-dental-mobile.webp": "43e7e53576128b11cba48401163eeb79575befb9766c91e22c4584b2bf1721af",
  "material-scrap-silver-1280.webp": "f87b60c18bd88aeafa0da8b047955796bb4a57c62d10205f39d04740e4224829",
  "material-scrap-silver-mobile.webp": "b0aa0c022dab674f56fb5ac5ed7aeb2b9a9d7d44f245f448cc221c8dd373e267",
  "material-watch-batteries-1280.webp": "b8c741dedce0714901b7956e3f01a111cae74d1ccf63cbce1feca6de78cf683f",
  "material-watch-batteries-mobile.webp": "fdcb2032da4c3cee774443d16770ebac5071d4fba7504d7067cbfbeeede01f2c",
  "material-xray-film-1280.webp": "5135a911178ed0788cedb8290deb4e53bf11fc6fd971d5c76e6ac726b72cfc53",
  "material-xray-film-mobile.webp": "daf62e7ea35aff27b83a87173e278de4475e5228bd3901ab825433478dbbb4d3",
  "fonts/newsreader-latin-opsz.woff2": "6e4f2958c3a7c4a80acde4e5a679abe7e01bc1e30b92be3c7a8b696ef401d101",
  "fonts/manrope-latin-wght.woff2": "a30ddcd349703aff7464c34bef3fffdff405ee50c113440d7c8693c02d210972"
};

function hash(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

for (const [name, expectedHash] of Object.entries(manifest)) {
  const target = join(root, "assets", name);
  if (existsSync(target) && hash(readFileSync(target)) === expectedHash) continue;

  const response = await fetch(`${source}/${name}`);
  if (!response.ok) {
    throw new Error(`Could not retrieve required asset ${name} (${response.status})`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (hash(bytes) !== expectedHash) {
    throw new Error(`Integrity check failed for ${name}`);
  }

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, bytes);
}

console.log(`Verified ${Object.keys(manifest).length} production assets`);
