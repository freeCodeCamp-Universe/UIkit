import React, { forwardRef } from 'react';

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  start?: React.ReactNode;
  center?: React.ReactNode;
  end?: React.ReactNode;
}

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ start, center, end, className = '', children, ...rest }, ref) => {
    const classes = ['navbar', className].filter(Boolean).join(' ');
    return (
      <header ref={ref} role='banner' className={classes} {...rest}>
        {start !== undefined && <div className='navbar__start'>{start}</div>}
        {center !== undefined && <div className='navbar__center'>{center}</div>}
        {end !== undefined && <div className='navbar__end'>{end}</div>}
        {children}
      </header>
    );
  }
);
Navbar.displayName = 'Navbar';
