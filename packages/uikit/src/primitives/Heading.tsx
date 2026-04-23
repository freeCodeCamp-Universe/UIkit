import React, { forwardRef } from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'display' | 'xl' | 'lg' | 'md' | 'sm';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  size?: HeadingSize;
}

function clampLevel(level: number): HeadingLevel {
  if (level < 1) return 1;
  if (level > 6) return 6;
  return level as HeadingLevel;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, size = 'md', className = '', children, ...rest }, ref) => {
    const safeLevel = clampLevel(level);
    const tag = `h${safeLevel}` as const;
    const classes = ['heading', `heading--${size}`, className]
      .filter(Boolean)
      .join(' ');
    return React.createElement(
      tag,
      { ref, className: classes, ...rest },
      children
    );
  }
);
Heading.displayName = 'Heading';
