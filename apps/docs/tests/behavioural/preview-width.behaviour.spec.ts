// Wave 9 P7.3 (W9-B2) — preview region must fill the card width.
//
// The audit (B2) flagged that some cards' previews looked narrow on
// desktop. After Wave 8/9 chrome cleanup, the visible "narrowness"
// turned out to be inherent to the demo content (e.g. sidebar
// showcase deliberately renders a 220px rail, layout demos cap at
// 680px landscape) — not a chrome-side regression.
//
// What matters as a contract: `.showcase__preview` itself spans the
// card horizontally so a future component with content wider than
// 360px is not artificially clipped. We sample the Button card —
// its 7 buttons + Beach gap easily fill any chrome — and assert
// preview width == card width minus the 1px borders.
import { test, expect } from '@playwright/test';

test.describe('@behavioural preview-width', () => {
  test('Button card preview spans the full card chrome', async ({ page }) => {
    await page.goto('/#button', { waitUntil: 'networkidle' });
    const sec = page.locator('section#button');
    const card = sec.locator('.showcase');
    const preview = sec.locator('.showcase__preview');
    const cardBox = await card.boundingBox();
    const previewBox = await preview.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(previewBox).not.toBeNull();
    if (!cardBox || !previewBox) return;
    // The card paints a 1px border on each side; preview content sits
    // inside that border. Allow up to 4px slack.
    expect(Math.abs(cardBox.width - previewBox.width)).toBeLessThanOrEqual(4);
  });
});
