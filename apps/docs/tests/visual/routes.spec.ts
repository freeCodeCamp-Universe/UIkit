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

// Astro-authored surfaces — the "chrome" of the site.
//
// `/showcase` is intentionally excluded: the gallery renders ~24
// client-hydrated islands stacked into a ~18 000 px tall page. Font
// anti-aliasing subpixel drift across that surface area exceeds the
// stability threshold even with animations disabled. Re-add once the
// scroll-spy extraction (3D.9) lands and the page renders as discrete
// screenshottable islands.
const surfaces: readonly string[] = ['/', '/components', '/foundations/colors'];

// Full component MDX pages — every slug here has a PropTable, Keyboard
// notes, Accessibility notes, Tokens and a Do/Don't grid.
const fullComponentPages: readonly string[] = [
  '/components/button',
  '/components/text',
  '/components/heading',
  '/components/badge',
  '/components/alert',
  '/components/callout',
  '/components/card',
  '/components/panel',
  '/components/input',
  '/components/checkbox',
  '/components/switch',
  '/components/modal',
  '/components/tooltip'
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
