import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Fieldset } from './Fieldset.tsx';

test('Fieldset renders a <fieldset> with base class', () => {
  const html = renderToStaticMarkup(createElement(Fieldset, {}, 'content'));
  assert.match(html, /^<fieldset class="fieldset"/);
  assert.match(html, />content<\/fieldset>$/);
});

test('Fieldset renders <legend> when legend prop provided', () => {
  const html = renderToStaticMarkup(
    createElement(Fieldset, { legend: 'Account' }, 'body')
  );
  assert.match(html, /<legend class="fieldset__legend">Account<\/legend>/);
});

test('Fieldset omits <legend> when legend prop absent', () => {
  const html = renderToStaticMarkup(createElement(Fieldset, {}, 'body'));
  assert.doesNotMatch(html, /<legend/);
});

test('Fieldset tone modifier maps to fieldset--<tone>', () => {
  const html = renderToStaticMarkup(
    createElement(Fieldset, { tone: 'subtle' }, 'x')
  );
  assert.match(html, /class="fieldset fieldset--subtle"/);
});

test('Fieldset forwards disabled to the native element', () => {
  const html = renderToStaticMarkup(
    createElement(Fieldset, { disabled: true }, 'x')
  );
  assert.match(html, /<fieldset[^>]*disabled/);
});

test('Fieldset composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(Fieldset, { className: 'extra' }, 'x')
  );
  assert.match(html, /class="fieldset extra"/);
});

test('Fieldset accepts ReactNode legend', () => {
  const html = renderToStaticMarkup(
    createElement(
      Fieldset,
      { legend: createElement('span', { 'data-testid': 'lg' }, 'Mixed') },
      'body'
    )
  );
  assert.match(
    html,
    /<legend class="fieldset__legend"><span data-testid="lg">Mixed<\/span><\/legend>/
  );
});
