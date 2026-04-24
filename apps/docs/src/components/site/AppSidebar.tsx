// Dogfood chrome: docs site sidebar built on @freecodecamp/uikit's
// <Sidebar> + <SidebarSection> + <SidebarItem>. Rendered SSR-only — the
// sibling inline script in AppSidebar.astro owns the IntersectionObserver
// for section-based active-link tracking on the storybook page.
import type { JSX } from 'react';
import {
  Sidebar,
  SidebarItem,
  SidebarSection
} from '@freecodecamp/uikit/navigation';
import type { NavSection } from '../../data/nav';

export interface AppSidebarProps {
  readonly nav: readonly NavSection[];
}

export function AppSidebar({ nav }: AppSidebarProps): JSX.Element {
  return (
    <Sidebar aria-label='Component navigation'>
      <div className='sidebar__intro'>
        <p className='sidebar__intro-kicker'>freeCodeCamp UIKit</p>
        <p className='sidebar__intro-title'>Component storybook</p>
      </div>
      {nav.map(section => (
        <SidebarSection key={section.id} label={section.label}>
          {section.items.map(item => (
            <SidebarItem
              key={item.id}
              href={item.href}
              data-sidebar-link
              data-target={item.id}
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
