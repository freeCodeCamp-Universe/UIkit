// Pure builder for the static search index. Walks `src/content/{foundations,components}/**/*.mdx`
// and emits `IndexEntry[]`. Astro integration in `search-index.ts` wires it into dev + build hooks.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface IndexEntry {
  title: string;
  summary: string;
  tags: string[];
  href: string;
}

type Collection = 'foundations' | 'components';

interface Frontmatter {
  title?: string;
  summary?: string;
  description?: string;
  category?: string;
  eyebrow?: string;
}

const FRONTMATTER_RE = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/;

/** Flat-schema YAML reader: `key: "value"` or `key: value`. No nesting, no multiline. */
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
      return `/playground#${slug}`;
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

/** `contentRoot` = parent of the three collection folders (typically `apps/docs/src/content`). */
export function buildIndex(contentRoot: string): IndexEntry[] {
  const out: IndexEntry[] = [];
  const collections: Collection[] = ['foundations', 'components'];
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
  out.sort((a, b) => a.href.localeCompare(b.href));
  return out;
}
