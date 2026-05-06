import React, { Children, isValidElement } from 'react';
import { Tabs as Ark } from '@ark-ui/react/tabs';

export interface TabProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
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
  'onChange' | 'onSelect' | 'defaultValue'
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
}: TabsProps): React.ReactElement {
  const tabs = Children.toArray(children).filter(
    (c): c is React.ReactElement<TabProps> =>
      isValidElement(c) && (c.type as React.ComponentType) === Tab
  );
  const fallback = tabs[0]?.props.eventKey ?? '';
  const rootClass = ['tabs', className].filter(Boolean).join(' ');

  return (
    <Ark.Root
      className={rootClass}
      value={activeKey}
      defaultValue={
        activeKey === undefined ? (defaultActiveKey ?? fallback) : undefined
      }
      onValueChange={details => onSelect?.(details.value)}
      {...rest}
    >
      <Ark.List className='tabs__list'>
        {tabs.map(t => (
          <Ark.Trigger
            key={t.props.eventKey}
            value={t.props.eventKey}
            className='tabs__tab'
          >
            {t.props.title}
          </Ark.Trigger>
        ))}
      </Ark.List>
      {tabs.map(t => (
        <Ark.Content
          key={t.props.eventKey}
          value={t.props.eventKey}
          className='tabs__panel'
        >
          {t.props.children}
        </Ark.Content>
      ))}
    </Ark.Root>
  );
}
Tabs.displayName = 'Tabs';
