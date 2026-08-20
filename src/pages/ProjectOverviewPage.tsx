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
  Info,
  Loader,
  Rocket,
  Handshake,
  Compass,
  TrendingUp,
  Gauge,
  Target,
  Network,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Segmented, type SegmentOption } from "../components/Segmented";
import { FirstCallBrief } from "../components/FirstCallBrief";
import { ReadinessStepItem } from "../components/ReadinessStepItem";
import { InsightItem } from "../components/InsightItem";
import { QuestionPreview } from "../components/QuestionPreview";
import { ActivityFeed } from "../components/ActivityFeed";
import { ReadinessBadge, FreshnessBadge } from "../components/StatusBadges";
import { EmptyState } from "../components/EmptyState";
import { RecommendedBuilds } from "../components/RecommendedBuilds";
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
        <User aria-hidden /> Owner <b>{project.owner}</b>
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
type PrepStage = "intro" | "discovery" | "expansion";

const STAGE_OPTS: SegmentOption<PrepStage>[] = [
  { id: "intro", label: "Introductory Call", icon: <Handshake aria-hidden /> },
  { id: "discovery", label: "Discovery Call", icon: <Compass aria-hidden /> },
  { id: "expansion", label: "Account Expansion", icon: <TrendingUp aria-hidden /> },
];

const stageBlurb: Record<PrepStage, string> = {
  intro:
    "First conversation. Understand the business, build rapport and surface the pains worth exploring — the 15-minute first-call brief leads here.",
  discovery:
    "Deep-dive stage. Discovery confidence, opportunities and the process map lead here.",
  expansion:
    "Existing account. Expansion signals, opportunities and the process map lead here.",
};

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
  const [stage, setStage] = useState<PrepStage>(() => {
    try {
      return (localStorage.getItem(`heizen-stage-${projectId}`) as PrepStage) || "intro";
    } catch {
      return "intro";
    }
  });

  const changeStage = (s: PrepStage) => {
    setStage(s);
    try {
      localStorage.setItem(`heizen-stage-${projectId}`, s);
    } catch {
      /* prototype — no persistence guarantees */
    }
  };

  const readyCount = detail.readiness.filter(
    (s) => s.state === "done" || s.detail.startsWith("Complete")
  ).length;

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

      {/* Preparation-stage selector — tailors the overview to the call type */}
      <section className="stage-picker" aria-label="Preparation stage">
        <div className="stage-picker__label">
          <span className="stage-picker__title">Preparation stage</span>
          {/* All three descriptions occupy the same cell so the header always
              reserves the tallest — switching stage never shifts the layout. */}
          <span className="stage-picker__blurbs">
            {STAGE_OPTS.map((o) => (
              <span
                key={o.id}
                className={`stage-picker__blurb${o.id === stage ? " is-active" : ""}`}
                aria-hidden={o.id !== stage}
              >
                {stageBlurb[o.id]}
              </span>
            ))}
          </span>
        </div>
        <Segmented
          value={stage}
          onChange={changeStage}
          options={STAGE_OPTS}
          ariaLabel="Preparation stage"
        />
      </section>

      {/* The decision layer — what to build, ahead of any preparation detail */}
      <RecommendedBuilds projectId={projectId} />

      <div className="stage-content" key={stage}>
        {stage === "intro" ? (
          <IntroStage projectId={projectId} />
        ) : (
          <DiscoveryStage
            projectId={projectId}
            detail={detail}
            stage={stage}
            refreshing={refreshing}
            refreshed={refreshed}
            readyCount={readyCount}
            doRefresh={doRefresh}
            notify={notify}
          />
        )}
      </div>
    </div>
  );
}

/* ---- Introductory Call: first-call brief + de-emphasised tools ---- */
/** The three deep-dive tools, shared by both stages. */
function deepTools(projectId: string) {
  return [
    {
      icon: Gauge,
      title: "Discovery confidence",
      meta: "3 opportunities scored",
      to: `/projects/${projectId}/discovery`,
    },
    {
      icon: Target,
      title: "Opportunities",
      meta: "3 identified",
      to: `/projects/${projectId}/opportunities`,
    },
    {
      icon: Network,
      title: "Process map",
      meta: "7 process areas",
      to: `/projects/${projectId}/process-map`,
    },
  ];
}

function IntroStage({ projectId }: { projectId: string }) {
  const laterTools = deepTools(projectId);

  return (
    <>
      <FirstCallBrief projectId={projectId} />

      {/* Kept, but de-emphasised — these lead once you move past an intro call */}
      <section className="card card-pad later-tools">
        <div className="section-head">
          <div>
            <h2 className="block-title">Discovery &amp; expansion tools</h2>
            <p className="block-sub">
              Discovery confidence, opportunities and the process map become primary once
              you move to a Discovery or Account Expansion stage. They're still available now.
            </p>
          </div>
        </div>
        <div className="later-tools__grid">
          {laterTools.map((t) => (
            <Link key={t.title} to={t.to} className="later-tool">
              <span className="later-tool__icon" aria-hidden>
                <t.icon />
              </span>
              <span className="later-tool__body">
                <span className="later-tool__title">{t.title}</span>
                <span className="later-tool__meta">{t.meta}</span>
              </span>
              <ArrowRight className="later-tool__chev" aria-hidden />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

/* ---- Discovery Call / Account Expansion: the deep-dive overview ---- */
function DiscoveryStage({
  projectId,
  detail,
  stage,
  refreshing,
  refreshed,
  readyCount,
  doRefresh,
  notify,
}: {
  projectId: string;
  detail: NonNullable<(typeof projectDetails)[string]>;
  stage: PrepStage;
  refreshing: boolean;
  refreshed: boolean;
  readyCount: number;
  doRefresh: () => void;
  notify: ReturnType<typeof useToast>["notify"];
}) {
  return (
    <>
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

      {stage === "expansion" && (
        <div className="notice notice--info" role="note">
          <span className="notice__icon" aria-hidden>
            <TrendingUp />
          </span>
          <div className="notice__main">
            <div className="notice__text">
              <span className="notice__title">Account expansion view</span>
              <span className="notice__body">
                Confidence, opportunities and the process map are framed for growing an
                existing account. Prototype — the underlying data is shared with Discovery.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Preparation detail — one column of status, one of progressive detail */}
      <div className="briefing">
        <section className="card card-pad briefing__left">
          <div className="section-head">
            <div>
              <h2 className="block-title">Call readiness</h2>
              <p className="block-sub">Where preparation stands for the next call.</p>
            </div>
            <span className="block-progress">
              {refreshed ? readyCount + 1 : readyCount} of {detail.readiness.length} ready
            </span>
          </div>
          <div className="readiness">
            {detail.readiness.map((step, i) => (
              <ReadinessStepItem
                key={step.id}
                step={
                  refreshed && step.id === "research"
                    ? { ...step, state: "done", detail: "Up to date — all sources included", meta: "" }
                    : step
                }
                projectId={projectId}
                index={i}
                total={detail.readiness.length}
              />
            ))}
          </div>

          {/* Goal for this call — uses the lower readiness space */}
          <div className="goal">
            <span className="goal__label">Goal for this call</span>
            <p className="goal__text">
              Validate the inventory lag, confirm process ownership, and agree
              whether to scope a one-line pilot.
            </p>
            <div className="goal__chips">
              <span className="goal-chip">Confirm daily volume</span>
              <span className="goal-chip">Identify owner</span>
              <span className="goal-chip">Agree next step</span>
            </div>
          </div>
        </section>

        <div className="briefing__right">
          {/* Everything that used to sit in its own card is folded in here —
              open only what you need for the call you're about to run. */}
          <section className="card card-pad">
            <div className="section-head">
              <div>
                <h2 className="block-title">Supporting detail</h2>
                <p className="block-sub">
                  The evidence behind the recommendations above. Collapsed by default.
                </p>
              </div>
            </div>
            <div className="sdets">
              <Disclosure title="Top findings" meta={`${detail.insights.length} · evidence-labelled`}>
                <div className="insights">
                  {detail.insights.map((ins, i) => (
                    <InsightItem key={ins.id} insight={ins} rank={i + 1} />
                  ))}
                </div>
              </Disclosure>

              <Disclosure
                title="Critical questions"
                meta={`${detail.questions.length} to review`}
              >
                <div className="questions questions--stack">
                  {detail.questions.map((q) => (
                    <QuestionPreview key={q.id} q={q} />
                  ))}
                </div>
                <Link to={`/projects/${projectId}/discovery`} className="wlink">
                  Continue call preparation <ArrowRight aria-hidden />
                </Link>
              </Disclosure>

              <Disclosure
                title="Recent activity"
                meta={`${detail.activity.length} updates`}
              >
                <ActivityFeed items={detail.activity} />
              </Disclosure>
            </div>
          </section>

          {/* Confidence scoring, the opportunity list and the process map keep
              their own pages — they're a click away rather than repeated here. */}
          <section className="card card-pad later-tools">
            <div className="section-head">
              <div>
                <h2 className="block-title">Go deeper</h2>
                <p className="block-sub">
                  Full scoring, the complete opportunity list and the mapped process.
                </p>
              </div>
            </div>
            <div className="later-tools__grid later-tools__grid--stack">
              {deepTools(projectId).map((t) => (
                <Link key={t.title} to={t.to} className="later-tool">
                  <span className="later-tool__icon" aria-hidden>
                    <t.icon />
                  </span>
                  <span className="later-tool__body">
                    <span className="later-tool__title">{t.title}</span>
                    <span className="later-tool__meta">{t.meta}</span>
                  </span>
                  <ArrowRight className="later-tool__chev" aria-hidden />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/* ---- Small local disclosure: reveals one block of detail at a time ---- */
function Disclosure({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`sdet${open ? " is-open" : ""}`}>
      <button
        className="sdet__head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="sdet__title">{title}</span>
        <span className="sdet__meta">{meta}</span>
        <ChevronDown className="sdet__chev" aria-hidden />
      </button>
      {open && <div className="sdet__body">{children}</div>}
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
