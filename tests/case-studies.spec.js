import { expect, test } from '@playwright/test';
import { loadPortfolioModel, normalized, projectKey } from './helpers/portfolio.js';

const model = loadPortfolioModel();
const projects = model.projects || [];
const byKey = new Map(projects.map((project) => [projectKey(project), project]));

for (const [key, slug] of Object.entries(model.caseStudySlugs || {})) {
  test(`${slug} renders its canonical project record`, async ({ page }) => {
    const project = byKey.get(key);
    expect(project, `${key} exists in the canonical catalog`).toBeTruthy();

    await page.goto(`/projects/${slug}/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toHaveAttribute('data-project-key', key);
    await expect(page.locator('.case-hero h1')).toHaveText(project.title);
    await expect(page.locator('.case-deck')).toHaveText(project.summary);
    await expect(page.locator('#problem .story-copy .lead')).toHaveText(project.problem);
    await expect(page.locator('#contribution .story-copy .lead')).toHaveText(project.griffinsRole);
    await expect(page.locator('#contribution .story-copy p').filter({ hasText: 'Role of generative AI.' })).toContainText(project.roleOfGenAI);
    await expect(page.locator('#proof .story-copy .lead')).toHaveText(project.proof);
    await expect(page.locator('#proof .boundary-note')).toContainText(project.limitations);
    await expect(page.locator('#result .story-copy .lead')).toHaveText(project.validation);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', project.summary);

    const expectedRelated = (project.relatedProjects || [])
      .map((relatedKey) => byKey.get(relatedKey))
      .filter((related) => related && related.public !== false)
      .map((related) => normalized(related.title));
    const renderedRelated = await page.locator('.related-links a').allTextContents();
    expect(renderedRelated.map(normalized)).toEqual([...expectedRelated, 'Return to the portfolio']);

    const canonicalAlt = model.mediaAlt && model.mediaAlt[key];
    if (canonicalAlt) {
      const image = page.locator('.media-figure img').first();
      if (await image.count()) {
        await expect(image).toHaveAttribute('alt', canonicalAlt);
      } else {
        await expect(page.locator('figure svg[role="img"] desc').first()).toHaveText(canonicalAlt);
      }
    }

    const visibleEvidence = (project.externalEvidence || []).filter((item) => item.label && /^https:\/\//i.test(item.url || ''));
    await expect(page.locator('[data-canonical-evidence] a')).toHaveCount(visibleEvidence.length);
  });
}

test('case-study theme state represents dark mode and labels the available action', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('fabric-theme', 'dark'));
  await page.goto('/projects/maia-local-mcp/', { waitUntil: 'domcontentloaded' });
  const toggle = page.locator('[data-theme-toggle]');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');
});
