import React, { forwardRef } from "react";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  block?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ block = false, className = "", children, ...rest }, ref) => {
    const classes = ["fcc-link", block && "fcc-link--block", className]
      .filter(Boolean)
      .join(" ");
    return (
      <a ref={ref} className={classes} {...rest}>
        {children}
      </a>
    );
  },
);
Link.displayName = "Link";
