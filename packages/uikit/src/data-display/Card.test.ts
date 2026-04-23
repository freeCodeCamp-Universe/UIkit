import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Card } from './Card.tsx';

test('Card renders article.card', () => {
  const html = renderToStaticMarkup(createElement(Card, null, 'body'));
  assert.match(html, /<article[^>]*class="card"/);
});

test('Card.Header/Title/Body/Footer render BEM subclasses', () => {
  const html = renderToStaticMarkup(
    createElement(Card, null, [
      createElement(Card.Header, { key: 'h' }, 'h'),
      createElement(Card.Title, { key: 't' }, 't'),
      createElement(Card.Body, { key: 'b' }, 'b'),
      createElement(Card.Footer, { key: 'f' }, 'f')
    ])
  );
  assert.match(html, /class="card__header"/);
  assert.match(html, /class="card__title"/);
  assert.match(html, /class="card__body"/);
  assert.match(html, /class="card__footer"/);
});

test('Card bordered=true applies modifier', () => {
  const html = renderToStaticMarkup(createElement(Card, { bordered: true }));
  assert.match(html, /class="card card--bordered"/);
});
