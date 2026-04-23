import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Badge } from './Badge.tsx';

test('Badge default renders plain .badge span', () => {
  const html = renderToStaticMarkup(createElement(Badge, null, 'New'));
  assert.match(html, /class="badge"/);
});

test('Badge variants map to --modifier classes', () => {
  const html = renderToStaticMarkup(
    createElement(Badge, { variant: 'success' }, 'ok')
  );
  assert.match(html, /class="badge badge--success"/);
});
