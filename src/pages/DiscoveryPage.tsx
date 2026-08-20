import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Boxes,
  CalendarMinus,
  CalendarPlus,
  CalendarRange,
  Check,
  ChevronDown,
  Copy,
  Cpu,
  Factory,
  FileText,
  PlayCircle,
  RotateCcw,
  ScanLine,
  SkipForward,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { StageBadge } from "../components/StageBadge";
import { useToast } from "../components/Toast";
import {
  useDiscovery,
  hasAnswerContent,
  type AugmentedQuestion,
} from "../hooks/useDiscovery";
import { QuestionDetailPanel } from "../components/discovery/QuestionDetailPanel";
import { StartCallDialog } from "../components/discovery/StartCallDialog";
import { readStage } from "../lib/stage";
import { projects } from "../data/mock";
import { MEETING } from "../data/discovery";
import {
  CONVERSATION_THREADS,
  KIND_LABEL,
  SEQ_META,
  STAGE_NOTE,
  answersVisible,
  type NodeKind,
  type ThreadId,
  type TreeNode,
} from "../data/conversationTree";

/** Grammatically correct possessive (names ending in "s" take just an apostrophe). */
function possessive(name: string): string {
  return name.endsWith("s") ? `${name}’` : `${name}’s`;
}

const THREAD_ICON: Record<ThreadId, typeof Factory> = {
  production: Factory,
  inventory: Boxes,
  traceability: ScanLine,
  planning: CalendarRange,
  technology: Cpu,
};

type KindFilter = "all" | NodeKind;
type StatusFilter = "all" | "answered" | "unanswered" | "agenda";

/** Per-node render state: the tree definition merged with live call state
 *  (answers given in Call Mode win over the seeded intro-call record) and
 *  the prep stage's answer visibility. */
interface NodeView {
  node: TreeNode;
  answered: boolean;
  answer: { text: string; source: string } | null;
  followUp: { question: string; why: string } | null;
  assumption: string | null;
  skipped: boolean;
  inAgenda: boolean;
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="dfilter">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DiscoveryPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const {
    questions,
    sortMode,
    toggleShortlist,
    setOutcome,
    setSortMode,
    setCallStart,
  } = useDiscovery();

  const byId = useMemo(() => {
    const m: Record<string, AugmentedQuestion> = {};
    for (const q of questions) m[q.id] = q;
    return m;
  }, [questions]);

  // Filters
  const [stakeholder, setStakeholder] = useState("all");
  const [domain, setDomain] = useState<"all" | ThreadId>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  // Disclosure: one thread expanded at a time, one card open at a time.
  const [expandedPick, setExpandedPick] = useState<ThreadId | null | undefined>(
    undefined
  );
  const [openNode, setOpenNode] = useState<string | null>(null);
  // Skips for nodes with no linked bank question (openers, invented asks).
  const [localSkipped, setLocalSkipped] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  // Panels
  const [selected, setSelected] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [startFrom, setStartFrom] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const stage = readStage(projectId);
  const showAnswers = answersVisible(stage);

  const viewOf = (node: TreeNode): NodeView => {
    const live = node.questionId ? byId[node.questionId] : undefined;
    const liveAnswered =
      !!live &&
      (live.outcome === "answered" || live.outcome === "partial") &&
      hasAnswerContent(live.answer);
    const seeded = showAnswers && !!node.answer;
    const answered = liveAnswered || seeded;

    let answer: NodeView["answer"] = null;
    let followUp: NodeView["followUp"] = null;
    if (liveAnswered && live) {
      answer = {
        text: live.answer.text.trim() || live.answer.keyFacts.trim(),
        source: "Call Mode",
      };
      followUp = live.aiFollowUp ?? node.answer?.followUp ?? null;
    } else if (seeded && node.answer) {
      answer = { text: node.answer.text, source: node.answer.source };
      followUp = node.answer.followUp;
    }

    return {
      node,
      answered,
      answer,
      followUp,
      assumption: !answered && node.assumption ? node.assumption : null,
      skipped: live ? live.outcome === "skipped" : localSkipped.has(node.id),
      inAgenda: !!live?.shortlisted,
    };
  };

  const viewsByThread = new Map<ThreadId, NodeView[]>(
    CONVERSATION_THREADS.map((t) => [t.id, t.nodes.map(viewOf)])
  );
  const allNodeViews = CONVERSATION_THREADS.flatMap(
    (t) => viewsByThread.get(t.id)!
  );

  const capturedCount = allNodeViews.filter((v) => v.answered).length;
  const assumptionCount = allNodeViews.filter((v) => v.assumption).length;
  const agendaCount = questions.filter((q) => q.shortlisted).length;

  const filtering =
    stakeholder !== "all" || kind !== "all" || status !== "all";
  const anyFilter = filtering || domain !== "all";
  const clearFilters = () => {
    setStakeholder("all");
    setDomain("all");
    setKind("all");
    setStatus("all");
  };

  const matches = (v: NodeView) =>
    (stakeholder === "all" || v.node.stakeholder === stakeholder) &&
    (kind === "all" || v.node.kind === kind) &&
    (status === "all" ||
      (status === "agenda"
        ? v.inAgenda
        : status === "answered"
          ? v.answered
          : !v.answered));

  // Stage-appropriate default: intro starts broad at Production, discovery
  // opens the first thread with unclosed diagnostics/evidence, expansion
  // opens the thread with the most gaps (ties break by thread order).
  const defaultExpanded = ((): ThreadId => {
    if (stage === "discovery") {
      const open = CONVERSATION_THREADS.find((t) =>
        viewsByThread
          .get(t.id)!
          .some(
            (v) =>
              !v.answered &&
              (v.node.role === "diagnostic" || v.node.role === "evidence")
          )
      );
      if (open) return open.id;
    }
    if (stage === "expansion") {
      let best: ThreadId = CONVERSATION_THREADS[0].id;
      let bestGaps = -1;
      for (const t of CONVERSATION_THREADS) {
        const gaps = viewsByThread
          .get(t.id)!
          .filter((v) => !v.answered).length;
        if (gaps > bestGaps) {
          best = t.id;
          bestGaps = gaps;
        }
      }
      return best;
    }
    return CONVERSATION_THREADS[0].id;
  })();
  const expanded: ThreadId | null =
    domain !== "all"
      ? domain
      : expandedPick === undefined
        ? defaultExpanded
        : expandedPick;

  const stakeholders = Array.from(
    new Set(CONVERSATION_THREADS.flatMap((t) => t.nodes.map((n) => n.stakeholder)))
  );

  const toggleAgenda = (v: NodeView) => {
    if (!v.node.questionId) return;
    toggleShortlist(v.node.questionId);
    if (v.inAgenda) {
      notify({ title: "Removed from agenda" });
    } else {
      // Agenda order drives the call: switch the shortlist to custom order.
      setSortMode("custom");
      notify({
        title: "Added to agenda",
        body: "Call Mode follows the agenda order.",
        tone: "success",
      });
    }
  };

  const toggleSkip = (v: NodeView) => {
    const qid = v.node.questionId;
    if (qid) {
      setOutcome(qid, v.skipped ? null : "skipped");
      // Skipping stands the question down for this round, so it also
      // leaves the call agenda. Restoring does not re-add it.
      if (!v.skipped && v.inAgenda) {
        toggleShortlist(qid);
        notify({
          title: "Question skipped",
          body: "Removed from the call agenda.",
        });
      }
    } else {
      setLocalSkipped((prev) => {
        const next = new Set(prev);
        if (v.skipped) next.delete(v.node.id);
        else next.add(v.node.id);
        return next;
      });
    }
  };

  const copyQuestion = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify({ title: "Question copied" });
    } catch {
      notify({ title: "Copy failed", body: "Clipboard is unavailable here." });
    }
  };

  const openStart = (from?: { id: string; label: string }) => {
    setStartFrom(from ?? null);
    setStartOpen(true);
  };
  const beginCall = (mode: "recommended" | "selected") => {
    if (mode === "recommended") {
      // An agenda built on this screen keeps its order; otherwise fall
      // back to the recommended sequence.
      if (sortMode !== "custom") setSortMode("recommended");
      setCallStart(null);
    } else if (startFrom) {
      setCallStart(startFrom.id);
    }
    setStartOpen(false);
    navigate(`/projects/${projectId}/discovery/call`);
  };

  if (!project) return null;

  const renderNode = (v: NodeView) => {
    const { node } = v;
    const seq = SEQ_META[node.role];
    const isCardOpen = openNode === node.id;
    const later =
      stage === "intro" &&
      (node.role === "diagnostic" || node.role === "evidence");
    const focus =
      stage === "discovery" &&
      !v.answered &&
      !v.skipped &&
      (node.role === "diagnostic" || node.role === "evidence");
    const gap = stage === "expansion" && !v.answered && !v.skipped;
    return (
      <li
        key={node.id}
        className={`ctnode${isCardOpen ? " is-open" : ""}${
          v.skipped ? " is-skipped" : ""
        }${later ? " is-later" : ""}${v.answered ? " is-answered" : ""}`}
      >
        <span className="ctnode__marker" aria-hidden>
          {seq.step}
        </span>
        <div className="ctnode__main">
          <div className="ctnode__meta">
            <span className="ctnode__role">{seq.label}</span>
            <Badge tone={node.kind === "business" ? "accent" : "neutral"}>
              {KIND_LABEL[node.kind]}
            </Badge>
            <span className="ctnode__who">{node.stakeholder}</span>
            <span className="ctnode__flags">
              {v.skipped ? (
                <Badge tone="neutral">Skipped</Badge>
              ) : v.answered ? (
                <Badge tone="green" dot>
                  Answered
                </Badge>
              ) : v.assumption ? (
                <Badge tone="amber">Assumption</Badge>
              ) : (
                <Badge tone="neutral">Unanswered</Badge>
              )}
              {later && <Badge tone="neutral">Hold for discovery</Badge>}
              {focus && (
                <Badge tone="accent" dot>
                  Focus this call
                </Badge>
              )}
              {gap && <Badge tone="amber">Gap to close</Badge>}
            </span>
          </div>
          <button
            type="button"
            className="ctnode__q"
            aria-expanded={isCardOpen}
            onClick={() => setOpenNode(isCardOpen ? null : node.id)}
          >
            {node.question}
          </button>
          {v.answer && (
            <div className="ctnode__answer">
              <span className="ctnode__caplabel">
                Captured — {v.answer.source}
              </span>
              <p>{v.answer.text}</p>
            </div>
          )}
          {v.followUp && (
            <div className="ctnode__fu">
              <span className="ctnode__fu-label">
                <Sparkles aria-hidden /> Suggested follow-up
              </span>
              <p className="ctnode__fu-q">{v.followUp.question}</p>
              <p className="ctnode__fu-why">{v.followUp.why}</p>
            </div>
          )}
          {v.assumption && (
            <div className="ctnode__assume">
              <span className="ctnode__assume-label">
                Working assumption — unconfirmed
              </span>
              <p>{v.assumption}</p>
            </div>
          )}
          {isCardOpen && (
            <p className="ctnode__why">
              <strong>Why it matters.</strong> {node.why}
            </p>
          )}
          <div className="ctnode__actions">
            {node.questionId &&
              (v.inAgenda ? (
                <>
                  <span className="ctnode__onagenda">
                    <Check aria-hidden /> On agenda
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleAgenda(v)}
                  >
                    <CalendarMinus aria-hidden /> Remove from agenda
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => toggleAgenda(v)}
                >
                  <CalendarPlus aria-hidden /> Add to agenda
                </button>
              ))}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => toggleSkip(v)}
            >
              {v.skipped ? (
                <>
                  <RotateCcw aria-hidden /> Restore
                </>
              ) : (
                <>
                  <SkipForward aria-hidden /> Skip
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => copyQuestion(node.question)}
            >
              <Copy aria-hidden /> Copy
            </button>
            {node.questionId && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelected(node.questionId!)}
              >
                <FileText aria-hidden /> Full detail
              </button>
            )}
          </div>
        </div>
      </li>
    );
  };

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
        subtitle={`Conversation threads for ${possessive(
          project.name
        )} calls — each sequenced opening → clarifying → diagnostic → evidence.`}
        actions={
          <button
            className="btn btn-primary btn-sm"
            onClick={() => openStart()}
            disabled={agendaCount === 0}
            title={
              agendaCount === 0
                ? "Add questions to the call agenda first"
                : undefined
            }
          >
            <PlayCircle aria-hidden /> Start call
          </button>
        }
      />

      <p className="ctree-stagenote">{STAGE_NOTE[stage]}</p>

      <div className="discovery-status ctree-status">
        <span>
          <strong>
            {capturedCount} of {allNodeViews.length}
          </strong>{" "}
          answers captured
        </span>
        <span>
          {assumptionCount} working assumption{assumptionCount === 1 ? "" : "s"}
        </span>
        <span>{agendaCount} on the call agenda</span>
        <span className="ctree-status__meet">
          <CalendarRange aria-hidden /> {MEETING.date}, {MEETING.time} ·{" "}
          {MEETING.relative}
        </span>
      </div>

      <div className="dtoolbar ctree-toolbar">
        <div className="dfilters">
          <SelectFilter
            label="Filter by stakeholder"
            value={stakeholder}
            onChange={setStakeholder}
            options={[
              { value: "all", label: "All stakeholders" },
              ...stakeholders.map((s) => ({ value: s, label: s })),
            ]}
          />
          <SelectFilter
            label="Filter by domain"
            value={domain}
            onChange={(value) => setDomain(value as "all" | ThreadId)}
            options={[
              { value: "all", label: "All domains" },
              ...CONVERSATION_THREADS.map((t) => ({
                value: t.id,
                label: t.label,
              })),
            ]}
          />
          <SelectFilter
            label="Filter by question type"
            value={kind}
            onChange={(value) => setKind(value as KindFilter)}
            options={[
              { value: "all", label: "Business + Technical" },
              { value: "business", label: KIND_LABEL.business },
              { value: "technical", label: KIND_LABEL.technical },
            ]}
          />
          <SelectFilter
            label="Filter by status"
            value={status}
            onChange={(value) => setStatus(value as StatusFilter)}
            options={[
              { value: "all", label: "Answered + unanswered" },
              { value: "answered", label: "Answered" },
              { value: "unanswered", label: "Unanswered" },
              { value: "agenda", label: "Agenda only" },
            ]}
          />
          {anyFilter && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="ctree-threads">
        {CONVERSATION_THREADS.filter(
          (t) => domain === "all" || t.id === domain
        ).map((thread) => {
          const views = viewsByThread.get(thread.id)!;
          const isOpen = expanded === thread.id;
          const answeredN = views.filter((v) => v.answered).length;
          const assumeN = views.filter((v) => v.assumption).length;
          const matchViews = views.filter(matches);
          const Icon = THREAD_ICON[thread.id];
          return (
            <section
              key={thread.id}
              className={`ctree-thread${isOpen ? " is-open" : ""}`}
            >
              <button
                type="button"
                className="ctree-thread__head"
                aria-expanded={isOpen}
                onClick={() => {
                  setExpandedPick(isOpen ? null : thread.id);
                  setOpenNode(null);
                }}
              >
                <span className="ctree-thread__icon" aria-hidden>
                  <Icon />
                </span>
                <span className="ctree-thread__titles">
                  <span className="ctree-thread__label">{thread.label}</span>
                  <span className="ctree-thread__blurb">{thread.blurb}</span>
                </span>
                <span className="ctree-thread__meta">
                  {answeredN} of {views.length} answered
                  {assumeN > 0 && (
                    <>
                      {" "}
                      · {assumeN} assumption{assumeN === 1 ? "" : "s"}
                    </>
                  )}
                  {filtering && (
                    <>
                      {" "}
                      · {matchViews.length} match
                      {matchViews.length === 1 ? "" : "es"}
                    </>
                  )}
                </span>
                <ChevronDown className="ctree-thread__caret" aria-hidden />
              </button>
              {isOpen && (
                <div className="ctree-thread__body">
                  {matchViews.length === 0 ? (
                    <p className="ctree-empty">
                      No questions in this thread match the current filters.
                    </p>
                  ) : (
                    <ol className="ctree-seq">{matchViews.map(renderNode)}</ol>
                  )}
                  {stage === "expansion" && (
                    <div className="ctree-expand">
                      <span className="ctree-expand__label">
                        <TrendingUp aria-hidden /> Value expansion
                      </span>
                      <p className="ctree-expand__q">{thread.expansion}</p>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => copyQuestion(thread.expansion)}
                      >
                        <Copy aria-hidden /> Copy
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

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
