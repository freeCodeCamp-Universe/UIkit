import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import type { NavSection } from '../../data/nav.ts';
import { AppSidebar } from './AppSidebar.tsx';

const FIXTURE: readonly NavSection[] = [
  {
    id: 'primitives',
    label: 'Primitives',
    items: [{ id: 'cmp-text', label: 'Text', href: '/playground#text' }]
  },
  {
    id: 'forms',
    label: 'Forms',
    items: [{ id: 'cmp-input', label: 'Input', href: '/playground#input' }]
  }
];

test('AppSidebar renders a <Sidebar> with a section per nav entry', () => {
  const html = renderToStaticMarkup(
    createElement(AppSidebar, {
      nav: FIXTURE,
      currentPath: '/playground',
      currentHash: '#text'
    })
  );
  assert.match(html, /<aside[^>]*class="sidebar"/);
  assert.match(html, /sidebar__intro-kicker/);
  assert.match(html, /sidebar__hint/);
  assert.ok(
    (html.match(/sidebar__section/g) ?? []).length >= FIXTURE.length,
    'every section should render a sidebar__section wrapper'
  );
});

test('AppSidebar marks the current item with data-active="true"', () => {
  const html = renderToStaticMarkup(
    createElement(AppSidebar, {
      nav: FIXTURE,
      currentPath: '/playground',
      currentHash: '#text'
    })
  );
  const activeAnchor =
    html.match(/<a[^>]*href="\/playground#text"[^>]*>/)?.[0] ?? '';
  assert.match(activeAnchor, /data-active="true"/);
  assert.match(activeAnchor, /aria-current="page"/);
  const inactiveAnchor =
    html.match(/<a[^>]*href="\/playground#input"[^>]*>/)?.[0] ?? '';
  assert.doesNotMatch(inactiveAnchor, /data-active/);
});

test('bare path on `/` no longer marks every cmp-* item active', () => {
  const html = renderToStaticMarkup(
    createElement(AppSidebar, {
      nav: FIXTURE,
      currentPath: '/playground',
      currentHash: ''
    })
  );
  const matches = html.match(/data-active="true"/g) ?? [];
  assert.equal(
    matches.length,
    0,
    'no anchor should be active when no hash is set'
  );
});

test('anchor items carry data-sidebar-link + data-target for scroll-spy', () => {
  const html = renderToStaticMarkup(
    createElement(AppSidebar, {
      nav: FIXTURE,
      currentPath: '/playground',
      currentHash: ''
    })
  );
  // Both items have hash hrefs; both must be tagged for the spy.
  const textAnchor =
    html.match(/<a[^>]*href="\/playground#text"[^>]*>/)?.[0] ?? '';
  assert.match(textAnchor, /data-sidebar-link/);
  assert.match(textAnchor, /data-target="text"/);
  const inputAnchor =
    html.match(/<a[^>]*href="\/playground#input"[^>]*>/)?.[0] ?? '';
  assert.match(inputAnchor, /data-sidebar-link/);
  assert.match(inputAnchor, /data-target="input"/);
});
