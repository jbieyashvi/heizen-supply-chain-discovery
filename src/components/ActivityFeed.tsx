import {
  FileText,
  MessagesSquare,
  Target,
  FilePlus2,
  RefreshCw,
} from "lucide-react";
import type { ActivityEntry } from "../data/types";

const kindIcon = {
  transcript: FileText,
  questions: MessagesSquare,
  opportunity: Target,
  source: FilePlus2,
  research: RefreshCw,
};

const kindTone: Record<ActivityEntry["kind"], string> = {
  transcript: "info",
  questions: "accent",
  opportunity: "green",
  source: "violet",
  research: "amber",
};

export function ActivityFeed({ items }: { items: ActivityEntry[] }) {
  return (
    <ul className="activity">
      {items.map((a) => {
        const Icon = kindIcon[a.kind];
        return (
          <li key={a.id} className="activity__item">
            <span className={`activity__icon tone-${kindTone[a.kind]}`} aria-hidden>
              <Icon />
            </span>
            <span className="activity__text">{a.text}</span>
            <span className="activity__time">{a.time}</span>
          </li>
        );
      })}
    </ul>
  );
}
