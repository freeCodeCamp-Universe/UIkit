/**
 * Markdown pages for non-component registry items:
 * /registry/theme.md, icons.md, vanilla.md, tailwind.md, html-progress.md,
 * use-async-combobox-items.md, hotspot-shapes.md.
 * (Per-component pages live at /components/<slug>.md; the agent bootstrap
 * guide at /registry/starter.md.)
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import {
  SITE,
  iconSvgNames,
  nonComponentItems,
  type RegistryItem
} from '../../lib/registry';
import { renderItemPage } from '../../lib/registry-md';

function renderOptions(
  item: RegistryItem
): Parameters<typeof renderItemPage>[1] {
  switch (item.name) {
    case 'theme':
      return {
        intro: [
          '## Install',
          '',
          '1. Copy `tokens.css` and `base.css` into your project (e.g. `src/ui/theme/`) and import both once from your global stylesheet, tokens first.',
          `2. Fonts: tokens.css declares @font-face with absolute \`/fonts/*.woff\` URLs. Download the font files (listed in ${SITE}/registry/starter.md) into your \`public/fonts/\` directory, or edit the \`src: url(...)\` paths to match your setup.`,
          '3. Dark is the default palette. Add the `light-palette` class to `<html>` or any subtree to switch to light mode.',
          '',
          '## Theming rules',
          '',
          '- The default palette is the freeCodeCamp theme and should stay intact wherever possible.',
          '- To recolour, edit the token values in your copied tokens.css (e.g. `--cta-background`). Never hard-code colors in component CSS - components only reference tokens.',
          '- `base.css` carries shared helpers (`.sr-only`) that several components rely on.'
        ]
      };
    case 'icons':
      return {
        skipSources: new Set(['icons.ts']),
        intro: [
          '## Install',
          '',
          '1. Copy `Icon.tsx` (the React wrapper) into `src/ui/icons/`.',
          `2. \`icons.ts\` is the full curated Lucide map (~8k lines). Copy it whole from the raw URL, or subset it: keep the \`svgAttrs\` export, the \`IconName\` type and only the icon entries you use.`,
          `3. Not using React? Fetch raw SVGs per icon, or use the CDN sprite: ${SITE}/cdn/sprite.svg`,
          '',
          '## Available icons',
          '',
          `Raw SVG per icon: \`${SITE}/registry/icons/svg/<name>.svg\``,
          '',
          iconSvgNames()
            .map(n => `\`${n}\``)
            .join(', ')
        ]
      };
    case 'vanilla':
      return {
        intro: [
          '## Install',
          '',
          '1. Copy `core.ts` plus the adapters you need into `src/ui/vanilla/` and install the matching `@zag-js/*` packages.',
          '2. Each adapter binds one behaviour to `data-uikit-*` attributes in plain HTML (dialog, combobox, listbox, pagination, toast). Call the exported `init()` once after the DOM is parsed.',
          `3. Zero-build alternative: \`<script src="${SITE}/cdn/uikit.global.js" defer></script>\` binds every behaviour automatically.`
        ]
      };
    case 'tailwind':
      return {
        intro: [
          '## Install',
          '',
          '1. Optional - components are vanilla CSS and do not require Tailwind.',
          '2. Copy `preset.ts` + `plugin.ts` into your Tailwind (>=4) config directory and register them; they mirror UIKit tokens as utilities.',
          `3. You still need the theme installed (${SITE}/registry/theme.md) - the preset references the same CSS custom properties.`
        ]
      };
    default:
      return {};
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return nonComponentItems().map(item => ({
    params: { item: item.name },
    props: { item }
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { item } = props as { item: RegistryItem };
  return new Response(renderItemPage(item, renderOptions(item)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
