// Dogfood chrome: docs site header built on @freecodecamp/uikit's <Navbar>.
// Rendered SSR-only (no client:* directive) — the sibling inline script in
// AppHeader.astro handles theme swap + search-open interactivity via the
// `data-theme-swap` / `data-open-search` attributes this markup emits.
//
// Wave 9 P2.11 (W9-C3) — accept `pathname` from Astro and stamp
// `aria-current="page"` on the matching link so screen readers can
// tell which page is loaded. Match policy:
//   - `/` is current only on the literal root.
//   - `/handbook` matches `/handbook` and any nested `/handbook/*`.
//   - `/guides/install` matches any `/guides/*` slug — the link in the
//     header is a generic "Guides" entry point.
//   - GitHub external link is never marked current.
import type { JSX } from 'react';
import { Navbar } from '@freecodecamp/uikit/navigation';

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: '/', label: 'Playground' },
  { href: '/handbook', label: 'Handbook' },
  { href: '/guides/install', label: 'Guides' },
  {
    href: 'https://github.com/freeCodeCamp/ui',
    label: 'GitHub',
    external: true
  }
];

const isCurrent = (link: NavLink, pathname: string): boolean => {
  if (link.external) return false;
  if (link.href === '/') return pathname === '/';
  // The Guides entry-point href is `/guides/install`, but any
  // `/guides/*` slug should still light up the Guides tab.
  if (link.href.startsWith('/guides/')) return pathname.startsWith('/guides/');
  // Default: exact-match or nested under the section.
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
};

export interface AppHeaderProps {
  /**
   * Current pathname from `Astro.url.pathname`. Defaults to `''` so the
   * header still renders cleanly when consumed outside an Astro route
   * (e.g. unit tests that omit the prop) — no link will be marked
   * current in that case, which is the correct neutral state.
   */
  pathname?: string;
}

export function AppHeader({ pathname = '' }: AppHeaderProps): JSX.Element {
  const brand = (
    <a
      className='site-header__brand'
      href='/'
      aria-label='freeCodeCamp UIKit home'
    >
      <img src='/brand/fcc-puck.svg' alt='' width={22} height={22} />
      <span>freeCodeCamp UIKit</span>
    </a>
  );

  const primaryNav = (
    <nav className='site-header__nav' aria-label='Primary'>
      {NAV_LINKS.map(link => {
        const current = isCurrent(link, pathname);
        const externalProps = link.external
          ? { target: '_blank', rel: 'noreferrer noopener' }
          : {};
        return (
          <a
            key={link.href}
            href={link.href}
            aria-current={current ? 'page' : undefined}
            {...externalProps}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );

  const controls = (
    <>
      <button
        className='site-header__hamburger'
        type='button'
        data-nav-toggle
        aria-controls='app-sidebar'
        aria-expanded='false'
        aria-label='Open navigation'
      >
        <svg
          width={20}
          height={20}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
          data-icon='hamburger'
        >
          <line x1={3} y1={6} x2={21} y2={6} />
          <line x1={3} y1={12} x2={21} y2={12} />
          <line x1={3} y1={18} x2={21} y2={18} />
        </svg>
        <svg
          width={20}
          height={20}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
          data-icon='close'
          style={{ display: 'none' }}
        >
          <line x1={6} y1={6} x2={18} y2={18} />
          <line x1={6} y1={18} x2={18} y2={6} />
        </svg>
      </button>
      <button
        className='site-search site-search--button'
        type='button'
        data-open-search
        aria-label='Open search'
      >
        <span>Search components, guides, foundations</span>
        <kbd>/</kbd>
      </button>
      <button
        className='theme-swap'
        type='button'
        aria-label='Toggle color palette'
        data-theme-swap
      >
        <svg
          data-icon-dark
          width={16}
          height={16}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <circle cx={12} cy={12} r={4} />
          <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' />
        </svg>
        <svg
          data-icon-light
          width={16}
          height={16}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
          style={{ display: 'none' }}
        >
          <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
        </svg>
      </button>
    </>
  );

  return (
    <Navbar
      className='site-header'
      start={brand}
      center={primaryNav}
      end={controls}
    />
  );
}
