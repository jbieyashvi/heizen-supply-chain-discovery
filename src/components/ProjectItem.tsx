import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Archive,
  ArchiveRestore,
  ArrowRight,
  FileStack,
  FlaskConical,
  HelpCircle,
  MoreHorizontal,
  Pencil,
  Target,
  Trash2,
} from "lucide-react";
import type { Project } from "../data/types";
import { readinessMeta } from "../lib/status";
import { readStage, stageMeta } from "../lib/stage";
import { useClickOutside } from "../hooks/useClickOutside";

export type ProjectView = "list" | "card";

export interface ProjectActions {
  onEdit: (p: Project) => void;
  onToggleActive: (p: Project) => void;
  onDelete: (p: Project) => void;
}

/** "Transcript processed · 2h ago" → "2h ago" (full text stays in the title). */
function activityWhen(text: string): string {
  const parts = text.split("·");
  return (parts.length > 1 ? parts[parts.length - 1] : text).trim();
}

/** Readiness as a single coloured dot + label — the one status colour per row. */
function Readiness({ state }: { state: Project["readiness"] }) {
  const m = readinessMeta[state];
  return (
    <span className={`pstate tone-${m.tone}`} title={m.help}>
      <span className="pstate__dot" aria-hidden />
      <span className="pstate__label">{m.label}</span>
    </span>
  );
}

/* ---------- Secondary actions ---------- */
function RowMenu({
  project,
  actions,
}: {
  project: Project;
  actions: ProjectActions;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false), open);

  const inactive = project.active === false;
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  const go = (sub: string) => () => navigate(`/projects/${project.id}/${sub}`);

  return (
    <div className="menu" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        className="icon-btn icon-btn--sm"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${project.name}`}
      >
        <MoreHorizontal />
      </button>
      {open && (
        <div className="menu__pop" role="menu">
          <button role="menuitem" onClick={run(go("research"))}>
            <FlaskConical /> Research brief
          </button>
          <button role="menuitem" onClick={run(go("discovery"))}>
            <HelpCircle /> Discovery questions
          </button>
          <button role="menuitem" onClick={run(go("opportunities"))}>
            <Target /> Opportunities
          </button>
          <button role="menuitem" onClick={run(go("sources"))}>
            <FileStack /> Sources
          </button>
          <div className="menu__sep" />
          <button role="menuitem" onClick={run(() => actions.onEdit(project))}>
            <Pencil /> Edit details
          </button>
          <button
            role="menuitem"
            onClick={run(() => actions.onToggleActive(project))}
          >
            {inactive ? <ArchiveRestore /> : <Archive />}
            {inactive ? "Mark active" : "Mark inactive"}
          </button>
          <div className="menu__sep" />
          <button
            role="menuitem"
            className="is-danger"
            onClick={run(() => actions.onDelete(project))}
          >
            <Trash2 /> Delete project
          </button>
        </div>
      )}
    </div>
  );
}

/** The single primary action on a project. */
function OpenAction({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="popen"
      onClick={(e) => e.stopPropagation()}
    >
      Open project
      <ArrowRight aria-hidden />
    </Link>
  );
}

export function ProjectItem({
  project,
  view = "list",
  actions,
}: {
  project: Project;
  view?: ProjectView;
  actions: ProjectActions;
}) {
  const navigate = useNavigate();
  const stage = stageMeta[readStage(project.id)];
  const inactive = project.active === false;
  const open = () => navigate(`/projects/${project.id}`);

  if (view === "card") {
    return (
      <article
        className={`pcard${inactive ? " is-inactive" : ""}`}
        onClick={open}
      >
        <div className="pcard__head">
          <div className="pcard__id">
            <h3 className="pcard__name">{project.name}</h3>
            <span className="pcell__sub">{project.industry}</span>
          </div>
          <RowMenu project={project} actions={actions} />
        </div>

        <dl className="pcard__meta">
          <div>
            <dt>Stage</dt>
            <dd>{stage.label}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{project.owner}</dd>
          </div>
          <div>
            <dt>Last activity</dt>
            <dd>{project.lastActivity}</dd>
          </div>
        </dl>

        <div className="pcard__foot">
          <Readiness state={project.readiness} />
          <OpenAction project={project} />
        </div>
      </article>
    );
  }

  return (
    <div
      className={`prow${inactive ? " is-inactive" : ""}`}
      onClick={open}
      role="row"
    >
      <div className="pcell pcell--name" role="cell">
        <Link
          to={`/projects/${project.id}`}
          className="pcell__name"
          onClick={(e) => e.stopPropagation()}
        >
          {project.name}
        </Link>
        {/* Industry rides under the name below the table breakpoint. */}
        <span className="pcell__sub pcell__sub--inline">{project.industry}</span>
      </div>

      <div className="pcell pcell--industry" role="cell" title={project.industry}>
        {project.industry}
      </div>

      {/* display:contents on wide screens — the three cells stay table
          columns, and regroup into one meta line once the table collapses. */}
      <div className="prow__meta">
        <div className="pcell pcell--stage" role="cell">
          <span className="pcell__k">Stage</span>
          {stage.label}
        </div>

        <div
          className="pcell pcell--activity"
          role="cell"
          title={project.lastActivity}
        >
          <span className="pcell__k">Last activity</span>
          {activityWhen(project.lastActivity)}
        </div>

        <div className="pcell pcell--owner" role="cell">
          <span className="pcell__k">Owner</span>
          {project.owner}
        </div>
      </div>

      <div className="pcell pcell--state" role="cell">
        <Readiness state={project.readiness} />
      </div>

      <div className="pcell pcell--actions" role="cell">
        <OpenAction project={project} />
        <RowMenu project={project} actions={actions} />
      </div>
    </div>
  );
}
