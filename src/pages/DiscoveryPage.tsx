import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  PlayCircle,
  Search,
  Star,
  StarOff,
  ChevronUp,
  ChevronDown,
  ListChecks,
  AlertTriangle,
  Target,
  Clock3,
  CircleHelp,
  MoreHorizontal,
  CheckCircle2,
  CircleSlash,
  Pencil,
  FlaskConical,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Badge } from "../components/Badge";
import { Tooltip } from "../components/Tooltip";
import { useClickOutside } from "../hooks/useClickOutside";
import { useToast } from "../components/Toast";
import {
  useDiscovery,
  type AugmentedQuestion,
  type SortMode,
} from "../hooks/useDiscovery";
import { QuestionDetailPanel } from "../components/discovery/QuestionDetailPanel";
import { StartCallDialog } from "../components/discovery/StartCallDialog";
import { IntroQuestionSet } from "../components/discovery/IntroQuestionSet";
import { Segmented, type SegmentOption } from "../components/Segmented";
import { FocusChip } from "../components/FocusChip";
import { StageBadge } from "../components/StageBadge";
import { useFocus } from "../hooks/useFocus";
import { scoreDomains, AREA_DOMAIN } from "../data/focus";
import { projects } from "../data/mock";
import type { Project } from "../data/types";
import {
  PRIORITIES,
  QUESTION_TYPES,
  QUESTION_AREAS,
  PROBLEM_AREAS,
  RECOMMENDED_ORDER_NOTE,
  areaShort,
  discoveryMeta,
  typeLabel,
  type QArea,
  type QPriority,
  type QType,
} from "../data/discovery";
import { Handshake, Compass } from "lucide-react";

type View = "all" | "shortlisted" | "to-review" | "answered" | "skipped";

/* Question-set tabs — mirror the project preparation stage. */
type QSet = "intro" | "discovery";
const QSET_OPTS: SegmentOption<QSet>[] = [
  { id: "intro", label: "Introductory Call", icon: <Handshake aria-hidden /> },
  { id: "discovery", label: "Discovery Call", icon: <Compass aria-hidden /> },
];

const strengthLabel = { strong: "Strong", medium: "Medium", weak: "Weak" } as const;

/** Grammatically correct possessive (names ending in "s" take just an apostrophe). */
function possessive(name: string): string {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

function statusView(q: AugmentedQuestion): {
  view: Exclude<View, "all">;
  label: string;
  tone: "green" | "amber" | "info" | "neutral" | "accent";
} {
  if (q.outcome === "answered" || q.outcome === "partial")
    return {
      view: "answered",
      label: q.outcome === "answered" ? "Answered" : "Partially answered",
      tone: q.outcome === "answered" ? "green" : "amber",
    };
  if (q.outcome === "skipped")
    return { view: "skipped", label: "Skipped", tone: "neutral" };
  if (q.outcome === "not-relevant")
    return { view: "all", label: "Not relevant", tone: "neutral" } as never;
  if (q.shortlisted)
    return { view: "shortlisted", label: "Shortlisted", tone: "accent" };
  return { view: "to-review", label: "To review", tone: "info" };
}

/* ---------- Question row ---------- */
function QuestionRow({
  q,
  onSelect,
  reorderable,
  position,
  onUp,
  onDown,
  isFirst,
  isLast,
}: {
  q: AugmentedQuestion;
  onSelect: (id: string) => void;
  reorderable: boolean;
  position?: number;
  onUp: () => void;
  onDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { toggleShortlist } = useDiscovery();
  const sv = statusView(q);
  const answered = q.outcome === "answered" || q.outcome === "partial";

  return (
    <article className="qrow">
      <div className="qrow__lead">
        {position !== undefined && (
          <span className="qrow__pos" aria-hidden>
            {position}
          </span>
        )}
        <Tooltip
          label={q.shortlisted ? "Remove from shortlist" : "Add to shortlist"}
        >
          <button
            className={`qrow__star${q.shortlisted ? " is-on" : ""}`}
            onClick={() => toggleShortlist(q.id)}
            aria-pressed={q.shortlisted}
            aria-label={
              q.shortlisted ? "Remove from shortlist" : "Add to shortlist"
            }
          >
            {q.shortlisted ? <Star /> : <StarOff />}
          </button>
        </Tooltip>
      </div>

      <button className="qrow__main" onClick={() => onSelect(q.id)}>
        <span className="qrow__q">{q.question}</span>
        <span className="qrow__meta">
          <Badge tone={priTone(q.priority)} dot>
            {q.priority[0].toUpperCase() + q.priority.slice(1)}
          </Badge>
          <span className="qrow__type">{typeLabel(q.type)}</span>
          <span className="dotsep">·</span>
          <span className="qrow__area">{areaShort(q.area)}</span>
          <span className="qrow__rel">
            <Target aria-hidden /> {q.relatedOpportunity}
          </span>
          {q.partial && !answered && (
            <Tooltip label="Research already partially answers this — open to see what's known and what's still unknown.">
              <span className="qrow__partial">
                <CheckCircle2 aria-hidden /> Partially answered by Research
              </span>
            </Tooltip>
          )}
        </span>
        {answered && (
          <span className="qrow__answer">
            <span className="qrow__answer-text">
              {q.answer.text || "Answer captured."}
            </span>
            <span className="qrow__answer-meta">
              {q.answer.strength && (
                <Badge tone={strengthTone(q.answer.strength)} dot>
                  {strengthLabel[q.answer.strength]} evidence
                </Badge>
              )}
              {q.answer.round && <span>Round {q.answer.round}</span>}
              <span className="qrow__edit">
                <Pencil aria-hidden /> Edit answer
              </span>
            </span>
          </span>
        )}
      </button>

      <div className="qrow__side">
        <Badge tone={sv.tone} dot>
          {sv.label}
        </Badge>
        {reorderable ? (
          <div className="qrow__reorder">
            <button
              className="icon-btn icon-btn--xs"
              onClick={onUp}
              disabled={isFirst}
              aria-label={`Move "${q.question}" up`}
            >
              <ChevronUp />
            </button>
            <button
              className="icon-btn icon-btn--xs"
              onClick={onDown}
              disabled={isLast}
              aria-label={`Move "${q.question}" down`}
            >
              <ChevronDown />
            </button>
          </div>
        ) : (
          <span className="qrow__est">
            <Clock3 aria-hidden /> {q.estMinutes}m
          </span>
        )}
      </div>
    </article>
  );
}

function priTone(p: QPriority) {
  return p === "critical" ? "red" : p === "high" ? "amber" : "neutral";
}
function strengthTone(s: "strong" | "medium" | "weak") {
  return s === "strong" ? "green" : s === "medium" ? "amber" : "neutral";
}

/* ---------- Prep summary strip ---------- */
function PrepSummary({
  shortlistedCount,
  toReviewCount,
  minutes,
}: {
  shortlistedCount: number;
  toReviewCount: number;
  minutes: number;
}) {
  const cells = [
    { icon: <ListChecks />, value: shortlistedCount, label: "Shortlisted", tone: "accent" },
    { icon: <CircleHelp />, value: toReviewCount, label: "To review", tone: "info" },
    {
      icon: <AlertTriangle />,
      value: discoveryMeta.criticalUnknowns,
      label: "Critical unknowns",
      tone: "amber",
    },
    {
      icon: <Target />,
      value: discoveryMeta.opportunities,
      label: "Evidence-backed opportunities",
      tone: "green",
    },
    {
      icon: <Clock3 />,
      value: `~${minutes}m`,
      label: "Est. shortlisted time",
      tone: "neutral",
    },
  ];
  return (
    <div className="prep-strip" role="group" aria-label="Preparation summary">
      {cells.map((c) => (
        <div className="prep-cell" key={c.label}>
          <span className={`prep-cell__icon tone-${c.tone}`} aria-hidden>
            {c.icon}
          </span>
          <span className="prep-cell__value">{c.value}</span>
          <span className="prep-cell__label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function OverflowMenu({ onRecommended }: { onRecommended: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notify } = useToast();
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div className="menu" ref={ref}>
      <button
        className="icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal />
      </button>
      {open && (
        <div className="menu__pop" role="menu">
          <button role="menuitem" onClick={() => { setOpen(false); onRecommended(); }}>
            <ListChecks /> Use recommended order
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              notify({
                title: "Export question set",
                body: "Export is a prototype action — nothing saved.",
                tone: "info",
              });
            }}
          >
            <Pencil /> Export question set (soon)
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Shell: switches between the two question sets ---------- */
export function DiscoveryPage() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);
  const [qset, setQset] = useState<QSet>(() => {
    try {
      const stage = localStorage.getItem(`heizen-stage-${projectId}`);
      return stage === "discovery" || stage === "expansion" ? "discovery" : "intro";
    } catch {
      return "intro";
    }
  });

  if (!project) return null;

  const tabs = (
    <div className="qset-tabs">
      <Segmented
        value={qset}
        onChange={setQset}
        options={QSET_OPTS}
        ariaLabel="Question set"
      />
    </div>
  );

  return qset === "intro" ? (
    <IntroQuestionSet project={project} projectId={projectId!} tabs={tabs} />
  ) : (
    <DiscoveryQuestionSet project={project} projectId={projectId!} tabs={tabs} />
  );
}

/* ---------- Discovery Call set (detailed, evidence-backed) ---------- */
function DiscoveryQuestionSet({
  project,
  projectId,
  tabs,
}: {
  project: Project;
  projectId: string;
  tabs: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { focus } = useFocus(projectId);
  const {
    questions,
    shortlisted,
    sortMode,
    setSortMode,
    moveUp,
    moveDown,
    setCallStart,
  } = useDiscovery();

  const [view, setView] = useState<View>("all");
  const [query, setQuery] = useState("");
  const [fPriority, setFPriority] = useState<QPriority | "all">("all");
  const [fType, setFType] = useState<QType | "all">("all");
  const [fArea, setFArea] = useState<QArea | "all">("all");
  const [fOpp, setFOpp] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [startFrom, setStartFrom] = useState<{ id: string; label: string } | null>(
    null
  );

  const opportunities = useMemo(
    () => Array.from(new Set(questions.map((q) => q.relatedOpportunity))),
    [questions]
  );

  const counts = useMemo(() => {
    const answered = questions.filter(
      (q) => q.outcome === "answered" || q.outcome === "partial"
    ).length;
    const skipped = questions.filter((q) => q.outcome === "skipped").length;
    const shortlistedC = questions.filter((q) => q.shortlisted).length;
    const toReview = questions.filter(
      (q) => !q.shortlisted && q.outcome === null
    ).length;
    return { answered, skipped, shortlistedC, toReview, all: questions.length };
  }, [questions]);

  const filtering =
    query.trim() !== "" ||
    fPriority !== "all" ||
    fType !== "all" ||
    fArea !== "all" ||
    fOpp !== "all";

  const list = useMemo(() => {
    // base list per view (shortlisted view uses ordered list)
    let base: AugmentedQuestion[];
    if (view === "shortlisted") base = shortlisted;
    else if (view === "to-review")
      base = questions.filter((q) => !q.shortlisted && q.outcome === null);
    else if (view === "answered")
      base = questions.filter(
        (q) => q.outcome === "answered" || q.outcome === "partial"
      );
    else if (view === "skipped")
      base = questions.filter((q) => q.outcome === "skipped");
    else base = questions;

    const qq = query.trim().toLowerCase();
    return base.filter((q) => {
      if (fPriority !== "all" && q.priority !== fPriority) return false;
      if (fType !== "all" && q.type !== fType) return false;
      if (fArea !== "all" && q.area !== fArea) return false;
      if (fOpp !== "all" && q.relatedOpportunity !== fOpp) return false;
      if (!qq) return true;
      return (
        q.question.toLowerCase().includes(qq) ||
        q.relatedOpportunity.toLowerCase().includes(qq)
      );
    });
  }, [view, shortlisted, questions, query, fPriority, fType, fArea, fOpp]);

  /* All view: group by confirmed problem area, first-to-last within each. */
  const problemGroups = useMemo(() => {
    const known = PROBLEM_AREAS.map((area) => ({
      area,
      items: list
        .filter((q) => q.relatedOpportunity === area)
        .sort((a, b) => a.recommendedIndex - b.recommendedIndex),
    }));
    const other = list
      .filter((q) => !PROBLEM_AREAS.includes(q.relatedOpportunity))
      .sort((a, b) => a.recommendedIndex - b.recommendedIndex);
    if (other.length) known.push({ area: "Other", items: other });
    const groups = known.filter((g) => g.items.length > 0);
    // Focus floats the most relevant problem area to the top (stable; nothing hidden).
    const areaScore = (g: { items: AugmentedQuestion[] }) =>
      g.items.reduce((s, q) => s + scoreDomains([AREA_DOMAIN[q.area]], focus), 0);
    return groups
      .map((g, i) => ({ g, i }))
      .sort((a, b) => areaScore(b.g) - areaScore(a.g) || a.i - b.i)
      .map((x) => x.g);
  }, [list, focus]);

  const clearFilters = () => {
    setQuery("");
    setFPriority("all");
    setFType("all");
    setFArea("all");
    setFOpp("all");
  };

  const shortlistMinutes = shortlisted.length * discoveryMeta.minutesPerQuestion;
  const reorderable = view === "shortlisted" && sortMode === "custom";

  const openStart = (from?: { id: string; label: string }) => {
    setStartFrom(from ?? null);
    setStartOpen(true);
  };
  const beginCall = (mode: "recommended" | "selected") => {
    if (mode === "recommended") {
      setSortMode("recommended");
      setCallStart(null);
    } else if (startFrom) {
      setCallStart(startFrom.id);
    }
    setStartOpen(false);
    navigate(`/projects/${projectId}/discovery/call`);
  };

  const views: { id: View; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "shortlisted", label: "Shortlisted", count: counts.shortlistedC },
    { id: "to-review", label: "To review", count: counts.toReview },
    { id: "answered", label: "Answered", count: counts.answered },
    { id: "skipped", label: "Skipped", count: counts.skipped },
  ];

  return (
    <div className="page discovery">
      <PageHeader
        crumbs={[
          { label: "Projects", to: "/projects" },
          { label: project.name, to: `/projects/${projectId}` },
          { label: "Discovery Questions" },
        ]}
        title={
          <>
            <h1 className="page-title">Discovery Questions</h1>
            <StageBadge projectId={projectId} />
          </>
        }
        subtitle={`Evidence-backed questions for ${possessive(
          project.name
        )} discovery call, grouped by confirmed problem area.`}
        actions={
          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn btn-sm"
              onClick={() => setView("to-review")}
            >
              Review suggested questions
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => openStart()}
              disabled={shortlisted.length === 0}
            >
              <PlayCircle /> Start call
            </button>
            <OverflowMenu onRecommended={() => setSortMode("recommended")} />
          </div>
        }
        meta={tabs}
      />

      <FocusChip projectId={projectId} />

      <div className="discovery-status">
        <span className="rstat">
          <ListChecks aria-hidden /> {counts.shortlistedC} of {counts.all}{" "}
          shortlisted · {counts.toReview} to review
        </span>
        <span className="rstat">Round {discoveryMeta.round}</span>
        <span className="rstat">
          Next call {project.meeting?.relative} · {project.meeting?.date},{" "}
          {project.meeting?.time}
        </span>
      </div>

      <PrepSummary
        shortlistedCount={counts.shortlistedC}
        toReviewCount={counts.toReview}
        minutes={shortlistMinutes}
      />

      {/* Views */}
      <div className="dtabs" role="tablist" aria-label="Question views">
        {views.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={view === v.id}
            className={`dtab${view === v.id ? " is-active" : ""}`}
            onClick={() => setView(v.id)}
          >
            {v.label}
            <span className="dtab__count">{v.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="dtoolbar">
        <div className="searchbox searchbox--sm">
          <Search aria-hidden />
          <input
            type="search"
            placeholder="Search questions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search questions"
          />
        </div>
        <div className="dfilters">
          <SelectFilter
            label="Priority"
            value={fPriority}
            onChange={(v) => setFPriority(v as QPriority | "all")}
            options={[
              { id: "all", label: "All priorities" },
              ...PRIORITIES.map((p) => ({ id: p.id, label: p.label })),
            ]}
          />
          <SelectFilter
            label="Type"
            value={fType}
            onChange={(v) => setFType(v as QType | "all")}
            options={[
              { id: "all", label: "All types" },
              ...QUESTION_TYPES.map((t) => ({ id: t.id, label: t.label })),
            ]}
          />
          <SelectFilter
            label="Area"
            value={fArea}
            onChange={(v) => setFArea(v as QArea | "all")}
            options={[
              { id: "all", label: "All areas" },
              ...QUESTION_AREAS.map((a) => ({ id: a.id, label: a.short })),
            ]}
          />
          <SelectFilter
            label="Opportunity"
            value={fOpp}
            onChange={setFOpp}
            options={[
              { id: "all", label: "All opportunities" },
              ...opportunities.map((o) => ({ id: o, label: o })),
            ]}
          />
          {filtering && (
            <button className="link-btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Shortlisted ordering controls */}
      {view === "shortlisted" && (
        <div className="order-bar">
          <span className="order-bar__label">Order</span>
          <div className="seg-mini" role="group" aria-label="Shortlist order">
            {(
              [
                ["recommended", "Recommended"],
                ["priority", "Priority"],
                ["custom", "Custom"],
              ] as [SortMode, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                className={`seg-mini__btn${sortMode === id ? " is-active" : ""}`}
                aria-pressed={sortMode === id}
                onClick={() => setSortMode(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <Tooltip label={RECOMMENDED_ORDER_NOTE}>
            <span className="order-bar__hint">
              <CircleHelp aria-hidden /> How recommended order works
            </span>
          </Tooltip>
          {sortMode !== "custom" && (
            <span className="order-bar__note">
              Switch to Custom to reorder with the arrows.
            </span>
          )}
        </div>
      )}

      {/* List */}
      {list.length === 0 ? (
        <EmptyState
          icon={<FlaskConical />}
          title="No questions here"
          body={
            filtering
              ? "No questions match the current filters."
              : "Nothing in this view yet."
          }
          action={
            filtering ? (
              <button className="btn" onClick={clearFilters}>
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : view === "all" ? (
        /* Grouped by confirmed problem area, first-to-last within each */
        <div className="pa-groups">
          {problemGroups.map((g) => (
            <section className="pa-group" key={g.area}>
              <div className="pa-group__head">
                <Target aria-hidden />
                <h2 className="pa-group__title">{g.area}</h2>
                <span className="pa-group__count">
                  {g.items.length} question{g.items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="qlist">
                {g.items.map((q, i) => (
                  <QuestionRow
                    key={q.id}
                    q={q}
                    onSelect={setSelected}
                    reorderable={false}
                    onUp={() => moveUp(q.id)}
                    onDown={() => moveDown(q.id)}
                    isFirst={i === 0}
                    isLast={i === g.items.length - 1}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="qlist">
          {list.map((q, i) => (
            <QuestionRow
              key={q.id}
              q={q}
              onSelect={setSelected}
              reorderable={reorderable}
              position={view === "shortlisted" ? i + 1 : undefined}
              onUp={() => moveUp(q.id)}
              onDown={() => moveDown(q.id)}
              isFirst={i === 0}
              isLast={i === list.length - 1}
            />
          ))}
        </div>
      )}

      <p className="discovery-footnote">
        <CircleSlash aria-hidden /> Questions marked not relevant are removed from
        the call but stay visible under “All”.
      </p>

      <QuestionDetailPanel
        questionId={selected}
        onClose={() => setSelected(null)}
        onStartCallFrom={(id) => {
          const q = questions.find((x) => x.id === id);
          setSelected(null);
          openStart(q ? { id, label: q.question } : undefined);
        }}
      />
      <StartCallDialog
        open={startOpen}
        onClose={() => setStartOpen(false)}
        onStart={beginCall}
        fromQuestion={startFrom}
      />
      <Link className="sr-only" to={`/projects/${projectId}`}>
        Back to overview
      </Link>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="dfilter">
      <label className="sr-only">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
