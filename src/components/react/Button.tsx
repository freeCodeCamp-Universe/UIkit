import React, { forwardRef } from "react";

export type ButtonVariant =
  | "default"
  | "cta"
  | "danger"
  | "info"
  | "ghost"
  | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "default",
      size = "md",
      block = false,
      isLoading = false,
      className = "",
      disabled,
      children,
      ...rest
    },
    ref,
  ) => {
    const classes = [
      "btn",
      variant !== "default" && `btn--${variant}`,
      size !== "md" && `btn--${size}`,
      block && "btn--block",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? true : undefined}
        {...rest}
      >
        {isLoading && <span className="btn__spinner" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
