import React, { forwardRef } from 'react';

export interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const SidebarLayout = forwardRef<HTMLDivElement, SidebarLayoutProps>(
  ({ header, sidebar, className = '', children, ...rest }, ref) => {
    const classes = ['sidebar-layout', className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        {header !== undefined && (
          <div className='sidebar-layout__header'>{header}</div>
        )}
        <div className='sidebar-layout__body'>
          {sidebar !== undefined && (
            <div className='sidebar-layout__aside'>{sidebar}</div>
          )}
          <main className='sidebar-layout__main'>{children}</main>
        </div>
      </div>
    );
  }
);
SidebarLayout.displayName = 'SidebarLayout';
