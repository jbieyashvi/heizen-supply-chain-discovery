import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "../hooks/useSidebar";

function Shell() {
  const {
    isMobile,
    mobileOpen,
    effectiveCollapsed,
    openMobile,
    closeMobile,
    setForced,
  } = useSidebar();
  const location = useLocation();
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Process Map temporarily collapses the sidebar; leaving restores prior state.
  useEffect(() => {
    setForced(/\/process-map$/.test(location.pathname));
  }, [location.pathname, setForced]);

  // Off-canvas drawer: focus trap, escape-to-close, scroll-lock, focus restore.
  useEffect(() => {
    if (!(isMobile && mobileOpen)) return;
    const drawer = document.querySelector<HTMLElement>(".sidebar");
    const focusables = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMobile();
        return;
      }
      if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement;
        if (e.shiftKey && (active === first || !drawer?.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => focusables()[0]?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(t);
      hamburgerRef.current?.focus();
    };
  }, [isMobile, mobileOpen, closeMobile]);

  const dataSidebar = isMobile
    ? "mobile"
    : effectiveCollapsed
    ? "collapsed"
    : "expanded";

  return (
    <div
      className="app-shell"
      data-sidebar={dataSidebar}
      data-mobile-open={isMobile && mobileOpen ? "true" : undefined}
    >
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobile} aria-hidden />
      )}
      <Sidebar />
      <main className="app-main">
        <div className="mobile-topbar">
          <button
            ref={hamburgerRef}
            className="icon-btn mobile-topbar__menu"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            onClick={openMobile}
          >
            <Menu />
          </button>
          <span className="mobile-topbar__brand">
            Heizen <span>Discovery</span>
          </span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export function AppShell() {
  return (
    <SidebarProvider>
      <Shell />
    </SidebarProvider>
  );
}
