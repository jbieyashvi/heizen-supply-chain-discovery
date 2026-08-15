import type { Opportunity } from "../data/types";
import { EvidenceBadge } from "./StatusBadges";
import { Badge } from "./Badge";
import { confidenceMeta } from "../lib/status";

export function OpportunityPreview({ opp }: { opp: Opportunity }) {
  const c = confidenceMeta[opp.confidence];
  return (
    <div className="oppcard">
      <div className="oppcard__top">
        <h4 className="oppcard__title">{opp.title}</h4>
        <Badge tone={c.tone}>{c.label}</Badge>
      </div>
      <p className="oppcard__impact">{opp.impact}</p>
      <div className="oppcard__foot">
        <div className="oppcard__row">
          <span className="oppcard__k">Confirmation</span>
          <EvidenceBadge level={opp.confirmation} />
        </div>
        <div className="oppcard__row">
          <span className="oppcard__k">Still to validate</span>
          <span className="oppcard__v">{opp.validation}</span>
        </div>
      </div>
    </div>
  );
}
