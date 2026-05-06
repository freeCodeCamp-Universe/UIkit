import { test, expect } from '@playwright/test';

test.describe('@behavioural combobox', () => {
  test('seed renders 5 options + empty input', async ({ page }) => {
    await page.goto('/playground#combobox', { waitUntil: 'networkidle' });
    const card = page.locator('section#combobox .showcase__preview');
    const input = card.locator('input[role="combobox"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('');
    const options = card.locator('[role="option"]');
    await expect(options).toHaveCount(5);
  });

  test('typing filters the option list', async ({ page }) => {
    await page.goto('/playground#combobox', { waitUntil: 'networkidle' });
    const card = page.locator('section#combobox .showcase__preview');
    const input = card.locator('input[role="combobox"]');
    await input.focus();
    await input.fill('java');
    const options = card.locator('[role="option"]');
    await expect(options).toHaveCount(1);
    await expect(options.first()).toContainText(/JavaScript/);
  });

  test('clicking an option marks aria-selected on it', async ({ page }) => {
    await page.goto('/playground#combobox', { waitUntil: 'networkidle' });
    const card = page.locator('section#combobox .showcase__preview');
    const options = card.locator('[role="option"]');
    await options.nth(2).click();
    await expect(options.nth(2)).toHaveAttribute('aria-selected', 'true');
  });
});
