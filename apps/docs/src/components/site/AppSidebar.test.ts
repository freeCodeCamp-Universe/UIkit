import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import type { NavSection } from '../../data/nav.ts';
import { AppSidebar, shouldOpenSection } from './AppSidebar.tsx';

const FIXTURE: readonly NavSection[] = [
  {
    id: 'guides',
    label: 'Guides',
    items: [{ id: 'guides', label: 'Overview', href: '/guides' }]
  },
  {
    id: 'primitives',
    label: 'Primitives',
    items: [{ id: 'cmp-text', label: 'Text', href: '/components/text' }]
  },
  {
    id: 'forms',
    label: 'Forms',
    items: [{ id: 'cmp-input', label: 'Input', href: '/components/input' }]
  }
];

test('shouldOpenSection keeps guides + primitives expanded by default', () => {
  assert.equal(shouldOpenSection(FIXTURE[0]!, '/components/button'), true);
  assert.equal(shouldOpenSection(FIXTURE[1]!, '/components/button'), true);
});

test('shouldOpenSection opens non-default section when the current path matches', () => {
  assert.equal(shouldOpenSection(FIXTURE[2]!, '/components/input'), true);
});

test('shouldOpenSection keeps non-default section closed when path elsewhere', () => {
  assert.equal(shouldOpenSection(FIXTURE[2]!, '/components/button'), false);
});

test('AppSidebar renders a <Sidebar> with a section per nav entry', () => {
  const html = renderToStaticMarkup(
    createElement(AppSidebar, { nav: FIXTURE, currentPath: '/components/text' })
  );
  assert.match(html, /<aside[^>]*class="sidebar"/);
  assert.match(html, /sidebar__intro-kicker/);
  assert.match(html, /sidebar__hint/);
  assert.ok(
    (html.match(/sidebar__section--collapsible/g) ?? []).length ===
      FIXTURE.length,
    'every section should render collapsible'
  );
});

test('AppSidebar marks the current item with data-active="true"', () => {
  const html = renderToStaticMarkup(
    createElement(AppSidebar, { nav: FIXTURE, currentPath: '/components/text' })
  );
  const activeAnchor =
    html.match(/<a[^>]*href="\/components\/text"[^>]*>/)?.[0] ?? '';
  assert.match(activeAnchor, /data-active="true"/);
  assert.match(activeAnchor, /aria-current="page"/);
  const inactiveAnchor =
    html.match(/<a[^>]*href="\/components\/input"[^>]*>/)?.[0] ?? '';
  assert.doesNotMatch(inactiveAnchor, /data-active/);
});
