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
// Surface set shrinks through Wave 4:
//   · `/` excluded (4.3) — gallery is 18 000 px, too tall to stabilise.
//   · `/components` dropped (4.4) — replaced by `/api` index.
//   · `/foundations/colors` drops out in 4.6 because the sidebar
//     conditional removed the rail from foundations pages, breaking
//     their baselines; the handbook absorbs the same content in 4.7.
//   · `/handbook` picks up the slack — shallow chrome + sidebar rail.
// 4.8 re-adds `/api` + every `/api/<slug>` slug alongside a big-bang
// goldens refresh.
const surfaces: readonly string[] = ['/handbook'];

// Full component MDX pages temporarily excluded from the baseline.
// Wave 4 · 4.6 dropped the sidebar chrome from /api/<slug> pages which
// changes every screenshot; 4.8 re-adds these under `/api/<slug>`
// alongside a goldens refresh.
const fullComponentPages: readonly string[] = [];

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
