// Pagination adapter — wires [data-uikit-pagination] roots to page
// switching with keyboard navigation.
//
// Placeholder note: the long-term design substitutes the
// @zag-js/pagination state machine so behaviour matches the React
// layer bit-for-bit. For the Phase 2D first ship we hand-roll a small
// adapter that already speaks the same DOM contract the React
// component emits (data-part="prev|page|next|ellipsis", aria-current,
// aria-label="pagination"). The Wave 2 Zag-parity review can drop the
// machine in without touching consumer markup.
//
// DOM contract:
//   [data-uikit-pagination]                 → root <nav>
//     [data-part="prev"]                    → previous-page <button>
//     [data-part="page"][data-page="<n>"]   → numeric page <button>
//     [data-part="next"]                    → next-page <button>
//     [data-part="ellipsis"]                → non-interactive filler <li>
//   Root emits a `uikit:pagination-change` CustomEvent when the user
//   picks a new page — detail: { page, previous }.

export interface PaginationInstance {
  getPage(): number;
  setPage(next: number): void;
  destroy(): void;
}

const INSTANCES = new WeakMap<HTMLElement, PaginationInstance>();

function readPage(root: HTMLElement): number {
  const raw = Number.parseInt(root.dataset.page ?? '1', 10);
  return Number.isFinite(raw) && raw >= 1 ? raw : 1;
}

function readPageCount(root: HTMLElement): number {
  const raw = Number.parseInt(root.dataset.pageCount ?? '1', 10);
  return Number.isFinite(raw) && raw >= 1 ? raw : 1;
}

export function pagination(root: HTMLElement): PaginationInstance {
  const cached = INSTANCES.get(root);
  if (cached) return cached;

  const pageBtns = () =>
    Array.from(
      root.querySelectorAll<HTMLButtonElement>('button[data-part="page"]')
    );
  const prev = root.querySelector<HTMLButtonElement>(
    'button[data-part="prev"]'
  );
  const next = root.querySelector<HTMLButtonElement>(
    'button[data-part="next"]'
  );

  const sync = (page: number): void => {
    const pageCount = readPageCount(root);
    const clamped = Math.min(Math.max(page, 1), pageCount);
    root.dataset.page = String(clamped);
    pageBtns().forEach(btn => {
      const n = Number.parseInt(btn.dataset.page ?? '', 10);
      if (n === clamped) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
    if (prev) prev.disabled = clamped <= 1;
    if (next) next.disabled = clamped >= pageCount;
  };

  const emit = (next: number, previous: number): void => {
    root.dispatchEvent(
      new CustomEvent('uikit:pagination-change', {
        detail: { page: next, previous },
        bubbles: true
      })
    );
  };

  const go = (target: number): void => {
    const current = readPage(root);
    const pageCount = readPageCount(root);
    const clamped = Math.min(Math.max(target, 1), pageCount);
    if (clamped === current) return;
    sync(clamped);
    emit(clamped, current);
  };

  const onPageClick = (event: Event): void => {
    const btn = event.currentTarget as HTMLButtonElement;
    const n = Number.parseInt(btn.dataset.page ?? '', 10);
    if (Number.isFinite(n)) go(n);
  };
  const onPrev = (): void => go(readPage(root) - 1);
  const onNext = (): void => go(readPage(root) + 1);
  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onNext();
    } else if (event.key === 'Home') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'End') {
      event.preventDefault();
      go(readPageCount(root));
    }
  };

  pageBtns().forEach(btn => btn.addEventListener('click', onPageClick));
  prev?.addEventListener('click', onPrev);
  next?.addEventListener('click', onNext);
  root.addEventListener('keydown', onKeydown);

  sync(readPage(root));

  const instance: PaginationInstance = {
    getPage: () => readPage(root),
    setPage: (page: number) => go(page),
    destroy(): void {
      pageBtns().forEach(btn => btn.removeEventListener('click', onPageClick));
      prev?.removeEventListener('click', onPrev);
      next?.removeEventListener('click', onNext);
      root.removeEventListener('keydown', onKeydown);
      INSTANCES.delete(root);
    }
  };
  INSTANCES.set(root, instance);
  return instance;
}
