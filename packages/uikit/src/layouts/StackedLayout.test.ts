import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { StackedLayout } from './StackedLayout.tsx';

test('StackedLayout renders root wrapper with base class', () => {
  const html = renderToStaticMarkup(createElement(StackedLayout, {}, 'body'));
  assert.match(html, /^<div class="stacked-layout"/);
});

test('StackedLayout renders header slot in .stacked-layout__header', () => {
  const html = renderToStaticMarkup(
    createElement(
      StackedLayout,
      { header: createElement('span', { 'data-x': 'h' }, 'bar') },
      'body'
    )
  );
  assert.match(
    html,
    /<div class="stacked-layout__header"><span data-x="h">bar<\/span><\/div>/
  );
});

test('StackedLayout wraps children in <main> with class', () => {
  const html = renderToStaticMarkup(
    createElement(StackedLayout, {}, 'content')
  );
  assert.match(html, /<main class="stacked-layout__main">content<\/main>/);
});

test('StackedLayout renders footer slot in .stacked-layout__footer', () => {
  const html = renderToStaticMarkup(
    createElement(
      StackedLayout,
      { footer: createElement('small', {}, 'c') },
      'body'
    )
  );
  assert.match(
    html,
    /<div class="stacked-layout__footer"><small>c<\/small><\/div>/
  );
});

test('StackedLayout omits header / footer containers when slots absent', () => {
  const html = renderToStaticMarkup(createElement(StackedLayout, {}, 'x'));
  assert.doesNotMatch(html, /stacked-layout__header/);
  assert.doesNotMatch(html, /stacked-layout__footer/);
});

test('StackedLayout composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(StackedLayout, { className: 'app' }, 'x')
  );
  assert.match(html, /class="stacked-layout app"/);
});
