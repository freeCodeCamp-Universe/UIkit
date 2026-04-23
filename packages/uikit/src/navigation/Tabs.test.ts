import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Tabs, Tab } from './Tabs.tsx';

test('Tabs renders role=tablist with a button per Tab child', () => {
  const html = renderToStaticMarkup(
    createElement(
      Tabs,
      { defaultActiveKey: 'a' },
      createElement(Tab, { eventKey: 'a', title: 'A' }, 'first'),
      createElement(Tab, { eventKey: 'b', title: 'B' }, 'second')
    )
  );
  assert.match(html, /role="tablist"/);
  assert.match(html, /class="tabs__tab"[^>]*aria-selected="true"/);
  assert.match(html, /class="tabs__tab"[^>]*aria-selected="false"/);
});

test('Tabs hides inactive panels', () => {
  const html = renderToStaticMarkup(
    createElement(
      Tabs,
      { defaultActiveKey: 'a' },
      createElement(Tab, { eventKey: 'a', title: 'A' }, 'first'),
      createElement(Tab, { eventKey: 'b', title: 'B' }, 'second')
    )
  );
  assert.match(html, /role="tabpanel"[^>]*class="tabs__panel"/);
  assert.match(html, /hidden=""/);
});
