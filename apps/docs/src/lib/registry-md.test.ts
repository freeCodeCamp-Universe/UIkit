import { test, expect, describe } from 'vitest';
import {
  dropEmptySections,
  renderComponentPage,
  renderItemPage
} from './registry-md';
import {
  SITE,
  iconSvgFile,
  iconSvgNames,
  propsTable,
  publicFontNames,
  reactSnippet,
  registryVersion,
  themeItem,
  vanillaItem
} from './registry';

describe('dropEmptySections', () => {
  test('removes headings whose sections are empty, keeps filled ones', () => {
    const md = [
      '## Usage',
      '',
      'Real prose.',
      '',
      '## Props',
      '',
      '## Tokens consumed',
      '',
      '## Keyboard',
      '',
      '| Key | Action |',
      '| --- | --- |'
    ].join('\n');
    const out = dropEmptySections(md);
    expect(out).toContain('## Usage');
    expect(out).toContain('Real prose.');
    expect(out).toContain('## Keyboard');
    expect(out).not.toContain('## Props');
    expect(out).not.toContain('## Tokens consumed');
  });

  test('drops a trailing empty heading and collapses cascades', () => {
    expect(dropEmptySections('## A\n\n## B\n\n## C\n')).toBe('');
    expect(dropEmptySections('text only')).toBe('text only');
  });
});

describe('renderComponentPage', () => {
  const page = renderComponentPage({
    slug: 'button',
    title: 'Button',
    summary: 'The primary action primitive.',
    status: 'stable',
    since: '0.1.0',
    category: 'primitive',
    tokens: ['--cta-background'],
    a11yPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
    prose: 'Buttons trigger immediate actions.\n\n## Props\n'
  });

  test('carries metadata, install steps and dependency lists', () => {
    expect(page).toContain('# Button');
    expect(page).toContain('- Status: stable (since 0.1.0)');
    expect(page).toContain('npm dependencies: `react@');
    expect(page).toContain(`[theme](${SITE}/registry/theme.md)`);
    expect(page).toContain('## Install (copy source)');
    expect(page).toContain('`src/ui/button/Button.tsx`');
  });

  test('embeds full tsx + css sources fenced', () => {
    expect(page).toContain('## Source: Button.tsx');
    expect(page).toMatch(/```tsx\nimport React/);
    expect(page).toContain('## Source: button.css');
    expect(page).toMatch(/```css\n\.btn \{/);
  });

  test('includes example, props table, html variant and agent footer', () => {
    expect(page).toContain('## Example');
    expect(page).toContain("from './ui/button/Button'");
    expect(page).toContain('| Prop | Type | Required | Default |');
    expect(page).toContain('| `variant` |');
    expect(page).toContain('## HTML / vanilla variant');
    expect(page).toContain('btn--cta');
    expect(page).toContain('## For coding agents');
  });

  test('empty prose sections from stripped MDX are dropped', () => {
    // The prose passed in ends with an empty "## Props" heading.
    expect(page).not.toMatch(/## Usage[\s\S]*## Props\n\n## Example/);
    expect(page).toContain('Buttons trigger immediate actions.');
  });
});

describe('renderItemPage', () => {
  test('theme page embeds tokens + base with intro and footer', () => {
    const page = renderItemPage(themeItem(), {
      intro: ['## Install', '', 'Step one.'],
      outro: ['Trailing note.']
    });
    expect(page).toContain('# Theme');
    expect(page).toContain('## Install');
    expect(page).toContain('Step one.');
    expect(page).toContain('## Source: tokens.css');
    expect(page).toMatch(/```css\n/);
    expect(page).toContain('## Source: base.css');
    expect(page).toContain('.sr-only');
    expect(page).toContain('Trailing note.');
    expect(page).toContain('## For coding agents');
  });

  test('skipSources replaces the body with a raw-file pointer', () => {
    const vanilla = vanillaItem();
    const page = renderItemPage(vanilla, {
      skipSources: new Set(['core.ts'])
    });
    expect(page).toContain('## Source: core.ts');
    expect(page).toContain(
      `Too large to inline — fetch the raw file: ${SITE}/registry/vanilla/core.ts`
    );
    expect(page).toContain('@zag-js/');
  });
});

describe('registry helpers', () => {
  test('propsTable falls back for unknown components', () => {
    expect(propsTable('does-not-exist')).toMatch(
      /could not be statically extracted/
    );
  });

  test('reactSnippet returns null for unknown slugs', () => {
    expect(reactSnippet('does-not-exist')).toBeNull();
  });

  test('registryVersion returns a git sha + date (or unknown)', () => {
    expect(registryVersion()).toMatch(
      /^([0-9a-f]{7,} \(\d{4}-\d{2}-\d{2}\)|unknown)$/
    );
  });

  test('icon svg inventory resolves to raw files', () => {
    const names = iconSvgNames();
    expect(names.length).toBeGreaterThan(40);
    expect(names).toContain('check');
    const file = iconSvgFile('check');
    expect(file.url).toBe('/registry/icons/check.svg');
    expect(file.target).toBe('src/ui/icons/svg/check.svg');
  });

  test('public font inventory lists the woff files tokens.css references', () => {
    const fonts = publicFontNames();
    expect(fonts).toContain('Lato-Regular.woff');
    expect(fonts.some(f => f.startsWith('Hack-ZeroSlash'))).toBe(true);
  });
});
