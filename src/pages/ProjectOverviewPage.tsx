import { useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  FileSearch,
  CalendarClock,
  User,
  ArrowRight,
  AlertTriangle,
  Download,
  Archive,
  Bell,
  CircleHelp,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ReadinessStepItem } from "../components/ReadinessStepItem";
import { InsightItem } from "../components/InsightItem";
import { QuestionPreview } from "../components/QuestionPreview";
import { OpportunityPreview } from "../components/OpportunityPreview";
import { ActivityFeed } from "../components/ActivityFeed";
import { ReadinessBadge } from "../components/StatusBadges";
import { EmptyState } from "../components/EmptyState";
import { Tooltip } from "../components/Tooltip";
import { useToast } from "../components/Toast";
import { useClickOutside } from "../hooks/useClickOutside";
import { projects, projectDetails } from "../data/mock";

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

export function ProjectOverviewPage() {
  const { projectId } = useParams();
  const { notify } = useToast();
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

  if (!detail) {
    return (
      <div className="page">
        <PageHeader
          crumbs={[
            { label: "Projects", to: "/projects" },
            { label: project.name },
          ]}
          title={<h1 className="page-title">{project.name}</h1>}
        />
        <EmptyState
          icon={<FileSearch />}
          title="Overview not built yet"
          body={`${project.name} exists in the work queue, but its full overview is part of a later prototype phase. Clio Snacks has the complete experience.`}
          action={
            <Link className="btn btn-primary" to="/projects/clio-snacks">
              Open Clio Snacks overview
            </Link>
          }
        />
      </div>
    );
  }

  return <OverviewContent projectId={projectId!} project={project} detail={detail} notify={notify} />;
}

function OverviewContent({
  projectId,
  project,
  detail,
  notify,
}: {
  projectId: string;
  project: (typeof projects)[number];
  detail: NonNullable<(typeof projectDetails)[string]>;
  notify: ReturnType<typeof useToast>["notify"];
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);

  const doRefresh = () => {
    if (refreshing || refreshed) return;
    setRefreshing(true);
    notify({
      title: "Refreshing research",
      body: "Folding 2 new sources into the brief…",
      tone: "info",
    });
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
        crumbs={[
          { label: "Projects", to: "/projects" },
          { label: project.name },
        ]}
        title={<ProjectSwitcher currentId={projectId} />}
        actions={
          <div className="row" style={{ gap: 10 }}>
            <ReadinessBadge
              state={refreshed ? "ready" : project.readiness}
              withTip
            />
            <OverflowMenu />
          </div>
        }
        meta={
          <div className="proj-meta">
            <span className="proj-meta__item">{project.industry}</span>
            <span className="dotsep">·</span>
            <span className="proj-meta__item">
              <User aria-hidden /> Owner <b>{project.owner}</b>
            </span>
            <span className="dotsep">·</span>
            <span className="proj-meta__item">
              Stakeholder <b>{project.stakeholder.name}</b>, {project.stakeholder.role}
            </span>
            <span className="dotsep">·</span>
            <span className="proj-meta__item accent">
              <CalendarClock aria-hidden /> Call {project.meeting?.relative} ·{" "}
              {project.meeting?.date}, {project.meeting?.time}
            </span>
          </div>
        }
      />

      {/* Attention banner */}
      {detail.attention && !refreshed && (
        <div className="attention" role="region" aria-label="Needs attention">
          <span className="attention__icon" aria-hidden>
            <AlertTriangle />
          </span>
          <div className="attention__body">
            <p className="attention__msg">{detail.attention.message}</p>
            <p className="attention__note">{detail.attention.note}</p>
          </div>
          <div className="attention__actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={doRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={refreshing ? "spin" : ""} />
              {refreshing ? "Refreshing…" : "Refresh research"}
            </button>
            <button
              className="btn btn-sm"
              onClick={() =>
                notify({
                  title: "Source changes",
                  body: "2 new sources: vendor contract summary, discovery transcript.",
                  tone: "info",
                })
              }
            >
              Review source changes
            </button>
          </div>
        </div>
      )}

      {refreshed && (
        <div className="attention attention--ok" role="status">
          <span className="attention__icon" aria-hidden>
            <RefreshCw />
          </span>
          <div className="attention__body">
            <p className="attention__msg">
              Research is up to date. All 5 sources are included in the brief.
            </p>
            <p className="attention__note">
              You're ready to prepare for tomorrow's call.
            </p>
          </div>
        </div>
      )}

      {/* Two-column body */}
      <div className="overview-grid">
        <div className="overview-main">
          {/* Readiness */}
          <section className="card card-pad">
            <div className="section-head">
              <div>
                <h2 className="block-title">Call readiness</h2>
                <p className="block-sub">
                  Where preparation stands for tomorrow's discovery call.
                </p>
              </div>
            </div>
            <div className="readiness">
              {detail.readiness.map((step, i) => (
                <ReadinessStepItem
                  key={step.id}
                  step={
                    refreshed && step.id === "research"
                      ? {
                          ...step,
                          state: "done",
                          detail: "Up to date — all sources included",
                          meta: "Current",
                        }
                      : step
                  }
                  projectId={projectId}
                  index={i}
                  total={detail.readiness.length}
                />
              ))}
            </div>
          </section>

          {/* Top insights */}
          <section className="card card-pad">
            <div className="section-head">
              <div>
                <h2 className="block-title">Top insights</h2>
                <p className="block-sub">
                  The three findings that matter most. Expand for evidence.
                </p>
              </div>
              <Tooltip label="Every insight is labelled by how it was established, from client-confirmed fact to unverified assumption.">
                <span className="hint-chip">
                  <CircleHelp aria-hidden /> Evidence labels
                </span>
              </Tooltip>
            </div>
            <div className="insights">
              {detail.insights.map((ins, i) => (
                <InsightItem key={ins.id} insight={ins} rank={i + 1} />
              ))}
            </div>
          </section>

          {/* Critical questions */}
          <section className="card card-pad">
            <div className="section-head">
              <div>
                <h2 className="block-title">Critical questions</h2>
                <p className="block-sub">
                  Highest-value questions to ask on the next call.
                </p>
              </div>
              <Link
                to={`/projects/${projectId}/discovery`}
                className="btn btn-sm"
              >
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

          {/* Opportunities */}
          <section className="card card-pad">
            <div className="section-head">
              <div>
                <h2 className="block-title">Opportunities</h2>
                <p className="block-sub">
                  Potential Heizen fits. Unconfirmed items are marked — treat them
                  as hypotheses, not facts.
                </p>
              </div>
              <Link
                to={`/projects/${projectId}/opportunities`}
                className="btn btn-sm btn-ghost"
              >
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
        </div>

        {/* Right rail */}
        <aside className="overview-rail">
          {/* Recommended next action — prominent */}
          <section className="nextcard">
            <span className="nextcard__eyebrow">Recommended next action</span>
            <p className="nextcard__headline">{detail.nextAction.headline}</p>
            <p className="nextcard__detail">{detail.nextAction.detail}</p>
            <div className="nextcard__actions">
              <Link
                to={`/projects/${projectId}/discovery`}
                className="btn btn-primary"
              >
                {detail.nextAction.primary}
                <ArrowRight />
              </Link>
              <Link
                to={`/projects/${projectId}/research`}
                className="btn btn-ghost"
              >
                {detail.nextAction.secondary}
              </Link>
            </div>
          </section>

          {/* Activity */}
          <section className="card card-pad">
            <div className="section-head">
              <h2 className="block-title">Recent activity</h2>
            </div>
            <ActivityFeed items={detail.activity} />
          </section>
        </aside>
      </div>
    </div>
  );
}
