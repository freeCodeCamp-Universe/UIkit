// Dogfood chrome: docs site sidebar built on @freecodecamp/uikit's
// <Sidebar> + <SidebarSection> + <SidebarItem>. Rendered SSR-only — the
// active state is driven by `currentPath` (threaded in from `Astro.url`)
// via the `isActiveHref` helper, so we no longer need a client-side
// script to mark the active link.
//
// Wave 4 · 4.6 dropped the `shouldOpenSection` / `DEFAULT_OPEN` dance.
// After the IA flattened (/ as Playground + /handbook as reference),
// the sidebar renders on exactly two routes and serves as a shallow
// jump-list — every section ships expanded.
import type { JSX } from 'react';
import {
  Sidebar,
  SidebarItem,
  SidebarSection,
  isActiveHref
} from '@freecodecamp/uikit/navigation';
import type { NavSection } from '../../data/nav';

export interface AppSidebarProps {
  readonly nav: readonly NavSection[];
  readonly currentPath: string;
}

export function AppSidebar({ nav, currentPath }: AppSidebarProps): JSX.Element {
  return (
    <Sidebar aria-label='Component navigation'>
      <div className='sidebar__intro'>
        <p className='sidebar__intro-kicker'>freeCodeCamp UIKit</p>
        <p className='sidebar__intro-title'>Docs</p>
      </div>
      {nav.map(section => (
        <SidebarSection key={section.id} label={section.label}>
          {section.items.map(item => (
            <SidebarItem
              key={item.id}
              href={item.href}
              active={isActiveHref(currentPath, item.href)}
            >
              {item.label}
            </SidebarItem>
          ))}
        </SidebarSection>
      ))}
      <p className='sidebar__hint'>
        Press <kbd className='kbd'>/</kbd> to search
      </p>
    </Sidebar>
  );
}
