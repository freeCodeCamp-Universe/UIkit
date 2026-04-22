import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Callout } from './Callout.tsx';

test('Callout default variant renders tip label', () => {
  const html = renderToStaticMarkup(createElement(Callout, null, 'body'));
  assert.match(html, /class="callout callout--tip"/);
  assert.match(html, /class="callout__label">Tip</);
});

test('Callout uses custom label when provided', () => {
  const html = renderToStaticMarkup(
    createElement(Callout, { variant: 'warning', label: 'Heads up' }, 'b')
  );
  assert.match(html, /class="callout callout--warning"/);
  assert.match(html, />Heads up</);
});
