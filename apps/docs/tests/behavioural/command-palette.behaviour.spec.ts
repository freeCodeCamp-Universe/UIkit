import { test, expect } from '@playwright/test';

const TRIGGER = 'button:has-text("Open command palette")';
const DIALOG = '[role="dialog"][aria-modal="true"]';

test.describe('@behavioural command-palette', () => {
  test('trigger opens dialog with focused search input', async ({ page }) => {
    await page.goto('/playground#command-palette', {
      waitUntil: 'networkidle'
    });
    const card = page.locator('section#command-palette .showcase__preview');
    await expect(card).toBeVisible();
    await expect(card.locator(DIALOG)).toHaveCount(0);
    await card.locator(TRIGGER).click();
    const dialog = card.locator(DIALOG);
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('input.command-palette__search')).toBeFocused();
  });

  test('typing filters the option list to matches only', async ({ page }) => {
    await page.goto('/playground#command-palette', {
      waitUntil: 'networkidle'
    });
    const card = page.locator('section#command-palette .showcase__preview');
    await card.locator(TRIGGER).click();
    const dialog = card.locator(DIALOG);
    // Seed groups have 4 items: curriculum, forum, run, reset.
    await expect(dialog.locator('[role="option"]')).toHaveCount(4);
    await dialog.locator('input.command-palette__search').fill('run');
    const visible = dialog.locator('[role="option"]');
    await expect(visible).toHaveCount(1);
    await expect(visible.first()).toContainText(/run tests/i);
  });

  test('Escape closes the palette', async ({ page }) => {
    await page.goto('/playground#command-palette', {
      waitUntil: 'networkidle'
    });
    const card = page.locator('section#command-palette .showcase__preview');
    await card.locator(TRIGGER).click();
    await expect(card.locator(DIALOG)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(card.locator(DIALOG)).toHaveCount(0);
  });
});
