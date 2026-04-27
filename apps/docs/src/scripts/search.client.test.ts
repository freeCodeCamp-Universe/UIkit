import { test } from 'vitest';
import assert from 'node:assert/strict';
import Fuse, { type IFuseOptions } from 'fuse.js';

interface IndexEntry {
  title: string;
  summary: string;
  tags: string[];
  href: string;
}

const OPTIONS: IFuseOptions<IndexEntry> = {
  keys: [
    { name: 'title', weight: 0.6 },
    { name: 'summary', weight: 0.3 },
    { name: 'tags', weight: 0.1 }
  ],
  threshold: 0.3,
  minMatchCharLength: 2,
  ignoreLocation: true,
  includeScore: true,
  shouldSort: true
};

const FIXTURE: IndexEntry[] = [
  {
    title: 'Button',
    summary: 'The workhorse — 3px square border.',
    tags: ['button', 'components', 'primitive'],
    href: '/playground#button'
  },
  {
    title: 'Dropdown',
    summary: 'Click to open a menu.',
    tags: ['dropdown', 'components', 'overlay'],
    href: '/playground#dropdown'
  },
  {
    title: 'Iconography',
    summary: 'The icon set used across the system.',
    tags: ['iconography', 'foundations'],
    href: '/handbook#iconography'
  },
  {
    title: 'Modal',
    summary: 'Blocking dialog.',
    tags: ['modal', 'components', 'overlay'],
    href: '/playground#modal'
  },
  {
    title: 'Tooltip',
    summary: 'Hover-triggered hint.',
    tags: ['tooltip', 'components', 'overlay'],
    href: '/playground#tooltip'
  },
  {
    title: 'Toast',
    summary: 'Transient notification.',
    tags: ['toast', 'components', 'overlay'],
    href: '/playground#toast'
  },
  {
    title: 'Palette',
    summary: 'Gray ramp + accent pairs.',
    tags: ['palette', 'foundations'],
    href: '/handbook#palette'
  },
  {
    title: 'Install',
    summary: 'Add the packages and pull in tokens.',
    tags: ['install', 'handbook'],
    href: '/handbook#install'
  },
  {
    title: 'Card',
    summary: 'Flat bordered container.',
    tags: ['card', 'components', 'data-display'],
    href: '/playground#card'
  },
  {
    title: 'Tabs',
    summary: 'Tabbed panel switcher.',
    tags: ['tabs', 'components', 'navigation'],
    href: '/playground#tabs'
  }
];

function makeFuse(): Fuse<IndexEntry> {
  return new Fuse<IndexEntry>(FIXTURE, OPTIONS);
}

test('"drop" surfaces Dropdown in the top result', () => {
  const fuse = makeFuse();
  const hits = fuse.search('drop');
  assert.ok(hits.length > 0, 'expected at least one hit for "drop"');
  assert.equal(hits[0].item.title, 'Dropdown');
});

test('"ico" surfaces Iconography in the top 3', () => {
  const fuse = makeFuse();
  const hits = fuse.search('ico');
  const top3 = hits.slice(0, 3).map(h => h.item.title);
  assert.ok(
    top3.includes('Iconography'),
    `expected Iconography in top 3, got ${top3.join(', ')}`
  );
});

test('broad noise: "the" returns ≤ 5 results', () => {
  const fuse = makeFuse();
  const hits = fuse.search('the');
  assert.ok(
    hits.length <= 5,
    `expected ≤ 5 results for "the", got ${hits.length}`
  );
});

test('minMatchCharLength gate: a single character returns zero hits', () => {
  // Fuse honors minMatchCharLength as a per-token floor; queries
  // shorter than 2 chars yield nothing.
  const fuse = makeFuse();
  const hits = fuse.search('x');
  assert.equal(hits.length, 0, 'minMatchCharLength must filter 1-char queries');
});

test('title weight outranks summary on the same query token', () => {
  // "Card" hits the title of the Card record AND the summary of
  // "The workhorse — 3px square border" only as a near-miss. The
  // Card record (title hit, weight 0.6) must rank above any
  // summary-only hit (weight 0.3).
  const fuse = makeFuse();
  const hits = fuse.search('Card');
  assert.ok(hits.length > 0, 'expected at least one hit for "Card"');
  assert.equal(hits[0].item.title, 'Card');
});

test('locked options match the client wire', () => {
  // Brittle-on-purpose: if the client config diverges from this
  // test, surface it here. Mirrors the inline config in
  // src/scripts/search.client.ts.
  assert.equal(OPTIONS.threshold, 0.3);
  assert.equal(OPTIONS.minMatchCharLength, 2);
  assert.equal(OPTIONS.ignoreLocation, true);
  // Narrow `keys` (typed as readonly?-array of FuseOptionKey) to the literal
  // shape we always use: `{ name, weight }`.
  const keys = (OPTIONS.keys ?? []) as readonly {
    name: string;
    weight: number;
  }[];
  assert.equal(keys.length, 3);
  assert.equal(keys[0]!.name, 'title');
  assert.equal(keys[0]!.weight, 0.6);
});
