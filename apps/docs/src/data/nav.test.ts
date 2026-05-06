import { strict as assert } from 'node:assert';
import { test } from 'vitest';
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

test('Primitives section lives at the top of the nav', () => {
  assert.equal(nav[0]?.id, 'primitives');
});

test('guides and foundations sections are gone post · 4.7', () => {
  const ids = nav.map(s => s.id);
  assert.ok(!ids.includes('guides'), 'guides should redirect to /handbook');
  assert.ok(
    !ids.includes('foundations'),
    'foundations should redirect to /handbook'
  );
});

test('nav includes every layered component section', () => {
  const expected = [
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

test('every cmp-* item points to /playground#<slug> with a known slug', () => {
  const componentEntries = flatNav.filter(i => i.id.startsWith('cmp-'));
  assert.equal(
    componentEntries.length,
    knownComponentSlugs.size,
    `nav must have one cmp-* entry per known component (expected ${knownComponentSlugs.size}, got ${componentEntries.length})`
  );
  const PREFIX = '/playground#';
  for (const entry of componentEntries) {
    assert.ok(
      entry.href.startsWith(PREFIX),
      `${entry.id} href ${entry.href} must start with ${PREFIX} (/api retired)`
    );
    const slug = entry.href.slice(PREFIX.length);
    assert.ok(
      knownComponentSlugs.has(slug),
      `${entry.id} points at unknown slug ${slug}`
    );
  }
});

test('non-component nav entries still use absolute, non-anchor hrefs', () => {
  for (const entry of flatNav) {
    if (entry.id.startsWith('cmp-')) continue;
    assert.ok(
      !entry.href.includes('#'),
      `${entry.id} non-component item should have a real route (got ${entry.href})`
    );
  }
});
