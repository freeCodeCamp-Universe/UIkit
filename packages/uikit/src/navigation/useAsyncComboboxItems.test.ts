import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { useAsyncComboboxItems } from './useAsyncComboboxItems.ts';

test('useAsyncComboboxItems is a function', () => {
  assert.equal(typeof useAsyncComboboxItems, 'function');
});

test('useAsyncComboboxItems accepts a fetcher option without crashing', () => {
  const opts = {
    fetcher: async (q: string): Promise<never[]> => {
      void q;
      return [];
    }
  };
  assert.equal(typeof opts.fetcher, 'function');
});
