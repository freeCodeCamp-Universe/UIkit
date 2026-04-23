import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Modal } from './Modal.tsx';

test('Modal renders closed-state shell when open=false', () => {
  const html = renderToStaticMarkup(
    createElement(Modal, {
      open: false,
      onClose: () => {},
      title: 'Hi'
    })
  );
  // Ark keeps the dialog element in the tree with hidden + data-state
  // so CSS can drive exit transitions. Verify those a11y-safe signals
  // are present rather than asserting the node is gone.
  assert.match(html, /data-state="closed"/);
  assert.match(html, /hidden=""/);
});

test('Modal renders dialog shell when open=true', () => {
  const html = renderToStaticMarkup(
    createElement(
      Modal,
      { open: true, onClose: () => {}, title: 'Reset' },
      createElement(Modal.Body, null, 'body'),
      createElement(Modal.Footer, null, 'footer')
    )
  );
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /class="modal"/);
  assert.match(html, /modal__panel/);
  assert.match(html, /modal__title/);
  assert.match(html, /modal__body/);
  assert.match(html, /modal__footer/);
});

test('Modal exposes data-state=open for motion hooks', () => {
  const html = renderToStaticMarkup(
    createElement(Modal, {
      open: true,
      onClose: () => {},
      title: 'Motion'
    })
  );
  assert.match(html, /data-state="open"/);
});
