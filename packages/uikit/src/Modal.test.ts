import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Modal } from './Modal.tsx';

test('Modal renders nothing when open=false', () => {
  const html = renderToStaticMarkup(
    createElement(Modal, { open: false, onClose: () => {}, title: 'Hi' })
  );
  assert.equal(html, '');
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
  assert.match(html, /class="modal__panel"/);
  assert.match(html, /class="modal__title"/);
  assert.match(html, /class="modal__body"/);
  assert.match(html, /class="modal__footer"/);
});
