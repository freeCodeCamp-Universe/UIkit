// Modal — Ark UI powered dialog with the fCC "modal" class hooks.
// Public API (`open`, `onClose`, `title`, `closeOnBackdrop`) is
// preserved verbatim so consumers migrating from the hand-rolled
// implementation do not see a breaking change. Ark handles focus
// trap, a11y, escape-to-close, and the data-state attribute that
// components.css keys its enter/exit animations off of.
import React from 'react';
import { Dialog } from '@ark-ui/react/dialog';

export interface ModalProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  closeOnBackdrop?: boolean;
}

const ModalRoot = ({
  open,
  onClose,
  title,
  closeOnBackdrop = true,
  className = '',
  children,
  ...rest
}: ModalProps) => {
  const panelClasses = ['modal__panel', className].filter(Boolean).join(' ');

  return (
    <Dialog.Root
      open={open}
      onOpenChange={details => {
        if (!details.open) onClose();
      }}
      closeOnInteractOutside={closeOnBackdrop}
      lazyMount={false}
      unmountOnExit
    >
      <Dialog.Backdrop className='modal__backdrop' />
      <Dialog.Positioner className='modal'>
        <Dialog.Content className={panelClasses} {...rest}>
          {title !== undefined && (
            <header className='modal__header'>
              <Dialog.Title className='modal__title'>{title}</Dialog.Title>
              <Dialog.CloseTrigger className='close-btn' aria-label='Close'>
                {'×'}
              </Dialog.CloseTrigger>
            </header>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
ModalRoot.displayName = 'Modal';

// Namespaced subcomponents remain thin wrappers around the underlying
// semantic elements so existing usage of <Modal.Body>, <Modal.Footer>,
// <Modal.Header> keeps working alongside the new Ark-driven shell.
const ModalHeader = ({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement>) => (
  <header
    className={['modal__header', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </header>
);
ModalHeader.displayName = 'Modal.Header';

const ModalBody = ({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={['modal__body', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);
ModalBody.displayName = 'Modal.Body';

const ModalFooter = ({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement>) => (
  <footer
    className={['modal__footer', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </footer>
);
ModalFooter.displayName = 'Modal.Footer';

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter
});
