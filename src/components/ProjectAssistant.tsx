import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
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
} from "lucide-react";
import { SidePanel } from "./SidePanel";
import { useFocus } from "../hooks/useFocus";
import {
  ASSISTANT_ACTIONS,
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
  type Focus,
  type FocusDomain,
  type FocusStage,
} from "../data/focus";

const TONE_ICON = { ok: CheckCircle2, warn: AlertTriangle, info: Info } as const;

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

type View = "home" | "answer" | "investigate";

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
  const [view, setView] = useState<View>("home");
  const [action, setAction] = useState<AssistantAction | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setView("home");
      setAction(null);
      setPickerOpen(false);
    }
  }, [open]);

  const runAction = (a: AssistantAction) => {
    if (a.focus) setFocus(a.focus);
    if (a.kind === "investigate") {
      setView("investigate");
      return;
    }
    setAction(a);
    setView("answer");
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Project research assistant"
      subtitle="Grounded in Clio Snacks research — review before you rely on it."
    >
      <div className="ai-disclaimer">
        <Sparkles aria-hidden />
        <span>
          Simulated AI, generated from this project's data. Nothing is sent, saved or
          delivered automatically — every answer is a draft to verify.
        </span>
      </div>

      {view === "home" && (
        <div className="asst-home">
          {/* Active focus */}
          {isActiveFocus(focus) ? (
            <div className="asst-focus is-on">
              <div className="asst-focus__row">
                <Crosshair aria-hidden />
                <span className="asst-focus__label">Focus</span>
                <span className="asst-focus__value">{focusSummary(focus)}</span>
              </div>
              <p className="asst-focus__note">
                Research signals, hypotheses, questions and related Heizen work are
                re-ranked. Nothing is hidden or deleted.
              </p>
              <div className="asst-focus__acts">
                <button className="btn btn-sm" onClick={() => setPickerOpen((v) => !v)}>
                  Edit focus
                </button>
                <button className="btn btn-sm btn-ghost" onClick={clearFocus}>
                  <X aria-hidden /> Clear focus
                </button>
              </div>
            </div>
          ) : (
            <button
              className="asst-focus asst-focus--set"
              onClick={() => setPickerOpen((v) => !v)}
            >
              <Crosshair aria-hidden />
              <span>Focus this project…</span>
              <ChevronRight aria-hidden />
            </button>
          )}

          {pickerOpen && (
            <FocusPicker
              current={focus}
              onApply={(f) => {
                setFocus(f);
                setPickerOpen(false);
              }}
              onClear={() => {
                clearFocus();
                setPickerOpen(false);
              }}
            />
          )}

          {/* Suggested actions */}
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
          </div>

          <InvestigateEntry onGo={() => setView("investigate")} />
        </div>
      )}

      {view === "answer" && action && (
        <AnswerThread
          action={action}
          projectId={projectId}
          onBack={() => setView("home")}
          onClose={onClose}
        />
      )}

      {view === "investigate" && (
        <InvestigateThread projectId={projectId} onBack={() => setView("home")} onClose={onClose} />
      )}
    </SidePanel>
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

/* ---- Answer thread (rich answer or focus note) ---- */
function AnswerThread({
  action,
  projectId,
  onBack,
  onClose,
}: {
  action: AssistantAction;
  projectId: string;
  onBack: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 560);
    return () => window.clearTimeout(t);
  }, [action.id]);

  return (
    <div className="ai-thread">
      <button className="ai-back" onClick={onBack}>
        <ArrowLeft aria-hidden /> Suggested actions
      </button>
      <div className="ai-question">
        <span className="ai-question__label">You asked</span>
        {action.label}
      </div>

      {loading ? (
        <div className="ai-answer ai-answer--loading" aria-live="polite">
          <Loader className="spin" aria-hidden />
          <span>Drafting from project sources…</span>
        </div>
      ) : action.answer ? (
        <RichAnswer answer={action.answer} projectId={projectId} onClose={onClose} />
      ) : (
        <div className="ai-answer" aria-live="polite">
          <div className="asst-note">
            <Crosshair aria-hidden />
            <span>{action.focusNote}</span>
          </div>
          <div className="ai-links">
            <Link
              to={`/projects/${projectId}/research`}
              className="ai-link"
              onClick={onClose}
            >
              See re-ranked Research <ArrowUpRight aria-hidden />
            </Link>
          </div>
        </div>
      )}
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
}: {
  answer: AiRichAnswer;
  projectId: string;
  onClose: () => void;
}) {
  return (
    <div className="ai-answer" aria-live="polite">
      <p className="ai-answer__summary">{answer.summary}</p>
      {answer.blocks.map((b) => (
        <Block key={b.heading} block={b} />
      ))}

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

      <div className="ai-sources">
        <span className="ai-sources__label">
          <FileText aria-hidden /> Cited project sources
        </span>
        <div className="ai-sources__chips">
          {answer.sources.map((s) => (
            <Link
              key={s.label}
              to={`/projects/${projectId}/research`}
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

function InvestigateThread({
  projectId,
  onBack,
  onClose,
}: {
  projectId: string;
  onBack: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestigateResult | null>(null);
  const timer = useRef<number | null>(null);

  const go = () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    timer.current = window.setTimeout(() => {
      setResult(investigateDomain(query));
      setLoading(false);
    }, 900);
  };
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  return (
    <div className="ai-thread">
      <button className="ai-back" onClick={onBack}>
        <ArrowLeft aria-hidden /> Suggested actions
      </button>

      <div className="asst-inv">
        <label className="asst-inv__label" htmlFor="asst-inv-q">
          Investigate a domain
        </label>
        <div className="asst-inv__row">
          <input
            id="asst-inv-q"
            type="text"
            placeholder="e.g. Cold-chain logistics, Procurement, Demand planning"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
          />
          <button className="btn btn-primary btn-sm" onClick={go} disabled={!query.trim() || loading}>
            {loading ? <Loader className="spin" aria-hidden /> : <Search aria-hidden />}
            {loading ? "Researching…" : "Investigate"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="ai-answer ai-answer--loading" aria-live="polite">
          <Loader className="spin" aria-hidden />
          <span>Researching “{query}” from public and market context…</span>
        </div>
      )}

      {result && (
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
      )}
    </div>
  );
}
