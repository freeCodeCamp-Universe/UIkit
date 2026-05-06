import React, { forwardRef } from 'react';
import {
  Toast as ArkToast,
  Toaster as ArkToaster,
  createToaster as arkCreateToaster,
  type CreateToasterProps,
  type CreateToasterReturn,
  type ToastOptions
} from '@ark-ui/react/toast';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  variant?: ToastVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Emit a close (`×`) button wired to `onDismiss`. Default: true. */
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      variant = 'info',
      title,
      description,
      dismissible = true,
      onDismiss,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const classes = ['toast', `toast--${variant}`, className]
      .filter(Boolean)
      .join(' ');
    const role = variant === 'danger' ? 'alert' : 'status';
    return (
      <div ref={ref} role={role} className={classes} {...rest}>
        <div className='toast__body'>
          {title !== undefined && <p className='toast__title'>{title}</p>}
          {description !== undefined && (
            <p className='toast__description'>{description}</p>
          )}
          {children}
        </div>
        {dismissible && (
          <button
            type='button'
            className='toast__close'
            aria-label='Dismiss'
            onClick={onDismiss}
          >
            {'×'}
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export type { CreateToasterProps, CreateToasterReturn };

export const createToaster = (props: CreateToasterProps): CreateToasterReturn =>
  arkCreateToaster({
    placement: 'top-end',
    overlap: true,
    gap: 16,
    duration: 5000,
    ...props
  });

export interface ToasterProps {
  toaster: CreateToasterReturn;
  /** Override the item renderer. Defaults to fCC <Toast> shell. */
  children?: (options: ToastOptions) => React.ReactNode;
  className?: string;
}

export const Toaster = ({
  toaster,
  children,
  className = ''
}: ToasterProps): React.JSX.Element => {
  const classes = ['toaster', className].filter(Boolean).join(' ');
  const renderItem =
    children ??
    ((options: ToastOptions) => {
      const variant: ToastVariant = isVariant(options.type)
        ? options.type
        : 'info';
      return (
        <ArkToast.Root>
          <Toast
            variant={variant}
            title={
              options.title !== undefined ? (
                <ArkToast.Title asChild>
                  <span>{options.title}</span>
                </ArkToast.Title>
              ) : undefined
            }
            description={
              options.description !== undefined ? (
                <ArkToast.Description asChild>
                  <span>{options.description}</span>
                </ArkToast.Description>
              ) : undefined
            }
            dismissible={false}
          />
          <ArkToast.CloseTrigger className='toast__close' aria-label='Dismiss'>
            {'×'}
          </ArkToast.CloseTrigger>
        </ArkToast.Root>
      );
    });
  return (
    <ArkToaster toaster={toaster} className={classes}>
      {renderItem}
    </ArkToaster>
  );
};
Toaster.displayName = 'Toaster';

const VARIANTS: ReadonlySet<ToastVariant> = new Set<ToastVariant>([
  'info',
  'success',
  'warning',
  'danger'
]);
const isVariant = (t: unknown): t is ToastVariant =>
  typeof t === 'string' && VARIANTS.has(t as ToastVariant);
