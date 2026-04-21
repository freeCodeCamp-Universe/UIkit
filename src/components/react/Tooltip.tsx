import React from "react";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip = ({
  content,
  children,
  className = "",
}: TooltipProps) => {
  const classes = ["tip", className].filter(Boolean).join(" ");
  return (
    <span className={classes} tabIndex={0}>
      {children}
      <span role="tooltip" className="tip__bubble">
        {content}
      </span>
    </span>
  );
};
Tooltip.displayName = "Tooltip";
