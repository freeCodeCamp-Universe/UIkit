// Toast adapter — declarative vanilla notifications.
//
// Mirrors the DOM contract Ark UI + Zag emit on the React side so a
// future swap to `@zag-js/toast` stays non-breaking. For the Phase
// 3B1 scaffold we ship a tiny hand-rolled stack with auto-dismiss,
// pause-on-hover, keyboard close, and fCC class hooks.
//
// DOM contract:
//   [data-uikit-toaster]                               → container
//   [data-uikit-toast-trigger]                         → click opens toast
//     data-toast-type="info|success|warning|danger"
//     data-toast-title="…"
//     data-toast-description="…"
//     data-toast-duration="5000"                       → optional (ms)
//     data-toast-dismissible="false"                   → optional
//
// Each emitted toast:
//   <div class="toast toast--<type>" role="status|alert" data-state="open">
//     <div class="toast__body">
//       <p class="toast__title">…</p>
//       <p class="toast__description">…</p>
//     </div>
//     <button class="toast__close" aria-label="Dismiss">×</button>
//   </div>

export interface ToasterInstance {
  push(options: ToastOptions): () => void;
  destroy(): void;
}

export interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
}

const TOASTER_INSTANCES = new WeakMap<HTMLElement, ToasterInstance>();
const TRIGGER_BOUND = new WeakSet<HTMLElement>();

function setClosed(el: HTMLElement): void {
  el.dataset.state = 'closed';
  const onEnd = (): void => {
    el.removeEventListener('animationend', onEnd);
    el.remove();
  };
  el.addEventListener('animationend', onEnd);
  // Animation fallback — if reduced-motion disables animation, yank now.
  setTimeout(() => {
    if (el.isConnected) el.remove();
  }, 250);
}

function createToastEl(options: ToastOptions): HTMLElement {
  const type = options.type ?? 'info';
  const dismissible = options.dismissible !== false;
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', type === 'danger' ? 'alert' : 'status');
  el.dataset.state = 'open';

  const body = document.createElement('div');
  body.className = 'toast__body';
  if (options.title !== undefined) {
    const title = document.createElement('p');
    title.className = 'toast__title';
    title.textContent = options.title;
    body.appendChild(title);
  }
  if (options.description !== undefined) {
    const desc = document.createElement('p');
    desc.className = 'toast__description';
    desc.textContent = options.description;
    body.appendChild(desc);
  }
  el.appendChild(body);

  if (dismissible) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast__close';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '×';
    close.addEventListener('click', () => setClosed(el));
    el.appendChild(close);
  }
  return el;
}

export function toaster(container: HTMLElement): ToasterInstance {
  const cached = TOASTER_INSTANCES.get(container);
  if (cached) return cached;

  const push = (options: ToastOptions): (() => void) => {
    const duration = options.duration ?? 5000;
    const el = createToastEl(options);
    container.appendChild(el);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = (): void => {
      if (duration <= 0) return;
      timer = setTimeout(() => setClosed(el), duration);
    };
    const cancel = (): void => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    };

    // Pause the dismissal timer while the pointer is over the toast —
    // the stack should never pull the rug out during a read/hover.
    el.addEventListener('pointerenter', cancel);
    el.addEventListener('pointerleave', schedule);
    schedule();

    return (): void => {
      cancel();
      setClosed(el);
    };
  };

  const instance: ToasterInstance = {
    push,
    destroy(): void {
      TOASTER_INSTANCES.delete(container);
    }
  };
  TOASTER_INSTANCES.set(container, instance);
  return instance;
}

export function toastTrigger(trigger: HTMLElement): void {
  if (TRIGGER_BOUND.has(trigger)) return;
  TRIGGER_BOUND.add(trigger);
  trigger.addEventListener('click', () => {
    const container = document.querySelector<HTMLElement>(
      '[data-uikit-toaster]'
    );
    if (!container) return;
    const store = toaster(container);
    store.push({
      type: trigger.dataset.toastType as ToastOptions['type'],
      title: trigger.dataset.toastTitle,
      description: trigger.dataset.toastDescription,
      duration: trigger.dataset.toastDuration
        ? Number(trigger.dataset.toastDuration)
        : undefined,
      dismissible: trigger.dataset.toastDismissible !== 'false'
    });
  });
}
