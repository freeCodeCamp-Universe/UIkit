import React, { forwardRef } from 'react';

export type PaginationEntry = number | 'ellipsis';

export function paginationRange(
  page: number,
  pageCount: number,
  siblingCount = 1
): PaginationEntry[] {
  if (pageCount <= 1) {
    return pageCount === 1 ? [1] : [];
  }
  const totalNumbers = siblingCount * 2 + 5;
  if (pageCount <= totalNumbers) {
    const out: PaginationEntry[] = [];
    for (let i = 1; i <= pageCount; i += 1) out.push(i);
    return out;
  }
  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, pageCount);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < pageCount - 1;
  const result: PaginationEntry[] = [1];
  if (showLeftEllipsis) {
    result.push('ellipsis');
  } else {
    for (let i = 2; i < leftSibling; i += 1) result.push(i);
  }
  for (let i = leftSibling; i <= rightSibling; i += 1) {
    if (i !== 1 && i !== pageCount) result.push(i);
  }
  if (showRightEllipsis) {
    result.push('ellipsis');
  } else {
    for (let i = rightSibling + 1; i < pageCount; i += 1) result.push(i);
  }
  result.push(pageCount);
  return result;
}

export interface PaginationProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'onChange'
> {
  count: number;
  pageSize: number;
  page: number;
  siblingCount?: number;
  onPageChange?: (page: number) => void;
  prevLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      count,
      pageSize,
      page,
      siblingCount = 1,
      onPageChange,
      prevLabel = 'Previous',
      nextLabel = 'Next',
      className = '',
      ...rest
    },
    ref
  ) => {
    const pageCount = Math.max(1, Math.ceil(count / Math.max(1, pageSize)));
    const entries = paginationRange(page, pageCount, siblingCount);
    const classes = ['pagination', className].filter(Boolean).join(' ');
    const go = (target: number) => {
      if (target < 1 || target > pageCount || target === page) return;
      onPageChange?.(target);
    };
    return (
      <nav
        ref={ref}
        className={classes}
        role='navigation'
        aria-label='pagination'
        {...rest}
      >
        <button
          type='button'
          data-part='prev'
          className='pagination__btn pagination__btn--prev'
          disabled={page <= 1}
          aria-label='Previous page'
          onClick={() => go(page - 1)}
        >
          {prevLabel}
        </button>
        <ul className='pagination__list'>
          {entries.map((entry, i) =>
            entry === 'ellipsis' ? (
              <li
                key={`e-${i}`}
                data-part='ellipsis'
                className='pagination__ellipsis'
                aria-hidden='true'
              >
                …
              </li>
            ) : (
              <li key={entry} className='pagination__item'>
                <button
                  type='button'
                  data-part='page'
                  className='pagination__btn'
                  aria-current={entry === page ? 'page' : undefined}
                  aria-label={`Page ${entry}`}
                  onClick={() => go(entry)}
                >
                  {entry}
                </button>
              </li>
            )
          )}
        </ul>
        <button
          type='button'
          data-part='next'
          className='pagination__btn pagination__btn--next'
          disabled={page >= pageCount}
          aria-label='Next page'
          onClick={() => go(page + 1)}
        >
          {nextLabel}
        </button>
      </nav>
    );
  }
);
Pagination.displayName = 'Pagination';
