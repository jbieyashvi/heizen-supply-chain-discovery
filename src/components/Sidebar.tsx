import { NavLink, useParams } from "react-router-dom";
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
} from "lucide-react";
import { CONSULTANT, projects } from "../data/mock";
import { Tooltip } from "./Tooltip";

const projectNav = [
  { to: "", label: "Overview", icon: LayoutGrid, active: true, end: true },
  { to: "research", label: "Research", icon: FlaskConical, active: false },
  { to: "discovery", label: "Discovery", icon: MessagesSquare, active: false },
  { to: "opportunities", label: "Opportunities", icon: Target, active: false },
  { to: "process-map", label: "Process Map", icon: Workflow, active: false },
  { to: "sources", label: "Sources", icon: FileStack, active: false },
];

function HeizenMark() {
  return (
    <div className="brand">
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

  return (
    <aside className="sidebar">
      <HeizenMark />

      <nav className="sidebar__nav" aria-label="Primary">
        {!inProject ? (
          <>
            <div className="nav-group-label">Workspace</div>
            <NavLink to="/projects" className="nav-item" end={false}>
              <FolderKanban />
              <span>Projects</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/projects" className="nav-back">
              <ChevronLeft />
              <span>All projects</span>
            </NavLink>
            <div className="nav-project">
              <span className="nav-project__name truncate">{project?.name}</span>
              <span className="nav-project__meta truncate">
                {project?.industry}
              </span>
            </div>
            <div className="nav-group-label">Project</div>
            {projectNav.map((item) => {
              const Icon = item.icon;
              const to = item.to
                ? `/projects/${projectId}/${item.to}`
                : `/projects/${projectId}`;
              return (
                <NavLink
                  key={item.label}
                  to={to}
                  end={item.end}
                  className="nav-item"
                >
                  <Icon />
                  <span>{item.label}</span>
                  {!item.active && (
                    <span className="nav-item__soon">Soon</span>
                  )}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      <div className="sidebar__foot">
        <Tooltip label="Settings — available in a later phase">
          <button className="nav-item nav-item--btn" disabled>
            <Settings />
            <span>Settings</span>
          </button>
        </Tooltip>
        <div className="userchip">
          <div className="avatar">{CONSULTANT.initials}</div>
          <div className="userchip__text">
            <span className="userchip__name truncate">{CONSULTANT.name}</span>
            <span className="userchip__role truncate">{CONSULTANT.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
