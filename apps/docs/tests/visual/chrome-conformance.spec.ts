import { test, expect } from '@playwright/test';

const SLUGS: readonly string[] = [
  'text',
  'heading',
  'badge',
  'avatar',
  'divider',
  'spacer',
  'link',
  'image',
  'button',
  'toggle-button',
  'close-button',
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
  'navbar',
  'sidebar',
  'tabs',
  'pagination',
  'listbox',
  'combobox',
  'command-palette',
  'breadcrumb',
  'modal',
  'dropdown',
  'tooltip',
  'toast',
  'alert',
  'callout',
  'skeleton',
  'empty-state',
  'card',
  'panel',
  'table',
  'data-table',
  'description-list',
  'sidebar-layout',
  'stacked-layout',
  'auth-layout'
];

const CANONICAL_DIRECT_CHILDREN: readonly string[] = [
  'showcase__head',
  'showcase__preview',
  'showcase__tabs',
  'showcase__code'
];

test.describe('@chrome S3 - every PlaygroundCard surfaces canonical chrome', () => {
  test.beforeEach(async ({ page }) => {
    // Showcases live at `/playground/` after the IA split (commit f1038b2).
    await page.goto('/playground/', { waitUntil: 'networkidle' });
  });

  for (const slug of SLUGS) {
    test(`${slug} has the canonical chrome direct-children`, async ({
      page
    }) => {
      const card = page.locator(`section#${slug} > .showcase`);
      await expect(card).toBeVisible();
      const childClasses = await card.evaluate((el: Element) => {
        const out: string[] = [];
        for (const child of Array.from(el.children)) {
          const token = child.classList.item(0);
          if (token) out.push(token);
        }
        return out;
      });
      const head = childClasses.slice(0, CANONICAL_DIRECT_CHILDREN.length);
      expect(head).toEqual(CANONICAL_DIRECT_CHILDREN);
    });
  }
});
