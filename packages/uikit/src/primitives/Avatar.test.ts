import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Avatar } from './Avatar.tsx';

test('Avatar renders image when src provided', () => {
  const html = renderToStaticMarkup(
    createElement(Avatar, { src: '/u.png', name: 'Ada Lovelace' })
  );
  assert.match(html, /<img[^>]*src="\/u\.png"/);
  assert.match(html, /alt="Ada Lovelace"/);
  assert.match(html, /class="avatar avatar--md"/);
});

test('Avatar falls back to initials when no src', () => {
  const html = renderToStaticMarkup(
    createElement(Avatar, { name: 'Ada Lovelace' })
  );
  assert.doesNotMatch(html, /<img/);
  assert.match(html, />AL</);
  assert.match(html, /aria-label="Ada Lovelace"/);
});

test('Avatar size modifier maps to avatar--<size>', () => {
  const html = renderToStaticMarkup(
    createElement(Avatar, { name: 'X', size: 'lg' })
  );
  assert.match(html, /class="avatar avatar--lg"/);
});

test('Avatar single-word name yields one-letter initial', () => {
  const html = renderToStaticMarkup(createElement(Avatar, { name: 'Hopper' }));
  assert.match(html, />H</);
});

test('Avatar renders status dot slot when provided', () => {
  const html = renderToStaticMarkup(
    createElement(Avatar, {
      name: 'Ada',
      status: 'online'
    })
  );
  assert.match(html, /avatar__status avatar__status--online/);
});
