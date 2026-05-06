import { test, expect, afterEach } from 'vitest';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { useState, type JSX } from 'react';
import { Listbox } from './Listbox';

afterEach(cleanup);

const ITEMS = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry', disabled: true }
];

test('single-select: clicking an option fires onValueChange with that value', () => {
  let last: string | string[] | null = null;
  const { container } = render(
    <Listbox
      items={ITEMS}
      value='a'
      onValueChange={v => {
        last = v;
      }}
    />
  );
  const options = container.querySelectorAll('[role="option"]');
  fireEvent.click(options[1]!);
  expect(last).toBe('b');
});

test('single-select: aria-selected reflects current value', () => {
  function Probe(): JSX.Element {
    const [v, setV] = useState<string | string[]>('a');
    return <Listbox items={ITEMS} value={v} onValueChange={setV} />;
  }
  const { container } = render(<Probe />);
  const options = container.querySelectorAll('[role="option"]');
  expect(options[0]!.getAttribute('aria-selected')).toBe('true');
  fireEvent.click(options[1]!);
  expect(options[1]!.getAttribute('aria-selected')).toBe('true');
  expect(options[0]!.getAttribute('aria-selected')).toBe('false');
});

test('disabled option does not trigger onValueChange', () => {
  let calls = 0;
  const { container } = render(
    <Listbox
      items={ITEMS}
      value='a'
      onValueChange={() => {
        calls += 1;
      }}
    />
  );
  const options = container.querySelectorAll('[role="option"]');
  fireEvent.click(options[2]!);
  expect(calls).toBe(0);
  expect(options[2]!.getAttribute('aria-disabled')).toBe('true');
});

test('multi-select: clicking an option toggles it in the value array', () => {
  function Probe(): JSX.Element {
    const [v, setV] = useState<string | string[]>(['a']);
    return (
      <Listbox
        items={ITEMS}
        value={v}
        selectionMode='multiple'
        onValueChange={setV}
      />
    );
  }
  const { container } = render(<Probe />);
  const options = container.querySelectorAll('[role="option"]');
  expect(options[0]!.getAttribute('aria-selected')).toBe('true');
  fireEvent.click(options[1]!);
  expect(options[1]!.getAttribute('aria-selected')).toBe('true');
  expect(options[0]!.getAttribute('aria-selected')).toBe('true');
  // Click 'a' again to remove from selection.
  fireEvent.click(options[0]!);
  expect(options[0]!.getAttribute('aria-selected')).toBe('false');
  expect(options[1]!.getAttribute('aria-selected')).toBe('true');
});

test('multi-select: root advertises aria-multiselectable=true', () => {
  const { container } = render(
    <Listbox
      items={ITEMS}
      value={[]}
      selectionMode='multiple'
      onValueChange={() => {}}
    />
  );
  const root = container.querySelector('[role="listbox"]');
  expect(root?.getAttribute('aria-multiselectable')).toBe('true');
});

test('without onValueChange the click handler is a no-op', () => {
  const { container } = render(<Listbox items={ITEMS} value='a' />);
  const options = container.querySelectorAll('[role="option"]');
  expect(() => fireEvent.click(options[1]!)).not.toThrow();
});

test('null value renders no selected option', () => {
  const { container } = render(
    <Listbox items={ITEMS} value={null} onValueChange={() => {}} />
  );
  const selected = container.querySelectorAll(
    '[role="option"][aria-selected="true"]'
  );
  expect(selected.length).toBe(0);
});
