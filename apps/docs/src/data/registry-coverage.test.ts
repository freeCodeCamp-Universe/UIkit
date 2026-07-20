// Registry integrity: every known component must be fully servable by the
// copy-source registry, and the CSS aggregator must stay in lockstep with
// the colocated per-component files.
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { knownComponentSlugs } from './knownComponents';
import {
  componentItem,
  componentSource,
  htmlSnippet,
  nonComponentItems,
  reactSnippet
} from '../lib/registry';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..', '..');
const repoRoot = resolve(appRoot, '..', '..');
const contentDir = resolve(appRoot, 'src', 'content', 'components');
const aggregatorPath = resolve(
  repoRoot,
  'packages',
  'uikit-css',
  'src',
  'components.css'
);

const meta = { title: 'x', summary: 'x', category: 'x' };
const nonComponentNames = new Set(nonComponentItems().map(i => i.name));

for (const slug of knownComponentSlugs) {
  test(`registry coverage - ${slug}`, () => {
    const source = componentSource(slug);
    assert.ok(
      source,
      `${slug}: no <Pascal>.tsx found under packages/uikit/src`
    );

    const item = componentItem(slug, meta);
    assert.ok(item, `${slug}: componentItem() returned null`);

    const cssFile = item.files.find(f => f.lang === 'css');
    assert.ok(
      cssFile && existsSync(cssFile.absPath),
      `${slug}: colocated ${slug}.css missing - every component ships its CSS`
    );

    assert.ok(
      existsSync(resolve(contentDir, `${slug}.mdx`)),
      `${slug}: MDX docs entry missing`
    );

    assert.ok(
      htmlSnippet(slug),
      `${slug}: showcase html snippet missing (slot='html')`
    );
    assert.ok(
      reactSnippet(slug),
      `${slug}: showcase react snippet missing (slot='react')`
    );

    for (const dep of item.registryDependencies) {
      assert.ok(
        dep === 'theme' || nonComponentNames.has(dep) || componentSource(dep),
        `${slug}: registry dependency "${dep}" does not resolve to any item`
      );
    }
  });
}

test('aggregator components.css imports every component css exactly once', () => {
  const aggregator = readFileSync(aggregatorPath, 'utf8');
  const imports = [...aggregator.matchAll(/@import\s+'([^']+)';/g)].map(
    m => m[1]
  );

  assert.equal(
    new Set(imports).size,
    imports.length,
    'duplicate @import in aggregator'
  );

  for (const slug of knownComponentSlugs) {
    const source = componentSource(slug);
    if (!source) continue;
    const expected = `../../uikit/src/${source.category}/${slug}.css`;
    assert.ok(
      imports.includes(expected),
      `aggregator missing import for ${slug} (${expected})`
    );
  }

  for (const imp of imports) {
    assert.ok(
      existsSync(resolve(dirname(aggregatorPath), imp)),
      `aggregator import does not resolve: ${imp}`
    );
  }
});

test('every non-component registry item file exists on disk', () => {
  for (const item of nonComponentItems()) {
    for (const file of item.files) {
      assert.ok(
        existsSync(file.absPath),
        `${item.name}: file missing on disk - ${file.absPath}`
      );
    }
  }
});

test('llms-full source payload stays under budget (icons map excluded)', () => {
  let bytes = 0;
  for (const slug of knownComponentSlugs) {
    const item = componentItem(slug, meta);
    if (!item) continue;
    for (const f of item.files) bytes += readFileSync(f.absPath, 'utf8').length;
  }
  for (const item of nonComponentItems()) {
    for (const f of item.files) {
      if (item.name === 'icons' && f.name === 'icons.ts') continue;
      bytes += readFileSync(f.absPath, 'utf8').length;
    }
  }
  // Embedded sources dominate llms-full.txt; keep the dump agent-friendly.
  assert.ok(
    bytes < 800_000,
    `registry source payload is ${bytes} bytes - llms-full.txt is drifting past its ~1 MB budget`
  );
});
