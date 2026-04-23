// Combobox adapter — wires [data-uikit-combobox] roots to input-driven
// filtering, option navigation, and selection.
//
// Placeholder note: the long-term design substitutes @zag-js/combobox
// so the React (Ark UI) layer and this vanilla layer stay bit-for-bit
// identical. For the Phase 2D first ship we hand-roll a small adapter
// that speaks the same contract the React component emits (role=combobox
// on the input, aria-controls → listbox id, aria-autocomplete="list",
// aria-expanded, role="option"/aria-selected on items).
//
// DOM contract:
//   [data-uikit-combobox]                      → root <div>
//     [data-part="input"][role="combobox"]     → text input
//     [data-part="listbox"][role="listbox"]    → options container
//       [data-part="item"][data-value="<v>"]   → selectable <li>
//         [aria-disabled="true"]               → skipped by selection + focus
//   Root fires `uikit:combobox-change` with detail.value on select and
//   `uikit:combobox-input` with detail.inputValue on typing.

export interface ComboboxInstance {
  getValue(): string | null;
  setValue(next: string | null): void;
  destroy(): void;
}

const INSTANCES = new WeakMap<HTMLElement, ComboboxInstance>();

function containsInsensitive(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function combobox(root: HTMLElement): ComboboxInstance {
  const cached = INSTANCES.get(root);
  if (cached) return cached;

  const input = root.querySelector<HTMLInputElement>(
    'input[data-part="input"]'
  );
  const list = root.querySelector<HTMLElement>('[data-part="listbox"]');
  if (!input || !list) {
    const noop: ComboboxInstance = {
      getValue: () => null,
      setValue: () => undefined,
      destroy: () => undefined
    };
    INSTANCES.set(root, noop);
    return noop;
  }

  const items = () =>
    Array.from(list.querySelectorAll<HTMLElement>('[data-part="item"]'));
  const enabled = () =>
    items().filter(i => i.getAttribute('aria-disabled') !== 'true');

  let value: string | null = input.dataset.value ?? null;
  let activeIndex = -1;
  let expanded = false;

  const setExpanded = (next: boolean): void => {
    expanded = next;
    input.setAttribute('aria-expanded', String(next));
    list.hidden = !next;
  };

  const filter = (query: string): void => {
    items().forEach(item => {
      const label = (item.textContent ?? '').trim();
      const match = query.length === 0 || containsInsensitive(label, query);
      item.hidden = !match;
    });
    activeIndex = -1;
    const visible = enabled().filter(i => !i.hidden);
    setExpanded(visible.length > 0);
  };

  const syncSelection = (): void => {
    items().forEach(item => {
      const match = item.dataset.value === value;
      item.setAttribute('aria-selected', match ? 'true' : 'false');
    });
  };

  const emitChange = (): void => {
    root.dispatchEvent(
      new CustomEvent('uikit:combobox-change', {
        detail: { value },
        bubbles: true
      })
    );
  };

  const emitInput = (text: string): void => {
    root.dispatchEvent(
      new CustomEvent('uikit:combobox-input', {
        detail: { inputValue: text },
        bubbles: true
      })
    );
  };

  const select = (next: string, label?: string): void => {
    value = next;
    if (label !== undefined) input.value = label;
    input.dataset.value = next;
    syncSelection();
    setExpanded(false);
    emitChange();
  };

  const focusActive = (): void => {
    const visible = enabled().filter(i => !i.hidden);
    visible.forEach((item, idx) => {
      item.setAttribute('tabindex', idx === activeIndex ? '0' : '-1');
    });
    visible[activeIndex]?.focus();
  };

  const move = (delta: number): void => {
    if (!expanded) setExpanded(true);
    const visible = enabled().filter(i => !i.hidden);
    if (visible.length === 0) return;
    activeIndex = Math.max(
      0,
      Math.min(visible.length - 1, activeIndex + delta)
    );
    focusActive();
  };

  const onInput = (event: Event): void => {
    const text = (event.target as HTMLInputElement).value;
    filter(text);
    emitInput(text);
  };
  const onFocus = (): void => {
    filter(input.value);
  };
  const onBlur = (event: FocusEvent): void => {
    if (!root.contains(event.relatedTarget as Node)) setExpanded(false);
  };
  const onKeydown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(activeIndex < 0 ? 1 : 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Enter': {
        event.preventDefault();
        const visible = enabled().filter(i => !i.hidden);
        const target = visible[activeIndex];
        if (target) {
          const label = (target.textContent ?? '').trim();
          select(target.dataset.value ?? '', label);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        setExpanded(false);
        break;
    }
  };
  const onItemClick = (event: Event): void => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-part="item"]'
    );
    if (!target || target.getAttribute('aria-disabled') === 'true') return;
    const v = target.dataset.value ?? '';
    const label = (target.textContent ?? '').trim();
    select(v, label);
    input.focus();
  };

  input.addEventListener('input', onInput);
  input.addEventListener('focus', onFocus);
  input.addEventListener('blur', onBlur);
  input.addEventListener('keydown', onKeydown);
  list.addEventListener('click', onItemClick);
  setExpanded(false);
  syncSelection();

  const instance: ComboboxInstance = {
    getValue: () => value,
    setValue(next) {
      value = next;
      syncSelection();
    },
    destroy(): void {
      input.removeEventListener('input', onInput);
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
      input.removeEventListener('keydown', onKeydown);
      list.removeEventListener('click', onItemClick);
      INSTANCES.delete(root);
    }
  };
  INSTANCES.set(root, instance);
  return instance;
}
