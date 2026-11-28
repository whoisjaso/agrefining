const { chromium } = require("/home/user/agrefining/node_modules/playwright-core");
const path = require("path"), fs = require("fs");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1400, height: 1800 }, deviceScaleFactor: 4 });
  await p.goto("file://" + path.resolve(__dirname, "assets.html")); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  fs.mkdirSync("png", { recursive: true }); const man = {};
  for (const el of await p.$$(".ln")) {
    const id = await el.getAttribute("id");
    const boxes = await el.evaluate((e) => { const r = e.getBoundingClientRect(); return [[r.x, r.y, r.width, r.height]].concat([...e.querySelectorAll(".u")].map((c) => { const q = c.getBoundingClientRect(); return [q.x, q.y, q.width, q.height, c.textContent]; })); });
    const L = boxes[0]; const units = []; const us = await el.$$(".u");
    for (let i = 0; i < us.length; i++) {
      const q = boxes[i + 1];
      await p.evaluate((x) => { document.querySelectorAll(".u").forEach((c) => c.style.visibility = "hidden"); x.style.visibility = "visible"; }, us[i]);
      const f = `png/${id}_${i}.png`; await us[i].screenshot({ path: f, omitBackground: true });
      units.push({ f, t: q[4], cx: q[0] + q[2] / 2 - (L[0] + L[2] / 2), cy: q[1] + q[3] / 2 - (L[1] + L[3] / 2), w: q[2], h: q[3] });
    }
    await p.evaluate(() => document.querySelectorAll(".u").forEach((c) => c.style.visibility = "visible"));
    man[id] = { w: L[2] - 120, h: L[3] - 80, units };
  }
  for (const el of await p.$$(".ob")) { const id = await el.getAttribute("id"); await el.screenshot({ path: `png/${id}.png`, omitBackground: true }); }
  fs.writeFileSync("manifest.json", JSON.stringify(man, null, 1));
  console.log(Object.entries(man).map(([k, v]) => `${k}:${Math.round(v.w)}`).join(" "));
  await b.close();
})();
