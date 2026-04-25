// Wave 9 P3.2 (W9-B11) — layout showcases must render landscape.
//
// `<SidebarLayout>`, `<StackedLayout>`, and `<AuthLayout>` are
// chrome-shape primitives — by nature landscape (header bar at top,
// rails left/right, content below). The Wave 9 audit (B11) caught
// the three layout previews rendering in cramped portrait frames at
// desktop, with internal labels truncated mid-character ("Ma…",
// "cor…"). The cause: the `maxWidth: 680px` style was being
// out-stretched by `previewStacked`'s `align-items: stretch` flex
// rule, while the explicit `height` was clamped by `min-height`
// only — together producing a tall narrow column.
//
// Contract this spec locks at the `desktop` viewport (1440 wide):
//
//   1. Each layout's bounding box paints WIDER than it is TALL.
//   2. The width is at least 480px so internal labels never clip.
//
// We assert at the live `<section>` preview level, not on the
// internal aside/header — those can be portrait by design (a 160px
// rail inside a 680px frame is fine; the FRAME is what must be
// landscape).
import { test, expect } from '@playwright/test';

const SLUGS = ['sidebar-layout', 'stacked-layout', 'auth-layout'] as const;

test.describe('@behavioural layout-landscape', () => {
  for (const slug of SLUGS) {
    test(`${slug} preview renders in landscape (width > height)`, async ({
      page
    }) => {
      await page.goto(`/#${slug}`, { waitUntil: 'networkidle' });
      const preview = page
        .locator(`section#${slug} .showcase__preview > *`)
        .first();
      await expect(preview).toBeVisible();
      const box = await preview.boundingBox();
      expect(box, `${slug}: preview must have a bounding box`).not.toBeNull();
      if (!box) return;
      expect(
        box.width,
        `${slug}: preview must be at least 480px wide (was ${box.width})`
      ).toBeGreaterThanOrEqual(480);
      expect(
        box.width,
        `${slug}: landscape contract requires width > height (got ${box.width} × ${box.height})`
      ).toBeGreaterThan(box.height);
    });
  }
});
