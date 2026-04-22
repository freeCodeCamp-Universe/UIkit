import React, { forwardRef } from 'react';

export type HelpBlockVariant = 'default' | 'error' | 'success';

export interface HelpBlockProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: HelpBlockVariant;
}

export const HelpBlock = forwardRef<HTMLParagraphElement, HelpBlockProps>(
  ({ variant = 'default', className = '', children, ...rest }, ref) => {
    const classes = [
      'form-help',
      variant !== 'default' && `form-help--${variant}`,
      className
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <p ref={ref} className={classes} {...rest}>
        {children}
      </p>
    );
  }
);
HelpBlock.displayName = 'HelpBlock';
