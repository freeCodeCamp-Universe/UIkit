// Dogfood chrome: docs site header built on @freecodecamp/uikit's <Navbar>.
// Rendered SSR-only (no client:* directive) — the sibling inline script in
// AppHeader.astro handles theme swap + search-open interactivity via the
// `data-theme-swap` / `data-open-search` attributes this markup emits.
import type { JSX } from 'react';
import { Navbar } from '@freecodecamp/uikit/navigation';

export function AppHeader(): JSX.Element {
  const brand = (
    <a
      className='site-header__brand'
      href='#top'
      aria-label='freeCodeCamp UIKit home'
    >
      <img src='/brand/fcc-puck.svg' alt='' width={22} height={22} />
      <span>freeCodeCamp UIKit</span>
      <em>v0.1.0</em>
    </a>
  );

  const primaryNav = (
    <nav className='site-header__nav' aria-label='Primary'>
      <a href='/guides'>Guides</a>
      <a href='/#tokens'>Tokens</a>
      <a href='/#button'>Components</a>
      <a
        href='https://github.com/freeCodeCamp/ui'
        target='_blank'
        rel='noreferrer noopener'
      >
        GitHub
      </a>
    </nav>
  );

  const controls = (
    <>
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
