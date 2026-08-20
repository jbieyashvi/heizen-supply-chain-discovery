import { useState } from "react";
import {
  Users,
  CalendarClock,
  ListChecks,
  Clock3,
  AlertTriangle,
  Info,
  PlayCircle,
} from "lucide-react";
import { Modal } from "../Modal";
import { MEETING, STAKEHOLDER, discoveryMeta } from "../../data/discovery";
import { useDiscovery } from "../../hooks/useDiscovery";

export function StartCallDialog({
  open,
  onClose,
  onStart,
  fromQuestion,
}: {
  open: boolean;
  onClose: () => void;
  onStart: (mode: "recommended" | "selected") => void;
  fromQuestion?: { id: string; label: string } | null;
}) {
  const { shortlisted, sortMode } = useDiscovery();
  const agendaOrdered = sortMode === "custom";
  const [startFrom, setStartFrom] = useState<"recommended" | "selected">(
    "recommended"
  );

  const count = shortlisted.length;
  const mins = count * discoveryMeta.minutesPerQuestion;
  const criticalUnknowns = shortlisted.filter((q) => q.criticalUnknown).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start call"
      subtitle="Enter a focused call interface for the shortlisted questions"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onStart(startFrom)}>
            <PlayCircle /> Start Call Mode
          </button>
        </>
      }
    >
      <ul className="confirm-list">
        <li>
          <Users aria-hidden /> Clio Snacks — {STAKEHOLDER.name}, {STAKEHOLDER.role}
        </li>
        <li>
          <CalendarClock aria-hidden /> {MEETING.full} at {MEETING.time} ·{" "}
          {MEETING.relative}
        </li>
        <li>
          <ListChecks aria-hidden /> {count} shortlisted question
          {count === 1 ? "" : "s"}
        </li>
        <li>
          <Clock3 aria-hidden /> Approximately {mins} minutes at ~
          {discoveryMeta.minutesPerQuestion} min per question
        </li>
        <li>
          <AlertTriangle aria-hidden /> {criticalUnknowns} critical unknown
          {criticalUnknowns === 1 ? "" : "s"} in this set
        </li>
      </ul>

      <fieldset className="startcall__choice">
        <legend>Where should the call begin?</legend>
        <label className={startFrom === "recommended" ? "is-sel" : ""}>
          <input
            type="radio"
            name="startfrom"
            checked={startFrom === "recommended"}
            onChange={() => setStartFrom("recommended")}
          />
          <span>
            <strong>{agendaOrdered ? "Agenda order" : "Recommended order"}</strong>
            <span className="startcall__hint">
              {agendaOrdered
                ? "The questions you added, in the order you added them"
                : "Current process → business impact → evidence → decisions"}
            </span>
          </span>
        </label>
        {fromQuestion && (
          <label className={startFrom === "selected" ? "is-sel" : ""}>
            <input
              type="radio"
              name="startfrom"
              checked={startFrom === "selected"}
              onChange={() => setStartFrom("selected")}
            />
            <span>
              <strong>Start from the selected question</strong>
              <span className="startcall__hint">{fromQuestion.label}</span>
            </span>
          </label>
        )}
      </fieldset>

      <p className="startcall__note">
        <Info aria-hidden /> Responses are stored locally in this prototype and are
        not persisted or sent anywhere.
      </p>
    </Modal>
  );
}
