import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { SidebarLayout } from './SidebarLayout.tsx';

test('SidebarLayout renders a root wrapper with base class', () => {
  const html = renderToStaticMarkup(
    createElement(SidebarLayout, {}, 'content')
  );
  assert.match(html, /^<div class="sidebar-layout"/);
  assert.match(html, /<\/div>$/);
});

test('SidebarLayout renders header slot inside .sidebar-layout__header', () => {
  const html = renderToStaticMarkup(
    createElement(
      SidebarLayout,
      { header: createElement('span', { 'data-x': 'nav' }, 'bar') },
      'body'
    )
  );
  assert.match(
    html,
    /<div class="sidebar-layout__header"><span data-x="nav">bar<\/span><\/div>/
  );
});

test('SidebarLayout renders sidebar slot inside .sidebar-layout__aside', () => {
  const html = renderToStaticMarkup(
    createElement(
      SidebarLayout,
      { sidebar: createElement('span', { 'data-x': 'side' }, 's') },
      'body'
    )
  );
  assert.match(
    html,
    /<div class="sidebar-layout__aside"><span data-x="side">s<\/span><\/div>/
  );
});

test('SidebarLayout wraps children in <main> with class', () => {
  const html = renderToStaticMarkup(
    createElement(SidebarLayout, {}, 'main body')
  );
  assert.match(html, /<main class="sidebar-layout__main">main body<\/main>/);
});

test('SidebarLayout omits header container when header absent', () => {
  const html = renderToStaticMarkup(createElement(SidebarLayout, {}, 'x'));
  assert.doesNotMatch(html, /sidebar-layout__header/);
});

test('SidebarLayout omits aside container when sidebar absent', () => {
  const html = renderToStaticMarkup(createElement(SidebarLayout, {}, 'x'));
  assert.doesNotMatch(html, /sidebar-layout__aside/);
});

test('SidebarLayout composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(SidebarLayout, { className: 'app' }, 'x')
  );
  assert.match(html, /class="sidebar-layout app"/);
});
