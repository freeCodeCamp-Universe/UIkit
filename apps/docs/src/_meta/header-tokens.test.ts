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
      assert.ok(
        !/var\(--breadcrumbs-height\s*,\s*\d+px\)/.test(block),
        `${file}: drop the literal fallback once \`--breadcrumbs-height\` is pinned in tokens.css`
      );
    }
  }
});
