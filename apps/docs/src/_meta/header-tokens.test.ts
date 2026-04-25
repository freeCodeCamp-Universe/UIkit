// Wave 9 P4.4 (W9-B8.4) — header-chrome tokens must be pinned.
//
// Design contract pegs the header at `var(--header-height)` and the
// breadcrumb sub-bar at `var(--breadcrumbs-height)`. Wave 9 P4.3
// landed the breadcrumb rail using a `32px` fallback (`var(--…, 32px)`)
// because the token did not yet exist. This gate fails until both
// tokens are defined in `packages/uikit-css/src/tokens.css` so no
// inline pixel value squats in the chrome (`feedback_no_slop_infra`).
//
// We also assert no consumer in `apps/docs/src/styles/` declares a
// hard-coded header / breadcrumb height — anything that needs to
// know either dimension must reach for the token.
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tokensPath = resolve(
  here,
  '../../../../packages/uikit-css/src/tokens.css'
);
const stylesDir = resolve(here, '../styles');

function readAllCss(dir: string): { file: string; src: string }[] {
  const out: { file: string; src: string }[] = [];
  for (const name of readdirSync(dir)) {
    const full = resolve(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...readAllCss(full));
    } else if (name.endsWith('.css')) {
      out.push({ file: full, src: readFileSync(full, 'utf8') });
    }
  }
  return out;
}

test('uikit-css/tokens.css declares --header-height', () => {
  const src = readFileSync(tokensPath, 'utf8');
  assert.match(
    src,
    /--header-height\s*:\s*\d+px\s*;/,
    'tokens.css must define `--header-height`'
  );
});

test('uikit-css/tokens.css declares --breadcrumbs-height', () => {
  const src = readFileSync(tokensPath, 'utf8');
  assert.match(
    src,
    /--breadcrumbs-height\s*:\s*\d+px\s*;/,
    'tokens.css must define `--breadcrumbs-height` (32px per design)'
  );
});

test('docs styles never inline `height: NNpx` for site-header', () => {
  for (const { file, src } of readAllCss(stylesDir)) {
    // Within `.site-header { ... }` blocks (not the breadcrumb), no
    // bare-px height literal — must be `var(--header-height)`.
    const blocks = src.match(/\.site-header\s*\{[^}]*\}/g) ?? [];
    for (const block of blocks) {
      assert.ok(
        !/height:\s*\d+px/.test(block),
        `${file}: \`.site-header\` block declares a literal pixel height; use \`var(--header-height)\` instead`
      );
    }
  }
});

test('site-breadcrumb height resolves to var(--breadcrumbs-height) without literal fallback', () => {
  for (const { file, src } of readAllCss(stylesDir)) {
    const blocks = src.match(/\.site-breadcrumb\s*\{[^}]*\}/g) ?? [];
    for (const block of blocks) {
      // Forbid `var(--breadcrumbs-height, 32px)` style fallbacks —
      // once the token is real, the fallback is dead weight.
      assert.ok(
        !/var\(--breadcrumbs-height\s*,\s*\d+px\)/.test(block),
        `${file}: drop the literal fallback once \`--breadcrumbs-height\` is pinned in tokens.css`
      );
    }
  }
});
