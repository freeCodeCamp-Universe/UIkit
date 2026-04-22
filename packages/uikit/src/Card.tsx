import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  bordered?: boolean;
}

type DivAttrs = React.HTMLAttributes<HTMLDivElement>;

const CardRoot = forwardRef<HTMLElement, CardProps>(
  ({ bordered, className = '', children, ...rest }, ref) => {
    const classes = ['card', bordered && 'card--bordered', className]
      .filter(Boolean)
      .join(' ');
    return (
      <article
        ref={ref as React.Ref<HTMLElement>}
        className={classes}
        {...rest}
      >
        {children}
      </article>
    );
  }
);
CardRoot.displayName = 'Card';

const CardHeader = forwardRef<HTMLElement, DivAttrs>(
  ({ className = '', children, ...rest }, ref) => (
    <header
      ref={ref as React.Ref<HTMLElement>}
      className={['card__header', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </header>
  )
);
CardHeader.displayName = 'Card.Header';

const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', children, ...rest }, ref) => (
  <h3
    ref={ref}
    className={['card__title', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'Card.Title';

const CardBody = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = '', children, ...rest }, ref) => (
  <p
    ref={ref}
    className={['card__body', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </p>
));
CardBody.displayName = 'Card.Body';

const CardFooter = forwardRef<HTMLElement, DivAttrs>(
  ({ className = '', children, ...rest }, ref) => (
    <footer
      ref={ref as React.Ref<HTMLElement>}
      className={['card__footer', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </footer>
  )
);
CardFooter.displayName = 'Card.Footer';

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Body: CardBody,
  Footer: CardFooter
});
