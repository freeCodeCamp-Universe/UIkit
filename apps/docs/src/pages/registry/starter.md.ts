/**
 * Agent bootstrap guide: how to wire the UIKit copy-source registry into a
 * fresh project. Listed first in llms.txt.
 */
import type { APIRoute } from 'astro';
import { SITE, publicFontNames, registryVersion } from '../../lib/registry';

export const GET: APIRoute = () => {
  const fonts = publicFontNames();

  const agentsSnippet = [
    '## UI components',
    '',
    'UI components in this project are copied from the freeCodeCamp UIKit',
    `copy-source registry (version pinned at install time). To add or update a`,
    'component:',
    '',
    `1. Discover: fetch ${SITE}/llms.txt (index) or ${SITE}/registry/index.json (machine-readable).`,
    `2. Read the component page: ${SITE}/components/<slug>.md - it contains install steps, props and full source.`,
    '3. Copy the files into src/ui/<slug>/ and import the CSS once globally.',
    '4. Tailor the copied source to this project as needed, but keep the CSS custom property (token) names intact - colors/spacing are themed in src/ui/theme/tokens.css, never hard-coded in component CSS.',
    '5. The default palette is the freeCodeCamp theme; edit token values in tokens.css to recolour.'
  ].join('\n');

  const lines = [
    '# UIKit starter - bootstrap a project with copy-source components',
    '',
    `> One-time setup for consuming ${SITE} as a copy-source (shadcn-style) registry. Registry version: ${registryVersion()}.`,
    '',
    '## 1. Create the ui directory',
    '',
    'Components live in your source tree, not node_modules. Suggested layout:',
    '',
    '```',
    'src/ui/',
    '  theme/tokens.css      <- design tokens (copy once, edit to theme)',
    '  theme/base.css        <- shared helpers (.sr-only)',
    '  button/Button.tsx     <- one directory per component',
    '  button/button.css',
    '```',
    '',
    '## 2. Install the theme (required)',
    '',
    `Copy both files from ${SITE}/registry/theme.md (raw: ${SITE}/registry/theme/tokens.css, ${SITE}/registry/theme/base.css) and import them once, tokens first:`,
    '',
    '```css',
    "@import './ui/theme/tokens.css';",
    "@import './ui/theme/base.css';",
    '```',
    '',
    '## 3. Fonts (required for the canonical look)',
    '',
    'tokens.css declares @font-face rules with absolute `/fonts/*.woff` URLs.',
    'Either download the fonts into your `public/fonts/` directory, or edit the',
    '`src: url(...)` paths in your copied tokens.css. Font files:',
    '',
    ...fonts.map(f => `- ${SITE}/fonts/${f}`),
    '',
    '## 4. Dark / light',
    '',
    'Dark is the default. Add class `light-palette` to `<html>` (or any subtree)',
    'for light mode. `color-scheme` is handled by the tokens.',
    '',
    '## 5. Add components',
    '',
    `- Index of everything: ${SITE}/llms.txt`,
    `- Machine-readable manifest: ${SITE}/registry/index.json`,
    `- Per-component page (install + props + full source): ${SITE}/components/<slug>.md`,
    `- Raw files: ${SITE}/registry/<slug>/<file>`,
    '',
    'Each page lists npm dependencies (e.g. react, @ark-ui/react for complex',
    'components) and registry dependencies (theme, shared hooks) to copy first.',
    '',
    '## 6. Theming rules (non-negotiable defaults)',
    '',
    '- Keep token NAMES intact - components reference them.',
    '- Recolour by editing token VALUES in your copied tokens.css.',
    '- Never hard-code colors in component CSS.',
    '',
    '## 7. Suggested AGENTS.md / CLAUDE.md snippet',
    '',
    'Add this to the consuming project so future agents know where components come from:',
    '',
    '```markdown',
    agentsSnippet,
    '```',
    ''
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
