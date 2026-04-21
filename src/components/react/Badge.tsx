import React, { forwardRef } from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", className = "", children, ...rest }, ref) => {
    const classes = [
      "badge",
      variant !== "default" && `badge--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <span ref={ref} className={classes} {...rest}>
        {children}
      </span>
    );
  },
);
Badge.displayName = "Badge";
