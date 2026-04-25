// Wave 9 P2.4 (W9-B17) — Pagination behavioural contract.
//
// `<Pagination>` is a stateful primitive. The demo island
// (`_islands/PaginationDemo.tsx`) seeds page=3 and a 12-page set.
// Clicking another page button MUST move `aria-current="page"`.
import { test, expect } from '@playwright/test';

test.describe('@behavioural pagination', () => {
  test('seed page is 3; click page-4 moves aria-current', async ({ page }) => {
    await page.goto('/#pagination', { waitUntil: 'networkidle' });
    const card = page.locator('section#pagination .showcase__preview');
    await expect(card).toBeVisible();
    const current = card.locator('button[aria-current="page"]');
    await expect(current).toHaveText('3');
    // `paginationRange(3, 12, 1)` returns `[1, 2, 3, 4, 'ellipsis', 12]`
    // — page button "4" is always visible from page 3. The button's
    // accessible name is `aria-label="Page 4"`; we click via the
    // structural `data-part="page"` + visible-text contract.
    await card.locator('button[data-part="page"]', { hasText: /^4$/ }).click();
    await expect(card.locator('button[aria-current="page"]')).toHaveText('4');
  });

  test('clicking next advances by one page', async ({ page }) => {
    await page.goto('/#pagination', { waitUntil: 'networkidle' });
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
