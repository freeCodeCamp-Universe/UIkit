import { test, expect } from '@playwright/test';

test.describe('@behavioural baseline', () => {
  test('docs playground serves the canonical chrome', async ({ page }) => {
    // Showcases live at `/playground/` after the IA split (commit f1038b2).
    await page.goto('/playground/', { waitUntil: 'networkidle' });
    const buttonCard = page.locator('section#button');
    await expect(buttonCard).toBeVisible();
    await expect(buttonCard.locator('.showcase__head-title')).toContainText(
      /button/i
    );
    await expect(
      buttonCard.locator('.showcase__tab[data-tab="react"]')
    ).toBeVisible();
    await expect(
      buttonCard.locator('.showcase__tab[data-tab="html"]')
    ).toBeVisible();
  });
});
