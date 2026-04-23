import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Pagination, paginationRange } from './Pagination.tsx';

test('paginationRange: short lists stay flat', () => {
  assert.deepEqual(paginationRange(1, 5, 1), [1, 2, 3, 4, 5]);
});

test('paginationRange: inserts trailing ellipsis near the start', () => {
  assert.deepEqual(paginationRange(2, 10, 1), [1, 2, 3, 'ellipsis', 10]);
});

test('paginationRange: inserts leading ellipsis near the end', () => {
  assert.deepEqual(paginationRange(9, 10, 1), [1, 'ellipsis', 8, 9, 10]);
});

test('paginationRange: dual ellipsis in the middle', () => {
  assert.deepEqual(paginationRange(5, 10, 1), [
    1,
    'ellipsis',
    4,
    5,
    6,
    'ellipsis',
    10
  ]);
});

test('Pagination renders a <nav> with role=navigation', () => {
  const html = renderToStaticMarkup(
    createElement(Pagination, { count: 40, pageSize: 10, page: 1 })
  );
  assert.match(html, /<nav[^>]*class="pagination"/);
  assert.match(html, /aria-label="pagination"/);
});

test('Pagination marks the current page with aria-current=page', () => {
  const html = renderToStaticMarkup(
    createElement(Pagination, { count: 40, pageSize: 10, page: 2 })
  );
  assert.match(html, /<button[^>]*aria-current="page"[^>]*>2<\/button>/);
});

test('Pagination disables prev at page 1', () => {
  const html = renderToStaticMarkup(
    createElement(Pagination, { count: 40, pageSize: 10, page: 1 })
  );
  const prevTag = html.match(/<button[^>]*data-part="prev"[^>]*>/)?.[0] ?? '';
  assert.match(prevTag, /disabled/);
});

test('Pagination disables next at last page', () => {
  const html = renderToStaticMarkup(
    createElement(Pagination, { count: 40, pageSize: 10, page: 4 })
  );
  const nextTag = html.match(/<button[^>]*data-part="next"[^>]*>/)?.[0] ?? '';
  assert.match(nextTag, /disabled/);
});

test('Pagination emits ellipsis markers for large ranges', () => {
  const html = renderToStaticMarkup(
    createElement(Pagination, { count: 100, pageSize: 10, page: 5 })
  );
  const ellipses = html.match(/data-part="ellipsis"/g) ?? [];
  assert.equal(ellipses.length, 2);
});

test('Pagination composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(Pagination, {
      count: 40,
      pageSize: 10,
      page: 1,
      className: 'extra'
    })
  );
  assert.match(html, /class="pagination extra"/);
});
