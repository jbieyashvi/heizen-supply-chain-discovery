import { Download, ShieldCheck } from "lucide-react";
import { Modal } from "../Modal";
import { Badge } from "../Badge";
import { Tooltip } from "../Tooltip";
import type { ResearchData } from "../../data/research";

/**
 * Client-shareable view of the brief: neutral language, no internal strategy or
 * commercial positioning, hypotheses clearly labelled. Demonstrates the gap
 * between internal preparation and client-facing content.
 */
export function ClientReadyPreview({
  open,
  onClose,
  data,
  clientName,
}: {
  open: boolean;
  onClose: () => void;
  data: ResearchData;
  clientName: string;
}) {
  const b = data.brief;
  // Confirmed context only (client-confirmed / client-document); inference is labelled.
  const validated = b.signals.filter(
    (s) => s.evidence === "client-confirmed" || s.evidence === "client-document"
  );
  const hypotheses = b.signals.filter(
    (s) => s.evidence !== "client-confirmed" && s.evidence !== "client-document"
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Client-ready brief"
      subtitle={`A shareable summary for ${clientName} — internal strategy removed`}
      size="sheet"
      footer={
        <>
          <span className="client-note">
            <ShieldCheck aria-hidden /> Internal stakeholder strategy and commercial
            positioning are excluded from this view.
          </span>
          <Tooltip label="PDF export isn't available in this prototype yet.">
            <button className="btn" disabled aria-disabled="true">
              <Download /> Export PDF (soon)
            </button>
          </Tooltip>
        </>
      }
    >
      <div className="client-doc">
        <header className="client-doc__head">
          <span className="eyebrow">Discovery context</span>
          <h2 className="client-doc__headline">
            Preparing for our operations discovery conversation
          </h2>
          <p className="client-doc__lede">{b.situation}</p>
        </header>

        <section className="client-doc__block">
          <h3>Agreed context</h3>
          <p>{b.whyNow}</p>
        </section>

        <section className="client-doc__block">
          <h3>Validated challenges</h3>
          <ul className="client-doc__list">
            {validated.map((s) => (
              <li key={s.id}>
                <strong>{s.finding}.</strong> {s.whyItMatters}
              </li>
            ))}
          </ul>
        </section>

        <section className="client-doc__block">
          <h3>
            Areas to explore together{" "}
            <Badge tone="info">Hypotheses — to confirm</Badge>
          </h3>
          <ul className="client-doc__list">
            {hypotheses.map((s) => (
              <li key={s.id}>
                <em>{s.finding}</em> — an area we would like to validate with you.
              </li>
            ))}
          </ul>
        </section>

        <section className="client-doc__block">
          <h3>Opportunities to discuss</h3>
          <ul className="client-doc__list">
            {b.opportunities.map((o) => (
              <li key={o.id}>
                <strong>{o.title}.</strong> {o.value}
              </li>
            ))}
          </ul>
        </section>

        <section className="client-doc__block">
          <h3>Suggested next steps</h3>
          <ul className="client-doc__list">
            <li>Confirm the operational challenges above and their priority.</li>
            <li>Review the areas to explore and share any additional context.</li>
            <li>Agree a focus for the follow-up working session.</li>
          </ul>
        </section>
      </div>
    </Modal>
  );
}
