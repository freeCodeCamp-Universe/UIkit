import { test, expect } from '@playwright/test';

const ROUTES: readonly string[] = ['/', '/playground', '/handbook'];

for (const path of ROUTES) {
  test(`${path} passes baseline a11y checks`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      if ('fonts' in document) await document.fonts.ready;
    });

    // At least one h1. HTML5 allows multiple per-section h1s, and the
    // landing page legitimately renders `<Heading level={1}>` demo
    // instances inside its showcase. Lighthouse a11y allows any
    // count >= 1; we lock the same bar.
    const h1Count = await page.locator('h1').count();
    expect(
      h1Count,
      `${path} must have at least one <h1>`
    ).toBeGreaterThanOrEqual(1);

    // Every image has an alt attribute (even empty="" is allowed for
    // decorative; missing attribute is the failure).
    const imgsMissingAlt = await page.locator('img:not([alt])').count();
    expect(imgsMissingAlt, `${path} has <img> elements without alt=""`).toBe(0);

    // Every focusable button has an accessible name (text content,
    // aria-label, aria-labelledby, or title). aria-hidden buttons are
    // intentionally absent from the a11y tree (e.g. backdrop click
    // catchers); skip them. CSS `:has-text` does not accept regex,
    // so iterate.
    const buttons = page.locator(
      'button:not([aria-hidden="true"]):not([tabindex="-1"])'
    );
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      const btn = buttons.nth(i);
      const text = ((await btn.textContent()) ?? '').trim();
      const ariaLabel = ((await btn.getAttribute('aria-label')) ?? '').trim();
      const labelledby = (
        (await btn.getAttribute('aria-labelledby')) ?? ''
      ).trim();
      const titleAttr = ((await btn.getAttribute('title')) ?? '').trim();
      const hasName =
        text.length > 0 ||
        ariaLabel.length > 0 ||
        labelledby.length > 0 ||
        titleAttr.length > 0;
      expect(hasName, `${path} button #${i} has no accessible name`).toBe(true);
    }

    // Every link has discernible text (text content or aria-label).
    const allLinks = page.locator('a[href]');
    const linkCount = await allLinks.count();
    for (let i = 0; i < linkCount; i++) {
      const link = allLinks.nth(i);
      const text = (await link.textContent()) ?? '';
      const ariaLabel = (await link.getAttribute('aria-label')) ?? '';
      const labelledby = (await link.getAttribute('aria-labelledby')) ?? '';
      const hasName =
        text.trim().length > 0 ||
        ariaLabel.trim().length > 0 ||
        labelledby.trim().length > 0;
      const href = (await link.getAttribute('href')) ?? '';
      expect(hasName, `${path} link href=${href} has no accessible name`).toBe(
        true
      );
    }
  });
}
