// Wave 9 P4.3 (W9-B8.3) — AppBreadcrumb path mapper + SSR contract.
//
// `crumbsForPath` is the pure helper. The contract:
//
//   - `/`                  → null (home renders no breadcrumb).
//   - `/handbook`          → [Home, Handbook (leaf)].
//   - `/handbook/foo`      → [Home, Handbook (link), Foo (leaf)].
//   - `/guides/install`    → [Home, Guides (link to /guides/install),
//                              Install (leaf)].
//   - `/guides/copy-paste` → [Home, Guides (link), Copy paste (leaf)].
//
// The leaf has no `href` so `<Breadcrumb.Item>` flips it to the
// aria-current="page" branch automatically.
import { test, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppBreadcrumb, crumbsForPath } from './AppBreadcrumb';

test('crumbsForPath returns null on home', () => {
  expect(crumbsForPath('/')).toBeNull();
  expect(crumbsForPath('')).toBeNull();
});

test('crumbsForPath maps `/handbook` to Home + Handbook leaf', () => {
  const crumbs = crumbsForPath('/handbook');
  expect(crumbs).toEqual([{ href: '/', label: 'Home' }, { label: 'Handbook' }]);
});

test('crumbsForPath maps nested handbook routes to a 3-segment chain', () => {
  const crumbs = crumbsForPath('/handbook/contributing');
  expect(crumbs).toEqual([
    { href: '/', label: 'Home' },
    { href: '/handbook', label: 'Handbook' },
    { label: 'Contributing' }
  ]);
});

test('crumbsForPath maps `/guides/install` to Home + Guides + Install', () => {
  const crumbs = crumbsForPath('/guides/install');
  expect(crumbs).toEqual([
    { href: '/', label: 'Home' },
    { href: '/guides/install', label: 'Guides' },
    { label: 'Install' }
  ]);
});

test('crumbsForPath humanises kebab slugs (copy-paste → Copy paste)', () => {
  const crumbs = crumbsForPath('/guides/copy-paste');
  expect(crumbs?.at(-1)).toEqual({ label: 'Copy paste' });
});

test('AppBreadcrumb renders nothing on home', () => {
  const html = renderToStaticMarkup(<AppBreadcrumb pathname='/' />);
  expect(html).toBe('');
});

test('AppBreadcrumb renders <nav class="breadcrumb"> on /handbook', () => {
  const html = renderToStaticMarkup(<AppBreadcrumb pathname='/handbook' />);
  expect(html).toMatch(/<nav[^>]*class="[^"]*breadcrumb[^"]*"/);
  // Home anchor with href '/'.
  expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Home<\/a>/);
  // Leaf carries aria-current="page" (uikit Breadcrumb contract).
  expect(html).toMatch(/aria-current="page"[^>]*>Handbook<\/span>/);
});
