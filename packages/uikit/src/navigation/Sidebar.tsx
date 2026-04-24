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
  /**
   * When true, renders the section as a `<details><summary>` pair so users can
   * fold/unfold. Default: false (emits the original `<section>`).
   */
  collapsible?: boolean;
  /**
   * Initial open state when `collapsible` is true. Ignored otherwise.
   * Default: true.
   */
  defaultOpen?: boolean;
}

export const SidebarSection = forwardRef<HTMLElement, SidebarSectionProps>(
  (
    {
      label,
      className = '',
      children,
      collapsible = false,
      defaultOpen = true,
      ...rest
    },
    ref
  ) => {
    if (collapsible) {
      const classes = [
        'sidebar__section',
        'sidebar__section--collapsible',
        className
      ]
        .filter(Boolean)
        .join(' ');
      return (
        <details
          ref={ref as unknown as React.Ref<HTMLDetailsElement>}
          className={classes}
          open={defaultOpen}
          {...(rest as React.HTMLAttributes<HTMLDetailsElement>)}
        >
          <summary className='sidebar__section__summary'>
            {label !== undefined && (
              <span className='sidebar__eyebrow'>{label}</span>
            )}
            <span className='sidebar__section__caret' aria-hidden='true'>
              ▸
            </span>
          </summary>
          {children}
        </details>
      );
    }
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

/**
 * Normalise a path by stripping trailing slashes. Root (`/`) is preserved.
 */
function normalisePath(value: string): string {
  if (value === '/') return '/';
  return value.replace(/\/+$/, '') || '/';
}

export interface IsActiveHrefOptions {
  /** When true (default), require exact match. When false, descendant hrefs match. */
  exact?: boolean;
}

/**
 * Compare a current path against a nav href, with trailing-slash normalisation.
 * - Default (`exact`): `true` only if paths match after normalisation.
 * - `{ exact: false }`: also `true` when `path` is a descendant of `href`.
 */
export function isActiveHref(
  path: string,
  href: string,
  options?: IsActiveHrefOptions
): boolean {
  const exact = options?.exact ?? true;
  const p = normalisePath(path);
  const h = normalisePath(href);
  if (p === h) return true;
  if (exact) return false;
  if (h === '/') return true;
  return p.startsWith(h + '/');
}
