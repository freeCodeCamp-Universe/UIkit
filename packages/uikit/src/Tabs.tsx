import React, { Children, isValidElement, useState } from 'react';

export interface TabProps extends React.HTMLAttributes<HTMLDivElement> {
  eventKey: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}

export function Tab(_props: TabProps): null {
  // Rendered indirectly by <Tabs>. Config shell only.
  return null;
}
Tab.displayName = 'Tab';

export interface TabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  activeKey?: string;
  defaultActiveKey?: string;
  onSelect?: (key: string) => void;
  children?: React.ReactNode;
}

export function Tabs({
  activeKey,
  defaultActiveKey,
  onSelect,
  className = '',
  children,
  ...rest
}: TabsProps) {
  const tabs = Children.toArray(children).filter(
    (c): c is React.ReactElement<TabProps> =>
      isValidElement(c) && (c.type as React.ComponentType) === Tab
  );
  const initial = defaultActiveKey ?? tabs[0]?.props.eventKey ?? '';
  const [internal, setInternal] = useState(initial);
  const isControlled = activeKey !== undefined;
  const current = isControlled ? activeKey : internal;

  const classes = ['tabs', className].filter(Boolean).join(' ');

  const select = (key: string) => {
    if (!isControlled) setInternal(key);
    onSelect?.(key);
  };

  return (
    <div className={classes} {...rest}>
      <div role='tablist' className='tabs__list'>
        {tabs.map(t => {
          const selected = current === t.props.eventKey;
          return (
            <button
              key={t.props.eventKey}
              type='button'
              role='tab'
              className='tabs__tab'
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.props.eventKey)}
            >
              {t.props.title}
            </button>
          );
        })}
      </div>
      {tabs.map(t => {
        const selected = current === t.props.eventKey;
        return (
          <div
            key={t.props.eventKey}
            role='tabpanel'
            className='tabs__panel'
            hidden={!selected}
          >
            {t.props.children}
          </div>
        );
      })}
    </div>
  );
}
