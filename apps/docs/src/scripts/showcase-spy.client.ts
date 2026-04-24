// Scroll-spy for scroll-anchored surfaces — the playground at `/`
// (post Wave 4 · 4.3) and the /handbook. Mirrors each `<section[id]>`
// into a sidebar-link's `data-active` attribute as the section scrolls
// through a central band (rootMargin -30% / -60%).
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
      // Spy-managed anchors carry one of three href shapes:
      //   `/showcase#foo` — `<a>` on /showcase,
      //   `/#foo`         — `<a>` on `/`,
      //   `#foo`          — in-page TOC on /handbook (and future
      //                     single-page surfaces).
      // Anything else (e.g. `/components/button`) is a route link and
      // gets its `data-active` from server-side rendering; leave it be.
      if (
        href.startsWith('/showcase#') ||
        href.startsWith('/#') ||
        href.startsWith('#')
      ) {
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

  // Track last-applied id to avoid touching the DOM on every sub-pixel
  // scroll tick — mutating on every callback churns paint + makes
  // screen readers chatter.
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
      // When multiple sections overlap the central band, pick the
      // topmost one — that's what the eye reads.
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

  // Clicking a sidebar link should promote its target to active
  // immediately — don't wait for the scroll animation to settle.
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
