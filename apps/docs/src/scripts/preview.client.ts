const qs = <T extends Element = Element>(
  root: ParentNode,
  sel: string
): T | null => root.querySelector<T>(sel);
const qsa = <T extends Element = Element>(root: ParentNode, sel: string): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

function wireToggle(): void {
  qsa<HTMLButtonElement>(document, '[data-toggle-pressed]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next =
        btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true';
      btn.setAttribute('aria-pressed', next);
      const on = btn.dataset.labelOn;
      const off = btn.dataset.labelOff;
      if (on && off) btn.textContent = next === 'true' ? on : off;
    });
  });
}

function wireTabs(): void {
  qsa<HTMLElement>(document, '[data-tabs]').forEach(group => {
    const tabs = qsa<HTMLButtonElement>(group, '[data-tabs-tab]');
    const panels = qsa<HTMLElement>(group, '[data-tabs-panel]');
    const activate = (key: string): void => {
      tabs.forEach(t =>
        t.setAttribute(
          'aria-selected',
          t.dataset.tabsTab === key ? 'true' : 'false'
        )
      );
      panels.forEach(p => (p.hidden = p.dataset.tabsPanel !== key));
    };
    tabs.forEach(t =>
      t.addEventListener('click', () => activate(t.dataset.tabsTab ?? ''))
    );
  });
}

function wireDropdown(): void {
  const groups = qsa<HTMLElement>(document, '[data-dropdown]');
  groups.forEach(group => {
    const toggle = qs<HTMLButtonElement>(group, '[data-dropdown-toggle]');
    const menu = qs<HTMLElement>(group, '[data-dropdown-menu]');
    if (!toggle || !menu) return;
    const setOpen = (open: boolean): void => {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.hidden = !open;
    };
    setOpen(false);
    toggle.addEventListener('click', e => {
      e.stopPropagation();
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('click', e => {
      if (!group.contains(e.target as Node)) setOpen(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') setOpen(false);
    });
  });
}

function wireModal(): void {
  const open = (id: string): void => {
    const modal = document.getElementById(id);
    if (modal) modal.dataset.open = 'true';
  };
  const close = (modal: HTMLElement): void => {
    modal.dataset.open = 'false';
  };
  qsa<HTMLButtonElement>(document, '[data-modal-trigger]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.modalTrigger;
      if (id) open(id);
    });
  });
  qsa<HTMLElement>(document, '[data-modal-close]').forEach(el => {
    el.addEventListener('click', () => {
      const modal = el.closest<HTMLElement>('.modal');
      if (modal) close(modal);
    });
  });
  qsa<HTMLElement>(document, '.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) close(modal);
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    qsa<HTMLElement>(document, '.modal[data-open="true"]').forEach(close);
  });
}

wireToggle();
wireTabs();
wireDropdown();
wireModal();
