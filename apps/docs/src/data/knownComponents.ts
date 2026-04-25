/**
 * Authoritative slug list for every component surfaced in the nav.
 *
 * Keeps `nav.test.ts` independent of Astro's `getCollection` (unavailable
 * in `node:test`) while still letting us assert that every nav entry
 * points to a slug we expect. Keep in sync with:
 *   - `apps/docs/src/data/nav.ts`
 *   - `apps/docs/src/content/components/*.mdx` (plus the intentional
 *     storybook-only exceptions: `table`, `image`).
 */
export const knownComponentSlugs: ReadonlySet<string> = new Set<string>([
  // Primitives
  'text',
  'heading',
  'badge',
  'avatar',
  'divider',
  'spacer',
  'link',
  'image',
  // Actions
  'button',
  'toggle-button',
  'close-button',
  // Forms
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'switch',
  'fieldset',
  'form-control',
  'form-group',
  'help-block',
  'form-stepper',
  // Navigation
  'navbar',
  'sidebar',
  'tabs',
  'pagination',
  'listbox',
  'combobox',
  'command-palette',
  'breadcrumb',
  // Overlays
  'modal',
  'dropdown',
  'tooltip',
  'toast',
  // Feedback
  'alert',
  'callout',
  'skeleton',
  'empty-state',
  // Data display
  'card',
  'panel',
  'table',
  'data-table',
  'description-list',
  // Layouts
  'sidebar-layout',
  'stacked-layout',
  'auth-layout'
]);
