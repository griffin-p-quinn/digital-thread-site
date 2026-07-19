/*
 * Portfolio motion controller
 *
 * One opening composition, one scroll choreography, and a small amount of
 * optical depth inside real artifacts. The page remains complete without JS.
 */
(function portfolioMotionController() {
  'use strict';

  const root = document.documentElement;
  const syncMotionVisibility = () => root.classList.toggle('motion-paused', document.hidden);
  syncMotionVisibility();
  document.addEventListener('visibilitychange', syncMotionVisibility, { passive: true });
  const mount = document.getElementById('galleryMount');
  const hero = document.querySelector('.intro');
  const heroArtifactsHost = document.querySelector('[data-decision-thread]');
  const heroArtifacts = [...document.querySelectorAll('.intro-artifact')];
  const threadPath = document.getElementById('decisionThreadPath');
  const threadNodes = [...document.querySelectorAll('.decision-thread__node')];
  const selectedStack = document.querySelector('[data-selected-thread]');
  const selectedPieces = selectedStack
    ? [...selectedStack.querySelectorAll(':scope > .piece')]
    : [];
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactQuery = window.matchMedia('(max-width: 620px)');
  const supportsEnhancement = Boolean(
    hero &&
    selectedStack &&
    threadPath &&
    'IntersectionObserver' in window &&
    'requestAnimationFrame' in window
  );

  const state = {
    reduced: reduceQuery.matches,
    hasPlayedHero: false,
    heroRunning: false,
    heroStart: 0,
    heroDuration: 1680,
    frame: 0,
    metricsDirty: true,
    activeDepth: new Set(),
    depthTargets: [],
    observer: null,
    pieceObserver: null,
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
    'decision-motion--compact',
    'decision-hero-started',
    'decision-hero-complete'
  );
  root.classList.toggle('decision-motion--compact', compactQuery.matches);

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function remap(value, start, end) {
    return clamp((value - start) / Math.max(0.001, end - start), 0, 1);
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
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
      const compactHero = compactQuery.matches;
      artifact.style.setProperty(
        '--decision-hero-delay',
        `${(compactHero ? 430 : 610) + index * (compactHero ? 48 : 72)}ms`
      );
    });
  }

  function settleDecisionThread() {
    threadPath.style.strokeDasharray = '1';
    threadPath.style.strokeDashoffset = '0';
    threadNodes.forEach((node) => node.classList.add('is-reached'));
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
    settleDecisionThread();
    resetDepth();
  }

  function updateSelectedProgress() {
    if (!selectedStack || state.reduced || compactQuery.matches) return;
    const rect = selectedStack.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const start = viewport * 0.78;
    const travel = Math.max(1, rect.height + viewport * 0.46);
    const progress = clamp((start - rect.top) / travel, 0, 1);
    selectedStack.style.setProperty('--decision-selected-progress', progress.toFixed(4));
  }

  function updateSelectedPieces() {
    if (state.reduced || compactQuery.matches) return;
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
    if (compactQuery.matches) return 0;
    const requested = Number(target.dataset.decisionDepth) || 6;
    if (window.innerWidth <= 1024) return Math.min(3, requested);
    return Math.min(7, requested);
  }

  function updateDepth() {
    if (state.reduced || compactQuery.matches) return;
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
    if (compactQuery.matches && !state.heroRunning) return;
    state.metricsDirty = true;
    queueFrame();
  }

  function startHero() {
    state.heroDuration = window.innerWidth <= 620 ? 1320 : 1720;
    state.hasPlayedHero = true;
    state.heroRunning = true;
    state.heroStart = performance.now() + 100;
    root.classList.remove(
      'decision-motion--static',
      'decision-motion--reduced',
      'decision-hero-complete'
    );
    root.classList.add('decision-motion');
    settleDecisionThread();

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
    settleDecisionThread();
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
      if (compactQuery.matches) {
        target.classList.remove('is-decision-depth-active');
        state.activeDepth.delete(target);
        target.style.setProperty('--decision-depth-y', '0px');
        return;
      }
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

  function setupCompactPieceObserver() {
    if (!compactQuery.matches || state.pieceObserver) return;

    state.pieceObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        commissionPiece(entry.target);
        state.pieceObserver.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.08
    });

    selectedPieces.forEach((piece) => {
      if (!piece.classList.contains('is-decision-commissioned')) {
        state.pieceObserver.observe(piece);
      }
    });
  }

  function handleCompactPreference(event) {
    root.classList.toggle('decision-motion--compact', event.matches);

    if (event.matches) {
      if (selectedStack) selectedStack.style.setProperty('--decision-selected-progress', '1');
      resetDepth();
      setupCompactPieceObserver();
      return;
    }

    if (state.pieceObserver) {
      state.pieceObserver.disconnect();
      state.pieceObserver = null;
    }
    invalidateMetrics();
  }

  function setupObservers() {
    state.observer = new IntersectionObserver(handleIntersections, {
      rootMargin: '18% 0px 18% 0px',
      threshold: [0, 0.08]
    });

    state.depthTargets.forEach((target) => state.observer.observe(target));
    setupCompactPieceObserver();

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
  updateSelectedPieces();

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

  if (typeof compactQuery.addEventListener === 'function') {
    compactQuery.addEventListener('change', handleCompactPreference);
  } else if (typeof compactQuery.addListener === 'function') {
    compactQuery.addListener(handleCompactPreference);
  }

  if (state.reduced) makeStatic(true);
  else startHero();
})();

/* Keep the compact masthead honest about the section currently being read. */
(function portfolioScrollspy() {
  'use strict';

  const nav = document.querySelector('.topbar-nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')]
    .map(link => ({ link, section:document.querySelector(link.getAttribute('href')) }))
    .filter(item => item.section);
  if (!links.length) return;

  let frame = 0;
  let current = '';

  function activate(item) {
    const id = item.section.id;
    if (id === current) return;
    current = id;
    links.forEach(candidate => {
      const active = candidate === item;
      candidate.link.classList.toggle('active', active);
      if (active) candidate.link.setAttribute('aria-current', 'location');
      else candidate.link.removeAttribute('aria-current');
    });

    if (matchMedia('(max-width: 720px)').matches) {
      const left = Math.max(0, item.link.offsetLeft - (nav.clientWidth - item.link.offsetWidth) / 2);
      nav.scrollTo({ left, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  function update() {
    frame = 0;
    const chrome = document.querySelector('.topbar')?.getBoundingClientRect().height || 56;
    const activationLine = chrome + Math.min(190, innerHeight * .28);
    let active = links[0];
    links.forEach(item => {
      if (item.section.getBoundingClientRect().top <= activationLine) active = item;
    });
    activate(active);
  }

  function queue() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  addEventListener('scroll', queue, { passive:true });
  addEventListener('resize', queue, { passive:true });
  addEventListener('hashchange', queue);
  queue();
})();
