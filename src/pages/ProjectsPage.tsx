import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  CalendarClock,
  FlaskConical,
  AlertTriangle,
  CircleCheck,
  SlidersHorizontal,
  FolderSearch,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ProjectItem } from "../components/ProjectItem";
import { NewProjectPanel } from "../components/NewProjectPanel";
import { EmptyState } from "../components/EmptyState";
import { projects } from "../data/mock";
import type { Project } from "../data/types";

type FilterId =
  | "all"
  | "mine"
  | "calls-week"
  | "attention"
  | "running"
  | "ready";

type SortId = "meeting" | "updated" | "priority" | "name";

const filters: { id: FilterId; label: string }[] = [
  { id: "all", label: "All projects" },
  { id: "mine", label: "My projects" },
  { id: "calls-week", label: "Calls this week" },
  { id: "attention", label: "Needs attention" },
  { id: "running", label: "Research running" },
  { id: "ready", label: "Ready for call" },
];

const sorts: { id: SortId; label: string }[] = [
  { id: "meeting", label: "Next meeting" },
  { id: "updated", label: "Recently updated" },
  { id: "priority", label: "Priority" },
  { id: "name", label: "Client name" },
];

function matchesFilter(p: Project, f: FilterId): boolean {
  switch (f) {
    case "all":
      return true;
    case "mine":
      return p.isMine;
    case "calls-week":
      return p.callThisWeek;
    case "attention":
      return p.readiness === "needs-attention";
    case "running":
      return p.research === "running";
    case "ready":
      return p.readiness === "ready";
  }
}

const meetingOrder: Record<string, number> = {
  Tomorrow: 1,
  "In 3 days": 2,
  "Next week": 3,
  Completed: 4,
};

function sortProjects(list: Project[], s: SortId): Project[] {
  const arr = [...list];
  switch (s) {
    case "meeting":
      return arr.sort((a, b) => {
        const av = a.meeting ? meetingOrder[a.meeting.relative] ?? 5 : 9;
        const bv = b.meeting ? meetingOrder[b.meeting.relative] ?? 5 : 9;
        return av - bv;
      });
    case "updated":
      return arr.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
    case "priority":
      return arr.sort((a, b) => a.priority - b.priority);
    case "name":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
  }
}

function SummaryStrip() {
  const callsThisWeek = projects.filter((p) => p.callThisWeek).length;
  const running = projects.filter((p) => p.research === "running").length;
  const attention = projects.filter(
    (p) => p.readiness === "needs-attention"
  ).length;
  const ready = projects.filter((p) => p.readiness === "ready").length;

  const cells = [
    {
      icon: <CalendarClock />,
      value: callsThisWeek,
      label: "Calls this week",
      tone: "info",
    },
    {
      icon: <FlaskConical />,
      value: running,
      label: "Research in progress",
      tone: "info",
    },
    {
      icon: <AlertTriangle />,
      value: attention,
      label: "Need attention",
      tone: "amber",
    },
    {
      icon: <CircleCheck />,
      value: ready,
      label: "Ready for discovery",
      tone: "green",
    },
  ];

  return (
    <div className="summary-strip" role="group" aria-label="Workspace summary">
      {cells.map((c) => (
        <div className="summary-cell" key={c.label}>
          <span className={`summary-cell__icon tone-${c.tone}`} aria-hidden>
            {c.icon}
          </span>
          <span className="summary-cell__value">{c.value}</span>
          <span className="summary-cell__label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId>("meeting");
  const [panelOpen, setPanelOpen] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = projects.filter((p) => {
      if (!matchesFilter(p, filter)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q) ||
        p.stakeholder.name.toLowerCase().includes(q)
      );
    });
    return sortProjects(filtered, sort);
  }, [query, filter, sort]);

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Workspace" }, { label: "Projects" }]}
        title={<h1 className="page-title">Projects</h1>}
        subtitle="Your discovery work queue — what to prepare, and what to do next before each client call."
        actions={
          <button className="btn btn-primary" onClick={() => setPanelOpen(true)}>
            <Plus />
            New project
          </button>
        }
      />

      <SummaryStrip />

      <div className="toolbar">
        <div className="searchbox">
          <Search aria-hidden />
          <input
            type="search"
            placeholder="Search by client, industry or stakeholder"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects"
          />
        </div>

        <div className="filter-chips" role="tablist" aria-label="Filter projects">
          {filters.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              className={`chip${filter === f.id ? " is-active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="sort-control">
          <SlidersHorizontal aria-hidden className="sort-control__icon" />
          <label htmlFor="sort" className="sr-only">
            Sort projects
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
          >
            {sorts.map((s) => (
              <option key={s.id} value={s.id}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-meta">
        <span>
          {visible.length} {visible.length === 1 ? "project" : "projects"}
        </span>
        {(filter !== "all" || query) && (
          <button
            className="link-btn"
            onClick={() => {
              setFilter("all");
              setQuery("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<FolderSearch />}
          title="No projects match"
          body="Try a different filter or clear your search to see the full work queue."
          action={
            <button
              className="btn"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="project-list">
          {visible.map((p) => (
            <ProjectItem key={p.id} project={p} />
          ))}
        </div>
      )}

      <NewProjectPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
