import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Navbar } from './Navbar.tsx';

test('Navbar renders a <header> with base class and role=banner', () => {
  const html = renderToStaticMarkup(createElement(Navbar));
  assert.match(html, /<header[^>]*class="navbar"/);
  assert.match(html, /role="banner"/);
});

test('Navbar renders start slot inside .navbar__start', () => {
  const html = renderToStaticMarkup(
    createElement(Navbar, {
      start: createElement('span', { 'data-id': 'brand' }, 'fCC')
    })
  );
  assert.match(
    html,
    /<div class="navbar__start"><span data-id="brand">fCC<\/span><\/div>/
  );
});

test('Navbar renders center slot inside .navbar__center', () => {
  const html = renderToStaticMarkup(
    createElement(Navbar, {
      center: createElement('nav', {}, 'links')
    })
  );
  assert.match(html, /<div class="navbar__center"><nav>links<\/nav><\/div>/);
});

test('Navbar renders end slot inside .navbar__end', () => {
  const html = renderToStaticMarkup(
    createElement(Navbar, { end: createElement('button', {}, 'Sign in') })
  );
  assert.match(
    html,
    /<div class="navbar__end"><button>Sign in<\/button><\/div>/
  );
});

test('Navbar omits a slot div when the corresponding prop is absent', () => {
  const html = renderToStaticMarkup(
    createElement(Navbar, { start: createElement('span', {}, 'brand') })
  );
  assert.match(html, /navbar__start/);
  assert.doesNotMatch(html, /navbar__center/);
  assert.doesNotMatch(html, /navbar__end/);
});

test('Navbar composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(Navbar, { className: 'sticky' })
  );
  assert.match(html, /class="navbar sticky"/);
});

test('Navbar respects a custom ariaLabel', () => {
  const html = renderToStaticMarkup(
    createElement(Navbar, { 'aria-label': 'Primary' })
  );
  assert.match(html, /aria-label="Primary"/);
});
