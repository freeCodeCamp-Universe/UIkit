import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Panel } from './Panel.tsx';

test('Panel wraps children in .panel__body', () => {
  const html = renderToStaticMarkup(createElement(Panel, null, 'x'));
  assert.match(html, /class="panel"/);
  assert.match(html, /class="panel__body"/);
});

test('Panel renders heading when title prop is set', () => {
  const html = renderToStaticMarkup(createElement(Panel, { title: 'Hi' }, 'x'));
  assert.match(html, /class="panel__heading">Hi</);
});

test('Panel variant applies modifier', () => {
  const html = renderToStaticMarkup(createElement(Panel, { variant: 'info' }));
  assert.match(html, /class="panel panel--info"/);
});
