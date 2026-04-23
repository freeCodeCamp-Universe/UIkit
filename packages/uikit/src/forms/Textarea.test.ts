import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Textarea } from './Textarea.tsx';

test('Textarea renders a native <textarea> with base class', () => {
  const html = renderToStaticMarkup(createElement(Textarea));
  assert.match(html, /<textarea[^>]*class="textarea"/);
  assert.match(html, /<\/textarea>/);
});

test('Textarea monospace variant adds textarea--mono modifier', () => {
  const html = renderToStaticMarkup(
    createElement(Textarea, { variant: 'mono' })
  );
  assert.match(html, /class="textarea textarea--mono"/);
});

test('Textarea default variant omits modifier', () => {
  const html = renderToStaticMarkup(createElement(Textarea));
  assert.match(html, /class="textarea"/);
  assert.doesNotMatch(html, /textarea--/);
});

test('Textarea invalid sets aria-invalid', () => {
  const html = renderToStaticMarkup(createElement(Textarea, { invalid: true }));
  assert.match(html, /aria-invalid="true"/);
});

test('Textarea composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(Textarea, { className: 'extra' })
  );
  assert.match(html, /class="textarea extra"/);
});

test('Textarea forwards rows + placeholder + defaultValue', () => {
  const html = renderToStaticMarkup(
    createElement(Textarea, {
      rows: 6,
      placeholder: 'Notes',
      defaultValue: 'seed'
    })
  );
  assert.match(html, /<textarea[^>]*rows="6"/);
  assert.match(html, /placeholder="Notes"/);
  assert.match(html, />seed<\/textarea>/);
});

test('Textarea autoResize adds the data attribute for the runtime hook', () => {
  const html = renderToStaticMarkup(
    createElement(Textarea, { autoResize: true })
  );
  assert.match(html, /data-auto-resize="true"/);
});

test('Textarea without autoResize omits the data attribute', () => {
  const html = renderToStaticMarkup(createElement(Textarea));
  assert.doesNotMatch(html, /data-auto-resize/);
});
