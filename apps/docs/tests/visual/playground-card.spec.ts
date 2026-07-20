import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    (window as unknown as { __NO_SPY__: boolean }).__NO_SPY__ = true;
  });
  if (testInfo.project.name === 'desktop-light') {
    await page.addInitScript(() => {
      document.documentElement.classList.remove('dark-palette');
      document.documentElement.classList.add('light-palette');
    });
  }
});

const SLUGS: readonly string[] = [
  'button',
  'combobox',
  'modal',
  'navbar',
  'table'
];

for (const slug of SLUGS) {
  test(`PlaygroundCard ${slug} renders stably`, async ({ page }, testInfo) => {
    test.skip(
      (testInfo.project.name === 'desktop' ||
        testInfo.project.name === 'desktop-light') &&
        slug === 'modal',
      'Flaky sub-pixel font jitter - see UIkit-aq0'
    );
    test.skip(
      slug === 'combobox' &&
        (testInfo.project.name === 'tablet' ||
          testInfo.project.name === 'desktop'),
      'Flaky 1-px height oscillation - combobox card height drifts ±1 px between runs even inside the pinned Playwright Docker image (see docs/v1.1-backlog.md)'
    );
    test.skip(
      slug === 'navbar' &&
        (testInfo.project.name === 'mobile' ||
          testInfo.project.name === 'tablet'),
      'Flaky 1-px height oscillation - navbar card drifts ±1 px between runs (see docs/v1.1-backlog.md)'
    );
    await page.goto(`/playground#${slug}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      if ('fonts' in document) await document.fonts.ready;
    });
    await page.addStyleTag({
      content:
        '*, *::before, *::after { animation: none !important; transition: none !important; }'
    });
    const card = page.locator(`section#${slug}`);
    await card.scrollIntoViewIfNeeded();
    await page.evaluate(
      () =>
        new Promise(resolve =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => resolve(null))
          )
        )
    );
    await expect(card).toHaveScreenshot(`playground-card-${slug}.png`, {
      threshold: 0.4,
      maxDiffPixelRatio: 0.15,
      maxDiffPixels: 20000
    });
  });
}
