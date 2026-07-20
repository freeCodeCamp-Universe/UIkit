import { test, expect, afterEach, beforeAll } from 'vitest';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { useState, type JSX } from 'react';
import { CommandPalette } from './CommandPalette';

beforeAll(() => {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () {};
  }
});

afterEach(cleanup);

const GROUPS = [
  {
    label: 'Navigation',
    items: [
      { id: 'home', label: 'Go home', shortcut: 'g h' },
      { id: 'settings', label: 'Open settings' }
    ]
  },
  {
    label: 'Actions',
    items: [{ id: 'new', label: 'New task', icon: '+' }]
  }
];

test('typing in the search input filters groups + items', () => {
  const { container, getByRole } = render(
    <CommandPalette
      open
      onClose={() => {}}
      onSelect={() => {}}
      groups={GROUPS}
    />
  );
  const input = getByRole('textbox') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'task' } });
  const items = container.querySelectorAll('[role="option"]');
  expect(items.length).toBe(1);
  expect(items[0]!.textContent).toContain('New task');
});

test('ArrowDown moves aria-selected forward, ArrowUp moves it back', () => {
  const { container } = render(
    <CommandPalette
      open
      onClose={() => {}}
      onSelect={() => {}}
      groups={GROUPS}
    />
  );
  // Initial: index 0 → "Go home" active.
  let active = container.querySelector('[aria-selected="true"]');
  expect(active?.textContent).toContain('Go home');
  fireEvent.keyDown(document, { key: 'ArrowDown' });
  active = container.querySelector('[aria-selected="true"]');
  expect(active?.textContent).toContain('Open settings');
  fireEvent.keyDown(document, { key: 'ArrowDown' });
  active = container.querySelector('[aria-selected="true"]');
  expect(active?.textContent).toContain('New task');
  // Capped at last item - another ArrowDown stays put.
  fireEvent.keyDown(document, { key: 'ArrowDown' });
  active = container.querySelector('[aria-selected="true"]');
  expect(active?.textContent).toContain('New task');
  // ArrowUp goes back.
  fireEvent.keyDown(document, { key: 'ArrowUp' });
  active = container.querySelector('[aria-selected="true"]');
  expect(active?.textContent).toContain('Open settings');
});

test('Enter on the active item fires onSelect with its id', () => {
  let selected: string | null = null;
  render(
    <CommandPalette
      open
      onClose={() => {}}
      onSelect={id => {
        selected = id;
      }}
      groups={GROUPS}
    />
  );
  fireEvent.keyDown(document, { key: 'ArrowDown' });
  fireEvent.keyDown(document, { key: 'Enter' });
  expect(selected).toBe('settings');
});

test('Escape calls onClose', () => {
  let closed = 0;
  render(
    <CommandPalette
      open
      onClose={() => {
        closed += 1;
      }}
      onSelect={() => {}}
      groups={GROUPS}
    />
  );
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(closed).toBe(1);
});

test('mouseEnter on an item makes it active', () => {
  const { container } = render(
    <CommandPalette
      open
      onClose={() => {}}
      onSelect={() => {}}
      groups={GROUPS}
    />
  );
  const items = container.querySelectorAll('[role="option"]');
  fireEvent.mouseEnter(items[2]!);
  expect(items[2]!.getAttribute('aria-selected')).toBe('true');
});

test('clicking an item fires onSelect for that id', () => {
  let selected: string | null = null;
  const { container } = render(
    <CommandPalette
      open
      onClose={() => {}}
      onSelect={id => {
        selected = id;
      }}
      groups={GROUPS}
    />
  );
  const items = container.querySelectorAll('[role="option"]');
  fireEvent.click(items[2]!);
  expect(selected).toBe('new');
});

test('clicking the backdrop fires onClose', () => {
  let closed = 0;
  const { container } = render(
    <CommandPalette
      open
      onClose={() => {
        closed += 1;
      }}
      onSelect={() => {}}
      groups={GROUPS}
    />
  );
  const backdrop = container.querySelector(
    '.command-palette__backdrop'
  ) as HTMLElement;
  fireEvent.click(backdrop, {
    target: backdrop,
    currentTarget: backdrop
  });
  expect(closed).toBe(1);
});

test('controlled value mode forwards onValueChange', () => {
  function Probe(): JSX.Element {
    const [v, setV] = useState('');
    return (
      <>
        <CommandPalette
          open
          onClose={() => {}}
          onSelect={() => {}}
          groups={GROUPS}
          value={v}
          onValueChange={setV}
        />
        <output data-testid='echo'>{v}</output>
      </>
    );
  }
  const { container, getByTestId } = render(<Probe />);
  const input = container.querySelector('input') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'home' } });
  expect((getByTestId('echo') as HTMLElement).textContent).toBe('home');
});

test('emptyState renders when no items match the query', () => {
  const { container, getByRole } = render(
    <CommandPalette
      open
      onClose={() => {}}
      onSelect={() => {}}
      groups={GROUPS}
      emptyState={<span data-testid='es'>Nothing here</span>}
    />
  );
  const input = getByRole('textbox') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'zzz' } });
  expect(container.querySelector('[data-testid="es"]')).not.toBeNull();
});

test('palette returns null when open=false', () => {
  const { container } = render(
    <CommandPalette
      open={false}
      onClose={() => {}}
      onSelect={() => {}}
      groups={GROUPS}
    />
  );
  expect(container.querySelector('.command-palette__backdrop')).toBeNull();
});
