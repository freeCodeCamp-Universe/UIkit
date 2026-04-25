// Wave 9 P4.3 (W9-B8.3) — site breadcrumb sub-bar.
//
// Design contract (`comp-header` card → `.crumb` block in
// `~/Downloads/freeCodeCamp Design System.html`): every route
// except home renders a 32px tall mono breadcrumb rail under the
// site header, with `›` separators between segments and the
// current leaf bolded.
//
// Surface implemented here:
//   - `crumbsForPath(pathname)` — pure helper, locked by unit
//     test; emits a list of `{ href?, label }` items, or null on
//     home where no breadcrumb should paint.
//   - `<AppBreadcrumb pathname>` — SSR React component that wraps
//     uikit's `<Breadcrumb>` with the resolved items; returns
//     null on `/` so the chrome stays compact.
//
// `<Breadcrumb>` already maps the last item without an `href` to
// `aria-current="page"`, so we leave the leaf's `href` undefined
// to opt into that contract automatically.
import type { JSX } from 'react';
import { Breadcrumb } from '@freecodecamp/uikit/navigation';

export interface BreadcrumbCrumb {
  /** Omitted on the leaf so the component flips it to aria-current. */
  href?: string;
  label: string;
}

const SECTION_LABELS: Record<string, string> = {
  handbook: 'Handbook',
  guides: 'Guides',
  components: 'Components'
};

/** Title-case a slug like `copy-paste` → `Copy paste`. */
function humanise(slug: string): string {
  if (slug.length === 0) return slug;
  const spaced = slug.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function crumbsForPath(pathname: string): BreadcrumbCrumb[] | null {
  // Home — no breadcrumb. The header alone is enough orientation
  // when the user is at `/`.
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
      // Leaf — no href so `<Breadcrumb.Item>` paints it as the
      // aria-current="page" leaf per its compound API.
      crumbs.push({ label });
    } else {
      // Section index. For known sections we link to the section
      // entry-point (e.g. `/guides/install` is the Guides root in
      // the primary nav). Others link to their cumulative path.
      const href = seg === 'guides' ? '/guides/install' : cumulative;
      crumbs.push({ href, label });
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
