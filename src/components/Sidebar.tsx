import { NavLink, useParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  FolderKanban,
  FlaskConical,
  MessagesSquare,
  Target,
  Workflow,
  FileStack,
  ChevronLeft,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { CONSULTANT, projects } from "../data/mock";
import { Tooltip } from "./Tooltip";
import { ThemeToggle } from "./ThemeToggle";
import { useSidebar } from "../hooks/useSidebar";

const projectNav = [
  { to: "", label: "Overview", icon: LayoutGrid, end: true },
  { to: "research", label: "Research", icon: FlaskConical },
  { to: "discovery", label: "Discovery Questions", icon: MessagesSquare },
  { to: "opportunities", label: "Opportunities", icon: Target },
  { to: "process-map", label: "Process Map", icon: Workflow },
  { to: "sources", label: "Sources", icon: FileStack },
];

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  onNavigate: () => void;
}) {
  return (
    <NavLink to={to} end={end} className="nav-item" aria-label={label} onClick={onNavigate}>
      <Icon aria-hidden />
      <span className="nav-item__label">{label}</span>
      <span className="nav-item__tip" role="tooltip">
        {label}
      </span>
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
        {!inProject ? (
          <>
            <div className="nav-group-label">Workspace</div>
            <NavItem
              to="/projects"
              label="Projects"
              icon={FolderKanban}
              onNavigate={onNavigate}
            />
          </>
        ) : (
          <>
            <NavLink
              to="/projects"
              end
              className="nav-back nav-item"
              aria-label="All projects"
              onClick={onNavigate}
            >
              <ChevronLeft aria-hidden />
              <span className="nav-item__label">All projects</span>
              <span className="nav-item__tip" role="tooltip">
                All projects
              </span>
            </NavLink>
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
          >
            {effectiveCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            <span className="nav-item__label">
              {effectiveCollapsed ? "Expand" : "Collapse"}
            </span>
            <span className="nav-item__tip" role="tooltip">
              Expand sidebar
            </span>
          </button>
        )}

        <div className="theme-row">
          <span className="theme-row__label">Theme</span>
          <ThemeToggle />
        </div>

        <div className="userchip">
          <div className="avatar">{CONSULTANT.initials}</div>
          <div className="userchip__text">
            <span className="userchip__name truncate">{CONSULTANT.name}</span>
            <span className="userchip__role truncate">{CONSULTANT.role}</span>
          </div>
          <Tooltip label="Settings — available in a later phase">
            <button className="icon-btn userchip__settings" disabled aria-label="Settings">
              <Settings />
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
