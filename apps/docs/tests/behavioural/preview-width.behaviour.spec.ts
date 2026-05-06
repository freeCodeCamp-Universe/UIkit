import { test, expect } from '@playwright/test';

test.describe('@behavioural preview-width', () => {
  test('Button card preview spans the full card chrome', async ({ page }) => {
    await page.goto('/playground#button', { waitUntil: 'networkidle' });
    const sec = page.locator('section#button');
    const card = sec.locator('.showcase');
    const preview = sec.locator('.showcase__preview');
    const cardBox = await card.boundingBox();
    const previewBox = await preview.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(previewBox).not.toBeNull();
    if (!cardBox || !previewBox) return;
    expect(Math.abs(cardBox.width - previewBox.width)).toBeLessThanOrEqual(4);
  });
});
