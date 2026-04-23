import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Text } from './Text.tsx';

test('Text default renders <p class="text">', () => {
  const html = renderToStaticMarkup(createElement(Text, null, 'hi'));
  assert.match(html, /^<p class="text">hi<\/p>$/);
});

test('Text size modifier maps to text--<size>', () => {
  const html = renderToStaticMarkup(createElement(Text, { size: 'sm' }, 'hi'));
  assert.match(html, /class="text text--sm"/);
});

test('Text size base omits modifier', () => {
  const html = renderToStaticMarkup(
    createElement(Text, { size: 'base' }, 'hi')
  );
  assert.match(html, /^<p class="text">hi<\/p>$/);
});

test('Text polymorphic as prop swaps element', () => {
  const html = renderToStaticMarkup(createElement(Text, { as: 'span' }, 'x'));
  assert.match(html, /^<span class="text">x<\/span>$/);
});

test('Text bold weight adds modifier', () => {
  const html = renderToStaticMarkup(
    createElement(Text, { weight: 'bold' }, 'x')
  );
  assert.match(html, /class="text text--bold"/);
});

test('Text muted tone adds modifier', () => {
  const html = renderToStaticMarkup(
    createElement(Text, { tone: 'muted' }, 'x')
  );
  assert.match(html, /class="text text--muted"/);
});

test('Text composes user className with modifiers', () => {
  const html = renderToStaticMarkup(
    createElement(
      Text,
      { size: 'lg', weight: 'bold', className: 'custom' },
      'x'
    )
  );
  assert.match(html, /class="text text--lg text--bold custom"/);
});
