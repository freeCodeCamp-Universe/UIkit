// Sidebar scroll-spy for the /showcase gallery. Mirrors each
// `<section[id]>` into a sidebar link's `data-active` attribute as the
// section scrolls through a central band (rootMargin -30% / -60%).
//
// Opt-out flag: Playwright full-page screenshots stitch by scrolling,
// which triggers the observer repeatedly and drifts the active state
// between captures. The test harness sets `window.__NO_SPY__` via
// `page.addInitScript` before this script runs; we bail in that case.
//
// Deep-link: on first paint, if the URL carries a `#section-id`, we
// mark that link active immediately so the eye isn't drawn to a
// mis-matched `data-active` from prior load state.

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
      if (href.startsWith('/showcase#') || href.startsWith('/#')) {
        a.removeAttribute('data-active');
      }
    });
  }

  // Hydrate initial state from the hash, if present.
  const hashId = window.location.hash.replace(/^#/, '');
  if (hashId) {
    const initial = byTarget.get(hashId);
    if (initial) {
      clearActive();
      initial.setAttribute('data-active', 'true');
    }
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        if (!id) return;
        const match = byTarget.get(id);
        if (!match) return;
        clearActive();
        match.setAttribute('data-active', 'true');
      });
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
  );
  sections.forEach(s => observer.observe(s));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
