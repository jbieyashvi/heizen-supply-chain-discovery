import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  CircleSlash,
  Plus,
  ListChecks,
  Ear,
  Target,
  ChevronDown,
  CheckCircle2,
  Circle,
  XCircle,
  Clock3,
  PhoneOff,
  FlaskConical,
  ArrowRight,
  FileStack,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { useToast } from "../components/Toast";
import { QuestionNavigator } from "../components/discovery/QuestionNavigator";
import {
  useDiscovery,
  hasAnswerContent,
  type Answer,
  type AugmentedQuestion,
} from "../hooks/useDiscovery";
import { priorityMeta } from "../lib/status";
import {
  MEETING,
  STAKEHOLDER,
  areaLabel,
  discoveryMeta,
  type Completeness,
  type EvidenceStrength,
} from "../data/discovery";

const STRENGTHS: { id: EvidenceStrength; label: string; hint: string }[] = [
  { id: "strong", label: "Strong", hint: "Direct, specific evidence" },
  { id: "medium", label: "Medium", hint: "Plausible but incomplete" },
  { id: "weak", label: "Weak", hint: "Opinion or unverified" },
];
const COMPLETENESS: { id: Completeness; label: string }[] = [
  { id: "answered", label: "Answered" },
  { id: "partial", label: "Partially answered" },
  { id: "not-answered", label: "Not answered" },
];

type SaveStatus = "idle" | "saving" | "saved";

function fmtElapsed(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function CallModePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const {
    shortlisted,
    callStartId,
    saveAnswer,
    resetAnswer,
    setOutcome,
    addFollowUp,
    setFollowUp,
  } = useDiscovery();

  const backToPrep = useCallback(
    () => navigate(`/projects/${projectId}/discovery`),
    [navigate, projectId]
  );

  const [index, setIndex] = useState(() => {
    if (!callStartId) return 0;
    const i = shortlisted.findIndex((q) => q.id === callStartId);
    return i === -1 ? 0 : i;
  });
  const [navOpen, setNavOpen] = useState(false);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [ended, setEnded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saveHint, setSaveHint] = useState<null | "blank">(null);
  const [pendingLeave, setPendingLeave] = useState<
    { type: "exit" } | { type: "jump"; index: number } | null
  >(null);
  const saveTimer = useRef<number | null>(null);

  // Elapsed timer (paused once the call ends)
  useEffect(() => {
    if (ended) return;
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, [ended]);

  const total = shortlisted.length;
  const safeIndex = Math.min(index, Math.max(0, total - 1));
  const current: AugmentedQuestion | undefined = shortlisted[safeIndex];

  // Reset per-question UI state when the active question changes.
  useEffect(() => {
    setDirty(false);
    setSaveHint(null);
    setMoreOpen(shortlisted[safeIndex]?.answer.followUpRequired ?? false);
    setGuidanceOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex]);

  const touch = useCallback(() => {
    setSaveStatus("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaveStatus("saved"), 650);
  }, []);

  const patch = useCallback(
    (p: Partial<Answer>) => {
      if (!current) return;
      saveAnswer(current.id, { ...p, round: discoveryMeta.round });
      touch();
      setDirty(true);
      setSaveHint(null);
      if (p.followUpRequired) setMoreOpen(true);
    },
    [current, saveAnswer, touch]
  );

  const currentUnsaved =
    !!current && dirty && hasAnswerContent(current.answer);

  const commitDraft = useCallback(() => {
    if (
      current &&
      dirty &&
      hasAnswerContent(current.answer) &&
      (current.outcome === null || current.outcome === "in-progress")
    ) {
      setOutcome(current.id, "in-progress");
    }
    setDirty(false);
  }, [current, dirty, setOutcome]);

  const go = useCallback(
    (dir: -1 | 1) => {
      commitDraft();
      setIndex((i) => Math.max(0, Math.min(total - 1, i + dir)));
    },
    [total, commitDraft]
  );

  const saveAndNext = useCallback(() => {
    if (!current) return;
    const a = current.answer;
    const hasText = Boolean(a.text.trim() || a.keyFacts.trim());
    const c = a.completeness;

    // Blank with no completeness — never silently mark answered.
    if (!hasText && !c) {
      setSaveHint("blank");
      return;
    }

    const outcome =
      c === "answered"
        ? "answered"
        : c === "partial"
        ? "partial"
        : c === "not-answered"
        ? "not-answered"
        : "in-progress"; // text but completeness not chosen
    setOutcome(current.id, outcome);
    setDirty(false);
    setSaveHint(null);
    notify({
      title:
        outcome === "in-progress" ? "Saved as in progress" : "Answer saved",
      body: "Draft saved locally.",
      tone: "info",
    });
    if (safeIndex < total - 1) {
      setIndex((i) => Math.min(total - 1, i + 1));
    }
  }, [current, safeIndex, total, setOutcome, notify]);

  const markNotAnswered = useCallback(() => {
    if (!current) return;
    setOutcome(current.id, "not-answered");
    setDirty(false);
    setSaveHint(null);
    if (safeIndex < total - 1) setIndex((i) => Math.min(total - 1, i + 1));
  }, [current, safeIndex, total, setOutcome]);

  const requestExit = useCallback(() => {
    if (currentUnsaved) setPendingLeave({ type: "exit" });
    else backToPrep();
  }, [currentUnsaved, backToPrep]);

  const requestJump = useCallback(
    (i: number) => {
      setNavOpen(false);
      if (currentUnsaved) setPendingLeave({ type: "jump", index: i });
      else {
        commitDraft();
        setIndex(i);
      }
    },
    [currentUnsaved, commitDraft]
  );

  const resolveLeave = useCallback(
    (mode: "save" | "discard") => {
      if (!pendingLeave || !current) return;
      if (mode === "save") {
        if (hasAnswerContent(current.answer))
          setOutcome(current.id, "in-progress");
      } else {
        resetAnswer(current.id);
      }
      setDirty(false);
      if (pendingLeave.type === "exit") backToPrep();
      else setIndex(pendingLeave.index);
      setPendingLeave(null);
    },
    [pendingLeave, current, setOutcome, resetAnswer, backToPrep]
  );

  // Keyboard shortcuts (ignored while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          (el as HTMLElement).isContentEditable);
      if (typing || navOpen || endOpen || ended || pendingLeave) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        saveAndNext();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, saveAndNext, navOpen, endOpen, ended, pendingLeave]);

  const summary = useMemo(() => computeSummary(shortlisted), [shortlisted]);

  if (total === 0) {
    return (
      <div className="callmode">
        <div className="call-empty">
          <p>No shortlisted questions for this call.</p>
          <button className="btn btn-primary" onClick={backToPrep}>
            Back to Discovery Questions
          </button>
        </div>
      </div>
    );
  }

  if (ended) {
    return (
      <CallSummaryView
        summary={summary}
        elapsed={elapsed}
        onBack={backToPrep}
        onReviewAnswers={backToPrep}
        onSources={() => navigate(`/projects/${projectId}/sources`)}
      />
    );
  }

  if (!current) return null;
  const a = current.answer;

  return (
    <div className="callmode">
      {/* Call header */}
      <header className="call-header">
        <div className="call-header__id">
          <span className="call-header__client">Clio Snacks</span>
          <span className="call-header__sub">
            {STAKEHOLDER.name}, {STAKEHOLDER.role} · {MEETING.full} · {MEETING.time}
          </span>
        </div>
        <div className="call-header__center">
          <span className="call-progress">
            Question {safeIndex + 1} of {total}
          </span>
          <span className="call-save" aria-live="polite">
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
              ? "Saved · draft stored locally"
              : "Draft saved locally"}
          </span>
        </div>
        <div className="call-header__actions">
          <span className="call-elapsed" aria-label="Elapsed time">
            <Clock3 aria-hidden /> {fmtElapsed(elapsed)}
          </span>
          <button className="btn btn-sm" onClick={() => setNavOpen(true)}>
            <ListChecks /> Questions
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => setEndOpen(true)}>
            <PhoneOff /> End call
          </button>
          <button
            className="icon-btn"
            onClick={requestExit}
            aria-label="Exit to preparation"
            title="Exit to preparation"
          >
            <X />
          </button>
        </div>
      </header>

      <div className="call-body">
        <div className="call-main">
          {/* Active question */}
          <div className="call-q">
            <div className="call-q__badges">
              <Badge tone={priorityMeta[current.priority].tone} dot>
                {priorityMeta[current.priority].label}
              </Badge>
              <span className="call-q__area">{areaLabel(current.area)}</span>
              {current.criticalUnknown && (
                <Badge tone="red">Critical unknown</Badge>
              )}
            </div>
            <h1 className="call-q__text">{current.question}</h1>
            <p className="call-q__why">
              <span className="call-q__why-label">Why it matters</span>
              {current.whyItMatters}
            </p>

            {/* Collapsible guidance */}
            <button
              className="call-guidance__toggle"
              aria-expanded={guidanceOpen}
              onClick={() => setGuidanceOpen((v) => !v)}
            >
              <ChevronDown className={guidanceOpen ? "is-open" : ""} aria-hidden />
              {guidanceOpen ? "Hide guidance" : "Show listen-for cues & evidence"}
            </button>
            {guidanceOpen && (
              <div className="call-guidance">
                <section>
                  <h3 className="call-guidance__label">
                    <Ear aria-hidden /> Listen for
                  </h3>
                  <ul>
                    {current.listenFor.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </section>
                {current.partial && (
                  <section>
                    <h3 className="call-guidance__label">
                      <CheckCircle2 aria-hidden /> Existing evidence
                    </h3>
                    <p>{current.partial.summary}</p>
                    <p className="call-guidance__muted">
                      Still unknown: {current.partial.remainingUnknown}
                    </p>
                  </section>
                )}
                <section>
                  <h3 className="call-guidance__label">
                    <Target aria-hidden /> Related opportunity
                  </h3>
                  <p>{current.relatedOpportunity}</p>
                </section>
                <section>
                  <h3 className="call-guidance__label">
                    <FlaskConical aria-hidden /> Evidence that would close it
                  </h3>
                  <p>{current.evidenceToClose}</p>
                </section>
              </div>
            )}
          </div>

          {/* Answer capture */}
          <div className="answer">
            <label className="answer__field">
              <span className="answer__label">What they said</span>
              <textarea
                className="field-control answer__text"
                rows={5}
                placeholder="Capture the client's answer in their words…"
                value={a.text}
                onChange={(e) => patch({ text: e.target.value })}
              />
            </label>

            <label className="answer__field">
              <span className="answer__label">Key facts / numbers</span>
              <input
                className="field-control"
                placeholder="e.g. ~24h delay · next-morning entry · 3 handoffs"
                value={a.keyFacts}
                onChange={(e) => patch({ keyFacts: e.target.value })}
              />
            </label>

            <div className="answer__field">
              <span className="answer__label">Answer completeness</span>
              <div className="pillset" role="radiogroup" aria-label="Answer completeness">
                {COMPLETENESS.map((c) => (
                  <button
                    key={c.id}
                    role="radio"
                    aria-checked={a.completeness === c.id}
                    className={`pill${a.completeness === c.id ? " is-active" : ""}`}
                    onClick={() => patch({ completeness: c.id })}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="answer__field answer__field--compact">
              <span className="answer__label answer__label--sub">
                Evidence strength
                <span className="answer__optional">optional</span>
              </span>
              <div className="pillset pillset--sm" role="radiogroup" aria-label="Evidence strength">
                {STRENGTHS.map((s) => (
                  <button
                    key={s.id}
                    role="radio"
                    aria-checked={a.strength === s.id}
                    className={`pill pill--sm${a.strength === s.id ? " is-active" : ""}`}
                    onClick={() => patch({ strength: s.id })}
                    title={s.hint}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {(a.completeness === "answered" || a.completeness === "partial") &&
                !a.strength && (
                  <span className="answer__recommend">
                    Recommended — noting evidence strength helps update the
                    opportunity's confidence.
                  </span>
                )}
            </div>

            <label className="answer__toggle">
              <input
                type="checkbox"
                checked={a.followUpRequired}
                onChange={(e) => patch({ followUpRequired: e.target.checked })}
              />
              <span>Follow-up required</span>
            </label>

            {/* Add more detail — secondary capture */}
            <div className="answer__more">
              <button
                className="answer__more-toggle"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
              >
                <ChevronDown className={moreOpen ? "is-open" : ""} aria-hidden />
                Add more detail
                <span className="answer__more-hint">
                  Private note &amp; follow-ups
                </span>
              </button>
              {moreOpen && (
                <div className="answer__more-body">
                  <label className="answer__field">
                    <span className="answer__label">Private consultant note</span>
                    <textarea
                      className="field-control"
                      rows={2}
                      placeholder="Not shared with the client…"
                      value={a.note}
                      onChange={(e) => patch({ note: e.target.value })}
                    />
                  </label>
                  <FollowUps
                    question={current}
                    onAddSuggested={(text) => {
                      addFollowUp(current.id, text);
                      touch();
                      setDirty(true);
                    }}
                    onAddCustom={(text) => {
                      addFollowUp(current.id, text);
                      touch();
                      setDirty(true);
                    }}
                    onMarkAsked={(fuId, asked) => {
                      setFollowUp(current.id, fuId, { asked });
                      touch();
                    }}
                    onAnswer={(fuId, text) => {
                      setFollowUp(current.id, fuId, { answer: text });
                      touch();
                      setDirty(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inline Save & next guidance (not a disruptive error) */}
      {saveHint === "blank" && (
        <div className="save-hint" role="status">
          <span>
            Nothing captured yet. Choose how to record this question:
          </span>
          <div className="save-hint__actions">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setOutcome(current.id, "skipped");
                setSaveHint(null);
                notify({ title: "Skipped for now", tone: "info" });
                if (safeIndex < total - 1) setIndex((i) => Math.min(total - 1, i + 1));
              }}
            >
              <SkipForward /> Skip for now
            </button>
            <button className="btn btn-sm" onClick={markNotAnswered}>
              <XCircle /> Mark not answered
            </button>
          </div>
        </div>
      )}

      {/* Live controls */}
      <footer className="call-controls">
        <button
          className="btn btn-sm"
          onClick={() => go(-1)}
          disabled={safeIndex === 0}
        >
          <ChevronLeft /> Previous
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            setOutcome(current.id, "skipped");
            setSaveHint(null);
            setDirty(false);
            notify({ title: "Skipped for now", tone: "info" });
            if (safeIndex < total - 1) setIndex((i) => Math.min(total - 1, i + 1));
          }}
        >
          <SkipForward /> Skip for now
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            setOutcome(current.id, "not-relevant");
            setSaveHint(null);
            setDirty(false);
            notify({ title: "Marked not relevant", tone: "info" });
          }}
        >
          <CircleSlash /> Not relevant
        </button>
        <div className="call-controls__spacer" />
        <span className="call-controls__hint" aria-hidden>
          ← prev · → save &amp; next
        </span>
        <button className="btn btn-primary btn-sm" onClick={saveAndNext}>
          Save &amp; next <ChevronRight />
        </button>
      </footer>

      <QuestionNavigator
        open={navOpen}
        onClose={() => setNavOpen(false)}
        currentId={current.id}
        onJump={requestJump}
      />

      {/* End call confirmation */}
      <Modal
        open={endOpen}
        onClose={() => setEndOpen(false)}
        title="End call and review summary?"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEndOpen(false)}>
              Continue call
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                commitDraft();
                setEndOpen(false);
                setEnded(true);
              }}
            >
              <PhoneOff /> End call and review
            </button>
          </>
        }
      >
        <ul className="confirm-list">
          <li>
            <CheckCircle2 aria-hidden /> Captured answers will be included in the
            Call Summary.
          </li>
          <li>
            <Circle aria-hidden /> Unvisited questions remain unanswered.
          </li>
          <li>
            <ArrowRight aria-hidden /> You can return to preparation afterward.
          </li>
        </ul>
        <p className="end-note">
          {summary.answered} answered · {summary.partial} partially answered ·{" "}
          {summary.notAnswered} not answered · {summary.skipped} skipped ·{" "}
          {summary.notVisited} not visited.
        </p>
      </Modal>

      {/* Exit-to-preparation with unsaved notes */}
      <Modal
        open={Boolean(pendingLeave)}
        onClose={() => setPendingLeave(null)}
        title="Unsaved notes"
        subtitle="You have unsaved notes for the current question."
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setPendingLeave(null)}>
              Stay in Call Mode
            </button>
            <button className="btn" onClick={() => resolveLeave("discard")}>
              Discard changes
            </button>
            <button className="btn btn-primary" onClick={() => resolveLeave("save")}>
              Save draft &amp; continue
            </button>
          </>
        }
      >
        <p className="end-note">
          Your notes for “{current.question}” haven't been committed with Save
          &amp; next. Choose how to continue.
        </p>
      </Modal>
    </div>
  );
}

/* ---------- Follow-ups ---------- */
function FollowUps({
  question,
  onAddSuggested,
  onAddCustom,
  onMarkAsked,
  onAnswer,
}: {
  question: AugmentedQuestion;
  onAddSuggested: (text: string) => void;
  onAddCustom: (text: string) => void;
  onMarkAsked: (fuId: string, asked: boolean) => void;
  onAnswer: (fuId: string, text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const added = question.answer.followUps;
  const usedTexts = new Set(added.map((f) => f.text));
  const suggestions = question.followUps.filter((s) => !usedTexts.has(s));

  return (
    <div className="followups">
      <div className="followups__head">
        <span className="answer__label">Follow-ups</span>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <Plus /> Add follow-up
        </button>
      </div>

      {added.length > 0 && (
        <ul className="followups__list">
          {added.map((f) => (
            <li key={f.id} className="followup">
              <div className="followup__top">
                <span className="followup__q">{f.text}</span>
                <label className="followup__asked">
                  <input
                    type="checkbox"
                    checked={f.asked}
                    onChange={(e) => onMarkAsked(f.id, e.target.checked)}
                  />
                  Asked
                </label>
              </div>
              <textarea
                className="field-control"
                rows={2}
                placeholder="Answer to the follow-up…"
                value={f.answer}
                onChange={(e) => onAnswer(f.id, e.target.value)}
              />
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="followups__add">
          {suggestions.length > 0 && (
            <div className="followups__suggest">
              <span className="followups__suggest-label">Suggested</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="chip"
                  onClick={() => onAddSuggested(s)}
                >
                  <Plus aria-hidden /> {s}
                </button>
              ))}
            </div>
          )}
          <div className="followups__custom">
            <input
              className="field-control"
              placeholder="Write a custom follow-up…"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && custom.trim()) {
                  onAddCustom(custom.trim());
                  setCustom("");
                }
              }}
            />
            <button
              className="btn btn-sm"
              disabled={!custom.trim()}
              onClick={() => {
                onAddCustom(custom.trim());
                setCustom("");
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Summary ---------- */
interface Summary {
  answered: number;
  partial: number;
  notAnswered: number;
  skipped: number;
  notVisited: number;
  followUps: number;
  strong: number;
  medium: number;
  weak: number;
  criticalResolved: number;
  criticalRemaining: number;
  opportunities: string[];
}
function computeSummary(list: AugmentedQuestion[]): Summary {
  let answered = 0,
    partial = 0,
    notAnswered = 0,
    skipped = 0,
    notVisited = 0,
    followUps = 0,
    strong = 0,
    medium = 0,
    weak = 0,
    criticalResolved = 0,
    criticalRemaining = 0;
  const oppSet = new Set<string>();
  list.forEach((q) => {
    if (q.outcome === "answered") answered++;
    else if (q.outcome === "partial") partial++;
    else if (q.outcome === "not-answered" || q.outcome === "in-progress")
      notAnswered++;
    else if (q.outcome === "skipped") skipped++;
    else notVisited++;
    followUps += q.answer.followUps.length;
    if (q.answer.strength === "strong") strong++;
    else if (q.answer.strength === "medium") medium++;
    else if (q.answer.strength === "weak") weak++;
    if (q.criticalUnknown) {
      if (q.outcome === "answered") criticalResolved++;
      else criticalRemaining++;
    }
    if (
      (q.outcome === "answered" || q.outcome === "partial") &&
      (q.answer.strength === "strong" || q.answer.strength === "medium")
    ) {
      oppSet.add(q.relatedOpportunity);
    }
  });
  return {
    answered,
    partial,
    notAnswered,
    skipped,
    notVisited,
    followUps,
    strong,
    medium,
    weak,
    criticalResolved,
    criticalRemaining,
    opportunities: Array.from(oppSet),
  };
}

const NEXT_ACTIONS = [
  "Review captured answers",
  "Add or upload the meeting transcript",
  "Refresh Research after transcript ingestion",
  "Review updated Opportunities",
  "Schedule follow-up questions",
];

function CallSummaryView({
  summary: s,
  elapsed,
  onBack,
  onReviewAnswers,
  onSources,
}: {
  summary: Summary;
  elapsed: number;
  onBack: () => void;
  onReviewAnswers: () => void;
  onSources: () => void;
}) {
  return (
    <div className="callmode callmode--summary">
      <header className="call-header">
        <div className="call-header__id">
          <span className="call-header__client">Call summary</span>
          <span className="call-header__sub">
            Clio Snacks · {STAKEHOLDER.name}, {STAKEHOLDER.role} · {MEETING.full}
          </span>
        </div>
        <div className="call-header__actions">
          <span className="call-elapsed">
            <Clock3 aria-hidden /> {fmtElapsed(elapsed)}
          </span>
          <button className="icon-btn" onClick={onBack} aria-label="Close summary">
            <X />
          </button>
        </div>
      </header>

      <div className="summary-body">
        <div className="summary-stats">
          <SummaryStat value={s.answered} label="Answered" tone="green" />
          <SummaryStat value={s.partial} label="Partially answered" tone="amber" />
          <SummaryStat value={s.notAnswered} label="Not answered" tone="neutral" />
          <SummaryStat value={s.skipped} label="Skipped" tone="neutral" />
          <SummaryStat value={s.notVisited} label="Not visited" tone="neutral" />
          <SummaryStat value={s.followUps} label="Follow-ups created" tone="accent" />
        </div>

        <div className="summary-grid">
          <section className="card card-pad">
            <h2 className="block-title">Evidence & unknowns</h2>
            <div className="summary-line">
              <span>Evidence strength</span>
              <span className="summary-dist">
                <Badge tone="green" dot>
                  {s.strong} strong
                </Badge>
                <Badge tone="amber" dot>
                  {s.medium} medium
                </Badge>
                <Badge tone="neutral" dot>
                  {s.weak} weak
                </Badge>
              </span>
            </div>
            <div className="summary-line">
              <span>Critical unknowns resolved</span>
              <strong>
                {s.criticalResolved} of{" "}
                {s.criticalResolved + s.criticalRemaining}
              </strong>
            </div>
            <div className="summary-line">
              <span>Remaining unknowns</span>
              <strong>{s.criticalRemaining}</strong>
            </div>
            <div className="summary-line summary-line--col">
              <span>Opportunities strengthened</span>
              {s.opportunities.length === 0 ? (
                <span className="muted">None yet — capture stronger evidence.</span>
              ) : (
                <div className="chips">
                  {s.opportunities.map((o) => (
                    <span className="chip-static" key={o}>
                      <Target aria-hidden /> {o}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="card card-pad">
            <h2 className="block-title">Suggested next actions</h2>
            <ol className="next-actions">
              {NEXT_ACTIONS.map((n) => (
                <li key={n}>
                  <CheckCircle2 aria-hidden /> {n}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="summary-actions">
          <button className="btn btn-primary" onClick={onReviewAnswers}>
            Return to Discovery Questions <ArrowRight />
          </button>
          <button className="btn" onClick={onReviewAnswers}>
            Review answers
          </button>
          <button className="btn btn-ghost" onClick={onSources}>
            <FileStack /> Go to Sources
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <div className="sstat">
      <span className={`sstat__value tone-${tone}`}>{value}</span>
      <span className="sstat__label">{label}</span>
    </div>
  );
}
