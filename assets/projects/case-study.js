(function caseStudyEnhancements() {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themePreference = window.matchMedia('(prefers-color-scheme: light)');
  const themeKey = 'fabric-theme';

  function readStoredTheme() {
    try {
      const value = window.localStorage.getItem(themeKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (_error) {
      return null;
    }
  }

  function chosenTheme() {
    return readStoredTheme() || (themePreference.matches ? 'light' : 'dark');
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const light = theme === 'light';
      button.setAttribute('aria-pressed', String(light));
      button.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      button.textContent = light ? 'Dark' : 'Light';
    });
  }

  function setStoredTheme(theme) {
    try {
      window.localStorage.setItem(themeKey, theme);
    } catch (_error) {
      // The control still works for this page view when storage is unavailable.
    }
    applyTheme(theme);
  }

  applyTheme(chosenTheme());

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      setStoredTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
    });
  });

  const onSystemThemeChange = (event) => {
    if (!readStoredTheme()) applyTheme(event.matches ? 'light' : 'dark');
  };
  if (typeof themePreference.addEventListener === 'function') {
    themePreference.addEventListener('change', onSystemThemeChange);
  }

  document.querySelectorAll('[data-copy-link]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = document.querySelector('[data-copy-status]');
      try {
        await navigator.clipboard.writeText(window.location.href);
        button.textContent = 'Copied';
        if (status) status.textContent = 'Case-study link copied.';
      } catch (_error) {
        if (status) status.textContent = 'Copy unavailable. Use the address bar to copy this link.';
      }
      window.setTimeout(() => {
        button.textContent = 'Copy link';
      }, 1600);
    });
  });

  let progressFrame = 0;
  function updateReadingProgress() {
    progressFrame = 0;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / scrollable));
    root.style.setProperty('--read-progress', progress.toFixed(4));
  }
  function queueReadingProgress() {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(updateReadingProgress);
  }
  window.addEventListener('scroll', queueReadingProgress, { passive: true });
  window.addEventListener('resize', queueReadingProgress, { passive: true });
  updateReadingProgress();

  const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!reduceMotion.matches && 'IntersectionObserver' in window && revealItems.length) {
    root.classList.add('motion-enabled');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const sections = Array.from(document.querySelectorAll('[data-case-section][id]'));
  const navLinks = Array.from(document.querySelectorAll('.case-nav a[href^="#"]'));
  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const byId = new Map(navLinks.map((link) => [link.getAttribute('href').slice(1), link]));
    const visible = new Map();
    const setCurrent = () => {
      const current = Array.from(visible.entries())
        .filter(([, active]) => active)
        .map(([section]) => section)
        .sort((a, b) => Math.abs(a.getBoundingClientRect().top - 130) - Math.abs(b.getBoundingClientRect().top - 130))[0];
      if (!current) return;
      navLinks.forEach((link) => link.removeAttribute('aria-current'));
      const link = byId.get(current.id);
      if (link) link.setAttribute('aria-current', 'true');
    };
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visible.set(entry.target, entry.isIntersecting));
      setCurrent();
    }, { rootMargin: '-18% 0px -62% 0px', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }
})();
