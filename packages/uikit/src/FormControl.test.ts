import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { FormControl } from './FormControl.tsx';

test('FormControl defaults to .input', () => {
  const html = renderToStaticMarkup(
    createElement(FormControl, { placeholder: 'x' })
  );
  assert.match(html, /class="input"/);
  assert.match(html, /<input/);
});

test('FormControl renders textarea when as=textarea', () => {
  const html = renderToStaticMarkup(
    createElement(FormControl, { as: 'textarea' })
  );
  assert.match(html, /<textarea/);
  assert.match(html, /class="input input--textarea"/);
});
