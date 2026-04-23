import React, { forwardRef } from 'react';

export type TextAs = 'p' | 'span' | 'div' | 'small';
export type TextSize = 'xs' | 'sm' | 'base' | 'lg';
export type TextWeight = 'regular' | 'bold';
export type TextTone = 'default' | 'secondary' | 'muted';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: TextAs;
  size?: TextSize;
  weight?: TextWeight;
  tone?: TextTone;
}

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      as = 'p',
      size = 'base',
      weight = 'regular',
      tone = 'default',
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [
      'text',
      size !== 'base' && `text--${size}`,
      weight !== 'regular' && `text--${weight}`,
      tone !== 'default' && `text--${tone}`,
      className
    ]
      .filter(Boolean)
      .join(' ');
    return React.createElement(
      as,
      { ref, className: classes, ...rest },
      children
    );
  }
);
Text.displayName = 'Text';
