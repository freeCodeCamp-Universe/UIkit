import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const STATEFUL = new Set([
  'combobox',
  'command-palette',
  'dropdown',
  'form-stepper',
  'listbox',
  'modal',
  'pagination',
  'radio',
  'switch',
  'tabs',
  'toast',
  'toggle-button',
  'tooltip'
]);

const EXPECTED: Record<string, ReadonlyArray<string>> = {
  alert: ['Alert'],
  'auth-layout': ['AuthLayout'],
  avatar: ['Avatar'],
  badge: ['Badge'],
  breadcrumb: ['Breadcrumb'],
  button: ['Button'],
  callout: ['Callout'],
  card: ['Card'],
  checkbox: ['Checkbox'],
  'close-button': ['CloseButton'],
  'data-table': ['DataTable'],
  'description-list': ['DescriptionList'],
  divider: ['Divider'],
  'empty-state': ['EmptyState'],
  fieldset: ['Fieldset'],
  'form-control': ['FormControl'],
  'form-group': ['FormGroup'],
  heading: ['Heading'],
  'help-block': ['HelpBlock'],
  image: ['Image'],
  input: ['Input'],
  link: ['Link'],
  navbar: ['Navbar'],
  panel: ['Panel'],
  select: ['Select'],
  sidebar: ['Sidebar'],
  'sidebar-layout': ['SidebarLayout'],
  skeleton: ['Skeleton'],
  spacer: ['Spacer'],
  'stacked-layout': ['StackedLayout'],
  table: ['Table'],
  text: ['Text'],
  textarea: ['Textarea']
};

const files = readdirSync(here)
  .filter(name => name.endsWith('.astro'))
  .map(name => name.replace(/\.astro$/, ''));

const subjects = files.filter(slug => !STATEFUL.has(slug));

test('+ + + P6.1 — 33 SSR-only showcases identified', () => {
  assert.equal(
    subjects.length,
    33,
    `expected 33 SSR-only showcases, got ${subjects.length}`
  );
});

test('every SSR-only slug has an EXPECTED entry', () => {
  for (const slug of subjects) {
    assert.ok(
      slug in EXPECTED,
      `add ${slug} to EXPECTED in ssr-react-render.test.ts`
    );
  }
});

for (const slug of subjects) {
  const expected = EXPECTED[slug];
  if (!expected) continue;
  const path = resolve(here, `${slug}.astro`);

  test(`${slug}.astro imports its uikit component(s) in frontmatter`, () => {
    const src = readFileSync(path, 'utf8');
    const importRegex = new RegExp(
      `import\\s*\\{[^}]*\\b(${expected.join('|')})\\b[^}]*\\}\\s*from\\s*['"]@freecodecamp/uikit['"]`
    );
    assert.match(
      src,
      importRegex,
      `${slug}.astro must \`import { ${expected.join(', ')} } from '@freecodecamp/uikit'\` so the preview renders the real component`
    );
  });

  test(`${slug}.astro renders <${expected[0]} /> in the preview slot`, () => {
    const src = readFileSync(path, 'utf8');
    // Extract the preview <Fragment slot='preview'> ... </Fragment> block.
    const previewMatch = src.match(
      /<Fragment\s+slot=['"]preview['"]\s*>([\s\S]*?)<\/Fragment>/
    );
    assert.ok(
      previewMatch,
      `${slug}.astro must define <Fragment slot='preview'>...</Fragment>`
    );
    const preview = previewMatch[1]!;
    for (const component of expected) {
      const jsxRegex = new RegExp(`<${component}(Cmp)?(\\s|>|/)`);
      assert.match(
        preview,
        jsxRegex,
        `${slug}.astro preview must contain <${component} /> (or <${component}Cmp />) JSX (not an HTML class mock)`
      );
    }
  });
}
