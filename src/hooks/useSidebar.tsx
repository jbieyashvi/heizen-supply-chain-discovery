import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const KEY = "heizen-v2-sidebar";
type Pref = "expanded" | "collapsed";

function readPref(): Pref | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "expanded" || v === "collapsed" ? v : null;
  } catch {
    return null;
  }
}

const WIDE = "(min-width: 1280px)"; // expanded by default at/above
const MOBILE = "(max-width: 1023px)"; // off-canvas drawer below 1024

interface SidebarCtx {
  /** User/breakpoint collapsed preference (docked mode). */
  collapsed: boolean;
  /** Viewport is below 1024 → off-canvas drawer. */
  isMobile: boolean;
  /** Drawer visibility (mobile only). */
  mobileOpen: boolean;
  /** Visual collapsed state incl. temporary force (e.g. Process Map). */
  effectiveCollapsed: boolean;
  toggle: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  setForced: (v: boolean) => void;
}

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE).matches
  );
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const p = readPref();
    return p ? p === "collapsed" : !window.matchMedia(WIDE).matches;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [forced, setForced] = useState(false);

  // Track breakpoints; apply responsive default only when no saved preference.
  useEffect(() => {
    const mm = window.matchMedia(MOBILE);
    const mw = window.matchMedia(WIDE);
    const onMobile = () => setIsMobile(mm.matches);
    const onWide = () => {
      if (!readPref()) setCollapsed(!mw.matches);
    };
    mm.addEventListener("change", onMobile);
    mw.addEventListener("change", onWide);
    return () => {
      mm.removeEventListener("change", onMobile);
      mw.removeEventListener("change", onWide);
    };
  }, []);

  // Leaving mobile always closes the drawer.
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(KEY, next ? "collapsed" : "expanded");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const value: SidebarCtx = {
    collapsed,
    isMobile,
    mobileOpen,
    effectiveCollapsed: forced ? true : collapsed,
    toggle,
    openMobile,
    closeMobile,
    setForced,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
