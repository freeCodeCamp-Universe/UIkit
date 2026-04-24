import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import type { NavSection } from '../../data/nav.ts';
import { AppSidebar } from './AppSidebar.tsx';

const FIXTURE: readonly NavSection[] = [
  {
    id: 'guides',
    label: 'Guides',
    items: [{ id: 'guides', label: 'Overview', href: '/guides' }]
  },
  {
    id: 'primitives',
    label: 'Primitives',
    items: [{ id: 'cmp-text', label: 'Text', href: '/api/text' }]
  },
  {
    id: 'forms',
    label: 'Forms',
    items: [{ id: 'cmp-input', label: 'Input', href: '/api/input' }]
  }
];

test('AppSidebar renders a <Sidebar> with a section per nav entry', () => {
  const html = renderToStaticMarkup(
    createElement(AppSidebar, { nav: FIXTURE, currentPath: '/api/text' })
  );
  assert.match(html, /<aside[^>]*class="sidebar"/);
  assert.match(html, /sidebar__intro-kicker/);
  assert.match(html, /sidebar__hint/);
  // Every section ships expanded after Wave 4 · 4.6 — no
  // collapsible affordance in the markup.
  assert.ok(
    (html.match(/sidebar__section/g) ?? []).length >= FIXTURE.length,
    'every section should render a sidebar__section wrapper'
  );
});

test('AppSidebar marks the current item with data-active="true"', () => {
  const html = renderToStaticMarkup(
    createElement(AppSidebar, { nav: FIXTURE, currentPath: '/api/text' })
  );
  const activeAnchor = html.match(/<a[^>]*href="\/api\/text"[^>]*>/)?.[0] ?? '';
  assert.match(activeAnchor, /data-active="true"/);
  assert.match(activeAnchor, /aria-current="page"/);
  const inactiveAnchor =
    html.match(/<a[^>]*href="\/api\/input"[^>]*>/)?.[0] ?? '';
  assert.doesNotMatch(inactiveAnchor, /data-active/);
});
