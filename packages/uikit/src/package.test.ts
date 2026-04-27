import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(here, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
  main?: string;
  module?: string;
  types?: string;
  exports?: Record<
    string,
    | {
        import?: { types?: string; default?: string };
        require?: { types?: string; default?: string };
      }
    | string
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
    assert.ok(
      entry.import && typeof entry.import === 'object',
      `exports["${sub}"].import must define nested conditions`
    );
    assert.ok(
      entry.require && typeof entry.require === 'object',
      `exports["${sub}"].require must define nested conditions`
    );
    assert.match(
      entry.import.default ?? '',
      /^\.\/dist\/.+\.js$/,
      `exports["${sub}"].import.default must point at a .js under dist`
    );
    assert.match(
      entry.require.default ?? '',
      /^\.\/dist\/.+\.cjs$/,
      `exports["${sub}"].require.default must point at a .cjs under dist`
    );
    assert.match(
      entry.import.types ?? '',
      /^\.\/dist\/.+\.d\.ts$/,
      `exports["${sub}"].import.types must point at a .d.ts under dist`
    );
    assert.match(
      entry.require.types ?? '',
      /^\.\/dist\/.+\.d\.cts$/,
      `exports["${sub}"].require.types must point at a .d.cts under dist`
    );
  }
});

test('package.json keeps sideEffects:false and publish allowlist', () => {
  assert.equal(pkg.sideEffects, false);
  assert.deepEqual(pkg.files, ['dist', 'README.md', 'CHANGELOG.md']);
});
