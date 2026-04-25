// Wave 8 P2 (W8-2) — pure index builder for the static search.
//
// Reads `src/content/{foundations,components,guides}/**/*.mdx`,
// extracts YAML frontmatter, and yields an `IndexEntry[]`. Pure
// function over a content directory: no Astro internals, no
// `getCollection`. The Astro integration (`search-index.ts`) calls
// this from `astro:server:setup` (dev) and `astro:build:done`
// (prod); a unit test calls it against a fixture tree.
//
// Index shape (D3 + spec § "Index shape"):
//
//   { title, summary, tags: string[], href }
//
// - `title`, `summary` come from frontmatter; `description` (if
//   present) folds into summary as a fallback.
// - `tags` collect the slug, collection name, and the category for
//   components.
// - `href` is the route + optional anchor:
//     foundations  → `/handbook#${slug}`
//     components   → `/#${slug}`
//     guides       → `/guides/${slug}`
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface IndexEntry {
  title: string;
  summary: string;
  tags: string[];
  href: string;
}

type Collection = 'foundations' | 'components' | 'guides';

interface Frontmatter {
  title?: string;
  summary?: string;
  description?: string;
  category?: string;
  eyebrow?: string;
}

const FRONTMATTER_RE = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/;

/** Minimal YAML frontmatter reader for our flat schema. We control
 *  the inputs and they all match `key: "value"` / `key: value`
 *  patterns — no nested objects, no anchors, no multi-line scalars
 *  beyond what `summary: |` would need (we don't use that form).
 *  Declines to depend on `gray-matter` for one extra dep + ESM
 *  compatibility footgun. */
export function parseFrontmatter(source: string): Frontmatter {
  const match = source.match(FRONTMATTER_RE);
  if (!match) return {};
  const body = match[1];
  const out: Record<string, string> = {};
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out as Frontmatter;
}

function deriveHref(collection: Collection, slug: string): string {
  switch (collection) {
    case 'foundations':
      return `/handbook#${slug}`;
    case 'components':
      return `/#${slug}`;
    case 'guides':
      return `/guides/${slug}`;
  }
}

function listMdxFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.mdx')) continue;
    out.push(entry.name);
  }
  return out.sort();
}

/** Build the static search index from a content root. `contentRoot`
 *  is the parent of the three collection folders — typically
 *  `apps/docs/src/content`. Returns one entry per MDX file across
 *  the three collections. */
export function buildIndex(contentRoot: string): IndexEntry[] {
  const out: IndexEntry[] = [];
  const collections: Collection[] = ['foundations', 'components', 'guides'];
  for (const collection of collections) {
    const dir = resolve(contentRoot, collection);
    for (const file of listMdxFiles(dir)) {
      const slug = file.replace(/\.mdx$/, '');
      const source = readFileSync(resolve(dir, file), 'utf8');
      const fm = parseFrontmatter(source);
      const summary = fm.summary ?? fm.description ?? '';
      const tags = [slug, collection];
      if (fm.category) tags.push(fm.category);
      if (fm.eyebrow) tags.push(fm.eyebrow);
      out.push({
        title: fm.title ?? slug,
        summary,
        tags,
        href: deriveHref(collection, slug)
      });
    }
  }
  // Stable order: collection then slug.
  out.sort((a, b) => a.href.localeCompare(b.href));
  return out;
}
