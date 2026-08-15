import { SidePanel } from "../SidePanel";
import { useDiscovery } from "../../hooks/useDiscovery";
import { Circle, CheckCircle2, MinusCircle, SkipForward, Dot } from "lucide-react";

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

  const stateOf = (q: (typeof shortlisted)[number]) => {
    if (q.outcome === "answered")
      return { icon: <CheckCircle2 />, label: "Answered", cls: "green" };
    if (q.outcome === "partial")
      return { icon: <MinusCircle />, label: "Partial", cls: "amber" };
    if (q.outcome === "skipped")
      return { icon: <SkipForward />, label: "Skipped", cls: "neutral" };
    return { icon: <Circle />, label: "Not visited", cls: "muted" };
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Question navigator"
      subtitle={`${shortlisted.length} shortlisted questions`}
    >
      <ul className="qnav">
        {shortlisted.map((q, i) => {
          const st = stateOf(q);
          const isCurrent = q.id === currentId;
          return (
            <li key={q.id}>
              <button
                className={`qnav__item${isCurrent ? " is-current" : ""}`}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => {
                  onJump(i);
                  onClose();
                }}
              >
                <span className={`qnav__state tone-${st.cls}`} aria-hidden>
                  {st.icon}
                </span>
                <span className="qnav__body">
                  <span className="qnav__num">
                    {isCurrent && <Dot className="qnav__dot" aria-hidden />}
                    Q{i + 1}
                  </span>
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
