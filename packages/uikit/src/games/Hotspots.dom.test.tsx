import { test, expect, afterEach, vi } from 'vitest';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { Hotspots } from './Hotspots';
import { CircleHotspot } from './HotspotShapes';
import type { HotspotItem } from './Hotspots';

afterEach(cleanup);

const HOTSPOTS: HotspotItem[] = [
  {
    id: 'head',
    label: 'Head',
    shape: <CircleHotspot cx={20} cy={20} r={10} />
  },
  { id: 'wing', label: 'Wing', shape: <CircleHotspot cx={60} cy={40} r={10} /> }
];

const spot = (container: HTMLElement, id: string) =>
  container.querySelector(
    `.hotspots__hotspot[data-hotspot-id="${id}"]`
  ) as SVGGElement;

test('picking the target fires onCorrect and marks it correct', () => {
  const onCorrect = vi.fn();
  const onSelect = vi.fn();
  const { container } = render(
    <Hotspots
      background='/x.png'
      width={100}
      height={80}
      hotspots={HOTSPOTS}
      targetId='head'
      onCorrect={onCorrect}
      onSelect={onSelect}
    />
  );
  fireEvent.click(spot(container, 'head'));
  expect(onSelect).toHaveBeenCalledWith('head');
  expect(onCorrect).toHaveBeenCalledWith('head');
  expect(spot(container, 'head').dataset.state).toBe('correct');
  expect(
    container.querySelector('.hotspots__feedback--correct')
  ).not.toBeNull();
});

test('picking a non-target fires onIncorrect and marks it incorrect', () => {
  const onIncorrect = vi.fn();
  const { container } = render(
    <Hotspots
      background='/x.png'
      width={100}
      height={80}
      hotspots={HOTSPOTS}
      targetId='head'
      onIncorrect={onIncorrect}
    />
  );
  fireEvent.click(spot(container, 'wing'));
  expect(onIncorrect).toHaveBeenCalledWith('wing');
  expect(spot(container, 'wing').dataset.state).toBe('incorrect');
  expect(
    container.querySelector('.hotspots__feedback--incorrect')
  ).not.toBeNull();
});

test('free-selection mode (no targetId) marks the pick as selected', () => {
  const onSelect = vi.fn();
  const { container } = render(
    <Hotspots
      background='/x.png'
      width={100}
      height={80}
      hotspots={HOTSPOTS}
      onSelect={onSelect}
    />
  );
  fireEvent.click(spot(container, 'wing'));
  expect(onSelect).toHaveBeenCalledWith('wing');
  expect(spot(container, 'wing').dataset.state).toBe('selected');
});

test('a hint appears after the configured number of wrong attempts', () => {
  const { container } = render(
    <Hotspots
      background='/x.png'
      width={100}
      height={80}
      hotspots={HOTSPOTS}
      targetId='head'
      hintAfter={2}
    />
  );
  expect(container.querySelector('.hotspots__feedback--hint')).toBeNull();
  fireEvent.click(spot(container, 'wing'));
  fireEvent.click(spot(container, 'wing'));
  const hint = container.querySelector('.hotspots__feedback--hint');
  expect(hint).not.toBeNull();
  expect(hint?.textContent).toContain('Head');
});

test('keyboard Enter selects a hotspot', () => {
  const onSelect = vi.fn();
  const { container } = render(
    <Hotspots
      background='/x.png'
      width={100}
      height={80}
      hotspots={HOTSPOTS}
      onSelect={onSelect}
    />
  );
  fireEvent.keyDown(spot(container, 'head'), { key: 'Enter' });
  expect(onSelect).toHaveBeenCalledWith('head');
});

test('disabled ignores clicks', () => {
  const onSelect = vi.fn();
  const { container } = render(
    <Hotspots
      background='/x.png'
      width={100}
      height={80}
      hotspots={HOTSPOTS}
      disabled
      onSelect={onSelect}
    />
  );
  fireEvent.click(spot(container, 'head'));
  expect(onSelect).not.toHaveBeenCalled();
  expect(spot(container, 'head').dataset.state).toBe('idle');
});
