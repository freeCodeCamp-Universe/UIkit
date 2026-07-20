import { test, expect, afterEach } from 'vitest';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { useState, type JSX } from 'react';
import { ToggleButton } from './ToggleButton';

afterEach(cleanup);

test('uncontrolled - clicking flips aria-pressed', () => {
  const { container } = render(<ToggleButton>Bold</ToggleButton>);
  const btn = container.querySelector('button')!;
  expect(btn.getAttribute('aria-pressed')).toBe('false');
  fireEvent.click(btn);
  expect(btn.getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(btn);
  expect(btn.getAttribute('aria-pressed')).toBe('false');
});

test('uncontrolled with defaultPressed - initial state honours seed', () => {
  const { container } = render(
    <ToggleButton defaultPressed>Italic</ToggleButton>
  );
  expect(container.querySelector('button')!.getAttribute('aria-pressed')).toBe(
    'true'
  );
});

test('controlled - pressed prop wins, internal state ignored', () => {
  let last = false;
  function Probe(): JSX.Element {
    const [pressed, setPressed] = useState(false);
    return (
      <ToggleButton
        pressed={pressed}
        onPressedChange={p => {
          last = p;
          setPressed(p);
        }}
      >
        Underline
      </ToggleButton>
    );
  }
  const { container } = render(<Probe />);
  const btn = container.querySelector('button')!;
  expect(btn.getAttribute('aria-pressed')).toBe('false');
  fireEvent.click(btn);
  expect(last).toBe(true);
  expect(btn.getAttribute('aria-pressed')).toBe('true');
});

test('onPressedChange and onClick both fire on click', () => {
  let pressed: boolean | null = null;
  let clicks = 0;
  const { container } = render(
    <ToggleButton
      onPressedChange={p => (pressed = p)}
      onClick={() => (clicks += 1)}
    >
      Bold
    </ToggleButton>
  );
  fireEvent.click(container.querySelector('button')!);
  expect(pressed).toBe(true);
  expect(clicks).toBe(1);
});

test('size modifier appends class only for sm/lg', () => {
  const { container, rerender } = render(<ToggleButton>md</ToggleButton>);
  expect(container.querySelector('button')!.className).toBe('toggle-btn');
  rerender(<ToggleButton size='sm'>sm</ToggleButton>);
  expect(container.querySelector('button')!.className).toContain(
    'toggle-btn--sm'
  );
  rerender(<ToggleButton size='lg'>lg</ToggleButton>);
  expect(container.querySelector('button')!.className).toContain(
    'toggle-btn--lg'
  );
});
