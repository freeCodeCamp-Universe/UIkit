import React, { forwardRef } from 'react';

export interface EmptyStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { icon, title, description, action, className = '', children, ...rest },
    ref
  ) => {
    const classes = ['empty-state', className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        {icon !== undefined && (
          <div className='empty-state__icon' aria-hidden='true'>
            {icon}
          </div>
        )}
        {title !== undefined && <h3 className='empty-state__title'>{title}</h3>}
        {description !== undefined && (
          <p className='empty-state__description'>{description}</p>
        )}
        {children}
        {action !== undefined && (
          <div className='empty-state__action'>{action}</div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';
