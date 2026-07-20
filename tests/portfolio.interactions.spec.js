import { expect, test } from '@playwright/test';
import {
  assertNoHorizontalOverflow,
  gotoPortfolio,
  loadPortfolioModel,
  projectKey,
  readProjectAsset
} from './helpers/portfolio.js';

const workbenchResources = () => performance.getEntriesByType('resource')
  .map((entry) => entry.name)
  .filter((name) => /\/workbenches-[^/]+\.(?:js|css)(?:\?|$)/.test(name));

test.describe('mobile archive', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('keeps descriptions, one compact label, SVG arrows, and contained 44px controls', async ({ page }) => {
    await gotoPortfolio(page, '#archive');

    const heroImage = page.locator('.intro-artifact--maia img');
    await expect(heroImage).toHaveAttribute('srcset', /hero-720\/.*\.webp 720w.*hero-1024\/.*\.webp 1024w/);
    await expect.poll(() => heroImage.evaluate((image) => image.currentSrc)).toMatch(/hero-(?:720|1024)\/mro_cover\.webp$/);
    const downloadedHeroSources = await page.evaluate(() => performance.getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => /mro_cover\.(?:jpg|webp)(?:\?|$)/.test(name)));
    expect(downloadedHeroSources.some((name) => /\.jpg(?:\?|$)/.test(name))).toBe(false);

    const grainStyle = await page.locator('.atmosphere .grain').evaluate((grain) => {
      const style = getComputedStyle(grain);
      return { display: style.display, opacity: style.opacity };
    });
    expect(grainStyle.display).not.toBe('none');
    expect(Number(grainStyle.opacity)).toBeGreaterThan(0);

    const row = page.locator('.archive-row:not([hidden])').first();
    await expect(row.locator('.archive-row__main small')).toBeVisible();

    const arrow = row.locator('.archive-row__arrow');
    await expect(arrow.locator('svg')).toHaveCount(1);
    expect((await arrow.innerText()).trim()).not.toMatch(/[↗➡]/u);
    const usesCurrentColor = await arrow.locator('svg').evaluate((svg) =>
      [...svg.querySelectorAll('*'), svg].some((node) =>
        node.getAttribute('stroke') === 'currentColor' || node.getAttribute('fill') === 'currentColor'));
    expect(usesCurrentColor).toBe(true);

    const visibleLabels = await row.locator('.archive-row__area, .archive-row__status').evaluateAll((nodes) =>
      nodes.filter((node) => {
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden' && node.getBoundingClientRect().height > 0;
      }).length);
    expect(visibleLabels).toBeGreaterThanOrEqual(1);

    const desktopCategories = page.locator('#catTabs');
    const mobileCategory = page.locator('.gc-mobile-category');
    const categorySelect = page.locator('#categorySelect');
    await expect(desktopCategories).toBeHidden();
    await expect(mobileCategory).toBeVisible();
    await expect(categorySelect).toBeVisible();
    expect((await categorySelect.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    expect((await page.locator('#searchInput').boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);

    const controlsOverflow = await page.locator('#galleryControls').evaluate((controls) => {
      const bounds = controls.getBoundingClientRect();
      return [...controls.querySelectorAll('*')]
        .filter((node) => {
          const style = getComputedStyle(node);
          return style.display !== 'none' && style.visibility !== 'hidden';
        })
        .map((node) => {
          const rect = node.getBoundingClientRect();
          return { tag: node.tagName.toLowerCase(), left: rect.left, right: rect.right };
        })
        .filter(({ left, right }) => left < bounds.left - 1 || right > bounds.right + 1);
    });
    expect(controlsOverflow).toEqual([]);

    const targetCategory = await page.locator('.archive-row').nth(8).getAttribute('data-category');
    expect(targetCategory).toBeTruthy();
    await categorySelect.selectOption(targetCategory);
    await expect(categorySelect).toHaveValue(targetCategory);
    await expect.poll(() => page.locator('.archive-row:visible').count()).toBeGreaterThan(0);
    await expect.poll(() => page.locator(`.archive-row:not([data-category="${targetCategory}"]):visible`).count()).toBe(0);
    const visibleCategories = await page.locator('.archive-row:visible').evaluateAll((rows) =>
      [...new Set(rows.map((row) => row.dataset.category))]);
    expect(visibleCategories).toEqual([targetCategory]);
    await assertNoHorizontalOverflow(page);
  });

  test('lands a direct #archive URL at the archive below the fixed header', async ({ page }) => {
    await page.goto('/projects.html#archive', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#archive .archive-row').first()).toBeAttached();

    await expect.poll(() => page.evaluate(() => {
      const archive = document.querySelector('#archive');
      const header = document.querySelector('.topbar');
      if (!archive || !header) return false;
      const archiveTop = archive.getBoundingClientRect().top;
      const headerBottom = header.getBoundingClientRect().bottom;
      return scrollY > innerHeight && archiveTop >= headerBottom - 2 && archiveTop <= headerBottom + 40;
    }), { timeout: 7_500 }).toBe(true);
    await expect(page).toHaveURL(/#archive$/);
    await assertNoHorizontalOverflow(page);
  });

  test('opens the image-first Overview when the non-link body of a selected card is tapped', async ({ page }) => {
    await gotoPortfolio(page);
    const card = page.locator('.piece[data-k="playwright"]');
    const bodyCopy = card.locator('.piece-blurb--lead');
    await bodyCopy.scrollIntoViewIfNeeded();
    await bodyCopy.tap();

    const drawer = page.locator('#studioDrawer');
    const carousel = drawer.getByRole('region', { name: /Maia Local MCP Toolkit project media/i });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('tab', { name: 'Overview', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(carousel).toBeVisible();
    await expect(carousel.locator('[data-carousel-slide]:not([hidden]) img')).toBeVisible();
    await expect(page).toHaveURL(/#project=maia-local-mcp(?:&view=overview)?$/);
    await assertNoHorizontalOverflow(page);
  });
});

test('category and search combine, animate to a stable result, and announce the accurate count', async ({ page }) => {
  await gotoPortfolio(page, '#archive');
  const target = page.locator('.archive-row').filter({ has: page.locator('.archive-row__main strong') }).nth(8);
  const category = await target.getAttribute('data-category');
  const title = await target.locator('.archive-row__main strong').innerText();
  const query = title.toLowerCase().split(/[^a-z0-9]+/).find((token) => token.length >= 4);
  expect(category).toBeTruthy();
  expect(query).toBeTruthy();

  const expected = await page.locator('.archive-row').evaluateAll((rows, input) => rows.filter((row) =>
    row.dataset.category === input.category && row.dataset.search.includes(input.query)).length, { category, query });
  await page.locator(`#catTabs [data-filter="${category}"]`).click();
  await page.locator('#searchInput').fill(query);

  await expect.poll(() => page.locator('.archive-row:visible').count()).toBe(expected);
  const status = page.locator('#resultCount');
  await expect(status).toContainText(String(expected));
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await assertNoHorizontalOverflow(page);
});

test('scrollspy and direct section hashes keep exactly one navigation link current', async ({ page }) => {
  await gotoPortfolio(page, '#archive');
  const links = page.locator('.topbar-nav a[href^="#"]');

  async function expectCurrent(href) {
    await expect.poll(async () => links.evaluateAll((nodes) => nodes
      .filter((node) => node.hasAttribute('aria-current'))
      .map((node) => node.getAttribute('href')))).toEqual([href]);
  }

  await expectCurrent('#archive');
  for (const href of ['#selectedWork', '#explorations', '#archive', '#aboutGriffin']) {
    await page.locator(href).scrollIntoViewIfNeeded();
    await expectCurrent(href);
  }

  await page.goto('/projects.html#explorations');
  await expectCurrent('#explorations');
});

test('direct project hashes expose Overview, Evidence, and Interactive demo tabs', async ({ page }) => {
  await gotoPortfolio(page);
  const href = await page.locator('[data-preview-key]').first().getAttribute('href');
  expect(href).toContain('#project=');
  await page.goto(new URL(href, page.url()).href);

  const drawer = page.locator('#studioDrawer');
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAttribute('aria-hidden', 'false');
  const tabs = drawer.getByRole('tab');
  await expect(tabs).toHaveCount(3);
  await expect(drawer.getByRole('tab', { name: 'Overview', exact: true })).toBeVisible();
  await expect(drawer.getByRole('tab', { name: 'Evidence', exact: true })).toBeVisible();
  await expect(drawer.getByRole('tab', { name: 'Interactive demo', exact: true })).toBeVisible();
});

test('the default Overview opens on an in-drawer media carousel before the written detail', async ({ page }) => {
  await gotoPortfolio(page);
  const trigger = page.locator('.piece[data-k="playwright"] [data-preview-pane="arch"]').first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const drawer = page.locator('#studioDrawer');
  const overview = drawer.getByRole('tab', { name: 'Overview', exact: true });
  const carousel = drawer.getByRole('region', { name: /Maia Local MCP Toolkit project media/i });
  await expect(overview).toHaveAttribute('aria-selected', 'true');
  await expect(carousel).toBeVisible();
  await expect(carousel.locator('[data-carousel-slide]')).toHaveCount(2);
  await expect(carousel.locator('[data-carousel-slide]:not([hidden]) img')).toBeVisible();
  await expect(carousel.locator('[data-carousel-count]')).toHaveText('01 / 02');

  const positions = await drawer.evaluate((node) => ({
    media: node.querySelector('[data-project-carousel]').getBoundingClientRect().top,
    detail: node.querySelector('.research-callout').getBoundingClientRect().top
  }));
  expect(positions.media).toBeLessThan(positions.detail);

  const locationBefore = await page.evaluate(() => `${location.pathname}${location.hash}`);
  await carousel.locator('[data-carousel-next]').click();
  await expect(carousel).toHaveAttribute('data-carousel-index', '1');
  await expect(carousel.locator('[data-carousel-count]')).toHaveText('02 / 02');
  expect(await page.evaluate(() => `${location.pathname}${location.hash}`)).toBe(locationBefore);

  await carousel.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(carousel).toHaveAttribute('data-carousel-index', '0');
  await expect(carousel.locator('[data-carousel-dot="0"]')).toHaveAttribute('aria-current', 'true');
});

test('Interactive demo CTA opens the demo directly and loads no workbench bundle before demand', async ({ page }) => {
  await gotoPortfolio(page);
  expect(await page.evaluate(workbenchResources)).toEqual([]);
  await expect(page.locator('script[src*="workbenches-"]')).toHaveCount(0);

  const project = page.locator('.piece[data-k="playwright"]');
  const cta = project.getByRole('link', { name: /Interactive demo/i });
  await cta.scrollIntoViewIfNeeded();
  await cta.click();
  await expect(page.locator('#studioDrawer')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Interactive demo', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#pane-sim')).toBeVisible();
  await expect.poll(() => page.evaluate(workbenchResources)).not.toEqual([]);
});

test('drawer locks html and body, traps the page, closes with Escape, and restores focus', async ({ page }) => {
  await gotoPortfolio(page, '#archive');
  const trigger = page.locator('.archive-row__link').first();
  await trigger.focus();
  await trigger.press('Enter');
  await expect(page.locator('#studioDrawer')).toBeVisible();

  const overflow = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).overflowY,
    body: getComputedStyle(document.body).overflowY,
    bodyClass: document.body.classList.contains('studio-open')
  }));
  expect(['hidden', 'clip']).toContain(overflow.html);
  expect(['hidden', 'clip']).toContain(overflow.body);
  expect(overflow.bodyClass).toBe(true);
  await expect(page.locator('#studioDrawer .drawer-body')).toHaveCSS('overflow-y', 'auto');

  const close = page.locator('.btn-close-drawer');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await page.locator('#studioDrawer').evaluate((drawer) => drawer.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.locator('#studioDrawer')).toHaveAttribute('aria-hidden', 'true');
  await expect(trigger).toBeFocused();
});

test.describe('mobile drawer geometry', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('uses the dynamic viewport, safe-area padding, and one contained content scroller', async ({ page }) => {
    await gotoPortfolio(page);
    const href = await page.locator('[data-preview-key]').first().getAttribute('href');
    await page.goto(new URL(href, page.url()).href);

    const drawer = page.locator('#studioDrawer');
    await expect(drawer).toBeVisible();
    await expect.poll(() => drawer.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return rect.left >= -1 && rect.right <= innerWidth + 1;
    })).toBe(true);
    const geometry = await drawer.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        position: getComputedStyle(node).position
      };
    });
    expect(geometry.position).toBe('fixed');
    expect(geometry.top).toBeGreaterThanOrEqual(-1);
    expect(geometry.left).toBeGreaterThanOrEqual(-1);
    expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight + 1);

    const body = drawer.locator('.drawer-body');
    await expect(body).toHaveCSS('overflow-y', 'auto');
    const stylesheet = readProjectAsset('editorial-studio.css');
    expect(stylesheet).toMatch(/height:\s*100dvh/);
    expect(stylesheet).toContain('env(safe-area-inset-bottom)');
    await assertNoHorizontalOverflow(page);
  });

  test('supports a horizontal touch swipe without replacing the drawer page', async ({ page }) => {
    await gotoPortfolio(page);
    await page.locator('.piece[data-k="playwright"] [data-preview-pane="arch"]').first().click();
    const carousel = page.locator('[data-project-carousel]');
    await expect(carousel).toHaveAttribute('data-carousel-index', '0');
    const before = page.url();
    const box = await carousel.locator('.project-carousel__stage').boundingBox();
    expect(box).toBeTruthy();
    const y = box.y + box.height / 2;
    await carousel.dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', clientX: box.x + box.width * .8, clientY: y });
    await carousel.dispatchEvent('pointerup', { pointerId: 7, pointerType: 'touch', clientX: box.x + box.width * .2, clientY: y + 3 });
    await expect(carousel).toHaveAttribute('data-carousel-index', '1');
    expect(page.url()).toBe(before);
    await expect(page.locator('#studioDrawer .drawer-body')).toHaveCSS('overflow-y', 'auto');
  });
});

test('theme control labels the action and any pressed state represents dark mode', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('fabric-theme', 'light'));
  await gotoPortfolio(page);
  const toggle = page.locator('.theme-toggle');

  async function expectTheme(theme) {
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(toggle).toHaveAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    const pressed = await toggle.getAttribute('aria-pressed');
    if (pressed !== null) expect(pressed).toBe(String(theme === 'dark'));
  }

  await expectTheme('light');
  await toggle.click();
  await expectTheme('dark');
  await toggle.click();
  await expectTheme('light');
});

test('reduced motion leaves a coherent, readable static composition', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1366, height: 768 }
  });
  const page = await context.newPage();
  try {
    await gotoPortfolio(page);
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    await expect(page.locator('.intro')).toBeVisible();
    await expect(page.locator('#selectedWork .piece').first()).toBeVisible();
    await expect(page.locator('#archive')).toBeAttached();
    const hiddenReadableContent = await page.locator('#selectedWork .piece').evaluateAll((nodes) => nodes.filter((node) => {
      const style = getComputedStyle(node);
      return Number(style.opacity) < 0.9 || style.visibility === 'hidden';
    }).length);
    expect(hiddenReadableContent).toBe(0);
    await assertNoHorizontalOverflow(page);
  } finally {
    await context.close();
  }
});

test('blank optional LinkedIn configuration never produces broken cards or third-party embeds', async ({ page }) => {
  await gotoPortfolio(page);
  await expect(page.locator('script[src*="linkedin.com"], iframe[src*="linkedin.com"]')).toHaveCount(0);
  const broken = await page.locator('a').evaluateAll((links) => links.filter((link) =>
    /linkedin/i.test(link.textContent || '') && (!link.getAttribute('href') || link.getAttribute('href') === '#')).length);
  expect(broken).toBe(0);

  const model = loadPortfolioModel();
  const blankLabels = (model.projects || []).flatMap((project) => (project.externalEvidence || [])
    .filter((evidence) => !evidence.url)
    .map((evidence) => ({ key: projectKey(project), label: evidence.label })));
  for (const evidence of blankLabels.filter((item) => item.label)) {
    await expect(page.locator(`[data-project-key="${evidence.key}"] a`, { hasText: evidence.label })).toHaveCount(0);
  }
});
