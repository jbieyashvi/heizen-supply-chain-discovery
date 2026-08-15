import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Target,
  ArrowRight,
  FileText,
  HelpCircle,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Users,
  Clock3,
  Lightbulb,
  Gauge,
  TrendingUp,
  Lock,
  Globe,
  ClipboardList,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Badge } from "../components/Badge";
import { Segmented } from "../components/Segmented";
import { SidePanel } from "../components/SidePanel";
import { EvidenceBadge } from "../components/StatusBadges";
import { useToast } from "../components/Toast";
import { projects } from "../data/mock";
import {
  clioOpportunities,
  confidenceMeta,
  priorityMeta,
  statusMeta,
  OPP_STATUSES,
  OPP_EST_VALUE_TOTAL,
  type Opportunity,
  type OppStatus,
} from "../data/opportunities";

type Filter = "all" | "high" | "needs-validation" | "confirmed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "high", label: "High priority" },
  { id: "needs-validation", label: "Needs validation" },
  { id: "confirmed", label: "Confirmed" },
];

const needsValidation = (s: OppStatus) =>
  s === "identified" || s === "validating";

export function OpportunitiesPage() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);
  const { notify } = useToast();

  const hasData = projectId === "clio-snacks";

  // Prototype-local workflow status per opportunity.
  const [statuses, setStatuses] = useState<Record<string, OppStatus>>(() =>
    Object.fromEntries(clioOpportunities.map((o) => [o.id, o.status]))
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const setStatus = (id: string, status: OppStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    notify({
      title: `Marked ${statusMeta[status].label}`,
      body: "Status updated for this prototype session.",
      tone: "info",
    });
  };

  const visible = useMemo(() => {
    return clioOpportunities.filter((o) => {
      const s = statuses[o.id];
      if (filter === "high") return o.priority === "high";
      if (filter === "needs-validation") return needsValidation(s);
      if (filter === "confirmed") return s === "confirmed";
      return true;
    });
  }, [filter, statuses]);

  const highConfidence = clioOpportunities.filter(
    (o) => o.confidence === "high"
  ).length;
  const needValidationCount = clioOpportunities.filter((o) =>
    needsValidation(statuses[o.id])
  ).length;

  const active = clioOpportunities.find((o) => o.id === openId) ?? null;

  if (!hasData) {
    return (
      <div className="page">
        <PageHeader
          crumbs={[
            { label: "Projects", to: "/projects" },
            { label: project?.name ?? "Project", to: `/projects/${projectId}` },
            { label: "Opportunities" },
          ]}
          title={<h1 className="page-title">Opportunities</h1>}
          subtitle={`Opportunities for ${project?.name ?? "this project"}.`}
        />
        <EmptyState
          icon={<Target />}
          title="Opportunities are coming soon"
          body={`Opportunities are generated for ${
            project?.name ?? "this project"
          } once its research completes. Clio Snacks shows the full experience.`}
          action={
            <Link className="btn btn-primary" to="/projects/clio-snacks/opportunities">
              Open a completed example
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        crumbs={[
          { label: "Projects", to: "/projects" },
          { label: project?.name ?? "Clio Snacks", to: `/projects/${projectId}` },
          { label: "Opportunities" },
        ]}
        title={<h1 className="page-title">Opportunities</h1>}
        subtitle="Potential Heizen fits, ranked by evidence. Unconfirmed items are hypotheses to validate — not commitments."
      />

      {/* Summary */}
      <section className="card card-pad opp-summary">
        <div className="opp-sum-grid">
          <OppStat
            icon={<Target aria-hidden />}
            value={clioOpportunities.length}
            label="Opportunities identified"
          />
          <OppStat
            icon={<CheckCircle2 aria-hidden />}
            value={highConfidence}
            label="High confidence"
            tone="green"
          />
          <OppStat
            icon={<AlertTriangle aria-hidden />}
            value={needValidationCount}
            label="Need validation"
            tone="amber"
          />
          <OppStat
            icon={<TrendingUp aria-hidden />}
            value={OPP_EST_VALUE_TOTAL}
            label="Est. potential value"
            hint="Indicative, pre-validation"
            small
          />
        </div>
      </section>

      {/* Filters */}
      <div className="opp-filters">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          ariaLabel="Filter opportunities"
          options={FILTERS}
        />
        <span className="opp-filters__count">
          {visible.length} of {clioOpportunities.length} shown
        </span>
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="card card-pad opp-empty">
          <p className="muted">No opportunities match this filter.</p>
          <button className="btn btn-sm" onClick={() => setFilter("all")}>
            Show all
          </button>
        </div>
      ) : (
        <div className="opps-list">
          {visible.map((o) => (
            <OpportunityCard
              key={o.id}
              opp={o}
              status={statuses[o.id]}
              onOpen={() => setOpenId(o.id)}
            />
          ))}
        </div>
      )}

      {/* Detail drawer */}
      <OpportunityDetail
        opp={active}
        status={active ? statuses[active.id] : "identified"}
        projectId={projectId!}
        onStatus={(s) => active && setStatus(active.id, s)}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

/* ---------- Summary stat ---------- */
function OppStat({
  icon,
  value,
  label,
  tone,
  hint,
  small,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  tone?: "green" | "amber";
  hint?: string;
  small?: boolean;
}) {
  return (
    <div className="opp-stat">
      <span className={`opp-stat__icon${tone ? ` opp-stat__icon--${tone}` : ""}`}>
        {icon}
      </span>
      <div className="opp-stat__body">
        <span className={`opp-stat__value${small ? " opp-stat__value--sm" : ""}`}>
          {value}
        </span>
        <span className="opp-stat__label">{label}</span>
        {hint && <span className="opp-stat__hint">{hint}</span>}
      </div>
    </div>
  );
}

/* ---------- Card ---------- */
function OpportunityCard({
  opp,
  status,
  onOpen,
}: {
  opp: Opportunity;
  status: OppStatus;
  onOpen: () => void;
}) {
  const pm = priorityMeta[opp.priority];
  const cm = confidenceMeta[opp.confidence];
  const sm = statusMeta[status];
  return (
    <article className="oppc" onClick={onOpen}>
      <div className="oppc__head">
        <h3 className="oppc__title">{opp.name}</h3>
        <div className="oppc__badges">
          <Badge tone={pm.tone}>{pm.label}</Badge>
          <Badge tone={cm.tone} dot>
            {cm.label}
          </Badge>
          <Badge tone={sm.tone} dot>
            {sm.label}
          </Badge>
        </div>
      </div>

      <div className="oppc__field">
        <span className="oppc__label">Problem</span>
        <p>{opp.problem}</p>
      </div>
      <div className="oppc__field">
        <span className="oppc__label">Business impact</span>
        <p>{opp.businessImpact}</p>
      </div>

      <div className="oppc__stk">
        <span className="oppc__label">
          <Users aria-hidden /> Affected stakeholders
        </span>
        <div className="oppc__chips">
          {opp.stakeholders.map((s) => (
            <span className="oppc__chip" key={s}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="oppc__stats">
        <span className="oppc__stat">
          <FileText aria-hidden /> {opp.evidence.length} supporting evidence
        </span>
        <span className="oppc__stat">
          <HelpCircle aria-hidden /> {opp.unknowns.length} open unknown
          {opp.unknowns.length === 1 ? "" : "s"}
        </span>
        <span className="oppc__stat">
          <Clock3 aria-hidden /> Updated {opp.lastUpdated}
        </span>
      </div>

      <div className="oppc__next">
        <span className="oppc__next-label">
          <Lightbulb aria-hidden /> Recommended next action
        </span>
        <p>{opp.nextAction}</p>
      </div>

      <div className="oppc__foot">
        <button
          className="btn btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          View opportunity <ArrowRight />
        </button>
      </div>
    </article>
  );
}

/* ---------- Detail drawer ---------- */
function OpportunityDetail({
  opp,
  status,
  projectId,
  onStatus,
  onClose,
}: {
  opp: Opportunity | null;
  status: OppStatus;
  projectId: string;
  onStatus: (s: OppStatus) => void;
  onClose: () => void;
}) {
  return (
    <SidePanel
      open={Boolean(opp)}
      onClose={onClose}
      title={opp?.name ?? "Opportunity"}
      subtitle="Opportunity detail"
    >
      {opp && (
        <div className="opp-d">
          {/* Summary */}
          <div className="opp-d__badges">
            <Badge tone={priorityMeta[opp.priority].tone}>
              {priorityMeta[opp.priority].label}
            </Badge>
            <Badge tone={confidenceMeta[opp.confidence].tone} dot>
              {confidenceMeta[opp.confidence].label}
            </Badge>
            <Badge tone={statusMeta[status].tone} dot>
              {statusMeta[status].label}
            </Badge>
          </div>
          <p className="opp-d__summary">{opp.summary}</p>
          <div className="opp-d__value">
            <TrendingUp aria-hidden />
            <span>
              <b>{opp.estValue}</b> estimated potential value
              <span className="opp-d__value-hint"> · indicative, pre-validation</span>
            </span>
          </div>

          {/* Status changer */}
          <section className="opp-d__section">
            <h3 className="opp-d__label">Status</h3>
            <div className="opp-statusset" role="radiogroup" aria-label="Opportunity status">
              {OPP_STATUSES.map((s) => (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={status === s.id}
                  className={`opp-statuspill opp-statuspill--${s.id}${
                    status === s.id ? " is-active" : ""
                  }`}
                  onClick={() => onStatus(s.id)}
                >
                  {status === s.id && <CheckCircle2 aria-hidden />}
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Current process and pain */}
          <section className="opp-d__section">
            <h3 className="opp-d__label">Current process &amp; pain</h3>
            <p className="opp-d__text">{opp.currentProcess}</p>
            <p className="opp-d__text opp-d__text--pain">
              <AlertTriangle aria-hidden /> {opp.problem}
            </p>
          </section>

          {/* Business impact */}
          <section className="opp-d__section">
            <h3 className="opp-d__label">Business impact</h3>
            <p className="opp-d__text">{opp.businessImpact}</p>
          </section>

          {/* Affected stakeholders */}
          <section className="opp-d__section">
            <h3 className="opp-d__label">
              <Users aria-hidden /> Affected stakeholders
            </h3>
            <div className="oppc__chips">
              {opp.stakeholders.map((s) => (
                <span className="oppc__chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </section>

          {/* Evidence */}
          <section className="opp-d__section">
            <h3 className="opp-d__label">
              <FileText aria-hidden /> Evidence
              <span className="opp-d__count">{opp.evidence.length}</span>
            </h3>
            <ul className="opp-ev">
              {opp.evidence.map((e, i) => (
                <li className="opp-ev__item" key={i}>
                  <div className="opp-ev__top">
                    <span className="opp-ev__finding">{e.finding}</span>
                    <EvidenceBadge level={e.evidence} />
                  </div>
                  <p className="opp-ev__excerpt">{e.excerpt}</p>
                  <div className="opp-ev__src">
                    <span className={`opp-ev__vis opp-ev__vis--${e.visibility}`}>
                      {e.visibility === "client" ? <Lock /> : <Globe />}
                      {e.source}
                    </span>
                    <span className="opp-ev__date">{e.date}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              to={`/projects/${projectId}/research`}
              className="opp-d__link"
              onClick={onClose}
            >
              View all sources in Research <ArrowRight aria-hidden />
            </Link>
          </section>

          {/* Related discovery questions */}
          <section className="opp-d__section">
            <h3 className="opp-d__label">
              <HelpCircle aria-hidden /> Related discovery questions
            </h3>
            <ul className="opp-qa">
              {opp.questions.map((q) => (
                <li className="opp-qa__item" key={q.id}>
                  <div className="opp-qa__q">
                    {q.answered ? (
                      <CheckCircle2 className="opp-qa__ic opp-qa__ic--done" aria-hidden />
                    ) : (
                      <Circle className="opp-qa__ic" aria-hidden />
                    )}
                    <span>{q.question}</span>
                  </div>
                  <p className={`opp-qa__a${q.answered ? "" : " opp-qa__a--pending"}`}>
                    {q.answer}
                  </p>
                </li>
              ))}
            </ul>
            <Link
              to={`/projects/${projectId}/discovery`}
              className="opp-d__link"
              onClick={onClose}
            >
              Open Discovery Questions <ArrowRight aria-hidden />
            </Link>
          </section>

          {/* Assumptions & unknowns */}
          <section className="opp-d__section">
            <h3 className="opp-d__label">
              <ClipboardList aria-hidden /> Assumptions &amp; open unknowns
            </h3>
            <div className="opp-au">
              <div>
                <span className="opp-au__label">Assumptions</span>
                <ul className="opp-au__list">
                  {opp.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="opp-au__label opp-au__label--warn">Open unknowns</span>
                <ul className="opp-au__list">
                  {opp.unknowns.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Confidence explanation */}
          <section className="opp-d__section">
            <h3 className="opp-d__label">
              <Gauge aria-hidden /> Confidence explanation
            </h3>
            <p className="opp-d__text">{opp.confidenceReason}</p>
          </section>

          {/* Recommended next action */}
          <section className="opp-d__section opp-d__next">
            <h3 className="opp-d__label">
              <Lightbulb aria-hidden /> Recommended next action
            </h3>
            <p className="opp-d__text">{opp.nextAction}</p>
          </section>
        </div>
      )}
    </SidePanel>
  );
}
