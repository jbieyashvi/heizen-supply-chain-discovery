import { useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  FileSearch,
  CalendarClock,
  CalendarOff,
  User,
  ArrowRight,
  AlertTriangle,
  Download,
  Archive,
  Bell,
  CircleHelp,
  Info,
  Loader,
  Rocket,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ReadinessStepItem } from "../components/ReadinessStepItem";
import { InsightItem } from "../components/InsightItem";
import { QuestionPreview } from "../components/QuestionPreview";
import { OpportunityPreview } from "../components/OpportunityPreview";
import { ActivityFeed } from "../components/ActivityFeed";
import { ReadinessBadge, FreshnessBadge } from "../components/StatusBadges";
import { EmptyState } from "../components/EmptyState";
import { Tooltip } from "../components/Tooltip";
import { useToast } from "../components/Toast";
import { useClickOutside } from "../hooks/useClickOutside";
import { projects, projectDetails } from "../data/mock";
import type { Project } from "../data/types";
import { readinessMeta } from "../lib/status";

/* ------------------------------------------------------------------ */
function ProjectSwitcher({ currentId }: { currentId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false), open);
  const current = projects.find((p) => p.id === currentId)!;

  return (
    <div className="switcher" ref={ref}>
      <button
        className="switcher__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <h1 className="page-title">{current.name}</h1>
        <ChevronDown aria-hidden />
      </button>
      {open && (
        <div className="switcher__pop" role="listbox">
          <div className="switcher__label">Switch project</div>
          {projects.map((p) => (
            <button
              key={p.id}
              role="option"
              aria-selected={p.id === currentId}
              className={`switcher__opt${p.id === currentId ? " is-sel" : ""}`}
              onClick={() => {
                setOpen(false);
                navigate(`/projects/${p.id}`);
              }}
            >
              <span className="switcher__opt-name">{p.name}</span>
              <span className="switcher__opt-meta">{p.industry}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OverflowMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notify } = useToast();
  useClickOutside(ref, () => setOpen(false), open);

  const act = (label: string) => {
    setOpen(false);
    notify({ title: label, body: "Prototype action — no changes were made.", tone: "info" });
  };

  return (
    <div className="menu" ref={ref}>
      <button
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
      >
        <MoreHorizontal />
      </button>
      {open && (
        <div className="menu__pop" role="menu">
          <button role="menuitem" onClick={() => act("Export brief")}>
            <Download /> Export brief
          </button>
          <button role="menuitem" onClick={() => act("Manage reminders")}>
            <Bell /> Manage reminders
          </button>
          <div className="menu__sep" />
          <button role="menuitem" onClick={() => act("Archive project")}>
            <Archive /> Archive project
          </button>
        </div>
      )}
    </div>
  );
}

/* Compact header meta: header owns meeting + stakeholder (+ light identity). */
function HeaderMeta({ project }: { project: Project }) {
  return (
    <div className="proj-meta">
      <span className="proj-meta__item">{project.industry}</span>
      <span className="dotsep">·</span>
      <span className="proj-meta__item">
        <User aria-hidden /> {project.owner}
      </span>
      <span className="dotsep">·</span>
      <span className="proj-meta__item">
        Stakeholder{" "}
        <b>
          {project.stakeholder.name === "—"
            ? "not identified"
            : `${project.stakeholder.name}, ${project.stakeholder.role}`}
        </b>
      </span>
      <span className="dotsep">·</span>
      <span className="proj-meta__item accent">
        {project.meeting ? (
          <>
            <CalendarClock aria-hidden /> {project.meeting.relative} ·{" "}
            {project.meeting.date}, {project.meeting.time}
          </>
        ) : (
          <>
            <CalendarOff aria-hidden /> No meeting scheduled
          </>
        )}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function ProjectOverviewPage() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);
  const detail = projectId ? projectDetails[projectId] : undefined;

  if (!project) {
    return (
      <div className="page">
        <EmptyState
          icon={<FileSearch />}
          title="Project not found"
          body="This project may have been removed or the link is out of date."
          action={
            <Link className="btn btn-primary" to="/projects">
              Back to projects
            </Link>
          }
        />
      </div>
    );
  }

  return detail ? (
    <FullOverview projectId={projectId!} project={project} detail={detail} />
  ) : (
    <GenericOverview project={project} />
  );
}

/* ============ Full overview (Clio Snacks) ============ */
function FullOverview({
  projectId,
  project,
  detail,
}: {
  projectId: string;
  project: Project;
  detail: NonNullable<(typeof projectDetails)[string]>;
}) {
  const { notify } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const doRefresh = () => {
    if (refreshing || refreshed) return;
    setRefreshing(true);
    notify({ title: "Refreshing research", body: "Folding 2 new sources into the brief…", tone: "info" });
    setTimeout(() => {
      setRefreshing(false);
      setRefreshed(true);
      notify({
        title: "Research refreshed",
        body: "The brief now includes all 5 sources. Freshness: up to date.",
      });
    }, 2200);
  };

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Projects", to: "/projects" }, { label: project.name }]}
        title={<ProjectSwitcher currentId={projectId} />}
        actions={
          <div className="row" style={{ gap: 10 }}>
            <ReadinessBadge state={refreshed ? "ready" : project.readiness} withTip />
            <OverflowMenu />
          </div>
        }
        meta={<HeaderMeta project={project} />}
      />

      {/* Compact attention notice — owns research freshness */}
      {detail.attention && !refreshed && (
        <div className="notice notice--warn" role="region" aria-label="Research status">
          <span className="notice__icon" aria-hidden>
            <AlertTriangle />
          </span>
          <div className="notice__main">
            <div className="notice__text">
              <span className="notice__title">{detail.attention.title}</span>
              <span className="notice__body">{detail.attention.body}</span>
            </div>
            {detailsOpen && (
              <p className="notice__detail">{detail.attention.detail}</p>
            )}
            <button
              className="notice__toggle"
              onClick={() => setDetailsOpen((v) => !v)}
              aria-expanded={detailsOpen}
            >
              {detailsOpen ? "Hide details" : "What changed?"}
              <ChevronDown className={detailsOpen ? "is-open" : ""} aria-hidden />
            </button>
          </div>
          <div className="notice__actions">
            <button
              className="btn btn-sm"
              onClick={() =>
                notify({
                  title: "Source changes",
                  body: "2 new sources: 13 Aug follow-up operations call transcript, 14 Aug vendor support addendum.",
                  tone: "info",
                })
              }
            >
              Review changes
            </button>
            <button className="btn btn-primary btn-sm" onClick={doRefresh} disabled={refreshing}>
              <RefreshCw className={refreshing ? "spin" : ""} />
              {refreshing ? "Refreshing…" : "Refresh research"}
            </button>
          </div>
        </div>
      )}

      {refreshed && (
        <div className="notice notice--ok" role="status">
          <span className="notice__icon" aria-hidden>
            <RefreshCw />
          </span>
          <div className="notice__main">
            <div className="notice__text">
              <span className="notice__title">Brief up to date</span>
              <span className="notice__body">
                All 5 sources are now included. You're ready to prepare for tomorrow's call.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Briefing area — fits the first viewport: left readiness, right action + findings */}
      <div className="briefing">
        <section className="card card-pad briefing__left">
          <div className="section-head">
            <div>
              <h2 className="block-title">Call readiness</h2>
              <p className="block-sub">Where preparation stands for the next call.</p>
            </div>
          </div>
          <div className="readiness">
            {detail.readiness.map((step, i) => (
              <ReadinessStepItem
                key={step.id}
                step={
                  refreshed && step.id === "research"
                    ? { ...step, state: "done", detail: "Up to date — all sources included", meta: "Current" }
                    : step
                }
                projectId={projectId}
                index={i}
                total={detail.readiness.length}
              />
            ))}
          </div>
        </section>

        <div className="briefing__right">
          {/* Recommended next action — owns "what to do next" */}
          <section className="nextcard">
            <span className="nextcard__eyebrow">Recommended next action</span>
            <p className="nextcard__headline">{detail.nextAction.headline}</p>
            <p className="nextcard__detail">{detail.nextAction.detail}</p>
            <div className="nextcard__actions">
              <Link to={`/projects/${projectId}/discovery`} className="btn btn-primary">
                {detail.nextAction.primary}
                <ArrowRight />
              </Link>
              <Link to={`/projects/${projectId}/research`} className="btn btn-ghost">
                {detail.nextAction.secondary}
              </Link>
            </div>
          </section>

          {/* Top findings preview — visible in the first viewport */}
          <section className="card card-pad">
            <div className="section-head">
              <div>
                <h2 className="block-title">Top findings</h2>
                <p className="block-sub">The three that matter most. Expand for evidence.</p>
              </div>
              <Tooltip label="Every finding is labelled by how it was established, from client-confirmed fact to unverified assumption.">
                <span className="hint-chip">
                  <CircleHelp aria-hidden /> Evidence
                </span>
              </Tooltip>
            </div>
            <div className="insights">
              {detail.insights.map((ins, i) => (
                <InsightItem key={ins.id} insight={ins} rank={i + 1} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Lower detail */}
      <section className="card card-pad overview-block">
        <div className="section-head">
          <div>
            <h2 className="block-title">Critical questions</h2>
            <p className="block-sub">Highest-value questions to ask on the next call.</p>
          </div>
          <Link to={`/projects/${projectId}/discovery`} className="btn btn-sm">
            Continue call preparation
            <ArrowRight />
          </Link>
        </div>
        <div className="questions">
          {detail.questions.map((q) => (
            <QuestionPreview key={q.id} q={q} />
          ))}
        </div>
      </section>

      <div className="overview-lower">
        <section className="card card-pad">
          <div className="section-head">
            <div>
              <h2 className="block-title">Opportunities</h2>
              <p className="block-sub">
                Potential Heizen fits. Unconfirmed items are marked — treat them as
                hypotheses, not facts.
              </p>
            </div>
            <Link to={`/projects/${projectId}/opportunities`} className="btn btn-sm btn-ghost">
              View all
              <ArrowRight />
            </Link>
          </div>
          <div className="opps">
            {detail.opportunities.map((opp) => (
              <OpportunityPreview key={opp.id} opp={opp} />
            ))}
          </div>
        </section>

        <section className="card card-pad">
          <div className="section-head">
            <h2 className="block-title">Recent activity</h2>
          </div>
          <ActivityFeed items={detail.activity} />
        </section>
      </div>
    </div>
  );
}

/* ============ Generic overview (other projects) ============ */
const stateNotice: Record<
  Project["readiness"],
  { tone: string; icon: typeof Info; title: string } | null
> = {
  ready: { tone: "ok", icon: Rocket, title: "Ready for discovery" },
  "needs-attention": { tone: "warn", icon: AlertTriangle, title: "Needs attention" },
  running: { tone: "info", icon: Loader, title: "Research in progress" },
  processing: { tone: "info", icon: Loader, title: "Processing" },
  setup: { tone: "violet", icon: Info, title: "Setup required" },
};

function GenericOverview({ project }: { project: Project }) {
  const notice = stateNotice[project.readiness];
  const rm = readinessMeta[project.readiness];

  const facts: { label: string; value: React.ReactNode }[] = [
    {
      label: "Next meeting",
      value: project.meeting
        ? `${project.meeting.relative} · ${project.meeting.date}, ${project.meeting.time}`
        : "Not scheduled",
    },
    { label: "Owner", value: project.owner },
    {
      label: "Primary stakeholder",
      value:
        project.stakeholder.name === "—"
          ? "Not identified"
          : `${project.stakeholder.name}, ${project.stakeholder.role}`,
    },
    {
      label: "Research",
      value:
        project.research === "running"
          ? `Running · ${project.researchProgress}%`
          : project.research === "not-started"
          ? "Not started"
          : "Complete",
    },
    {
      label: "Critical questions",
      value: project.criticalOpenQuestions > 0 ? `${project.criticalOpenQuestions} open` : "None open",
    },
    {
      label: "Opportunities",
      value: project.confirmedOpportunities > 0 ? `${project.confirmedOpportunities} identified` : "—",
    },
  ];

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Projects", to: "/projects" }, { label: project.name }]}
        title={<ProjectSwitcher currentId={project.id} />}
        actions={
          <div className="row" style={{ gap: 10 }}>
            <ReadinessBadge state={project.readiness} withTip />
            <OverflowMenu />
          </div>
        }
        meta={<HeaderMeta project={project} />}
      />

      {notice && (
        <div className={`notice notice--${notice.tone}`} role="status">
          <span className="notice__icon" aria-hidden>
            <notice.icon className={project.readiness === "running" ? "spin" : ""} />
          </span>
          <div className="notice__main">
            <div className="notice__text">
              <span className="notice__title">{notice.title}</span>
              <span className="notice__body">{rm.help}</span>
            </div>
          </div>
        </div>
      )}

      <div className="briefing">
        <section className="card card-pad briefing__left">
          <div className="section-head">
            <div>
              <h2 className="block-title">Project snapshot</h2>
              <p className="block-sub">Key facts for {project.name}.</p>
            </div>
            <FreshnessBadge state={project.freshness} />
          </div>
          <dl className="facts">
            {facts.map((f) => (
              <div className="facts__row" key={f.label}>
                <dt className="facts__k">{f.label}</dt>
                <dd className="facts__v">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="briefing__right">
          <section className="nextcard">
            <span className="nextcard__eyebrow">Recommended next action</span>
            <p className="nextcard__headline">{project.nextAction}</p>
            <p className="nextcard__detail">
              Last activity: {project.lastActivity}.
            </p>
            <div className="nextcard__actions">
              <Link to={`/projects/${project.id}/research`} className="btn btn-primary">
                Open research
                <ArrowRight />
              </Link>
              <Link to="/projects" className="btn btn-ghost">
                Back to all projects
              </Link>
            </div>
          </section>

          <section className="card card-pad">
            <div className="section-head">
              <h2 className="block-title">What happens next</h2>
            </div>
            <p className="generic-note">
              Detailed findings, discovery questions and opportunities are generated
              per project as research completes. Clio Snacks shows the full
              experience end-to-end.
            </p>
            <Link to="/projects/clio-snacks" className="btn btn-sm">
              See a completed example
              <ArrowRight />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
