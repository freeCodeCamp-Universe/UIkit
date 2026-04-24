import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import {
  Sidebar,
  SidebarSection,
  SidebarItem,
  isActiveHref
} from './Sidebar.tsx';

test('Sidebar renders <aside> with base class and role=navigation', () => {
  const html = renderToStaticMarkup(
    createElement(Sidebar, { 'aria-label': 'Primary' })
  );
  assert.match(html, /<aside[^>]*class="sidebar"/);
  assert.match(html, /role="navigation"/);
  assert.match(html, /aria-label="Primary"/);
});

test('SidebarSection renders eyebrow label', () => {
  const html = renderToStaticMarkup(
    createElement(SidebarSection, { label: 'Main' }, 'inner')
  );
  assert.match(html, /<div class="sidebar__eyebrow">Main<\/div>/);
  assert.match(html, />inner<\/section>/);
});

test('SidebarSection without label omits eyebrow', () => {
  const html = renderToStaticMarkup(createElement(SidebarSection, {}, 'x'));
  assert.doesNotMatch(html, /sidebar__eyebrow/);
});

test('SidebarItem renders as <a> when href provided', () => {
  const html = renderToStaticMarkup(
    createElement(SidebarItem, { href: '/home' }, 'Home')
  );
  const anchor = html.match(/<a[^>]*>/)?.[0] ?? '';
  assert.match(anchor, /href="\/home"/);
  assert.match(anchor, /class="sidebar__item"/);
  assert.match(html, />Home<\/span><\/a>/);
});

test('SidebarItem renders as <button> when href absent', () => {
  const html = renderToStaticMarkup(createElement(SidebarItem, {}, 'Settings'));
  assert.match(html, /<button[^>]*type="button"[^>]*class="sidebar__item"/);
});

test('SidebarItem active sets aria-current=page + data-active', () => {
  const html = renderToStaticMarkup(
    createElement(SidebarItem, { href: '/x', active: true }, 'X')
  );
  assert.match(html, /aria-current="page"/);
  assert.match(html, /data-active="true"/);
});

test('SidebarItem inactive omits aria-current', () => {
  const html = renderToStaticMarkup(
    createElement(SidebarItem, { href: '/x' }, 'X')
  );
  assert.doesNotMatch(html, /aria-current/);
});

test('Sidebar composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(Sidebar, { className: 'sticky', 'aria-label': 'P' })
  );
  assert.match(html, /class="sidebar sticky"/);
});

test('SidebarItem renders icon slot before label', () => {
  const html = renderToStaticMarkup(
    createElement(
      SidebarItem,
      {
        href: '/h',
        icon: createElement('svg', { 'data-icon': 'home' })
      },
      'Home'
    )
  );
  assert.match(
    html,
    /<span class="sidebar__icon"><svg data-icon="home"><\/svg><\/span>/
  );
});

test('SidebarSection without collapsible keeps <section> output (regression pin)', () => {
  const html = renderToStaticMarkup(
    createElement(SidebarSection, { label: 'Main' }, 'inner')
  );
  assert.match(html, /<section class="sidebar__section">/);
  assert.doesNotMatch(html, /<details/);
});

test('SidebarSection collapsible with defaultOpen=true emits <details open> with summary', () => {
  const html = renderToStaticMarkup(
    createElement(
      SidebarSection,
      { label: 'Main', collapsible: true, defaultOpen: true },
      'inner'
    )
  );
  assert.match(
    html,
    /<details[^>]*class="sidebar__section sidebar__section--collapsible"[^>]*open/
  );
  assert.match(html, /<summary class="sidebar__section__summary">/);
  assert.match(html, /<span class="sidebar__eyebrow">Main<\/span>/);
  assert.match(
    html,
    /<span class="sidebar__section__caret" aria-hidden="true">/
  );
});

test('SidebarSection collapsible with defaultOpen=false emits <details> without open', () => {
  const html = renderToStaticMarkup(
    createElement(
      SidebarSection,
      { label: 'Main', collapsible: true, defaultOpen: false },
      'inner'
    )
  );
  assert.match(
    html,
    /<details[^>]*class="sidebar__section sidebar__section--collapsible"/
  );
  assert.doesNotMatch(html, /<details[^>]*open/);
});

test('isActiveHref normalises trailing slashes and matches exactly', () => {
  assert.equal(isActiveHref('/components/button/', '/components/button'), true);
  assert.equal(isActiveHref('/components/button', '/components/button/'), true);
});

test('isActiveHref with exact:false matches descendants', () => {
  assert.equal(
    isActiveHref('/components/button', '/components', { exact: false }),
    true
  );
  assert.equal(
    isActiveHref('/components', '/components', { exact: false }),
    true
  );
});

test('isActiveHref default is exact — descendant paths do not match', () => {
  assert.equal(isActiveHref('/components/button', '/components'), false);
});
