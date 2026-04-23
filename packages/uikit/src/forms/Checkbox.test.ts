import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Checkbox } from './Checkbox.tsx';

test('Checkbox without label renders raw input', () => {
  const html = renderToStaticMarkup(createElement(Checkbox));
  assert.match(html, /<input[^>]*type="checkbox"/);
  assert.ok(!html.includes('class="check"'));
});

test('Checkbox with label wraps in .check label', () => {
  const html = renderToStaticMarkup(
    createElement(Checkbox, { label: 'Accept' })
  );
  assert.match(html, /class="check"/);
  assert.match(html, /<span>Accept<\/span>/);
});
