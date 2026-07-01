import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { TileMatcher } from './TileMatcher.tsx';
import type { TileMatcherPair } from './TileMatcher.tsx';

const PAIRS: TileMatcherPair[] = [
  { id: 'a', faces: ['🌊'] },
  { id: 'b', faces: ['dog', '🐕'] }
];

function count(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

test('TileMatcher renders .tile-matcher root and grid', () => {
  const html = renderToStaticMarkup(
    createElement(TileMatcher, { pairs: PAIRS, shuffle: false })
  );
  assert.match(html, /class="tile-matcher"/);
  assert.match(html, /class="tile-matcher__grid"/);
});

test('TileMatcher renders 2 × pairs.length tiles', () => {
  const html = renderToStaticMarkup(
    createElement(TileMatcher, { pairs: PAIRS, shuffle: false })
  );
  assert.equal(count(html, 'class="tile-matcher__tile"'), PAIRS.length * 2);
});

test('single-face pair is duplicated into two identical tiles', () => {
  const html = renderToStaticMarkup(
    createElement(TileMatcher, {
      pairs: [{ id: 'a', faces: ['🌊'] }],
      shuffle: false
    })
  );
  assert.equal(count(html, 'data-pair-id="a"'), 2);
});

test('two-face pair renders both distinct faces', () => {
  const html = renderToStaticMarkup(
    createElement(TileMatcher, {
      pairs: [{ id: 'b', faces: ['dog', '🐕'] }],
      shuffle: false,
      faceDown: false
    })
  );
  assert.match(html, />dog</);
  assert.match(html, />🐕</);
});

test('animateFlip=false adds the --no-flip modifier', () => {
  const html = renderToStaticMarkup(
    createElement(TileMatcher, {
      pairs: PAIRS,
      shuffle: false,
      animateFlip: false
    })
  );
  assert.match(html, /tile-matcher--no-flip/);
});

test('faceDown=false adds the --open modifier and reveals tiles', () => {
  const html = renderToStaticMarkup(
    createElement(TileMatcher, {
      pairs: PAIRS,
      shuffle: false,
      faceDown: false
    })
  );
  assert.match(html, /tile-matcher--open/);
  assert.match(html, /data-state="up"/);
});

test('face-down tiles expose data-state="down" and hidden label', () => {
  const html = renderToStaticMarkup(
    createElement(TileMatcher, { pairs: PAIRS, shuffle: false })
  );
  assert.match(html, /data-state="down"/);
  assert.match(html, /aria-label="Hidden tile"/);
});

test('disabled locks the board via aria-disabled', () => {
  const html = renderToStaticMarkup(
    createElement(TileMatcher, { pairs: PAIRS, shuffle: false, disabled: true })
  );
  assert.match(html, /aria-disabled="true"/);
});

test('renders a polite live region for announcements', () => {
  const html = renderToStaticMarkup(
    createElement(TileMatcher, { pairs: PAIRS, shuffle: false })
  );
  assert.match(html, /class="tile-matcher__sr-status"/);
  assert.match(html, /aria-live="polite"/);
});
