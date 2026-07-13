import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Hotspots } from './Hotspots.tsx';
import type { HotspotItem } from './Hotspots.tsx';
import {
  CircleHotspot,
  RectHotspot,
  EllipseHotspot,
  PolygonHotspot
} from './HotspotShapes.tsx';

const HOTSPOTS: HotspotItem[] = [
  {
    id: 'head',
    label: 'Head',
    shape: createElement(CircleHotspot, { cx: 20, cy: 20, r: 10 })
  },
  {
    id: 'wing',
    label: 'Wing',
    shape: createElement(RectHotspot, { x: 40, y: 40, width: 30, height: 15 })
  }
];

function count(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

test('Hotspots renders .hotspots root with stage + overlay', () => {
  const html = renderToStaticMarkup(
    createElement(Hotspots, {
      background: '/bird.png',
      backgroundAlt: 'A bird',
      width: 100,
      height: 80,
      hotspots: HOTSPOTS
    })
  );
  assert.match(html, /class="hotspots"/);
  assert.match(html, /class="hotspots__stage"/);
  assert.match(html, /class="hotspots__overlay"/);
});

test('string background renders an <img> with alt', () => {
  const html = renderToStaticMarkup(
    createElement(Hotspots, {
      background: '/bird.png',
      backgroundAlt: 'A bird',
      width: 100,
      height: 80,
      hotspots: HOTSPOTS
    })
  );
  assert.match(html, /<img src="\/bird.png" alt="A bird"/);
});

test('node background is rendered as-is (no img)', () => {
  const html = renderToStaticMarkup(
    createElement(Hotspots, {
      background: createElement('svg', { 'data-testid': 'bg' }),
      width: 100,
      height: 80,
      hotspots: HOTSPOTS
    })
  );
  assert.match(html, /data-testid="bg"/);
  assert.ok(!html.includes('<img'));
});

test('renders one button group per hotspot with its label', () => {
  const html = renderToStaticMarkup(
    createElement(Hotspots, {
      background: '/bird.png',
      width: 100,
      height: 80,
      hotspots: HOTSPOTS
    })
  );
  assert.equal(count(html, 'class="hotspots__hotspot"'), HOTSPOTS.length);
  assert.match(html, /role="button"/);
  assert.match(html, /aria-label="Head"/);
  assert.match(html, /aria-label="Wing"/);
});

test('prompt renders above the stage when provided', () => {
  const html = renderToStaticMarkup(
    createElement(Hotspots, {
      background: '/bird.png',
      width: 100,
      height: 80,
      hotspots: HOTSPOTS,
      prompt: 'Click the head'
    })
  );
  assert.match(html, /class="hotspots__prompt">Click the head</);
});

test('disabled sets aria-disabled on the widget', () => {
  const html = renderToStaticMarkup(
    createElement(Hotspots, {
      background: '/bird.png',
      width: 100,
      height: 80,
      hotspots: HOTSPOTS,
      disabled: true
    })
  );
  assert.match(html, /aria-disabled="true"/);
});

test('shape primitives carry the hotspots__shape class', () => {
  const html = renderToStaticMarkup(
    createElement('svg', null, [
      createElement(CircleHotspot, { key: 'c', cx: 1, cy: 1, r: 1 }),
      createElement(EllipseHotspot, { key: 'e', cx: 1, cy: 1, rx: 2, ry: 1 }),
      createElement(RectHotspot, { key: 'r', x: 0, y: 0, width: 2, height: 2 }),
      createElement(PolygonHotspot, { key: 'p', points: '0,0 2,0 1,2' })
    ])
  );
  assert.equal(count(html, 'class="hotspots__shape"'), 4);
  assert.match(html, /<circle/);
  assert.match(html, /<ellipse/);
  assert.match(html, /<rect/);
  assert.match(html, /<polygon/);
});

test('shape primitive merges a custom className', () => {
  const html = renderToStaticMarkup(
    createElement(CircleHotspot, { className: 'beak', cx: 1, cy: 1, r: 1 })
  );
  assert.match(html, /class="hotspots__shape beak"/);
});
