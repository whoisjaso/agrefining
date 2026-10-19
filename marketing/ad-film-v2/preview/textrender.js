const { chromium } = require("/home/user/agrefining/node_modules/playwright-core");
const path = require("path"), fs = require("fs"); const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on("pageerror", (e) => console.log("pageerror", e.message));
  await p.goto("http://127.0.0.1:8471/textlayer.html"); await p.evaluate(() => window.READY);
  for (let f = 1; f <= 360; f++) { await p.evaluate((t) => seek(t), (f - 1) / 24); await p.screenshot({ path: path.join(out, `t${String(f).padStart(4, "0")}.png`), omitBackground: true }); }
  await b.close(); console.log("text done");
})();
