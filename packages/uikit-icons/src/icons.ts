// Inline icon bodies (just the inside of the <svg> element). SVG sources
// live in src/svg/ and are the authoritative artefact for the sprite
// build; this file mirrors them so runtime consumers do not need fs
// access. Keep them in sync — the test suite asserts parity.

export const icons = {
  copy:
    '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>' +
    '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  'external-link':
    '<path d="M15 3h6v6"/>' +
    '<path d="M10 14 21 3"/>' +
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
} as const satisfies Record<string, string>;

export type IconName = keyof typeof icons;

// Shared <svg> attributes for every rendered icon. Matches Lucide source
// so the React output is byte-identical to the sprite viewBox.
export const svgAttrs = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
} as const;
