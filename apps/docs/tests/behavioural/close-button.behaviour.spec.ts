import { test, expect } from '@playwright/test';

test.describe('@behavioural close-button', () => {
  test('renders an enabled button with aria-label="Dismiss"', async ({
    page
  }) => {
    await page.goto('/playground#close-button', { waitUntil: 'networkidle' });
    const card = page.locator('section#close-button .showcase__preview');
    const btn = card.locator('button[aria-label="Dismiss"]');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await expect(btn).toHaveAttribute('type', 'button');
  });

  test('click is a no-op on the showcase (no handler bound)', async ({
    page
  }) => {
    await page.goto('/playground#close-button', { waitUntil: 'networkidle' });
    const card = page.locator('section#close-button .showcase__preview');
    const btn = card.locator('button[aria-label="Dismiss"]');
    await btn.click();
    await expect(btn).toBeVisible();
  });
});
