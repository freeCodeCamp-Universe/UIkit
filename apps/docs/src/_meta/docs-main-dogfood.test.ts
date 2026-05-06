import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const docsSrc = resolve(here, '..');
const showcaseCssPath = resolve(docsSrc, 'styles/showcase.css');

const files = [
  'layouts/ProseLayout.astro',
  'pages/handbook.astro',
  'pages/playground.astro',
  'pages/index.astro'
];

test('docs main columns dogfood the UIKit SidebarLayout overflow guard', () => {
  for (const file of files) {
    const src = readFileSync(resolve(docsSrc, file), 'utf8');
    assert.match(
      src,
      /<main\s+class='content sidebar-layout__main'/,
      `${file} main must use the UIKit SidebarLayout main class for horizontal containment`
    );
  }
});

test('docs header does not keep legacy bespoke search or theme button chrome', () => {
  const src = readFileSync(showcaseCssPath, 'utf8');
  assert.doesNotMatch(src, /\.site-search\b/);
  assert.doesNotMatch(src, /\.site-search--button\b/);
  assert.doesNotMatch(src, /\.theme-swap\b/);
});
