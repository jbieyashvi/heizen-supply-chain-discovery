import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type ThemeChoice } from "../hooks/useTheme";

const options: { id: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

/** Accessible segmented theme switcher (radiogroup semantics). */
export function ThemeToggle() {
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
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={active}
            className={`theme-toggle__btn${active ? " is-active" : ""}`}
            onClick={() => setChoice(o.id)}
            title={`${o.label} theme`}
          >
            <Icon aria-hidden />
            <span className="sr-only">{o.label} theme</span>
          </button>
        );
      })}
    </div>
  );
}
