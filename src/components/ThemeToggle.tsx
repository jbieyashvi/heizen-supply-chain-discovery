import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type ThemeChoice } from "../hooks/useTheme";
import type { RailBind } from "./Sidebar";

const options: { id: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

/** Accessible segmented theme switcher (radiogroup semantics).
   `tip` (from the collapsed sidebar) adds portal rail tooltips on
   hover/focus; otherwise the native title is used. */
export function ThemeToggle({ tip }: { tip?: RailBind }) {
  const { choice, setChoice } = useTheme();
  return (
    <div
      className="theme-toggle"
      role="radiogroup"
      aria-label="Colour theme"
    >
      {options.map((o) => {
        const Icon = o.icon;
        const active = choice === o.id;
        const label = `${o.label} theme`;
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={active}
            className={`theme-toggle__btn${active ? " is-active" : ""}`}
            onClick={() => setChoice(o.id)}
            title={tip ? undefined : label}
            {...(tip ? tip(label) : {})}
          >
            <Icon aria-hidden />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
