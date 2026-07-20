import { test, expect, afterEach } from 'vitest';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

afterEach(cleanup);

test('clicking next fires onPageChange with page+1', () => {
  let last = 0;
  const { container } = render(
    <Pagination
      count={120}
      pageSize={10}
      page={3}
      onPageChange={p => (last = p)}
    />
  );
  fireEvent.click(container.querySelector('button[data-part="next"]')!);
  expect(last).toBe(4);
});

test('clicking prev fires onPageChange with page-1', () => {
  let last = 0;
  const { container } = render(
    <Pagination
      count={120}
      pageSize={10}
      page={5}
      onPageChange={p => (last = p)}
    />
  );
  fireEvent.click(container.querySelector('button[data-part="prev"]')!);
  expect(last).toBe(4);
});

test('prev is disabled on page 1; next is disabled on the last page', () => {
  const { container, rerender } = render(
    <Pagination count={50} pageSize={10} page={1} />
  );
  expect(container.querySelector('button[data-part="prev"]')).toHaveProperty(
    'disabled',
    true
  );
  expect(container.querySelector('button[data-part="next"]')).toHaveProperty(
    'disabled',
    false
  );
  rerender(<Pagination count={50} pageSize={10} page={5} />);
  expect(container.querySelector('button[data-part="next"]')).toHaveProperty(
    'disabled',
    true
  );
  expect(container.querySelector('button[data-part="prev"]')).toHaveProperty(
    'disabled',
    false
  );
});

test('clicking a page button fires onPageChange with that number', () => {
  let last = 0;
  const { container } = render(
    <Pagination
      count={120}
      pageSize={10}
      page={3}
      onPageChange={p => (last = p)}
    />
  );
  const pageButtons = container.querySelectorAll('button[data-part="page"]');
  // Click "4" (visible at page 3 thanks to siblingCount=1).
  const target = Array.from(pageButtons).find(b => b.textContent === '4')!;
  fireEvent.click(target);
  expect(last).toBe(4);
});

test('clicking the current page button is a no-op (guarded by go())', () => {
  let calls = 0;
  const { container } = render(
    <Pagination
      count={120}
      pageSize={10}
      page={3}
      onPageChange={() => (calls += 1)}
    />
  );
  const pageButtons = container.querySelectorAll('button[data-part="page"]');
  const current = Array.from(pageButtons).find(b => b.textContent === '3')!;
  fireEvent.click(current);
  expect(calls).toBe(0);
});

test('out-of-range navigation is guarded - prev on page 1 + next on last fire nothing', () => {
  let calls = 0;
  const { container, rerender } = render(
    <Pagination
      count={50}
      pageSize={10}
      page={1}
      onPageChange={() => (calls += 1)}
    />
  );
  fireEvent.click(container.querySelector('button[data-part="prev"]')!);
  expect(calls).toBe(0);
  rerender(
    <Pagination
      count={50}
      pageSize={10}
      page={5}
      onPageChange={() => (calls += 1)}
    />
  );
  fireEvent.click(container.querySelector('button[data-part="next"]')!);
  expect(calls).toBe(0);
});

test('pageCount falls back to 1 when count <= 0 (single page render)', () => {
  const { container } = render(<Pagination count={0} pageSize={10} page={1} />);
  // One page button rendered - "1".
  const pages = container.querySelectorAll('button[data-part="page"]');
  expect(pages.length).toBe(1);
  expect(pages[0]!.textContent).toBe('1');
});

test('pageSize=0 still computes a finite pageCount (guarded by Math.max(1, pageSize))', () => {
  const { container } = render(<Pagination count={20} pageSize={0} page={1} />);
  // pageCount = ceil(20/1) = 20 → entries shown with ellipses.
  expect(
    container.querySelectorAll('button[data-part="page"]').length
  ).toBeGreaterThan(0);
});
