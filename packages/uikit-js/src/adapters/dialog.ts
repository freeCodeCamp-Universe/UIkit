export interface DialogInstance {
  open(): void;
  close(): void;
  destroy(): void;
}

const INSTANCES = new WeakMap<HTMLElement, DialogInstance>();

function collectTriggers(root: HTMLElement): HTMLElement[] {
  if (!root.id) return [];
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      `[data-uikit-dialog-trigger="${root.id}"]`
    )
  );
}

export function dialog(root: HTMLElement): DialogInstance {
  const cached = INSTANCES.get(root);
  if (cached) return cached;

  const content = root.querySelector<HTMLElement>(
    '[data-uikit-dialog-content]'
  );
  const backdrop = root.querySelector<HTMLElement>(
    '[data-uikit-dialog-backdrop]'
  );
  const closers = Array.from(
    root.querySelectorAll<HTMLElement>('[data-uikit-dialog-close]')
  );
  const triggers = collectTriggers(root);

  const setState = (next: 'open' | 'closed'): void => {
    root.dataset.state = next;
    root.setAttribute('aria-hidden', String(next === 'closed'));
    if (content) content.dataset.state = next;
    if (backdrop) backdrop.dataset.state = next;
  };

  setState(root.dataset.state === 'open' ? 'open' : 'closed');

  const open = (): void => setState('open');
  const close = (): void => setState('closed');
  const onBackdrop = (event: MouseEvent): void => {
    if (event.target === backdrop) close();
  };
  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && root.dataset.state === 'open') close();
  };

  triggers.forEach(trigger => trigger.addEventListener('click', open));
  closers.forEach(closer => closer.addEventListener('click', close));
  backdrop?.addEventListener('click', onBackdrop);
  document.addEventListener('keydown', onKeydown);

  const instance: DialogInstance = {
    open,
    close,
    destroy(): void {
      triggers.forEach(trigger => trigger.removeEventListener('click', open));
      closers.forEach(closer => closer.removeEventListener('click', close));
      backdrop?.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKeydown);
      INSTANCES.delete(root);
    }
  };
  INSTANCES.set(root, instance);
  return instance;
}
