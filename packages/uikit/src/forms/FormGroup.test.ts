import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { FormGroup } from './FormGroup.tsx';

test('FormGroup renders .form-group wrapper', () => {
  const html = renderToStaticMarkup(createElement(FormGroup, null, 'x'));
  assert.match(html, /class="form-group"/);
  assert.match(html, />x</);
});
