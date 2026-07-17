/*
 * Semantic decoration and editorial motion for the project index.
 *
 * Project data, filtering, drawer behavior, and interaction recipes remain
 * owned by projects.html. This module distinguishes verified media from
 * generated cover art, adds folio numbers, and progressively enhances the
 * page with restrained, artifact-led motion.
 */
(function editorialGallery() {
  'use strict';

  const root = document.documentElement;
  const mount = document.getElementById('galleryMount');
  if (!mount) return;

  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canObserve = 'IntersectionObserver' in window;
  const decorated = new WeakSet();
  const depthItems = new Set();
  const activeDepthItems = new Set();
  const heroAnimations = new Set();
  let revealObserver = null;
  let depthObserver = null;
  let framePending = false;

  root.classList.add('editorial-motion');
  root.classList.toggle('editorial-motion-reduced', reduceQuery.matches);

  /* The original headline uses hard line breaks. Two become ordinary word
     spaces at wide sizes; the middle break remains the intentional hinge. */
  const headline = document.querySelector('.intro h1');
  if (headline && !headline.dataset.editorialHeadline) {
    const breaks = [...headline.querySelectorAll('br')];
    breaks.forEach((lineBreak, index) => {
      if (index !== 1) lineBreak.replaceWith(document.createTextNode(' '));
      else {
        lineBreak.classList.add('editorial-break');
        lineBreak.after(document.createTextNode(' '));
      }
    });
    headline.dataset.editorialHeadline = 'true';
  }

  function reveal(element) {
    element.classList.add('is-inview');
  }

  function ensureObservers() {
    if (reduceQuery.matches || !canObserve) return;

    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.09,
        rootMargin: '0px 0px -9% 0px'
      });
    }

    if (!depthObserver) {
      depthObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-depth-active', entry.isIntersecting);
          if (entry.isIntersecting) activeDepthItems.add(entry.target);
          else activeDepthItems.delete(entry.target);
        });
        queueDepthUpdate();
      }, {
        rootMargin: '22% 0px 22% 0px',
        threshold: 0
      });
    }
  }

  function observeReveal(element) {
    if (reduceQuery.matches || !canObserve) {
      reveal(element);
      return;
    }
    ensureObservers();
    revealObserver.observe(element);
  }

  function observeDepth(element, range) {
    if (decorated.has(element)) return;
    decorated.add(element);
    element.classList.add('motion-depth');
    element.dataset.depthRange = String(range);
    depthItems.add(element);

    if (reduceQuery.matches || !canObserve) {
      element.style.setProperty('--eg-parallax-y', '0px');
      return;
    }

    ensureObservers();
    depthObserver.observe(element);
  }

  function decorateHero() {
    const artifacts = [...document.querySelectorAll('.intro-artifact')];
    artifacts.forEach((artifact, index) => {
      if (!artifact.dataset.motionOrder) artifact.dataset.motionOrder = String(index);
      artifact.style.setProperty('--eg-motion-order', String(index));
      observeDepth(artifact, index === 0 ? 10 : 7);
    });
  }

  function decorateGallery() {
    const projects = [...mount.querySelectorAll('article[data-k]')];

    projects.forEach((project, index) => {
      const media = project.querySelector('.cover-media');
      const hasRepositoryMedia = Boolean(media && media.querySelector('img, video'));

      project.dataset.media = hasRepositoryMedia ? 'real' : 'abstract';
      project.dataset.folio = String(index + 1).padStart(2, '0');

      if (!hasRepositoryMedia) return;

      const visual = project.querySelector('.cover');
      if (visual) {
        visual.dataset.evidence = 'repository-media';
        observeDepth(visual, project.classList.contains('piece') ? 9 : 7);
      }

      if (!project.classList.contains('motion-artifact')) {
        project.classList.add('motion-artifact');
        const stagger = (index % 3) * 55;
        project.style.setProperty('--eg-motion-order', String(index % 3));
        project.style.setProperty('--eg-artifact-delay', `${stagger}ms`);
        project.style.setProperty('--eg-copy-delay', `${90 + stagger}ms`);
        observeReveal(project);
      }
    });

    [...mount.querySelectorAll('.gallery-divider')].forEach((divider, index) => {
      if (divider.classList.contains('motion-chapter')) return;
      divider.classList.add('motion-chapter');
      divider.style.setProperty('--eg-motion-order', String(index));
      observeReveal(divider);
    });

    document.body.classList.add('editorial-gallery-ready');
    queueDepthUpdate();
  }

  function updateDepth() {
    framePending = false;

    if (reduceQuery.matches) {
      depthItems.forEach((item) => item.style.setProperty('--eg-parallax-y', '0px'));
      return;
    }

    const viewportHeight = window.innerHeight || 1;
    const reads = [];

    activeDepthItems.forEach((item) => {
      if (!item.isConnected) {
        activeDepthItems.delete(item);
        depthItems.delete(item);
        return;
      }
      const rect = item.getBoundingClientRect();
      const denominator = (viewportHeight + rect.height) / 2;
      const progress = Math.max(-1, Math.min(1,
        (rect.top + rect.height / 2 - viewportHeight / 2) / denominator
      ));
      const mobileFactor = window.innerWidth <= 620 ? 0.55 : 1;
      const range = (Number(item.dataset.depthRange) || 7) * mobileFactor;
      reads.push([item, progress * -range]);
    });

    reads.forEach(([item, offset]) => {
      item.style.setProperty('--eg-parallax-y', `${offset.toFixed(2)}px`);
    });
  }

  function queueDepthUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateDepth);
  }

  function settleHero() {
    root.classList.add('editorial-motion-ready');

    if (reduceQuery.matches || typeof Element.prototype.animate !== 'function') {
      root.classList.add('editorial-motion-settled');
      return;
    }

    const play = (element, keyframes, options) => {
      if (!element) return;
      const animation = element.animate(keyframes, {
        fill: 'both',
        easing: 'cubic-bezier(.22, 1, .36, 1)',
        ...options
      });
      heroAnimations.add(animation);
      animation.finished.then(() => {
        animation.cancel();
        heroAnimations.delete(animation);
      }).catch(() => heroAnimations.delete(animation));
    };

    const copy = [
      [document.querySelector('.intro-kicker'), 40, 14],
      [document.querySelector('.intro h1'), 115, 22],
      [document.querySelector('.intro-lead'), 240, 16]
    ];
    copy.forEach(([element, delay, distance]) => play(element, [
      { opacity: 0, clipPath: 'inset(0 0 18% 0)', transform: `translate3d(0, ${distance}px, 0)` },
      { opacity: 1, clipPath: 'inset(0 0 0 0)', transform: 'translate3d(0, 0, 0)' }
    ], { duration: 780, delay }));

    const profiles = [
      { x: 18, y: 34, scale: .982 },
      { x: -20, y: -12, scale: .982 },
      { x: 18, y: 24, scale: .984 }
    ];
    [...document.querySelectorAll('.intro-artifact')].forEach((artifact, index) => {
      const profile = profiles[index] || { x: 0, y: 22, scale: .985 };
      const x = window.innerWidth <= 620 ? 0 : profile.x;
      const y = window.innerWidth <= 620 ? 20 : profile.y;
      play(artifact, [
        {
          opacity: 0,
          clipPath: 'inset(0 0 12% 0)',
          transform: `translate3d(${x}px, ${y}px, 0) scale(${profile.scale})`
        },
        {
          opacity: 1,
          clipPath: 'inset(0 0 0 0)',
          transform: 'translate3d(0, 0, 0) scale(1)'
        }
      ], { duration: 940, delay: 260 + index * 105 });
    });

    window.setTimeout(() => root.classList.add('editorial-motion-settled'), 1450);
  }

  function queueHeroSettle() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', settleHero, { once: true });
    } else {
      settleHero();
    }
  }

  function handleMotionPreference(event) {
    root.classList.toggle('editorial-motion-reduced', event.matches);

    if (event.matches) {
      heroAnimations.forEach((animation) => animation.cancel());
      heroAnimations.clear();
      root.classList.add('editorial-motion-ready');
      root.classList.add('editorial-motion-settled');
      mount.querySelectorAll('.motion-chapter, .motion-artifact').forEach(reveal);
      activeDepthItems.clear();
      depthItems.forEach((item) => {
        item.classList.remove('is-depth-active');
        item.style.setProperty('--eg-parallax-y', '0px');
      });
      return;
    }

    ensureObservers();
    depthItems.forEach((item) => depthObserver.observe(item));
    queueDepthUpdate();
  }

  decorateHero();
  decorateGallery();
  queueHeroSettle();

  const observer = new MutationObserver((records) => {
    if (records.some((record) => record.addedNodes.length)) decorateGallery();
  });

  observer.observe(mount, { childList: true, subtree: true });
  window.addEventListener('scroll', queueDepthUpdate, { passive: true });
  window.addEventListener('resize', queueDepthUpdate, { passive: true });

  if (typeof reduceQuery.addEventListener === 'function') {
    reduceQuery.addEventListener('change', handleMotionPreference);
  } else if (typeof reduceQuery.addListener === 'function') {
    reduceQuery.addListener(handleMotionPreference);
  }
})();
