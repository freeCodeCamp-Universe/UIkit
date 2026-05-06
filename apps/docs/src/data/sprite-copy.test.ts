import { test } from 'vitest';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..', '..');
const monorepoRoot = resolve(appRoot, '..', '..');

const ASSETS = [
  {
    name: 'sprite.svg',
    upstream: 'packages/uikit-icons/dist/sprite.svg'
  },
  {
    name: 'uikit.global.js',
    upstream: 'packages/uikit-js/dist/uikit.global.js'
  }
] as const;

const allUpstreamPresent = ASSETS.every(a =>
  existsSync(resolve(monorepoRoot, a.upstream))
);

test('copy-sprite.mjs runs to completion without error', t => {
  if (!allUpstreamPresent) {
    t.skip(
      'upstream dists missing; run `pnpm build` first (turbo ^build would cover this in CI)'
    );
    return;
  }
  const res = spawnSync(
    process.execPath,
    [resolve(appRoot, 'scripts/copy-sprite.mjs')],
    { cwd: appRoot, encoding: 'utf8' }
  );
  assert.equal(
    res.status,
    0,
    `copy-sprite.mjs must exit 0; stderr:\n${res.stderr}`
  );
});

test('copy-sprite emits non-empty assets under public/uikit/', t => {
  if (!allUpstreamPresent) {
    t.skip('upstream dists missing; run `pnpm build` first');
    return;
  }
  for (const asset of ASSETS) {
    const dest = resolve(appRoot, 'public/uikit', asset.name);
    assert.ok(
      existsSync(dest),
      `${asset.name} must exist at public/uikit/ after copy-sprite runs`
    );
    const size = statSync(dest).size;
    assert.ok(size > 0, `${asset.name} must be non-empty (got ${size}B)`);

    // Copy must match source byte size — guards against truncated writes.
    const srcSize = statSync(resolve(monorepoRoot, asset.upstream)).size;
    assert.equal(
      size,
      srcSize,
      `${asset.name} dest size (${size}B) must equal upstream source size (${srcSize}B)`
    );
  }
});
