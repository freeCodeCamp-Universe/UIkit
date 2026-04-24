// Dogfood chrome: docs site sidebar built on @freecodecamp/uikit's
// <Sidebar> + <SidebarSection> + <SidebarItem>. Rendered SSR-only — the
// active state is driven by `currentPath` (threaded in from `Astro.url`)
// via the `isActiveHref` helper, so we no longer need a client-side
// script to mark the active link.
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

/**
 * Sections that always render expanded regardless of the current route.
 * Guides and foundations are universally useful; primitives is the first
 * level of the component layer so we keep it open to surface depth.
 */
const DEFAULT_OPEN = new Set<string>(['guides', 'foundations', 'primitives']);

export function shouldOpenSection(
  section: NavSection,
  currentPath: string
): boolean {
  if (DEFAULT_OPEN.has(section.id)) return true;
  return section.items.some(item =>
    isActiveHref(currentPath, item.href, { exact: false })
  );
}

export function AppSidebar({ nav, currentPath }: AppSidebarProps): JSX.Element {
  return (
    <Sidebar aria-label='Component navigation'>
      <div className='sidebar__intro'>
        <p className='sidebar__intro-kicker'>freeCodeCamp UIKit</p>
        <p className='sidebar__intro-title'>Docs</p>
      </div>
      {nav.map(section => (
        <SidebarSection
          key={section.id}
          label={section.label}
          collapsible
          defaultOpen={shouldOpenSection(section, currentPath)}
        >
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
