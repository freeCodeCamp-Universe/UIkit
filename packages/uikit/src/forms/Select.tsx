import React, { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', invalid, children, ...rest }, ref) => {
    const classes = ['select', className].filter(Boolean).join(' ');
    return (
      <select
        ref={ref}
        className={classes}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';
