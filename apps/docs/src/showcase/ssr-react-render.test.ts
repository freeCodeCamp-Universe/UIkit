// Wave 7 P6 — SSR React render contract. Stateless showcases must
// render the REAL uikit React component in the preview slot, not a
// hand-rolled HTML mock. Wave 6 shipped 45 showcases where every
// preview was a div-soup imitation; the snippet-audit (P4) caught
// API drift between mocks and real components on Combobox + others.
// P5 fixed the 11 stateful demos with `client:` directives. P6 fixes
// the remaining 34 by inlining `<Component />` JSX (Astro SSRs React
// without hydration, so no `client:` is needed for static previews).
//
// Contract per file:
//   1. Frontmatter imports the component(s) from `@freecodecamp/uikit`.
//   2. Preview slot contains at least one `<ComponentName ` JSX render.
//   3. The rendered tag matches a uikit-exported name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// Wave 7 P5 — these 11 hydrate as client islands; covered by
// runtime-island.test.ts. P6 covers everything else.
const STATEFUL = new Set([
  'combobox',
  'command-palette',
  'dropdown',
  'form-stepper',
  'listbox',
  'modal',
  'pagination',
  'switch',
  'tabs',
  'toast',
  'tooltip'
]);

// slug → expected primary uikit component name(s) that MUST appear
// in the preview slot. A showcase may render more than one component
// (e.g. a Card containing a Button); the expectation captures the
// component the file is *named after*, plus any companions whose
// presence is required to make the example intelligible.
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
  radio: ['Radio'],
  select: ['Select'],
  sidebar: ['Sidebar'],
  'sidebar-layout': ['SidebarLayout'],
  skeleton: ['Skeleton'],
  spacer: ['Spacer'],
  'stacked-layout': ['StackedLayout'],
  table: ['Table'],
  text: ['Text'],
  textarea: ['Textarea'],
  'toggle-button': ['ToggleButton']
};

const files = readdirSync(here)
  .filter(name => name.endsWith('.astro'))
  .map(name => name.replace(/\.astro$/, ''));

const subjects = files.filter(slug => !STATEFUL.has(slug));

test('Wave 7 P6 + Wave 8 P4 — 35 SSR-only showcases identified', () => {
  // Wave 8 P4 — breadcrumb shipped, 34 → 35.
  assert.equal(
    subjects.length,
    35,
    `expected 35 SSR-only showcases, got ${subjects.length}`
  );
});

test('every SSR-only slug has an EXPECTED entry', () => {
  for (const slug of subjects) {
    assert.ok(
      slug in EXPECTED,
      `Wave 7 P6 — add ${slug} to EXPECTED in ssr-react-render.test.ts`
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
    const preview = previewMatch[1];
    for (const component of expected) {
      const jsxRegex = new RegExp(`<${component}(\\s|>|/)`);
      assert.match(
        preview,
        jsxRegex,
        `${slug}.astro preview must contain <${component} /> JSX (not an HTML class mock)`
      );
    }
  });
}
