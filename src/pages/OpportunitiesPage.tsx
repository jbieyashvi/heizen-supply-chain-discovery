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
  FlaskConical,
  Wrench,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Badge } from "../components/Badge";
import { Segmented } from "../components/Segmented";
import { SidePanel } from "../components/SidePanel";
import { EvidenceBadge } from "../components/StatusBadges";
import { useToast } from "../components/Toast";
import { useFocus } from "../hooks/useFocus";
import { stakeholderById } from "../data/focus";
import { projects } from "../data/mock";
import {
  clioOpportunities,
  confidenceMeta,
  priorityMeta,
  statusMeta,
  impactMeta,
  potentialImpact,
  hasSufficientEvidence,
  OPP_STATUSES,
  OPP_DOMAINS,
  OPP_EST_VALUE_TOTAL,
  type Opportunity,
  type OppStatus,
} from "../data/opportunities";

type Stage = "intro" | "discovery" | "expansion";
type Filter = "all" | "high" | "needs-validation" | "confirmed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "high", label: "High priority" },
  { id: "needs-validation", label: "Needs validation" },
  { id: "confirmed", label: "Confirmed" },
];

const needsValidation = (s: OppStatus) =>
  s === "identified" || s === "validating";

function readStage(projectId: string | undefined): Stage {
  try {
    const s = localStorage.getItem(`heizen-stage-${projectId}`);
    return s === "discovery" || s === "expansion" ? s : "intro";
  } catch {
    return "intro";
  }
}

export function OpportunitiesPage() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);
  const { notify } = useToast();
  const { focus } = useFocus(projectId);

  const hasData = projectId === "clio-snacks";
  const [stage] = useState<Stage>(() => readStage(projectId));

  // Which stakeholder anchors "relevant" on an introductory call.
  const stakeholder =
    stakeholderById(focus?.stakeholderId) ?? stakeholderById("meera")!;

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

  const stakeholderRelevant = (o: Opportunity) =>
    (OPP_DOMAINS[o.id] ?? []).some((d) => stakeholder.domains.includes(d));

  const visible = useMemo(() => {
    if (stage === "intro") {
      return clioOpportunities.filter(stakeholderRelevant);
    }
    if (stage === "expansion") {
      return clioOpportunities.filter((o) => statuses[o.id] === "confirmed");
    }
    // discovery — evidence-ranked with the filter bar
    return clioOpportunities.filter((o) => {
      const s = statuses[o.id];
      if (filter === "high") return o.priority === "high";
      if (filter === "needs-validation") return needsValidation(s);
      if (filter === "confirmed") return s === "confirmed";
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, statuses, stage]);

  const highConfidence = clioOpportunities.filter(
    (o) => o.confidence === "high"
  ).length;
  const needValidationCount = clioOpportunities.filter((o) =>
    needsValidation(statuses[o.id])
  ).length;
  const confirmedCount = clioOpportunities.filter(
    (o) => statuses[o.id] === "confirmed"
  ).length;
  const highPriorityCount = clioOpportunities.filter(
    (o) => o.priority === "high"
  ).length;
  const relevantCount = clioOpportunities.filter(stakeholderRelevant).length;

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

  const heading =
    stage === "intro" ? "Hypotheses to Validate" : "Opportunities";
  const subtitle =
    stage === "intro"
      ? `Stakeholder-relevant hypotheses to test with ${stakeholder.name} — not confirmed problems.`
      : stage === "expansion"
      ? "Confirmed opportunities ready to expand — value, priority, recommended solution and next action."
      : "Hypotheses ranked by evidence — with supporting evidence, open unknowns and validation status.";

  return (
    <div className="page">
      <PageHeader
        crumbs={[
          { label: "Projects", to: "/projects" },
          { label: project?.name ?? "Clio Snacks", to: `/projects/${projectId}` },
          { label: stage === "intro" ? "Hypotheses" : "Opportunities" },
        ]}
        title={<h1 className="page-title">{heading}</h1>}
        subtitle={subtitle}
        actions={
          stage === "intro" ? (
            <Link
              to={`/projects/${projectId}/discovery`}
              className="btn btn-primary btn-sm"
            >
              <HelpCircle /> Add validation question
            </Link>
          ) : undefined
        }
      />

      {/* Introductory-call framing note */}
      {stage === "intro" && (
        <div className="notice notice--info" role="note">
          <span className="notice__icon" aria-hidden>
            <FlaskConical />
          </span>
          <div className="notice__main">
            <div className="notice__text">
              <span className="notice__title">These are conversation prompts</span>
              <span className="notice__body">
                Every item below is an <b>unvalidated</b> hypothesis — a prompt for the call,
                not a confirmed client problem. Confirm them before treating them as
                opportunities.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <section className="card card-pad opp-summary">
        <div className="opp-sum-grid">
          {stage === "intro" && (
            <>
              <OppStat icon={<FlaskConical aria-hidden />} value={relevantCount} label="Hypotheses to validate" />
              <OppStat icon={<Users aria-hidden />} value={stakeholder.name} label="Relevant to" small />
              <OppStat icon={<AlertTriangle aria-hidden />} value="Unvalidated" label="All items" tone="amber" small />
              <OppStat icon={<TrendingUp aria-hidden />} value="Qualitative" label="Potential impact" hint="Sized after validation" small />
            </>
          )}
          {stage === "discovery" && (
            <>
              <OppStat icon={<Target aria-hidden />} value={clioOpportunities.length} label="Hypotheses identified" />
              <OppStat icon={<CheckCircle2 aria-hidden />} value={highConfidence} label="High confidence" tone="green" />
              <OppStat icon={<AlertTriangle aria-hidden />} value={needValidationCount} label="Need validation" tone="amber" />
              <OppStat icon={<TrendingUp aria-hidden />} value={OPP_EST_VALUE_TOTAL} label="Est. value" hint="Shown where evidence is sufficient" small />
            </>
          )}
          {stage === "expansion" && (
            <>
              <OppStat icon={<CheckCircle2 aria-hidden />} value={confirmedCount} label="Confirmed opportunities" tone="green" />
              <OppStat icon={<TrendingUp aria-hidden />} value={OPP_EST_VALUE_TOTAL} label="Est. potential value" hint="Indicative range" small />
              <OppStat icon={<AlertTriangle aria-hidden />} value={highPriorityCount} label="High priority" tone="amber" />
              <OppStat icon={<Wrench aria-hidden />} value={confirmedCount} label="Ready to expand" />
            </>
          )}
        </div>
      </section>

      {/* Filters — discovery only */}
      {stage === "discovery" && (
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
      )}
      {stage !== "discovery" && (
        <div className="opp-filters">
          <span className="opp-filters__count">
            {visible.length} {stage === "intro" ? "hypotheses" : "confirmed opportunities"}
          </span>
        </div>
      )}

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="card card-pad opp-empty">
          <p className="muted">
            {stage === "expansion"
              ? "No confirmed opportunities yet — confirm hypotheses on the Discovery Call stage first."
              : stage === "intro"
              ? "No stakeholder-relevant hypotheses for this stakeholder."
              : "No opportunities match this filter."}
          </p>
          {stage === "discovery" && (
            <button className="btn btn-sm" onClick={() => setFilter("all")}>
              Show all
            </button>
          )}
        </div>
      ) : (
        <div className="opps-list">
          {visible.map((o) => (
            <OpportunityCard
              key={o.id}
              opp={o}
              stage={stage}
              status={statuses[o.id]}
              onOpen={() => setOpenId(o.id)}
            />
          ))}
        </div>
      )}

      {/* Detail drawer */}
      <OpportunityDetail
        opp={active}
        stage={stage}
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
  stage,
  status,
  onOpen,
}: {
  opp: Opportunity;
  stage: Stage;
  status: OppStatus;
  onOpen: () => void;
}) {
  const pm = priorityMeta[opp.priority];
  const cm = confidenceMeta[opp.confidence];
  const sm = statusMeta[status];
  const im = impactMeta[potentialImpact(opp)];
  const showValue = stage !== "intro" && hasSufficientEvidence(opp, status);
  const isIntro = stage === "intro";

  return (
    <article className="oppc" onClick={onOpen}>
      <div className="oppc__head">
        <h3 className="oppc__title">{opp.name}</h3>
        <div className="oppc__badges">
          {isIntro ? (
            <>
              <Badge tone="amber" icon={<AlertTriangle aria-hidden />}>
                Unvalidated
              </Badge>
              <Badge tone={im.tone} dot>
                {im.label}
              </Badge>
            </>
          ) : (
            <>
              <Badge tone={pm.tone}>{pm.label}</Badge>
              <Badge tone={cm.tone} dot>
                {cm.label}
              </Badge>
              <Badge tone={sm.tone} dot>
                {sm.label}
              </Badge>
            </>
          )}
        </div>
      </div>

      <div className="oppc__field">
        <span className="oppc__label">{isIntro ? "Hypothesis" : "Problem"}</span>
        <p>{opp.problem}</p>
      </div>

      {stage === "expansion" && (
        <div className="oppc__field">
          <span className="oppc__label">
            <Wrench aria-hidden /> Recommended solution
          </span>
          <p>{opp.summary}</p>
        </div>
      )}

      <div className="oppc__field">
        <span className="oppc__label">
          {isIntro ? "Potential impact" : "Business impact"}
        </span>
        <p>{opp.businessImpact}</p>
      </div>

      {showValue && (
        <div className="oppc__field oppc__value">
          <span className="oppc__label">
            <TrendingUp aria-hidden /> Estimated value
          </span>
          <p>
            <b>{opp.estValue}</b>{" "}
            <span className="oppc__value-hint">· indicative, pre-validation</span>
          </p>
        </div>
      )}

      <div className="oppc__stk">
        <span className="oppc__label">
          <Users aria-hidden /> {isIntro ? "Relevant stakeholders" : "Affected stakeholders"}
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
        {!isIntro && (
          <span className="oppc__stat">
            <Circle aria-hidden /> {sm.label}
          </span>
        )}
        <span className="oppc__stat">
          <Clock3 aria-hidden /> Updated {opp.lastUpdated}
        </span>
      </div>

      <div className="oppc__next">
        <span className="oppc__next-label">
          <Lightbulb aria-hidden /> {isIntro ? "How to validate" : "Recommended next action"}
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
          {isIntro ? "View hypothesis" : "View opportunity"} <ArrowRight />
        </button>
      </div>
    </article>
  );
}

/* ---------- Detail drawer ---------- */
function OpportunityDetail({
  opp,
  stage,
  status,
  projectId,
  onStatus,
  onClose,
}: {
  opp: Opportunity | null;
  stage: Stage;
  status: OppStatus;
  projectId: string;
  onStatus: (s: OppStatus) => void;
  onClose: () => void;
}) {
  const isIntro = stage === "intro";
  const showValue = opp ? !isIntro && hasSufficientEvidence(opp, status) : false;
  const im = opp ? impactMeta[potentialImpact(opp)] : null;

  return (
    <SidePanel
      open={Boolean(opp)}
      onClose={onClose}
      title={opp?.name ?? "Opportunity"}
      subtitle={isIntro ? "Hypothesis to validate" : "Opportunity detail"}
    >
      {opp && (
        <div className="opp-d">
          {/* Summary */}
          <div className="opp-d__badges">
            {isIntro ? (
              <Badge tone="amber" icon={<AlertTriangle aria-hidden />}>
                Unvalidated
              </Badge>
            ) : (
              <>
                <Badge tone={priorityMeta[opp.priority].tone}>
                  {priorityMeta[opp.priority].label}
                </Badge>
                <Badge tone={confidenceMeta[opp.confidence].tone} dot>
                  {confidenceMeta[opp.confidence].label}
                </Badge>
                <Badge tone={statusMeta[status].tone} dot>
                  {statusMeta[status].label}
                </Badge>
              </>
            )}
          </div>
          <p className="opp-d__summary">{opp.summary}</p>

          {/* Value / potential impact */}
          {isIntro ? (
            <div className="opp-d__value opp-d__value--impact">
              <TrendingUp aria-hidden />
              <span>
                <b>Potential impact:</b> {im?.label}
                <span className="opp-d__value-hint"> · sized only after validation</span>
              </span>
            </div>
          ) : showValue ? (
            <div className="opp-d__value">
              <TrendingUp aria-hidden />
              <span>
                <b>{opp.estValue}</b> estimated potential value
                <span className="opp-d__value-hint"> · indicative, pre-validation</span>
              </span>
            </div>
          ) : (
            <div className="opp-d__value opp-d__value--pending">
              <AlertTriangle aria-hidden />
              <span>
                Value not shown yet — evidence isn't strong enough. Confirm the hypothesis
                to size it.
              </span>
            </div>
          )}

          {/* Status changer — not on an introductory call */}
          {!isIntro && (
            <section className="opp-d__section">
              <h3 className="opp-d__label">Validation status</h3>
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
          )}

          {/* Recommended solution — expansion */}
          {stage === "expansion" && (
            <section className="opp-d__section">
              <h3 className="opp-d__label">
                <Wrench aria-hidden /> Recommended solution
              </h3>
              <p className="opp-d__text">{opp.summary}</p>
            </section>
          )}

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
            <h3 className="opp-d__label">
              {isIntro ? "Potential impact" : "Business impact"}
            </h3>
            <p className="opp-d__text">{opp.businessImpact}</p>
          </section>

          {/* Affected stakeholders */}
          <section className="opp-d__section">
            <h3 className="opp-d__label">
              <Users aria-hidden /> {isIntro ? "Relevant stakeholders" : "Affected stakeholders"}
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
              <FileText aria-hidden /> {isIntro ? "Supporting evidence (to confirm)" : "Evidence"}
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
              <HelpCircle aria-hidden /> {isIntro ? "Validation questions" : "Related discovery questions"}
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
              {isIntro ? "Add a validation question" : "Open Discovery Questions"}{" "}
              <ArrowRight aria-hidden />
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
              <Gauge aria-hidden /> {isIntro ? "How well evidenced (today)" : "Confidence explanation"}
            </h3>
            <p className="opp-d__text">{opp.confidenceReason}</p>
          </section>

          {/* Recommended next action */}
          <section className="opp-d__section opp-d__next">
            <h3 className="opp-d__label">
              <Lightbulb aria-hidden /> {isIntro ? "How to validate" : "Recommended next action"}
            </h3>
            <p className="opp-d__text">{opp.nextAction}</p>
          </section>
        </div>
      )}
    </SidePanel>
  );
}
