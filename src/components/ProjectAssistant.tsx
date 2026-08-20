import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Loader,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Crosshair,
  Search,
  ArrowUpRight,
  X,
  Send,
  Plus,
  Trash2,
  ListPlus,
  MessageSquare,
} from "lucide-react";
import { SidePanel } from "./SidePanel";
import { useFocus } from "../hooks/useFocus";
import { useToast } from "./Toast";
import {
  ASSISTANT_ACTIONS,
  answerQuestion,
  investigateDomain,
  type AssistantAction,
  type AiRichAnswer,
  type AiAnswerBlock,
  type InvestigateResult,
} from "../data/assistant";
import {
  FOCUS_STAKEHOLDERS,
  FOCUS_DOMAINS,
  FOCUS_STAGES,
  isActiveFocus,
  focusSummary,
  domainLabel,
  type Focus,
  type FocusDomain,
  type FocusStage,
} from "../data/focus";

const TONE_ICON = { ok: CheckCircle2, warn: AlertTriangle, info: Info } as const;
const MAX_TURNS = 12;
const chatKey = (projectId: string) => `heizen-v2-chat-${projectId}`;

/* ---- One exchange in the conversation ---- */
interface Turn {
  id: number;
  question: string;
  loading: boolean;
  answer?: AiRichAnswer;
  focusNote?: string;
  investigate?: InvestigateResult;
}

/* ---- Launcher + panel, mounted once for all project screens ---- */
export function ProjectAssistant({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="assistant-fab"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Sparkles aria-hidden />
        <span>Ask AI</span>
      </button>
      <AssistantPanel open={open} onClose={() => setOpen(false)} projectId={projectId} />
    </>
  );
}

function loadTurns(projectId: string): Turn[] {
  try {
    const raw = localStorage.getItem(chatKey(projectId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Turn[];
    // Drop any half-resolved turns from a previous session.
    return parsed.filter((t) => !t.loading).slice(-MAX_TURNS);
  } catch {
    return [];
  }
}

function AssistantPanel({
  open,
  onClose,
  projectId,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
}) {
  const { focus, setFocus, clearFocus } = useFocus(projectId);
  const { notify } = useToast();
  const [turns, setTurns] = useState<Turn[]>(() => loadTurns(projectId));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [investigateOpen, setInvestigateOpen] = useState(false);
  const [input, setInput] = useState("");
  const seq = useRef(0);
  const timers = useRef<number[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const hasChat = turns.length > 0;

  // Persist the resolved history (project-specific, short).
  useEffect(() => {
    try {
      const resolved = turns.filter((t) => !t.loading).slice(-MAX_TURNS);
      localStorage.setItem(chatKey(projectId), JSON.stringify(resolved));
    } catch {
      /* prototype — best effort */
    }
  }, [turns, projectId]);

  // Reload this project's history whenever the panel is opened.
  useEffect(() => {
    if (open) {
      setTurns(loadTurns(projectId));
      setPickerOpen(false);
      setInvestigateOpen(false);
    }
  }, [open, projectId]);

  // Clear any pending timers on unmount.
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );

  // Keep the latest exchange in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  const push = (turn: Turn) => setTurns((prev) => [...prev, turn].slice(-MAX_TURNS));
  const resolve = (id: number, patch: Partial<Turn>) =>
    setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, loading: false } : t)));

  /** Ask a question (free text, suggested answer action, or follow-up chip). */
  const ask = (question: string, precomputed?: AiRichAnswer) => {
    const q = question.trim();
    if (!q) return;
    const id = ++seq.current + Date.now();
    push({ id, question: q, loading: true });
    setInvestigateOpen(false);
    const t = window.setTimeout(() => {
      resolve(id, { answer: precomputed ?? answerQuestion(q) });
    }, 560);
    timers.current.push(t);
  };

  const runAction = (a: AssistantAction) => {
    if (a.kind === "investigate") {
      setInvestigateOpen(true);
      return;
    }
    if (a.focus) setFocus(a.focus);
    if (a.kind === "focus") {
      const id = ++seq.current + Date.now();
      push({ id, question: a.label, loading: false, focusNote: a.focusNote });
      return;
    }
    ask(a.label, a.answer);
  };

  const runInvestigate = (query: string) => {
    const q = query.trim();
    if (!q) return;
    const id = ++seq.current + Date.now();
    push({ id, question: `Investigate: ${q}`, loading: true });
    setInvestigateOpen(false);
    const t = window.setTimeout(() => {
      resolve(id, { investigate: investigateDomain(q) });
    }, 850);
    timers.current.push(t);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
    setInput("");
  };

  const newConversation = () => {
    setTurns([]);
    setInvestigateOpen(false);
    setPickerOpen(false);
    notify({ title: "Started a new conversation", tone: "info" });
  };
  const clearChat = () => {
    setTurns([]);
    setInvestigateOpen(false);
    try {
      localStorage.removeItem(chatKey(projectId));
    } catch {
      /* ignore */
    }
    notify({ title: "Chat cleared", tone: "info" });
  };

  const composer = (
    <form className="asst-composer" onSubmit={submit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={hasChat ? "Ask a follow-up…" : "Ask about this project…"}
        aria-label="Ask the project assistant a question"
      />
      <button className="asst-composer__send" type="submit" disabled={!input.trim()} aria-label="Send">
        <Send aria-hidden />
      </button>
    </form>
  );

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Project research assistant"
      subtitle="Clio Snacks · grounded in project research — review before you rely on it."
      footer={composer}
    >
      <div className="ai-disclaimer">
        <Sparkles aria-hidden />
        <span>
          Simulated AI, generated from this project's data. Nothing is sent, saved or
          delivered automatically — every answer is a draft to verify.
        </span>
      </div>

      {/* Conversation controls */}
      {hasChat && (
        <div className="asst-toolbar">
          <button className="asst-tool" onClick={newConversation}>
            <Plus aria-hidden /> New conversation
          </button>
          <button className="asst-tool asst-tool--ghost" onClick={clearChat}>
            <Trash2 aria-hidden /> Clear chat
          </button>
        </div>
      )}

      {/* Active focus (always available) */}
      <FocusBlock
        focus={focus}
        pickerOpen={pickerOpen}
        onToggle={() => setPickerOpen((v) => !v)}
        onApply={(f) => {
          setFocus(f);
          setPickerOpen(false);
        }}
        onClear={() => {
          clearFocus();
          setPickerOpen(false);
        }}
      />

      {/* Suggested actions — only before the first message */}
      {!hasChat && (
        <div className="asst-actions">
          <span className="ai-prompts__label">Suggested actions</span>
          {ASSISTANT_ACTIONS.map((a) => (
            <button key={a.id} className="ai-prompt" onClick={() => runAction(a)}>
              {a.kind === "investigate" ? (
                <Search aria-hidden />
              ) : a.kind === "focus" ? (
                <Crosshair aria-hidden />
              ) : (
                <Sparkles aria-hidden />
              )}
              <span>{a.label}</span>
              <ChevronRight className="ai-prompt__go" aria-hidden />
            </button>
          ))}
          <InvestigateEntry onGo={() => setInvestigateOpen(true)} />
        </div>
      )}

      {/* Conversation history */}
      {turns.map((turn) => (
        <TurnView
          key={turn.id}
          turn={turn}
          projectId={projectId}
          onClose={onClose}
          onFollow={ask}
          onFocus={setFocus}
          notify={notify}
        />
      ))}

      {/* Investigate input (reachable in both states) */}
      {investigateOpen && (
        <InvestigateInline
          onSubmit={runInvestigate}
          onCancel={() => setInvestigateOpen(false)}
        />
      )}

      {/* Persistent way back to a domain investigation mid-chat */}
      {hasChat && !investigateOpen && (
        <button className="asst-inv-link" onClick={() => setInvestigateOpen(true)}>
          <Search aria-hidden /> Investigate a domain
        </button>
      )}

      <div ref={endRef} aria-hidden />
    </SidePanel>
  );
}

/* ---- Focus block (active state + set state) ---- */
function FocusBlock({
  focus,
  pickerOpen,
  onToggle,
  onApply,
  onClear,
}: {
  focus: Focus | null;
  pickerOpen: boolean;
  onToggle: () => void;
  onApply: (f: Focus) => void;
  onClear: () => void;
}) {
  return (
    <>
      {isActiveFocus(focus) ? (
        <div className="asst-focus is-on">
          <div className="asst-focus__row">
            <Crosshair aria-hidden />
            <span className="asst-focus__label">Focus</span>
            <span className="asst-focus__value">{focusSummary(focus)}</span>
          </div>
          <p className="asst-focus__note">
            Research signals, hypotheses, questions and related Heizen work are re-ranked.
            Nothing is hidden or deleted.
          </p>
          <div className="asst-focus__acts">
            <button className="btn btn-sm" onClick={onToggle}>
              Edit focus
            </button>
            <button className="btn btn-sm btn-ghost" onClick={onClear}>
              <X aria-hidden /> Clear focus
            </button>
          </div>
        </div>
      ) : (
        <button className="asst-focus asst-focus--set" onClick={onToggle}>
          <Crosshair aria-hidden />
          <span>Focus this project…</span>
          <ChevronRight aria-hidden />
        </button>
      )}
      {pickerOpen && <FocusPicker current={focus} onApply={onApply} onClear={onClear} />}
    </>
  );
}

/* ---- Focus picker ---- */
function FocusPicker({
  current,
  onApply,
  onClear,
}: {
  current: Focus | null;
  onApply: (f: Focus) => void;
  onClear: () => void;
}) {
  const [stakeholderId, setStakeholderId] = useState(current?.stakeholderId ?? "");
  const [domain, setDomain] = useState<FocusDomain | "">(current?.domain ?? "");
  const [stage, setStage] = useState<FocusStage | "">(current?.stage ?? "");

  const apply = () => {
    const f: Focus = {};
    if (stakeholderId) f.stakeholderId = stakeholderId;
    if (domain) f.domain = domain;
    if (stage) f.stage = stage;
    onApply(f);
  };
  const canApply = Boolean(stakeholderId || domain || stage);

  return (
    <div className="focus-picker">
      <div className="focus-picker__field">
        <label>Stakeholder</label>
        <select value={stakeholderId} onChange={(e) => setStakeholderId(e.target.value)}>
          <option value="">Any</option>
          {FOCUS_STAKEHOLDERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.role}
            </option>
          ))}
        </select>
      </div>
      <div className="focus-picker__field">
        <label>Domain</label>
        <select value={domain} onChange={(e) => setDomain(e.target.value as FocusDomain | "")}>
          <option value="">Any</option>
          {FOCUS_DOMAINS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div className="focus-picker__field">
        <label>Call stage</label>
        <select value={stage} onChange={(e) => setStage(e.target.value as FocusStage | "")}>
          <option value="">Any</option>
          {FOCUS_STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="focus-picker__acts">
        <button className="btn btn-primary btn-sm" onClick={apply} disabled={!canApply}>
          Apply focus
        </button>
        <button className="btn btn-sm btn-ghost" onClick={onClear}>
          Clear
        </button>
      </div>
      <p className="focus-picker__hint">
        Applying re-ranks content across the project — it never hides or deletes anything.
      </p>
    </div>
  );
}

/* ---- One conversation turn (question + answer) ---- */
function TurnView({
  turn,
  projectId,
  onClose,
  onFollow,
  onFocus,
  notify,
}: {
  turn: Turn;
  projectId: string;
  onClose: () => void;
  onFollow: (q: string) => void;
  onFocus: (f: Focus) => void;
  notify: (t: { title: string; body?: string; tone?: "success" | "info" }) => void;
}) {
  return (
    <div className="asst-turn">
      <div className="asst-user">
        <MessageSquare aria-hidden />
        <span>{turn.question}</span>
      </div>

      {turn.loading ? (
        <div className="ai-answer ai-answer--loading" aria-live="polite">
          <Loader className="spin" aria-hidden />
          <span>Drafting from project sources…</span>
        </div>
      ) : turn.focusNote ? (
        <div className="ai-answer" aria-live="polite">
          <div className="asst-note">
            <Crosshair aria-hidden />
            <span>{turn.focusNote}</span>
          </div>
          <div className="ai-links">
            <Link to={`/projects/${projectId}/research`} className="ai-link" onClick={onClose}>
              See re-ranked Research <ArrowUpRight aria-hidden />
            </Link>
          </div>
        </div>
      ) : turn.investigate ? (
        <InvestigateResultView result={turn.investigate} projectId={projectId} onClose={onClose} />
      ) : turn.answer ? (
        <RichAnswer
          answer={turn.answer}
          projectId={projectId}
          onClose={onClose}
          onFollow={onFollow}
          onFocus={onFocus}
          notify={notify}
        />
      ) : null}
    </div>
  );
}

function Block({ block }: { block: AiAnswerBlock }) {
  const Icon = TONE_ICON[block.tone ?? "info"];
  return (
    <div className={`ai-block ai-block--${block.tone ?? "info"}`}>
      <h4 className="ai-block__head">
        <Icon aria-hidden /> {block.heading}
      </h4>
      <ul className="ai-block__list">
        {block.points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

function RichAnswer({
  answer,
  projectId,
  onClose,
  onFollow,
  onFocus,
  notify,
}: {
  answer: AiRichAnswer;
  projectId: string;
  onClose: () => void;
  onFollow: (q: string) => void;
  onFocus: (f: Focus) => void;
  notify: (t: { title: string; body?: string; tone?: "success" | "info" }) => void;
}) {
  return (
    <div className="ai-answer" aria-live="polite">
      <p className="ai-answer__summary">{answer.summary}</p>
      {answer.blocks.map((b) => (
        <Block key={b.heading} block={b} />
      ))}

      <div className="ai-sources">
        <span className="ai-sources__label">
          <FileText aria-hidden /> Cited project sources
        </span>
        <div className="ai-sources__chips">
          {answer.sources.map((s) => (
            <Link
              key={s.label}
              to={`/projects/${projectId}/sources`}
              className={`ai-source-chip ai-source-chip--${s.visibility}`}
              onClick={onClose}
              title={`${s.label}${s.date ? ` · ${s.date}` : ""}`}
            >
              <span className="ai-source-chip__dot" aria-hidden />
              <span className="ai-source-chip__name">{s.label}</span>
              {s.date && <span className="ai-source-chip__date">{s.date}</span>}
              {s.pending && <span className="ai-source-chip__pending">pending</span>}
            </Link>
          ))}
        </div>
      </div>

      <AnswerActions
        answer={answer}
        projectId={projectId}
        onClose={onClose}
        onFocus={onFocus}
        notify={notify}
      />

      {answer.links && answer.links.length > 0 && (
        <div className="ai-links">
          {answer.links.map((l) => (
            <Link
              key={l.screen + l.label}
              to={`/projects/${projectId}/${l.screen}`}
              className="ai-link"
              onClick={onClose}
            >
              {l.label} <ArrowUpRight aria-hidden />
            </Link>
          ))}
        </div>
      )}

      {answer.followUps && answer.followUps.length > 0 && (
        <div className="asst-follow">
          <span className="asst-follow__label">Follow up</span>
          <div className="asst-follow__chips">
            {answer.followUps.map((f) => (
              <button key={f} className="asst-chip" onClick={() => onFollow(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Review-gated actions under an answer ---- */
function AnswerActions({
  answer,
  projectId,
  onClose,
  onFocus,
  notify,
}: {
  answer: AiRichAnswer;
  projectId: string;
  onClose: () => void;
  onFocus: (f: Focus) => void;
  notify: (t: { title: string; body?: string; tone?: "success" | "info" }) => void;
}) {
  const [confirm, setConfirm] = useState<"shortlist" | "focus" | null>(null);
  const [staged, setStaged] = useState<"shortlist" | "focus" | null>(null);

  const oppLink = answer.links?.find((l) => l.screen === "opportunities");
  const hasOpp = Boolean(answer.relatedOpportunity || oppLink);
  const firstSource = answer.sources[0];

  const confirmShortlist = () => {
    setStaged("shortlist");
    setConfirm(null);
    notify({
      title: "Staged for your review",
      body: "Added to the Questions shortlist to review — nothing was changed automatically.",
      tone: "info",
    });
  };
  const confirmFocus = () => {
    if (answer.domain) onFocus({ domain: answer.domain });
    setStaged("focus");
    setConfirm(null);
    notify({
      title: `Focused on ${domainLabel(answer.domain!)}`,
      body: "Content is re-ranked across the project. Nothing is hidden or deleted.",
      tone: "info",
    });
  };

  return (
    <div className="asst-acts">
      <div className="asst-acts__row">
        {answer.shortlistQuestion && staged !== "shortlist" && (
          <button className="asst-act" onClick={() => setConfirm("shortlist")}>
            <ListPlus aria-hidden /> Add question to shortlist
          </button>
        )}
        {firstSource && (
          <Link
            to={`/projects/${projectId}/sources`}
            className="asst-act"
            onClick={onClose}
          >
            <FileText aria-hidden /> Open supporting source
          </Link>
        )}
        {hasOpp && (
          <Link
            to={`/projects/${projectId}/opportunities`}
            className="asst-act"
            onClick={onClose}
          >
            <ArrowUpRight aria-hidden /> View related opportunity
          </Link>
        )}
        {answer.domain && staged !== "focus" && (
          <button className="asst-act" onClick={() => setConfirm("focus")}>
            <Crosshair aria-hidden /> Focus on {domainLabel(answer.domain)}
          </button>
        )}
      </div>

      {/* Review / confirm gate — nothing updates the project until confirmed */}
      {confirm === "shortlist" && answer.shortlistQuestion && (
        <div className="asst-confirm">
          <span className="asst-confirm__label">Add this question for review?</span>
          <p className="asst-confirm__q">“{answer.shortlistQuestion}”</p>
          <p className="asst-confirm__note">
            It will be staged in Questions for you to confirm — the assistant never edits the
            project directly.
          </p>
          <div className="asst-confirm__acts">
            <button className="btn btn-primary btn-sm" onClick={confirmShortlist}>
              Add for review
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setConfirm(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {confirm === "focus" && answer.domain && (
        <div className="asst-confirm">
          <span className="asst-confirm__label">Focus this project?</span>
          <p className="asst-confirm__note">
            Re-ranks Research, hypotheses and questions toward{" "}
            <strong>{domainLabel(answer.domain)}</strong>. Nothing is hidden — clear the focus
            chip to reset.
          </p>
          <div className="asst-confirm__acts">
            <button className="btn btn-primary btn-sm" onClick={confirmFocus}>
              Apply focus
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setConfirm(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {staged === "shortlist" && (
        <div className="asst-staged">
          <CheckCircle2 aria-hidden /> Staged for review.
          <Link to={`/projects/${projectId}/discovery`} className="asst-staged__link" onClick={onClose}>
            Open Questions <ArrowUpRight aria-hidden />
          </Link>
        </div>
      )}
      {staged === "focus" && answer.domain && (
        <div className="asst-staged">
          <CheckCircle2 aria-hidden /> Focused on {domainLabel(answer.domain)}.
        </div>
      )}
    </div>
  );
}

/* ---- Investigate a domain ---- */
function InvestigateEntry({ onGo }: { onGo: () => void }) {
  return (
    <button className="asst-investigate-entry" onClick={onGo}>
      <Search aria-hidden />
      <span className="asst-investigate-entry__text">
        <span className="asst-investigate-entry__title">Investigate a domain</span>
        <span className="asst-investigate-entry__sub">
          Simulate additional research and suggested sources
        </span>
      </span>
      <ChevronRight aria-hidden />
    </button>
  );
}

function InvestigateInline({
  onSubmit,
  onCancel,
}: {
  onSubmit: (query: string) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState("");
  return (
    <div className="asst-inv">
      <div className="asst-inv__head">
        <label className="asst-inv__label" htmlFor="asst-inv-q">
          Investigate a domain
        </label>
        <button className="asst-inv__close" onClick={onCancel} aria-label="Cancel">
          <X aria-hidden />
        </button>
      </div>
      <div className="asst-inv__row">
        <input
          id="asst-inv-q"
          type="text"
          placeholder="e.g. Cold-chain logistics, Procurement, Demand planning"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit(query)}
          autoFocus
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onSubmit(query)}
          disabled={!query.trim()}
        >
          <Search aria-hidden /> Investigate
        </button>
      </div>
    </div>
  );
}

function InvestigateResultView({
  result,
  projectId,
  onClose,
}: {
  result: InvestigateResult;
  projectId: string;
  onClose: () => void;
}) {
  return (
    <div className="ai-answer" aria-live="polite">
      <div className="asst-sim-tag">
        <Sparkles aria-hidden /> Simulated AI research
      </div>
      <p className="ai-answer__summary">{result.summary}</p>

      <div className="ai-block ai-block--info">
        <h4 className="ai-block__head">
          <Info aria-hidden /> Additional research (unconfirmed)
        </h4>
        <ul className="asst-findings">
          {result.findings.map((f, i) => (
            <li key={i}>
              <span className={`asst-conf asst-conf--${f.confidence}`}>
                {f.confidence === "inference" ? "Inference" : "Unverified"}
              </span>
              {f.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="asst-sources-sugg">
        <span className="ai-sources__label">
          <FileText aria-hidden /> Suggested sources to add
        </span>
        {result.suggestedSources.map((s) => (
          <div className="asst-sugg" key={s.label}>
            <span className="asst-sugg__name">{s.label}</span>
            <span className="asst-sugg__type">{s.type}</span>
          </div>
        ))}
      </div>

      <div className="ai-block ai-block--warn">
        <h4 className="ai-block__head">
          <AlertTriangle aria-hidden /> Not confirmed gaps
        </h4>
        <ul className="ai-block__list">
          <li>{result.note}</li>
        </ul>
      </div>

      <div className="ai-links">
        <Link to={`/projects/${projectId}/sources`} className="ai-link" onClick={onClose}>
          Add sources in Sources <ArrowUpRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
