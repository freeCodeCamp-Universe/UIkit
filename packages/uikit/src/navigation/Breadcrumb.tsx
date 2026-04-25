// Wave 8 P4 (W8-5) — Breadcrumb.
//
// Compound API mirrors WAI-ARIA APG, Mantine, shadcn/ui, and React
// Aria conventions: <Breadcrumb> is the labelled `<nav>` container,
// <Breadcrumb.Item> is the `<li>` (rendered as `<a>` for navigable
// items, `<span aria-current="page">` for the current/active leaf).
// The visible separator is a CSS `::after` pseudo-element on every
// non-last item — invisible to AT, no extra DOM noise.
//
// `href` carries a scheme allowlist: anything outside
// `(https?:|/|#|mailto:|tel:)` falls through to a non-link `<span>`
// and emits a `console.warn`. Mitigates an XSS surface on user-
// supplied breadcrumb input.
import {
  createContext,
  useContext,
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type AnchorHTMLAttributes
} from 'react';

export interface BreadcrumbProps {
  children: ReactNode;
  'aria-label'?: string;
  className?: string;
}

export interface BreadcrumbItemProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children'
> {
  children: ReactNode;
  active?: boolean;
}

interface BreadcrumbContextValue {
  total: number;
  index: number;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  total: 0,
  index: 0
});

const SAFE_SCHEMES = /^(https?:|\/|#|mailto:|tel:)/i;

function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  if (!SAFE_SCHEMES.test(href)) {
    if (typeof console !== 'undefined') {
      console.warn(`[Breadcrumb] rejected href: ${href}`);
    }
    return undefined;
  }
  return href;
}

function BreadcrumbRoot({
  children,
  className,
  'aria-label': ariaLabel = 'Breadcrumb'
}: BreadcrumbProps): ReactElement {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <nav
      aria-label={ariaLabel}
      className={['breadcrumb', className].filter(Boolean).join(' ')}
    >
      <ol className='breadcrumb__list'>
        {items.map((child, index) => (
          <BreadcrumbContext.Provider
            key={index}
            value={{ total: items.length, index }}
          >
            {cloneElement(child as ReactElement)}
          </BreadcrumbContext.Provider>
        ))}
      </ol>
    </nav>
  );
}

function BreadcrumbItem({
  active,
  href,
  children,
  className,
  ...rest
}: BreadcrumbItemProps): ReactElement {
  const { total, index } = useContext(BreadcrumbContext);
  const isLast = total > 0 && index === total - 1;
  const safe = safeHref(href);
  const isActive = active === true || (active === undefined && isLast && !safe);
  const liClass = ['breadcrumb__item', className].filter(Boolean).join(' ');

  if (isActive || !safe) {
    return (
      <li className={liClass}>
        <span
          aria-current={isActive ? 'page' : undefined}
          className='breadcrumb__current'
        >
          {children}
        </span>
      </li>
    );
  }

  return (
    <li className={liClass}>
      <a href={safe} className='breadcrumb__link' {...rest}>
        {children}
      </a>
    </li>
  );
}

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem
});

export default Breadcrumb;
