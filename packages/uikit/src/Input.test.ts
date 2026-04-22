import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Input } from './Input.tsx';

test('Input renders .input class', () => {
  const html = renderToStaticMarkup(createElement(Input, { placeholder: 'p' }));
  assert.match(html, /class="input"/);
  assert.match(html, /placeholder="p"/);
});

test('Input sets aria-invalid when invalid=true', () => {
  const html = renderToStaticMarkup(createElement(Input, { invalid: true }));
  assert.match(html, /aria-invalid="true"/);
});
