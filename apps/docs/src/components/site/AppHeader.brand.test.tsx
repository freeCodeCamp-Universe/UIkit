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
  expect(brand[0]).not.toMatch(/<em[\s>]/i);
  // Wordmark text still present.
  expect(brand[0]).toMatch(/freeCodeCamp UIKit/);
});
