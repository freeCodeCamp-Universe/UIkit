import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Toast, Toaster, createToaster } from './Toast.tsx';

test('Toast default renders role=status with variant modifier', () => {
  const html = renderToStaticMarkup(
    createElement(Toast, { variant: 'success', title: 'Saved' })
  );
  assert.match(html, /role="status"/);
  assert.match(html, /class="toast toast--success"/);
  assert.match(html, /class="toast__title">Saved</);
});

test('Toast danger variant marks role=alert for assistive tech', () => {
  const html = renderToStaticMarkup(
    createElement(Toast, { variant: 'danger', title: 'Failed' })
  );
  assert.match(html, /role="alert"/);
  assert.match(html, /class="toast toast--danger"/);
});

test('Toast renders description and close trigger when provided', () => {
  const html = renderToStaticMarkup(
    createElement(Toast, {
      variant: 'info',
      title: 't',
      description: 'd',
      dismissible: true
    })
  );
  assert.match(html, /class="toast__description">d</);
  assert.match(html, /class="toast__close"[^>]*aria-label="Dismiss"/);
});

test('Toast non-dismissible omits close trigger', () => {
  const html = renderToStaticMarkup(
    createElement(Toast, { variant: 'info', title: 't', dismissible: false })
  );
  assert.doesNotMatch(html, /toast__close/);
});

test('Toaster renders a positioned region with aria-label', () => {
  const toaster = createToaster({ placement: 'top-end', overlap: true });
  const html = renderToStaticMarkup(createElement(Toaster, { toaster }));
  assert.match(html, /class="[^"]*toaster[^"]*"/);
});

test('createToaster returns a store with create/dismiss methods', () => {
  const toaster = createToaster({ placement: 'top-end' });
  assert.equal(typeof toaster.create, 'function');
  assert.equal(typeof toaster.dismiss, 'function');
  assert.equal(typeof toaster.pause, 'function');
  assert.equal(typeof toaster.resume, 'function');
});
