// Listbox adapter — wires [data-uikit-listbox] roots to selection,
// keyboard navigation, and type-ahead.
//
// Placeholder note: the long-term design substitutes @zag-js/listbox
// so the React (Ark UI) layer and this vanilla layer emit bit-for-bit
// identical DOM. For the Phase 2D first ship we hand-roll a small
// adapter that already speaks the same contract the React component
// emits (role="listbox", role="option", aria-selected, data-value,
// aria-multiselectable, aria-disabled).
//
// DOM contract:
//   [data-uikit-listbox]                        → root <ul>
//     [data-uikit-listbox-mode="multiple"]      → multi-select
//     [data-uikit-listbox-value="a,b"]          → initial selection (CSV)
//     [data-part="option"][data-value="<v>"]    → selectable <li>
//       [aria-disabled="true"]                  → skipped by selection + focus
//   Root fires `uikit:listbox-change` with detail.value — string for
//   single mode, string[] for multi.

export interface ListboxInstance {
  getValue(): string | string[] | null;
  setValue(next: string | string[] | null): void;
  destroy(): void;
}

const INSTANCES = new WeakMap<HTMLElement, ListboxInstance>();

function splitCsv(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

export function listbox(root: HTMLElement): ListboxInstance {
  const cached = INSTANCES.get(root);
  if (cached) return cached;

  const multi = root.dataset.uikitListboxMode === 'multiple';
  let value: string | string[] | null = multi
    ? splitCsv(root.dataset.uikitListboxValue)
    : (root.dataset.uikitListboxValue ?? null);
  let activeIndex = -1;
  let typed = '';
  let typedAt = 0;

  const options = () =>
    Array.from(root.querySelectorAll<HTMLElement>('[data-part="option"]'));
  const enabled = () =>
    options().filter(o => o.getAttribute('aria-disabled') !== 'true');

  const sync = (): void => {
    if (multi) root.setAttribute('aria-multiselectable', 'true');
    else root.removeAttribute('aria-multiselectable');
    options().forEach(opt => {
      const v = opt.dataset.value ?? '';
      const selected = multi
        ? Array.isArray(value) && value.includes(v)
        : value === v;
      opt.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    enabled().forEach((opt, idx) => {
      opt.setAttribute('tabindex', idx === activeIndex ? '0' : '-1');
    });
    if (activeIndex < 0) {
      const current = enabled()[0];
      if (current) current.setAttribute('tabindex', '0');
    }
  };

  const emit = (): void => {
    root.dispatchEvent(
      new CustomEvent('uikit:listbox-change', {
        detail: { value },
        bubbles: true
      })
    );
  };

  const select = (v: string): void => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      value = arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
    } else {
      value = v;
    }
    sync();
    emit();
  };

  const move = (delta: number): void => {
    const list = enabled();
    if (list.length === 0) return;
    activeIndex = Math.max(
      0,
      Math.min(list.length - 1, (activeIndex < 0 ? 0 : activeIndex) + delta)
    );
    list[activeIndex]?.focus();
    sync();
  };

  const typeahead = (char: string): void => {
    const now = Date.now();
    if (now - typedAt > 600) typed = '';
    typedAt = now;
    typed += char.toLowerCase();
    const list = enabled();
    const hit = list.findIndex(opt =>
      (opt.textContent ?? '').trim().toLowerCase().startsWith(typed)
    );
    if (hit >= 0) {
      activeIndex = hit;
      list[hit]?.focus();
      sync();
    }
  };

  const onClick = (event: Event): void => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-part="option"]'
    );
    if (!target || target.getAttribute('aria-disabled') === 'true') return;
    const v = target.dataset.value;
    if (v == null) return;
    const list = enabled();
    activeIndex = list.indexOf(target);
    select(v);
  };

  const onKeydown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        activeIndex = 0;
        enabled()[0]?.focus();
        sync();
        break;
      case 'End': {
        event.preventDefault();
        const list = enabled();
        activeIndex = list.length - 1;
        list[activeIndex]?.focus();
        sync();
        break;
      }
      case ' ':
      case 'Enter': {
        event.preventDefault();
        const list = enabled();
        const current = list[activeIndex];
        if (current) select(current.dataset.value ?? '');
        break;
      }
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          typeahead(event.key);
        }
    }
  };

  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKeydown);
  sync();

  const instance: ListboxInstance = {
    getValue: () => value,
    setValue(next) {
      value = next;
      sync();
    },
    destroy(): void {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKeydown);
      INSTANCES.delete(root);
    }
  };
  INSTANCES.set(root, instance);
  return instance;
}
