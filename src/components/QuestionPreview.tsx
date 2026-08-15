import { Link2 } from "lucide-react";
import type { Question } from "../data/types";
import { Badge } from "./Badge";
import { priorityMeta } from "../lib/status";

const statusTone = {
  shortlisted: "accent",
  suggested: "neutral",
  asked: "green",
} as const;

const statusLabel = {
  shortlisted: "Shortlisted",
  suggested: "Suggested",
  asked: "Asked",
} as const;

export function QuestionPreview({ q }: { q: Question }) {
  const p = priorityMeta[q.priority];
  return (
    <div className="qcard">
      <div className="qcard__top">
        <Badge tone={p.tone} dot>
          {p.label}
        </Badge>
        <Badge tone={statusTone[q.status]}>{statusLabel[q.status]}</Badge>
      </div>
      <p className="qcard__q">{q.question}</p>
      <p className="qcard__purpose">{q.purpose}</p>
      <div className="qcard__link">
        <Link2 aria-hidden />
        <span>{q.relatedOpportunity}</span>
      </div>
    </div>
  );
}
