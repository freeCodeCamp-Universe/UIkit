import React, { forwardRef } from 'react';

export type FieldsetTone = 'default' | 'subtle';

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: React.ReactNode;
  tone?: FieldsetTone;
}

export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ legend, tone = 'default', className = '', children, ...rest }, ref) => {
    const classes = [
      'fieldset',
      tone !== 'default' && `fieldset--${tone}`,
      className
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <fieldset ref={ref} className={classes} {...rest}>
        {legend !== undefined && (
          <legend className='fieldset__legend'>{legend}</legend>
        )}
        {children}
      </fieldset>
    );
  }
);
Fieldset.displayName = 'Fieldset';
