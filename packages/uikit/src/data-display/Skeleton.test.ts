import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Skeleton } from './Skeleton.tsx';

test('Skeleton default renders <div role=status class="skeleton">', () => {
  const html = renderToStaticMarkup(createElement(Skeleton));
  assert.match(html, /role="status"/);
  assert.match(html, /class="skeleton"/);
  assert.match(html, /aria-busy="true"/);
});

test('Skeleton variant maps to skeleton--<variant> modifier', () => {
  const html = renderToStaticMarkup(
    createElement(Skeleton, { variant: 'circle' })
  );
  assert.match(html, /class="skeleton skeleton--circle"/);
});

test('Skeleton width/height pass through via inline style', () => {
  const html = renderToStaticMarkup(
    createElement(Skeleton, { width: 160, height: 24 })
  );
  assert.match(html, /style="[^"]*width:\s*160px[^"]*"/);
  assert.match(html, /style="[^"]*height:\s*24px[^"]*"/);
});

test('Skeleton text variant with lines emits one child per line', () => {
  const html = renderToStaticMarkup(
    createElement(Skeleton, { variant: 'text', lines: 3 })
  );
  assert.match(html, /class="skeleton skeleton--text"/);
  const matches = html.match(/class="skeleton__line"/g) ?? [];
  assert.equal(matches.length, 3);
});

test('Skeleton default text variant without lines omits line children', () => {
  const html = renderToStaticMarkup(
    createElement(Skeleton, { variant: 'text' })
  );
  assert.doesNotMatch(html, /skeleton__line/);
});

test('Skeleton composes user className and visually hides sr label', () => {
  const html = renderToStaticMarkup(
    createElement(Skeleton, {
      className: 'loader-wrap',
      label: 'Loading posts'
    })
  );
  assert.match(html, /class="skeleton loader-wrap"/);
  assert.match(html, /class="sr-only">Loading posts/);
});
