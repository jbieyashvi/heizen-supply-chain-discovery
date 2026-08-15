import { Download, ShieldCheck, CalendarClock } from "lucide-react";
import { Modal } from "../Modal";
import { Badge } from "../Badge";
import { Tooltip } from "../Tooltip";
import type { ResearchData } from "../../data/research";

/**
 * Client-shareable view of the brief. Neutral language only:
 * no internal stakeholder strategy, no champion/economic-buyer framing,
 * no commercial opportunity language, no internal confidence strategy, and
 * no unverified claim presented as fact. Agreed context holds only
 * client-confirmed information; public-derived context is separated and
 * labelled "Based on public information".
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

  // Agreed context = client-confirmed / client-document only.
  const agreed = b.signals.filter(
    (s) => s.evidence === "client-confirmed" || s.evidence === "client-document"
  );
  // Everything else is public-derived and must be validated.
  const toValidate = b.signals.filter(
    (s) => s.evidence !== "client-confirmed" && s.evidence !== "client-document"
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Client-ready brief"
      subtitle={`A shareable summary for ${clientName} — internal notes removed`}
      size="sheet"
      footer={
        <>
          <span className="client-note">
            <ShieldCheck aria-hidden /> Internal notes, stakeholder strategy and
            commercial positioning are excluded from this view.
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
          <p className="client-doc__date">
            <CalendarClock aria-hidden /> Tuesday, 18 August 2026 at 10:30
          </p>
          <p className="client-doc__lede">
            Clio Snacks is scaling a high-volume refrigerated manufacturing
            operation. Our discussion will focus on the operational handoffs
            between production, inventory, quality and planning, while preserving
            existing systems of record.
          </p>
        </header>

        <section className="client-doc__block">
          <h3>Agreed context</h3>
          <p className="client-doc__note">Confirmed together on our recent call.</p>
          <ul className="client-doc__list">
            {agreed.map((s) => (
              <li key={s.id}>
                <strong>{s.finding}.</strong> {s.whyItMatters}
              </li>
            ))}
          </ul>
        </section>

        <section className="client-doc__block">
          <h3>
            Context to validate <Badge tone="info">Based on public information</Badge>
          </h3>
          <p className="client-doc__note">
            Drawn from public sources — we'd like to confirm these with you.
          </p>
          <ul className="client-doc__list">
            <li>
              <em>
                A recent capacity expansion appears to have increased daily volume.
              </em>{" "}
              We'd like to confirm current throughput and its impact on planning.
            </li>
            {toValidate.map((s) => (
              <li key={s.id}>
                <em>{s.finding}.</em> An area we would like to validate together.
              </li>
            ))}
          </ul>
        </section>

        <section className="client-doc__block">
          <h3>Potential areas to improve</h3>
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
            <li>Confirm the agreed context above and its priority for your team.</li>
            <li>Review the items to validate and share any additional detail.</li>
            <li>Agree a focus for the follow-up working session.</li>
          </ul>
        </section>
      </div>
    </Modal>
  );
}
