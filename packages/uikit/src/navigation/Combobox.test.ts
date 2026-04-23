import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Combobox, filterItemsByLabel } from './Combobox.tsx';

const items = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python', disabled: true }
];

test('filterItemsByLabel: empty query returns all items', () => {
  assert.deepEqual(filterItemsByLabel(items, ''), items);
});

test('filterItemsByLabel: case-insensitive substring match', () => {
  const hits = filterItemsByLabel(items, 'script');
  assert.deepEqual(
    hits.map(i => i.value),
    ['js', 'ts']
  );
});

test('filterItemsByLabel: treats ReactNode labels safely (falls back to value)', () => {
  const mixed = [{ value: 'x', label: null as unknown as React.ReactNode }];
  assert.deepEqual(filterItemsByLabel(mixed, 'x'), mixed);
});

test('Combobox renders a root wrapper with base class', () => {
  const html = renderToStaticMarkup(
    createElement(Combobox, { items, 'aria-label': 'Stack' })
  );
  assert.match(html, /<div[^>]*class="combobox"/);
  assert.match(html, /data-part="root"/);
});

test('Combobox input carries role=combobox + aria-autocomplete=list', () => {
  const html = renderToStaticMarkup(
    createElement(Combobox, { items, 'aria-label': 'Stack' })
  );
  assert.match(html, /<input[^>]*role="combobox"/);
  assert.match(html, /aria-autocomplete="list"/);
  assert.match(html, /aria-expanded="false"/);
});

test('Combobox input and listbox share id via aria-controls', () => {
  const html = renderToStaticMarkup(
    createElement(Combobox, { items, id: 'stack', 'aria-label': 'Stack' })
  );
  const input = html.match(/<input[^>]*>/)?.[0] ?? '';
  assert.match(input, /aria-controls="stack-listbox"/);
  assert.match(html, /<ul[^>]*id="stack-listbox"/);
});

test('Combobox renders items as role=option inside role=listbox', () => {
  const html = renderToStaticMarkup(
    createElement(Combobox, { items, 'aria-label': 'Stack' })
  );
  assert.match(html, /<ul[^>]*role="listbox"/);
  const options = html.match(/role="option"/g) ?? [];
  assert.equal(options.length, 3);
});

test('Combobox marks the selected value with aria-selected=true', () => {
  const html = renderToStaticMarkup(
    createElement(Combobox, {
      items,
      value: 'ts',
      'aria-label': 'Stack'
    })
  );
  const ts = html.match(/<li[^>]*data-value="ts"[^>]*>/)?.[0] ?? '';
  const js = html.match(/<li[^>]*data-value="js"[^>]*>/)?.[0] ?? '';
  assert.match(ts, /aria-selected="true"/);
  assert.match(js, /aria-selected="false"/);
});

test('Combobox disabled items carry aria-disabled', () => {
  const html = renderToStaticMarkup(
    createElement(Combobox, { items, 'aria-label': 'Stack' })
  );
  const py = html.match(/<li[^>]*data-value="py"[^>]*>/)?.[0] ?? '';
  assert.match(py, /aria-disabled="true"/);
});

test('Combobox inputValue prop sets input default value', () => {
  const html = renderToStaticMarkup(
    createElement(Combobox, {
      items,
      inputValue: 'ts',
      'aria-label': 'Stack'
    })
  );
  assert.match(html, /<input[^>]*value="ts"/);
});

test('Combobox renderItem override drives option content', () => {
  const html = renderToStaticMarkup(
    createElement(Combobox, {
      items,
      'aria-label': 'Stack',
      renderItem: item =>
        createElement('span', { 'data-custom': 'yes' }, item.value)
    })
  );
  assert.match(html, /<span data-custom="yes">js<\/span>/);
});

test('Combobox composes consumer className on the root', () => {
  const html = renderToStaticMarkup(
    createElement(Combobox, {
      items,
      'aria-label': 'Stack',
      className: 'extra'
    })
  );
  assert.match(html, /class="combobox extra"/);
});
