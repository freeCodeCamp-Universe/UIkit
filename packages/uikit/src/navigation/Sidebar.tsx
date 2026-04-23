import React, { forwardRef } from 'react';

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ className = '', children, ...rest }, ref) => {
    const classes = ['sidebar', className].filter(Boolean).join(' ');
    return (
      <aside ref={ref} role='navigation' className={classes} {...rest}>
        {children}
      </aside>
    );
  }
);
Sidebar.displayName = 'Sidebar';

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLElement> {
  label?: React.ReactNode;
}

export const SidebarSection = forwardRef<HTMLElement, SidebarSectionProps>(
  ({ label, className = '', children, ...rest }, ref) => {
    const classes = ['sidebar__section', className].filter(Boolean).join(' ');
    return (
      <section ref={ref} className={classes} {...rest}>
        {label !== undefined && <div className='sidebar__eyebrow'>{label}</div>}
        {children}
      </section>
    );
  }
);
SidebarSection.displayName = 'SidebarSection';

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export interface SidebarItemCommonProps {
  active?: boolean;
  icon?: React.ReactNode;
}

export type SidebarItemProps = SidebarItemCommonProps &
  Omit<AnchorProps & ButtonProps, 'type'>;

export const SidebarItem = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  SidebarItemProps
>((props, ref) => {
  const { active, icon, className = '', children, ...rest } = props;
  const classes = ['sidebar__item', className].filter(Boolean).join(' ');
  const extras = {
    'aria-current': active ? 'page' : undefined,
    'data-active': active ? 'true' : undefined
  } as const;
  const inner = (
    <>
      {icon !== undefined && <span className='sidebar__icon'>{icon}</span>}
      <span className='sidebar__label'>{children}</span>
    </>
  );
  const href = (rest as AnchorProps).href;
  if (href !== undefined) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...extras}
        {...(rest as AnchorProps)}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type='button'
      className={classes}
      {...extras}
      {...(rest as ButtonProps)}
    >
      {inner}
    </button>
  );
});
SidebarItem.displayName = 'SidebarItem';
