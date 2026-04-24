import { test, expect } from '@playwright/test';

/**
 * Mobile drawer: the sidebar becomes off-canvas at ≤900 px and is
 * revealed via the hamburger in the header. This spec covers only the
 * mobile project (the hamburger is hidden on wider viewports).
 *
 * The golden locks in the drawer's open-state visual + backdrop so a
 * regression in the toggle wiring or the off-canvas CSS surfaces on CI.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __NO_SPY__: boolean }).__NO_SPY__ = true;
  });
});

test('mobile drawer opens when hamburger is clicked', async ({
  page
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'mobile',
    'Hamburger only renders ≤900 px'
  );

  await page.goto('/components/button', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    if ('fonts' in document) await document.fonts.ready;
  });
  await page.addStyleTag({
    content:
      '*, *::before, *::after { animation: none !important; transition: none !important; }'
  });

  const hamburger = page.locator('[data-nav-toggle]');
  await expect(hamburger).toBeVisible();
  await hamburger.click();
  await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('body')).toHaveAttribute('data-nav-open', '');

  // Wait for the transform transition we just disabled to settle
  // deterministically — a single paint tick is enough.
  await page.waitForFunction(() => {
    const el = document.getElementById('app-sidebar');
    return el !== null && getComputedStyle(el).visibility === 'visible';
  });

  await expect(page).toHaveScreenshot('drawer-open.png', { fullPage: false });
});
