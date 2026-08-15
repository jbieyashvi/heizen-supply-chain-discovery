import { FileText, Globe, Lock, HelpCircle, Target, AlertTriangle } from "lucide-react";
import { SidePanel } from "../SidePanel";
import { EvidenceBadge } from "../StatusBadges";
import type { EvidenceDetail } from "../../data/research";
import type { EvidenceLevel } from "../../data/types";

export interface EvidenceView {
  title: string;
  evidence: EvidenceLevel;
  detail: EvidenceDetail;
}

export function EvidencePanel({
  view,
  onClose,
}: {
  view: EvidenceView | null;
  onClose: () => void;
}) {
  return (
    <SidePanel
      open={Boolean(view)}
      onClose={onClose}
      title="Evidence"
      subtitle={view?.title}
    >
      {view && (
        <div className="ev">
          <div className="ev__row">
            <EvidenceBadge level={view.evidence} />
            <span className={`ev__vis ev__vis--${view.detail.visibility}`}>
              {view.detail.visibility === "client" ? <Lock /> : <Globe />}
              {view.detail.visibility === "client" ? "Client-provided" : "Public"}
            </span>
          </div>

          <div className="ev__source">
            <FileText aria-hidden />
            <div>
              <div className="ev__source-title">{view.detail.source}</div>
              <div className="ev__source-meta">
                {view.detail.sourceType} · {view.detail.date}
              </div>
            </div>
          </div>

          <section className="ev__block">
            <h3 className="ev__label">Relevant excerpt</h3>
            <p className="ev__excerpt">{view.detail.excerpt}</p>
          </section>

          <section className="ev__block">
            <h3 className="ev__label">Supports this conclusion</h3>
            <p className="ev__text">{view.detail.supports}</p>
          </section>

          {view.detail.conflicts && (
            <section className="ev__block ev__block--warn">
              <h3 className="ev__label">
                <AlertTriangle aria-hidden /> Conflicting or missing evidence
              </h3>
              <p className="ev__text">{view.detail.conflicts}</p>
            </section>
          )}

          {view.detail.relatedQuestions.length > 0 && (
            <section className="ev__block">
              <h3 className="ev__label">
                <HelpCircle aria-hidden /> Related discovery questions
              </h3>
              <ul className="ev__list">
                {view.detail.relatedQuestions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </section>
          )}

          {view.detail.relatedOpportunities.length > 0 && (
            <section className="ev__block">
              <h3 className="ev__label">
                <Target aria-hidden /> Related opportunities
              </h3>
              <ul className="ev__list">
                {view.detail.relatedOpportunities.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </SidePanel>
  );
}
