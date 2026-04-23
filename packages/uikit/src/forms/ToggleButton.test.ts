import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ToggleButton } from './ToggleButton.tsx';

test('ToggleButton renders .toggle-btn with aria-pressed', () => {
  const html = renderToStaticMarkup(
    createElement(ToggleButton, { defaultPressed: false }, 'Off')
  );
  assert.match(html, /class="toggle-btn"/);
  assert.match(html, /aria-pressed="false"/);
});

test('ToggleButton reflects controlled pressed prop', () => {
  const html = renderToStaticMarkup(
    createElement(ToggleButton, { pressed: true }, 'On')
  );
  assert.match(html, /aria-pressed="true"/);
});

test('ToggleButton applies size modifier', () => {
  const html = renderToStaticMarkup(
    createElement(ToggleButton, { size: 'sm' }, 'S')
  );
  assert.match(html, /class="toggle-btn toggle-btn--sm"/);
});
