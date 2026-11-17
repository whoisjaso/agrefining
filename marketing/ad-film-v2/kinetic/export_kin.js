const { chromium } = require("/home/user/agrefining/node_modules/playwright-core");
const path = require("path"), fs = require("fs");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--font-render-hinting=none", "--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1400, height: 2000 }, deviceScaleFactor: 2 });
  await p.goto("file://" + path.resolve(__dirname, "assets.html")); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  fs.mkdirSync("assets/kin", { recursive: true });
  // the brand line: AG in 800, Refining in 400, like the wordmark
  await p.evaluate(() => { const cs = document.querySelectorAll("#k_brand .c"); cs.forEach((c, i) => c.style.fontWeight = i < 2 ? 800 : 400); });
  const man = {};
  for (const el of await p.$$(".kl")) {
    const id = await el.getAttribute("id");
    const cs = await el.$$(".c");
    // measure every box in one pass, in page coordinates, before any screenshot scrolls the page
    const boxes = await el.evaluate((e) => { const r = e.getBoundingClientRect(); return [[r.x, r.y, r.width, r.height]].concat([...e.querySelectorAll(".c")].map((c) => { const q = c.getBoundingClientRect(); return [q.x, q.y, q.width, q.height]; })); });
    const lb = { x: boxes[0][0], y: boxes[0][1], width: boxes[0][2], height: boxes[0][3] };
    const chars = [];
    for (let i = 0; i < cs.length; i++) {
      const q = boxes[i + 1], bb = { x: q[0], y: q[1], width: q[2], height: q[3] }; const f = `kin/${id}_${i}.png`;
      await p.evaluate((e) => { document.querySelectorAll(".kl .c").forEach((c) => c.style.visibility = "hidden"); e.style.visibility = "visible"; }, cs[i]);
      await cs[i].screenshot({ path: "assets/" + f, omitBackground: true });
      chars.push({ f, t: await cs[i].innerText(), cx: bb.x + bb.width / 2 - (lb.x + lb.width / 2), cy: bb.y + bb.height / 2 - (lb.y + lb.height / 2), w: bb.width, h: bb.height });
    }
    await p.evaluate(() => document.querySelectorAll(".kl .c").forEach((c) => c.style.visibility = "visible"));
    man[id] = { w: lb.width, h: lb.height, chars };
  }
  fs.writeFileSync("kin.json", JSON.stringify(man, null, 1)); console.log(Object.keys(man).map((k) => k + ":" + man[k].chars.length).join(" "));
  await b.close();
})();
