import { test, expect } from 'vitest';

test('vitest is the active runner', () => {
  expect(typeof test).toBe('function');
  expect(typeof expect).toBe('function');
});

test('jsdom environment is wired', () => {
  expect(typeof globalThis.document).toBe('object');
  expect(globalThis.document).not.toBeNull();
});
