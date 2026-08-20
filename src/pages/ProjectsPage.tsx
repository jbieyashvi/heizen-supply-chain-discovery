import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  FolderSearch,
  LayoutGrid,
  Rows3,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ProjectItem, type ProjectView } from "../components/ProjectItem";
import { NewProjectPanel } from "../components/NewProjectPanel";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { useToast } from "../components/Toast";
import { INDUSTRIES, projects as seedProjects } from "../data/mock";
import type { Project } from "../data/types";

type Scope = "active" | "inactive" | "all";

type FilterId =
  | "all"
  | "mine"
  | "calls-week"
  | "attention"
  | "running"
  | "ready";

type SortId = "updated" | "meeting" | "priority" | "name";

/** Rows shown before "Show more". */
const PAGE_SIZE = 5;
const VIEW_KEY = "heizen-v2-projects-view";

const scopes: { id: Scope; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "all", label: "All" },
];

const filters: { id: FilterId; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "mine", label: "My projects" },
  { id: "calls-week", label: "Calls this week" },
  { id: "attention", label: "Needs attention" },
  { id: "running", label: "Research running" },
  { id: "ready", label: "Ready for call" },
];

const sorts: { id: SortId; label: string }[] = [
  { id: "updated", label: "Recent activity" },
  { id: "meeting", label: "Next meeting" },
  { id: "priority", label: "Priority" },
  { id: "name", label: "Client name" },
];

const isActive = (p: Project) => p.active !== false;

function matchesScope(p: Project, s: Scope): boolean {
  if (s === "all") return true;
  return s === "active" ? isActive(p) : !isActive(p);
}

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
  "In 5 days": 3,
  "Next week": 4,
  Completed: 5,
};

function compare(a: Project, b: Project, s: SortId): number {
  switch (s) {
    case "meeting": {
      const av = a.meeting ? meetingOrder[a.meeting.relative] ?? 5 : 9;
      const bv = b.meeting ? meetingOrder[b.meeting.relative] ?? 5 : 9;
      return av - bv;
    }
    case "updated":
      return b.lastActivityAt - a.lastActivityAt;
    case "priority":
      return a.priority - b.priority;
    case "name":
      return a.name.localeCompare(b.name);
  }
}

/** Active projects always lead; the chosen sort orders within each group. */
function sortProjects(list: Project[], s: SortId): Project[] {
  return [...list].sort(
    (a, b) => Number(isActive(b)) - Number(isActive(a)) || compare(a, b, s)
  );
}

function readView(): ProjectView {
  try {
    return localStorage.getItem(VIEW_KEY) === "card" ? "card" : "list";
  } catch {
    return "list";
  }
}

/* ---------- Edit details (prototype, session only) ---------- */
function EditProjectModal({
  project,
  onClose,
  onSave,
}: {
  project: Project | null;
  onClose: () => void;
  onSave: (p: Project) => void;
}) {
  const [draft, setDraft] = useState(project);
  useEffect(() => setDraft(project), [project]);
  if (!project || !draft) return null;

  const set = (patch: Partial<Project>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));
  const canSave = Boolean(draft.name.trim() && draft.client.trim());

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit project details"
      subtitle="Prototype — changes apply to this session only."
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!canSave}
            onClick={() => onSave(draft)}
          >
            Save changes
          </button>
        </>
      }
    >
      <div className="field">
        <label className="field__label" htmlFor="ep-name">
          Project name
        </label>
        <input
          id="ep-name"
          className="field-control"
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="ep-client">
          Client / company name
        </label>
        <input
          id="ep-client"
          className="field-control"
          value={draft.client}
          onChange={(e) => set({ client: e.target.value })}
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="ep-industry">
          Industry
        </label>
        <div className="select-wrap">
          <select
            id="ep-industry"
            className="field-control"
            value={draft.industry}
            onChange={(e) => set({ industry: e.target.value })}
          >
            {[
              draft.industry,
              ...INDUSTRIES.filter((i) => i !== draft.industry),
            ].map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden />
        </div>
      </div>
      <div className="field">
        <label className="field__label" htmlFor="ep-owner">
          Owner
        </label>
        <input
          id="ep-owner"
          className="field-control"
          value={draft.owner}
          onChange={(e) => set({ owner: e.target.value })}
        />
      </div>
    </Modal>
  );
}

export function ProjectsPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<Project[]>(() =>
    seedProjects.map((p) => ({ ...p }))
  );
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("active");
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId>("updated");
  const [view, setView] = useState<ProjectView>(readView);
  const [expanded, setExpanded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const setViewPref = (v: ProjectView) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* storage unavailable — view stays session-only */
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((p) => {
      if (!matchesScope(p, scope)) return false;
      if (!matchesFilter(p, filter)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.stakeholder.name.toLowerCase().includes(q)
      );
    });
    return sortProjects(filtered, sort);
  }, [items, query, scope, filter, sort]);

  // A new result set always starts collapsed at the first five.
  useEffect(() => setExpanded(false), [query, scope, filter, sort]);

  const shown = expanded ? visible : visible.slice(0, PAGE_SIZE);
  const hidden = visible.length - shown.length;
  const isFiltered = scope !== "active" || filter !== "all" || Boolean(query);

  const reset = () => {
    setScope("active");
    setFilter("all");
    setQuery("");
  };

  const actions = {
    onEdit: (p: Project) => setEditing(p),
    onDelete: (p: Project) => setDeleting(p),
    onToggleActive: (p: Project) => {
      const next = !isActive(p);
      setItems((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, active: next } : x))
      );
      notify({
        title: next ? "Project marked active" : "Project marked inactive",
        body: `${p.name} — prototype, this session only.`,
        tone: "info",
      });
    },
  };

  const saveEdit = (p: Project) => {
    setItems((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    setEditing(null);
    notify({
      title: "Project updated",
      body: `${p.name} — prototype, this session only.`,
      tone: "info",
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setItems((prev) => prev.filter((x) => x.id !== deleting.id));
    notify({
      title: "Project deleted",
      body: `${deleting.name} — prototype, this session only.`,
      tone: "info",
    });
    setDeleting(null);
  };

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Workspace" }, { label: "Projects" }]}
        title={<h1 className="page-title">Projects</h1>}
        subtitle="Your discovery work queue — open a project to see what to prepare next."
        actions={
          <button className="btn btn-primary" onClick={() => setPanelOpen(true)}>
            <Plus />
            New project
          </button>
        }
      />

      <div className="toolbar ptoolbar">
        <div className="searchbox">
          <Search aria-hidden />
          <input
            type="search"
            placeholder="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects"
          />
        </div>

        <div className="tgl" role="group" aria-label="Filter by status">
          {scopes.map((s) => (
            <button
              key={s.id}
              className={`tgl__btn${scope === s.id ? " is-active" : ""}`}
              aria-pressed={scope === s.id}
              onClick={() => setScope(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="pselect">
          <label htmlFor="p-filter" className="sr-only">
            Filter projects
          </label>
          <select
            id="p-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterId)}
          >
            {filters.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden />
        </div>

        <div className="pselect">
          <label htmlFor="p-sort" className="sr-only">
            Sort projects
          </label>
          <select
            id="p-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
          >
            {sorts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden />
        </div>

        <div className="tgl tgl--icons" role="group" aria-label="Change layout">
          <button
            className={`tgl__btn tgl__btn--icon${
              view === "list" ? " is-active" : ""
            }`}
            aria-pressed={view === "list"}
            aria-label="List view"
            title="List view"
            onClick={() => setViewPref("list")}
          >
            <Rows3 aria-hidden />
          </button>
          <button
            className={`tgl__btn tgl__btn--icon${
              view === "card" ? " is-active" : ""
            }`}
            aria-pressed={view === "card"}
            aria-label="Card view"
            title="Card view"
            onClick={() => setViewPref("card")}
          >
            <LayoutGrid aria-hidden />
          </button>
        </div>
      </div>

      <div className="results-meta">
        <span>
          {visible.length} {visible.length === 1 ? "project" : "projects"}
        </span>
        {isFiltered && (
          <button className="link-btn" onClick={reset}>
            Reset
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<FolderSearch />}
          title="No projects match"
          body="Try a different filter or clear your search to see the full work queue."
          action={
            <button className="btn" onClick={reset}>
              Reset filters
            </button>
          }
        />
      ) : view === "card" ? (
        <div className="pcards">
          {shown.map((p) => (
            <ProjectItem key={p.id} project={p} view="card" actions={actions} />
          ))}
        </div>
      ) : (
        <div className="plist" role="table" aria-label="Projects">
          <div className="plist__head" role="row">
            <span role="columnheader">Project</span>
            <span role="columnheader">Industry</span>
            <span role="columnheader">Stage</span>
            <span role="columnheader">Last activity</span>
            <span role="columnheader">Owner</span>
            <span role="columnheader">Readiness</span>
            <span role="columnheader" className="sr-only">
              Actions
            </span>
          </div>
          {shown.map((p) => (
            <ProjectItem key={p.id} project={p} view="list" actions={actions} />
          ))}
        </div>
      )}

      {(hidden > 0 || expanded) && visible.length > PAGE_SIZE && (
        <div className="pmore">
          <button className="link-btn" onClick={() => setExpanded((v) => !v)}>
            {hidden > 0 ? `Show ${hidden} more` : "Show less"}
          </button>
        </div>
      )}

      <NewProjectPanel open={panelOpen} onClose={() => setPanelOpen(false)} />

      <EditProjectModal
        project={editing}
        onClose={() => setEditing(null)}
        onSave={saveEdit}
      />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete project?"
        subtitle={
          deleting
            ? `${deleting.name} will be removed from your queue.`
            : undefined
        }
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Delete project
            </button>
          </>
        }
      >
        <p className="muted" style={{ fontSize: 13 }}>
          Research, questions and opportunities gathered for this project go with
          it. Prototype — this removes the project for this session only.
        </p>
      </Modal>
    </div>
  );
}
