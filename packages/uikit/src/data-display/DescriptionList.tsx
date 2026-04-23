import React, { forwardRef } from 'react';

export type DescriptionListLayout = 'vertical' | 'inline';

export interface DescriptionListItem {
  term: React.ReactNode;
  detail: React.ReactNode;
}

export interface DescriptionListProps extends Omit<
  React.HTMLAttributes<HTMLDListElement>,
  'children'
> {
  items: DescriptionListItem[];
  layout?: DescriptionListLayout;
}

export const DescriptionList = forwardRef<
  HTMLDListElement,
  DescriptionListProps
>(({ items, layout = 'vertical', className = '', ...rest }, ref) => {
  const classes = ['dl', layout !== 'vertical' && `dl--${layout}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <dl ref={ref} className={classes} {...rest}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <dt className='dl__term'>{item.term}</dt>
          <dd className='dl__detail'>{item.detail}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
});
DescriptionList.displayName = 'DescriptionList';
