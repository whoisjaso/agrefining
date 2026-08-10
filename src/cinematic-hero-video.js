const CLIPS = [
  { key: "molten-pour", poster: "/images/ag-refining-molten-pour-poster.webp" },
  { key: "silver-ingots", poster: "/images/ag-refining-silver-ingots-poster.webp" },
  { key: "precision-assay", poster: "/images/ag-refining-precision-assay-poster.webp" }
];

const ROOT_CONTROLLER_PROPERTY = "cinematicHeroVideoController";
const VISIBLE_CLASS = "is-visible";
const POSTER_HIDDEN_CLASS = "is-hidden";

function defaultDocument() {
  return typeof document === "undefined" ? null : document;
}

function defaultConnection() {
  return typeof navigator === "undefined" ? null : navigator.connection;
}

function defaultMotionQuery() {
  return typeof matchMedia === "undefined"
    ? { matches: false }
    : matchMedia("(prefers-reduced-motion: reduce)");
}

export class CinematicHeroVideo {
  constructor(root, options = {}) {
    this.root = root;
    this.documentRef = options.documentRef ?? defaultDocument();
    this.connection = options.connection ?? defaultConnection();
    this.motionQuery = options.motionQuery ?? defaultMotionQuery();
    this.setTimeoutFn = options.setTimeoutFn ?? globalThis.setTimeout.bind(globalThis);
    this.clearTimeoutFn = options.clearTimeoutFn ?? globalThis.clearTimeout.bind(globalThis);

    this.layers = Array.from(root?.querySelectorAll("video[data-video-layer]") ?? []).slice(0, 2);
    this.poster = root?.querySelector("[data-cinematic-poster]") ?? null;

    this.activeIndex = 0;
    this.nextIndex = 1;
    this.activeLayerIndex = 0;
    this.incomingLayerIndex = null;
    this.transitionPhase = "idle";
    this.transitioning = false;
    this.destroyed = false;
    this.wasPlayingBeforeHidden = false;

    this.started = false;
    this.staticMode = false;
    this.transitionAttempt = 0;
    this.transitionTimer = null;
    this.hiddenTransitionState = null;
    this.visibilityRecoveryPending = false;
    this.visibilityGeneration = 0;
    this.playGeneration = 0;
    this.currentPlayOperations = new Map();
    this.timerIds = new Set();
    this.listenerCleanupFunctions = new Set();
  }

  start() {
    if (this.started || this.destroyed) return;
    this.started = true;
    this.attachLifecycleListener();

    if (this.motionQuery?.matches || this.connection?.saveData || this.layers.length !== 2) {
      this.staticMode = true;
      this.transitionPhase = "static";
      return;
    }

    this.showPoster();
    for (const layer of this.layers) this.setLayerVisible(layer, false);
    this.prepareLayer(0, 0, "auto");
    this.prepareLayer(1, 1, "metadata");
    this.attachListeners();
    this.transitionPhase = "starting";

    const startAttempt = ++this.transitionAttempt;
    this.startPlayOperation(this.layers[0],
      () => {
        if (!this.isCurrentAttempt(startAttempt) || this.staticMode) return;
        this.setLayerVisible(this.layers[0], true);
        this.hidePoster();
        this.transitionPhase = "idle";
      },
      () => {
        if (!this.isCurrentAttempt(startAttempt)) return;
        this.enterStaticMode();
      }
    );
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.started = false;
    this.transitionAttempt += 1;
    this.transitioning = false;
    this.transitionPhase = "destroyed";
    this.incomingLayerIndex = null;
    this.hiddenTransitionState = null;
    this.visibilityRecoveryPending = false;
    this.invalidatePlayOperations();

    for (const removeListener of this.listenerCleanupFunctions) removeListener();
    this.listenerCleanupFunctions.clear();
    for (const timerId of this.timerIds) this.clearTimeoutFn(timerId);
    this.timerIds.clear();
    this.transitionTimer = null;

    for (const layer of this.layers) {
      layer.pause();
      this.setLayerVisible(layer, false);
      layer.preload = "none";
      const sources = Array.from(layer.querySelectorAll("source[data-video-format], source"));
      const hadAssignedSource = layer.getAttribute("src") !== null
        || sources.some((source) => source.getAttribute("src") !== null);
      layer.removeAttribute("src");
      for (const source of sources) source.removeAttribute("src");
      if (hadAssignedSource) layer.load();
    }
    this.showPoster();

    if (this.root?.[ROOT_CONTROLLER_PROPERTY] === this) {
      delete this.root[ROOT_CONTROLLER_PROPERTY];
    }
  }

  attachLifecycleListener() {
    if (!this.documentRef) return;
    const pageTarget = this.documentRef.defaultView
      ?? (typeof window === "undefined" ? this.documentRef : window);
    this.listen(pageTarget, "pagehide", () => this.destroy());
  }

  attachListeners() {
    for (const [layerIndex, layer] of this.layers.entries()) {
      this.listen(layer, "timeupdate", (event) => this.handleMediaEvent(event));
      this.listen(layer, "ended", (event) => this.handleMediaEvent(event));
      this.listen(layer, "error", () => this.handleLayerError(layerIndex));
      this.listen(layer, "transitionend", (event) => this.handleTransitionEnd(layerIndex, event));
    }

    if (this.documentRef) {
      this.listen(this.documentRef, "visibilitychange", () => this.handleVisibilityChange());
    }
  }

  listen(target, type, handler) {
    target.addEventListener(type, handler);
    this.listenerCleanupFunctions.add(() => target.removeEventListener(type, handler));
  }

  prepareLayer(layerIndex, clipIndex, preload) {
    const layer = this.layers[layerIndex];
    const clip = CLIPS[clipIndex];
    if (!layer || !clip) return;

    layer.pause();
    layer.currentTime = 0;
    layer.poster = clip.poster;
    layer.setAttribute("poster", clip.poster);
    layer.preload = preload;
    const webm = layer.querySelector('[data-video-format="webm"]');
    const mp4 = layer.querySelector('[data-video-format="mp4"]');
    webm?.setAttribute("src", `/videos/ag-refining-${clip.key}.webm`);
    mp4?.setAttribute("src", `/videos/ag-refining-${clip.key}.mp4`);
    layer.load();
    layer.pause();
  }

  handleMediaEvent(event) {
    if (
      this.destroyed
      || this.staticMode
      || this.documentRef?.hidden
      || this.transitioning
      || this.transitionPhase !== "idle"
      || event.currentTarget !== this.layers[this.activeLayerIndex]
    ) return;

    if (event.type === "timeupdate") {
      const { duration, currentTime } = event.currentTarget;
      if (!Number.isFinite(duration) || duration <= 0 || duration - currentTime > 0.8) return;
    }

    this.beginTransition();
  }

  beginTransition() {
    if (this.transitioning || this.destroyed || this.staticMode || this.documentRef?.hidden) return;
    this.transitioning = true;
    this.transitionPhase = "preparing";
    this.incomingLayerIndex = 1 - this.activeLayerIndex;
    const incoming = this.layers[this.incomingLayerIndex];
    incoming.preload = "auto";
    incoming.currentTime = 0;
    const attempt = ++this.transitionAttempt;

    this.startPlayOperation(incoming,
      () => {
        if (!this.isPendingTransition(attempt)) return;
        if (this.documentRef?.hidden) return;
        this.beginCrossfade(attempt);
      },
      () => this.cancelTransition(attempt)
    );
  }

  beginCrossfade(attempt) {
    if (!this.isPendingTransition(attempt) || this.transitionPhase !== "preparing") return;
    this.visibilityRecoveryPending = false;
    this.transitionPhase = "crossfading";
    this.setLayerVisible(this.layers[this.activeLayerIndex], false);
    this.setLayerVisible(this.layers[this.incomingLayerIndex], true);
    this.scheduleTransitionFallback();
  }

  handleTransitionEnd(layerIndex, event) {
    if (
      this.destroyed
      || this.documentRef?.hidden
      || !this.transitioning
      || this.transitionPhase !== "crossfading"
      || this.visibilityRecoveryPending
      || layerIndex !== this.incomingLayerIndex
      || event.propertyName !== "opacity"
    ) return;
    this.finishTransition();
  }

  scheduleTransitionFallback() {
    if (this.visibilityRecoveryPending) return;
    this.clearTransitionFallback();
    const timerId = this.setTimeoutFn(() => {
      this.timerIds.delete(timerId);
      if (this.transitionTimer === timerId) this.transitionTimer = null;
      if (this.destroyed || this.documentRef?.hidden) return;
      this.finishTransition();
    }, 950);
    this.transitionTimer = timerId;
    this.timerIds.add(timerId);
  }

  clearTransitionFallback() {
    if (this.transitionTimer === null) return;
    this.clearTimeoutFn(this.transitionTimer);
    this.timerIds.delete(this.transitionTimer);
    this.transitionTimer = null;
  }

  finishTransition() {
    if (
      !this.transitioning
      || this.transitionPhase !== "crossfading"
      || this.documentRef?.hidden
      || this.visibilityRecoveryPending
    ) return;
    const outgoingLayerIndex = this.activeLayerIndex;
    const incomingLayerIndex = this.incomingLayerIndex;
    const outgoing = this.layers[outgoingLayerIndex];
    const incoming = this.layers[incomingLayerIndex];
    this.clearTransitionFallback();
    this.transitionAttempt += 1;

    outgoing.pause();
    outgoing.currentTime = 0;
    this.setLayerVisible(outgoing, false);
    this.setLayerVisible(incoming, true);
    incoming.preload = "auto";

    this.activeIndex = this.nextIndex;
    this.activeLayerIndex = incomingLayerIndex;
    this.nextIndex = (this.activeIndex + 1) % CLIPS.length;
    this.incomingLayerIndex = null;
    this.transitioning = false;
    this.visibilityRecoveryPending = false;
    this.transitionPhase = "idle";
    this.prepareLayer(outgoingLayerIndex, this.nextIndex, "metadata");
  }

  handleIncomingError(layerIndex) {
    if (!this.transitioning || layerIndex !== this.incomingLayerIndex) return;
    this.cancelTransition(this.transitionAttempt);
  }

  handleLayerError(layerIndex) {
    if (this.destroyed || this.staticMode) return;
    if (layerIndex === this.activeLayerIndex) {
      this.enterStaticMode();
      return;
    }
    this.handleIncomingError(layerIndex);
  }

  cancelTransition(attempt) {
    if (!this.isPendingTransition(attempt)) return;
    const incoming = this.layers[this.incomingLayerIndex];
    this.transitionAttempt += 1;
    this.clearTransitionFallback();
    this.currentPlayOperations.delete(incoming);
    incoming.pause();
    incoming.currentTime = 0;
    incoming.preload = "metadata";
    this.setLayerVisible(incoming, false);
    this.setLayerVisible(this.layers[this.activeLayerIndex], true);
    this.incomingLayerIndex = null;
    this.transitioning = false;
    this.visibilityRecoveryPending = false;
    this.transitionPhase = "idle";
  }

  handleVisibilityChange() {
    if (this.destroyed) return;
    if (this.documentRef.hidden) {
      const active = this.layers[this.activeLayerIndex];
      this.visibilityGeneration += 1;
      this.wasPlayingBeforeHidden = Boolean(active && !active.paused);
      this.hiddenTransitionState = {
        activeLayerIndex: this.activeLayerIndex,
        incomingLayerIndex: this.incomingLayerIndex,
        transitionPhase: this.transitionPhase,
        transitioning: this.transitioning,
        attempt: this.transitionAttempt
      };
      this.visibilityRecoveryPending = this.transitioning
        && (this.transitionPhase === "preparing" || this.transitionPhase === "crossfading");
      this.clearTransitionFallback();
      for (const layer of this.layers) layer.pause();
      return;
    }

    const hiddenState = this.hiddenTransitionState;
    this.hiddenTransitionState = null;
    if (this.staticMode || this.motionQuery?.matches || this.connection?.saveData || !hiddenState) return;

    const active = this.layers[hiddenState.activeLayerIndex];
    const interruptedTransition = hiddenState.transitioning
      && this.transitioning
      && hiddenState.incomingLayerIndex === this.incomingLayerIndex
      && hiddenState.attempt === this.transitionAttempt
      && (hiddenState.transitionPhase === "preparing" || hiddenState.transitionPhase === "crossfading");
    const interruptedStart = hiddenState.transitionPhase === "starting" && this.transitionPhase === "starting";
    if (this.wasPlayingBeforeHidden || interruptedTransition || interruptedStart) {
      this.startPlayOperation(active,
        () => {
          if (!interruptedStart || this.transitionPhase !== "starting") return;
          this.setLayerVisible(active, true);
          this.hidePoster();
          this.transitionPhase = "idle";
        },
        () => this.enterStaticMode()
      );
    }

    if (!interruptedTransition) return;

    const incoming = this.layers[this.incomingLayerIndex];
    this.startPlayOperation(incoming,
      () => {
        if (!this.isPendingTransition(hiddenState.attempt) || this.documentRef?.hidden) return;
        if (hiddenState.transitionPhase === "preparing") {
          this.beginCrossfade(hiddenState.attempt);
        } else if (this.transitionPhase === "crossfading") {
          this.visibilityRecoveryPending = false;
          if (this.transitionTimer === null) this.scheduleTransitionFallback();
        }
      },
      () => this.cancelTransition(hiddenState.attempt)
    );
  }

  playMedia(layer) {
    try {
      return Promise.resolve(layer.play());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  startPlayOperation(layer, onFulfilled, onRejected) {
    const operation = {
      playGeneration: ++this.playGeneration,
      visibilityGeneration: this.visibilityGeneration
    };
    this.currentPlayOperations.set(layer, operation);
    this.playMedia(layer).then(
      () => {
        if (!this.isCurrentPlayOperation(layer, operation)) {
          this.handleStalePlayFulfillment(layer);
          return;
        }
        this.currentPlayOperations.delete(layer);
        onFulfilled();
      },
      (error) => {
        if (!this.isCurrentPlayOperation(layer, operation)) return;
        this.currentPlayOperations.delete(layer);
        onRejected(error);
      }
    );
  }

  isCurrentPlayOperation(layer, operation) {
    const currentOperation = this.currentPlayOperations.get(layer);
    return !this.destroyed
      && operation.visibilityGeneration === this.visibilityGeneration
      && currentOperation?.visibilityGeneration === operation.visibilityGeneration
      && currentOperation?.playGeneration === operation.playGeneration;
  }

  handleStalePlayFulfillment(layer) {
    const layerIndex = this.layers.indexOf(layer);
    const shouldBePlaying = !this.staticMode
      && (layerIndex === this.activeLayerIndex
        || (this.transitioning && layerIndex === this.incomingLayerIndex));
    if (this.destroyed || this.documentRef?.hidden || !shouldBePlaying) layer.pause();
  }

  invalidatePlayOperations() {
    this.visibilityGeneration += 1;
    this.currentPlayOperations.clear();
  }

  enterStaticMode() {
    if (this.destroyed) return;
    this.staticMode = true;
    this.transitionAttempt += 1;
    this.clearTransitionFallback();
    this.transitioning = false;
    this.incomingLayerIndex = null;
    this.visibilityRecoveryPending = false;
    this.transitionPhase = "static";
    this.invalidatePlayOperations();
    for (const layer of this.layers) {
      layer.pause();
      this.setLayerVisible(layer, false);
    }
    this.showPoster();
  }

  isCurrentAttempt(attempt) {
    return !this.destroyed && attempt === this.transitionAttempt;
  }

  isPendingTransition(attempt) {
    return this.isCurrentAttempt(attempt) && this.transitioning && !this.staticMode;
  }

  setLayerVisible(layer, visible) {
    if (!layer) return;
    layer.classList.toggle?.(VISIBLE_CLASS, visible);
    if (!layer.classList.toggle) {
      if (visible) layer.classList.add(VISIBLE_CLASS);
      else layer.classList.remove(VISIBLE_CLASS);
    }
    layer.style.opacity = visible ? "1" : "0";
  }

  hidePoster() {
    if (!this.poster) return;
    this.poster.classList.add(POSTER_HIDDEN_CLASS);
    this.poster.style.opacity = "0";
  }

  showPoster() {
    if (!this.poster) return;
    this.poster.classList.remove(POSTER_HIDDEN_CLASS);
    this.poster.style.opacity = "1";
  }
}

export function initializeCinematicHeroVideos(documentRef = defaultDocument(), options = {}) {
  if (!documentRef) return [];
  return Array.from(documentRef.querySelectorAll("[data-cinematic-hero-media]"), (root) => {
    const mounted = root[ROOT_CONTROLLER_PROPERTY];
    if (mounted && !mounted.destroyed) return mounted;
    const controller = new CinematicHeroVideo(root, { ...options, documentRef });
    root[ROOT_CONTROLLER_PROPERTY] = controller;
    controller.start();
    return controller;
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initializeCinematicHeroVideos(document), { once: true });
  } else {
    initializeCinematicHeroVideos(document);
  }
}
