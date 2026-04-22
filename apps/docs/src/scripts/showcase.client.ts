type Block = HTMLElement;

function activate(block: Block, tab: string): void {
  block.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(btn => {
    btn.setAttribute(
      'aria-selected',
      btn.dataset.tab === tab ? 'true' : 'false'
    );
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

function wire(block: Block): void {
  block.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () =>
      activate(block, btn.dataset.tab ?? 'react')
    );
  });

  const copyBtn = block.querySelector<HTMLButtonElement>('[data-copy]');
  const label = block.querySelector<HTMLElement>('[data-copy-label]');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const active = block.querySelector<HTMLElement>('[data-panel].is-active');
    const text = visibleText(active).trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.classList.add('is-copied');
      if (label) label.textContent = 'Copied';
      window.setTimeout(() => {
        copyBtn.classList.remove('is-copied');
        if (label) label.textContent = 'Copy';
      }, 1400);
    } catch {
      if (label) label.textContent = 'Copy failed';
    }
  });
}

document.querySelectorAll<Block>('[data-showcase]').forEach(wire);
