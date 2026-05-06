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
      'header.site-header .site-header__nav a[href="/playground"]:not([aria-current])'
    );
    await expect(inactive).toHaveCount(1);
    const color = await inactive.evaluate(
      node => getComputedStyle(node).borderBottomColor
    );
    expect(color).toBe('rgba(0, 0, 0, 0)');
  });
});
