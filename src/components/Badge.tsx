import type { ReactNode } from "react";

type Tone =
  | "green"
  | "amber"
  | "red"
  | "info"
  | "violet"
  | "neutral"
  | "accent";

interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  pulse?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function Badge({
  tone = "neutral",
  dot = false,
  pulse = false,
  icon,
  children,
}: BadgeProps) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className={`dot${pulse ? " pulse" : ""}`} />}
      {icon}
      {children}
    </span>
  );
}
