// node stills.js "t1,t2,..." OUTDIR : renders film.html stills via a local http server (module imports need http)
const { chromium } = require("/home/user/agrefining/node_modules/playwright-core");
const path = require("path"), fs = require("fs");
const [, , times, out] = process.argv; fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on("console", (m) => console.log("console:", m.text())); p.on("pageerror", (e) => console.log("pageerror:", e.message));
  await p.goto("http://127.0.0.1:8471/" + (process.env.HTML || "film.html")); await p.evaluate(() => window.READY);
  for (const t of times.split(",").map(Number)) { const t0 = Date.now(); await p.evaluate((t) => seek(t), t); await p.screenshot({ path: path.join(out, `t${t.toFixed(2)}.jpg`), type: "jpeg", quality: 88 }); console.log(t, Date.now() - t0, "ms"); }
  await b.close();
})();
