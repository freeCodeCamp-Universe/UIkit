import type { JSX } from 'react';
import {
  Sidebar,
  SidebarItem,
  SidebarSection,
  isActiveHrefWithHash
} from '@freecodecamp/uikit/navigation';
import type { NavSection } from '../../data/nav';

export interface AppSidebarProps {
  readonly nav: readonly NavSection[];
  readonly currentPath: string;
  /** `Astro.url.hash`; empty string when no fragment. */
  readonly currentHash?: string;
}

export function AppSidebar({
  nav,
  currentPath,
  currentHash = ''
}: AppSidebarProps): JSX.Element {
  return (
    <Sidebar aria-label='Component navigation'>
      <div className='sidebar__intro'>
        <p className='sidebar__intro-kicker'>freeCodeCamp UIKit</p>
        <p className='sidebar__intro-title'>Docs</p>
      </div>
      {nav.map(section => (
        <SidebarSection key={section.id} label={section.label}>
          {section.items.map(item => {
            const hashIdx = item.href.indexOf('#');
            const target = hashIdx === -1 ? null : item.href.slice(hashIdx + 1);
            const spyProps = target
              ? { 'data-sidebar-link': '', 'data-target': target }
              : {};
            return (
              <SidebarItem
                key={item.id}
                href={item.href}
                active={isActiveHrefWithHash(
                  currentPath,
                  currentHash,
                  item.href
                )}
                {...spyProps}
              >
                {item.label}
              </SidebarItem>
            );
          })}
        </SidebarSection>
      ))}
      <p className='sidebar__hint'>
        Press <kbd className='kbd'>/</kbd> to search
      </p>
    </Sidebar>
  );
}
