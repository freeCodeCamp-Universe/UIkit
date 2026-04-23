import React, { forwardRef } from 'react';

const STEPS: readonly number[] = [0, 4, 8, 12, 16, 24, 32, 48, 64];

export type SpacerStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SpacerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Step 0–8 maps onto the token scale (0, 4, 8, 12, 16, 24, 32, 48, 64 px).
   * Any other number is treated as a raw pixel value.
   */
  size?: SpacerStep | number;
  axis?: 'horizontal' | 'vertical';
}

export const Spacer = forwardRef<HTMLSpanElement, SpacerProps>(
  ({ size = 4, axis = 'horizontal', className = '', style, ...rest }, ref) => {
    const px =
      Number.isInteger(size) && size >= 0 && size <= 8 ? STEPS[size] : size;
    const dim =
      axis === 'horizontal'
        ? { width: px, height: 1 }
        : { width: 1, height: px };
    const classes = ['spacer', className].filter(Boolean).join(' ');
    return (
      <span
        ref={ref}
        aria-hidden='true'
        className={classes}
        style={{ ...dim, ...style }}
        {...rest}
      />
    );
  }
);
Spacer.displayName = 'Spacer';
