import { test, expect } from '@playwright/test';

test.describe('@behavioural switch', () => {
  test('seed states honour defaultChecked', async ({ page }) => {
    await page.goto('/playground#switch', { waitUntil: 'networkidle' });
    const card = page.locator('section#switch .showcase__preview');
    const inputs = card.locator('input[type="checkbox"]');
    await expect(inputs).toHaveCount(2);
    await expect(inputs.nth(0)).toBeChecked();
    await expect(inputs.nth(1)).not.toBeChecked();
  });

  test('click flips the underlying checkbox state', async ({ page }) => {
    await page.goto('/playground#switch', { waitUntil: 'networkidle' });
    const card = page.locator('section#switch .showcase__preview');
    const labels = card.locator('label.switch');
    const inputs = card.locator('input[type="checkbox"]');
    await labels.nth(1).click();
    await expect(inputs.nth(1)).toBeChecked();
    await labels.nth(0).click();
    await expect(inputs.nth(0)).not.toBeChecked();
  });
});
