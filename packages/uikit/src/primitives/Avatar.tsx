import React, { forwardRef } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarStatus = 'online' | 'away' | 'offline';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase();
  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ name, src, size = 'md', status, className = '', ...rest }, ref) => {
    const classes = ['avatar', `avatar--${size}`, className]
      .filter(Boolean)
      .join(' ');
    return (
      <span
        ref={ref}
        className={classes}
        aria-label={src ? undefined : name}
        {...rest}
      >
        {src ? (
          <img src={src} alt={name} className='avatar__img' />
        ) : (
          <span aria-hidden='true' className='avatar__initials'>
            {initialsFor(name)}
          </span>
        )}
        {status && (
          <span
            className={`avatar__status avatar__status--${status}`}
            aria-label={`status: ${status}`}
          />
        )}
      </span>
    );
  }
);
Avatar.displayName = 'Avatar';
