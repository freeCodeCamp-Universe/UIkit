import React, { forwardRef } from 'react';

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  brand?: React.ReactNode;
  footer?: React.ReactNode;
  pattern?: boolean;
}

export const AuthLayout = forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ brand, footer, pattern, className = '', children, ...rest }, ref) => {
    const classes = [
      'auth-layout',
      pattern && 'auth-layout--pattern',
      className
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        {brand !== undefined && (
          <div className='auth-layout__brand'>{brand}</div>
        )}
        <main className='auth-layout__card'>{children}</main>
        {footer !== undefined && (
          <div className='auth-layout__footer'>{footer}</div>
        )}
      </div>
    );
  }
);
AuthLayout.displayName = 'AuthLayout';
