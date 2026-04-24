import { test, expect } from '@playwright/test';

// Silence any in-page IntersectionObserver scroll-spy wiring — those
// observers fire repeatedly as Playwright scrolls the page to stitch a
// full-page screenshot, drifting sidebar active-state between retries.
// Pages that run a scroll-spy (showcase) bail early when this flag is
// set.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __NO_SPY__: boolean }).__NO_SPY__ = true;
  });
});

/**
 * Baseline visual regression — one golden per (route × viewport).
 *
 * Route set: every page whose layout is **shipped** (full MDX pages +
 * Astro-authored surfaces). Stubs and storybook-only components stay
 * out of this suite until they graduate to full pages — flip-flopping
 * goldens against half-finished copy is noise.
 *
 * If you add a full page, add its path here. If you intentionally change
 * the look of a page, run `pnpm test:visual:update` and review the
 * diffed PNGs as part of the same commit.
 */

// Astro-authored surfaces — the "chrome" of the site. `/` stays
// excluded (18 000 px gallery) until the playground splits into
// per-island screenshots; every other shipped route gets a baseline
// after the Wave 4 IA settled.
const surfaces: readonly string[] = ['/handbook', '/api'];

// Full component MDX pages — every shipped slug carries a PropTable,
// Keyboard notes, Accessibility notes, Tokens, and a Do/Don't grid.
// Paths follow the Wave 4 · 4.4 IA (`/api/<slug>`).
const fullComponentPages: readonly string[] = [
  '/api/button',
  '/api/text',
  '/api/heading',
  '/api/badge',
  '/api/alert',
  '/api/callout',
  '/api/card',
  '/api/panel',
  '/api/input',
  '/api/checkbox',
  '/api/switch',
  '/api/modal',
  '/api/tooltip'
];

const routes = [...surfaces, ...fullComponentPages];

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

    // Kill the typewriter animation on the landing page so the terminal
    // body renders in its final "painted whole script" state regardless
    // of timing.
    await page.addStyleTag({
      content:
        '*, *::before, *::after { animation: none !important; transition: none !important; }'
    });

    await expect(page).toHaveScreenshot(`${label}.png`, {
      fullPage: true
    });
  });
}
