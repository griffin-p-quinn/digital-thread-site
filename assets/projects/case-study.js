(function caseStudyEnhancements() {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themePreference = window.matchMedia('(prefers-color-scheme: light)');
  const themeKey = 'fabric-theme';

  function hydrateCanonicalCaseStudy() {
    const model = window.PORTFOLIO_CONTENT;
    const projectKey = document.body.dataset.projectKey;
    if (!model || !projectKey || !Array.isArray(model.projects)) return;

    const project = model.projects.find((entry) => entry.k === projectKey);
    if (!project) return;

    const projectByKey = new Map(model.projects.map((entry) => [entry.k, entry]));
    const category = (model.categories || []).find((entry) => entry.key === project.category);
    const setText = (selector, value) => {
      const element = document.querySelector(selector);
      if (element && value) element.textContent = value;
    };
    const setSectionLead = (sectionSelector, value) => {
      const copy = document.querySelector(`${sectionSelector} .story-copy`);
      if (!copy || !value) return;
      let lead = copy.querySelector(':scope > .lead');
      if (!lead) {
        lead = document.createElement('p');
        lead.className = 'lead';
        copy.prepend(lead);
      }
      lead.textContent = value;
    };
    const setMeta = (selector, value) => {
      const element = document.querySelector(selector);
      if (element && value) element.setAttribute('content', value);
    };
    const setLabeledParagraph = (element, label, value) => {
      if (!element || !value) return;
      const strong = document.createElement('strong');
      strong.textContent = `${label} `;
      element.replaceChildren(strong, document.createTextNode(value));
    };
    const validExternalUrl = (value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' ? url.href : '';
      } catch (_error) {
        return '';
      }
    };

    document.title = `${project.title} — Griffin Quinn`;
    setText('.case-hero h1', project.title);
    setText('.case-deck', project.summary);
    setSectionLead('#problem', project.problem);
    setSectionLead('#contribution', project.griffinsRole);
    setSectionLead('#proof', project.proof);
    setSectionLead('#result', project.validation);
    setText('.case-hero .eyebrow', `${category ? category.label : project.category} · ${project.artifactType} · ${project.status}`);

    setMeta('meta[name="description"]', project.summary);
    setMeta('meta[property="og:title"]', `${project.title} — Griffin Quinn`);
    setMeta('meta[property="og:description"]', project.summary);
    setMeta('meta[name="twitter:title"]', `${project.title} — Griffin Quinn`);
    setMeta('meta[name="twitter:description"]', project.summary);

    const roleParagraph = Array.from(document.querySelectorAll('#contribution .story-copy p'))
      .find((paragraph) => paragraph.querySelector('strong')?.textContent.trim().startsWith('Role of generative AI'));
    setLabeledParagraph(roleParagraph, 'Role of generative AI.', project.roleOfGenAI);

    const proofCopy = document.querySelector('#proof .story-copy');
    let boundary = proofCopy?.querySelector('.boundary-note');
    if (!boundary && proofCopy && project.limitations) {
      boundary = document.createElement('p');
      boundary.className = 'boundary-note';
      proofCopy.append(boundary);
    }
    setLabeledParagraph(boundary, 'Boundary.', project.limitations);

    const primaryImage = document.querySelector('.media-figure img');
    const canonicalAlt = model.mediaAlt && model.mediaAlt[project.k];
    if (primaryImage && canonicalAlt) {
      primaryImage.alt = canonicalAlt;
    } else if (canonicalAlt) {
      const primaryGraphic = document.querySelector('figure svg[role="img"]');
      const descriptionId = primaryGraphic?.getAttribute('aria-labelledby')?.split(/\s+/).find((id) => document.getElementById(id)?.tagName.toLowerCase() === 'desc');
      const description = descriptionId ? document.getElementById(descriptionId) : primaryGraphic?.querySelector('desc');
      if (description) description.textContent = canonicalAlt;
    }

    const relatedLinks = document.querySelector('.related-nav .related-links');
    if (relatedLinks) {
      relatedLinks.replaceChildren();
      (project.relatedProjects || []).forEach((relatedKey) => {
        const related = projectByKey.get(relatedKey);
        if (!related || related.public === false) return;
        const slug = model.caseStudySlugs && model.caseStudySlugs[related.k];
        const link = document.createElement('a');
        link.href = slug
          ? `../${slug}/`
          : `../../projects.html#project=${encodeURIComponent(related.k)}`;
        link.textContent = related.title;
        relatedLinks.append(link);
      });
      const portfolioLink = document.createElement('a');
      portfolioLink.href = '../../projects.html';
      portfolioLink.textContent = 'Return to the portfolio';
      relatedLinks.append(portfolioLink);
    }

    document.querySelector('[data-canonical-evidence]')?.remove();
    const externalEvidence = (project.externalEvidence || [])
      .map((item) => ({ item, url: validExternalUrl(item && item.url) }))
      .filter(({ item, url }) => item && item.label && url);
    if (proofCopy && externalEvidence.length) {
      const region = document.createElement('aside');
      region.className = 'case-external-evidence';
      region.dataset.canonicalEvidence = '';
      region.setAttribute('aria-label', 'External evidence');
      const heading = document.createElement('strong');
      heading.textContent = 'External evidence';
      region.append(heading);
      externalEvidence.forEach(({ item, url }) => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.type === 'linkedin' ? `${item.label} — watch on LinkedIn ↗` : `${item.label} ↗`;
        region.append(link);
        if (item.description || item.date) {
          const note = document.createElement('small');
          note.textContent = [item.description, item.date ? `Captured ${item.date}` : ''].filter(Boolean).join(' · ');
          region.append(note);
        }
      });
      proofCopy.append(region);
    }
  }

  hydrateCanonicalCaseStudy();

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
      const dark = theme === 'dark';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      button.textContent = dark ? 'Light' : 'Dark';
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
