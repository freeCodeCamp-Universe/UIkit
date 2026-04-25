// Wave 9 P2.6 (W9-B17) — CommandPalette behavioural contract.
//
// `<CommandPalette>` is a stateful overlay primitive. The demo island
// (`_islands/CommandPaletteDemo.tsx`) keeps it closed until the user
// clicks "Open command palette" — same trigger pattern as ModalDemo,
// so the fixed-position backdrop never masks the docs hero on paint
// (Wave 7 P9 fix). This spec locks three contract surfaces:
//
//   1. Trigger reveals `[role="dialog"][aria-modal="true"]`.
//   2. Typing filters the `[role="option"]` list.
//   3. Escape closes the palette (keydown handler).
//
// All assertions key off WAI-ARIA primitives — no class-name coupling.
import { test, expect } from '@playwright/test';

const TRIGGER = 'button:has-text("Open command palette")';
const DIALOG = '[role="dialog"][aria-modal="true"]';

test.describe('@behavioural command-palette', () => {
  test('trigger opens dialog with focused search input', async ({ page }) => {
    await page.goto('/#command-palette', { waitUntil: 'networkidle' });
    const card = page.locator('section#command-palette .showcase__preview');
    await expect(card).toBeVisible();
    await expect(card.locator(DIALOG)).toHaveCount(0);
    await card.locator(TRIGGER).click();
    const dialog = card.locator(DIALOG);
    await expect(dialog).toBeVisible();
    // autoFocus on the input — the search field must own the focus
    // ring once the dialog mounts so keystrokes filter the list.
    await expect(dialog.locator('input.command-palette__search')).toBeFocused();
  });

  test('typing filters the option list to matches only', async ({ page }) => {
    await page.goto('/#command-palette', { waitUntil: 'networkidle' });
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
    await page.goto('/#command-palette', { waitUntil: 'networkidle' });
    const card = page.locator('section#command-palette .showcase__preview');
    await card.locator(TRIGGER).click();
    await expect(card.locator(DIALOG)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(card.locator(DIALOG)).toHaveCount(0);
  });
});
