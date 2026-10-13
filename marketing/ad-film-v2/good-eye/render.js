// node render.js stills OUT t1 t2 ... | node render.js full OUT [workers]   (60 fps x 4 subframes, 180° shutter)
const { chromium } = require("/home/user/agrefining/node_modules/playwright-core");
const path = require("path"), fs = require("fs");
const [, , mode, out, ...rest] = process.argv; fs.mkdirSync(out, { recursive: true });
const FPS = 60, SUB = 4, SHUTTER = 0.5;
(async () => {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
  const open = async () => { const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } }); p.on("pageerror", (e) => console.log("pageerror", e.message));
    await p.goto("file://" + path.resolve(__dirname, "piece.html")); await p.evaluate(() => window.READY); return p; };
  if (mode === "stills") { const p = await open(); for (const t of rest.map(Number)) { await p.evaluate((t) => seek(t), t); await p.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(5, "0")}.jpg`), type: "jpeg", quality: 85 }); } }
  else {
    const LEN = 18.6, N = Math.round(LEN * FPS) * SUB, W = +(rest[0] || 4);
    const pages = await Promise.all(Array.from({ length: W }, open)); let next = 0;
    await Promise.all(pages.map(async (p) => { while (true) { const i = next++; if (i >= N) break;
      const k = Math.floor(i / SUB), j = i % SUB, t = k / FPS + ((j + 0.5) / SUB - 0.5) * (SHUTTER / FPS);
      const f = path.join(out, `s${String(i).padStart(5, "0")}.jpg`); if (fs.existsSync(f)) continue;
      await p.evaluate((t) => seek(t), Math.max(0, t)); await p.screenshot({ path: f, type: "jpeg", quality: 96 }); if (i % 600 === 0) console.log(i, "/", N); } }));
  }
  await browser.close(); console.log("done");
})();
