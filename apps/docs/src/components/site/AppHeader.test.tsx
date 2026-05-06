import { test, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppHeader } from './AppHeader';

const render = (pathname: string): string =>
  renderToStaticMarkup(<AppHeader pathname={pathname} />);

const ariaCurrentForHref = (html: string, href: string): string | null => {
  const escaped = href.replace(/\//g, '\\/');
  const re = new RegExp(
    `<a[^>]*href="${escaped}"[^>]*\\baria-current="([^"]+)"`,
    'i'
  );
  const match = html.match(re);
  return match ? match[1] : null;
};

test('`/playground` marks the Playground link', () => {
  const html = render('/playground');
  expect(ariaCurrentForHref(html, '/playground')).toBe('page');
  expect(ariaCurrentForHref(html, '/handbook')).toBeNull();
});

test('`/handbook` marks the Handbook link, not Playground', () => {
  const html = render('/handbook');
  expect(ariaCurrentForHref(html, '/handbook')).toBe('page');
  expect(ariaCurrentForHref(html, '/playground')).toBeNull();
});

test('nested handbook routes still resolve to the Handbook link', () => {
  const html = render('/handbook/contributing');
  expect(ariaCurrentForHref(html, '/handbook')).toBe('page');
  expect(ariaCurrentForHref(html, '/playground')).toBeNull();
});

test('landing `/` marks no nav link (home is the brand only)', () => {
  const html = render('/');
  expect(ariaCurrentForHref(html, '/playground')).toBeNull();
  expect(ariaCurrentForHref(html, '/handbook')).toBeNull();
});

test('GitHub link is never marked current (external)', () => {
  for (const path of ['/', '/playground', '/handbook']) {
    const html = render(path);
    expect(
      ariaCurrentForHref(html, 'https://github.com/freeCodeCamp/UIkit')
    ).toBeNull();
  }
});

test('exactly one link is current on Playground/Handbook routes', () => {
  for (const path of ['/playground', '/handbook', '/handbook/foo']) {
    const html = render(path);
    const matches = html.match(/aria-current="page"/g) ?? [];
    expect(matches.length, `expected 1 current link on ${path}`).toBe(1);
  }
});

test('unknown routes default to no current link', () => {
  const html = render('/some-unknown-route');
  const matches = html.match(/aria-current="page"/g) ?? [];
  expect(matches.length).toBe(0);
});

test('search control dogfoods Button styling with compact visible text', () => {
  const html = render('/handbook');
  const search = html.match(
    /<button[^>]*data-open-search[^>]*>[\s\S]*?<\/button>/
  );
  expect(search, 'search button must render').not.toBeNull();
  if (!search) return;
  expect(search[0]).toMatch(/class="[^"]*\bbtn\b[^"]*\bbtn--sm\b/);
  expect(search[0]).toMatch(/aria-label="Open search"/);
  expect(search[0]).toMatch(/aria-hidden="true"[^>]*>\/</);
  expect(search[0]).not.toMatch(/\bsite-search\b/);
  expect(search[0]).not.toMatch(/Search components, handbook, foundations/);
});
