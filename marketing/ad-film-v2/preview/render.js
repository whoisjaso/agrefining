// node render.js OUTDIR FPS WORKERS: every frame of film.html, deterministic seek(t)
const { chromium } = require("/home/user/agrefining/node_modules/playwright-core");
const path = require("path"), fs = require("fs");
const [, , out, FPS = "60", W = "3"] = process.argv; fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const N = Math.round(15 * +FPS), todo = [];
  for (let i = 0; i < N; i++) if (!fs.existsSync(path.join(out, `f${String(i).padStart(4, "0")}.jpg`))) todo.push(i);
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(Array.from({ length: +W }, async (_, wi) => { await new Promise((r) => setTimeout(r, wi * 8000));
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    p.on("pageerror", (e) => console.log("pageerror:", e.message));
    await p.goto("http://127.0.0.1:8471/film.html", { timeout: 180000 }); await p.evaluate(() => window.READY);
    while (next < todo.length) { const i = todo[next++]; await p.evaluate((t) => seek(t), i / +FPS); await p.screenshot({ path: path.join(out, `f${String(i).padStart(4, "0")}.jpg`), type: "jpeg", quality: 95 }); if (++done % 50 === 0) console.log(done, "/", todo.length, ((Date.now() - t0) / done / 1000).toFixed(2), "s/frame"); }
  }));
  await b.close(); console.log("done");
})();
