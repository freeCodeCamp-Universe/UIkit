import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { CommandPalette } from './CommandPalette.tsx';

const GROUPS = [
  {
    label: 'Navigation',
    items: [
      { id: 'home', label: 'Go home', shortcut: 'g h' },
      { id: 'settings', label: 'Open settings' }
    ]
  },
  {
    label: 'Actions',
    items: [{ id: 'new', label: 'New task', icon: '+' }]
  }
];

test('CommandPalette closed renders no palette markup', () => {
  const html = renderToStaticMarkup(
    createElement(CommandPalette, {
      open: false,
      onClose: () => {},
      groups: GROUPS,
      onSelect: () => {}
    })
  );
  assert.doesNotMatch(html, /command-palette/);
});

test('CommandPalette open renders search input + list', () => {
  const html = renderToStaticMarkup(
    createElement(CommandPalette, {
      open: true,
      onClose: () => {},
      groups: GROUPS,
      onSelect: () => {},
      placeholder: 'Type a command…'
    })
  );
  assert.match(html, /class="command-palette"/);
  assert.match(
    html,
    /class="command-palette__search"[^>]*placeholder="Type a command…"/
  );
  assert.match(html, /class="command-palette__list"/);
});

test('CommandPalette renders group labels as section eyebrows', () => {
  const html = renderToStaticMarkup(
    createElement(CommandPalette, {
      open: true,
      onClose: () => {},
      groups: GROUPS,
      onSelect: () => {}
    })
  );
  assert.match(html, /class="command-palette__group-label">Navigation</);
  assert.match(html, /class="command-palette__group-label">Actions</);
});

test('CommandPalette renders each item with label + optional shortcut', () => {
  const html = renderToStaticMarkup(
    createElement(CommandPalette, {
      open: true,
      onClose: () => {},
      groups: GROUPS,
      onSelect: () => {}
    })
  );
  assert.match(html, /class="command-palette__label">Go home</);
  assert.match(html, /class="command-palette__shortcut">g h</);
  // Item with no shortcut omits the shortcut node.
  const settingsMatch = html.match(/Open settings[\s\S]*?<\/li>/);
  assert.ok(settingsMatch);
  assert.doesNotMatch(settingsMatch[0], /command-palette__shortcut/);
});

test('CommandPalette renders an icon wrapper when icon is provided', () => {
  const html = renderToStaticMarkup(
    createElement(CommandPalette, {
      open: true,
      onClose: () => {},
      groups: GROUPS,
      onSelect: () => {}
    })
  );
  assert.match(html, /class="command-palette__icon"[^>]*aria-hidden="true"/);
});

test('CommandPalette empty groups renders the emptyState slot', () => {
  const html = renderToStaticMarkup(
    createElement(CommandPalette, {
      open: true,
      onClose: () => {},
      groups: [],
      onSelect: () => {},
      emptyState: createElement('p', { className: 'no-matches' }, 'No matches')
    })
  );
  assert.match(html, /class="no-matches">No matches</);
});
