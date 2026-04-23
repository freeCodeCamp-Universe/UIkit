import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { AuthLayout } from './AuthLayout.tsx';

test('AuthLayout renders root wrapper with base class', () => {
  const html = renderToStaticMarkup(createElement(AuthLayout, {}, 'form'));
  assert.match(html, /^<div class="auth-layout"/);
});

test('AuthLayout wraps children in a centered <main> card', () => {
  const html = renderToStaticMarkup(
    createElement(AuthLayout, {}, 'login body')
  );
  assert.match(html, /<main class="auth-layout__card">login body<\/main>/);
});

test('AuthLayout renders brand slot in .auth-layout__brand', () => {
  const html = renderToStaticMarkup(
    createElement(
      AuthLayout,
      { brand: createElement('span', { 'data-id': 'logo' }, 'fCC') },
      'x'
    )
  );
  assert.match(
    html,
    /<div class="auth-layout__brand"><span data-id="logo">fCC<\/span><\/div>/
  );
});

test('AuthLayout renders footer slot in .auth-layout__footer', () => {
  const html = renderToStaticMarkup(
    createElement(
      AuthLayout,
      { footer: createElement('small', {}, 'legal') },
      'x'
    )
  );
  assert.match(
    html,
    /<div class="auth-layout__footer"><small>legal<\/small><\/div>/
  );
});

test('AuthLayout patterned variant adds auth-layout--pattern modifier', () => {
  const html = renderToStaticMarkup(
    createElement(AuthLayout, { pattern: true }, 'x')
  );
  assert.match(html, /class="auth-layout auth-layout--pattern"/);
});

test('AuthLayout default omits pattern modifier', () => {
  const html = renderToStaticMarkup(createElement(AuthLayout, {}, 'x'));
  assert.match(html, /class="auth-layout"/);
  assert.doesNotMatch(html, /auth-layout--pattern/);
});

test('AuthLayout omits brand / footer containers when slots absent', () => {
  const html = renderToStaticMarkup(createElement(AuthLayout, {}, 'x'));
  assert.doesNotMatch(html, /auth-layout__brand/);
  assert.doesNotMatch(html, /auth-layout__footer/);
});

test('AuthLayout composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(AuthLayout, { className: 'app' }, 'x')
  );
  assert.match(html, /class="auth-layout app"/);
});
