import { test, expect, afterEach, vi } from 'vitest';
import { cleanup, render, fireEvent, act } from '@testing-library/react';
import { TileMatcher } from './TileMatcher';
import type { TileMatcherPair } from './TileMatcher';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// shuffle:false → deterministic deck order a#0, a#1, b#0, b#1.
const PAIRS: TileMatcherPair[] = [
  { id: 'a', faces: ['🌊'] },
  { id: 'b', faces: ['dog', '🐕'] }
];

const tilesFor = (container: HTMLElement, pairId: string) =>
  Array.from(
    container.querySelectorAll<HTMLButtonElement>(
      `.tile-matcher__tile[data-pair-id="${pairId}"]`
    )
  ) as [HTMLButtonElement, HTMLButtonElement];

test('clicking a face-down tile flips it up', () => {
  const { container } = render(<TileMatcher pairs={PAIRS} shuffle={false} />);
  const [first] = tilesFor(container, 'a');
  expect(first.dataset.state).toBe('down');
  fireEvent.click(first);
  expect(first.dataset.state).toBe('up');
  expect(first.getAttribute('aria-pressed')).toBe('true');
});

test('matching two tiles of the same pair fires onMatch and locks them', () => {
  const onMatch = vi.fn();
  const { container } = render(
    <TileMatcher pairs={PAIRS} shuffle={false} onMatch={onMatch} />
  );
  const [a0, a1] = tilesFor(container, 'a');
  fireEvent.click(a0);
  fireEvent.click(a1);
  expect(onMatch).toHaveBeenCalledWith('a', ['a#0', 'a#1']);
  expect(a0.dataset.state).toBe('matched');
  expect(a1.dataset.state).toBe('matched');
  expect(a0.disabled).toBe(true);
});

test('a mismatch fires onMismatch, then flips both back after the delay', () => {
  vi.useFakeTimers();
  const onMismatch = vi.fn();
  const { container } = render(
    <TileMatcher
      pairs={PAIRS}
      shuffle={false}
      mismatchDelay={500}
      onMismatch={onMismatch}
    />
  );
  const [a0] = tilesFor(container, 'a');
  const [b0] = tilesFor(container, 'b');
  fireEvent.click(a0);
  fireEvent.click(b0);
  expect(onMismatch).toHaveBeenCalledWith(['a#0', 'b#0']);
  // Still shown while the player registers the mismatch.
  expect(a0.dataset.state).toBe('up');
  expect(b0.dataset.state).toBe('up');
  act(() => {
    vi.advanceTimersByTime(500);
  });
  expect(a0.dataset.state).toBe('down');
  expect(b0.dataset.state).toBe('down');
});

test('the board is locked during the mismatch window', () => {
  vi.useFakeTimers();
  const { container } = render(
    <TileMatcher pairs={PAIRS} shuffle={false} mismatchDelay={500} />
  );
  const [a0, a1] = tilesFor(container, 'a');
  const [b0] = tilesFor(container, 'b');
  fireEvent.click(a0);
  fireEvent.click(b0); // mismatch → locked
  fireEvent.click(a1); // ignored while locked
  expect(a1.dataset.state).toBe('down');
  act(() => {
    vi.advanceTimersByTime(500);
  });
  // Unlocked again after the window.
  fireEvent.click(a1);
  expect(a1.dataset.state).toBe('up');
});

test('matching every pair fires onComplete with move + match counts', () => {
  const onComplete = vi.fn();
  const { container } = render(
    <TileMatcher pairs={PAIRS} shuffle={false} onComplete={onComplete} />
  );
  const [a0, a1] = tilesFor(container, 'a');
  const [b0, b1] = tilesFor(container, 'b');
  fireEvent.click(a0);
  fireEvent.click(a1);
  fireEvent.click(b0);
  fireEvent.click(b1);
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenCalledWith({ moves: 2, matches: 2 });
});

test('disabled ignores clicks', () => {
  const { container } = render(
    <TileMatcher pairs={PAIRS} shuffle={false} disabled />
  );
  const [a0] = tilesFor(container, 'a');
  fireEvent.click(a0);
  expect(a0.dataset.state).toBe('down');
});
