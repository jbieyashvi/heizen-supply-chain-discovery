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
} from "lucide-react";
import { SidePanel } from "./SidePanel";
import { ASK_AI_PROMPTS, type AiPrompt, type AiAnswerBlock } from "../data/assistant";

const TONE_ICON = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  info: Info,
} as const;

function AnswerBlock({ block }: { block: AiAnswerBlock }) {
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

function Answer({ prompt, projectId }: { prompt: AiPrompt; projectId: string }) {
  const [loading, setLoading] = useState(true);
  const timer = useRef<number | null>(null);

  // Simulate a short "drafting from sources" pass so the grounding reads honestly.
  useEffect(() => {
    setLoading(true);
    timer.current = window.setTimeout(() => setLoading(false), 620);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [prompt.id]);

  if (loading) {
    return (
      <div className="ai-answer ai-answer--loading" aria-live="polite">
        <Loader className="spin" aria-hidden />
        <span>Drafting from project sources…</span>
      </div>
    );
  }

  const { answer } = prompt;
  return (
    <div className="ai-answer" aria-live="polite">
      <p className="ai-answer__summary">{answer.summary}</p>
      {answer.blocks.map((b) => (
        <AnswerBlock key={b.heading} block={b} />
      ))}

      <div className="ai-sources">
        <span className="ai-sources__label">
          <FileText aria-hidden /> Generated from project sources
        </span>
        <div className="ai-sources__chips">
          {answer.sources.map((s) => (
            <Link
              key={s.label}
              to={`/projects/${projectId}/research`}
              className={`ai-source-chip ai-source-chip--${s.visibility}`}
              title={`${s.label}${s.date ? ` · ${s.date}` : ""}${
                s.pending ? " · not yet in the written brief" : ""
              }`}
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

export function AskAIPanel({
  open,
  onClose,
  projectId,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = ASK_AI_PROMPTS.find((p) => p.id === activeId) ?? null;

  // Start each open session on the prompt list.
  useEffect(() => {
    if (open) setActiveId(null);
  }, [open]);

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Ask AI"
      subtitle="Answers are drafted from this project's research and sources."
    >
      <div className="ai-disclaimer">
        <Sparkles aria-hidden />
        <span>
          AI-generated from this project's data. Review before you rely on it or
          share it — nothing here is sent automatically.
        </span>
      </div>

      {!active ? (
        <div className="ai-prompts">
          <span className="ai-prompts__label">Suggested questions</span>
          {ASK_AI_PROMPTS.map((p) => (
            <button
              key={p.id}
              className="ai-prompt"
              onClick={() => setActiveId(p.id)}
            >
              <Sparkles aria-hidden />
              <span>{p.prompt}</span>
              <ChevronRight className="ai-prompt__go" aria-hidden />
            </button>
          ))}
        </div>
      ) : (
        <div className="ai-thread">
          <button className="ai-back" onClick={() => setActiveId(null)}>
            <ArrowLeft aria-hidden /> Suggested questions
          </button>
          <div className="ai-question">
            <span className="ai-question__label">You asked</span>
            {active.prompt}
          </div>
          <Answer prompt={active} projectId={projectId} />
        </div>
      )}
    </SidePanel>
  );
}
