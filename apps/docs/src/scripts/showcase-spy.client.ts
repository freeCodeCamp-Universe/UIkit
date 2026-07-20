declare global {
  interface Window {
    __NO_SPY__?: boolean;
  }
}

function init(): void {
  if (typeof window === 'undefined') return;
  if (window.__NO_SPY__) return;
  const links: HTMLAnchorElement[] = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-sidebar-link]')
  );
  if (!links.length) return;
  const byTarget = new Map<string, HTMLAnchorElement>(
    links
      .map((a): [string | null, HTMLAnchorElement] => [
        a.getAttribute('data-target'),
        a
      ])
      .filter(
        (entry): entry is [string, HTMLAnchorElement] => entry[0] !== null
      )
  );
  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  if (!sections.length) return;

  function clearActive(): void {
    links.forEach(a => {
      const href = a.getAttribute('href') ?? '';
      if (
        href.startsWith('/showcase#') ||
        href.startsWith('/#') ||
        href.startsWith('#')
      ) {
        a.removeAttribute('data-active');
      }
    });
  }

  const hashId = window.location.hash.replace(/^#/, '');
  if (hashId) {
    const initial = byTarget.get(hashId);
    if (initial) {
      clearActive();
      initial.setAttribute('data-active', 'true');
    }
  }

  let lastActiveId: string | null = null;

  const setActive = (id: string): void => {
    if (lastActiveId === id) return;
    const match = byTarget.get(id);
    if (!match) return;
    clearActive();
    match.setAttribute('data-active', 'true');
    lastActiveId = id;
  };

  if (hashId && byTarget.has(hashId)) {
    lastActiveId = hashId;
  }

  const observer = new IntersectionObserver(
    entries => {
      // Multiple sections in band → topmost wins (matches the eye).
      const visible = entries
        .filter(e => e.isIntersecting)
        .map(e => ({
          id: e.target.getAttribute('id'),
          top: e.boundingClientRect.top
        }))
        .filter((e): e is { id: string; top: number } => e.id !== null);
      if (!visible.length) return;
      visible.sort((a, b) => a.top - b.top);
      setActive(visible[0].id);
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5] }
  );
  sections.forEach(s => observer.observe(s));

  // Promote target to active on click - don't wait for the scroll animation.
  links.forEach(a => {
    a.addEventListener('click', () => {
      const target = a.getAttribute('data-target');
      if (target) setActive(target);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
