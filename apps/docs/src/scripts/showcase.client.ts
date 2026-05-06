type Block = HTMLElement;

function activate(block: Block, tab: string): void {
  block.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(btn => {
    const active = btn.dataset.tab === tab;
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
    btn.classList.toggle('is-active', active);
  });
  block.querySelectorAll<HTMLElement>('[data-panel]').forEach(panel => {
    panel.classList.toggle('is-active', panel.dataset.panel === tab);
  });
}

function visibleText(el: HTMLElement | null): string {
  if (!el) return '';
  const pre = el.querySelector('pre');
  return (pre ? pre.textContent : el.textContent) ?? '';
}

async function copyToClipboard(
  text: string,
  btn: HTMLButtonElement,
  label: HTMLElement | null
): Promise<void> {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    btn.classList.add('is-copied');
    if (label) label.textContent = 'Copied';
    window.setTimeout(() => {
      btn.classList.remove('is-copied');
      if (label) label.textContent = 'Copy';
    }, 1400);
  } catch {
    if (label) label.textContent = 'Copy failed';
  }
}

function wireCopyMenu(block: Block): void {
  const menu = block.querySelector<HTMLElement>('[data-copy-menu]');
  const trigger = block.querySelector<HTMLButtonElement>('[data-copy]');
  const list = block.querySelector<HTMLElement>('.showcase__menu-list');
  const label = block.querySelector<HTMLElement>('[data-copy-label]');
  if (!menu || !trigger || !list) return;

  const setOpen = (open: boolean): void => {
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    list.hidden = !open;
  };

  trigger.addEventListener('click', async e => {
    if ((e as MouseEvent).detail === 0) {
      // Keyboard activation — open menu instead of copying blindly.
      setOpen(list.hidden === true);
      return;
    }
    const active = block.querySelector<HTMLElement>('[data-panel].is-active');
    await copyToClipboard(visibleText(active).trim(), trigger, label);
  });

  list.querySelectorAll<HTMLButtonElement>('[data-copy-as]').forEach(item => {
    item.addEventListener('click', async () => {
      const target = item.dataset.copyAs ?? 'react';
      const panel = block.querySelector<HTMLElement>(
        `[data-panel="${target}"]`
      );
      await copyToClipboard(visibleText(panel).trim(), trigger, label);
      setOpen(false);
    });
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target as Node)) setOpen(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setOpen(false);
  });
}

function wire(block: Block): void {
  block.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () =>
      activate(block, btn.dataset.tab ?? 'react')
    );
  });
  wireCopyMenu(block);
}

document.querySelectorAll<Block>('[data-showcase]').forEach(wire);
