import type Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';

interface IndexEntry {
  title: string;
  summary: string;
  tags: string[];
  href: string;
}

const FUSE_OPTIONS: IFuseOptions<IndexEntry> = {
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

const SAFE_SCHEMES = /^(https?:|\/|#|mailto:|tel:)/i;

function safeHref(href: string): string | null {
  if (!SAFE_SCHEMES.test(href)) {
    if (typeof console !== 'undefined') {
      console.warn(`[search] rejected href: ${href}`);
    }
    return null;
  }
  return href;
}

function makeListItem(klass: string, message: string): HTMLLIElement {
  const li = document.createElement('li');
  li.className = klass;
  li.textContent = message;
  return li;
}

function renderHint(list: HTMLElement, message: string): void {
  list.replaceChildren(makeListItem('search-results__hint', message));
}

function renderError(list: HTMLElement, message: string): void {
  list.replaceChildren(makeListItem('search-results__error', message));
}

function renderResult(
  entry: IndexEntry,
  score: number | undefined,
  debug: boolean
): HTMLLIElement | null {
  const safe = safeHref(entry.href);
  if (!safe) return null;
  const li = document.createElement('li');
  li.className = 'search-results__item';
  li.setAttribute('data-search-result', '');

  const link = document.createElement('a');
  link.className = 'search-results__link';
  link.href = safe;

  const title = document.createElement('span');
  title.className = 'search-results__title';
  title.textContent = entry.title;
  link.appendChild(title);

  if (entry.summary) {
    const summary = document.createElement('span');
    summary.className = 'search-results__summary';
    summary.textContent = entry.summary;
    link.appendChild(summary);
  }

  if (debug && typeof score === 'number') {
    const scoreEl = document.createElement('span');
    scoreEl.className = 'search-results__score';
    scoreEl.textContent = ` (${score.toFixed(3)})`;
    link.appendChild(scoreEl);
  }

  li.appendChild(link);
  return li;
}

export interface WireOptions {
  /** Override the index URL (test harness uses an in-memory blob URL). */
  indexUrl?: string;
}

export async function wireSearch(
  input: HTMLInputElement,
  list: HTMLElement,
  options: WireOptions = {}
): Promise<void> {
  let fuse: Fuse<IndexEntry> | null = null;
  let pending: Promise<Fuse<IndexEntry>> | null = null;
  const debug =
    typeof window !== 'undefined' &&
    typeof URLSearchParams !== 'undefined' &&
    new URLSearchParams(window.location.search).get('fuse_debug') === '1' &&
    Boolean(import.meta.env?.DEV);
  const indexUrl = options.indexUrl ?? '/search-index.json';

  async function ensureFuse(): Promise<Fuse<IndexEntry>> {
    if (fuse) return fuse;
    if (pending) return pending;
    pending = (async () => {
      const FuseModule = await import('fuse.js');
      const FuseCtor = FuseModule.default;
      let entries: IndexEntry[] = [];
      try {
        const response = await fetch(indexUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        entries = await response.json();
      } catch (err) {
        renderError(list, 'Search unavailable. Try again.');
        if (typeof console !== 'undefined') {
          console.warn(
            `[search] index fetch failed: ${(err as Error).message}`
          );
        }
        throw err;
      }
      fuse = new FuseCtor<IndexEntry>(entries, FUSE_OPTIONS);
      return fuse;
    })();
    return pending;
  }

  function runQuery(query: string): void {
    const trimmed = query.trim();
    if (trimmed.length < (FUSE_OPTIONS.minMatchCharLength ?? 0)) {
      renderHint(list, 'Type at least 2 characters…');
      return;
    }
    if (!fuse) return;
    const hits = fuse.search(trimmed);
    if (hits.length === 0) {
      renderHint(list, 'No results.');
      return;
    }
    const next: HTMLLIElement[] = [];
    for (const hit of hits) {
      const li = renderResult(hit.item, hit.score, debug);
      if (li) next.push(li);
    }
    list.replaceChildren(...next);
  }

  input.addEventListener('focus', () => {
    void ensureFuse().then(() => runQuery(input.value));
  });
  input.addEventListener('input', () => {
    if (!fuse) {
      void ensureFuse().then(() => runQuery(input.value));
      return;
    }
    runQuery(input.value);
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector<HTMLInputElement>(
      '[data-search-input]'
    );
    const list = document.querySelector<HTMLElement>('[data-search-results]');
    if (!input || !list) return;
    void wireSearch(input, list);
  });
}
