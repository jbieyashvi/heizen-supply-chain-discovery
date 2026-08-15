import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  FolderKanban,
  Users,
  FlaskConical,
  MessagesSquare,
  Target,
  Workflow,
  FileStack,
  Settings,
  LogOut,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { CONSULTANT, projects } from "../data/mock";
import { ThemeToggle } from "./ThemeToggle";
import { useSidebar } from "../hooks/useSidebar";
import { useAuth } from "../hooks/useAuth";
import { useClickOutside } from "../hooks/useClickOutside";

/** Handlers a trigger spreads to get a collapsed-rail tooltip. */
export type RailBind = (
  label: string
) => Pick<
  React.DOMAttributes<HTMLElement>,
  "onMouseEnter" | "onMouseLeave" | "onFocus" | "onBlur"
>;

const projectNav = [
  { to: "", label: "Overview", icon: LayoutGrid, end: true },
  { to: "research", label: "Research", icon: FlaskConical },
  { to: "discovery", label: "Discovery Questions", icon: MessagesSquare },
  { to: "opportunities", label: "Opportunities", icon: Target },
  { to: "process-map", label: "Process Map", icon: Workflow },
  { to: "sources", label: "Sources", icon: FileStack },
];

/**
 * Rail tooltips: only in collapsed docked mode. Rendered in a portal on
 * document.body (position: fixed, z-index above everything) so nothing in
 * the sidebar or page can clip or cover them. Shows on hover and on
 * keyboard focus, after a short delay.
 */
function useRailTips(enabled: boolean) {
  const [tip, setTip] = useState<{ label: string; top: number; left: number } | null>(
    null
  );
  const timer = useRef<number | null>(null);

  const hide = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setTip(null);
  }, []);

  // Cancel any pending/visible tip if we leave collapsed mode.
  useEffect(() => {
    if (!enabled) hide();
  }, [enabled, hide]);

  const show = useCallback(
    (label: string, el: HTMLElement) => {
      if (!enabled) return;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const r = el.getBoundingClientRect();
        setTip({
          label,
          top: Math.round(r.top + r.height / 2),
          left: Math.round(r.right + 8),
        });
      }, 300);
    },
    [enabled]
  );

  const bind: RailBind = (label) => ({
    onMouseEnter: (e) => show(label, e.currentTarget as HTMLElement),
    onMouseLeave: hide,
    onFocus: (e) => show(label, e.currentTarget as HTMLElement),
    onBlur: hide,
  });

  const tipNode =
    enabled && tip
      ? createPortal(
          <div
            className="rail-tip"
            role="tooltip"
            style={{ top: tip.top, left: tip.left }}
          >
            {tip.label}
          </div>,
          document.body
        )
      : null;

  return { bind, tipNode };
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  onNavigate,
  bind,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  onNavigate: () => void;
  bind: RailBind;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className="nav-item"
      aria-label={label}
      onClick={onNavigate}
      {...bind(label)}
    >
      <Icon aria-hidden />
      <span className="nav-item__label">{label}</span>
    </NavLink>
  );
}

function HeizenMark() {
  return (
    <div className="brand__id">
      <div className="brand__mark" aria-hidden>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path
            d="M5 4v16M19 4v16M5 12h14"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="brand__text">
        <span className="brand__name">Heizen</span>
        <span className="brand__sub">Discovery</span>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);
  const inProject = Boolean(project);
  const { isMobile, effectiveCollapsed, toggle, closeMobile } = useSidebar();

  // Tooltips only in collapsed docked mode (expanded shows labels).
  const tipsEnabled = !isMobile && effectiveCollapsed;
  const { bind, tipNode } = useRailTips(tipsEnabled);

  // Clicking a nav link inside the mobile drawer closes it.
  const onNavigate = () => {
    if (isMobile) closeMobile();
  };

  return (
    <aside
      className="sidebar"
      aria-label="Primary"
      role={isMobile ? "dialog" : undefined}
      aria-modal={isMobile ? true : undefined}
    >
      <div className="brand">
        <HeizenMark />
        {isMobile && (
          <button
            className="icon-btn sidebar__close"
            onClick={closeMobile}
            aria-label="Close navigation menu"
          >
            <X />
          </button>
        )}
      </div>

      <nav className="sidebar__nav" aria-label="Primary navigation">
        {/* Workspace-level navigation is always available */}
        <div className="nav-group-label">Workspace</div>
        <NavItem
          to="/projects"
          label="Projects"
          icon={FolderKanban}
          end
          onNavigate={onNavigate}
          bind={bind}
        />
        <NavItem
          to="/team"
          label="Team"
          icon={Users}
          onNavigate={onNavigate}
          bind={bind}
        />

        {/* Inside a project, the project navigation appears below Workspace */}
        {inProject && (
          <>
            <div className="nav-project">
              <span className="nav-project__name truncate">{project?.name}</span>
              <span className="nav-project__meta truncate">
                {project?.industry}
              </span>
            </div>
            <div className="nav-group-label">Project</div>
            {projectNav.map((item) => (
              <NavItem
                key={item.label}
                to={
                  item.to
                    ? `/projects/${projectId}/${item.to}`
                    : `/projects/${projectId}`
                }
                label={item.label}
                icon={item.icon}
                end={item.end}
                onNavigate={onNavigate}
                bind={bind}
              />
            ))}
          </>
        )}
      </nav>

      <div className="sidebar__foot">
        {!isMobile && (
          <button
            className="sidebar__toggle"
            onClick={toggle}
            aria-label={
              effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            aria-expanded={!effectiveCollapsed}
            {...bind(effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar")}
          >
            {effectiveCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            <span className="nav-item__label">
              {effectiveCollapsed ? "Expand" : "Collapse"}
            </span>
          </button>
        )}

        <div className="theme-row">
          <span className="theme-row__label">Theme</span>
          <ThemeToggle tip={tipsEnabled ? bind : undefined} />
        </div>

        <UserMenu bind={bind} />
      </div>

      {tipNode}
    </aside>
  );
}

function UserMenu({ bind }: { bind: RailBind }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className="userchip menu" ref={ref}>
      <button
        className="userchip__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        {...bind(CONSULTANT.name)}
      >
        <span className="avatar">{CONSULTANT.initials}</span>
        <span className="userchip__text">
          <span className="userchip__name truncate">{CONSULTANT.name}</span>
          <span className="userchip__role truncate">{CONSULTANT.role}</span>
        </span>
        <MoreVertical className="userchip__more" aria-hidden />
      </button>
      {open && (
        <div className="menu__pop userchip__menu" role="menu">
          <button role="menuitem" disabled>
            <Settings /> Settings (soon)
          </button>
          <div className="menu__sep" />
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
              navigate("/sign-in", { replace: true });
            }}
          >
            <LogOut /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
