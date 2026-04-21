import React, { forwardRef } from "react";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;
  labelClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, labelClassName = "", className = "", id, ...rest }, ref) => {
    if (label === undefined) {
      return (
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={className}
          {...rest}
        />
      );
    }
    const classes = ["check", labelClassName].filter(Boolean).join(" ");
    return (
      <label className={classes} htmlFor={id}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={className}
          {...rest}
        />
        <span>{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";
