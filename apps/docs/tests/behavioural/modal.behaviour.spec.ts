// Wave 9 P2.7 (W9-B17) — Modal behavioural contract.
//
// `<Modal>` wraps `@ark-ui/react/dialog`. Ark keeps the dialog node
// mounted (Modal.tsx passes `lazyMount={false}`) and toggles
// `data-state="open|closed"` to drive the enter/exit animation. So
// `.modal__panel` is in the DOM all the time — the open/closed
// signal is `[data-state="open"]` on that node.
//
// We deliberately avoid `[role="dialog"]` and title-text locators —
// the showcase code panel renders escaped HTML samples that contain
// those same strings, which would inflate match counts. Real CSS
// classes + ark's `data-state` attribute are unique to the live
// React island.
//
// The demo island (`_islands/ModalDemo.tsx`) seeds open=false so the
// page paints without an overlay (Wave 7 P9 + Wave 8 P7 regressions
// both came from forgetting that contract). Ark portals the dialog
// out of the showcase card, so we locate the panel at page root.
import { test, expect } from '@playwright/test';

const TRIGGER = 'button:has-text("Open modal")';
const PANEL_OPEN = '.modal__panel[data-state="open"]';

test.describe('@behavioural modal', () => {
  test('trigger reveals the modal with the seeded title', async ({ page }) => {
    await page.goto('/#modal', { waitUntil: 'networkidle' });
    const card = page.locator('section#modal .showcase__preview');
    await expect(card).toBeVisible();
    await expect(page.locator(PANEL_OPEN)).toHaveCount(0);
    await card.locator(TRIGGER).click();
    const panel = page.locator(PANEL_OPEN);
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Reset progress?');
  });

  test('Escape closes the modal', async ({ page }) => {
    await page.goto('/#modal', { waitUntil: 'networkidle' });
    await page.locator(`section#modal ${TRIGGER}`).click();
    await expect(page.locator(PANEL_OPEN)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(PANEL_OPEN)).toHaveCount(0);
  });

  test('Cancel button in the footer closes the modal', async ({ page }) => {
    await page.goto('/#modal', { waitUntil: 'networkidle' });
    await page.locator(`section#modal ${TRIGGER}`).click();
    const panel = page.locator(PANEL_OPEN);
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.locator(PANEL_OPEN)).toHaveCount(0);
  });
});
