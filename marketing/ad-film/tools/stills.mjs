import { chromium } from "/home/user/agrefining/node_modules/playwright-core/index.mjs";
import { mkdirSync } from "node:fs";
const [, , out, ...frames] = process.argv; mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; page.on("pageerror", (e) => errs.push(e.message)); page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("file://" + process.cwd() + "/" + (process.env.HTML || "ag.html"));
await page.evaluate(() => document.fonts.ready); await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => 0))));
await page.evaluate(() => window.ready());
for (const f of frames) { await page.evaluate((t) => seek(t), +f / 60); await page.screenshot({ path: `${out}/f${String(f).padStart(4, "0")}.png` }); }
console.log("errors:", errs); await browser.close();
