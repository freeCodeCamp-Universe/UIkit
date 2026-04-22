// Render <Icon> via react-dom/server and assert the SSR output carries
// the Lucide viewBox, the right data-icon attribute, and the expected
// a11y defaults.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icon } from './react';

test('renders svg with lucide viewBox and data-icon=name', () => {
  const html = renderToStaticMarkup(<Icon name='copy' />);
  assert.match(html, /<svg\b/);
  assert.match(html, /viewBox="0 0 24 24"/);
  assert.match(html, /data-icon="copy"/);
  assert.match(html, /stroke="currentColor"/);
});

test('defaults to aria-hidden when no label given', () => {
  const html = renderToStaticMarkup(<Icon name='check' />);
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /role="img"/);
});

test('label upgrades to role=img with aria-label', () => {
  const html = renderToStaticMarkup(
    <Icon name='external-link' label='Open in new tab' />
  );
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Open in new tab"/);
  assert.doesNotMatch(html, /aria-hidden=/);
});

test('size prop forwards to width+height', () => {
  const html = renderToStaticMarkup(<Icon name='x' size={20} />);
  assert.match(html, /width="20"/);
  assert.match(html, /height="20"/);
});
