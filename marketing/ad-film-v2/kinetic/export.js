const { chromium } = require("/home/user/agrefining/node_modules/playwright-core");
const path = require("path"), fs = require("fs");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 2 });
  await p.goto("file://" + path.resolve(__dirname, "assets.html")); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  fs.mkdirSync("assets", { recursive: true });
  const ids = await p.$$eval(".a", (els) => els.map((e) => e.id));
  for (const id of ids) { const el = await p.$("#" + id); await el.screenshot({ path: `assets/${id}.png`, omitBackground: true }); }
  console.log(ids.length); await b.close();
})();
