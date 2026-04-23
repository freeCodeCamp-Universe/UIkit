import React, { forwardRef } from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  decorative?: boolean;
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      variant = 'solid',
      decorative = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const classes = [
      'divider',
      orientation !== 'horizontal' && `divider--${orientation}`,
      variant !== 'solid' && `divider--${variant}`,
      className
    ]
      .filter(Boolean)
      .join(' ');
    const semantic = decorative
      ? { 'aria-hidden': 'true' as const }
      : {
          role: 'separator' as const,
          ...(orientation === 'vertical' && {
            'aria-orientation': 'vertical' as const
          })
        };
    return <hr ref={ref} className={classes} {...semantic} {...rest} />;
  }
);
Divider.displayName = 'Divider';
