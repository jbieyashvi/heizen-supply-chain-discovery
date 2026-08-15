import {
  Ear,
  Target,
  FlaskConical,
  CheckCircle2,
  Star,
  StarOff,
  CircleSlash,
  Pencil,
  PlayCircle,
  Link2,
  ListChecks,
} from "lucide-react";
import { SidePanel } from "../SidePanel";
import { Badge } from "../Badge";
import { EvidenceBadge } from "../StatusBadges";
import { Tooltip } from "../Tooltip";
import { priorityMeta } from "../../lib/status";
import { typeLabel, areaLabel } from "../../data/discovery";
import { useDiscovery } from "../../hooks/useDiscovery";
import { useToast } from "../Toast";

export function QuestionDetailPanel({
  questionId,
  onClose,
  onStartCallFrom,
}: {
  questionId: string | null;
  onClose: () => void;
  onStartCallFrom: (id: string) => void;
}) {
  const { get, toggleShortlist, setOutcome } = useDiscovery();
  const { notify } = useToast();
  const q = questionId ? get(questionId) : undefined;

  return (
    <SidePanel
      open={Boolean(q)}
      onClose={onClose}
      title="Question detail"
      subtitle={q ? typeLabel(q.type) : undefined}
      footer={
        q ? (
          <div className="qdetail__foot">
            <button
              className="btn btn-sm"
              onClick={() => toggleShortlist(q.id)}
            >
              {q.shortlisted ? (
                <>
                  <StarOff /> Remove from shortlist
                </>
              ) : (
                <>
                  <Star /> Add to shortlist
                </>
              )}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onStartCallFrom(q.id)}
            >
              <PlayCircle /> Start call from here
            </button>
          </div>
        ) : undefined
      }
    >
      {q && (
        <div className="qdetail">
          <div className="qdetail__badges">
            <Badge tone={priorityMeta[q.priority].tone} dot>
              {priorityMeta[q.priority].label}
            </Badge>
            <Badge tone="neutral">{typeLabel(q.type)}</Badge>
            {q.criticalUnknown && (
              <Tooltip label="One of the four critical unknowns for this call.">
                <Badge tone="red">Critical unknown</Badge>
              </Tooltip>
            )}
          </div>

          <h3 className="qdetail__q">{q.question}</h3>
          <p className="qdetail__area">{areaLabel(q.area)}</p>

          {/* Relationship trail */}
          <div className="trail">
            <span className="trail__step">
              <FlaskConical aria-hidden /> Research finding
            </span>
            <span className="trail__arrow">→</span>
            <span className="trail__step is-current">
              <ListChecks aria-hidden /> This question
            </span>
            <span className="trail__arrow">→</span>
            <span className="trail__step">Client answer</span>
            <span className="trail__arrow">→</span>
            <span className="trail__step">
              <Target aria-hidden /> Opportunity confidence
            </span>
          </div>

          <section className="qdetail__block">
            <h4 className="qdetail__label">Why it matters</h4>
            <p>{q.whyItMatters}</p>
          </section>
          <section className="qdetail__block">
            <h4 className="qdetail__label">Decision it influences</h4>
            <p>{q.decision}</p>
          </section>

          <div className="qdetail__links">
            <span className="qdetail__link">
              <FlaskConical aria-hidden /> {q.relatedFinding}
              <EvidenceBadge level={q.relatedFindingEvidence} />
            </span>
            <span className="qdetail__link">
              <Target aria-hidden /> {q.relatedOpportunity}
            </span>
          </div>

          {q.partial && (
            <section className="qdetail__partial">
              <div className="qdetail__partial-head">
                <CheckCircle2 aria-hidden /> Partially answered by Research
              </div>
              <p className="qdetail__partial-row">
                <span>Existing evidence</span>
                {q.partial.summary}
              </p>
              <p className="qdetail__partial-row">
                <span>Remaining unknown</span>
                {q.partial.remainingUnknown}
              </p>
              <p className="qdetail__partial-row">
                <span>Worth asking because</span>
                {q.partial.worthAsking}
              </p>
            </section>
          )}

          <section className="qdetail__block">
            <h4 className="qdetail__label">
              <Ear aria-hidden /> Listen for
            </h4>
            <ul className="qdetail__list">
              {q.listenFor.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>

          <section className="qdetail__block">
            <h4 className="qdetail__label">Evidence that would close it</h4>
            <p>{q.evidenceToClose}</p>
          </section>

          {q.followUps.length > 0 && (
            <section className="qdetail__block">
              <h4 className="qdetail__label">Suggested follow-ups</h4>
              <ul className="qdetail__list">
                {q.followUps.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="qdetail__block">
            <h4 className="qdetail__label">Recommended stakeholder</h4>
            <p>{q.stakeholder}</p>
          </section>

          <div className="qdetail__secondary-actions">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setOutcome(q.id, "answered");
                notify({
                  title: "Marked as already answered",
                  body: "Moved to the Answered view.",
                });
              }}
            >
              <CheckCircle2 /> Mark already answered
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setOutcome(q.id, "not-relevant");
                notify({
                  title: "Marked not relevant",
                  body: "Removed from this call.",
                  tone: "info",
                });
              }}
            >
              <CircleSlash /> Not relevant
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() =>
                notify({
                  title: "Edit question",
                  body: "Editing is a prototype action — no changes saved.",
                  tone: "info",
                })
              }
            >
              <Pencil /> Edit question
            </button>
          </div>

          <p className="qdetail__rel-note">
            <Link2 aria-hidden /> Answers captured on the call flow back to the
            related opportunity's confidence.
          </p>
        </div>
      )}
    </SidePanel>
  );
}
