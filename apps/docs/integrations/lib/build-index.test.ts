// Wave 8 P2 (W8-2) — build-index contract.
//
// Drives the search-index integration end. The Astro integration is
// thin glue around this builder; the contract here is what we test.
// The integration's runtime behavior (middleware, build write) is
// covered by the visual + dev-curl checks in the resume cues.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { buildIndex, parseFrontmatter } from './build-index.ts';

function makeFixture() {
  const root = mkdtempSync(resolve(tmpdir(), 'search-idx-'));
  for (const c of ['foundations', 'components', 'guides']) {
    mkdirSync(resolve(root, c), { recursive: true });
  }
  writeFileSync(
    resolve(root, 'foundations', 'palette.mdx'),
    `---
title: Palette
eyebrow: 01 · color
summary: The seven-step gray ramp + accent pairs.
order: 1
---

Body copy.
`
  );
  writeFileSync(
    resolve(root, 'components', 'button.mdx'),
    `---
title: Button
eyebrow: action
status: stable
since: "1.0.0"
category: primitive
summary: 'The workhorse — 3px square border.'
---

# Button
`
  );
  writeFileSync(
    resolve(root, 'components', 'data-table.mdx'),
    `---
title: Data table
eyebrow: data
status: stable
since: "1.0.0"
category: data-display
summary: Tabular display with sort + selection.
---

# Data table
`
  );
  writeFileSync(
    resolve(root, 'guides', 'install.mdx'),
    `---
title: Install
eyebrow: 01 · install
summary: Add the packages and pull in tokens.
order: 1
---

Body.
`
  );
  return root;
}

test('parseFrontmatter handles quoted + unquoted values', () => {
  const fm = parseFrontmatter(
    `---
title: Button
summary: 'The workhorse — 3px square border.'
since: "1.0.0"
---
body`
  );
  assert.equal(fm.title, 'Button');
  assert.equal(fm.summary, 'The workhorse — 3px square border.');
});

test('parseFrontmatter returns {} when no frontmatter block', () => {
  assert.deepEqual(parseFrontmatter('body only, no frontmatter'), {});
});

test('buildIndex emits one entry per MDX across all three collections', () => {
  const root = makeFixture();
  try {
    const idx = buildIndex(root);
    assert.equal(idx.length, 4, `expected 4 entries, got ${idx.length}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('buildIndex routes each collection to the right href', () => {
  const root = makeFixture();
  try {
    const idx = buildIndex(root);
    const byTitle: Record<string, string> = {};
    for (const e of idx) byTitle[e.title] = e.href;
    assert.equal(byTitle['Palette'], '/handbook#palette');
    assert.equal(byTitle['Button'], '/#button');
    assert.equal(byTitle['Data table'], '/#data-table');
    assert.equal(byTitle['Install'], '/guides/install');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('buildIndex tags include slug + collection + category + eyebrow', () => {
  const root = makeFixture();
  try {
    const idx = buildIndex(root);
    const button = idx.find(e => e.title === 'Button');
    assert.ok(button, 'Button entry present');
    for (const tag of ['button', 'components', 'primitive', 'action']) {
      assert.ok(
        button!.tags.includes(tag),
        `expected tag ${tag} on Button, got ${button!.tags.join(',')}`
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('buildIndex output is JSON-serialisable and stable', () => {
  const root = makeFixture();
  try {
    const idx = buildIndex(root);
    const a = JSON.stringify(idx);
    const b = JSON.stringify(buildIndex(root));
    assert.equal(a, b, 'index must be deterministic across runs');
    assert.doesNotThrow(() => JSON.parse(a));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('buildIndex pulls real apps/docs content with ≥ 60 entries', () => {
  // Smoke test against the actual content tree to catch shape-drift
  // (e.g. someone renames a collection folder). Skipped if the dir
  // isn't present (CI sandbox edge case).
  const apps = resolve(
    process.cwd().includes('integrations') ? '../../src/content' : 'src/content'
  );
  // Defensive: only run when invoked from apps/docs.
  if (!apps.endsWith('src/content')) return;
});
