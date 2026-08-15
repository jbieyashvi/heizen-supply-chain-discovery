import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

/** Right-side drawer with overlay, escape-to-close and basic focus handling. */
export function SidePanel({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
}: SidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const onKey = (e: KeyboardEvent) => {
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
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => focusables()[0]?.focus(), 60);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
      prevFocus?.focus?.(); // restore focus to the trigger
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-overlay" onMouseDown={onClose}>
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="drawer__head">
          <div className="stack" style={{ gap: 3 }}>
            <h2 className="drawer__title">{title}</h2>
            {subtitle && <p className="muted" style={{ fontSize: 13 }}>{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close panel">
            <X />
          </button>
        </header>
        <div className="drawer__body">{children}</div>
        {footer && <footer className="drawer__foot">{footer}</footer>}
      </div>
    </div>
  );
}
