import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { nav, flatNav } from './nav.ts';
import { knownComponentSlugs } from './knownComponents.ts';

test('nav sections are non-empty', () => {
  assert.ok(nav.length > 0);
  for (const section of nav) {
    assert.ok(section.id.length > 0, `section ${section.label} missing id`);
    assert.ok(section.items.length > 0, `section ${section.label} empty`);
  }
});

test('flatNav contains every item', () => {
  const expected = nav.reduce((sum, s) => sum + s.items.length, 0);
  assert.equal(flatNav.length, expected);
});

test('flatNav entries carry section id', () => {
  for (const entry of flatNav) {
    assert.ok(entry.section.length > 0);
    assert.ok(entry.id.length > 0);
    assert.ok(entry.label.length > 0);
  }
});

test('nav ids are unique across all items', () => {
  const ids = flatNav.map(i => i.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every nav item carries an href', () => {
  for (const entry of flatNav) {
    assert.ok(entry.href.length > 0, `${entry.id} missing href`);
    assert.ok(
      entry.href.startsWith('/'),
      `${entry.id} href "${entry.href}" must be absolute`
    );
  }
});

test('Guides section lives at the top of the nav', () => {
  assert.equal(nav[0]?.id, 'guides');
  const labels = nav[0]?.items.map(i => i.label);
  assert.deepEqual(labels, ['Overview', 'Use via CDN', 'Copy & vendor']);
});

test('Foundations section lists every pillar', () => {
  const foundations = nav.find(s => s.id === 'foundations');
  assert.ok(foundations, 'foundations section missing');
  const labels = foundations.items.map(i => i.label);
  assert.deepEqual(labels, [
    'Colors',
    'Typography',
    'Spacing',
    'Iconography',
    'Motion',
    'Voice'
  ]);
  for (const item of foundations.items) {
    assert.match(item.href, /^\/foundations\//);
  }
});

test('nav includes every layered component section', () => {
  const expected = [
    'guides',
    'foundations',
    'primitives',
    'actions',
    'forms',
    'navigation',
    'overlays',
    'feedback',
    'data-display',
    'layouts'
  ];
  const actual = nav.map(s => s.id);
  for (const id of expected) {
    assert.ok(actual.includes(id), `nav missing section ${id}`);
  }
});

test('no nav item has an anchor-only href', () => {
  for (const entry of flatNav) {
    assert.ok(
      !entry.href.startsWith('/#'),
      `${entry.id} still uses anchor-only href ${entry.href}`
    );
  }
});

test('every cmp-* item points to /components/<slug> with a known slug', () => {
  const componentEntries = flatNav.filter(i => i.id.startsWith('cmp-'));
  assert.ok(
    componentEntries.length >= 40,
    `expected 40+ component entries, got ${componentEntries.length}`
  );
  for (const entry of componentEntries) {
    assert.ok(
      entry.href.startsWith('/components/'),
      `${entry.id} href ${entry.href} must start with /components/`
    );
    const slug = entry.href.slice('/components/'.length);
    assert.ok(
      knownComponentSlugs.has(slug),
      `${entry.id} points at unknown slug ${slug}`
    );
  }
});
