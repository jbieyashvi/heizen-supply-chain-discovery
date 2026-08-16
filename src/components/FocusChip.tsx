import { Crosshair, X } from "lucide-react";
import { useFocus } from "../hooks/useFocus";
import { isActiveFocus, focusSummary } from "../data/focus";

/** Active-focus chip with Clear. Renders nothing when no focus is set.
   Focus re-ranks content — it never hides or deletes anything. */
export function FocusChip({ projectId }: { projectId: string }) {
  const { focus, clearFocus } = useFocus(projectId);
  if (!isActiveFocus(focus)) return null;
  return (
    <div className="focus-chip" role="status">
      <Crosshair className="focus-chip__icon" aria-hidden />
      <span className="focus-chip__label">Focus</span>
      <span className="focus-chip__value">{focusSummary(focus)}</span>
      <span className="focus-chip__note">· re-ranked, nothing hidden</span>
      <button className="focus-chip__clear" onClick={clearFocus}>
        <X aria-hidden /> Clear focus
      </button>
    </div>
  );
}
