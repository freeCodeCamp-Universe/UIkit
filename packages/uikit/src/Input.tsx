import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', invalid, ...rest }, ref) => {
    const classes = ['input', className].filter(Boolean).join(' ');
    return (
      <input
        ref={ref}
        className={classes}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    );
  }
);
Input.displayName = 'Input';
