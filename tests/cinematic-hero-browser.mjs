import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  chmodSync,
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
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
const captureRoot = join(root, "docs", "qa", "cinematic-captures");
const resultPath = join(captureRoot, "cinematic-browser-matrix.json");
const baseCommit = "c6993cf83d7a4533ef2bb53576e7560c1415eba0";
const pinnedChromiumRoot = "/tmp/agrefining-cinematic-chromium-149";

const viewports = [
  { name: "desktop", width: 1440, height: 960 },
  { name: "compact-desktop", width: 1024, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow-mobile", width: 320, height: 800 }
];

const clipKeys = ["molten-pour", "silver-ingots", "precision-assay"];
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"]
]);

function contextOptions(viewport, overrides = {}) {
  const touchViewport = viewport.width <= 768;
  return {
    deviceScaleFactor: 1,
    hasTouch: touchViewport,
    isMobile: touchViewport,
    viewport: { width: viewport.width, height: viewport.height },
    ...overrides
  };
}

function ensureInsideDist(candidate) {
  const local = relative(dist, candidate);
  return local !== "" && local !== ".." && !local.startsWith(`..${sep}`) && !local.includes(`${sep}..${sep}`);
}

function resolveRequestPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://127.0.0.1").pathname);
  const localPath = normalize(pathname).replace(/^[/\\]+/, "");
  let candidate = join(dist, localPath || "index.html");
  if (!ensureInsideDist(candidate)) return null;
  if (existsSync(candidate) && statSync(candidate).isDirectory()) candidate = join(candidate, "index.html");
  if (!existsSync(candidate) && existsSync(`${candidate}.html`)) candidate = `${candidate}.html`;
  return existsSync(candidate) && statSync(candidate).isFile() ? candidate : null;
}

function createStaticServer() {
  const requestLog = [];
  const server = createServer((request, response) => {
    const receivedAt = performance.now();
    const filePath = resolveRequestPath(request.url ?? "/");
    requestLog.push({ method: request.method, path: new URL(request.url ?? "/", "http://127.0.0.1").pathname, receivedAt });
    if (!filePath) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const size = statSync(filePath).size;
    const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
    const headers = {
      "accept-ranges": "bytes",
      "cache-control": "no-store",
      "content-type": mimeTypes.get(extname(filePath).toLowerCase()) ?? "application/octet-stream"
    };

    if (range) {
      const start = range[1] === "" ? 0 : Number(range[1]);
      const end = range[2] === "" ? size - 1 : Math.min(Number(range[2]), size - 1);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) {
        response.writeHead(416, { "content-range": `bytes */${size}` });
        response.end();
        return;
      }
      response.writeHead(206, {
        ...headers,
        "content-length": end - start + 1,
        "content-range": `bytes ${start}-${end}/${size}`
      });
      if (request.method === "HEAD") response.end();
      else createReadStream(filePath, { start, end }).pipe(response);
      return;
    }

    response.writeHead(200, { ...headers, "content-length": size });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath).pipe(response);
  });
  return { server, requestLog };
}

function probeMedia() {
  return clipKeys.flatMap((key) => ["webm", "mp4"].map((format) => {
    const filePath = join(root, "videos", `ag-refining-${key}.${format}`);
    const probe = JSON.parse(execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,pix_fmt",
      "-of", "json",
      filePath
    ], { encoding: "utf8" }));
    const videos = probe.streams.filter(({ codec_type: type }) => type === "video");
    const audio = probe.streams.filter(({ codec_type: type }) => type === "audio");
    assert.equal(videos.length, 1, `${key}.${format} must contain exactly one video stream`);
    assert.equal(audio.length, 0, `${key}.${format} must contain no audio stream`);
    return {
      file: relative(root, filePath),
      bytes: Number(probe.format.size),
      duration: Number(probe.format.duration),
      video: videos[0],
      audioStreams: audio.length
    };
  }));
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

async function pinnedChromiumExecutable() {
  const binary = join(pinnedChromiumRoot, "chromium");
  const packageBin = join(root, "node_modules", "@sparticuz", "chromium", "bin");
  mkdirSync(pinnedChromiumRoot, { recursive: true });
  if (!existsSync(binary) || statSync(binary).size < 10_000_000) {
    await pipeline(
      createReadStream(join(packageBin, "chromium.br")),
      createBrotliDecompress(),
      createWriteStream(binary, { mode: 0o700 })
    );
    chmodSync(binary, 0o700);
  }
  await extractTarBrotli(join(packageBin, "fonts.tar.br"), join(pinnedChromiumRoot, "fonts"), join(pinnedChromiumRoot, ".fonts-complete"));
  await extractTarBrotli(join(packageBin, "swiftshader.tar.br"), pinnedChromiumRoot, join(pinnedChromiumRoot, ".swiftshader-complete"));
  process.env.FONTCONFIG_PATH = join(pinnedChromiumRoot, "fonts");
  process.env.LD_LIBRARY_PATH = [pinnedChromiumRoot, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
  return binary;
}

function attachDiagnostics(page, label, baseUrl) {
  const diagnostics = { label, consoleErrors: [], pageErrors: [], failedLocalRequests: [], localHttpErrors: [] };
  page.on("console", (message) => {
    if (message.type() === "error") diagnostics.consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => diagnostics.pageErrors.push(String(error?.stack ?? error)));
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(baseUrl)) {
      diagnostics.failedLocalRequests.push({ url: request.url(), failure: request.failure()?.errorText ?? "unknown" });
    }
  });
  page.on("response", (response) => {
    if (response.url().startsWith(baseUrl) && response.status() >= 400) {
      diagnostics.localHttpErrors.push({ url: response.url(), status: response.status() });
    }
  });
  return diagnostics;
}

async function installEvidenceObservers(context) {
  await context.addInitScript(() => {
    window.__releaseEvidence = {
      heroLayoutShift: 0,
      totalLayoutShift: 0,
      longTasks: [],
      unhandledRejections: []
    };
    addEventListener("unhandledrejection", (event) => {
      window.__releaseEvidence.unhandledRejections.push(String(event.reason));
    });
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.__releaseEvidence.totalLayoutShift += entry.value;
          if (entry.sources?.some(({ node }) => node?.closest?.(".atelier-hero"))) {
            window.__releaseEvidence.heroLayoutShift += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      // LayoutShift is not implemented in every browser build.
    }
    try {
      new PerformanceObserver((list) => {
        window.__releaseEvidence.longTasks.push(...list.getEntries().map(({ startTime, duration }) => ({ startTime, duration })));
      }).observe({ type: "longtask", buffered: true });
    } catch {
      // LongTask is not implemented in every browser build.
    }
  });
}

async function pageState(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-cinematic-hero-media]");
    const controller = root?.cinematicHeroVideoController;
    const poster = root?.querySelector("[data-cinematic-poster]");
    const videos = Array.from(root?.querySelectorAll("video[data-video-layer]") ?? []);
    const overlay = document.querySelector(".cinematic-hero-overlay");
    const sourceRecords = videos.map((video) => Array.from(video.querySelectorAll("source"), (source) => source.getAttribute("src")));
    const clipSources = [...new Set(sourceRecords.flat().filter(Boolean).map((src) => src.match(/ag-refining-([\w-]+)\.(?:webm|mp4)$/)?.[1]).filter(Boolean))];
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const value = element.getBoundingClientRect();
      return Object.fromEntries(["x", "y", "width", "height", "top", "right", "bottom", "left"].map((key) => [key, Number(value[key].toFixed(2))]));
    };
    const overlayStyle = overlay ? getComputedStyle(overlay) : null;
    const posterOpacity = poster ? Number(getComputedStyle(poster).opacity) : 0;
    const videoOpacity = videos.map((video) => Number(getComputedStyle(video).opacity));
    return {
      controller: controller ? {
        activeIndex: controller.activeIndex,
        nextIndex: controller.nextIndex,
        activeLayerIndex: controller.activeLayerIndex,
        incomingLayerIndex: controller.incomingLayerIndex,
        transitionPhase: controller.transitionPhase,
        transitioning: controller.transitioning,
        destroyed: controller.destroyed
      } : null,
      videoCount: videos.length,
      controls: videos.map((video) => video.controls),
      paused: videos.map((video) => video.paused),
      currentTimes: videos.map((video) => Number(video.currentTime.toFixed(3))),
      durations: videos.map((video) => Number.isFinite(video.duration) ? Number(video.duration.toFixed(3)) : null),
      posterOpacity,
      videoOpacity,
      sourceRecords,
      clipSources,
      overlay: overlayStyle ? { background: overlayStyle.background, opacity: overlayStyle.opacity } : null,
      rects: {
        hero: rect(".atelier-hero"),
        h1: rect(".atelier-hero h1"),
        ctaPrimary: rect(".atelier-hero .button-primary"),
        ctaSecondary: rect(".atelier-hero .button-secondary"),
        phone: rect(".atelier-hero .hero-call"),
        proof: rect(".atelier-hero .hero-proof-rail")
      },
      overflow: {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }
    };
  });
}

function assertRectSet(actual, expected, label) {
  for (const [name, expectedRect] of Object.entries(expected)) {
    assert.ok(actual[name], `${label}: missing ${name} rectangle`);
    for (const key of ["x", "y", "width", "height"]) {
      assert.ok(Math.abs(actual[name][key] - expectedRect[key]) <= 1, `${label}: ${name}.${key} changed from ${expectedRect[key]} to ${actual[name][key]}`);
    }
  }
}

async function startMediaSampler(page) {
  await page.evaluate(() => {
    const samples = [];
    window.__releaseMediaSamples = samples;
    const sample = () => {
      const root = document.querySelector("[data-cinematic-hero-media]");
      const controller = root?.cinematicHeroVideoController;
      const poster = root?.querySelector("[data-cinematic-poster]");
      const videos = Array.from(root?.querySelectorAll("video[data-video-layer]") ?? []);
      samples.push({
        at: performance.now(),
        activeIndex: controller?.activeIndex ?? null,
        phase: controller?.transitionPhase ?? "missing",
        transitioning: controller?.transitioning ?? false,
        posterOpacity: poster ? Number(getComputedStyle(poster).opacity) : 0,
        videoOpacity: videos.map((video) => Number(getComputedStyle(video).opacity)),
        playing: videos.filter((video) => !video.paused).length
      });
      if (samples.length < 4000 && !controller?.destroyed) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

async function capture(page, viewport, name) {
  const filename = `${viewport.name}-${viewport.width}x${viewport.height}-${name}.png`;
  const path = join(captureRoot, filename);
  await page.screenshot({ path, fullPage: false });
  return relative(root, path);
}

async function assertPosterBeforeModule(browser, baseUrl, viewport) {
  const context = await browser.newContext(contextOptions(viewport));
  const page = await context.newPage();
  let releaseModule;
  let markModuleSeen;
  const moduleGate = new Promise((resolveGate) => { releaseModule = resolveGate; });
  const moduleSeen = new Promise((resolveSeen) => { markModuleSeen = resolveSeen; });
  await page.route("**/cinematic-hero-video.js*", async (route) => {
    markModuleSeen();
    await moduleGate;
    await route.continue();
  });
  const navigation = page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await moduleSeen;
  await page.locator("[data-cinematic-poster] img").waitFor({ state: "visible" });
  const beforeModule = await page.locator("[data-cinematic-poster] img").evaluate(async (image) => {
    if (!image.complete) await image.decode();
    const pictureOpacity = Number(getComputedStyle(image.closest("picture")).opacity);
    return { complete: image.complete, naturalWidth: image.naturalWidth, pictureOpacity };
  });
  assert.equal(beforeModule.complete, true, `${viewport.name}: poster did not complete before cinematic module execution`);
  assert.ok(beforeModule.naturalWidth > 0, `${viewport.name}: poster had no decoded width before cinematic module execution`);
  assert.ok(beforeModule.pictureOpacity > 0, `${viewport.name}: poster was transparent before cinematic module execution`);
  releaseModule();
  await navigation;
  await context.close();
  return beforeModule;
}

async function assertNoJs(browser, baseUrl, viewport) {
  const context = await browser.newContext(contextOptions(viewport, { javaScriptEnabled: false }));
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  const outcome = await page.evaluate(() => {
    const image = document.querySelector("[data-cinematic-poster] img");
    const poster = document.querySelector("[data-cinematic-poster]");
    return {
      visible: Boolean(image && image.complete && image.naturalWidth > 0 && Number(getComputedStyle(poster).opacity) > 0),
      sources: document.querySelectorAll("video source[src]").length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  assert.equal(outcome.visible, true, `${viewport.name}: cold no-JS load did not retain the poster`);
  assert.equal(outcome.sources, 0, `${viewport.name}: no-JS load assigned video sources`);
  assert.equal(outcome.overflow, 0, `${viewport.name}: no-JS load has horizontal overflow`);
  await context.close();
  return outcome;
}

async function assertStaticPreference(browser, baseUrl, viewport, mode) {
  const context = await browser.newContext(contextOptions(viewport, {
    reducedMotion: mode === "reduced-motion" ? "reduce" : "no-preference",
  }));
  await installEvidenceObservers(context);
  if (mode === "save-data") {
    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "connection", {
        configurable: true,
        get: () => ({ saveData: true })
      });
    });
  }
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page, `${viewport.name}-${mode}`, baseUrl);
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await page.waitForTimeout(200);
  const state = await pageState(page);
  assert.equal(state.sourceRecords.flat().filter(Boolean).length, 0, `${viewport.name} ${mode}: video sources were assigned`);
  assert.ok(state.posterOpacity > 0, `${viewport.name} ${mode}: poster is not visible`);
  assert.equal(state.overflow.scrollWidth, state.overflow.clientWidth, `${viewport.name} ${mode}: horizontal overflow`);
  assert.deepEqual(diagnostics, { label: `${viewport.name}-${mode}`, consoleErrors: [], pageErrors: [], failedLocalRequests: [], localHttpErrors: [] });
  await context.close();
  return { posterOpacity: state.posterOpacity, assignedSources: 0, diagnostics };
}

async function assertAutoplayRejection(browser, baseUrl, viewport) {
  const context = await browser.newContext(contextOptions(viewport));
  await installEvidenceObservers(context);
  await context.addInitScript(() => {
    HTMLMediaElement.prototype.play = function rejectAutoplay() {
      return Promise.reject(new DOMException("Autoplay rejected by release harness", "NotAllowedError"));
    };
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page, `${viewport.name}-autoplay-rejection`, baseUrl);
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await page.waitForTimeout(300);
  const state = await pageState(page);
  const evidence = await page.evaluate(() => window.__releaseEvidence);
  assert.equal(state.controller.transitionPhase, "static", `${viewport.name}: autoplay rejection did not enter static mode`);
  assert.ok(state.posterOpacity > 0, `${viewport.name}: autoplay rejection hid the poster`);
  assert.ok(state.videoOpacity.every((opacity) => opacity === 0), `${viewport.name}: autoplay rejection left a video visible`);
  assert.deepEqual(evidence.unhandledRejections, [], `${viewport.name}: autoplay rejection escaped as unhandled`);
  assert.deepEqual(diagnostics, { label: `${viewport.name}-autoplay-rejection`, consoleErrors: [], pageErrors: [], failedLocalRequests: [], localHttpErrors: [] });
  await context.close();
  return { posterOpacity: state.posterOpacity, videoOpacity: state.videoOpacity, unhandledRejections: evidence.unhandledRejections };
}

async function waitForIdleClip(page, index, timeout = 15000) {
  await page.waitForFunction((expected) => {
    const controller = document.querySelector("[data-cinematic-hero-media]")?.cinematicHeroVideoController;
    return controller?.activeIndex === expected && controller.transitionPhase === "idle" && !controller.transitioning;
  }, index, { timeout });
}

async function runNormalCycle(browser, baseUrl, viewport) {
  const context = await browser.newContext(contextOptions(viewport, { reducedMotion: "no-preference" }));
  await installEvidenceObservers(context);
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page, `${viewport.name}-normal`, baseUrl);
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await waitForIdleClip(page, 0);
  await startMediaSampler(page);

  const initial = await pageState(page);
  assert.equal(initial.videoCount, 2, `${viewport.name}: expected exactly two video elements`);
  assert.ok(initial.controls.every((value) => value === false), `${viewport.name}: a video exposed controls`);
  assert.equal(initial.clipSources.length, 2, `${viewport.name}: initial source assignment did not contain exactly two clips`);
  assert.deepEqual(initial.clipSources.sort(), ["molten-pour", "silver-ingots"], `${viewport.name}: initial clips are not active plus next`);
  assert.equal(initial.overflow.scrollWidth, initial.overflow.clientWidth, `${viewport.name}: horizontal overflow`);
  const overlayBaseline = initial.overlay;
  const geometryBaseline = initial.rects;
  const settledCaptures = [{ clip: clipKeys[0], path: await capture(page, viewport, `clip-1-${clipKeys[0]}-settled`) }];
  const transitions = [];
  const activeSequence = [0];

  const resourceBeforeSwap = await page.evaluate(() => performance.getEntriesByType("resource").map(({ name, startTime, responseEnd, initiatorType }) => ({ name, startTime, responseEnd, initiatorType })));
  const posterResource = resourceBeforeSwap.find(({ name }) => name.includes("/images/ag-refining-molten-pour-poster.webp"));
  const moduleResource = resourceBeforeSwap.find(({ name }) => name.includes("/cinematic-hero-video.js"));
  assert.ok(posterResource && moduleResource, `${viewport.name}: poster or cinematic module missing from first-paint resources`);
  assert.ok(posterResource.startTime <= moduleResource.startTime, `${viewport.name}: poster request did not begin before cinematic module request`);
  assert.equal(resourceBeforeSwap.some(({ name }) => name.includes("precision-assay")), false, `${viewport.name}: third clip requested before first swap`);

  for (let fromIndex = 0; fromIndex < clipKeys.length; fromIndex += 1) {
    const toIndex = (fromIndex + 1) % clipKeys.length;
    await page.waitForFunction(() => {
      const root = document.querySelector("[data-cinematic-hero-media]");
      const controller = root?.cinematicHeroVideoController;
      const active = root?.querySelectorAll("video[data-video-layer]")?.[controller?.activeLayerIndex ?? -1];
      if (!active || controller?.transitionPhase !== "idle") return false;
      const remaining = active.duration - active.currentTime;
      if (!Number.isFinite(remaining) || remaining > 1.15 || remaining <= 0.82) return false;
      active.pause();
      return true;
    }, null, { timeout: 15000, polling: 25 });

    const before = await pageState(page);
    assertRectSet(before.rects, geometryBaseline, `${viewport.name} transition ${fromIndex + 1} before`);
    assert.deepEqual(before.overlay, overlayBaseline, `${viewport.name}: overlay changed before transition ${fromIndex + 1}`);
    const beforePath = await capture(page, viewport, `transition-${fromIndex + 1}-before`);
    await page.evaluate(async () => {
      const root = document.querySelector("[data-cinematic-hero-media]");
      const controller = root.cinematicHeroVideoController;
      await root.querySelectorAll("video[data-video-layer]")[controller.activeLayerIndex].play();
    });
    await page.waitForFunction(() => document.querySelector("[data-cinematic-hero-media]")?.cinematicHeroVideoController?.transitionPhase === "crossfading", null, { timeout: 5000, polling: 10 });
    await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll("video[data-video-layer]"));
      window.__releaseMidpointAnimations = videos.flatMap((video) => video.getAnimations()).filter((animation) => {
        const target = animation.effect?.target;
        return target instanceof HTMLVideoElement;
      });
      for (const animation of window.__releaseMidpointAnimations) {
        animation.currentTime = 400;
        animation.pause();
      }
    });
    const midpoint = await pageState(page);
    assert.equal(midpoint.controller.transitionPhase, "crossfading", `${viewport.name}: transition ${fromIndex + 1} ended before the 400ms midpoint`);
    assert.ok(midpoint.videoOpacity.every((opacity) => opacity > 0 && opacity < 1), `${viewport.name}: transition ${fromIndex + 1} lacks two overlapping nonzero video layers at midpoint`);
    assert.ok(midpoint.posterOpacity + midpoint.videoOpacity.reduce((sum, value) => sum + value, 0) > 0, `${viewport.name}: all media layers are transparent at transition ${fromIndex + 1} midpoint`);
    assertRectSet(midpoint.rects, geometryBaseline, `${viewport.name} transition ${fromIndex + 1} midpoint`);
    assert.deepEqual(midpoint.overlay, overlayBaseline, `${viewport.name}: overlay changed during transition ${fromIndex + 1}`);
    const midpointPath = await capture(page, viewport, `transition-${fromIndex + 1}-midpoint`);
    await page.evaluate(() => {
      for (const animation of window.__releaseMidpointAnimations ?? []) animation.play();
      delete window.__releaseMidpointAnimations;
    });

    await waitForIdleClip(page, toIndex);
    activeSequence.push(toIndex);
    const settled = await pageState(page);
    assertRectSet(settled.rects, geometryBaseline, `${viewport.name} transition ${fromIndex + 1} settled`);
    assert.deepEqual(settled.overlay, overlayBaseline, `${viewport.name}: overlay changed after transition ${fromIndex + 1}`);
    assert.ok(settled.clipSources.length <= 2, `${viewport.name}: more than two clips remain assigned after transition ${fromIndex + 1}`);
    const settledPath = await capture(page, viewport, `transition-${fromIndex + 1}-settled`);
    if (toIndex !== 0) settledCaptures.push({ clip: clipKeys[toIndex], path: settledPath });
    transitions.push({
      from: clipKeys[fromIndex],
      to: clipKeys[toIndex],
      before: { path: beforePath, posterOpacity: before.posterOpacity, videoOpacity: before.videoOpacity },
      midpoint: { path: midpointPath, posterOpacity: midpoint.posterOpacity, videoOpacity: midpoint.videoOpacity },
      settled: { path: settledPath, posterOpacity: settled.posterOpacity, videoOpacity: settled.videoOpacity },
      clipSources: settled.clipSources
    });
  }

  assert.deepEqual(activeSequence, [0, 1, 2, 0], `${viewport.name}: playback skipped or duplicated a transition`);
  const samples = await page.evaluate(() => window.__releaseMediaSamples);
  assert.ok(samples.length > 0, `${viewport.name}: no continuous media samples were recorded`);
  assert.equal(samples.some(({ posterOpacity, videoOpacity }) => posterOpacity + videoOpacity.reduce((sum, value) => sum + value, 0) <= 0.01), false, `${viewport.name}: sampled a frame with all media transparent`);
  const duplicatePlaybackSamples = samples.filter(({ phase, playing }) => phase === "idle" && playing > 1);
  assert.equal(duplicatePlaybackSamples.length, 0, `${viewport.name}: duplicate playback occurred outside a transition: ${JSON.stringify(duplicatePlaybackSamples.slice(0, 8))}`);

  const resourceAfterCycle = await page.evaluate(() => performance.getEntriesByType("resource").map(({ name, startTime, responseEnd, initiatorType }) => ({ name, startTime, responseEnd, initiatorType })));
  assert.ok(resourceAfterCycle.some(({ name }) => name.includes("precision-assay")), `${viewport.name}: third clip was never requested after first swap`);
  const perf = await page.evaluate(() => window.__releaseEvidence);
  assert.equal(perf.heroLayoutShift, 0, `${viewport.name}: hero caused layout shift`);
  assert.deepEqual(perf.unhandledRejections, [], `${viewport.name}: normal cycle had unhandled rejections`);

  const controllerBeforePagehide = await pageState(page);
  await page.evaluate(() => {
    window.__releaseDestroyedController = document.querySelector("[data-cinematic-hero-media]")?.cinematicHeroVideoController;
    window.dispatchEvent(new PageTransitionEvent("pagehide"));
  });
  await page.waitForTimeout(1100);
  const afterPagehide = await pageState(page);
  const destroyedController = await page.evaluate(() => ({
    destroyed: window.__releaseDestroyedController?.destroyed ?? false,
    transitionPhase: window.__releaseDestroyedController?.transitionPhase ?? null,
    transitioning: window.__releaseDestroyedController?.transitioning ?? null,
    rootMarkerReleased: document.querySelector("[data-cinematic-hero-media]")?.cinematicHeroVideoController === undefined
  }));
  assert.equal(destroyedController.destroyed, true, `${viewport.name}: pagehide did not destroy the controller`);
  assert.equal(destroyedController.transitioning, false, `${viewport.name}: a transition remained active after pagehide`);
  assert.equal(destroyedController.rootMarkerReleased, true, `${viewport.name}: pagehide retained the mounted controller marker`);
  assert.equal(afterPagehide.sourceRecords.flat().filter(Boolean).length, 0, `${viewport.name}: pagehide did not remove sources`);
  assert.deepEqual(afterPagehide.currentTimes, [0, 0], `${viewport.name}: media advanced after pagehide`);
  assert.deepEqual(diagnostics, { label: `${viewport.name}-normal`, consoleErrors: [], pageErrors: [], failedLocalRequests: [], localHttpErrors: [] });

  await context.close();
  return {
    initial,
    overlayBaseline,
    geometryBaseline,
    settledCaptures,
    transitions,
    activeSequence,
    sampledFrames: samples.length,
    maxSimultaneousPlayback: Math.max(...samples.map(({ playing }) => playing)),
    resourceOrder: resourceAfterCycle,
    performance: {
      heroLayoutShift: perf.heroLayoutShift,
      totalLayoutShift: perf.totalLayoutShift,
      longTasks: perf.longTasks,
      initializationLongTaskCount: perf.longTasks.filter(({ startTime }) => startTime <= 1500).length,
      initializationLongTaskMaxMs: Math.max(0, ...perf.longTasks.filter(({ startTime }) => startTime <= 1500).map(({ duration }) => duration))
    },
    pagehide: {
      before: controllerBeforePagehide.controller,
      after: destroyedController,
      assignedSourcesAfter: afterPagehide.sourceRecords.flat().filter(Boolean).length
    },
    diagnostics
  };
}

async function runVisibility(browser, baseUrl, viewport) {
  const context = await browser.newContext(contextOptions(viewport));
  await context.addInitScript(() => {
    let releaseHidden = false;
    Object.defineProperty(document, "hidden", { configurable: true, get: () => releaseHidden });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => releaseHidden ? "hidden" : "visible" });
    window.__releaseSetVisibility = (hidden) => {
      releaseHidden = Boolean(hidden);
      document.dispatchEvent(new Event("visibilitychange"));
    };
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page, `${viewport.name}-visibility`, baseUrl);
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await waitForIdleClip(page, 0);
  await page.evaluate(() => {
    const root = document.querySelector("[data-cinematic-hero-media]");
    const controller = root.cinematicHeroVideoController;
    const active = root.querySelectorAll("video[data-video-layer]")[controller.activeLayerIndex];
    active.currentTime = Math.max(0, active.duration - 0.5);
  });
  await page.waitForFunction(() => {
    const controller = document.querySelector("[data-cinematic-hero-media]")?.cinematicHeroVideoController;
    return controller?.transitionPhase === "preparing" || controller?.transitionPhase === "crossfading";
  }, null, { timeout: 5000 });
  const interrupted = await pageState(page);
  await page.evaluate(() => window.__releaseSetVisibility(true));
  await page.waitForFunction(() => Array.from(document.querySelectorAll("video[data-video-layer]")).every((video) => video.paused), null, { timeout: 3000 });
  const hidden = await pageState(page);
  await page.evaluate(() => window.__releaseSetVisibility(false));
  await waitForIdleClip(page, 1, 5000);
  const resumed = await pageState(page);
  assert.ok(hidden.paused.every(Boolean), `${viewport.name}: tab hiding did not pause both videos`);
  assert.equal(resumed.controller.activeIndex, 1, `${viewport.name}: visibility recovery skipped or duplicated the interrupted transition`);
  assert.equal(resumed.paused[resumed.controller.activeLayerIndex], false, `${viewport.name}: active layer did not resume after visibility recovery`);
  assert.deepEqual(diagnostics, { label: `${viewport.name}-visibility`, consoleErrors: [], pageErrors: [], failedLocalRequests: [], localHttpErrors: [] });
  await context.close();
  return {
    emulation: "Injected Document.hidden and visibilitychange in real Chromium because chrome-headless-shell keeps background pages visible.",
    interrupted: interrupted.controller,
    hidden: { controller: hidden.controller, paused: hidden.paused },
    resumed: { controller: resumed.controller, paused: resumed.paused }
  };
}

async function topmostState(page, selector) {
  const locator = page.locator(selector);
  await locator.scrollIntoViewIfNeeded();
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      topmost: Boolean(hit && (hit === element || element.contains(hit))),
      hitElement: hit ? { tag: hit.tagName, className: String(hit.className || ""), text: hit.textContent?.trim().slice(0, 80) ?? "" } : null,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    };
  });
}

async function tabUntil(page, selector, limit = 40) {
  await page.locator("body").press("Home");
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press("Tab");
    const matched = await page.evaluate((target) => document.activeElement?.matches(target), selector);
    if (matched) return index + 1;
  }
  throw new Error(`Keyboard focus did not reach ${selector} in ${limit} Tabs`);
}

async function runInteractions(browser, baseUrl, viewport) {
  const context = await browser.newContext(contextOptions(viewport));
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page, `${viewport.name}-interactions`, baseUrl);
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  const selectors = [".atelier-hero .button-primary", ".atelier-hero .button-secondary", ".atelier-hero .hero-call"];
  const hitTargets = {};
  for (const selector of selectors) {
    const state = await topmostState(page, selector);
    hitTargets[selector] = state;
  }
  const primaryTabs = await tabUntil(page, ".atelier-hero .button-primary");
  const secondaryTabs = await tabUntil(page, ".atelier-hero .button-secondary");
  const phoneTabs = await tabUntil(page, ".atelier-hero .hero-call");

  await page.locator(".atelier-hero .button-primary").click();
  await page.waitForURL(`${baseUrl}/contact?intent=pickup`);
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await page.locator(".atelier-hero .button-secondary").click();
  await page.waitForURL(`${baseUrl}/accepted-materials`);
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });

  const materials = {};
  if (viewport.width > 900) {
    await page.evaluate(() => scrollTo(0, 240));
    await page.waitForTimeout(50);
    materials.hoverEnvironment = await page.evaluate(() => ({
      enhanced: document.querySelector("[data-materials-disclosure]")?.dataset.materialsEnhanced ?? null,
      fineHover: matchMedia("(hover: hover) and (pointer: fine)").matches
    }));
    await page.locator("[data-materials-disclosure]").hover();
    await page.waitForTimeout(100);
    const hoverState = await page.evaluate(() => ({
      expanded: document.querySelector("[data-materials-disclosure-toggle]")?.getAttribute("aria-expanded"),
      hidden: document.querySelector("[data-materials-panel]")?.hidden,
      rootHovered: document.querySelector("[data-materials-disclosure]")?.matches(":hover")
    }));
    assert.equal(await page.locator("[data-materials-panel]").isVisible(), true, `${viewport.name}: fine-pointer hover did not open materials panel: ${JSON.stringify({ ...materials.hoverEnvironment, ...hoverState })}`);
    const panelHeader = await page.evaluate(() => {
      const header = document.querySelector("[data-site-header]").getBoundingClientRect();
      const panel = document.querySelector("[data-materials-panel]").getBoundingClientRect();
      return { headerBottom: header.bottom, headerHeight: header.height, panelTop: panel.top, overlap: Math.max(0, header.bottom - panel.top) };
    });
    assert.ok(panelHeader.overlap <= 1, `${viewport.name}: materials panel overlaps sticky header by ${panelHeader.overlap}px`);
    materials.hover = true;
    await page.mouse.move(1, viewport.height - 1);
    await page.locator("[data-materials-panel]").waitFor({ state: "hidden" });
    await page.locator("[data-materials-disclosure-toggle]").click();
    await page.locator("[data-materials-panel]").waitFor({ state: "visible" });
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.querySelector("[data-materials-panel]").contains(document.activeElement)), true, `${viewport.name}: Tab did not enter the open materials panel`);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("[data-materials-panel]").isVisible(), false, `${viewport.name}: Escape did not close materials panel`);
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector("[data-materials-disclosure-toggle]")), true, `${viewport.name}: Escape did not return focus to disclosure control`);
    await page.locator("[data-materials-disclosure-toggle]").click();
    await page.locator(".atelier-hero h1").click();
    assert.equal(await page.locator("[data-materials-panel]").isVisible(), false, `${viewport.name}: outside click did not close materials panel`);
    materials.panelHeader = panelHeader;
    materials.click = true;
    materials.tab = true;
    materials.escape = true;
    materials.outside = true;
  } else {
    const navToggle = await topmostState(page, "[data-nav-toggle]");
    assert.equal(navToggle.topmost, true, `${viewport.name}: mobile nav toggle is not topmost`);
    assert.ok(navToggle.rect.width >= 44 && navToggle.rect.height >= 44, `${viewport.name}: mobile nav toggle is below 44px`);
    await page.locator("[data-nav-toggle]").click();
    await page.waitForFunction(() => document.body.classList.contains("nav-open"));
    await page.locator("[data-materials-disclosure-toggle]").click();
    await page.locator("[data-materials-panel]").waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("[data-materials-panel]").isVisible(), false, `${viewport.name}: first Escape did not close nested materials disclosure`);
    assert.equal(await page.evaluate(() => document.body.classList.contains("nav-open")), true, `${viewport.name}: first Escape incorrectly closed mobile sheet`);
    await page.keyboard.press("Escape");
    assert.equal(await page.evaluate(() => document.body.classList.contains("nav-open")), false, `${viewport.name}: second Escape did not close mobile sheet`);
    materials.mobileSheet = true;
    materials.escapeOrder = ["materials", "sheet"];
    materials.navToggle = navToggle;
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  for (const [selector, state] of Object.entries(hitTargets)) {
    assert.equal(state.topmost, true, `${viewport.name}: ${selector} is not topmost: ${JSON.stringify(state)}`);
    const minimumHeight = selector.includes("hero-call") && viewport.width > 900 ? 24 : 44;
    assert.ok(state.rect.height >= minimumHeight, `${viewport.name}: ${selector} is shorter than ${minimumHeight}px`);
  }
  assert.equal(overflow, 0, `${viewport.name}: interactions page has horizontal overflow`);
  assert.deepEqual(diagnostics, { label: `${viewport.name}-interactions`, consoleErrors: [], pageErrors: [], failedLocalRequests: [], localHttpErrors: [] });
  await context.close();
  return { hitTargets, keyboardTabs: { primary: primaryTabs, secondary: secondaryTabs, phone: phoneTabs }, materials, overflow };
}

async function runViewport(browser, baseUrl, viewport) {
  const outcome = { viewport };
  const stages = [
    ["posterBeforeModule", () => assertPosterBeforeModule(browser, baseUrl, viewport)],
    ["noJavaScript", () => assertNoJs(browser, baseUrl, viewport)],
    ["reducedMotion", () => assertStaticPreference(browser, baseUrl, viewport, "reduced-motion")],
    ["saveData", () => assertStaticPreference(browser, baseUrl, viewport, "save-data")],
    ["autoplayRejection", () => assertAutoplayRejection(browser, baseUrl, viewport)],
    ["normal", () => runNormalCycle(browser, baseUrl, viewport)],
    ["visibility", () => runVisibility(browser, baseUrl, viewport)],
    ["interactions", () => runInteractions(browser, baseUrl, viewport)]
  ];
  const requestedStage = process.env.AG_REFINING_BROWSER_STAGE;
  const selectedStages = requestedStage ? stages.filter(([name]) => name === requestedStage) : stages;
  assert.ok(selectedStages.length > 0, `Unknown AG_REFINING_BROWSER_STAGE: ${requestedStage}`);
  for (const [name, run] of selectedStages) {
    console.log(`[browser] ${viewport.name} stage ${name}`);
    try {
      outcome[name] = await run();
    } catch (error) {
      error.message = `${viewport.name} ${name}: ${error.message}`;
      throw error;
    }
  }
  return outcome;
}

async function main() {
  assert.ok(existsSync(join(dist, "index.html")), "dist/index.html is missing; run npm run build before the browser harness");
  mkdirSync(captureRoot, { recursive: true });
  const media = probeMedia();
  const { server, requestLog } = createStaticServer();
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string", "static server did not expose a TCP address");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const executablePath = await pinnedChromiumExecutable();
  const removedServerlessOnlyArgs = ["--single-process", "--no-zygote", "--in-process-gpu"];
  const launchArgs = chromium.args.filter((argument) => !removedServerlessOnlyArgs.includes(argument));
  const startedAt = new Date().toISOString();
  const results = [];
  const failures = [];
  const infrastructureRetries = [];
  let browserVersion = null;

  try {
    const requestedViewport = process.env.AG_REFINING_BROWSER_VIEWPORT;
    const selectedViewports = requestedViewport ? viewports.filter(({ name }) => name === requestedViewport) : viewports;
    assert.ok(selectedViewports.length > 0, `Unknown AG_REFINING_BROWSER_VIEWPORT: ${requestedViewport}`);
    for (const [index, viewport] of selectedViewports.entries()) {
      console.log(`[browser] ${index + 1}/${selectedViewports.length} ${viewport.name} ${viewport.width}x${viewport.height}`);
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        const browser = await playwrightChromium.launch({
          executablePath,
          args: [...launchArgs, "--autoplay-policy=no-user-gesture-required"],
          headless: true
        });
        browserVersion ??= browser.version();
        try {
          results.push({ status: "passed", browserProcessAttempt: attempt, ...(await runViewport(browser, baseUrl, viewport)) });
          console.log(`[browser] passed ${viewport.name}`);
          break;
        } catch (error) {
          const failure = { viewport, message: String(error?.message ?? error), stack: String(error?.stack ?? error) };
          const retryableClosure = /Target page, context or browser has been closed|page\.goto: Timeout 30000ms exceeded/.test(failure.message);
          if (attempt < 3 && retryableClosure) {
            infrastructureRetries.push({ ...failure, attempt });
            console.warn(`[browser] retrying ${viewport.name} after browser-process closure`);
            continue;
          }
          failures.push(failure);
          results.push({ status: "failed", browserProcessAttempt: attempt, viewport, failure });
          console.error(`[browser] failed ${viewport.name}: ${failure.message}`);
          break;
        } finally {
          await browser.close().catch(() => {});
        }
      }
    }
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }

  const artifact = {
    schemaVersion: 1,
    baseCommit,
    generatedAt: new Date().toISOString(),
    startedAt,
    browserToolchain: {
      playwrightCore: JSON.parse(readFileSync(join(root, "node_modules", "playwright-core", "package.json"), "utf8")).version,
      sparticuzChromium: JSON.parse(readFileSync(join(root, "node_modules", "@sparticuz", "chromium", "package.json"), "utf8")).version,
      browserVersion,
      executablePath,
      removedServerlessOnlyArgs,
      freshBrowserProcessPerViewport: true,
      serverProcess: "same Node process as harness"
    },
    cloudBrowserLimitation: "Cloud browser could not open container loopback http://127.0.0.1:4173 and returned net::ERR_BLOCKED_BY_CLIENT.",
    media,
    results,
    failures,
    infrastructureRetries,
    serverRequests: requestLog
  };
  writeFileSync(resultPath, `${JSON.stringify(artifact, null, 2)}\n`);
  console.log(`[browser] wrote ${relative(root, resultPath)}`);
  if (failures.length > 0) {
    throw new AggregateError(failures.map(({ message }) => new Error(message)), `${failures.length} browser viewport(s) failed`);
  }
  console.log(`[browser] all ${results.length} viewport processes passed`);
}

await main();
