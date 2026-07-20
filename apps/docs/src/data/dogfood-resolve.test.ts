import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..', '..');
const monorepoRoot = resolve(appRoot, '..', '..');

const PACKAGES_WITH_TS_INDEX = [
  'uikit',
  'uikit-icons',
  'uikit-js',
  'uikit-tailwind'
] as const;

test('tsconfig.json maps each TS package to packages/<name>/src/index.ts', () => {
  const raw = readFileSync(resolve(appRoot, 'tsconfig.json'), 'utf8');
  const tsconfig = JSON.parse(raw);
  const paths = tsconfig.compilerOptions?.paths ?? {};
  for (const pkg of PACKAGES_WITH_TS_INDEX) {
    const key = `@freecodecamp/${pkg}`;
    assert.ok(
      paths[key],
      `tsconfig.json compilerOptions.paths must declare "${key}"`
    );
    const target = paths[key][0];
    assert.match(
      target,
      new RegExp(`packages/${pkg}/src/index\\.ts$`),
      `${key} must resolve to packages/${pkg}/src/index.ts (got ${target})`
    );
  }
});

test('tsconfig.json adds wildcard paths for uikit + uikit-icons', () => {
  const tsconfig = JSON.parse(
    readFileSync(resolve(appRoot, 'tsconfig.json'), 'utf8')
  );
  const paths = tsconfig.compilerOptions?.paths ?? {};
  for (const pkg of ['uikit', 'uikit-icons']) {
    const key = `@freecodecamp/${pkg}/*`;
    assert.ok(paths[key], `tsconfig.json paths must declare "${key}"`);
    assert.match(paths[key][0], new RegExp(`packages/${pkg}/src/\\*$`));
  }
});

test('astro.config.mjs declares vite.resolve.alias for the four TS packages', () => {
  const cfg = readFileSync(resolve(appRoot, 'astro.config.mjs'), 'utf8');
  assert.match(
    cfg,
    /fileURLToPath/,
    'astro.config.mjs must use fileURLToPath for portable absolute aliases'
  );
  for (const pkg of PACKAGES_WITH_TS_INDEX) {
    assert.match(
      cfg,
      new RegExp(`@freecodecamp\\\\?/${pkg}`),
      `astro.config.mjs vite.resolve.alias must reference @freecodecamp/${pkg}`
    );
  }
});

test('astro.config.mjs allows Vite filesystem access into the monorepo', () => {
  const cfg = readFileSync(resolve(appRoot, 'astro.config.mjs'), 'utf8');
  assert.match(
    cfg,
    /fs\s*:\s*\{[^}]*allow/s,
    'astro.config.mjs must declare vite.server.fs.allow so Vite can read sibling packages'
  );
  assert.match(
    cfg,
    /['"]\.\.\/\.\.['"]/,
    "vite.server.fs.allow must include the monorepo root ('../..')"
  );
});

test('astro.config.mjs marks the React-bearing uikit packages as ssr.noExternal', () => {
  const cfg = readFileSync(resolve(appRoot, 'astro.config.mjs'), 'utf8');
  assert.match(
    cfg,
    /noExternal[^}]*@freecodecamp\/uikit/s,
    'astro.config.mjs must include @freecodecamp/uikit in vite.ssr.noExternal so SSR can render its JSX'
  );
});

test('each path target actually exists on disk', () => {
  for (const pkg of PACKAGES_WITH_TS_INDEX) {
    const target = resolve(monorepoRoot, 'packages', pkg, 'src', 'index.ts');
    assert.ok(
      existsSync(target),
      `expected ${target} to exist - packages/${pkg}/src/index.ts is the dogfood entry point`
    );
  }
});
