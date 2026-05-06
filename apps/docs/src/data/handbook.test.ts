import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const foundationsDir = resolve(here, '..', 'content', 'foundations');
const handbookPagePath = resolve(here, '..', 'pages', 'handbook.astro');

const files = readdirSync(foundationsDir).filter(name => name.endsWith('.mdx'));

test('at least 8 foundations entries', () => {
  assert.ok(
    files.length >= 8,
    `expected >= 8 foundations MDX entries, got ${files.length} (${files.join(', ')})`
  );
});

test('every foundations entry declares title, eyebrow, summary, order', () => {
  for (const file of files) {
    const src = readFileSync(resolve(foundationsDir, file), 'utf8');
    const fmMatch = src.match(/^---\s*\n([\s\S]*?)\n---/);
    assert.ok(fmMatch, `${file} must start with --- frontmatter ---`);
    const fm = fmMatch[1];
    for (const key of ['title', 'eyebrow', 'summary', 'order']) {
      assert.match(
        fm,
        new RegExp(`^${key}:`, 'm'),
        `${file} frontmatter missing required key: ${key}`
      );
    }
  }
});

test('every foundations entry contains at least one ## heading', () => {
  for (const file of files) {
    const src = readFileSync(resolve(foundationsDir, file), 'utf8');
    assert.match(
      src,
      /^## /m,
      `${file} must contain at least one '## ' heading so the page TOC has anchors`
    );
  }
});

test('foundations orders are unique positive integers', () => {
  const orders = new Map<number, string>();
  for (const file of files) {
    const src = readFileSync(resolve(foundationsDir, file), 'utf8');
    const match = src.match(/^order:\s*(\d+)/m);
    assert.ok(match, `${file} must declare a numeric order`);
    const n = Number(match[1]);
    assert.ok(
      Number.isInteger(n) && n > 0,
      `${file} order must be a positive integer, got ${match[1]}`
    );
    assert.ok(
      !orders.has(n),
      `${file} reuses order ${n} (also: ${orders.get(n)})`
    );
    orders.set(n, file);
  }
});

test('at least 3 entries cover Voice / Logo / Iconography', () => {
  const TARGETS = ['Voice', 'Logo', 'Iconography'];
  const matched = new Set<string>();
  for (const file of files) {
    const src = readFileSync(resolve(foundationsDir, file), 'utf8');
    for (const t of TARGETS) {
      const re = new RegExp(`\\b${t}\\b`);
      if (re.test(src)) matched.add(t);
    }
  }
  assert.ok(
    matched.size >= 3,
    `expected files covering Voice + Logo + Iconography; matched only [${[...matched].join(', ')}]`
  );
});

test('a brand-guidelines entry exists (logo usage / wordmark)', () => {
  const found = files.some(file => {
    const src = readFileSync(resolve(foundationsDir, file), 'utf8');
    return /\b(Logo|Wordmark|Brand)\b/i.test(src);
  });
  assert.ok(
    found,
    'expected a foundations entry covering Brand / Logo / Wordmark'
  );
});

test('a do/donts entry exists (cross-cutting examples)', () => {
  const found = files.some(file => {
    const src = readFileSync(resolve(foundationsDir, file), 'utf8');
    return /(Do(?:n[''’]?t)?\s*\/\s*Don[''’]?t|Do\b.+?Don[''’]?t|## Do\b)/i.test(
      src
    );
  });
  assert.ok(
    found,
    'expected a foundations entry with a Do / Don’t section (cross-cutting visual rules)'
  );
});

test('handbook page uses handbook navigation, not playground component navigation', () => {
  const src = readFileSync(handbookPagePath, 'utf8');
  assert.doesNotMatch(
    src,
    /import\s+AppSidebar\b/,
    'handbook must not import the playground AppSidebar'
  );
  assert.match(
    src,
    /HandbookSidebar/,
    'handbook must render a handbook-specific Sidebar built from handbook links'
  );
});

test('handbook foundations render from collection metadata', () => {
  const src = readFileSync(handbookPagePath, 'utf8');
  assert.match(
    src,
    /getCollection\('foundations'\)/,
    'handbook must load foundations from the Astro content collection'
  );
  assert.doesNotMatch(
    src,
    /function\s+loadFoundation/,
    'handbook must not hardcode each foundation loader'
  );
  assert.doesNotMatch(
    src,
    /Foundation\s*·\s*00/,
    'handbook section eyebrows must come from foundation frontmatter'
  );
});

test('handbook main column dogfoods the UIKit sidebar layout scroll guard', () => {
  const src = readFileSync(handbookPagePath, 'utf8');
  assert.match(
    src,
    /<main\s+class='content sidebar-layout__main'/,
    'handbook main must use the UIKit SidebarLayout main class instead of page-specific overflow CSS'
  );
});
