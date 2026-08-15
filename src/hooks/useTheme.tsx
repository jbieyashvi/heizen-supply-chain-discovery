import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeChoice = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const STORAGE_KEY = "heizen-theme";

interface ThemeCtx {
  choice: ThemeChoice;
  resolved: Resolved;
  setChoice: (c: ThemeChoice) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

function systemResolved(): Resolved {
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(() => readChoice());
  const [system, setSystem] = useState<Resolved>(() => systemResolved());

  // Track OS preference changes (only matters while choice === "system").
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setSystem(mq.matches ? "light" : "dark");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved: Resolved = choice === "system" ? system : choice;

  // Apply to <html> and persist the choice.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  const setChoice = useCallback((c: ThemeChoice) => {
    setChoiceState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ choice, resolved, setChoice }),
    [choice, resolved, setChoice]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
