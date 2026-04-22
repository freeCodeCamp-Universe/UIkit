export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

export interface NavSection {
  readonly id: string;
  readonly label: string;
  readonly items: readonly NavItem[];
}

export interface FlatNavItem extends NavItem {
  readonly section: string;
}

const component = (id: string, label: string): NavItem => ({
  id,
  label,
  href: `/#${id}`
});

const foundation = (id: string, label: string): NavItem => ({
  id: `foundations-${id}`,
  label,
  href: `/foundations/${id}`
});

export const nav: readonly NavSection[] = [
  {
    id: 'guides',
    label: 'Guides',
    items: [
      { id: 'guides', label: 'Overview', href: '/guides' },
      { id: 'guides-cdn', label: 'Use via CDN', href: '/guides/cdn' },
      {
        id: 'guides-copy-paste',
        label: 'Copy & vendor',
        href: '/guides/copy-paste'
      }
    ]
  },
  {
    id: 'foundations',
    label: 'Foundations',
    items: [
      foundation('colors', 'Colors'),
      foundation('typography', 'Typography'),
      foundation('spacing', 'Spacing'),
      foundation('iconography', 'Iconography'),
      foundation('motion', 'Motion'),
      foundation('voice', 'Voice')
    ]
  },
  {
    id: 'overview',
    label: 'Overview',
    items: [
      component('introduction', 'Introduction'),
      component('tokens', 'Design tokens')
    ]
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      component('button', 'Button'),
      component('toggle-button', 'Toggle button'),
      component('close-button', 'Close button'),
      component('link', 'Link')
    ]
  },
  {
    id: 'forms',
    label: 'Forms',
    items: [
      component('input', 'Input'),
      component('checkbox', 'Checkbox'),
      component('switch', 'Switch'),
      component('form-group', 'Form group'),
      component('form-control', 'Form control')
    ]
  },
  {
    id: 'feedback',
    label: 'Feedback',
    items: [
      component('alert', 'Alert'),
      component('callout', 'Callout'),
      component('badge', 'Badge'),
      component('tooltip', 'Tooltip'),
      component('modal', 'Modal')
    ]
  },
  {
    id: 'layout',
    label: 'Layout',
    items: [
      component('card', 'Card'),
      component('panel', 'Panel'),
      component('tabs', 'Tabs'),
      component('dropdown', 'Dropdown'),
      component('spacer', 'Spacer')
    ]
  },
  {
    id: 'data',
    label: 'Data',
    items: [component('table', 'Table'), component('image', 'Image')]
  }
];

export const flatNav: readonly FlatNavItem[] = nav.flatMap(section =>
  section.items.map(item => ({ ...item, section: section.id }))
);
