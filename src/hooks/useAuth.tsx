import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

const KEY = "heizen-auth";

interface AuthState {
  email: string | null;
}

interface AuthCtx {
  signedIn: boolean;
  email: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

function read(): AuthState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { email: null };
    const parsed = JSON.parse(raw);
    return { email: typeof parsed?.email === "string" ? parsed.email : "you@example.com" };
  } catch {
    return { email: null };
  }
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => read());

  const signIn = useCallback((email: string) => {
    const next = { email: email || "you@example.com" };
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    setState({ email: null });
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <Ctx.Provider
      value={{ signedIn: state.email !== null, email: state.email, signIn, signOut }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
