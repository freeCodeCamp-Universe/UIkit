import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Select } from './Select.tsx';

const options = [
  createElement('option', { key: 'a', value: 'a' }, 'A'),
  createElement('option', { key: 'b', value: 'b' }, 'B')
];

test('Select renders a native <select> with base class', () => {
  const html = renderToStaticMarkup(createElement(Select, {}, options));
  assert.match(html, /<select[^>]*class="select"/);
  assert.match(html, /<\/select>/);
});

test('Select renders its <option> children', () => {
  const html = renderToStaticMarkup(createElement(Select, {}, options));
  assert.match(html, /<option value="a">A<\/option>/);
  assert.match(html, /<option value="b">B<\/option>/);
});

test('Select invalid sets aria-invalid', () => {
  const html = renderToStaticMarkup(
    createElement(Select, { invalid: true }, options)
  );
  assert.match(html, /aria-invalid="true"/);
});

test('Select composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(Select, { className: 'extra' }, options)
  );
  assert.match(html, /class="select extra"/);
});

test('Select forwards disabled to the native element', () => {
  const html = renderToStaticMarkup(
    createElement(Select, { disabled: true }, options)
  );
  assert.match(html, /<select[^>]*disabled/);
});

test('Select accepts name + defaultValue for form wiring', () => {
  const html = renderToStaticMarkup(
    createElement(Select, { name: 'tier', defaultValue: 'b' }, options)
  );
  assert.match(html, /<select[^>]*name="tier"/);
  assert.match(html, /<option value="b"[^>]*selected/);
});
