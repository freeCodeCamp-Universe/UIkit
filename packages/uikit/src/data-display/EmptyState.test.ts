import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement, type ComponentProps } from 'react';
import { EmptyState } from './EmptyState.tsx';

test('EmptyState default renders div with class="empty-state"', () => {
  const html = renderToStaticMarkup(
    createElement(EmptyState, { title: 'No results' })
  );
  assert.match(html, /class="empty-state"/);
  assert.match(html, /class="empty-state__title">No results</);
});

test('EmptyState without title omits title node', () => {
  const html = renderToStaticMarkup(createElement(EmptyState));
  assert.doesNotMatch(html, /empty-state__title/);
});

test('EmptyState renders icon slot with aria-hidden wrapper', () => {
  const html = renderToStaticMarkup(
    createElement(EmptyState, {
      icon: createElement('svg', { 'data-test': 'ico' }),
      title: 'Nope'
    })
  );
  assert.match(html, /class="empty-state__icon"[^>]*aria-hidden="true"/);
  assert.match(html, /data-test="ico"/);
});

test('EmptyState renders description + action slots', () => {
  const html = renderToStaticMarkup(
    createElement(EmptyState, {
      title: 'Empty',
      description: 'Try filing one.',
      action: createElement('button', {}, 'New task')
    })
  );
  assert.match(html, /class="empty-state__description">Try filing one.</);
  assert.match(html, /class="empty-state__action"/);
  assert.match(html, /<button[^>]*>New task</);
});

test('EmptyState composes user className', () => {
  const html = renderToStaticMarkup(
    createElement(EmptyState, { className: 'bordered', title: 't' })
  );
  assert.match(html, /class="empty-state bordered"/);
});

test('EmptyState forwards extra props (role, data-*)', () => {
  const html = renderToStaticMarkup(
    createElement(EmptyState, {
      role: 'status',
      'data-testid': 'es'
    } as unknown as ComponentProps<typeof EmptyState>)
  );
  assert.match(html, /role="status"/);
  assert.match(html, /data-testid="es"/);
});
