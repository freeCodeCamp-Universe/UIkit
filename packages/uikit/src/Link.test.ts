import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Link } from './Link.tsx';

test('Link renders .fcc-link anchor', () => {
  const html = renderToStaticMarkup(createElement(Link, { href: '/x' }, 'go'));
  assert.match(html, /class="fcc-link"/);
  assert.match(html, /href="\/x"/);
});

test('Link applies block modifier', () => {
  const html = renderToStaticMarkup(
    createElement(Link, { href: '#', block: true }, 'x')
  );
  assert.match(html, /class="fcc-link fcc-link--block"/);
});
