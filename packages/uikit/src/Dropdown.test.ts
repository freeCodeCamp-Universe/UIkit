import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Dropdown } from './Dropdown.tsx';

test('Dropdown renders closed by default with .dropdown root and toggle', () => {
  const html = renderToStaticMarkup(
    createElement(
      Dropdown,
      null,
      createElement(Dropdown.Toggle, null, 'Sort'),
      createElement(
        Dropdown.Menu,
        null,
        createElement(Dropdown.Item, { href: '#' }, 'A')
      )
    )
  );
  assert.match(html, /class="dropdown"/);
  assert.match(html, /aria-haspopup="menu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.ok(!html.includes('class="dropdown__menu"'));
});
