import { useId, type ReactNode } from "react";

interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
}

/** Accessible hover/focus tooltip. Wraps any focusable trigger. */
export function Tooltip({ label, children }: TooltipProps) {
  const id = useId();
  return (
    <span className="tip">
      <span aria-describedby={id} tabIndex={0} style={{ display: "inline-flex" }}>
        {children}
      </span>
      <span role="tooltip" id={id} className="tip__bubble">
        {label}
      </span>
    </span>
  );
}
