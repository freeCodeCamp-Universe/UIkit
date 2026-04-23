import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { DescriptionList } from './DescriptionList.tsx';

const sample = [
  { term: 'Plan', detail: 'Free' },
  { term: 'Seats', detail: '3' }
];

test('DescriptionList renders <dl> with base class', () => {
  const html = renderToStaticMarkup(
    createElement(DescriptionList, { items: sample })
  );
  assert.match(html, /^<dl class="dl"/);
  assert.match(html, /<\/dl>$/);
});

test('DescriptionList renders each term/detail pair', () => {
  const html = renderToStaticMarkup(
    createElement(DescriptionList, { items: sample })
  );
  assert.match(
    html,
    /<dt class="dl__term">Plan<\/dt><dd class="dl__detail">Free<\/dd>/
  );
  assert.match(
    html,
    /<dt class="dl__term">Seats<\/dt><dd class="dl__detail">3<\/dd>/
  );
});

test('DescriptionList inline layout adds dl--inline modifier', () => {
  const html = renderToStaticMarkup(
    createElement(DescriptionList, { items: sample, layout: 'inline' })
  );
  assert.match(html, /class="dl dl--inline"/);
});

test('DescriptionList vertical layout omits modifier', () => {
  const html = renderToStaticMarkup(
    createElement(DescriptionList, { items: sample, layout: 'vertical' })
  );
  assert.match(html, /class="dl"/);
  assert.doesNotMatch(html, /dl--/);
});

test('DescriptionList accepts ReactNode details', () => {
  const html = renderToStaticMarkup(
    createElement(DescriptionList, {
      items: [
        {
          term: 'Status',
          detail: createElement('strong', { 'data-ok': 'yes' }, 'Active')
        }
      ]
    })
  );
  assert.match(
    html,
    /<dd class="dl__detail"><strong data-ok="yes">Active<\/strong><\/dd>/
  );
});

test('DescriptionList composes consumer className', () => {
  const html = renderToStaticMarkup(
    createElement(DescriptionList, { items: sample, className: 'extra' })
  );
  assert.match(html, /class="dl extra"/);
});

test('DescriptionList with empty items still renders <dl>', () => {
  const html = renderToStaticMarkup(
    createElement(DescriptionList, { items: [] })
  );
  assert.match(html, /^<dl class="dl"><\/dl>$/);
});
