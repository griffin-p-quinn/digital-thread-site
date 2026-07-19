import { expect, test } from '@playwright/test';
import { assertNoHorizontalOverflow, gotoPortfolio } from './helpers/portfolio.js';

async function atmosphereState(page) {
  return page.locator('.atmosphere .mesh').evaluateAll((meshes) => meshes.map((mesh) => {
    const style = getComputedStyle(mesh);
    const animation = mesh.getAnimations()[0];
    return {
      name: style.animationName,
      duration: style.animationDuration,
      display: style.display,
      opacity: Number(style.opacity),
      width: mesh.getBoundingClientRect().width,
      height: mesh.getBoundingClientRect().height,
      background: style.backgroundImage,
      playState: animation?.playState,
      keyframes: animation?.effect?.getKeyframes().map((frame) => ({
        transform: frame.transform,
        opacity: frame.opacity
      })) || []
    };
  }));
}

async function visibleAtmosphereDelta(page, delay = 3_000) {
  await page.addStyleTag({
    content: 'body > *:not(.atmosphere) { visibility: hidden !important; } .atmosphere { visibility: visible !important; }'
  });
  const before = await page.screenshot({ animations: 'allow' });
  await page.waitForTimeout(delay);
  const after = await page.screenshot({ animations: 'allow' });

  return page.evaluate(async ({ beforeBase64, afterBase64 }) => {
    const loadImage = async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      return image;
    };
    const [beforeImage, afterImage] = await Promise.all([
      loadImage(beforeBase64),
      loadImage(afterBase64)
    ]);
    const canvas = document.createElement('canvas');
    canvas.width = beforeImage.width;
    canvas.height = beforeImage.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(beforeImage, 0, 0);
    const beforePixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(afterImage, 0, 0);
    const afterPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    let samples = 0;
    let totalDelta = 0;
    let meaningfullyChanged = 0;
    for (let y = 0; y < canvas.height; y += 3) {
      for (let x = 0; x < canvas.width; x += 3) {
        const index = (y * canvas.width + x) * 4;
        const delta = (
          Math.abs(beforePixels[index] - afterPixels[index])
          + Math.abs(beforePixels[index + 1] - afterPixels[index + 1])
          + Math.abs(beforePixels[index + 2] - afterPixels[index + 2])
        ) / 3;
        samples += 1;
        totalDelta += delta;
        if (delta >= 4) meaningfullyChanged += 1;
      }
    }
    return {
      meanRgbDelta: totalDelta / samples,
      meaningfulPixelShare: meaningfullyChanged / samples
    };
  }, {
    beforeBase64: before.toString('base64'),
    afterBase64: after.toString('base64')
  });
}

for (const viewport of [
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'mobile', width: 390, height: 844 }
]) {
  test(`uses three independent, edge-faded atmosphere fields on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await gotoPortfolio(page);

    await expect(page.locator('.atmosphere .mesh')).toHaveCount(3);
    await expect(page.locator('.intro-breath-field, .ambient-topology, .ambient-packet, .decision-thread__packet')).toHaveCount(0);
    await expect(page.locator('script[src*="ambient-signal"]')).toHaveCount(0);

    const state = await atmosphereState(page);
    expect(new Set(state.map((field) => field.name)).size).toBe(3);
    expect(new Set(state.map((field) => field.duration)).size).toBe(3);
    expect(new Set(state.map((field) => JSON.stringify(field.keyframes))).size).toBe(3);
    state.forEach((field) => {
      expect(field.display).not.toBe('none');
      expect(field.opacity).toBeGreaterThan(0);
      expect(field.playState).toBe('running');
      expect(field.width).toBeGreaterThan(viewport.width);
      expect(field.height).toBeGreaterThan(viewport.height * .65);
      expect(field.background).toContain('radial-gradient');
      expect(field.background).toContain('rgba(0, 0, 0, 0)');
      expect(field.keyframes.length).toBeGreaterThanOrEqual(3);
      expect(new Set(field.keyframes.map((frame) => frame.opacity)).size).toBeGreaterThanOrEqual(3);
    });

    const motionSnapshot = () => page.locator('.atmosphere .mesh').evaluateAll((meshes) => meshes.map((mesh) => {
      const rect = mesh.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        opacity: Number(getComputedStyle(mesh).opacity)
      };
    }));
    const beforeMotion = await motionSnapshot();
    await page.waitForTimeout(1_200);
    const afterMotion = await motionSnapshot();
    const motionScores = afterMotion.map((field, index) => {
      const before = beforeMotion[index];
      return Math.hypot(field.x - before.x, field.y - before.y)
        + Math.abs(field.width - before.width) * .25
        + Math.abs(field.height - before.height) * .25
        + Math.abs(field.opacity - before.opacity) * 100;
    });
    expect(motionScores.filter((score) => score >= 6).length).toBeGreaterThanOrEqual(2);

    if (viewport.name === 'mobile') {
      const visualMotion = await visibleAtmosphereDelta(page);
      expect(visualMotion.meanRgbDelta).toBeGreaterThanOrEqual(2.5);
      expect(visualMotion.meaningfulPixelShare).toBeGreaterThanOrEqual(.2);
    }

    await expect(page.locator('.atmosphere .grain')).toHaveCSS('animation-name', 'none');
    const introEffects = await page.locator('.intro').evaluate((intro) => ({
      before: getComputedStyle(intro, '::before').content,
      after: getComputedStyle(intro, '::after').content
    }));
    expect(['none', 'normal']).toContain(introEffects.before);
    expect(['none', 'normal']).toContain(introEffects.after);
    await assertNoHorizontalOverflow(page);
  });
}

test('top project mouseover stays planar and does not dim or reshuffle neighboring work', async ({ page }) => {
  await gotoPortfolio(page);
  await expect(page.locator('html')).toHaveClass(/decision-hero-complete/, { timeout: 5_000 });
  const artifacts = page.locator('.intro-artifacts[data-decision-thread] > .intro-artifact');
  expect(await artifacts.count()).toBeGreaterThanOrEqual(3);

  const snapshot = () => artifacts.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      left: rect.left,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      opacity: Number(style.opacity),
      filter: style.filter,
      zIndex: style.zIndex
    };
  }));

  const initial = await snapshot();
  for (const index of [0, 2]) {
    await artifacts.nth(index).hover();
    await page.waitForTimeout(260);
    const hovered = await snapshot();
    hovered.forEach((item, artifactIndex) => {
      expect(Math.abs(item.left - initial[artifactIndex].left)).toBeLessThan(1);
      expect(Math.abs(item.top - initial[artifactIndex].top)).toBeLessThan(1);
      expect(Math.abs(item.width - initial[artifactIndex].width)).toBeLessThan(1);
      expect(Math.abs(item.height - initial[artifactIndex].height)).toBeLessThan(1);
      expect(item.opacity).toBeGreaterThanOrEqual(.99);
      expect(item.filter).toBe(initial[artifactIndex].filter);
      expect(item.zIndex).toBe(initial[artifactIndex].zIndex);
    });
  }
});
