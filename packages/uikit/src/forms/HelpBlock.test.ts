import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { HelpBlock } from './HelpBlock.tsx';

test('HelpBlock default uses .form-help', () => {
  const html = renderToStaticMarkup(createElement(HelpBlock, null, 'x'));
  assert.match(html, /class="form-help"/);
});

test('HelpBlock variant=error applies modifier', () => {
  const html = renderToStaticMarkup(
    createElement(HelpBlock, { variant: 'error' }, 'x')
  );
  assert.match(html, /class="form-help form-help--error"/);
});
