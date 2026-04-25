// Wave 9 P3.3 (W9-B16) — Sidebar showcase must stay inside its card.
//
// `<Sidebar>` ships with `position: sticky; max-height: calc(100vh -
// var(--sidebar-top, 0))` baked into its CSS so it can pin to the
// viewport while the user scrolls a docs surface around it. That is
// the right policy for the docs sidebar wrapped by AppSidebar — but
// inside the `/#sidebar` showcase preview it produces a ~900px tall
// rail that bleeds out of the card chrome.
//
// The showcase is meant to be a swatch — tall enough to read the
// section/items, short enough to live inside the preview frame.
// This spec locks the contained shape:
//
//   1. The rendered Sidebar height ≤ the showcase__preview height
//      (no overflow).
//   2. The Sidebar height stays ≤ 480px so the swatch shows the
//      grid backdrop above and below it.
//
// The demo ships an inline `style` prop that caps height + drops
// sticky positioning so this contract holds.
import { test, expect } from '@playwright/test';

test.describe('@behavioural sidebar-showcase-bounds', () => {
  test('rendered Sidebar fits inside the showcase preview', async ({
    page
  }) => {
    await page.goto('/#sidebar', { waitUntil: 'networkidle' });
    const card = page.locator('section#sidebar .showcase__preview');
    await expect(card).toBeVisible();
    const sidebar = card.locator('.sidebar').first();
    await expect(sidebar).toBeVisible();
    const cardBox = await card.boundingBox();
    const sidebarBox = await sidebar.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(sidebarBox).not.toBeNull();
    if (!cardBox || !sidebarBox) return;
    expect(
      sidebarBox.height,
      `sidebar height (${sidebarBox.height}) must fit inside the preview (${cardBox.height})`
    ).toBeLessThanOrEqual(cardBox.height);
    expect(
      sidebarBox.height,
      `sidebar showcase height capped at 480px (was ${sidebarBox.height})`
    ).toBeLessThanOrEqual(480);
  });
});
