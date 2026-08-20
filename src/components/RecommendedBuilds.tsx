import { useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  CircleAlert,
  FileSearch,
  HelpCircle,
  Network,
  Quote,
} from "lucide-react";
import { Tooltip } from "./Tooltip";
import { evidenceMeta } from "../lib/status";
import { provenanceMeta } from "../data/heizenWork";
import {
  clioBuilds,
  buildConfidenceMeta,
  signalMeta,
  RANKING_EXPLAINER,
  type RecommendedBuild,
} from "../data/builds";

/** The five layers "View why" reveals, in the order they unfold. */
const LAYERS = [
  "Customer evidence",
  "Important unknowns",
  "Questions to validate",
  "Related process",
  "Similar Heizen work",
] as const;

/* ---------- One ranking signal: three segments + a level word ---------- */
function Signal({
  label,
  level,
  note,
  showNote,
}: {
  label: string;
  level: keyof typeof signalMeta;
  note: string;
  showNote: boolean;
}) {
  const m = signalMeta[level];
  return (
    <div className="bsig" title={showNote ? undefined : note}>
      <span className="bsig__bar" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`bsig__seg${i < m.filled ? " is-on" : ""}`} />
        ))}
      </span>
      <span className="bsig__label">
        {label}
        <span className="bsig__level"> · {m.label}</span>
      </span>
      {showNote && <span className="bsig__note">{note}</span>}
    </div>
  );
}

/* ---------- One revealed layer inside "View why" ---------- */
function Layer({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="wlayer">
      <div className="wlayer__head">
        <span className="wlayer__n" aria-hidden>
          {n}
        </span>
        <h4 className="wlayer__title">{title}</h4>
      </div>
      <div className="wlayer__body">{children}</div>
    </li>
  );
}

/* ---------- The four headline facts on a recommendation ---------- */
function BuildFacts({ build }: { build: RecommendedBuild }) {
  const conf = buildConfidenceMeta[build.confidence];
  const prov = provenanceMeta[build.builtBefore.provenance];
  const { priorWork } = build.why;
  return (
    <dl className="build__facts">
      <div className="bfact">
        <dt>Impact</dt>
        <dd>
          {build.impactValue}
          <span className="bfact__note">{build.impact}</span>
        </dd>
      </div>
      <div className="bfact">
        <dt>Est. delivery</dt>
        <dd>
          {build.delivery}
          <span className="bfact__note">{build.deliveryNote}</span>
        </dd>
      </div>
      <div className="bfact">
        <dt>Confidence</dt>
        <dd>
          <span className={`bfact__dot tone-${conf.tone}`} aria-hidden />
          {conf.label}
          <span className="bfact__note">{build.confidenceNote}</span>
        </dd>
      </div>
      <div className="bfact">
        <dt>Built before</dt>
        <dd>
          <span className={`bfact__dot tone-${prov.tone}`} aria-hidden />
          {build.builtBefore.label}
          <span className="bfact__note">
            {build.builtBefore.detail} · {priorWork.overlap}% process overlap
          </span>
        </dd>
      </div>
    </dl>
  );
}

/* ---------- Everything "View why" reveals ----------
   The ranking signals and the five evidence layers live here, hidden until
   a recommendation is expanded. Mounted fresh on open, so the progressive
   reveal always starts at the first layer. */
function WhyPanel({
  build,
  rank,
  projectId,
  panelId,
}: {
  build: RecommendedBuild;
  rank: number;
  projectId: string;
  panelId: string;
}) {
  /* 1–5 = how many layers have been revealed so far. */
  const [step, setStep] = useState(1);
  const primary = rank === 1;
  const { evidence, unknowns, questions, process, priorWork } = build.why;

  return (
    <div
      className="build__why"
      id={panelId}
      role="region"
      aria-label={`Why ${build.name} ranks here`}
    >
      {/* Secondary rows keep their collapsed state to a single line, so the
          problem statement and full facts surface here instead. */}
      {!primary && (
        <div className="build__whyintro">
          <p className="build__problem">{build.problem}</p>
          <BuildFacts build={build} />
        </div>
      )}

      {/* Why it sits at this rank — the three signals, then the sentence. */}
      <div className="build__rankwhy">
        <span className="build__rankwhy-label">Why it ranks here</span>
        <div className="build__signals">
          {build.signals.map((s) => (
            <Signal key={s.id} label={s.label} level={s.level} note={s.note} showNote />
          ))}
        </div>
        <p className="build__ranknote">{build.rankNote}</p>
      </div>

      <ol className="wlayers">
        {step >= 1 && (
          <Layer n={1} title={LAYERS[0]}>
            <ul className="wev">
              {evidence.map((e) => {
                const em = evidenceMeta[e.level];
                return (
                  <li key={e.text} className="wev__item">
                    <p className="wev__text">{e.text}</p>
                    <p className="wev__meta">
                      <span className={`wev__tag tone-${em.tone}`}>{em.label}</span>
                      <span className="dotsep">·</span>
                      {e.source}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Layer>
        )}

        {step >= 2 && (
          <Layer n={2} title={LAYERS[1]}>
            <ul className="wunk">
              {unknowns.map((u) => (
                <li key={u}>
                  <CircleAlert aria-hidden />
                  {u}
                </li>
              ))}
            </ul>
          </Layer>
        )}

        {step >= 3 && (
          <Layer n={3} title={LAYERS[2]}>
            <ul className="wq">
              {questions.map((q) => (
                <li key={q.id} className="wq__item">
                  <p className="wq__q">{q.question}</p>
                  <p className="wq__why">{q.unlocks}</p>
                </li>
              ))}
            </ul>
            <Link to={`/projects/${projectId}/discovery`} className="wlink">
              Open discovery questions <ArrowRight aria-hidden />
            </Link>
          </Layer>
        )}

        {step >= 4 && (
          <Layer n={4} title={LAYERS[3]}>
            <p className="wproc__head">{process.headline}</p>
            <ul className="wproc">
              {process.steps.map((s) => (
                <li key={`${s.area}-${s.step}`}>
                  <span className="wproc__where">
                    {s.area} <span aria-hidden>›</span> {s.step}
                  </span>
                  <span className="wproc__note">{s.note}</span>
                </li>
              ))}
            </ul>
            <Link to={`/projects/${projectId}/process-map`} className="wlink">
              Open process map <ArrowRight aria-hidden />
            </Link>
          </Layer>
        )}

        {step >= 5 && (
          <Layer n={5} title={LAYERS[4]}>
            <div className="wprior">
              <div className="wprior__top">
                <h5 className="wprior__title">{priorWork.title}</h5>
                <span className={`wprior__tag tone-${provenanceMeta[priorWork.provenance].tone}`}>
                  {provenanceMeta[priorWork.provenance].label}
                </span>
              </div>
              <p className="wprior__client">
                {priorWork.client}
                <span className="dotsep">·</span>
                {priorWork.overlap}% overlap with Clio's process
              </p>
              <p className="wprior__outcome">{priorWork.outcome}</p>
              <p className="wprior__safe">
                <Quote aria-hidden />
                {priorWork.safeToSay}
              </p>
              <p className="wprior__diff">
                <b>Where it differs:</b> {priorWork.difference}
              </p>
            </div>
          </Layer>
        )}
      </ol>

      <div className="build__why-foot">
        {step < 5 ? (
          <>
            <button className="btn btn-sm" onClick={() => setStep(step + 1)}>
              Next — {LAYERS[step]}
              <ArrowRight />
            </button>
            <button className="linkish" onClick={() => setStep(5)}>
              Reveal all {5 - step} remaining
            </button>
            <span className="build__why-count">{step} of 5 shown</span>
          </>
        ) : (
          <div className="build__why-links">
            <Link to={`/projects/${projectId}/research`}>
              <FileSearch aria-hidden /> Research
            </Link>
            <Link to={`/projects/${projectId}/discovery`}>
              <HelpCircle aria-hidden /> Questions
            </Link>
            <Link to={`/projects/${projectId}/process-map`}>
              <Network aria-hidden /> Process map
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- A single recommendation ---------- */
function BuildCard({
  build,
  rank,
  projectId,
  open,
  onToggle,
}: {
  build: RecommendedBuild;
  rank: number;
  projectId: string;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const primary = rank === 1;
  const conf = buildConfidenceMeta[build.confidence];

  const whyButton = (
    <button
      className="build__why-btn"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
    >
      {open ? "Hide why" : "View why"}
      <ChevronDown className={open ? "is-open" : ""} aria-hidden />
    </button>
  );

  if (primary) {
    return (
      <article className="build build--primary">
        <div className="build__top">
          <span className="build__rank">Primary recommendation</span>
        </div>

        <h3 className="build__name">{build.name}</h3>
        <p className="build__problem">{build.problem}</p>
        <BuildFacts build={build} />
        {whyButton}

        {open && (
          <WhyPanel build={build} rank={rank} projectId={projectId} panelId={panelId} />
        )}
      </article>
    );
  }

  return (
    <article className={`build build--row${open ? " is-open" : ""}`}>
      <div className="build__row">
        <span
          className="build__rank-n"
          aria-label={`Also worth scoping — rank ${rank} of 3`}
          title={`Also worth scoping · ${rank} of 3`}
        >
          {rank}
        </span>
        <h3 className="build__name build__name--row">{build.name}</h3>
        <dl className="build__rowmeta">
          <div className="brm">
            <dt>Impact</dt>
            <dd>{build.impactValue}</dd>
          </div>
          <div className="brm">
            <dt>Delivery</dt>
            <dd>{build.delivery}</dd>
          </div>
          <div className="brm">
            <dt>Confidence</dt>
            <dd>
              <span className={`bfact__dot tone-${conf.tone}`} aria-hidden />
              {conf.label}
            </dd>
          </div>
        </dl>
        {whyButton}
      </div>

      {open && (
        <WhyPanel build={build} rank={rank} projectId={projectId} panelId={panelId} />
      )}
    </article>
  );
}

/**
 * The decision layer at the top of the Clio Snacks overview: one emphasised
 * recommendation, two compact alternates, each explainable on demand.
 * At most one recommendation is expanded at a time.
 */
export function RecommendedBuilds({ projectId }: { projectId: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));
  const [primary, ...rest] = clioBuilds;
  const secondary = rest.slice(0, 2);

  return (
    <section className="builds" aria-labelledby="builds-heading">
      <div className="section-head builds__head">
        <div>
          <h2 className="block-title" id="builds-heading">
            Recommended builds
          </h2>
          <p className="block-sub">
            What to build for Clio Snacks — ranked on research evidence, customer context
            and what Heizen has delivered before.
          </p>
        </div>
        <Tooltip label={RANKING_EXPLAINER}>
          <span className="hint-chip">
            <CircleHelp aria-hidden /> How ranking works
          </span>
        </Tooltip>
      </div>

      <BuildCard
        build={primary}
        rank={1}
        projectId={projectId}
        open={openId === primary.id}
        onToggle={() => toggle(primary.id)}
      />

      <div className="builds__secondary">
        {secondary.map((b, i) => (
          <BuildCard
            key={b.id}
            build={b}
            rank={i + 2}
            projectId={projectId}
            open={openId === b.id}
            onToggle={() => toggle(b.id)}
          />
        ))}
      </div>
    </section>
  );
}
