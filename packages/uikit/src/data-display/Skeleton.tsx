import React, { forwardRef } from 'react';

export type SkeletonVariant = 'rect' | 'circle' | 'text';

export interface SkeletonProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  /** For variant="text": render N stacked line bars. */
  lines?: number;
  /** Screen-reader label announced via visually-hidden span. */
  label?: React.ReactNode;
}

const toSize = (v: number | string | undefined): string | undefined =>
  typeof v === 'number' ? `${v}px` : v;

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'rect',
      width,
      height,
      lines,
      label,
      className = '',
      style,
      ...rest
    },
    ref
  ) => {
    const classes = [
      'skeleton',
      variant !== 'rect' && `skeleton--${variant}`,
      className
    ]
      .filter(Boolean)
      .join(' ');
    const mergedStyle: React.CSSProperties = {
      ...(style ?? {}),
      ...(width !== undefined && { width: toSize(width) }),
      ...(height !== undefined && { height: toSize(height) })
    };
    const hasInlineStyle = Object.keys(mergedStyle).length > 0;
    const isMultilineText =
      variant === 'text' && typeof lines === 'number' && lines > 0;
    return (
      <div
        ref={ref}
        role='status'
        aria-busy='true'
        aria-live='polite'
        className={classes}
        style={hasInlineStyle ? mergedStyle : undefined}
        {...rest}
      >
        {isMultilineText &&
          Array.from({ length: lines as number }, (_, i) => (
            <span key={i} className='skeleton__line' aria-hidden='true' />
          ))}
        {label !== undefined && <span className='sr-only'>{label}</span>}
      </div>
    );
  }
);
Skeleton.displayName = 'Skeleton';
