import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Image } from './Image.tsx';

test('Image without caption renders bare img.img--responsive', () => {
  const html = renderToStaticMarkup(
    createElement(Image, { src: '/x.png', alt: 'x' })
  );
  assert.match(html, /<img[^>]*class="img--responsive"/);
  assert.ok(!html.includes('<figure'));
});

test('Image with caption wraps in <figure>', () => {
  const html = renderToStaticMarkup(
    createElement(Image, { src: '/x.png', alt: 'x', caption: 'Cap' })
  );
  assert.match(html, /<figure/);
  assert.match(html, /<figcaption>Cap<\/figcaption>/);
});
