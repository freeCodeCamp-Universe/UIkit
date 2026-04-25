// Wave 9 P4.2 (W9-B8.2) — site-header brand block must render on a
// single line (logo + wordmark only).
//
// Wave 7 shipped the brand with a stacked `<em>v0.1.0</em>` chip
// after the wordmark. The audit (B8.2) flagged this as design
// drift — the design's brand block is single-line and the version
// chip pushes the header height past the 38px target. Drop the
// `<em>` so the brand stays single-line; version surface lives in
// the footer + `package.json` import path on consumer code, not in
// the chrome.
import { test, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppHeader } from './AppHeader';

test('brand block renders no inline version chip (single-line)', () => {
  const html = renderToStaticMarkup(<AppHeader pathname='/' />);
  // The whole `.site-header__brand` anchor.
  const brand = html.match(
    /<a\s+class="site-header__brand"[^>]*>[\s\S]*?<\/a>/
  );
  expect(brand, 'brand anchor must render').not.toBeNull();
  if (!brand) return;
  // No <em> tag inside the brand block — the chrome should not
  // carry the version string.
  expect(brand[0]).not.toMatch(/<em[\s>]/i);
  // Wordmark text still present.
  expect(brand[0]).toMatch(/freeCodeCamp UIKit/);
});
