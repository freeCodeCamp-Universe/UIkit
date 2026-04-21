import React, { forwardRef } from "react";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { variant = "info", title, icon, className = "", children, ...rest },
    ref,
  ) => {
    const classes = ["alert", `alert--${variant}`, className]
      .filter(Boolean)
      .join(" ");
    const structured = title !== undefined || icon !== undefined;
    return (
      <div ref={ref} role="alert" className={classes} {...rest}>
        {icon !== undefined && (
          <span className="alert__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {structured ? (
          <div className="alert__body">
            {title !== undefined && <p className="alert__title">{title}</p>}
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    );
  },
);
Alert.displayName = "Alert";
