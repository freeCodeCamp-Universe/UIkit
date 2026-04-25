// Wave 9 P4.1 (W9-B8.1) — header active-link visual contract.
//
// Design contract (`comp-header` card in the freeCodeCamp Design
// System export, captured in LANDING-AUDIT.md `## B8`):
//
//   .bar nav a[aria-current] {
//     color: var(--foreground-primary);
//     border-bottom-color: var(--yellow-gold);
//     font-weight: 700;
//   }
//
// `--yellow-gold` is `#ffbf00` (tokens.css L96), which Chromium's
// computed-style serialiser returns as `rgb(255, 191, 0)`.
//
// P2.11 already wired `aria-current="page"` on the matching link.
// This spec locks the *visual* surface of that contract: weight +
// underline colour. We assert at the live `/handbook` route — the
// Handbook link will carry `aria-current="page"`, the Playground
// link will not, so the styled vs unstyled state is captured in
// the same render.
import { test, expect } from '@playwright/test';

const YELLOW_GOLD = 'rgb(255, 191, 0)';

test.describe('@behavioural header-active-link', () => {
  test('active nav link renders 700 weight + yellow-gold underline', async ({
    page
  }) => {
    await page.goto('/handbook', { waitUntil: 'networkidle' });
    const active = page.locator(
      'header.site-header .site-header__nav a[aria-current="page"]'
    );
    await expect(active).toHaveCount(1);
    await expect(active).toHaveText('Handbook');
    const styles = await active.evaluate(node => {
      const cs = getComputedStyle(node);
      return {
        fontWeight: cs.fontWeight,
        borderBottomColor: cs.borderBottomColor,
        borderBottomWidth: cs.borderBottomWidth,
        borderBottomStyle: cs.borderBottomStyle
      };
    });
    expect(styles.fontWeight).toBe('700');
    expect(styles.borderBottomColor).toBe(YELLOW_GOLD);
    expect(styles.borderBottomWidth).toBe('2px');
    expect(styles.borderBottomStyle).toBe('solid');
  });

  test('inactive nav link has no underline (transparent border)', async ({
    page
  }) => {
    await page.goto('/handbook', { waitUntil: 'networkidle' });
    const inactive = page.locator(
      'header.site-header .site-header__nav a[href="/"]:not([aria-current])'
    );
    await expect(inactive).toHaveCount(1);
    const color = await inactive.evaluate(
      node => getComputedStyle(node).borderBottomColor
    );
    // Transparent border: `rgba(0, 0, 0, 0)`. Chromium normalises
    // `transparent` keyword to that string.
    expect(color).toBe('rgba(0, 0, 0, 0)');
  });
});
