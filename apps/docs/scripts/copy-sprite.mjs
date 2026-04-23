#!/usr/bin/env node
/**
 * Copy workspace dogfood assets into apps/docs/public/uikit/ so Astro
 * serves them verbatim at `/uikit/<file>` in both dev and build:
 *
 *   packages/uikit-icons/dist/sprite.svg    -> public/uikit/sprite.svg
 *   packages/uikit-js/dist/uikit.global.js  -> public/uikit/uikit.global.js
 *
 * We load the IIFE via a plain <script src> (not an Astro-hoisted import)
 * because Astro tree-shakes side-effect-only module imports in layouts,
 * which kills DOMContentLoaded wiring for the Tier 4 adapters.
 *
 * Runs via predev + prebuild hooks. Dev-tolerant: if an upstream dist
 * hasn't been built yet (fresh clone, no turbo build), emit a warning
 * and skip that asset — the dev server still boots.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const monorepoRoot = path.resolve(appRoot, '..', '..');

const assets = [
  {
    src: path.resolve(monorepoRoot, 'packages/uikit-icons/dist/sprite.svg'),
    dest: path.resolve(appRoot, 'public/uikit/sprite.svg'),
    hint: "run 'pnpm --filter @freecodecamp/uikit-icons build'"
  },
  {
    src: path.resolve(monorepoRoot, 'packages/uikit-js/dist/uikit.global.js'),
    dest: path.resolve(appRoot, 'public/uikit/uikit.global.js'),
    hint: "run 'pnpm --filter @freecodecamp/uikit-js build'"
  }
];

async function copyOne({ src, dest, hint }) {
  try {
    await fs.access(src);
  } catch {
    console.warn(
      `[docs:copy-sprite] missing ${path.relative(monorepoRoot, src)}; ${hint}. Skipping.`
    );
    return;
  }
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
  const stat = await fs.stat(dest);
  console.log(
    `[docs:copy-sprite] wrote ${path.relative(monorepoRoot, dest)} (${stat.size}B)`
  );
}

async function main() {
  for (const asset of assets) {
    await copyOne(asset);
  }
}

main().catch(err => {
  console.error('[docs:copy-sprite] failed:', err);
  process.exit(1);
});
