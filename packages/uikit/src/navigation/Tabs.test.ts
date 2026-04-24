import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Tabs, Tab } from './Tabs.tsx';

/**
 * Behavioural contract for <Tabs>:
 *   - ARIA tablist + role="tab" triggers + role="tabpanel" panels
 *   - aria-selected on the active trigger
 *   - ark/zag marks selection with `data-selected=""` on the active
 *     trigger (absent on inactive). The stylesheet targets that.
 *   - Content panels expose `data-state="open"` on the active panel and
 *     `data-state="closed"` on inactive ones (ark renders inactive
 *     panels with `hidden`, preserving our "inactive panels hidden"
 *     invariant).
 *   - controlled activeKey overrides defaultActiveKey
 *
 * Keyboard navigation (Arrow / Home / End) is driven by the @zag-js
 * machine and is exercised by Playwright goldens once components ship
 * with interactive stories. SSR tests assert shape only.
 */

// Extract individual attributes from an anchor/button tag by tag pattern.
function extractTagByRole(html: string, role: string): string[] {
  const re = new RegExp(`<[^>]*role="${role}"[^>]*>`, 'g');
  return html.match(re) ?? [];
}

test('Tabs renders role=tablist with one role=tab per Tab child', () => {
  const html = renderToStaticMarkup(
    createElement(
      Tabs,
      { defaultActiveKey: 'a' },
      createElement(Tab, { eventKey: 'a', title: 'A' }, 'first'),
      createElement(Tab, { eventKey: 'b', title: 'B' }, 'second')
    )
  );
  assert.match(html, /role="tablist"/);
  const triggers = extractTagByRole(html, 'tab');
  assert.equal(triggers.length, 2, 'expected exactly two role=tab buttons');
  // Active trigger carries aria-selected=true.
  assert.ok(
    triggers.some(t => /aria-selected="true"/.test(t)),
    'expected one aria-selected=true trigger'
  );
  assert.ok(
    triggers.some(t => /aria-selected="false"/.test(t)),
    'expected one aria-selected=false trigger'
  );
});

test('Tabs marks active trigger with data-selected (zag convention)', () => {
  const html = renderToStaticMarkup(
    createElement(
      Tabs,
      { defaultActiveKey: 'a' },
      createElement(Tab, { eventKey: 'a', title: 'A' }, 'first'),
      createElement(Tab, { eventKey: 'b', title: 'B' }, 'second')
    )
  );
  const triggers = extractTagByRole(html, 'tab');
  const active = triggers.find(t => /aria-selected="true"/.test(t));
  const inactive = triggers.find(t => /aria-selected="false"/.test(t));
  assert.ok(active && /data-selected=""/.test(active));
  assert.ok(inactive && !/data-selected=""/.test(inactive));
});

test('Tabs mirrors open/closed on panels and hides inactive ones', () => {
  const html = renderToStaticMarkup(
    createElement(
      Tabs,
      { defaultActiveKey: 'a' },
      createElement(Tab, { eventKey: 'a', title: 'A' }, 'first'),
      createElement(Tab, { eventKey: 'b', title: 'B' }, 'second')
    )
  );
  const panels = extractTagByRole(html, 'tabpanel');
  assert.equal(panels.length, 2);
  assert.ok(panels.some(p => /data-state="open"/.test(p)));
  assert.ok(panels.some(p => /data-state="closed"/.test(p)));
  // Inactive panel gets the `hidden` attribute.
  assert.match(html, /hidden=""/);
});

test('Tabs respects controlled activeKey', () => {
  const html = renderToStaticMarkup(
    createElement(
      Tabs,
      { activeKey: 'b' },
      createElement(Tab, { eventKey: 'a', title: 'A' }, 'first'),
      createElement(Tab, { eventKey: 'b', title: 'B' }, 'second')
    )
  );
  const triggers = extractTagByRole(html, 'tab');
  const bTrigger = triggers.find(t => /data-value="b"/.test(t));
  const aTrigger = triggers.find(t => /data-value="a"/.test(t));
  assert.ok(
    bTrigger && /aria-selected="true"/.test(bTrigger),
    'expected trigger b to be selected when controlled activeKey="b"'
  );
  assert.ok(
    aTrigger && /aria-selected="false"/.test(aTrigger),
    'expected trigger a to be unselected when controlled activeKey="b"'
  );
});
