import assert from "node:assert/strict";
import { chmodSync, createReadStream, createWriteStream, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, relative, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { createBrotliDecompress } from "node:zlib";
import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";
import tar from "tar-fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const chromiumRoot = "/tmp/agrefining-site-chrome-chromium-149";
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"]
]);

function requestFile(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://127.0.0.1").pathname);
  const localPath = normalize(pathname).replace(/^[/\\]+/, "");
  let candidate = join(dist, localPath || "index.html");
  const local = relative(dist, candidate);
  if (local === ".." || local.startsWith(`..${sep}`) || local.includes(`${sep}..${sep}`)) return null;
  if (existsSync(candidate) && statSync(candidate).isDirectory()) candidate = join(candidate, "index.html");
  return existsSync(candidate) && statSync(candidate).isFile() ? candidate : null;
}

function staticServer() {
  return createServer((request, response) => {
    const file = requestFile(request.url ?? "/");
    if (!file) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": mimeTypes.get(extname(file)) ?? "application/octet-stream"
    });
    createReadStream(file).pipe(response);
  });
}

async function extractTarBrotli(archive, output, marker) {
  if (existsSync(marker)) return;
  mkdirSync(output, { recursive: true });
  await pipeline(
    createReadStream(archive),
    createBrotliDecompress(),
    tar.extract(output, { chown: false })
  );
  writeFileSync(marker, "complete\n");
}

async function chromiumExecutable() {
  const binary = join(chromiumRoot, "chromium");
  const packageBin = join(root, "node_modules", "@sparticuz", "chromium", "bin");
  const fontConfigRoot = join(chromiumRoot, "fontconfig");
  const fontConfigFile = join(fontConfigRoot, "fonts.conf");
  mkdirSync(chromiumRoot, { recursive: true });
  if (!existsSync(binary) || statSync(binary).size < 10_000_000) {
    await pipeline(
      createReadStream(join(packageBin, "chromium.br")),
      createBrotliDecompress(),
      createWriteStream(binary, { mode: 0o700 })
    );
    chmodSync(binary, 0o700);
  }
  await extractTarBrotli(join(packageBin, "fonts.tar.br"), join(chromiumRoot, "fonts"), join(chromiumRoot, ".fonts-complete"));
  await extractTarBrotli(join(packageBin, "swiftshader.tar.br"), chromiumRoot, join(chromiumRoot, ".swiftshader-complete"));
  mkdirSync(fontConfigRoot, { recursive: true });
  writeFileSync(fontConfigFile, `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${join(chromiumRoot, "fonts", "fonts")}</dir>
  <cachedir>${join(chromiumRoot, "font-cache")}</cachedir>
</fontconfig>\n`);
  process.env.FONTCONFIG_PATH = fontConfigRoot;
  process.env.FONTCONFIG_FILE = fontConfigFile;
  process.env.LD_LIBRARY_PATH = [chromiumRoot, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
  return binary;
}

async function homepage(context, baseUrl) {
  const page = await context.newPage();
  await page.route(/\.(?:mp4|webm|webp|woff2)(?:\?.*)?$/, (route) => route.abort());
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  return page;
}

async function verifyMobileChrome(browser, baseUrl) {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 }
  });
  const page = await homepage(context, baseUrl);

  await page.waitForFunction(() => document.documentElement.dataset.loaderState === "ready");
  assert.equal(await page.locator("[data-home-loader]").getAttribute("aria-hidden"), "true");
  assert.equal(await page.locator("[data-site-header]").getAttribute("data-nav-enhanced"), "true");

  const homepageColors = await page.evaluate(() => ({
    root: getComputedStyle(document.documentElement).backgroundColor,
    body: getComputedStyle(document.body).backgroundColor,
    header: getComputedStyle(document.querySelector("[data-site-header]")).backgroundColor
  }));
  assert.deepEqual(homepageColors, {
    root: "rgb(16, 42, 67)",
    body: "rgb(16, 42, 67)",
    header: "rgb(250, 248, 242)"
  });

  const sectionColors = await page.evaluate(() => Object.fromEntries([
    ["intake", ".hero-intake-section"],
    ["answer", ".answer-home"],
    ["materials", ".material-editorial"],
    ["process", ".assay-process"],
    ["industries", ".industry-index"],
    ["service", ".service-area-section"],
    ["story", ".provenance-story"],
    ["location", ".location-section"],
    ["faq", ".faq-section"]
  ].map(([name, selector]) => [name, getComputedStyle(document.querySelector(selector)).backgroundColor])));
  assert.deepEqual(sectionColors, {
    intake: "rgb(241, 237, 228)",
    answer: "rgb(241, 237, 228)",
    materials: "rgb(250, 248, 242)",
    process: "rgb(16, 42, 67)",
    industries: "rgb(250, 248, 242)",
    service: "rgb(16, 42, 67)",
    story: "rgb(250, 248, 242)",
    location: "rgb(241, 237, 228)",
    faq: "rgb(250, 248, 242)"
  });

  const heroHeight = await page.locator(".atelier-hero").evaluate((hero) => hero.getBoundingClientRect().height);
  assert.ok(heroHeight >= 844, `mobile hero must fill the 844px viewport, received ${heroHeight}px`);

  await page.evaluate(() => window.scrollTo(0, 120));
  await page.locator("[data-nav-toggle]").waitFor({ state: "visible" });
  assert.equal(await page.locator("[data-site-header] .brand").getAttribute("href"), "#top");
  await page.locator("[data-site-header] .brand").click();
  assert.ok(await page.evaluate(() => window.scrollY > 0), "homepage brand must animate rather than jump immediately");
  await page.waitForFunction(() => window.scrollY === 0);
  await page.evaluate(() => window.scrollTo(0, 120));
  await page.locator("[data-nav-toggle]").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.body.classList.contains("nav-open"));
  const navState = await page.evaluate(() => {
    const panel = document.querySelector("[data-nav]");
    const scrim = document.querySelector("[data-nav-scrim]");
    const rect = panel.getBoundingClientRect();
    const scrimStyle = getComputedStyle(scrim);
    return {
      panel: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width },
      scrim: { background: scrimStyle.backgroundColor, backdropFilter: scrimStyle.backdropFilter, filter: scrimStyle.filter },
      mainInert: document.querySelector("main").inert,
      dockInert: document.querySelector(".mobile-actions").inert
    };
  });
  assert.ok(navState.panel.left > 0, "the mobile panel must not be a full-width sheet");
  assert.ok(navState.panel.width <= 352, `the mobile panel must stay compact, received ${navState.panel.width}px`);
  assert.ok(navState.panel.top < 96, `the mobile panel must anchor near the top-right toggle, received ${navState.panel.top}px`);
  assert.ok(navState.panel.bottom < 844, "the mobile panel must not rise from or occupy the viewport bottom");
  assert.equal(navState.scrim.background, "rgba(0, 0, 0, 0)");
  assert.equal(navState.scrim.backdropFilter, "none");
  assert.equal(navState.scrim.filter, "none");
  assert.equal(navState.mainInert, true);
  assert.equal(navState.dockInert, true);

  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.body.classList.contains("nav-open"));
  assert.equal(await page.evaluate(() => document.activeElement === document.querySelector("[data-nav-toggle]")), true);

  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForFunction(() => document.querySelector(".mobile-actions")?.dataset.visible === "true");
  const visibleDock = await page.evaluate(() => {
    const dock = document.querySelector(".mobile-actions");
    return {
      inert: dock.inert,
      linkCount: dock.querySelectorAll("a").length,
      label: dock.querySelector("a")?.textContent.trim()
    };
  });
  assert.deepEqual(visibleDock, { inert: false, linkCount: 1, label: "Schedule a Free Pickup" });

  await page.locator("[data-nav-toggle]").click();
  await page.waitForFunction(() => document.body.classList.contains("nav-open"));
  assert.deepEqual(await page.locator(".mobile-actions").evaluate((dock) => ({
    visible: dock.dataset.visible,
    ariaHidden: dock.getAttribute("aria-hidden"),
    inert: dock.inert
  })), { visible: "false", ariaHidden: "true", inert: true });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.querySelector(".mobile-actions")?.dataset.visible === "true");

  await page.setViewportSize({ width: 901, height: 844 });
  await page.waitForFunction(() => document.querySelector(".mobile-actions")?.dataset.visible === "false");
  assert.deepEqual(await page.locator(".mobile-actions").evaluate((dock) => ({
    ariaHidden: dock.getAttribute("aria-hidden"),
    inert: dock.inert
  })), { ariaHidden: "true", inert: true });
  await page.setViewportSize({ width: 900, height: 844 });
  await page.waitForFunction(() => document.querySelector(".mobile-actions")?.dataset.visible === "true");

  await page.locator(".footer").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector(".mobile-actions")?.dataset.visible === "false");
  assert.equal(await page.locator(".mobile-actions").evaluate((dock) => dock.inert), true);

  await page.goto(`${baseUrl}/contact/`, { waitUntil: "load" });
  const internalCanvas = await page.evaluate(() => ({
    root: getComputedStyle(document.documentElement).backgroundColor,
    body: getComputedStyle(document.body).backgroundColor
  }));
  assert.deepEqual(internalCanvas, {
    root: "rgb(241, 237, 228)",
    body: "rgb(241, 237, 228)"
  });
  await context.close();
}

async function verifyNoJsFallback(browser, baseUrl) {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 }
  });
  const page = await homepage(context, baseUrl);
  const state = await page.evaluate(() => {
    const loader = document.querySelector("[data-home-loader]");
    const nav = document.querySelector("[data-nav]");
    return {
      loaderDisplay: getComputedStyle(loader).display,
      loaderState: document.documentElement.dataset.loaderState ?? null,
      navDisplay: getComputedStyle(nav).display,
      navHeight: nav.getBoundingClientRect().height
    };
  });
  assert.equal(state.loaderDisplay, "none");
  assert.equal(state.loaderState, null);
  assert.notEqual(state.navDisplay, "none");
  assert.ok(state.navHeight > 200, "the no-JavaScript mobile navigation must remain exposed");
  await context.close();
}

async function verifyReducedMotion(browser, baseUrl) {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 }
  });
  const page = await homepage(context, baseUrl);
  await page.waitForFunction(() => document.documentElement.dataset.loaderState === "ready");
  const state = await page.evaluate(() => ({
    loader: getComputedStyle(document.querySelector("[data-home-loader]")).display,
    headerOpacity: getComputedStyle(document.querySelector("[data-site-header]")).opacity,
    headerPosition: getComputedStyle(document.querySelector("[data-site-header]")).position,
    hero: (() => {
      const rect = document.querySelector(".atelier-hero").getBoundingClientRect();
      return { top: rect.top, height: rect.height };
    })()
  }));
  assert.equal(state.loader, "none");
  assert.equal(state.headerOpacity, "1");
  assert.equal(state.headerPosition, "fixed");
  assert.equal(state.hero.top, 0);
  assert.ok(state.hero.height >= 844, `reduced-motion hero must fill the 844px viewport, received ${state.hero.height}px`);
  await context.close();
}

async function verifyLoaderFailOpen(browser, baseUrl) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.route(/\.(?:mp4|webm|webp|woff2)(?:\?.*)?$/, (route) => route.abort());
  let releaseLoader;
  const loaderGate = new Promise((resolveGate) => { releaseLoader = resolveGate; });
  await page.route("**/home-loader.js*", async (route) => {
    await loaderGate;
    await route.continue();
  });
  const startedAt = performance.now();
  const navigation = page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await page.waitForFunction(() => document.documentElement.dataset.loaderState === "loading");
  assert.equal(await page.evaluate(() => document.documentElement.dataset.loaderState), "loading");
  await page.waitForFunction(() => document.documentElement.dataset.loaderState === "ready", null, { timeout: 1600 });
  const elapsed = performance.now() - startedAt;
  assert.ok(elapsed >= 1050, `loader fail-open fired too early at ${elapsed.toFixed(0)}ms`);
  assert.ok(elapsed < 1600, `loader fail-open exceeded its recovery window at ${elapsed.toFixed(0)}ms`);
  await page.evaluate(() => {
    window.__loaderStates = [document.documentElement.dataset.loaderState ?? null];
    new MutationObserver(() => {
      window.__loaderStates.push(document.documentElement.dataset.loaderState ?? null);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-loader-state"] });
  });
  releaseLoader();
  await navigation;
  await page.evaluate(() => new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame))));
  const states = await page.evaluate(() => window.__loaderStates);
  assert.equal(states.slice(1).includes("loading"), false, `a delayed module reopened the loader: ${JSON.stringify(states)}`);
  await context.close();
}

async function verifyLoaderAssaySequence(browser, baseUrl) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.route(/\.(?:mp4|webm|webp|woff2)(?:\?.*)?$/, (route) => route.abort());
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  const assay = page.locator("[data-loader-assay]");
  await assay.waitFor({ state: "visible" });
  assert.deepEqual(await assay.evaluate((element) => ({
    text: element.textContent.replace(/\s+/g, " ").trim(),
    symbol: element.querySelector("[data-loader-symbol]")?.textContent,
    atomicNumber: element.querySelector("[data-loader-atomic-number]")?.textContent,
    purity: element.querySelector("[data-loader-purity]")?.textContent
  })), { text: "Ag 47 99.9", symbol: "Ag", atomicNumber: "47", purity: "99.9" });
  await context.close();
}

const server = staticServer();
await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;
const executablePath = await chromiumExecutable();

async function runScenario(name, verify) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const browser = await playwrightChromium.launch({
      args: [...chromium.args, "--autoplay-policy=no-user-gesture-required"],
      executablePath,
      headless: true
    });
    try {
      await verify(browser, baseUrl);
      return;
    } catch (error) {
      const retryable = /Target page, context or browser has been closed/.test(String(error?.message ?? error));
      if (!retryable || attempt === 3) throw error;
      console.warn(`[site-chrome] retrying ${name} after browser-process closure`);
    } finally {
      await browser.close().catch(() => {});
    }
  }
}

try {
  await runScenario("mobile chrome", verifyMobileChrome);
  await runScenario("no-JavaScript fallback", verifyNoJsFallback);
  await runScenario("reduced motion", verifyReducedMotion);
  await runScenario("loader assay sequence", verifyLoaderAssaySequence);
  await runScenario("loader fail-open", verifyLoaderFailOpen);
  console.log("SITE_CHROME_BROWSER_OK");
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}
