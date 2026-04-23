import React, { forwardRef } from 'react';

export interface ListboxItem {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export type ListboxSelectionMode = 'single' | 'multiple';

export type ListboxValue = string | string[] | null;

export interface ListboxProps extends Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'onChange'
> {
  items: ListboxItem[];
  value?: string | string[] | null;
  selectionMode?: ListboxSelectionMode;
  onValueChange?: (value: string | string[]) => void;
}

function isSelected(
  itemValue: string,
  selectionMode: ListboxSelectionMode,
  value: ListboxValue
): boolean {
  if (value == null) return false;
  if (selectionMode === 'multiple') {
    return Array.isArray(value) && value.includes(itemValue);
  }
  return typeof value === 'string' && value === itemValue;
}

export const Listbox = forwardRef<HTMLUListElement, ListboxProps>(
  (
    {
      items,
      value = null,
      selectionMode = 'single',
      onValueChange,
      className = '',
      ...rest
    },
    ref
  ) => {
    const classes = ['listbox', className].filter(Boolean).join(' ');
    const multi = selectionMode === 'multiple';
    const pick = (itemValue: string): void => {
      if (!onValueChange) return;
      if (multi) {
        const current = Array.isArray(value) ? value : [];
        const next = current.includes(itemValue)
          ? current.filter(v => v !== itemValue)
          : [...current, itemValue];
        onValueChange(next);
      } else {
        onValueChange(itemValue);
      }
    };
    return (
      <ul
        ref={ref}
        className={classes}
        role='listbox'
        aria-multiselectable={multi ? true : undefined}
        {...rest}
      >
        {items.map(item => {
          const selected = isSelected(item.value, selectionMode, value);
          return (
            <li
              key={item.value}
              role='option'
              className='listbox__option'
              data-part='option'
              data-value={item.value}
              aria-selected={selected}
              aria-disabled={item.disabled ? true : undefined}
              onClick={item.disabled ? undefined : () => pick(item.value)}
            >
              {item.label}
            </li>
          );
        })}
      </ul>
    );
  }
);
Listbox.displayName = 'Listbox';
