// Wave 2 dogfood invariants. Docs site must consume its own vanilla JS
// bundle and ship the icon sprite at the canonical `/uikit/` route, or
// Tier 4 demo pages (dialog, pagination, listbox, combobox) render as
// inert markup. These are cheap string-level checks — see copy-sprite.mjs
// for the build-time sprite plumbing they enforce.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..', '..');
const monorepoRoot = resolve(appRoot, '..', '..');

test('docs declares @freecodecamp/uikit-js as a workspace dependency', () => {
  const pkg = JSON.parse(
    readFileSync(resolve(appRoot, 'package.json'), 'utf8')
  );
  const version = (pkg.dependencies ?? {})['@freecodecamp/uikit-js'];
  assert.ok(
    version,
    'apps/docs/package.json must list @freecodecamp/uikit-js as a dependency'
  );
  assert.match(
    version,
    /^workspace:/,
    'uikit-js must be consumed via workspace:, not a pinned version'
  );
});

test('BaseLayout loads uikit.global.js via a plain <script src> tag', () => {
  const layout = readFileSync(
    resolve(appRoot, 'src/layouts/BaseLayout.astro'),
    'utf8'
  );
  assert.match(
    layout,
    /<script\s+src=["']\/uikit\/uikit\.global\.js["']/,
    'BaseLayout.astro must load /uikit/uikit.global.js via plain <script src> so Astro does not tree-shake the side-effect import'
  );
  assert.match(
    layout,
    /defer/,
    'uikit.global.js script tag must be deferred so the IIFE runs after DOM parse'
  );
});

test('copy-sprite.mjs copies both sprite and uikit.global.js to public/uikit/', () => {
  const script = readFileSync(
    resolve(appRoot, 'scripts/copy-sprite.mjs'),
    'utf8'
  );
  assert.match(script, /packages\/uikit-icons\/dist\/sprite\.svg/);
  assert.match(script, /public\/uikit\/sprite\.svg/);
  assert.match(script, /packages\/uikit-js\/dist\/uikit\.global\.js/);
  assert.match(script, /public\/uikit\/uikit\.global\.js/);
});

test('predev and prebuild hooks run the sprite copy before Astro starts', () => {
  const pkg = JSON.parse(
    readFileSync(resolve(appRoot, 'package.json'), 'utf8')
  );
  for (const hook of ['predev', 'prebuild']) {
    assert.match(
      pkg.scripts?.[hook] ?? '',
      /copy-sprite/,
      `apps/docs/package.json needs a ${hook} hook invoking copy-sprite`
    );
  }
});

test('monorepo root package exists so relative resolution is sane', () => {
  const root = JSON.parse(
    readFileSync(resolve(monorepoRoot, 'package.json'), 'utf8')
  );
  assert.ok(root.name, 'monorepo package.json must have a name');
});
