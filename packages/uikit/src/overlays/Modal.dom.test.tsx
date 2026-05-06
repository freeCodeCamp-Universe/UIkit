import { test, expect, afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Modal } from './Modal';

afterEach(cleanup);

test('open=true mounts a Dialog with role=dialog + aria-modal', () => {
  const { container } = render(
    <Modal open onClose={() => {}} title='Hello'>
      <Modal.Body>body</Modal.Body>
    </Modal>
  );
  const dialog = container.querySelector('[role="dialog"][aria-modal="true"]');
  expect(dialog).not.toBeNull();
});

test('open=false renders no dialog node (unmountOnExit)', () => {
  const { container } = render(
    <Modal open={false} onClose={() => {}} title='Hidden'>
      <p>body</p>
    </Modal>
  );
  expect(
    container.querySelector('[role="dialog"][data-state="open"]')
  ).toBeNull();
});

test('Modal.Header renders <header class="modal__header">', () => {
  const { container } = render(
    <Modal.Header>
      <span>brand</span>
    </Modal.Header>
  );
  const h = container.querySelector('header.modal__header');
  expect(h).not.toBeNull();
  expect(h?.textContent).toBe('brand');
});

test('Modal.Body renders <div class="modal__body">', () => {
  const { container } = render(<Modal.Body>copy</Modal.Body>);
  const b = container.querySelector('div.modal__body');
  expect(b?.textContent).toBe('copy');
});

test('Modal.Footer renders <footer class="modal__footer">', () => {
  const { container } = render(<Modal.Footer>actions</Modal.Footer>);
  const f = container.querySelector('footer.modal__footer');
  expect(f?.textContent).toBe('actions');
});

test('Modal.Body composes consumer className alongside the base class', () => {
  const { container } = render(<Modal.Body className='extra'>copy</Modal.Body>);
  expect(container.querySelector('.modal__body.extra')).not.toBeNull();
});

test('open modal renders the title in the header zone', () => {
  const { container } = render(
    <Modal open onClose={() => {}} title='Reset progress?'>
      <Modal.Body>body</Modal.Body>
    </Modal>
  );
  expect(container.textContent).toContain('Reset progress?');
});
