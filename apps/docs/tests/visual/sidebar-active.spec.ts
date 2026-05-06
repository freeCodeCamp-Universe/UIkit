import { test, expect } from '@playwright/test';

const SLUGS: readonly string[] = ['button', 'modal', 'table'];

for (const slug of SLUGS) {
  test(`scrolling to #${slug} marks the sidebar entry active`, async ({
    page
  }) => {
    // Showcases live at `/playground/` after the IA split (commit f1038b2).
    await page.goto('/playground/', { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      if ('fonts' in document) await document.fonts.ready;
    });
    await page.evaluate(s => {
      const el = document.getElementById(s);
      el?.scrollIntoView({ behavior: 'auto', block: 'start' });
      location.hash = `#${s}`;
    }, slug);
    // Give the spy one frame to react.
    await page.evaluate(
      () => new Promise(resolve => requestAnimationFrame(() => resolve(null)))
    );
    const link = page.locator(
      `[data-sidebar-link][data-target="${slug}"], [data-sidebar-link][href$="#${slug}"]`
    );
    await expect(link.first()).toHaveAttribute('data-active', 'true');
  });
}
