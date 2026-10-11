// Publishes the Buy Desk counter app to dist/desk. Imported at the end of scripts/build.mjs.
// Modules are authored as .mjs (so Node tests can import them) and published as .js,
// which every static host serves with a JavaScript MIME type.
import { cpSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "dist", "desk");

mkdirSync(join(out, "vendor"), { recursive: true });
cpSync(join(root, "src", "desk"), out, { recursive: true });
for (const name of readdirSync(out).filter((file) => file.endsWith(".mjs"))) {
  renameSync(join(out, name), join(out, name.replace(/\.mjs$/, ".js")));
}
for (const name of readdirSync(out).filter((file) => file.endsWith(".js"))) {
  const path = join(out, name);
  writeFileSync(path, readFileSync(path, "utf8").replace(/(from\s+"\.\/[\w-]+)\.mjs"/g, '$1.js"'));
}
cpSync(join(root, "node_modules", "jspdf", "dist", "jspdf.umd.min.js"), join(out, "vendor", "jspdf.umd.min.js"));
cpSync(join(root, "node_modules", "jspdf", "LICENSE"), join(out, "vendor", "jspdf.LICENSE.txt"));
console.log("Built Buy Desk in dist/desk");
