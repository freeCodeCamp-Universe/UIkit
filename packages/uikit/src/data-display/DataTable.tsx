import React from 'react';

export type DataTableAlign = 'left' | 'right' | 'center';

export interface DataTableColumn<TRow> {
  id: string;
  header: React.ReactNode;
  /** `string` reads `row[accessor]`; function maps the row to a cell value. */
  accessor: keyof TRow | ((row: TRow) => React.ReactNode);
  sortable?: boolean;
  align?: DataTableAlign;
  width?: number | string;
}

export interface DataTableSort {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<TRow> {
  columns: readonly DataTableColumn<TRow>[];
  rows: readonly TRow[];
  /** Row id accessor. Defaults to `row.id`. */
  rowId?: (row: TRow) => string;
  sortBy?: DataTableSort | null;
  onSortChange?: (next: DataTableSort | null) => void;
  selection?: ReadonlySet<string>;
  onSelectionChange?: (next: Set<string>) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  caption?: React.ReactNode;
  /** Number of skeleton rows to emit while `loading`. */
  skeletonRows?: number;
}

const defaultRowId = <TRow,>(row: TRow): string =>
  String((row as unknown as { id?: unknown }).id ?? '');

const readCell = <TRow,>(
  row: TRow,
  column: DataTableColumn<TRow>
): React.ReactNode => {
  if (typeof column.accessor === 'function') return column.accessor(row);
  return (row as unknown as Record<string, React.ReactNode>)[
    column.accessor as string
  ];
};

const nextDirection = (
  current: DataTableSort | null | undefined,
  columnId: string
): DataTableSort | null => {
  if (!current || current.columnId !== columnId) {
    return { columnId, direction: 'asc' };
  }
  if (current.direction === 'asc') {
    return { columnId, direction: 'desc' };
  }
  // Third click clears the sort - matches common table UX.
  return null;
};

const toWidth = (v: number | string | undefined): string | undefined =>
  typeof v === 'number' ? `${v}px` : v;

export const DataTable = <TRow,>({
  columns,
  rows,
  rowId = defaultRowId,
  sortBy,
  onSortChange,
  selection,
  onSelectionChange,
  loading = false,
  emptyState,
  className = '',
  caption,
  skeletonRows = 3
}: DataTableProps<TRow>): React.ReactElement => {
  const classes = ['data-table', className].filter(Boolean).join(' ');
  const hasSelection =
    selection !== undefined && onSelectionChange !== undefined;
  const totalCols = columns.length + (hasSelection ? 1 : 0);
  const allIds = rows.map(row => rowId(row));
  const allSelected =
    hasSelection && allIds.length > 0 && allIds.every(id => selection.has(id));
  const someSelected =
    hasSelection && !allSelected && allIds.some(id => selection.has(id));

  const toggleAll = (): void => {
    if (!hasSelection) return;
    const next = new Set(selection);
    if (allSelected) {
      allIds.forEach(id => next.delete(id));
    } else {
      allIds.forEach(id => next.add(id));
    }
    onSelectionChange(next);
  };
  const toggleRow = (id: string): void => {
    if (!hasSelection) return;
    const next = new Set(selection);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const renderCell = (
    row: TRow,
    column: DataTableColumn<TRow>
  ): React.ReactElement => {
    const cellClasses = [
      'data-table__cell',
      column.align && column.align !== 'left'
        ? `data-table__cell--${column.align}`
        : ''
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <td
        key={column.id}
        className={cellClasses}
        style={
          column.width !== undefined
            ? { width: toWidth(column.width) }
            : undefined
        }
      >
        {readCell(row, column)}
      </td>
    );
  };

  return (
    <div className={classes}>
      <table className='data-table__table'>
        {caption !== undefined && <caption>{caption}</caption>}
        <thead>
          <tr>
            {hasSelection && (
              <th scope='col' className='data-table__select-all'>
                <input
                  type='checkbox'
                  aria-label='Select all rows'
                  checked={allSelected}
                  ref={el => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map(column => {
              const sortable = column.sortable === true;
              const active = sortBy?.columnId === column.id;
              const ariaSort: 'ascending' | 'descending' | 'none' | undefined =
                sortable
                  ? active
                    ? sortBy.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                  : undefined;
              const headerClasses = [
                'data-table__header',
                column.align && column.align !== 'left'
                  ? `data-table__header--${column.align}`
                  : ''
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <th
                  key={column.id}
                  scope='col'
                  className={headerClasses}
                  aria-sort={ariaSort}
                  style={
                    column.width !== undefined
                      ? { width: toWidth(column.width) }
                      : undefined
                  }
                >
                  {sortable && onSortChange !== undefined ? (
                    <button
                      type='button'
                      className='data-table__sort-btn'
                      onClick={() =>
                        onSortChange(nextDirection(sortBy, column.id))
                      }
                    >
                      <span>{column.header}</span>
                      <span
                        className='data-table__sort-indicator'
                        aria-hidden='true'
                      >
                        {active
                          ? sortBy.direction === 'asc'
                            ? '▲'
                            : '▼'
                          : '↕'}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }, (_, i) => (
                <tr key={`skel-${i}`} className='data-table__skeleton'>
                  {hasSelection && (
                    <td className='data-table__cell'>
                      <span className='skeleton' aria-hidden='true' />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.id} className='data-table__cell'>
                      <span className='skeleton' aria-hidden='true' />
                    </td>
                  ))}
                </tr>
              ))
            : rows.length === 0
              ? [
                  <tr key='empty' className='data-table__empty-row'>
                    <td colSpan={totalCols} className='data-table__empty-cell'>
                      {emptyState}
                    </td>
                  </tr>
                ]
              : rows.map(row => {
                  const id = rowId(row);
                  const selected = hasSelection && selection.has(id);
                  return (
                    <tr
                      key={id}
                      data-row-id={id}
                      data-selected={selected ? 'true' : undefined}
                    >
                      {hasSelection && (
                        <td className='data-table__cell data-table__select-cell'>
                          <input
                            type='checkbox'
                            aria-label={`Select row ${id}`}
                            checked={selected}
                            onChange={() => toggleRow(id)}
                          />
                        </td>
                      )}
                      {columns.map(column => renderCell(row, column))}
                    </tr>
                  );
                })}
        </tbody>
      </table>
    </div>
  );
};
DataTable.displayName = 'DataTable';
