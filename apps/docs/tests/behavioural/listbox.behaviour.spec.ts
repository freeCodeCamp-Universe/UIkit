// Wave 9 P2.5 (W9-B17) — Listbox behavioural contract.
//
// `<Listbox>` is a stateful single-select primitive. The demo island
// (`_islands/ListboxDemo.tsx`) seeds value='frontend' (the first item)
// across 4 items: frontend, backend, devops, design. Click on a
// non-selected option MUST flip `aria-selected` on the underlying
// `[role="option"]` <li> elements — the WAI-ARIA contract surface.
import { test, expect } from '@playwright/test';

test.describe('@behavioural listbox', () => {
  test('frontend pre-selected; click devops flips aria-selected', async ({
    page
  }) => {
    await page.goto('/#listbox', { waitUntil: 'networkidle' });
    const card = page.locator('section#listbox .showcase__preview');
    await expect(card).toBeVisible();
    const options = card.locator('[role="option"]');
    await expect(options).toHaveCount(4);
    // Seed: 'frontend' (index 0) is selected.
    await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(options.nth(2)).toHaveAttribute('aria-selected', 'false');
    await options.nth(2).click();
    await expect(options.nth(0)).toHaveAttribute('aria-selected', 'false');
    await expect(options.nth(2)).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking design selects it and deselects every other option', async ({
    page
  }) => {
    await page.goto('/#listbox', { waitUntil: 'networkidle' });
    const options = page.locator(
      'section#listbox .showcase__preview [role="option"]'
    );
    await options.nth(3).click();
    await expect(options.nth(0)).toHaveAttribute('aria-selected', 'false');
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'false');
    await expect(options.nth(2)).toHaveAttribute('aria-selected', 'false');
    await expect(options.nth(3)).toHaveAttribute('aria-selected', 'true');
  });
});
