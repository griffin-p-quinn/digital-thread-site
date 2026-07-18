/*
 * Decision Thread motion controller.
 *
 * The HTML and CSS remain a complete, visible portfolio without JavaScript.
 * This module adds one progressive-enhancement sequence to the opening and
 * selected work only. Explorations and the archive are deliberately static.
 */
(function decisionThreadController() {
  'use strict';

  const root = document.documentElement;
  const mount = document.getElementById('galleryMount');
  const hero = document.querySelector('.intro');
  const heroArtifactsHost = document.querySelector('[data-decision-thread]');
  const heroArtifacts = [...document.querySelectorAll('.intro-artifact[data-thread-node]')];
  const threadPath = document.getElementById('decisionThreadPath');
  const threadPacket = document.getElementById('decisionThreadPacket');
  const threadNodes = [...document.querySelectorAll('.decision-thread__node')];
  const selectedStack = document.querySelector('[data-selected-thread]');
  const selectedPieces = selectedStack
    ? [...selectedStack.querySelectorAll(':scope > .piece')]
    : [];
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsEnhancement = Boolean(
    hero &&
    selectedStack &&
    threadPath &&
    threadPacket &&
    'IntersectionObserver' in window &&
    'requestAnimationFrame' in window &&
    typeof threadPath.getTotalLength === 'function'
  );

  const state = {
    reduced: reduceQuery.matches,
    hasPlayedHero: false,
    heroRunning: false,
    heroStart: 0,
    heroDuration: 1120,
    pathLength: 0,
    frame: 0,
    metricsDirty: true,
    activeDepth: new Set(),
    depthTargets: [],
    observer: null,
    resizeObserver: null
  };

  /* The old overlay used these classes. Removing them ensures there is only
     one reveal/parallax system even during a bfcache or hot-reload restore. */
  root.classList.remove(
    'editorial-motion',
    'editorial-motion-ready',
    'editorial-motion-settled',
    'editorial-motion-reduced'
  );

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeInOutCubic(value) {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function mediaKindFor(cover) {
    if (!cover) return 'text';
    if (cover.dataset.mediaKind) return cover.dataset.mediaKind;
    if (cover.querySelector('img, video')) return 'capture';
    if (cover.querySelector('svg')) return 'diagram';
    return 'text';
  }

  function decoratePortfolio() {
    if (mount) {
      [...mount.querySelectorAll('article[data-k]')].forEach((article, index) => {
        const cover = article.querySelector('.cover');
        const kind = mediaKindFor(cover);
        const hasVisual = kind === 'capture' || kind === 'diagram';

        article.dataset.media = hasVisual ? 'real' : 'abstract';
        article.dataset.folio = String(index + 1).padStart(2, '0');

        if (cover && hasVisual) {
          cover.dataset.evidence = kind === 'capture'
            ? 'repository-media'
            : 'system-diagram';
        }
      });
    }

    selectedPieces.forEach((piece, index) => {
      piece.classList.add('decision-piece');
      piece.style.setProperty('--decision-piece-order', String(index));
      piece.dataset.decisionObserve = 'reveal';

      const cover = piece.querySelector('.cover');
      const kind = mediaKindFor(cover);
      if (cover && (kind === 'capture' || kind === 'diagram')) {
        cover.classList.add('decision-depth');
        cover.dataset.decisionObserve = 'depth';
        cover.dataset.decisionDepth = '6';
        state.depthTargets.push(cover);
      }
    });

    heroArtifacts.forEach((artifact) => {
      if (!artifact.querySelector('img, .maia-schematic')) return;
      artifact.classList.add('decision-depth');
      artifact.dataset.decisionObserve = 'depth';
      artifact.dataset.decisionDepth = '4';
      state.depthTargets.push(artifact);
    });
  }

  function commissionPiece(piece) {
    if (!piece || piece.classList.contains('is-decision-commissioned')) return;
    piece.classList.add('is-decision-commissioned');
  }

  function commissionEverything() {
    selectedPieces.forEach(commissionPiece);
    if (selectedStack) {
      selectedStack.style.setProperty('--decision-selected-progress', '1');
    }
  }

  function setThreadProgress(progress) {
    const normalized = clamp(progress, 0, 1);
    threadPath.style.strokeDasharray = '1';
    threadPath.style.strokeDashoffset = String(1 - normalized);

    if (!state.pathLength) state.pathLength = threadPath.getTotalLength();
    const point = threadPath.getPointAtLength(state.pathLength * normalized);
    threadPacket.setAttribute('cx', point.x.toFixed(2));
    threadPacket.setAttribute('cy', point.y.toFixed(2));

    const lastNode = Math.max(1, threadNodes.length - 1);
    threadNodes.forEach((node, index) => {
      node.classList.toggle('is-reached', normalized >= index / lastNode - 0.012);
    });
  }

  function resetDepth() {
    state.activeDepth.clear();
    state.depthTargets.forEach((target) => {
      target.classList.remove('is-decision-depth-active');
      target.style.setProperty('--decision-depth-y', '0px');
    });
  }

  function makeStatic(reduced) {
    state.reduced = reduced;
    state.heroRunning = false;
    root.classList.remove('decision-motion', 'decision-hero-started');
    root.classList.add(reduced ? 'decision-motion--reduced' : 'decision-motion--static');
    root.classList.add('decision-hero-complete');
    commissionEverything();
    setThreadProgress(1);
    resetDepth();
  }

  function updateSelectedProgress() {
    if (!selectedStack || state.reduced) return;
    const rect = selectedStack.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const start = viewport * 0.76;
    const travel = Math.max(1, rect.height + viewport * 0.48);
    const progress = clamp((start - rect.top) / travel, 0, 1);
    selectedStack.style.setProperty(
      '--decision-selected-progress',
      progress.toFixed(4)
    );
  }

  function depthRangeFor(target) {
    if (window.innerWidth <= 620) return 0;
    const requested = Number(target.dataset.decisionDepth) || 6;
    if (window.innerWidth <= 1024) return Math.min(3, requested);
    return Math.min(6, requested);
  }

  function updateDepth() {
    if (state.reduced) return;
    const viewport = window.innerHeight || 1;
    const writes = [];

    state.activeDepth.forEach((target) => {
      if (!target.isConnected) {
        state.activeDepth.delete(target);
        return;
      }

      const range = depthRangeFor(target);
      if (!range) {
        writes.push([target, 0]);
        return;
      }

      const rect = target.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const denominator = viewport / 2 + rect.height / 2;
      const progress = clamp((viewport / 2 - center) / denominator, -1, 1);
      writes.push([target, progress * range]);
    });

    writes.forEach(([target, offset]) => {
      target.style.setProperty('--decision-depth-y', `${offset.toFixed(2)}px`);
    });
  }

  function updateHero(now) {
    if (!state.heroRunning || state.reduced) return;
    const raw = clamp((now - state.heroStart) / state.heroDuration, 0, 1);
    const eased = easeInOutCubic(raw);
    setThreadProgress(eased);

    if (raw >= 1) {
      state.heroRunning = false;
      root.classList.add('decision-hero-complete');
    }
  }

  function frame(now) {
    state.frame = 0;

    if (state.metricsDirty) {
      state.metricsDirty = false;
      updateSelectedProgress();
      updateDepth();
    }

    updateHero(now);
    if (state.heroRunning) queueFrame();
  }

  function queueFrame() {
    if (state.frame) return;
    state.frame = window.requestAnimationFrame(frame);
  }

  function invalidateMetrics() {
    state.metricsDirty = true;
    queueFrame();
  }

  function startHero() {
    state.hasPlayedHero = true;
    state.heroRunning = true;
    state.heroStart = performance.now() + 80;
    state.pathLength = threadPath.getTotalLength();

    root.classList.remove(
      'decision-motion--static',
      'decision-motion--reduced',
      'decision-hero-complete'
    );
    root.classList.add('decision-motion');
    setThreadProgress(0);

    /* Establish the progressive-enhancement start styles before changing to
       the commissioned state. This is a single, intentional layout read. */
    void hero.offsetWidth;
    root.classList.add('decision-hero-started');
    invalidateMetrics();
  }

  function resumeAfterReducedMotion() {
    state.reduced = false;
    root.classList.remove('decision-motion--reduced', 'decision-motion--static');
    root.classList.add(
      'decision-motion',
      'decision-hero-started',
      'decision-hero-complete'
    );
    commissionEverything();
    setThreadProgress(1);
    invalidateMetrics();
  }

  function handleMotionPreference(event) {
    if (event.matches) {
      makeStatic(true);
      return;
    }

    if (state.hasPlayedHero) resumeAfterReducedMotion();
    else startHero();
  }

  function handleIntersections(entries) {
    entries.forEach((entry) => {
      const role = entry.target.dataset.decisionObserve;

      if (role === 'reveal') {
        if (entry.isIntersecting || state.reduced) {
          commissionPiece(entry.target);
          state.observer.unobserve(entry.target);
        }
        return;
      }

      if (role === 'depth') {
        entry.target.classList.toggle(
          'is-decision-depth-active',
          entry.isIntersecting && !state.reduced
        );
        if (entry.isIntersecting && !state.reduced) {
          state.activeDepth.add(entry.target);
        } else {
          state.activeDepth.delete(entry.target);
          entry.target.style.setProperty('--decision-depth-y', '0px');
        }
        invalidateMetrics();
      }
    });
  }

  function setupObservers() {
    state.observer = new IntersectionObserver(handleIntersections, {
      rootMargin: '18% 0px 18% 0px',
      threshold: [0, 0.12]
    });

    selectedPieces.forEach((piece) => state.observer.observe(piece));
    state.depthTargets.forEach((target) => state.observer.observe(target));

    if ('ResizeObserver' in window) {
      state.resizeObserver = new ResizeObserver(invalidateMetrics);
      state.resizeObserver.observe(selectedStack);
      if (heroArtifactsHost) state.resizeObserver.observe(heroArtifactsHost);
    }
  }

  decoratePortfolio();

  if (!supportsEnhancement) {
    makeStatic(state.reduced);
    return;
  }

  setupObservers();

  selectedStack.addEventListener('focusin', (event) => {
    commissionPiece(event.target.closest('.decision-piece'));
  });

  window.addEventListener('scroll', invalidateMetrics, { passive: true });
  window.addEventListener('resize', invalidateMetrics, { passive: true });
  window.addEventListener('load', invalidateMetrics, { once: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(invalidateMetrics).catch(() => {});
  }

  if (typeof reduceQuery.addEventListener === 'function') {
    reduceQuery.addEventListener('change', handleMotionPreference);
  } else if (typeof reduceQuery.addListener === 'function') {
    reduceQuery.addListener(handleMotionPreference);
  }

  if (state.reduced) makeStatic(true);
  else startHero();
})();
