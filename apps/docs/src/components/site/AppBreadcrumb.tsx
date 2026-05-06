import type { JSX } from 'react';
import { Breadcrumb } from '@freecodecamp/uikit/navigation';

export interface BreadcrumbCrumb {
  /** Omit on leaf → `<Breadcrumb.Item>` paints aria-current="page". */
  href?: string;
  label: string;
}

const SECTION_LABELS: Record<string, string> = {
  handbook: 'Handbook',
  playground: 'Playground'
};

/** Title-case a slug like `copy-paste` → `Copy paste`. */
function humanise(slug: string): string {
  if (slug.length === 0) return slug;
  const spaced = slug.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function crumbsForPath(pathname: string): BreadcrumbCrumb[] | null {
  if (pathname === '/' || pathname === '') return null;
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  const crumbs: BreadcrumbCrumb[] = [{ href: '/', label: 'Home' }];
  let cumulative = '';
  segments.forEach((seg, i) => {
    cumulative += `/${seg}`;
    const isLeaf = i === segments.length - 1;
    const label = SECTION_LABELS[seg] ?? humanise(seg);
    if (isLeaf) {
      crumbs.push({ label });
    } else {
      crumbs.push({ href: cumulative, label });
    }
  });
  return crumbs;
}

export interface AppBreadcrumbProps {
  pathname: string;
}

export function AppBreadcrumb({
  pathname
}: AppBreadcrumbProps): JSX.Element | null {
  const crumbs = crumbsForPath(pathname);
  if (!crumbs) return null;
  return (
    <div className='site-breadcrumb'>
      <Breadcrumb>
        {crumbs.map((c, i) => (
          <Breadcrumb.Item key={`${i}-${c.label}`} href={c.href}>
            {c.label}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </div>
  );
}

export default AppBreadcrumb;
