import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Listbox } from './Listbox.tsx';

const items = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie', disabled: true }
];

test('Listbox renders a <ul> with role=listbox and base class', () => {
  const html = renderToStaticMarkup(
    createElement(Listbox, { items, 'aria-label': 'Options' })
  );
  assert.match(html, /<ul[^>]*class="listbox"/);
  assert.match(html, /role="listbox"/);
  assert.match(html, /aria-label="Options"/);
});

test('Listbox renders each item as role=option', () => {
  const html = renderToStaticMarkup(
    createElement(Listbox, { items, 'aria-label': 'Options' })
  );
  const options = html.match(/role="option"/g) ?? [];
  assert.equal(options.length, 3);
  assert.match(html, />Alpha</);
  assert.match(html, />Bravo</);
});

test('Listbox single-select marks matching option aria-selected=true', () => {
  const html = renderToStaticMarkup(
    createElement(Listbox, {
      items,
      value: 'b',
      'aria-label': 'Options'
    })
  );
  const bravo = html.match(/<li[^>]*data-value="b"[^>]*>/)?.[0] ?? '';
  const alpha = html.match(/<li[^>]*data-value="a"[^>]*>/)?.[0] ?? '';
  assert.match(bravo, /aria-selected="true"/);
  assert.match(alpha, /aria-selected="false"/);
});

test('Listbox multi-select marks every matching option', () => {
  const html = renderToStaticMarkup(
    createElement(Listbox, {
      items,
      selectionMode: 'multiple',
      value: ['a', 'b'],
      'aria-label': 'Options'
    })
  );
  assert.match(html, /aria-multiselectable="true"/);
  const alpha = html.match(/<li[^>]*data-value="a"[^>]*>/)?.[0] ?? '';
  const bravo = html.match(/<li[^>]*data-value="b"[^>]*>/)?.[0] ?? '';
  const charlie = html.match(/<li[^>]*data-value="c"[^>]*>/)?.[0] ?? '';
  assert.match(alpha, /aria-selected="true"/);
  assert.match(bravo, /aria-selected="true"/);
  assert.match(charlie, /aria-selected="false"/);
});

test('Listbox marks disabled items with aria-disabled', () => {
  const html = renderToStaticMarkup(
    createElement(Listbox, { items, 'aria-label': 'Options' })
  );
  const charlie = html.match(/<li[^>]*data-value="c"[^>]*>/)?.[0] ?? '';
  assert.match(charlie, /aria-disabled="true"/);
});

test('Listbox composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(Listbox, {
      items,
      className: 'extra',
      'aria-label': 'Options'
    })
  );
  assert.match(html, /class="listbox extra"/);
});

test('Listbox single mode omits aria-multiselectable', () => {
  const html = renderToStaticMarkup(
    createElement(Listbox, { items, 'aria-label': 'Options' })
  );
  assert.doesNotMatch(html, /aria-multiselectable/);
});
