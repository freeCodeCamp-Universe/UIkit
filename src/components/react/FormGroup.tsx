import React, { forwardRef } from "react";

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className = "", children, ...rest }, ref) => {
    const classes = ["form-group", className].filter(Boolean).join(" ");
    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  },
);
FormGroup.displayName = "FormGroup";
