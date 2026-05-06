import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface CommandPaletteItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  shortcut?: string;
  keywords?: string;
}

export interface CommandPaletteGroup {
  label: React.ReactNode;
  items: readonly CommandPaletteItem[];
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  groups: readonly CommandPaletteGroup[];
  placeholder?: string;
  /** Slot rendered when `groups` is empty (after filtering). */
  emptyState?: React.ReactNode;
  /** Controlled search value. Omit for uncontrolled. */
  value?: string;
  onValueChange?: (next: string) => void;
  className?: string;
}

interface FlatItem {
  readonly id: string;
  readonly label: React.ReactNode;
}

const searchString = (item: CommandPaletteItem): string => {
  const parts: string[] = [];
  if (typeof item.label === 'string') parts.push(item.label);
  if (item.keywords) parts.push(item.keywords);
  return parts.join(' ').toLowerCase();
};

const filterGroups = (
  groups: readonly CommandPaletteGroup[],
  query: string
): readonly CommandPaletteGroup[] => {
  if (query.trim() === '') return groups;
  const needle = query.toLowerCase();
  return groups
    .map(group => ({
      label: group.label,
      items: group.items.filter(item => searchString(item).includes(needle))
    }))
    .filter(group => group.items.length > 0);
};

const flattenItems = (
  groups: readonly CommandPaletteGroup[]
): readonly FlatItem[] =>
  groups.flatMap(group =>
    group.items.map(item => ({ id: item.id, label: item.label }))
  );

export const CommandPalette = ({
  open,
  onClose,
  onSelect,
  groups,
  placeholder = 'Type a command…',
  emptyState,
  value,
  onValueChange,
  className = ''
}: CommandPaletteProps): React.ReactElement | null => {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState('');
  const query = isControlled ? value : internal;
  const setQuery = (next: string): void => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const filtered = useMemo(() => filterGroups(groups, query), [groups, query]);
  const flat = useMemo(() => flattenItems(filtered), [filtered]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [flat.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex(i => Math.min(i + 1, flat.length - 1));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (event.key === 'Enter') {
        const selected = flat[activeIndex];
        if (selected) {
          event.preventDefault();
          onSelect(selected.id);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, flat, activeIndex, onClose, onSelect]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  const classes = ['command-palette', className].filter(Boolean).join(' ');
  const hasMatches = filtered.length > 0;

  let cursor = -1;
  return (
    <div
      className='command-palette__backdrop'
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      data-state='open'
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label='Command palette'
        className={classes}
      >
        <input
          type='text'
          className='command-palette__search'
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          aria-autocomplete='list'
        />
        <ul className='command-palette__list' role='listbox'>
          {!hasMatches && emptyState !== undefined && (
            <li className='command-palette__empty'>{emptyState}</li>
          )}
          {filtered.map((group, gi) => (
            <li key={gi} className='command-palette__group'>
              <div className='command-palette__group-label'>{group.label}</div>
              <ul className='command-palette__group-items'>
                {group.items.map(item => {
                  cursor += 1;
                  const isActive = cursor === activeIndex;
                  const capturedCursor = cursor;
                  return (
                    <li
                      key={item.id}
                      ref={isActive ? activeRef : undefined}
                      role='option'
                      aria-selected={isActive}
                      data-active={isActive ? 'true' : undefined}
                      className='command-palette__item'
                      onMouseEnter={() => setActiveIndex(capturedCursor)}
                      onClick={() => onSelect(item.id)}
                    >
                      {item.icon !== undefined && (
                        <span
                          className='command-palette__icon'
                          aria-hidden='true'
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className='command-palette__label'>
                        {item.label}
                      </span>
                      {item.shortcut !== undefined && (
                        <span className='command-palette__shortcut'>
                          {item.shortcut}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
CommandPalette.displayName = 'CommandPalette';
