// Toast — Ark UI powered transient notifications wired to fCC class hooks.
//
// Three surfaces:
//   <Toast>        — pure presentational item, for snapshot tests, SSR,
//                    and custom integrations (vanilla adapter, Storybook).
//   createToaster  — factory returning an Ark/Zag toast store. Call
//                    toaster.create({type, title, description}) anywhere.
//   <Toaster>      — mounts once near the root. Owns the Ark render-prop
//                    shell; emits <Toast variant={type}...> for each item.
import React, { forwardRef } from 'react';
import {
  Toast as ArkToast,
  Toaster as ArkToaster,
  createToaster as arkCreateToaster,
  type CreateToasterProps,
  type CreateToasterReturn
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
    // `danger` toasts surface errors — assistive tech should interrupt,
    // so we upgrade to role=alert. Other variants stay polite via status.
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

// Re-export Ark factory with the fCC-idiomatic name so callers do not
// reach past the package boundary. Defaults: top-end placement, 5s auto
// dismiss, stack overlap on.
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
  children?: (options: {
    id: string;
    type?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
  }) => React.ReactNode;
  className?: string;
}

// Render-prop shell that mounts Ark's <Toast.Toaster>. Each item maps
// into a <Toast.Root> with our <Toast> body inside so keyboard + swipe
// + auto-dismiss stay Ark-driven while the pixels stay on our tokens.
export const Toaster = ({
  toaster,
  children,
  className = ''
}: ToasterProps): React.JSX.Element => {
  const classes = ['toaster', className].filter(Boolean).join(' ');
  const renderItem =
    children ??
    ((options: {
      id: string;
      type?: string;
      title?: React.ReactNode;
      description?: React.ReactNode;
    }) => {
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
