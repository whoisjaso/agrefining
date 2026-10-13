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
// QR codes for the review card: qrcode-generator (MIT, pinned in package.json), served as .js
// so every static host sends a JavaScript MIME type for the module.
const qrPackage = JSON.parse(readFileSync(join(root, "node_modules", "qrcode-generator", "package.json"), "utf8"));
cpSync(join(root, "node_modules", "qrcode-generator", "dist", "qrcode.mjs"), join(out, "vendor", "qrcode.js"));
writeFileSync(join(out, "vendor", "qrcode.LICENSE.txt"), `qrcode-generator ${qrPackage.version}
https://github.com/kazuhikoarase/qrcode-generator

The MIT License (MIT)

Copyright (c) 2009 Kazuhiko Arase

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

The word "QR Code" is a registered trademark of DENSO WAVE INCORPORATED.
`);
console.log("Built Buy Desk in dist/desk");
