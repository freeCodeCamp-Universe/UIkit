import React, { useEffect, useId } from "react";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
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
  className = "",
  children,
  ...rest
}: ModalProps) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const classes = ["modal", className].filter(Boolean).join(" ");
  const onBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={classes}
      data-open="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title !== undefined ? titleId : undefined}
      onClick={onBackdropClick}
      {...rest}
    >
      <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
        {title !== undefined && (
          <header className="modal__header">
            <p className="modal__title" id={titleId}>
              {title}
            </p>
            <button
              type="button"
              className="close-btn"
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>
          </header>
        )}
        {children}
      </div>
    </div>
  );
};
ModalRoot.displayName = "Modal";

const ModalHeader = ({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement>) => (
  <header
    className={["modal__header", className].filter(Boolean).join(" ")}
    {...rest}
  >
    {children}
  </header>
);
ModalHeader.displayName = "Modal.Header";

const ModalBody = ({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={["modal__body", className].filter(Boolean).join(" ")}
    {...rest}
  >
    {children}
  </div>
);
ModalBody.displayName = "Modal.Body";

const ModalFooter = ({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement>) => (
  <footer
    className={["modal__footer", className].filter(Boolean).join(" ")}
    {...rest}
  >
    {children}
  </footer>
);
ModalFooter.displayName = "Modal.Footer";

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});
