// Publishes the owner dashboard to dist/admin. Imported at the end of scripts/build.mjs,
// after the Buy Desk, because the dashboard loads the desk's shared modules from /desk.
// Modules are authored as .mjs (so Node tests can import them) and published as .js.
import { cpSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "dist", "admin");

cpSync(join(root, "src", "admin"), out, { recursive: true });
for (const name of readdirSync(out).filter((file) => file.endsWith(".mjs"))) {
  renameSync(join(out, name), join(out, name.replace(/\.mjs$/, ".js")));
}
for (const name of readdirSync(out).filter((file) => file.endsWith(".js"))) {
  const path = join(out, name);
  writeFileSync(path, readFileSync(path, "utf8")
    .replace(/(from\s+")\.\.\/desk\/([\w-]+)\.mjs"/g, '$1/desk/$2.js"')
    .replace(/(from\s+"\.\/[\w-]+)\.mjs"/g, '$1.js"'));
}
console.log("Built owner dashboard in dist/admin");
