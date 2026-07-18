/*
 * Portfolio motion controller
 *
 * One opening composition, one scroll choreography, and a small amount of
 * optical depth inside real artifacts. The page remains complete without JS.
 */
(function portfolioMotionController() {
  'use strict';

  const root = document.documentElement;
  const mount = document.getElementById('galleryMount');
  const hero = document.querySelector('.intro');
  const heroArtifactsHost = document.querySelector('[data-decision-thread]');
  const heroArtifacts = [...document.querySelectorAll('.intro-artifact')];
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
    heroDuration: 1680,
    pathLength: 0,
    frame: 0,
    pointerFrame: 0,
    metricsDirty: true,
    activeDepth: new Set(),
    depthTargets: [],
    observer: null,
    resizeObserver: null
  };

  root.classList.remove(
    'editorial-motion',
    'editorial-motion-ready',
    'editorial-motion-settled',
    'editorial-motion-reduced',
    'decision-motion',
    'decision-motion--static',
    'decision-motion--reduced',
    'decision-hero-started',
    'decision-hero-complete'
  );

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function remap(value, start, end) {
    return clamp((value - start) / Math.max(0.001, end - start), 0, 1);
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
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
    if (cover.querySelector('svg, .system-schematic')) return 'diagram';
    return 'text';
  }

  function writePieceProgress(piece, index, progress) {
    if (!piece) return;

    const normalized = clamp(progress, 0, 1);
    const visual = easeOutCubic(remap(normalized, 0, 0.58));
    const copy = easeOutCubic(remap(normalized, 0.16, 0.76));
    const detail = easeOutCubic(remap(normalized, 0.42, 1));
    const branch = easeOutCubic(remap(normalized, 0, 0.34));
    const direction = index % 2 === 0 ? -1 : 1;

    piece.style.setProperty('--decision-visual-inset', `${((1 - visual) * 100).toFixed(2)}%`);
    piece.style.setProperty('--decision-visual-shift', `${(direction * (1 - visual) * 34).toFixed(2)}px`);
    piece.style.setProperty('--decision-visual-scale', (0.985 + visual * 0.015).toFixed(4));
    piece.style.setProperty('--decision-copy-opacity', copy.toFixed(4));
    piece.style.setProperty('--decision-copy-y', `${((1 - copy) * 22).toFixed(2)}px`);
    piece.style.setProperty('--decision-copy-inset', `${((1 - copy) * 100).toFixed(2)}%`);
    piece.style.setProperty('--decision-detail-opacity', detail.toFixed(4));
    piece.style.setProperty('--decision-detail-y', `${((1 - detail) * 18).toFixed(2)}px`);
    piece.style.setProperty('--decision-branch-progress', branch.toFixed(4));
    piece.style.setProperty('--decision-node-opacity', remap(normalized, 0.08, 0.3).toFixed(4));
    piece.style.setProperty('--decision-node-scale', (0.55 + remap(normalized, 0.08, 0.3) * 0.45).toFixed(4));
  }

  function commissionPiece(piece) {
    if (!piece) return;
    const index = selectedPieces.indexOf(piece);
    piece.classList.add('is-decision-commissioned');
    writePieceProgress(piece, Math.max(0, index), 1);
  }

  function commissionEverything() {
    selectedPieces.forEach(commissionPiece);
    if (selectedStack) selectedStack.style.setProperty('--decision-selected-progress', '1');
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
      writePieceProgress(piece, index, 0);

      const cover = piece.querySelector('.cover');
      const kind = mediaKindFor(cover);
      if (cover && (kind === 'capture' || kind === 'diagram')) {
        cover.classList.add('decision-depth');
        cover.dataset.decisionObserve = 'depth';
        cover.dataset.decisionDepth = '7';
        state.depthTargets.push(cover);
      }
    });

    heroArtifacts.forEach((artifact, index) => {
      /* Time values are authored here so CSS does not depend on unsupported
         multiplication inside calc(). */
      artifact.style.setProperty('--decision-hero-order', String(index));
      const compactHero = window.innerWidth <= 620;
      artifact.style.setProperty(
        '--decision-hero-delay',
        `${(compactHero ? 430 : 610) + index * (compactHero ? 48 : 72)}ms`
      );

      if (!artifact.querySelector('img, .maia-schematic')) return;
      artifact.classList.add('decision-depth');
      artifact.dataset.decisionObserve = 'depth';
      artifact.dataset.decisionDepth = artifact.classList.contains('intro-artifact--edge') ? '3' : '5';
      state.depthTargets.push(artifact);
    });
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
    hero.style.setProperty('--decision-ambient-x', '0px');
    hero.style.setProperty('--decision-ambient-y', '0px');
  }

  function updateSelectedProgress() {
    if (!selectedStack || state.reduced) return;
    const rect = selectedStack.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const start = viewport * 0.78;
    const travel = Math.max(1, rect.height + viewport * 0.46);
    const progress = clamp((start - rect.top) / travel, 0, 1);
    selectedStack.style.setProperty('--decision-selected-progress', progress.toFixed(4));
  }

  function updateSelectedPieces() {
    if (state.reduced) return;
    const viewport = window.innerHeight || 1;
    const revealStart = viewport * 0.92;
    const revealEnd = viewport * 0.38;
    const revealTravel = Math.max(1, revealStart - revealEnd);
    const writes = [];

    /* Read every box first, then write style variables as a second pass. */
    selectedPieces.forEach((piece, index) => {
      if (piece.classList.contains('is-decision-commissioned')) return;
      const rect = piece.getBoundingClientRect();
      writes.push([
        piece,
        index,
        rect.bottom <= 0
          ? 1
          : clamp((revealStart - rect.top) / revealTravel, 0, 1)
      ]);
    });

    writes.forEach(([piece, index, progress]) => {
      writePieceProgress(piece, index, progress);
      if (progress >= 0.985) commissionPiece(piece);
    });
  }

  function depthRangeFor(target) {
    if (window.innerWidth <= 620) return 0;
    const requested = Number(target.dataset.decisionDepth) || 6;
    if (window.innerWidth <= 1024) return Math.min(3, requested);
    return Math.min(7, requested);
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
    const pathProgress = easeInOutCubic(remap(raw, 0.08, 0.9));
    setThreadProgress(pathProgress);

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
      updateSelectedPieces();
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
    state.heroDuration = window.innerWidth <= 620 ? 1320 : 1680;
    state.hasPlayedHero = true;
    state.heroRunning = true;
    state.heroStart = performance.now() + 100;
    state.pathLength = threadPath.getTotalLength();

    root.classList.remove(
      'decision-motion--static',
      'decision-motion--reduced',
      'decision-hero-complete'
    );
    root.classList.add('decision-motion');
    setThreadProgress(0);

    /* One intentional layout read establishes the aperture's closed state. */
    void hero.offsetWidth;
    window.requestAnimationFrame(() => {
      root.classList.add('decision-hero-started');
      invalidateMetrics();
    });
  }

  function resumeAfterReducedMotion() {
    state.reduced = false;
    root.classList.remove('decision-motion--reduced', 'decision-motion--static');
    root.classList.add('decision-motion', 'decision-hero-started', 'decision-hero-complete');
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
      const target = entry.target;
      target.classList.toggle(
        'is-decision-depth-active',
        entry.isIntersecting && !state.reduced
      );

      if (entry.isIntersecting && !state.reduced) {
        state.activeDepth.add(target);
      } else {
        state.activeDepth.delete(target);
        target.style.setProperty('--decision-depth-y', '0px');
      }
    });
    invalidateMetrics();
  }

  function setupObservers() {
    state.observer = new IntersectionObserver(handleIntersections, {
      rootMargin: '18% 0px 18% 0px',
      threshold: [0, 0.08]
    });

    state.depthTargets.forEach((target) => state.observer.observe(target));

    if ('ResizeObserver' in window) {
      state.resizeObserver = new ResizeObserver(invalidateMetrics);
      state.resizeObserver.observe(selectedStack);
      if (heroArtifactsHost) state.resizeObserver.observe(heroArtifactsHost);
    }
  }

  function handleHeroPointer(event) {
    if (state.reduced || window.innerWidth <= 720) return;
    const rect = hero.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1) - 0.5;
    const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1) - 0.5;

    if (state.pointerFrame) window.cancelAnimationFrame(state.pointerFrame);
    state.pointerFrame = window.requestAnimationFrame(() => {
      state.pointerFrame = 0;
      hero.style.setProperty('--decision-ambient-x', `${(x * 12).toFixed(2)}px`);
      hero.style.setProperty('--decision-ambient-y', `${(y * 8).toFixed(2)}px`);
    });
  }

  function resetHeroPointer() {
    hero.style.setProperty('--decision-ambient-x', '0px');
    hero.style.setProperty('--decision-ambient-y', '0px');
  }

  decoratePortfolio();

  if (!supportsEnhancement) {
    makeStatic(state.reduced);
    return;
  }

  setupObservers();
  updateSelectedPieces();

  selectedStack.addEventListener('focusin', (event) => {
    commissionPiece(event.target.closest('.decision-piece'));
  });

  hero.addEventListener('pointermove', handleHeroPointer, { passive: true });
  hero.addEventListener('pointerleave', resetHeroPointer, { passive: true });
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
