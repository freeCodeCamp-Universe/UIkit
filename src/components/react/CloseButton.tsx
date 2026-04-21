import React, { forwardRef } from "react";

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  (
    { className = "", children, "aria-label": ariaLabel = "Close", ...rest },
    ref,
  ) => {
    const classes = ["close-btn", className].filter(Boolean).join(" ");
    return (
      <button
        ref={ref}
        type="button"
        className={classes}
        aria-label={ariaLabel}
        {...rest}
      >
        {children ?? "×"}
      </button>
    );
  },
);
CloseButton.displayName = "CloseButton";
