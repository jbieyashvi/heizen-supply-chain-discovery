import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
  /** Wide layout for document-like content (e.g. the full first-call brief). */
  wide?: boolean;
  /** The children own layout and scrolling — no body padding or scroll.
      Used by the brief workspace to run its own panes. */
  flush?: boolean;
  /** Header content before the title (e.g. a "Back to brief" button). */
  headerStart?: ReactNode;
  /** Extra class(es) on the panel itself (e.g. drawer--has-detail). */
  panelClassName?: string;
}

/** Right-side drawer with overlay, escape-to-close and basic focus handling.
 *  Panels can nest (a drawer opened from inside another drawer); keyboard
 *  handling only ever acts on the top-most one. */
export function SidePanel({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  wide = false,
  flush = false,
  headerStart,
  panelClassName,
}: SidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;

    // A nested drawer renders after (inside) its parent, so the last .drawer
    // in document order is the top-most open panel.
    const isTop = () => {
      const drawers = document.querySelectorAll(".drawer");
      return drawers[drawers.length - 1] === panelRef.current;
    };

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const onKey = (e: KeyboardEvent) => {
      if (!isTop()) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        // Trap focus within the panel.
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement;
        if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => focusables()[0]?.focus(), 60);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
      prevFocus?.focus?.(); // restore focus to the trigger
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-overlay" onMouseDown={onClose}>
      <div
        className={`drawer${wide ? " drawer--wide" : ""}${
          panelClassName ? ` ${panelClassName}` : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="drawer__head">
          {headerStart}
          <div className="stack" style={{ gap: 3, flex: "1 1 auto", minWidth: 0 }}>
            <h2 className="drawer__title">{title}</h2>
            {subtitle && <p className="muted" style={{ fontSize: 13 }}>{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close panel">
            <X />
          </button>
        </header>
        <div className={`drawer__body${flush ? " drawer__body--flush" : ""}`}>
          {children}
        </div>
        {footer && <footer className="drawer__foot">{footer}</footer>}
      </div>
    </div>
  );
}
