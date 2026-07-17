import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as {
  private?: boolean;
  version?: string;
  publishConfig?: unknown;
  files?: string[];
  sideEffects?: boolean;
  scripts?: Record<string, string>;
  exports?: Record<string, string>;
};

const LAYER_SUBPATHS = [
  '.',
  './primitives',
  './forms',
  './overlays',
  './navigation',
  './data-display',
  './layouts',
  './games'
] as const;

test('package is private — distribution is copy-source, not npm', () => {
  assert.equal(pkg.private, true);
  assert.equal(pkg.publishConfig, undefined);
  assert.equal(pkg.files, undefined);
});

test('package.json keeps a semver version (release.yml CDN pathing reads it)', () => {
  assert.match(pkg.version ?? '', /^\d+\.\d+\.\d+$/);
});

test('exports map ships each layer as TypeScript source', () => {
  const exports = pkg.exports;
  assert.ok(exports, 'exports map must be defined');
  for (const sub of LAYER_SUBPATHS) {
    const entry = exports[sub];
    assert.ok(
      typeof entry === 'string' && /^\.\/src\/.*index\.ts$/.test(entry),
      `exports["${sub}"] must point at a src index.ts (got ${String(entry)})`
    );
    assert.ok(
      existsSync(join(pkgRoot, entry)),
      `exports["${sub}"] target ${entry} must exist`
    );
  }
});

test('props.json stays exported for the docs/registry pipeline', () => {
  assert.equal(pkg.exports?.['./props.json'], './dist/props.json');
  assert.match(pkg.scripts?.build ?? '', /gen-props\.mjs/);
});

test('keeps sideEffects:false', () => {
  assert.equal(pkg.sideEffects, false);
});
