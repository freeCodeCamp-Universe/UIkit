import { test, expect } from '@playwright/test';

test.describe('@behavioural pagination', () => {
  test('seed page is 3; click page-4 moves aria-current', async ({ page }) => {
    await page.goto('/playground#pagination', { waitUntil: 'networkidle' });
    const card = page.locator('section#pagination .showcase__preview');
    await expect(card).toBeVisible();
    const current = card.locator('button[aria-current="page"]');
    await expect(current).toHaveText('3');
    await card.locator('button[data-part="page"]', { hasText: /^4$/ }).click();
    await expect(card.locator('button[aria-current="page"]')).toHaveText('4');
  });

  test('clicking next advances by one page', async ({ page }) => {
    await page.goto('/playground#pagination', { waitUntil: 'networkidle' });
    const card = page.locator('section#pagination .showcase__preview');
    const start = await card
      .locator('button[aria-current="page"]')
      .textContent();
    await card.locator('button[data-part="next"]').click();
    const after = await card
      .locator('button[aria-current="page"]')
      .textContent();
    expect(Number(after)).toBe(Number(start) + 1);
  });
});
