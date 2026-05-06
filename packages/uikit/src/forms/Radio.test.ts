import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Radio, RadioGroup } from './Radio.tsx';

test('Radio without label renders a raw type=radio input', () => {
  const html = renderToStaticMarkup(createElement(Radio));
  assert.match(html, /<input[^>]*type="radio"/);
  assert.ok(!html.includes('class="radio"'));
});

test('Radio with label wraps in a .radio label', () => {
  const html = renderToStaticMarkup(createElement(Radio, { label: 'Email' }));
  assert.match(html, /<label class="radio"/);
  assert.match(html, /<span>Email<\/span>/);
});

test('Radio passes value attribute through to the input', () => {
  const html = renderToStaticMarkup(
    createElement(Radio, { label: 'x', value: 'one' })
  );
  assert.match(html, /<input[^>]*type="radio"[^>]*value="one"/);
});

test('RadioGroup renders with role=radiogroup', () => {
  const html = renderToStaticMarkup(
    createElement(
      RadioGroup,
      { name: 'tier' },
      createElement(Radio, { label: 'free', value: 'free' })
    )
  );
  assert.match(html, /role="radiogroup"/);
});

test('RadioGroup attaches aria-label when provided', () => {
  const html = renderToStaticMarkup(
    createElement(
      RadioGroup,
      { name: 'tier', 'aria-label': 'Tier' },
      createElement(Radio, { label: 'free', value: 'free' })
    )
  );
  assert.match(html, /aria-label="Tier"/);
});

test('RadioGroup propagates name to every child Radio', () => {
  const html = renderToStaticMarkup(
    createElement(
      RadioGroup,
      { name: 'tier' },
      createElement(Radio, { label: 'free', value: 'free' }),
      createElement(Radio, { label: 'pro', value: 'pro' })
    )
  );
  const matches = html.match(/name="tier"/g) ?? [];
  assert.equal(matches.length, 2);
});

test('RadioGroup value marks the matching Radio as checked', () => {
  const html = renderToStaticMarkup(
    createElement(
      RadioGroup,
      { name: 'tier', value: 'pro' },
      createElement(Radio, { label: 'free', value: 'free' }),
      createElement(Radio, { label: 'pro', value: 'pro' })
    )
  );
  const proTag = html.match(/<input[^/>]*value="pro"[^/>]*\/>/)?.[0] ?? '';
  const freeTag = html.match(/<input[^/>]*value="free"[^/>]*\/>/)?.[0] ?? '';
  assert.match(proTag, /checked/);
  assert.doesNotMatch(freeTag, /checked/);
});

test('Radio label composes with labelClassName', () => {
  const html = renderToStaticMarkup(
    createElement(Radio, { label: 'x', labelClassName: 'extra' })
  );
  assert.match(html, /class="radio extra"/);
});

test('RadioGroup defaultValue marks the matching Radio as checked (uncontrolled)', () => {
  const html = renderToStaticMarkup(
    createElement(
      RadioGroup,
      { name: 'theme', defaultValue: 'dark' },
      createElement(Radio, { label: 'Dark', value: 'dark' }),
      createElement(Radio, { label: 'Light', value: 'light' }),
      createElement(Radio, { label: 'System', value: 'system' })
    )
  );
  const darkTag = html.match(/<input[^/>]*value="dark"[^/>]*\/>/)?.[0] ?? '';
  const lightTag = html.match(/<input[^/>]*value="light"[^/>]*\/>/)?.[0] ?? '';
  assert.match(darkTag, /checked/);
  assert.doesNotMatch(lightTag, /checked/);
});

test('RadioGroup defaultValue does not leak as a DOM attribute', () => {
  const html = renderToStaticMarkup(
    createElement(
      RadioGroup,
      { name: 'theme', defaultValue: 'dark' },
      createElement(Radio, { label: 'Dark', value: 'dark' })
    )
  );
  assert.doesNotMatch(html, /defaultvalue=/i);
});

test('RadioGroup controlled `value` takes precedence over `defaultValue`', () => {
  const html = renderToStaticMarkup(
    createElement(
      RadioGroup,
      { name: 'theme', value: 'light', defaultValue: 'dark' },
      createElement(Radio, { label: 'Dark', value: 'dark' }),
      createElement(Radio, { label: 'Light', value: 'light' })
    )
  );
  const darkTag = html.match(/<input[^/>]*value="dark"[^/>]*\/>/)?.[0] ?? '';
  const lightTag = html.match(/<input[^/>]*value="light"[^/>]*\/>/)?.[0] ?? '';
  assert.doesNotMatch(darkTag, /checked/);
  assert.match(lightTag, /checked/);
});
