import { test } from 'vitest';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const swatchPath = resolve(here, 'TokenSwatch.tsx');

test('TokenSwatch.tsx exists at apps/docs/src/components/site/', () => {
  assert.ok(
    existsSync(swatchPath),
    'TokenSwatch.tsx must exist as the runtime token-display island'
  );
});

test('TokenSwatch resolves values via getComputedStyle, not hardcoded hex', () => {
  const src = readFileSync(swatchPath, 'utf8');
  assert.match(
    src,
    /getComputedStyle\(/,
    'TokenSwatch must read values via getComputedStyle()'
  );
  assert.match(
    src,
    /getPropertyValue\(/,
    'TokenSwatch must extract via getPropertyValue()'
  );
  const hexLiterals = src.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  assert.deepEqual(
    hexLiterals,
    [],
    `TokenSwatch must contain zero hex literals; found ${hexLiterals.join(', ')}`
  );
});

test('TokenSwatch re-reads on palette swap via MutationObserver', () => {
  const src = readFileSync(swatchPath, 'utf8');
  assert.match(
    src,
    /MutationObserver/,
    'TokenSwatch must observe documentElement.classList for palette swap'
  );
  assert.match(
    src,
    /attributeFilter:\s*\[[^\]]*['"]class['"]/,
    'MutationObserver must filter on `class` attribute'
  );
});

test('TokenSwatch exports the named TokenSwatch symbol + default', () => {
  const src = readFileSync(swatchPath, 'utf8');
  assert.match(
    src,
    /export\s+function\s+TokenSwatch/,
    'TokenSwatch.tsx must export `TokenSwatch` as a named export'
  );
  assert.match(
    src,
    /export\s+default\s+TokenSwatch/,
    'TokenSwatch.tsx must default-export TokenSwatch for Astro `client:` directives'
  );
});

test('TokenSwatch chip styles bind to var(--name) so hue stays in sync pre-hydration', () => {
  const src = readFileSync(swatchPath, 'utf8');
  assert.match(
    src,
    /background:\s*`var\(\$\{name\}\)`/,
    'chip background must bind to `var(${name})` so SSR paints the live token'
  );
});
