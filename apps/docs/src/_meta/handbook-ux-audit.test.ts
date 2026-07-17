import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const docsSrc = resolve(here, '..');
const repoRoot = resolve(here, '../../../..');
const tokensCssPath = resolve(repoRoot, 'packages/uikit-css/src/tokens.css');
const showcaseCssPath = resolve(docsSrc, 'styles/showcase.css');
const siteFoundationsCssPath = resolve(docsSrc, 'styles/site-foundations.css');

const readDocs = (path: string): string =>
  readFileSync(resolve(docsSrc, path), 'utf8');

test('handbook visual adapters do not carry bespoke CSS outside UIKit CSS', () => {
  const adapters = [
    'components/foundations/TypeSpecimen.astro',
    'components/foundations/SwatchGrid.astro',
    'components/foundations/PaletteGallery.astro',
    'components/foundations/SpacingRuler.astro',
    'components/foundations/MotionDemo.astro',
    'components/handbook/Brand.astro',
    'components/site/DoDont.astro',
    'pages/handbook.astro'
  ];

  for (const adapter of adapters) {
    assert.doesNotMatch(
      readDocs(adapter),
      /<style\b/,
      `${adapter} must compose UIKit CSS classes instead of defining page-local styles`
    );
  }
});

test('site-foundations.css owns the handbook specimen and guidance classes', () => {
  const src = readFileSync(siteFoundationsCssPath, 'utf8');

  for (const selector of [
    '.type-specimens',
    '.foundation-swatches',
    '.icon-preview',
    '.palette-gallery',
    '.ruler',
    '.motion-demos',
    '.dodont',
    '.brand-marks',
    '.brand-clear',
    '.brand-wordmark'
  ]) {
    assert.match(src, new RegExp(`${selector.replace('.', '\\.')}\\b`));
  }
});

test('handbook prose tables dogfood the UIKit data-table scrollport', () => {
  for (const file of [
    'content/foundations/motion.mdx',
    'content/foundations/voice.mdx',
    'content/foundations/brand.mdx'
  ]) {
    const src = readDocs(file);
    assert.match(
      src,
      /class='data-table'/,
      `${file} must wrap dense tables in the UIKit data-table scrollport`
    );
    assert.doesNotMatch(
      src,
      /^\|/m,
      `${file} should not rely on unclassified markdown tables in the handbook`
    );
  }
});

test('UIKit inline code can wrap long URLs and package commands', () => {
  const src = readFileSync(tokensCssPath, 'utf8');
  const rule = src.match(/:not\(pre\)\s*>\s*code\s*\{[^}]*\}/)?.[0] ?? '';

  assert.match(rule, /overflow-wrap:\s*anywhere\s*;/);
  assert.match(rule, /word-break:\s*break-word\s*;/);
});

test('docs sidebar offset accounts for the breadcrumb bar', () => {
  const src = readFileSync(showcaseCssPath, 'utf8');

  assert.match(
    src,
    /--sidebar-top:\s*calc\(var\(--header-height\)\s*\+\s*var\(--breadcrumbs-height\)\)\s*;/,
    'the sticky sidebar must start below both the header and breadcrumb bars'
  );
});
