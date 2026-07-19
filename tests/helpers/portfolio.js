import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { expect } from '@playwright/test';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

export function loadPortfolioModel() {
  const context = { window: {} };
  const contentPath = path.join(ROOT, 'assets', 'projects', 'portfolio-content.js');
  vm.runInNewContext(fs.readFileSync(contentPath, 'utf8'), context, { filename: contentPath });
  const model = context.window.PORTFOLIO_CONTENT;
  if (!model || !Array.isArray(model.projects)) {
    throw new Error('portfolio-content.js must assign a canonical projects array to window.PORTFOLIO_CONTENT.projects');
  }
  return model;
}

export function readPortfolioHtml() {
  return fs.readFileSync(path.join(ROOT, 'projects.html'), 'utf8');
}

export function readProjectAsset(filename) {
  return fs.readFileSync(path.join(ROOT, 'assets', 'projects', filename), 'utf8');
}

export function projectKey(project) {
  return project.key || project.k || project.id;
}

export function normalized(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export async function gotoPortfolio(page, hash = '') {
  await page.goto(`/projects.html${hash}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#galleryMount .archive-row').first()).toBeAttached();
}

export async function horizontalOverflow(page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll('body *')]
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          selector: `${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ''}${[...node.classList]
            .slice(0, 3)
            .map((name) => `.${name}`)
            .join('')}`,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter(({ left, right, width }) => width > 0 && (left < -1 || right > viewport + 1))
      .slice(0, 8);

    return {
      viewport,
      root: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      scrollingElement: document.scrollingElement?.scrollWidth || document.documentElement.scrollWidth,
      offenders
    };
  });
}

export async function assertNoHorizontalOverflow(page) {
  await expect.poll(async () => horizontalOverflow(page)).toMatchObject({
    viewport: await page.evaluate(() => document.documentElement.clientWidth)
  });
  const overflow = await horizontalOverflow(page);
  const diagnostic = overflow.offenders.length ? `; offenders: ${JSON.stringify(overflow.offenders)}` : '';
  expect(overflow.root, `root width ${overflow.root} exceeds viewport ${overflow.viewport}${diagnostic}`).toBeLessThanOrEqual(overflow.viewport + 1);
  expect(overflow.scrollingElement, `scrolling surface ${overflow.scrollingElement} exceeds viewport ${overflow.viewport}${diagnostic}`).toBeLessThanOrEqual(overflow.viewport + 1);
}
