import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Heading } from './Heading.tsx';

test('Heading defaults to <h2 class="heading heading--md">', () => {
  const html = renderToStaticMarkup(createElement(Heading, null, 'Section'));
  assert.match(html, /^<h2 class="heading heading--md">Section<\/h2>$/);
});

test('Heading level maps to h1..h6', () => {
  const html = renderToStaticMarkup(
    createElement(Heading, { level: 1 }, 'Top')
  );
  assert.match(html, /^<h1 /);
});

test('Heading size decoupled from level', () => {
  const html = renderToStaticMarkup(
    createElement(Heading, { level: 3, size: 'display' }, 'Big')
  );
  assert.match(html, /^<h3 class="heading heading--display">/);
});

test('Heading size modifier maps to heading--<size>', () => {
  const html = renderToStaticMarkup(
    createElement(Heading, { size: 'sm' }, 'Small')
  );
  assert.match(html, /class="heading heading--sm"/);
});

test('Heading composes user className', () => {
  const html = renderToStaticMarkup(
    createElement(Heading, { className: 'custom' }, 'x')
  );
  assert.match(html, /class="heading heading--md custom"/);
});

test('Heading rejects invalid level by clamping to nearest heading tag', () => {
  // @ts-expect-error runtime guard
  const html = renderToStaticMarkup(createElement(Heading, { level: 9 }, 'x'));
  assert.match(html, /^<h6 /);
});
