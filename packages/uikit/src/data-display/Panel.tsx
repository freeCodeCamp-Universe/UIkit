import React, { forwardRef } from 'react';

export type PanelVariant = 'default' | 'primary' | 'danger' | 'info';

export interface PanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  variant?: PanelVariant;
  title?: React.ReactNode;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ variant = 'default', title, className = '', children, ...rest }, ref) => {
    const classes = [
      'panel',
      variant !== 'default' && `panel--${variant}`,
      className
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        {title !== undefined && <p className='panel__heading'>{title}</p>}
        <div className='panel__body'>{children}</div>
      </div>
    );
  }
);
Panel.displayName = 'Panel';
