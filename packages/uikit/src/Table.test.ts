import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Table } from './Table.tsx';

test('Table renders with .table base class', () => {
  const html = renderToStaticMarkup(createElement(Table));
  assert.match(html, /<table[^>]*class="table"/);
});

test('Table modifiers compose', () => {
  const html = renderToStaticMarkup(
    createElement(Table, { striped: true, condensed: true })
  );
  assert.match(html, /class="table table--striped table--condensed"/);
});
