import { SidePanel } from "../SidePanel";
import { hasAnswerContent, useDiscovery, type AugmentedQuestion } from "../../hooks/useDiscovery";
import {
  Circle,
  CheckCircle2,
  MinusCircle,
  XCircle,
  PenLine,
  SkipForward,
  CircleSlash,
  PlayCircle,
} from "lucide-react";

type NavState = { icon: JSX.Element; label: string; cls: string };

export function navState(q: AugmentedQuestion, isCurrent: boolean): NavState {
  // Completed states take precedence, even for the current question.
  if (q.outcome === "answered")
    return { icon: <CheckCircle2 />, label: "Answered", cls: "green" };
  if (q.outcome === "partial")
    return { icon: <MinusCircle />, label: "Partially answered", cls: "amber" };
  if (q.outcome === "not-answered")
    return { icon: <XCircle />, label: "Not answered", cls: "neutral" };
  if (q.outcome === "skipped")
    return { icon: <SkipForward />, label: "Skipped", cls: "neutral" };
  if (q.outcome === "not-relevant")
    return { icon: <CircleSlash />, label: "Not relevant", cls: "neutral" };

  // The displayed question is always "Current" unless it already has a
  // completed answer state (handled above).
  if (isCurrent)
    return { icon: <PlayCircle />, label: "Current", cls: "accent" };

  if (q.outcome === "in-progress" || hasAnswerContent(q.answer))
    return { icon: <PenLine />, label: "In progress", cls: "info" };

  return { icon: <Circle />, label: "Not visited", cls: "muted" };
}

export function QuestionNavigator({
  open,
  onClose,
  currentId,
  onJump,
}: {
  open: boolean;
  onClose: () => void;
  currentId: string | null;
  onJump: (index: number) => void;
}) {
  const { shortlisted } = useDiscovery();

  // Completed-state counts for the panel header.
  const counts = shortlisted.reduce(
    (acc, q) => {
      const isCurrent = q.id === currentId;
      const st = navState(q, isCurrent).label;
      acc[st] = (acc[st] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const done =
    (counts["Answered"] ?? 0) + (counts["Partially answered"] ?? 0);

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Question navigator"
      subtitle={`${done} of ${shortlisted.length} with a captured answer`}
    >
      <div className="qnav-counts" aria-hidden>
        {[
          ["Answered", "green"],
          ["Partially answered", "amber"],
          ["In progress", "info"],
          ["Skipped", "neutral"],
          ["Not visited", "muted"],
        ].map(([label, cls]) =>
          counts[label] ? (
            <span key={label} className={`qnav-count tone-${cls}`}>
              {counts[label]} {label.toLowerCase()}
            </span>
          ) : null
        )}
      </div>

      <ul className="qnav">
        {shortlisted.map((q, i) => {
          const isCurrent = q.id === currentId;
          const st = navState(q, isCurrent);
          return (
            <li key={q.id}>
              <button
                className={`qnav__item${isCurrent ? " is-current" : ""}`}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => onJump(i)}
              >
                <span className={`qnav__state tone-${st.cls}`} aria-hidden>
                  {st.icon}
                </span>
                <span className="qnav__body">
                  <span className="qnav__num">Q{i + 1}</span>
                  <span className="qnav__q">{q.question}</span>
                </span>
                <span className={`qnav__tag tone-${st.cls}`}>{st.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </SidePanel>
  );
}
