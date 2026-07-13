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

const c = (slug: string, label: string): NavItem => ({
  id: `cmp-${slug}`,
  label,
  href: `/playground#${slug}`
});

export const nav: readonly NavSection[] = [
  {
    id: 'primitives',
    label: 'Primitives',
    items: [
      c('text', 'Text'),
      c('heading', 'Heading'),
      c('badge', 'Badge'),
      c('avatar', 'Avatar'),
      c('divider', 'Divider'),
      c('spacer', 'Spacer'),
      c('link', 'Link'),
      c('image', 'Image')
    ]
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      c('button', 'Button'),
      c('toggle-button', 'Toggle button'),
      c('close-button', 'Close button')
    ]
  },
  {
    id: 'forms',
    label: 'Forms',
    items: [
      c('input', 'Input'),
      c('textarea', 'Textarea'),
      c('select', 'Select'),
      c('checkbox', 'Checkbox'),
      c('radio', 'Radio'),
      c('switch', 'Switch'),
      c('fieldset', 'Fieldset'),
      c('form-control', 'Form control'),
      c('form-group', 'Form group'),
      c('help-block', 'Help block'),
      c('form-stepper', 'Form stepper')
    ]
  },
  {
    id: 'navigation',
    label: 'Navigation',
    items: [
      c('navbar', 'Navbar'),
      c('sidebar', 'Sidebar'),
      c('tabs', 'Tabs'),
      c('pagination', 'Pagination'),
      c('listbox', 'Listbox'),
      c('combobox', 'Combobox'),
      c('command-palette', 'Command palette'),
      c('breadcrumb', 'Breadcrumb')
    ]
  },
  {
    id: 'overlays',
    label: 'Overlays',
    items: [
      c('modal', 'Modal'),
      c('dropdown', 'Dropdown'),
      c('tooltip', 'Tooltip'),
      c('toast', 'Toast')
    ]
  },
  {
    id: 'feedback',
    label: 'Feedback',
    items: [
      c('alert', 'Alert'),
      c('callout', 'Callout'),
      c('skeleton', 'Skeleton'),
      c('empty-state', 'Empty state')
    ]
  },
  {
    id: 'data-display',
    label: 'Data display',
    items: [
      c('card', 'Card'),
      c('panel', 'Panel'),
      c('table', 'Table'),
      c('data-table', 'Data table'),
      c('description-list', 'Description list')
    ]
  },
  {
    id: 'layouts',
    label: 'Layouts',
    items: [
      c('sidebar-layout', 'Sidebar layout'),
      c('stacked-layout', 'Stacked layout'),
      c('auth-layout', 'Auth layout')
    ]
  },
  {
    id: 'games',
    label: 'Games',
    items: [c('tile-matcher', 'Tile matcher'), c('hotspots', 'Hotspots')]
  }
];

export const flatNav: readonly FlatNavItem[] = nav.flatMap(section =>
  section.items.map(item => ({ ...item, section: section.id }))
);
