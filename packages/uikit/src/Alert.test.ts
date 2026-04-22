import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Alert } from './Alert.tsx';

test('Alert default renders role=alert with variant modifier', () => {
  const html = renderToStaticMarkup(
    createElement(Alert, { variant: 'danger' }, 'nope')
  );
  assert.match(html, /role="alert"/);
  assert.match(html, /class="alert alert--danger"/);
});

test('Alert structures title + icon + body when provided', () => {
  const html = renderToStaticMarkup(
    createElement(
      Alert,
      { variant: 'info', title: 'Heads up', icon: '!' },
      'body'
    )
  );
  assert.match(html, /class="alert__icon"/);
  assert.match(html, /class="alert__title"/);
  assert.match(html, /class="alert__body"/);
});
