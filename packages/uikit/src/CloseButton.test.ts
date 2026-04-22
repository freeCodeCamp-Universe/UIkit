import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { CloseButton } from './CloseButton.tsx';

test('CloseButton renders .close-btn with default aria-label and × glyph', () => {
  const html = renderToStaticMarkup(createElement(CloseButton));
  assert.match(html, /class="close-btn"/);
  assert.match(html, /aria-label="Close"/);
  assert.match(html, /×/);
});
