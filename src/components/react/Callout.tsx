import React, { forwardRef } from "react";

export type CalloutVariant = "tip" | "note" | "warning" | "caution";

export interface CalloutProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CalloutVariant;
  label?: React.ReactNode;
}

const DEFAULT_LABEL: Record<CalloutVariant, string> = {
  tip: "Tip",
  note: "Note",
  warning: "Warning",
  caution: "Caution",
};

export const Callout = forwardRef<HTMLElement, CalloutProps>(
  ({ variant = "tip", label, className = "", children, ...rest }, ref) => {
    const classes = ["callout", `callout--${variant}`, className]
      .filter(Boolean)
      .join(" ");
    const resolvedLabel = label ?? DEFAULT_LABEL[variant];
    return (
      <aside ref={ref as React.Ref<HTMLElement>} className={classes} {...rest}>
        <p className="callout__label">{resolvedLabel}</p>
        <div className="callout__body">{children}</div>
      </aside>
    );
  },
);
Callout.displayName = "Callout";
