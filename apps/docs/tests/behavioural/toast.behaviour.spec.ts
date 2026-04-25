// Wave 9 P2.9 (W9-B17) — Toast behavioural contract.
//
// Wave 7 shipped the toast showcase as a static gallery (all 4
// variants with `dismissible={false}`) — visually correct but
// devoid of the interactive surface. Wave 9 promotes it to include
// a stateful "Trigger toast" button that mounts a dismissible
// success toast; the close `×` flips state back. The remaining
// 3 reference toasts stay rendered as the visual gallery.
//
// The contract this spec locks:
//
//   1. Pre-click — exactly 3 toasts paint (warning, danger, info).
//   2. Trigger reveals a 4th toast titled "Saved".
//   3. The "Saved" toast carries a Dismiss button; clicking it
//      removes the toast (count returns to 3 + the title disappears).
import { test, expect } from '@playwright/test';

const TRIGGER = 'button:has-text("Trigger toast")';

test.describe('@behavioural toast', () => {
  test('trigger mounts a dismissible "Saved" toast', async ({ page }) => {
    await page.goto('/#toast', { waitUntil: 'networkidle' });
    const card = page.locator('section#toast .showcase__preview');
    await expect(card).toBeVisible();
    // Reference gallery has 3 non-dismissible toasts.
    await expect(card.locator('.toast')).toHaveCount(3);
    await expect(
      card.locator('.toast__title', { hasText: 'Saved' })
    ).toHaveCount(0);
    await card.locator(TRIGGER).click();
    await expect(card.locator('.toast')).toHaveCount(4);
    await expect(
      card.locator('.toast__title', { hasText: 'Saved' })
    ).toBeVisible();
  });

  test('Dismiss button removes the toast from the DOM', async ({ page }) => {
    await page.goto('/#toast', { waitUntil: 'networkidle' });
    const card = page.locator('section#toast .showcase__preview');
    await card.locator(TRIGGER).click();
    const saved = card
      .locator('.toast')
      .filter({ has: page.locator('.toast__title', { hasText: 'Saved' }) });
    await expect(saved).toHaveCount(1);
    await saved.getByRole('button', { name: 'Dismiss' }).click();
    await expect(card.locator('.toast')).toHaveCount(3);
    await expect(
      card.locator('.toast__title', { hasText: 'Saved' })
    ).toHaveCount(0);
  });
});
