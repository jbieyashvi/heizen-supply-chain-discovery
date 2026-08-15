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
  const [endOpen, setEndOpen] = useState(false);
  const [ended, setEnded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
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
    },
    [current, saveAnswer, touch]
  );

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => {
        const next = i + dir;
        return Math.max(0, Math.min(total - 1, next));
      });
      setGuidanceOpen(false);
    },
    [total]
  );

  const saveAndNext = useCallback(() => {
    if (current) {
      const c = current.answer.completeness;
      setOutcome(
        current.id,
        c === "answered" ? "answered" : c === "partial" ? "partial" : current.outcome
      );
      notify({ title: "Answer saved", body: "Draft saved locally.", tone: "info" });
    }
    if (safeIndex < total - 1) go(1);
  }, [current, safeIndex, total, setOutcome, notify, go]);

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
      if (typing || navOpen || endOpen || ended) return;
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
  }, [go, saveAndNext, navOpen, endOpen, ended]);

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
            onClick={backToPrep}
            aria-label="Exit Call Mode"
            title="Exit Call Mode"
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

            <div className="answer__row2">
              <div className="answer__field">
                <span className="answer__label">Evidence strength</span>
                <div className="pillset" role="radiogroup" aria-label="Evidence strength">
                  {STRENGTHS.map((s) => (
                    <button
                      key={s.id}
                      role="radio"
                      aria-checked={a.strength === s.id}
                      className={`pill${a.strength === s.id ? " is-active" : ""}`}
                      onClick={() => patch({ strength: s.id })}
                      title={s.hint}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
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
            </div>

            <div className="answer__row2">
              <label className="answer__toggle">
                <input
                  type="checkbox"
                  checked={a.followUpRequired}
                  onChange={(e) => patch({ followUpRequired: e.target.checked })}
                />
                <span>Follow-up required</span>
              </label>
            </div>

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

            {/* Follow-ups */}
            <FollowUps
              question={current}
              onAddSuggested={(text) => {
                addFollowUp(current.id, text);
                touch();
              }}
              onAddCustom={(text) => {
                addFollowUp(current.id, text);
                touch();
              }}
              onMarkAsked={(fuId, asked) => {
                setFollowUp(current.id, fuId, { asked });
                touch();
              }}
              onAnswer={(fuId, text) => {
                setFollowUp(current.id, fuId, { answer: text });
                touch();
              }}
            />
          </div>
        </div>
      </div>

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
            notify({ title: "Skipped for now", tone: "info" });
            if (safeIndex < total - 1) go(1);
          }}
        >
          <SkipForward /> Skip for now
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            setOutcome(current.id, "not-relevant");
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
        onJump={(i) => setIndex(i)}
      />

      <Modal
        open={endOpen}
        onClose={() => setEndOpen(false)}
        title="End call?"
        subtitle="You'll see a summary of what was captured"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEndOpen(false)}>
              Keep going
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEndOpen(false);
                setEnded(true);
              }}
            >
              <PhoneOff /> End call
            </button>
          </>
        }
      >
        <p className="end-note">
          {summary.answered} answered · {summary.partial} partially answered ·{" "}
          {summary.skipped} skipped · {summary.notAsked} not asked. Responses are
          stored locally in this prototype.
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
  skipped: number;
  notAsked: number;
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
    skipped = 0,
    notAsked = 0,
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
    else if (q.outcome === "skipped") skipped++;
    else notAsked++;
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
    skipped,
    notAsked,
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
          <SummaryStat value={s.skipped} label="Skipped" tone="neutral" />
          <SummaryStat value={s.notAsked} label="Not asked" tone="neutral" />
          <SummaryStat value={s.followUps} label="New follow-ups" tone="accent" />
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
