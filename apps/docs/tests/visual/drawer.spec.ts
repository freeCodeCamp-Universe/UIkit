import { test, expect } from '@playwright/test';

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

  await page.goto('/handbook', { waitUntil: 'networkidle' });
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

  await page.waitForFunction(() => {
    const el = document.getElementById('app-sidebar');
    return el !== null && getComputedStyle(el).visibility === 'visible';
  });

  await expect(page).toHaveScreenshot('drawer-open.png', { fullPage: false });
});
