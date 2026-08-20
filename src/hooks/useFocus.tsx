import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Focus } from "../data/focus";

/* Per-project focus state. Prototype persistence via localStorage so a
   focus survives navigation between project screens and reloads. */

interface FocusCtx {
  get: (projectId: string) => Focus | null;
  set: (projectId: string, focus: Focus) => void;
  clear: (projectId: string) => void;
}

const Ctx = createContext<FocusCtx | null>(null);
const KEY = "heizen-v2-focus";

function load(): Record<string, Focus> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function FocusProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Record<string, Focus>>(() => load());

  const persist = useCallback((next: Record<string, Focus>) => {
    setMap(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* prototype — best effort */
    }
  }, []);

  const value = useMemo<FocusCtx>(
    () => ({
      get: (projectId) => map[projectId] ?? null,
      set: (projectId, focus) => persist({ ...map, [projectId]: focus }),
      clear: (projectId) => {
        const next = { ...map };
        delete next[projectId];
        persist(next);
      },
    }),
    [map, persist]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Access the focus for a single project (the common case). */
export function useFocus(projectId: string | undefined) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFocus must be used within FocusProvider");
  const focus = projectId ? ctx.get(projectId) : null;
  return {
    focus,
    setFocus: (f: Focus) => projectId && ctx.set(projectId, f),
    clearFocus: () => projectId && ctx.clear(projectId),
  };
}
