// Wave 8 P1 (W8-3) — PropTable contract.
//
// Server-rendered prop table for the showcase anatomy block. Reads
// the per-component entry from `@freecodecamp/uikit/props.json` and
// renders a `<table>` with one row per declared prop.
//
// Render contract (SSR-only — no client directive in PlaygroundCard):
//   columns: Prop · Type · Required · Default · Description
//   one row per prop in the entry
//   required props get a `data-required="true"` cell marker
//   no rows when entry has zero props (caller skips render anyway,
//   but the component must still render an empty <table>)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { PropTable } from './PropTable.js';

const fixture = {
  displayName: 'Badge',
  description: 'Inline status chip.',
  props: {
    variant: {
      type: 'enum',
      required: false,
      description: 'Color tone.',
      defaultValue: 'default'
    },
    children: {
      type: 'ReactNode',
      required: true,
      description: 'Chip body.',
      defaultValue: null
    }
  }
};

test('PropTable renders one row per prop', () => {
  const html = renderToStaticMarkup(<PropTable entry={fixture} />);
  // 2 props → 2 rows. Header row has <th>; body rows have <td>.
  const bodyRowMatches = html.match(/<tr class="prop-table__row"/g) ?? [];
  assert.equal(
    bodyRowMatches.length,
    2,
    `expected 2 body rows, found ${bodyRowMatches.length}: ${html}`
  );
});

test('PropTable required marker present on required props', () => {
  const html = renderToStaticMarkup(<PropTable entry={fixture} />);
  assert.match(
    html,
    /data-required="true"/,
    'required prop must carry data-required="true"'
  );
});

test('PropTable renders header row with all five columns', () => {
  const html = renderToStaticMarkup(<PropTable entry={fixture} />);
  for (const heading of [
    'Prop',
    'Type',
    'Required',
    'Default',
    'Description'
  ]) {
    assert.match(
      html,
      new RegExp(`<th[^>]*>${heading}</th>`),
      `expected header column: ${heading}`
    );
  }
});

test('PropTable renders fallback note when _extractionFailed', () => {
  const generic = {
    displayName: 'Bag',
    description: '',
    props: {},
    _extractionFailed: true
  };
  const html = renderToStaticMarkup(<PropTable entry={generic} />);
  assert.match(
    html,
    /Prop signature unavailable/,
    'fallback message must render for _extractionFailed entries'
  );
});

test('PropTable renders the prop name verbatim', () => {
  const html = renderToStaticMarkup(<PropTable entry={fixture} />);
  for (const name of ['variant', 'children']) {
    assert.match(
      html,
      new RegExp(`<code[^>]*>${name}</code>`),
      `expected prop name in code element: ${name}`
    );
  }
});
