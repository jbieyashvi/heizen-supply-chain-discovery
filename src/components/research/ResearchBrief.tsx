import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ArrowRight,
  CalendarClock,
  Target,
  Link2,
  Layers,
  Plug,
  AlertTriangle,
  CircleCheck,
  HelpCircle,
  History,
  Eye,
} from "lucide-react";
import type { ResearchData, Signal, Module } from "../../data/research";
import { Badge } from "../Badge";
import { EvidenceBadge } from "../StatusBadges";
import { Tooltip } from "../Tooltip";
import { confidenceMeta } from "../../lib/status";
import { OnThisPageNav } from "./OnThisPageNav";
import type { EvidenceView } from "./EvidencePanel";

const SECTIONS = [
  { id: "situation", label: "Situation" },
  { id: "signals", label: "Key signals" },
  { id: "opportunities", label: "Opportunities" },
  { id: "modules", label: "Proposed modules" },
  { id: "technology", label: "Technology" },
  { id: "stakeholders", label: "Stakeholders" },
  { id: "unknowns", label: "Unknowns" },
  { id: "similar", label: "Similar work" },
];

/* ---------- Signal ---------- */
function SignalCard({
  signal,
  rank,
  onEvidence,
}: {
  signal: Signal;
  rank: number;
  onEvidence: (v: EvidenceView) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `sig-panel-${signal.id}`;
  return (
    <div className={`signal${open ? " is-open" : ""}`}>
      <button
        className="signal__head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="signal__rank" aria-hidden>
          {rank}
        </span>
        <span className="signal__finding">{signal.finding}</span>
        <span className="signal__right">
          <EvidenceBadge level={signal.evidence} />
          <ChevronDown className="signal__chev" aria-hidden />
        </span>
      </button>
      <div className="signal__panel" id={panelId} hidden={!open}>
        <p className="signal__why">
          <span className="signal__why-label">Why it matters</span>
          {signal.whyItMatters}
        </p>
        <div className="signal__foot">
          <span className="signal__rel">
            <Target aria-hidden /> {signal.relatedOpportunity}
          </span>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() =>
              onEvidence({
                title: signal.finding,
                evidence: signal.evidence,
                detail: signal.detail,
              })
            }
          >
            <Eye /> View evidence
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Module ---------- */
function ModuleCard({ mod }: { mod: Module }) {
  return (
    <div className="module">
      <div className="module__top">
        <h4 className="module__name">{mod.name}</h4>
        {mod.priorWork && (
          <Tooltip label="Heizen has delivered a comparable solution before.">
            <Badge tone="green" icon={<History aria-hidden />}>
              Solved before
            </Badge>
          </Tooltip>
        )}
      </div>
      <dl className="module__grid">
        <div>
          <dt>Problem</dt>
          <dd>{mod.problem}</dd>
        </div>
        <div>
          <dt>Intended outcome</dt>
          <dd>{mod.outcome}</dd>
        </div>
      </dl>
      <div className="module__foot">
        <div className="module__works">
          <span className="module__works-label">Works alongside</span>
          <div className="chips">
            {mod.worksWith.map((w) => (
              <span className="chip-static" key={w}>
                {w}
              </span>
            ))}
          </div>
        </div>
        <EvidenceBadge level={mod.evidence} />
      </div>
    </div>
  );
}

export function ResearchBrief({
  data,
  projectId,
  openEvidence,
  onPreviewClientBrief,
}: {
  data: ResearchData;
  projectId: string;
  openEvidence: (v: EvidenceView) => void;
  onPreviewClientBrief: () => void;
}) {
  const [showAdditional, setShowAdditional] = useState(false);
  const b = data.brief;

  return (
    <div className="brief">
      <OnThisPageNav sections={SECTIONS} />

      <div className="brief__content">
        {/* Situation */}
        <section id="situation" className="brief-section situation">
          <div className="situation__main">
            <span className="eyebrow">Executive briefing</span>
            <h2 className="situation__headline">{b.headline}</h2>
            <p className="situation__summary">{b.situation}</p>
            <div className="situation__whynow">
              <span className="situation__whynow-label">Why now</span>
              <p>{b.whyNow}</p>
            </div>
            <button className="btn btn-sm" onClick={onPreviewClientBrief}>
              <Eye /> Preview client-ready brief
            </button>
          </div>
          <aside className="situation__side">
            <div className="situation__stat">
              <span className="situation__stat-label">Research confidence</span>
              <Badge tone="amber" dot>
                Usable · 2 pending
              </Badge>
            </div>
            <div className="situation__stat">
              <span className="situation__stat-label">Next meeting</span>
              <span className="situation__stat-value">
                <CalendarClock aria-hidden /> Tomorrow · 16 Aug, 10:30
              </span>
            </div>
            <div className="situation__stat">
              <span className="situation__stat-label">Primary contact</span>
              <span className="situation__stat-value">Meera Iyer, VP Operations</span>
            </div>
          </aside>
        </section>

        {/* Key signals */}
        <section id="signals" className="brief-section">
          <header className="brief-head">
            <h3 className="brief-title">Key signals</h3>
            <p className="brief-sub">
              The strongest operational problems found. Expand for evidence.
            </p>
          </header>
          <div className="signals">
            {b.signals.map((s, i) => (
              <SignalCard
                key={s.id}
                signal={s}
                rank={i + 1}
                onEvidence={openEvidence}
              />
            ))}
          </div>
        </section>

        {/* Opportunity thesis */}
        <section id="opportunities" className="brief-section">
          <header className="brief-head">
            <h3 className="brief-title">Opportunity thesis</h3>
            <p className="brief-sub">
              The strongest potential Heizen fits. Unconfirmed items are marked.
            </p>
          </header>
          <div className="opp-thesis">
            {b.opportunities.map((o) => {
              const c = confidenceMeta[o.strength];
              return (
                <div className="thesis" key={o.id}>
                  <div className="thesis__top">
                    <h4 className="thesis__title">{o.title}</h4>
                    <Badge tone={c.tone}>{c.label}</Badge>
                  </div>
                  <p className="thesis__value">{o.value}</p>
                  <div className="thesis__foot">
                    <span className="thesis__k">
                      Confirmation <EvidenceBadge level={o.confirmation} />
                    </span>
                    <span className="thesis__validate">
                      <span className="thesis__k-label">Still to validate</span>
                      {o.validation}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${projectId}/opportunities`}
                    className="thesis__link"
                  >
                    Opportunity detail <ArrowRight aria-hidden />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Proposed modules */}
        <section id="modules" className="brief-section">
          <header className="brief-head">
            <h3 className="brief-title">What we would build</h3>
            <p className="brief-sub">
              Proposed modules that work alongside existing systems of record.
            </p>
          </header>
          <div className="modules">
            {b.modules.primary.map((m) => (
              <ModuleCard key={m.id} mod={m} />
            ))}
          </div>
          <div className="additional">
            <button
              className="additional__toggle"
              aria-expanded={showAdditional}
              onClick={() => setShowAdditional((v) => !v)}
            >
              <ChevronDown className={showAdditional ? "is-open" : ""} aria-hidden />
              Additional possibilities ({b.modules.additional.length})
            </button>
            {showAdditional && (
              <div className="modules modules--secondary">
                {b.modules.additional.map((m) => (
                  <ModuleCard key={m.id} mod={m} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Technology */}
        <section id="technology" className="brief-section">
          <header className="brief-head">
            <h3 className="brief-title">Technology landscape</h3>
            <p className="brief-sub">
              Systems in use — and where the handoffs between them break.
            </p>
          </header>

          <div className="tech-handoffs">
            <div className="tech-handoffs__label">
              <AlertTriangle aria-hidden /> Weak handoffs
            </div>
            <ul className="handoffs">
              {b.tech.handoffs.map((h) => (
                <li key={h.id} className={`handoff sev-${h.severity}`}>
                  <span className="handoff__flow">
                    <span>{h.from}</span>
                    <ArrowRight aria-hidden />
                    <span>{h.to}</span>
                  </span>
                  <span className="handoff__problem">{h.problem}</span>
                  <Badge tone={h.severity === "high" ? "red" : "amber"} dot>
                    {h.severity === "high" ? "High impact" : "Medium"}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="tech-groups">
            <TechGroup
              icon={<Layers aria-hidden />}
              title="Systems of record"
              systems={b.tech.record}
            />
            <TechGroup
              icon={<Target aria-hidden />}
              title="Planning & analytics"
              systems={b.tech.planning}
            />
            <TechGroup
              icon={<Plug aria-hidden />}
              title="Plant / operational technology"
              systems={b.tech.ot}
            />
          </div>
        </section>

        {/* Stakeholders */}
        <section id="stakeholders" className="brief-section">
          <header className="brief-head">
            <h3 className="brief-title">Stakeholders</h3>
            <p className="brief-sub">Who to engage, and how to frame the conversation.</p>
          </header>
          <div className="stakeholders">
            {b.stakeholders.map((s) => (
              <div className="stake" key={s.name}>
                <div className="stake__id">
                  <span className="stake__name">{s.name}</span>
                  <span className="stake__title">{s.title}</span>
                </div>
                <Badge tone="accent">{s.role}</Badge>
                <p className="stake__why">{s.why}</p>
                <p className="stake__focus">
                  <span className="stake__focus-label">Focus</span>
                  {s.focus}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Unknowns */}
        <section id="unknowns" className="brief-section">
          <header className="brief-head">
            <h3 className="brief-title">Critical unknowns</h3>
            <p className="brief-sub">
              Answer these on the discovery call to firm up the thesis.
            </p>
          </header>
          <ul className="unknowns">
            {b.unknowns.map((u) => (
              <li key={u.id} className="unknown">
                <HelpCircle className="unknown__icon" aria-hidden />
                <div className="unknown__body">
                  <span className="unknown__text">{u.text}</span>
                  <Link
                    to={`/projects/${projectId}/discovery`}
                    className="unknown__q"
                  >
                    <Link2 aria-hidden /> {u.question}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Similar work */}
        <section id="similar" className="brief-section">
          <header className="brief-head">
            <h3 className="brief-title">Similar Heizen work</h3>
            <p className="brief-sub">Prior work relevant as supporting proof.</p>
          </header>
          <div className="similar">
            {b.similar.map((s) => (
              <div className="simwork" key={s.id}>
                <div className="simwork__top">
                  <span className="simwork__area">{s.area}</span>
                  <Badge tone={s.similarity === "high" ? "green" : "neutral"} dot>
                    {s.similarity === "high" ? "High similarity" : "Some overlap"}
                  </Badge>
                </div>
                <p className="simwork__pain">
                  <CircleCheck aria-hidden /> {s.relatedPain}
                </p>
                <p className="simwork__rel">{s.relevance}</p>
                <span className="simwork__client">{s.clientLabel}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function TechGroup({
  icon,
  title,
  systems,
}: {
  icon: React.ReactNode;
  title: string;
  systems: { name: string; role: string }[];
}) {
  return (
    <div className="tech-group">
      <div className="tech-group__head">
        {icon}
        <span>{title}</span>
      </div>
      <ul>
        {systems.map((s) => (
          <li key={s.name}>
            <span className="tech-group__name">{s.name}</span>
            <span className="tech-group__role">{s.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
