// Wave 9 P2.8 (W9-B17) — Dropdown behavioural contract.
//
// `<Dropdown>` is the in-house composition of Toggle/Menu/Item with
// `useState` controlling open/closed. Demo island
// (`_islands/DropdownDemo.tsx`) seeds open=false so the menu starts
// hidden. The contract surface we lock here:
//
//   1. The toggle button advertises state via `aria-expanded` and
//      flips it on click.
//   2. `[role="menu"]` is conditionally rendered (Dropdown.Menu
//      returns `null` when closed) so its presence is a clean
//      open-state proxy.
//   3. Clicking a `[role="menuitem"]` selects it and closes the
//      menu (the item handler calls `setOpen(false)`).
//   4. Escape key closes the menu (document keydown listener).
import { test, expect } from '@playwright/test';

const TOGGLE = 'button:has-text("Sort")';
const MENU = '[role="menu"]';
const ITEM = '[role="menuitem"]';

test.describe('@behavioural dropdown', () => {
  test('toggle opens the menu and flips aria-expanded', async ({ page }) => {
    await page.goto('/#dropdown', { waitUntil: 'networkidle' });
    const card = page.locator('section#dropdown .showcase__preview');
    await expect(card).toBeVisible();
    const toggle = card.locator(TOGGLE);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(card.locator(MENU)).toHaveCount(0);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(card.locator(MENU)).toBeVisible();
    await expect(card.locator(ITEM)).toHaveCount(3);
  });

  test('clicking a menu item closes the menu', async ({ page }) => {
    await page.goto('/#dropdown', { waitUntil: 'networkidle' });
    const card = page.locator('section#dropdown .showcase__preview');
    await card.locator(TOGGLE).click();
    await expect(card.locator(MENU)).toBeVisible();
    await card.locator(ITEM).first().click();
    await expect(card.locator(MENU)).toHaveCount(0);
    await expect(card.locator(TOGGLE)).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('Escape closes the menu', async ({ page }) => {
    await page.goto('/#dropdown', { waitUntil: 'networkidle' });
    const card = page.locator('section#dropdown .showcase__preview');
    await card.locator(TOGGLE).click();
    await expect(card.locator(MENU)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(card.locator(MENU)).toHaveCount(0);
  });
});
