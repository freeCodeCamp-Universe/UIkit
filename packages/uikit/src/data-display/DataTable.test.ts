import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement, type ComponentType } from 'react';
import { DataTable, type DataTableProps } from './DataTable.tsx';

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
}

const TypedDataTable = DataTable as ComponentType<DataTableProps<User>>;

const ROWS: User[] = [
  { id: 'a', name: 'Ada', email: 'ada@example.com', status: 'active' },
  { id: 'b', name: 'Ben', email: 'ben@example.com', status: 'pending' }
];

const COLUMNS = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'email', header: 'Email', accessor: (row: User) => row.email },
  { id: 'status', header: 'Status', accessor: 'status', align: 'right' }
] as const;

test('DataTable renders table with column headers', () => {
  const html = renderToStaticMarkup(
    createElement(TypedDataTable, { columns: COLUMNS, rows: ROWS })
  );
  assert.match(html, /class="data-table"/);
  assert.match(html, /<th[^>]*>.*?Name.*?<\/th>/);
  assert.match(html, /<th[^>]*>.*?Email.*?<\/th>/);
  assert.match(html, /<th[^>]*>.*?Status.*?<\/th>/);
});

test('DataTable renders rows with string-key and function accessors', () => {
  const html = renderToStaticMarkup(
    createElement(TypedDataTable, { columns: COLUMNS, rows: ROWS })
  );
  assert.match(html, /<td[^>]*>Ada<\/td>/);
  assert.match(html, /<td[^>]*>ada@example\.com<\/td>/);
  assert.match(html, /<td[^>]*>pending<\/td>/);
});

test('DataTable applies align modifier class on cells', () => {
  const html = renderToStaticMarkup(
    createElement(TypedDataTable, { columns: COLUMNS, rows: ROWS })
  );
  assert.match(html, /class="data-table__cell data-table__cell--right"/);
});

test('DataTable sortable header emits button + aria-sort', () => {
  const html = renderToStaticMarkup(
    createElement(TypedDataTable, {
      columns: COLUMNS,
      rows: ROWS,
      sortBy: { columnId: 'name', direction: 'asc' },
      onSortChange: () => {}
    })
  );
  assert.match(
    html,
    /<th[^>]*aria-sort="ascending"[^>]*>[\s\S]*?<button[\s\S]*?Name/
  );
});

test('DataTable unsorted sortable header sets aria-sort=none', () => {
  const html = renderToStaticMarkup(
    createElement(TypedDataTable, {
      columns: COLUMNS,
      rows: ROWS,
      onSortChange: () => {}
    })
  );
  assert.match(html, /aria-sort="none"/);
});

test('DataTable loading renders skeleton rows instead of data', () => {
  const html = renderToStaticMarkup(
    createElement(TypedDataTable, {
      columns: COLUMNS,
      rows: [],
      loading: true
    })
  );
  assert.match(html, /class="data-table__skeleton"/);
  assert.doesNotMatch(html, /Ada/);
});

test('DataTable empty renders emptyState in a full-width row', () => {
  const html = renderToStaticMarkup(
    createElement(TypedDataTable, {
      columns: COLUMNS,
      rows: [],
      emptyState: createElement('p', { 'data-test': 'es' }, 'None here')
    })
  );
  assert.match(html, /<td[^>]*colspan="3"/i);
  assert.match(html, /data-test="es"/);
});

test('DataTable selection renders checkbox column + select-all', () => {
  const html = renderToStaticMarkup(
    createElement(TypedDataTable, {
      columns: COLUMNS,
      rows: ROWS,
      selection: new Set<string>(),
      onSelectionChange: () => {},
      rowId: (row: User) => row.id
    })
  );
  assert.match(html, /class="data-table__select-all"/);
  // Two data rows + one header → three checkboxes total.
  const cbs = html.match(/<input[^>]*type="checkbox"/g) ?? [];
  assert.equal(cbs.length, 3);
});

test('DataTable selection pre-checks rows whose id is in the set', () => {
  const html = renderToStaticMarkup(
    createElement(TypedDataTable, {
      columns: COLUMNS,
      rows: ROWS,
      selection: new Set<string>(['a']),
      onSelectionChange: () => {},
      rowId: (row: User) => row.id
    })
  );
  // Ada checked, Ben unchecked.
  assert.match(html, /<tr[^>]*data-row-id="a"[^>]*data-selected="true"/);
  assert.match(html, /<tr[^>]*data-row-id="b"(?![^>]*data-selected)/);
});
