import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { assertNoHorizontalOverflow, gotoPortfolio } from './helpers/portfolio.js';

const outputDir = path.resolve(process.cwd(), 'artifacts', 'portfolio-validation');
const viewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1728, height: 1117 }
];

test.beforeAll(() => fs.mkdirSync(outputDir, { recursive: true }));

for (const viewport of viewports) {
  for (const theme of ['light', 'dark']) {
    test(`@visual ${viewport.width}x${viewport.height} ${theme}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript((selectedTheme) => localStorage.setItem('fabric-theme', selectedTheme), theme);
      await gotoPortfolio(page);
      await page.evaluate(() => document.fonts?.ready);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await assertNoHorizontalOverflow(page);

      const freeze = `
        *, *::before, *::after {
          animation-play-state: paused !important;
          transition-duration: 0s !important;
          scroll-behavior: auto !important;
        }
      `;
      await page.addStyleTag({ content: freeze });
      const stem = `${viewport.width}x${viewport.height}-${theme}`;
      await page.screenshot({
        path: path.join(outputDir, `${stem}-overview.png`),
        animations: 'disabled'
      });

      const controls = page.locator('#galleryControls');
      await controls.evaluate((node) => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.screenshot({
        path: path.join(outputDir, `${stem}-archive.png`),
        animations: 'disabled'
      });
      await controls.screenshot({
        path: path.join(outputDir, `${stem}-archive-controls.png`),
        animations: 'disabled'
      });
    });
  }
}

async function freezeMotion(page) {
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      animation-play-state: paused !important;
      transition-duration: 0s !important;
      scroll-behavior: auto !important;
    }
    .skip-link:not(:focus-visible) { display: none !important; }
    .topbar { visibility: hidden !important; }
  ` });
}

for (const viewport of [{ name: 'desktop', width: 1366, height: 768 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`@visual key portfolio details ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => localStorage.setItem('fabric-theme', 'light'));
    await gotoPortfolio(page);
    await page.evaluate(() => document.fonts?.ready);
    await freezeMotion(page);

    const paired = page.locator('.tile--paired');
    await expect(paired).toBeVisible();
    await paired.screenshot({ path: path.join(outputDir, `paired-benchmark-${viewport.name}.png`), animations: 'disabled' });

    const threads = page.locator('#buildThreads');
    await expect(threads).toBeVisible();
    await threads.screenshot({ path: path.join(outputDir, `build-threads-${viewport.name}.png`), animations: 'disabled' });

    const trigger = page.locator('.piece[data-k="playwright"] [data-preview-pane="arch"]').first();
    await trigger.click();
    const drawer = page.locator('#studioDrawer');
    await expect(drawer).toBeVisible();
    await drawer.screenshot({ path: path.join(outputDir, `drawer-overview-${viewport.name}.png`), animations: 'disabled' });
    await drawer.locator('[data-carousel-next]').click();
    await expect(drawer.locator('[data-project-carousel]')).toHaveAttribute('data-carousel-index', '1');
    await drawer.screenshot({ path: path.join(outputDir, `drawer-media-2-${viewport.name}.png`), animations: 'disabled' });
    await drawer.getByRole('tab', { name: 'Evidence', exact: true }).click();
    await drawer.screenshot({ path: path.join(outputDir, `drawer-evidence-${viewport.name}.png`), animations: 'disabled' });
    await assertNoHorizontalOverflow(page);
  });
}
