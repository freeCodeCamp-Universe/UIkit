import React, { forwardRef } from 'react';

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: React.ReactNode;
  labelClassName?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, labelClassName = '', className = '', id, ...rest }, ref) => {
    const classes = ['switch', labelClassName].filter(Boolean).join(' ');
    return (
      <label className={classes} htmlFor={id}>
        <input
          ref={ref}
          type='checkbox'
          id={id}
          className={className}
          {...rest}
        />
        <span className='switch__track'>
          <span className='switch__thumb' />
        </span>
        {label !== undefined && <span className='switch__label'>{label}</span>}
      </label>
    );
  }
);
Switch.displayName = 'Switch';
