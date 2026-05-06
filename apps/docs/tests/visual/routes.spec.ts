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

const surfaces: readonly string[] = ['/', '/handbook'];

const routes = [...surfaces];

for (const path of routes) {
  const label =
    path === '/' ? 'landing' : path.replace(/^\//, '').replace(/\//g, '-');

  test(`${label} renders stably`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });

    // Fonts can race the first paint and shift the snapshot hash.
    await page.evaluate(async () => {
      if ('fonts' in document) {
        await document.fonts.ready;
      }
    });

    await page.addStyleTag({
      content:
        '*, *::before, *::after { animation: none !important; transition: none !important; }'
    });

    await page.evaluate(async () => {
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const viewportHeight = window.innerHeight;
      for (let y = 0; y <= docHeight; y += viewportHeight) {
        window.scrollTo(0, y);
        await new Promise(r => requestAnimationFrame(() => r(null)));
      }
      window.scrollTo(0, 0);
      await new Promise(r => requestAnimationFrame(() => r(null)));
    });
    await page.evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map(img =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>(resolve => {
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
              })
        )
      );
    });
    await page.waitForLoadState('networkidle');

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            return new Promise<number>(resolve => {
              let last = -1;
              let stable = 0;
              const tick = () => {
                const h = Math.max(
                  document.documentElement.scrollHeight,
                  document.body.scrollHeight
                );
                if (h === last) {
                  stable += 1;
                  if (stable >= 4) {
                    resolve(h);
                    return;
                  }
                } else {
                  stable = 0;
                  last = h;
                }
                requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            });
          }),
        { timeout: 10_000, intervals: [50] }
      )
      .toBeGreaterThan(0);

    await expect(page).toHaveScreenshot(`${label}.png`, {
      fullPage: true,
      timeout: 20_000
    });
  });
}
