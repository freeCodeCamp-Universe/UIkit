import React, { forwardRef, useId } from 'react';

export interface ComboboxItem {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

/**
 * Sync-filter helper that matches Zag's default "contains" predicate on
 * each item's label. Non-string labels fall back to the `value` field
 * so custom renderers still filter sanely.
 */
export function filterItemsByLabel<T extends ComboboxItem>(
  items: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return items;
  return items.filter(item => {
    const label = typeof item.label === 'string' ? item.label : item.value;
    return label.toLowerCase().includes(q);
  });
}

export interface ComboboxProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  items: ComboboxItem[];
  value?: string | null;
  inputValue?: string;
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  onInputValueChange?: (inputValue: string) => void;
  renderItem?: (item: ComboboxItem) => React.ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      items,
      value = null,
      inputValue,
      placeholder,
      disabled,
      onValueChange,
      onInputValueChange,
      renderItem,
      className = '',
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    ref
  ) => {
    const reactId = useId();
    const rootId = id ?? `combobox-${reactId}`;
    const listId = `${rootId}-listbox`;
    const classes = ['combobox', className].filter(Boolean).join(' ');
    return (
      <div ref={ref} id={rootId} className={classes} data-part='root' {...rest}>
        <input
          type='text'
          role='combobox'
          className='combobox__input'
          data-part='input'
          aria-autocomplete='list'
          aria-expanded={false}
          aria-controls={listId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          placeholder={placeholder}
          disabled={disabled}
          value={inputValue}
          onChange={e => onInputValueChange?.(e.currentTarget.value)}
          readOnly={inputValue !== undefined && !onInputValueChange}
        />
        <ul
          id={listId}
          role='listbox'
          className='combobox__list'
          data-part='listbox'
        >
          {items.map(item => {
            const selected = value === item.value;
            return (
              <li
                key={item.value}
                role='option'
                className='combobox__item'
                data-part='item'
                data-value={item.value}
                aria-selected={selected}
                aria-disabled={item.disabled ? true : undefined}
                onClick={
                  item.disabled ? undefined : () => onValueChange?.(item.value)
                }
              >
                {renderItem ? renderItem(item) : item.label}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
);
Combobox.displayName = 'Combobox';
