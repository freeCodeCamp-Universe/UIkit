import React, { forwardRef } from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  condensed?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ striped, condensed, className = '', children, ...rest }, ref) => {
    const classes = [
      'table',
      striped && 'table--striped',
      condensed && 'table--condensed',
      className
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <table ref={ref} className={classes} {...rest}>
        {children}
      </table>
    );
  }
);
Table.displayName = 'Table';
