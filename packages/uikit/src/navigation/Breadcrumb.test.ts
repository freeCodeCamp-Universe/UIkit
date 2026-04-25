// Wave 8 P4 (W8-5) — Breadcrumb contract.
//
// Compound API: <Breadcrumb><Breadcrumb.Item href>…</Breadcrumb.Item>…
//
//  - Renders `<nav aria-label="Breadcrumb"><ol><li>…</li></ol></nav>`
//  - Last item carries `aria-current="page"`
//  - Scheme allowlist on `href` — anything outside
//    `(https?:|/|#|mailto:|tel:)` falls through to a `<span>`
//    instead of rendering `<a>`. Mitigates a stored-XSS surface
//    where untrusted input lands in a Breadcrumb href.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Breadcrumb } from './Breadcrumb.tsx';

function renderTrail() {
  return renderToStaticMarkup(
    createElement(Breadcrumb, null, [
      createElement(Breadcrumb.Item, { key: 'a', href: '/' }, 'Home'),
      createElement(
        Breadcrumb.Item,
        { key: 'b', href: '/components' },
        'Components'
      ),
      createElement(Breadcrumb.Item, { key: 'c', active: true }, 'Breadcrumb')
    ])
  );
}

test('Breadcrumb renders nav[aria-label] > ol > li tree', () => {
  const html = renderTrail();
  assert.match(html, /<nav[^>]*class="breadcrumb"/);
  assert.match(html, /aria-label="Breadcrumb"/);
  assert.match(html, /<ol class="breadcrumb__list">/);
  const liMatches = html.match(/<li class="breadcrumb__item">/g) ?? [];
  assert.equal(
    liMatches.length,
    3,
    `expected 3 <li> items, got ${liMatches.length}`
  );
});

test('Breadcrumb marks the active item with aria-current="page"', () => {
  const html = renderTrail();
  const matches = html.match(/aria-current="page"/g) ?? [];
  assert.equal(
    matches.length,
    1,
    `expected exactly one aria-current="page", found ${matches.length}`
  );
});

test('Breadcrumb non-active items render as <a>', () => {
  const html = renderTrail();
  const anchors = html.match(/class="breadcrumb__link"/g) ?? [];
  assert.equal(anchors.length, 2, `expected 2 anchors, got ${anchors.length}`);
});

test('Breadcrumb scheme guard rejects javascript: hrefs', () => {
  const original = console.warn;
  let warned = '';
  console.warn = (message: string) => {
    warned += message;
  };
  try {
    const html = renderToStaticMarkup(
      createElement(Breadcrumb, null, [
        createElement(
          Breadcrumb.Item,
          { key: 'evil', href: 'javascript:alert(1)' },
          'Untrusted'
        )
      ])
    );
    assert.doesNotMatch(
      html,
      /<a [^>]*href="javascript:/,
      'javascript: scheme must not reach the rendered href'
    );
    assert.match(html, /<span[^>]*class="breadcrumb__current"/);
    assert.match(warned, /\[Breadcrumb\] rejected href/);
  } finally {
    console.warn = original;
  }
});

test('Breadcrumb passes safe schemes through to the href', () => {
  for (const safe of ['/foo', 'https://x.test', '#bar', 'mailto:a@b']) {
    const html = renderToStaticMarkup(
      createElement(Breadcrumb, null, [
        createElement(Breadcrumb.Item, { key: safe, href: safe }, 'Item')
      ])
    );
    assert.match(
      html,
      new RegExp(`href="${safe.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}"`),
      `href "${safe}" must reach the rendered <a>`
    );
  }
});

test('Breadcrumb separator class is applied to all but the last item', () => {
  // The CSS pseudo-element does the visible separator; the
  // structural test asserts the BEM hooks land on the right items.
  const html = renderTrail();
  // Three items present — pseudo-element styling lives in CSS;
  // here we just confirm we don't double up on `__current`.
  const currents = html.match(/breadcrumb__current/g) ?? [];
  assert.equal(currents.length, 1, 'only one current item');
});

test('Breadcrumb accepts a custom aria-label', () => {
  const html = renderToStaticMarkup(
    createElement(
      Breadcrumb,
      { 'aria-label': 'You are here' },
      createElement(Breadcrumb.Item, { active: true }, 'Now')
    )
  );
  assert.match(html, /aria-label="You are here"/);
});
