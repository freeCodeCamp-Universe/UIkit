import React, { forwardRef } from 'react';

export interface StackedLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const StackedLayout = forwardRef<HTMLDivElement, StackedLayoutProps>(
  ({ header, footer, className = '', children, ...rest }, ref) => {
    const classes = ['stacked-layout', className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        {header !== undefined && (
          <div className='stacked-layout__header'>{header}</div>
        )}
        <main className='stacked-layout__main'>{children}</main>
        {footer !== undefined && (
          <div className='stacked-layout__footer'>{footer}</div>
        )}
      </div>
    );
  }
);
StackedLayout.displayName = 'StackedLayout';
