import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { CinematicHeroVideo, initializeCinematicHeroVideos } from "../src/cinematic-hero-video.js";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

class FakeClassList {
  #values = new Set();

  add(...values) {
    for (const value of values) this.#values.add(value);
  }

  remove(...values) {
    for (const value of values) this.#values.delete(value);
  }

  contains(value) {
    return this.#values.has(value);
  }
}

class FakeSource extends EventTarget {
  constructor(format, assignments) {
    super();
    this.dataset = { videoFormat: format };
    this.type = `video/${format}`;
    this.assignments = assignments;
    this.attributes = new Map([
      ["data-video-format", format],
      ["type", this.type]
    ]);
  }

  get src() {
    return this.attributes.get("src") || "";
  }

  set src(value) {
    this.attributes.set("src", String(value));
    this.assignments.push({ format: this.dataset.videoFormat, src: String(value) });
  }

  setAttribute(name, value) {
    if (name === "src") {
      this.src = value;
      return;
    }
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }
}

class FakeVideo extends EventTarget {
  constructor(layerIndex) {
    super();
    this.dataset = { videoLayer: String(layerIndex) };
    this.classList = new FakeClassList();
    this.style = { opacity: "" };
    this.attributes = new Map([["preload", "none"]]);
    this.assignments = [];
    this.sources = [new FakeSource("webm", this.assignments), new FakeSource("mp4", this.assignments)];
    this.autoplay = true;
    this.muted = true;
    this.playsInline = true;
    this.currentTime = 0;
    this.duration = Number.NaN;
    this.paused = true;
    this.ended = false;
    this.error = null;
    this.networkState = 0;
    this.readyState = 0;
    this.loadCount = 0;
    this.playCount = 0;
    this.pauseCount = 0;
    this.playOutcomes = [];
    this.loadedSources = [];
    this.nativeAutoplayOnLoad = false;
    this.poster = "/images/ag-refining-molten-pour-poster.webp";
  }

  get preload() {
    return this.attributes.get("preload") || "";
  }

  set preload(value) {
    this.attributes.set("preload", String(value));
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === "poster") this.poster = String(value);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  querySelector(selector) {
    const format = /data-video-format=["'](webm|mp4)["']/.exec(selector)?.[1];
    return format ? this.sources.find((source) => source.dataset.videoFormat === format) || null : null;
  }

  querySelectorAll(selector) {
    return selector.includes("data-video-format") || selector === "source" ? [...this.sources] : [];
  }

  load() {
    this.loadCount += 1;
    this.networkState = this.sources.some((source) => source.src) ? 1 : 0;
    this.readyState = 0;
    this.loadedSources.push(this.sources.map((source) => source.src));
    if (this.nativeAutoplayOnLoad && this.autoplay && this.networkState > 0) this.paused = false;
  }

  play() {
    this.playCount += 1;
    const outcome = this.playOutcomes.shift();
    if (outcome instanceof Error) return Promise.reject(outcome);
    if (outcome?.promise) {
      return outcome.promise.then(
        () => {
          this.paused = false;
          this.ended = false;
        },
        (error) => Promise.reject(error)
      );
    }
    this.paused = false;
    this.ended = false;
    return Promise.resolve();
  }

  pause() {
    this.pauseCount += 1;
    this.paused = true;
  }
}

class FakePoster extends EventTarget {
  constructor() {
    super();
    this.classList = new FakeClassList();
    this.style = { opacity: "1" };
  }
}

class FakeRoot extends EventTarget {
  constructor() {
    super();
    this.videos = [new FakeVideo(0), new FakeVideo(1)];
    this.poster = new FakePoster();
    this.heroContent = {
      heading: "Your silver, valued precisely.",
      actions: ["Schedule a free pickup", "See what we buy"]
    };
  }

  querySelectorAll(selector) {
    return selector.includes("video") && selector.includes("data-video-layer") ? [...this.videos] : [];
  }

  querySelector(selector) {
    if (selector === "[data-cinematic-poster]") return this.poster;
    return null;
  }
}

class FakeWindow extends EventTarget {}

class FakeDocument extends EventTarget {
  constructor(roots = []) {
    super();
    this.hidden = false;
    this.readyState = "complete";
    this.roots = roots;
    this.defaultView = new FakeWindow();
  }

  querySelectorAll(selector) {
    return selector === "[data-cinematic-hero-media]" ? [...this.roots] : [];
  }
}

class TimerHarness {
  constructor() {
    this.now = 0;
    this.nextId = 1;
    this.timers = new Map();
  }

  setTimeout = (callback, delay) => {
    const id = this.nextId++;
    this.timers.set(id, { callback, due: this.now + delay, delay });
    return id;
  };

  clearTimeout = (id) => {
    this.timers.delete(id);
  };

  advance(milliseconds) {
    this.now += milliseconds;
    const due = [...this.timers.entries()]
      .filter(([, timer]) => timer.due <= this.now)
      .sort((a, b) => a[1].due - b[1].due);
    for (const [id, timer] of due) {
      if (!this.timers.delete(id)) continue;
      timer.callback();
    }
  }
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function opacityTransitionEnd(video) {
  const event = new Event("transitionend");
  Object.defineProperty(event, "propertyName", { value: "opacity" });
  video.dispatchEvent(event);
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
}

function createHarness({ reducedMotion = false, saveData = false, roots } = {}) {
  const root = roots?.[0] || new FakeRoot();
  const documentRef = new FakeDocument(roots || [root]);
  const timers = new TimerHarness();
  const options = {
    documentRef,
    connection: { saveData },
    motionQuery: { matches: reducedMotion },
    setTimeoutFn: timers.setTimeout,
    clearTimeoutFn: timers.clearTimeout
  };
  return {
    root,
    documentRef,
    windowRef: documentRef.defaultView,
    timers,
    options,
    controller: new CinematicHeroVideo(root, options)
  };
}

async function startPlaying(harness) {
  harness.controller.start();
  await settle();
  assert.equal(harness.root.videos[0].paused, false, "the test setup requires initial playback");
}

async function beginThresholdTransition(harness, remaining = 0.79) {
  const active = harness.root.videos[harness.controller.activeLayerIndex];
  active.duration = 10;
  active.currentTime = 10 - remaining;
  active.dispatchEvent(new Event("timeupdate"));
  await settle();
}

async function finishTransition(harness) {
  const incoming = harness.root.videos[harness.controller.incomingLayerIndex];
  opacityTransitionEnd(incoming);
  await settle();
}

async function beginPreparingWithDeferredIncoming(harness) {
  await startPlaying(harness);
  const outgoing = harness.root.videos[0];
  const incoming = harness.root.videos[1];
  const preHidePlay = deferred();
  incoming.playOutcomes.push(preHidePlay);
  outgoing.duration = 10;
  outgoing.currentTime = 9.21;
  outgoing.dispatchEvent(new Event("timeupdate"));
  assert.equal(harness.controller.transitionPhase, "preparing");
  return { outgoing, incoming, preHidePlay };
}

function hideAndBeginIncomingRecovery(harness, incoming, recoveryPlay) {
  harness.documentRef.hidden = true;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  incoming.playOutcomes.push(recoveryPlay);
  harness.documentRef.hidden = false;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
}

test("kills mutation: clip records are reordered, a third clip is eagerly assigned, or MP4 is assigned before WebM", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  const [active, prepared] = harness.root.videos;

  assert.deepEqual(active.sources.map((source) => source.src), [
    "/videos/ag-refining-molten-pour.webm",
    "/videos/ag-refining-molten-pour.mp4"
  ]);
  assert.deepEqual(prepared.sources.map((source) => source.src), [
    "/videos/ag-refining-silver-ingots.webm",
    "/videos/ag-refining-silver-ingots.mp4"
  ]);
  assert.equal(active.preload, "auto");
  assert.equal(prepared.preload, "metadata");
  assert.equal(active.poster, "/images/ag-refining-molten-pour-poster.webp");
  assert.equal(prepared.poster, "/images/ag-refining-silver-ingots-poster.webp");
  assert.deepEqual(active.assignments.map(({ format }) => format), ["webm", "mp4"]);
  assert.deepEqual(prepared.assignments.map(({ format }) => format), ["webm", "mp4"]);
  assert.ok(harness.root.videos.every((video) => video.sources.every((source) => !source.src.includes("precision-assay"))));
  assert.deepEqual([harness.controller.activeIndex, harness.controller.nextIndex], [0, 1]);
});

test("kills mutation: reduced-motion mode assigns a source or calls load before returning", () => {
  const harness = createHarness({ reducedMotion: true });
  harness.controller.start();

  for (const video of harness.root.videos) {
    assert.deepEqual(video.sources.map((source) => source.src), ["", ""]);
    assert.equal(video.preload, "none");
    assert.equal(video.networkState, 0);
    assert.equal(video.loadCount, 0);
  }
  assert.equal(harness.controller.transitionPhase, "static");
});

test("kills mutation: Save-Data mode assigns a source or calls load before returning", () => {
  const harness = createHarness({ saveData: true });
  harness.controller.start();

  for (const video of harness.root.videos) {
    assert.deepEqual(video.sources.map((source) => source.src), ["", ""]);
    assert.equal(video.preload, "none");
    assert.equal(video.networkState, 0);
    assert.equal(video.loadCount, 0);
  }
  assert.equal(harness.controller.transitionPhase, "static");
});

test("kills mutation: start loses its idempotence guard and prepares or plays the layers twice", async () => {
  const harness = createHarness();
  harness.controller.start();
  harness.controller.start();
  await settle();
  harness.controller.start();
  await settle();

  assert.deepEqual(harness.root.videos.map((video) => video.loadCount), [1, 1]);
  assert.deepEqual(harness.root.videos.map((video) => video.playCount), [1, 0]);
  assert.deepEqual(harness.root.videos.map((video) => video.assignments.length), [2, 2]);
  assert.equal(harness.root.videos[0].paused, false);
  assert.equal(harness.controller.transitionPhase, "idle");
});

// Mutation killed: prepareLayer trusts load() to keep an autoplay standby layer paused.
test("kills mutation: native autoplay-on-load starts the prepared standby layer concurrently", async () => {
  const harness = createHarness();
  for (const video of harness.root.videos) video.nativeAutoplayOnLoad = true;

  harness.controller.start();
  await settle();

  assert.equal(harness.root.videos[0].paused, false, "the controller must explicitly start the active layer");
  assert.equal(harness.root.videos[1].paused, true, "source preparation must leave the standby layer paused");
  assert.deepEqual(harness.root.videos.map((video) => video.playCount), [1, 0]);
  assert.equal(harness.controller.transitionPhase, "idle");
});

test("kills mutation: the 0.8-second event threshold is changed to 1.5 seconds or made exclusive", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  const active = harness.root.videos[0];
  active.duration = 10;
  active.currentTime = 9.19;
  active.dispatchEvent(new Event("timeupdate"));
  await settle();
  assert.equal(harness.controller.transitioning, false);
  assert.equal(harness.root.videos[1].paused, true);

  active.currentTime = 9.21;
  active.dispatchEvent(new Event("timeupdate"));
  await settle();
  assert.equal(harness.controller.transitioning, true);
  assert.equal(harness.controller.transitionPhase, "crossfading");
  assert.equal(harness.root.videos[1].paused, false);
  assert.equal(harness.controller.activeIndex, 0, "roles must not swap when the fade only begins");
});

test("kills mutation: ended bypasses or fails to enter the same guarded transition path", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  const active = harness.root.videos[0];
  active.duration = Number.NaN;
  active.ended = true;
  active.dispatchEvent(new Event("ended"));
  active.dispatchEvent(new Event("ended"));
  active.dispatchEvent(new Event("timeupdate"));
  await settle();

  assert.equal(harness.controller.transitionPhase, "crossfading");
  assert.equal(harness.controller.incomingLayerIndex, 1);
  assert.equal(harness.root.videos[1].playCount, 1, "parallel transitions would replay the incoming layer");
  assert.equal(harness.controller.activeIndex, 0);
});

test("kills mutation: the transition guard is removed and repeated media events start parallel fades", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  await beginThresholdTransition(harness);
  const active = harness.root.videos[0];
  active.dispatchEvent(new Event("timeupdate"));
  active.dispatchEvent(new Event("ended"));
  await settle();

  assert.equal(harness.root.videos[1].playCount, 1);
  assert.equal(harness.timers.timers.size, 1);
  assert.deepEqual([harness.controller.activeIndex, harness.controller.nextIndex], [0, 1]);
});

test("kills mutation: role swap/reset occurs before playback and the CSS opacity transition completes", async () => {
  const harness = createHarness();
  const originalContent = structuredClone(harness.root.heroContent);
  await startPlaying(harness);
  const [outgoing, incoming] = harness.root.videos;
  outgoing.duration = 10;
  outgoing.currentTime = 9.21;
  outgoing.dispatchEvent(new Event("timeupdate"));
  await settle();

  assert.equal(incoming.paused, false, "incoming playback must start before role swap");
  assert.equal(harness.controller.activeLayerIndex, 0);
  assert.equal(outgoing.currentTime, 9.21, "the outgoing frame must survive the crossfade");
  assert.equal(outgoing.classList.contains("is-visible"), false);
  assert.equal(incoming.classList.contains("is-visible"), true);
  assert.deepEqual([outgoing.style.opacity, incoming.style.opacity], ["0", "1"]);
  assert.deepEqual(harness.root.heroContent, originalContent, "runtime media changes must not touch hero content");

  opacityTransitionEnd(outgoing);
  assert.equal(harness.controller.activeIndex, 0, "an unrelated transitionend must not swap roles");
  opacityTransitionEnd(incoming);
  assert.equal(harness.controller.activeIndex, 1);
  assert.equal(harness.controller.activeLayerIndex, 1);
  assert.equal(outgoing.currentTime, 0);
  assert.equal(outgoing.preload, "metadata");
  assert.deepEqual(outgoing.sources.map((source) => source.src), [
    "/videos/ag-refining-precision-assay.webm",
    "/videos/ag-refining-precision-assay.mp4"
  ]);
});

test("kills mutation: the 950ms transition fallback is omitted or swaps before the 800ms CSS fade can finish", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  await beginThresholdTransition(harness);

  harness.timers.advance(949);
  assert.equal(harness.controller.activeIndex, 0);
  assert.equal(harness.root.videos[0].currentTime, 9.21);
  harness.timers.advance(1);
  assert.equal(harness.controller.activeIndex, 1);
  assert.equal(harness.root.videos[0].currentTime, 0);
});

test("kills mutation: next-index arithmetic fails to wrap from clip three to clip one", async () => {
  const harness = createHarness();
  await startPlaying(harness);

  await beginThresholdTransition(harness);
  await finishTransition(harness);
  assert.deepEqual([harness.controller.activeIndex, harness.controller.nextIndex], [1, 2]);
  await beginThresholdTransition(harness);
  await finishTransition(harness);
  assert.deepEqual([harness.controller.activeIndex, harness.controller.nextIndex], [2, 0]);
  const preparedMoltenLayer = harness.root.videos[1];
  assert.equal(preparedMoltenLayer.preload, "metadata");
  assert.deepEqual(preparedMoltenLayer.sources.map((source) => source.src), [
    "/videos/ag-refining-molten-pour.webm",
    "/videos/ag-refining-molten-pour.mp4"
  ]);
  await beginThresholdTransition(harness);
  await finishTransition(harness);
  assert.deepEqual([harness.controller.activeIndex, harness.controller.nextIndex], [0, 1]);
});

test("kills mutation: visibilitychange no longer pauses both layers or resumes only the active layer", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  const [active, prepared] = harness.root.videos;

  harness.documentRef.hidden = true;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  assert.equal(active.paused, true);
  assert.equal(prepared.paused, true);
  const preparedPlayCount = prepared.playCount;

  harness.documentRef.hidden = false;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  await settle();
  assert.equal(active.paused, false);
  assert.equal(prepared.paused, true);
  assert.equal(prepared.playCount, preparedPlayCount);
});

test("kills mutation: hiding mid-crossfade loses the incoming identity, unlocks, hard-cuts, or strands recovery", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  await beginThresholdTransition(harness);
  const [outgoing, incoming] = harness.root.videos;
  const loadCounts = harness.root.videos.map((video) => video.loadCount);

  harness.documentRef.hidden = true;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  assert.equal(outgoing.paused, true);
  assert.equal(incoming.paused, true);
  assert.equal(harness.controller.transitionPhase, "crossfading");
  assert.equal(harness.controller.incomingLayerIndex, 1);
  assert.equal(harness.controller.transitioning, true);
  outgoing.dispatchEvent(new Event("ended"));
  assert.equal(incoming.playCount, 1, "hidden media events must not start another transition");

  harness.timers.advance(950);
  assert.equal(harness.controller.activeIndex, 0, "a hidden fallback must preserve the outgoing frame");
  harness.documentRef.hidden = false;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  await settle();
  assert.equal(outgoing.paused, false);
  assert.equal(incoming.paused, false);
  assert.equal(harness.controller.transitionPhase, "crossfading");
  assert.equal(harness.controller.incomingLayerIndex, 1);
  assert.deepEqual(harness.root.videos.map((video) => video.loadCount), loadCounts);
  opacityTransitionEnd(incoming);
  assert.equal(harness.controller.activeIndex, 1);
});

test("kills mutation: a pre-hide fallback or transitionend swaps roles while incoming recovery play is pending", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  await beginThresholdTransition(harness);
  const [outgoing, incoming] = harness.root.videos;
  const outgoingTime = outgoing.currentTime;
  const recoveryPlay = deferred();

  harness.documentRef.hidden = true;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  assert.equal(harness.timers.timers.size, 0, "hiding must suspend the pre-hide fallback immediately");
  incoming.playOutcomes.push(recoveryPlay);
  harness.documentRef.hidden = false;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  assert.equal(incoming.paused, true, "the exact recovery play is still pending");

  harness.timers.advance(950);
  opacityTransitionEnd(incoming);
  await settle();
  assert.equal(harness.controller.activeIndex, 0);
  assert.equal(harness.controller.activeLayerIndex, 0);
  assert.equal(harness.controller.incomingLayerIndex, 1);
  assert.equal(harness.controller.transitioning, true);
  assert.equal(harness.controller.transitionPhase, "crossfading");
  assert.equal(outgoing.currentTime, outgoingTime, "the outgoing recovery frame must not be reset");
  assert.equal(harness.timers.timers.size, 0, "the pre-hide fallback must be suspended, not left armed");

  recoveryPlay.resolve();
  await settle();
  assert.equal(incoming.paused, false);
  assert.equal(harness.controller.activeIndex, 0, "recovery success only re-arms completion");
  assert.equal(harness.timers.timers.size, 1);
  harness.timers.advance(949);
  assert.equal(harness.controller.activeIndex, 0);
  harness.timers.advance(1);
  assert.equal(harness.controller.activeIndex, 1);
  assert.equal(outgoing.currentTime, 0);
});

test("kills mutation: visibility recovery ignores an incoming play interrupted during the preparing phase", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  const pendingPlay = deferred();
  harness.root.videos[1].playOutcomes.push(pendingPlay);
  const active = harness.root.videos[0];
  active.duration = 10;
  active.currentTime = 9.21;
  active.dispatchEvent(new Event("timeupdate"));
  assert.equal(harness.controller.transitionPhase, "preparing");

  harness.documentRef.hidden = true;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  pendingPlay.resolve();
  await settle();
  assert.equal(harness.controller.transitionPhase, "preparing");
  assert.equal(harness.root.videos[1].paused, true, "stale hidden fulfillment must be made inert before visibility recovery");

  harness.documentRef.hidden = false;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  await settle();
  assert.equal(harness.root.videos[0].paused, false);
  assert.equal(harness.root.videos[1].paused, false);
  assert.equal(harness.controller.transitionPhase, "crossfading");
  assert.equal(harness.controller.incomingLayerIndex, 1);
});

test("kills mutation: stale pre-hide incoming fulfillment starts a fade before the exact recovery rejects", async () => {
  const harness = createHarness();
  const { outgoing, incoming, preHidePlay } = await beginPreparingWithDeferredIncoming(harness);
  const recoveryPlay = deferred();
  hideAndBeginIncomingRecovery(harness, incoming, recoveryPlay);

  preHidePlay.resolve();
  await settle();
  assert.equal(harness.controller.transitionPhase, "preparing");
  assert.equal(harness.controller.activeIndex, 0);
  assert.deepEqual([outgoing.style.opacity, incoming.style.opacity], ["1", "0"]);
  assert.equal(harness.timers.timers.size, 0);

  recoveryPlay.reject(new Error("exact recovery failed"));
  await settle();
  assert.equal(harness.controller.transitionPhase, "idle");
  assert.equal(harness.controller.transitioning, false);
  assert.equal(harness.controller.activeIndex, 0);
  assert.deepEqual([outgoing.style.opacity, incoming.style.opacity], ["1", "0"]);
});

test("kills mutation: stale pre-hide incoming rejection cancels a pending exact recovery that later succeeds", async () => {
  const harness = createHarness();
  const { incoming, preHidePlay } = await beginPreparingWithDeferredIncoming(harness);
  const recoveryPlay = deferred();
  hideAndBeginIncomingRecovery(harness, incoming, recoveryPlay);

  preHidePlay.reject(new Error("stale pre-hide failure"));
  await settle();
  assert.equal(harness.controller.transitionPhase, "preparing");
  assert.equal(harness.controller.transitioning, true);
  assert.equal(harness.controller.incomingLayerIndex, 1);

  recoveryPlay.resolve();
  await settle();
  assert.equal(harness.controller.transitionPhase, "crossfading");
  assert.equal(harness.controller.activeIndex, 0);
  assert.equal(harness.timers.timers.size, 1);
});

test("kills mutation: a late pre-hide rejection cancels a crossfade started by exact recovery success", async () => {
  const harness = createHarness();
  const { incoming, preHidePlay } = await beginPreparingWithDeferredIncoming(harness);
  const recoveryPlay = deferred();
  hideAndBeginIncomingRecovery(harness, incoming, recoveryPlay);

  recoveryPlay.resolve();
  await settle();
  assert.equal(harness.controller.transitionPhase, "crossfading");
  preHidePlay.reject(new Error("late stale failure"));
  await settle();
  assert.equal(harness.controller.transitionPhase, "crossfading");
  assert.equal(harness.controller.transitioning, true);
  assert.equal(harness.controller.incomingLayerIndex, 1);
  assert.equal(harness.timers.timers.size, 1);
});

test("kills mutation: stale pre-hide fulfillment revives incoming playback after exact recovery rejection", async () => {
  const harness = createHarness();
  const { incoming, preHidePlay } = await beginPreparingWithDeferredIncoming(harness);
  const recoveryPlay = deferred();
  hideAndBeginIncomingRecovery(harness, incoming, recoveryPlay);

  recoveryPlay.reject(new Error("exact recovery failed"));
  await settle();
  assert.equal(harness.controller.transitionPhase, "idle");
  assert.equal(incoming.paused, true);
  preHidePlay.resolve();
  await settle();

  assert.equal(harness.controller.transitionPhase, "idle");
  assert.equal(harness.controller.transitioning, false);
  assert.equal(harness.controller.incomingLayerIndex, null);
  assert.equal(incoming.paused, true);
  assert.equal(incoming.style.opacity, "0");
});

test("kills mutation: a stale active recovery rejection overrides the newest visible active replay", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  const active = harness.root.videos[0];
  const staleRecovery = deferred();
  const exactRecovery = deferred();

  harness.documentRef.hidden = true;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  active.playOutcomes.push(staleRecovery);
  harness.documentRef.hidden = false;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  active.paused = false;

  harness.documentRef.hidden = true;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  active.playOutcomes.push(exactRecovery);
  harness.documentRef.hidden = false;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  exactRecovery.resolve();
  await settle();
  assert.equal(active.paused, false);
  assert.equal(harness.controller.transitionPhase, "idle");

  staleRecovery.reject(new Error("obsolete active recovery failed"));
  await settle();
  assert.equal(harness.controller.transitionPhase, "idle");
  assert.equal(harness.root.poster.style.opacity, "0");
  assert.equal(active.style.opacity, "1");
  assert.equal(active.paused, false);
});

test("kills mutation: the initial play rejection is not caught and the poster is hidden", async () => {
  const harness = createHarness();
  harness.root.videos[0].playOutcomes.push(new Error("autoplay denied"));
  const unhandled = [];
  const onUnhandled = (error) => unhandled.push(error);
  process.on("unhandledRejection", onUnhandled);
  try {
    harness.controller.start();
    await settle();
  } finally {
    process.off("unhandledRejection", onUnhandled);
  }

  assert.deepEqual(unhandled, []);
  assert.equal(harness.root.poster.classList.contains("is-hidden"), false);
  assert.equal(harness.root.poster.style.opacity, "1");
  assert.ok(harness.root.videos.every((video) => video.style.opacity === "0"));
  assert.equal(harness.controller.transitionPhase, "static");
  harness.root.videos[0].duration = 10;
  harness.root.videos[0].currentTime = 9.5;
  harness.root.videos[0].dispatchEvent(new Event("timeupdate"));
  assert.equal(harness.controller.transitioning, false);
});

test("kills mutation: an incoming decode/play rejection hard-cuts or retries recursively instead of deferring", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  const [outgoing, incoming] = harness.root.videos;
  incoming.playOutcomes.push(new Error("decode failed"));
  outgoing.duration = 10;
  outgoing.currentTime = 9.21;
  outgoing.dispatchEvent(new Event("timeupdate"));
  await settle();

  assert.equal(harness.controller.transitioning, false);
  assert.equal(harness.controller.transitionPhase, "idle");
  assert.equal(harness.controller.activeIndex, 0);
  assert.equal(outgoing.currentTime, 9.21);
  assert.deepEqual([outgoing.style.opacity, incoming.style.opacity], ["1", "0"]);
  assert.equal(incoming.paused, true);
  assert.equal(incoming.playCount, 1, "the failure handler must not recursively retry");

  outgoing.dispatchEvent(new Event("timeupdate"));
  await settle();
  assert.equal(harness.controller.transitionPhase, "crossfading");
  assert.equal(incoming.playCount, 2, "a later safe media event may retry");
});

test("kills mutation: an incoming error is allowed to hide the outgoing frame or leave the transition locked", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  await beginThresholdTransition(harness);
  const [outgoing, incoming] = harness.root.videos;
  const outgoingTime = outgoing.currentTime;
  incoming.error = { code: 3, message: "MEDIA_ERR_DECODE" };
  incoming.dispatchEvent(new Event("error"));

  assert.equal(harness.controller.transitioning, false);
  assert.equal(harness.controller.transitionPhase, "idle");
  assert.equal(harness.controller.incomingLayerIndex, null);
  assert.equal(harness.controller.activeIndex, 0);
  assert.equal(outgoing.currentTime, outgoingTime);
  assert.equal(outgoing.paused, false);
  assert.deepEqual([outgoing.style.opacity, incoming.style.opacity], ["1", "0"]);
  assert.equal(harness.root.poster.style.opacity, "0", "the existing outgoing frame remains the visual fallback");

  outgoing.dispatchEvent(new Event("ended"));
  await settle();
  assert.equal(harness.controller.transitioning, true);
});

test("kills mutation: an active-layer media error leaves the hidden poster unavailable", async () => {
  const harness = createHarness();
  await startPlaying(harness);
  const active = harness.root.videos[0];
  active.error = { code: 3, message: "MEDIA_ERR_DECODE" };
  active.dispatchEvent(new Event("error"));

  assert.equal(harness.controller.transitionPhase, "static");
  assert.equal(harness.controller.staticMode, true);
  assert.equal(harness.root.poster.style.opacity, "1");
  assert.equal(harness.root.poster.classList.contains("is-hidden"), false);
  assert.ok(harness.root.videos.every((video) => video.paused && video.style.opacity === "0"));
});

test("kills mutation: destroy omits listener, source, pause, timer cleanup or allows later events to restart", async () => {
  const harness = createHarness();
  harness.root.cinematicHeroVideoController = harness.controller;
  await startPlaying(harness);
  await beginThresholdTransition(harness);
  const playCounts = harness.root.videos.map((video) => video.playCount);
  assert.equal(harness.timers.timers.size, 1);

  harness.windowRef.dispatchEvent(new Event("pagehide"));
  assert.equal(harness.controller.destroyed, true);
  assert.equal(harness.root.cinematicHeroVideoController, undefined);
  assert.equal(harness.timers.timers.size, 0);
  for (const video of harness.root.videos) {
    assert.equal(video.paused, true);
    assert.equal(video.preload, "none");
    assert.deepEqual(video.sources.map((source) => source.src), ["", ""]);
    assert.equal(video.classList.contains("is-visible"), false);
    assert.equal(video.style.opacity, "0");
  }
  assert.equal(harness.root.poster.style.opacity, "1");

  harness.documentRef.hidden = false;
  harness.documentRef.dispatchEvent(new Event("visibilitychange"));
  for (const video of harness.root.videos) {
    video.dispatchEvent(new Event("ended"));
    opacityTransitionEnd(video);
  }
  harness.timers.advance(2000);
  await settle();
  assert.deepEqual(harness.root.videos.map((video) => video.playCount), playCounts);
  assert.equal(harness.controller.transitioning, false);
});

test("kills mutation: pagehide is registered only after dynamic media startup and misses static fallback controllers", () => {
  const scenarios = [
    { label: "reduced motion", reducedMotion: true, saveData: false, invalidShell: false },
    { label: "Save-Data", reducedMotion: false, saveData: true, invalidShell: false },
    { label: "invalid shell", reducedMotion: false, saveData: false, invalidShell: true }
  ];

  for (const scenario of scenarios) {
    const root = new FakeRoot();
    if (scenario.invalidShell) root.videos.pop();
    const documentRef = new FakeDocument([root]);
    const timers = new TimerHarness();
    const [controller] = initializeCinematicHeroVideos(documentRef, {
      connection: { saveData: scenario.saveData },
      motionQuery: { matches: scenario.reducedMotion },
      setTimeoutFn: timers.setTimeout,
      clearTimeoutFn: timers.clearTimeout
    });

    assert.equal(root.cinematicHeroVideoController, controller, `${scenario.label} must mount one lifecycle owner`);
    assert.ok(root.videos.every((video) => video.loadCount === 0), `${scenario.label} must not call load during startup`);
    assert.ok(root.videos.every((video) => video.sources.every((source) => source.src === "")), `${scenario.label} must not assign sources`);
    documentRef.defaultView.dispatchEvent(new Event("pagehide"));

    assert.equal(controller.destroyed, true, `${scenario.label} must be destroyed by window pagehide`);
    assert.equal(root.cinematicHeroVideoController, undefined, `${scenario.label} must release the root marker`);
    assert.equal(timers.timers.size, 0);
    assert.ok(root.videos.every((video) => video.paused), `${scenario.label} layers must remain paused`);
    assert.ok(root.videos.every((video) => video.loadCount === 0), `${scenario.label} teardown must preserve zero load calls`);
    assert.ok(root.videos.every((video) => video.sources.every((source) => source.src === "")), `${scenario.label} teardown must preserve source suppression`);
  }
});

test("kills mutation: a play promise settling after real window pagehide can revive destroyed media", async () => {
  const harness = createHarness();
  harness.root.cinematicHeroVideoController = harness.controller;
  const pendingInitialPlay = deferred();
  harness.root.videos[0].playOutcomes.push(pendingInitialPlay);
  harness.controller.start();
  assert.equal(harness.controller.transitionPhase, "starting");

  harness.windowRef.dispatchEvent(new Event("pagehide"));
  assert.equal(harness.controller.destroyed, true);
  assert.equal(harness.root.cinematicHeroVideoController, undefined);
  pendingInitialPlay.resolve();
  await settle();

  assert.equal(harness.controller.transitionPhase, "destroyed");
  assert.equal(harness.root.poster.style.opacity, "1");
  for (const video of harness.root.videos) {
    assert.equal(video.paused, true);
    assert.equal(video.style.opacity, "0");
    assert.deepEqual(video.sources.map((source) => source.src), ["", ""]);
  }
});

test("kills mutation: remount initialization duplicates a live controller or retains a destroyed instance", async () => {
  const root = new FakeRoot();
  const documentRef = new FakeDocument([root]);
  const timers = new TimerHarness();
  const options = {
    connection: { saveData: false },
    motionQuery: { matches: false },
    setTimeoutFn: timers.setTimeout,
    clearTimeoutFn: timers.clearTimeout
  };

  const [first] = initializeCinematicHeroVideos(documentRef, options);
  await settle();
  const [same] = initializeCinematicHeroVideos(documentRef, options);
  await settle();
  assert.equal(same, first);
  assert.equal(root.videos[0].playCount, 1, "a development remount must not duplicate playback");

  first.destroy();
  const [second] = initializeCinematicHeroVideos(documentRef, options);
  await settle();
  assert.notEqual(second, first);
  assert.equal(root.videos[0].playCount, 2);
  assert.equal(root.cinematicHeroVideoController, second);
  second.destroy();
});

test("kills mutation: the cinematic module is loaded globally instead of only by the homepage document", () => {
  const build = spawnSync(process.execPath, ["scripts/build.mjs"], { cwd: rootDir, encoding: "utf8" });
  assert.equal(build.status, 0, build.stderr || build.stdout);

  const homepage = readFileSync(join(rootDir, "dist", "index.html"), "utf8");
  const contact = readFileSync(join(rootDir, "dist", "contact", "index.html"), "utf8");
  const deployedModule = readFileSync(join(rootDir, "dist", "cinematic-hero-video.js"), "utf8");
  const sourceModule = readFileSync(join(rootDir, "src", "cinematic-hero-video.js"), "utf8");
  assert.equal((homepage.match(/<script type="module" src="\/cinematic-hero-video\.js"><\/script>/g) || []).length, 1);
  assert.doesNotMatch(contact, /cinematic-hero-video\.js/);
  assert.equal(deployedModule, sourceModule, "the deployed module must execute the reviewed source artifact");
});
