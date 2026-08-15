import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import type { Insight } from "../data/types";
import { EvidenceBadge } from "./StatusBadges";

export function InsightItem({ insight, rank }: { insight: Insight; rank: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `insight-panel-${insight.id}`;

  return (
    <div className={`insight${open ? " is-open" : ""}`}>
      <button
        className="insight__head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="insight__rank" aria-hidden>
          {rank}
        </span>
        <span className="insight__title">{insight.title}</span>
        <span className="insight__right">
          <EvidenceBadge level={insight.evidence} />
          <ChevronDown className="insight__chev" aria-hidden />
        </span>
      </button>
      <div className="insight__panel" id={panelId} hidden={!open}>
        <p className="insight__detail">{insight.detail}</p>
        <div className="insight__foot">
          <span className="insight__impact">{insight.impact}</span>
          <div className="insight__sources">
            {insight.sources.map((s) => (
              <span className="source-chip" key={s}>
                <FileText aria-hidden />
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
