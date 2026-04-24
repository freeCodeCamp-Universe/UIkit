import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Pins the publish contract: main/module/types + per-layer exports map.
// Ensures the uikit npm entry wiring does not regress before the Wave 5 cut.

const here = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(here, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
  main?: string;
  module?: string;
  types?: string;
  exports?: Record<
    string,
    { import?: string; require?: string; types?: string } | string
  >;
  sideEffects?: boolean;
  files?: string[];
};

const LAYER_SUBPATHS = [
  '.',
  './primitives',
  './forms',
  './overlays',
  './navigation',
  './data-display',
  './layouts'
] as const;

test('package.json declares main/module/types at dist root', () => {
  assert.equal(pkg.main, './dist/index.cjs');
  assert.equal(pkg.module, './dist/index.js');
  assert.equal(pkg.types, './dist/index.d.ts');
});

test('package.json exports map ships each layer', () => {
  const exports = pkg.exports;
  assert.ok(exports, 'exports map must be defined');
  for (const sub of LAYER_SUBPATHS) {
    const entry = exports[sub];
    assert.ok(
      entry && typeof entry === 'object',
      `exports["${sub}"] must be a conditional object`
    );
    assert.match(
      entry.import ?? '',
      /^\.\/dist\/.+\.js$/,
      `exports["${sub}"].import must point at a .js under dist`
    );
    assert.match(
      entry.require ?? '',
      /^\.\/dist\/.+\.cjs$/,
      `exports["${sub}"].require must point at a .cjs under dist`
    );
    assert.match(
      entry.types ?? '',
      /^\.\/dist\/.+\.d\.ts$/,
      `exports["${sub}"].types must point at a .d.ts under dist`
    );
  }
});

test('package.json keeps sideEffects:false and dist+src files', () => {
  assert.equal(pkg.sideEffects, false);
  assert.deepEqual(pkg.files, ['dist', 'src']);
});
