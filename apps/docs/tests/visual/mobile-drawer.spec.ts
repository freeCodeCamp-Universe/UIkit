import { test, expect } from '@playwright/test';

test.describe('mobile drawer contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __NO_SPY__: boolean }).__NO_SPY__ = true;
    });
  });

  test('hamburger toggles body[data-nav-open] and reveals drawer', async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Drawer only renders at the mobile viewport.'
    );
    await page.goto('/playground/');
    await page.click('[data-nav-toggle]');
    await expect(page.locator('body')).toHaveAttribute('data-nav-open', '');
    await expect(page.locator('#app-sidebar')).toBeVisible();
    await expect(page.locator('[data-nav-toggle]')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  test('backdrop tap closes drawer and restores focus to hamburger', async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Drawer only renders at the mobile viewport.'
    );
    await page.goto('/playground/');
    await page.click('[data-nav-toggle]');
    await page.click('[data-nav-backdrop]', { force: true });
    await expect(page.locator('body')).not.toHaveAttribute('data-nav-open', '');
    await expect(page.locator('[data-nav-toggle]')).toBeFocused();
  });

  test('Escape closes drawer and restores focus to hamburger', async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Drawer only renders at the mobile viewport.'
    );
    await page.goto('/playground/');
    await page.click('[data-nav-toggle]');
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toHaveAttribute('data-nav-open', '');
    await expect(page.locator('[data-nav-toggle]')).toBeFocused();
  });

  test('hamburger aria-expanded reflects drawer state across full toggle cycle', async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Drawer only renders at the mobile viewport.'
    );
    await page.goto('/playground/');
    const btn = page.locator('[data-nav-toggle]');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('per-page TOC on /handbook is tappable when drawer is open', async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Drawer + TOC only renders at the mobile viewport.'
    );
    await page.goto('/handbook');
    await page.click('[data-nav-toggle]');
    const sidebar = page.locator('#app-sidebar');
    await expect(sidebar).toBeVisible();
    const inPageLinks = sidebar.locator('a[href^="#"]');
    const count = await inPageLinks.count();
    expect(count).toBeGreaterThan(2);
    const href = await inPageLinks.nth(1).getAttribute('href');
    expect(href).toMatch(/^#/);
  });
});
