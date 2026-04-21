import React, { forwardRef, useState } from "react";

export type ToggleButtonSize = "sm" | "md" | "lg";

export interface ToggleButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: ToggleButtonSize;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      pressed,
      defaultPressed,
      onPressedChange,
      size = "md",
      className = "",
      onClick,
      children,
      ...rest
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultPressed ?? false);
    const isControlled = pressed !== undefined;
    const value = isControlled ? (pressed as boolean) : internal;

    const classes = [
      "toggle-btn",
      size !== "md" && `toggle-btn--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      const next = !value;
      if (!isControlled) setInternal(next);
      onPressedChange?.(next);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={value}
        className={classes}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
ToggleButton.displayName = "ToggleButton";
