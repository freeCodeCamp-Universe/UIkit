import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Divider } from './Divider.tsx';

test('Divider renders <hr role="separator"> by default', () => {
  const html = renderToStaticMarkup(createElement(Divider));
  assert.match(html, /^<hr[^>]*role="separator"/);
  assert.match(html, /class="divider"/);
});

test('Divider vertical orientation applies modifier + aria', () => {
  const html = renderToStaticMarkup(
    createElement(Divider, { orientation: 'vertical' })
  );
  assert.match(html, /class="divider divider--vertical"/);
  assert.match(html, /aria-orientation="vertical"/);
});

test('Divider dashed variant applies modifier', () => {
  const html = renderToStaticMarkup(
    createElement(Divider, { variant: 'dashed' })
  );
  assert.match(html, /divider--dashed/);
});

test('Divider decorative drops role="separator"', () => {
  const html = renderToStaticMarkup(
    createElement(Divider, { decorative: true })
  );
  assert.doesNotMatch(html, /role="separator"/);
  assert.match(html, /aria-hidden="true"/);
});

test('Divider composes user className', () => {
  const html = renderToStaticMarkup(
    createElement(Divider, { className: 'custom' })
  );
  assert.match(html, /class="divider custom"/);
});
