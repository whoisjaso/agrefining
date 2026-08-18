import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = "https://agrefining.vercel.app/assets";
const manifest = {
  "ag-silver-hero-1600.webp": "5de10c956fa5d3e26e9f24bf649e0d436dc7468f3f00113f64428bf86d8714b1",
  "ag-silver-hero-mobile.webp": "7d36b772dfed15ce32afaa57dfefe20591b84c2ed561185a331fc497cf0c17db",
  "material-dental-1280.webp": "81407c57c181c2e305af01daca6e386c2436e9cbbd8ee376a0efdaf869b2eef2",
  "material-dental-800.webp": "9db27e34c7e9eabcd65a31f9816ff6b92bd831ad629644c3e9a19e94ada859f8",
  "material-scrap-silver-1280.webp": "a6a544efee973c87602dac4ce21a40d1f8f7a7d11f27bab9a7fd44701a940530",
  "material-scrap-silver-800.webp": "c670dd54dc58494c42e72a1eea0b3fdc4095261611cfa09c5eb311695f798c44",
  "material-watch-batteries-1280.webp": "12e2f40749861d7324e960b9af9ed3feabf0f190f0d6a39b949d4b6ad3592724",
  "material-watch-batteries-800.webp": "cc78aefdd6b1f6c6fa3139f4ecf5b3b79ab8fd82648b7c2e01f0f47950dad97d",
  "material-xray-film-1280.webp": "cdefb82a03790190dc886bdfe3c725c314dc074a6235073771fbcd0aab813ae9",
  "material-xray-film-800.webp": "3208ec921a46f4515eb44487a1e564a40ad31e942ef1a3bba31ef88b68c18c17",
  "fonts/newsreader-latin-opsz.woff2": "6e4f2958c3a7c4a80acde4e5a679abe7e01bc1e30b92be3c7a8b696ef401d101",
  "fonts/manrope-latin-wght.woff2": "6e4f2958c3a7c4a80acde4e5a679abe7e01bc1e30b92be3c7a8b696ef401d101"
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
