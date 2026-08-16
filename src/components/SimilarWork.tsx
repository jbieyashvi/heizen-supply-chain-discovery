import { useState } from "react";
import {
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Workflow,
  Cpu,
  Building2,
  Info,
} from "lucide-react";
import { SidePanel } from "./SidePanel";
import { Badge } from "./Badge";
import { useFocus } from "../hooks/useFocus";
import { scoreDomains } from "../data/focus";
import {
  clioSimilarWork,
  safeDeliveredWork,
  provenanceMeta,
  overallSimilarity,
  similarityLevel,
  similarityLevelMeta,
  SIMILARITY_EXPLAINER,
  type HeizenProject,
} from "../data/heizenWork";

/** Shared "Similar Heizen work" list + detail drawer.
   introOnly → only top-2 delivered, safe-to-mention examples. */
export function SimilarWork({
  projectId,
  introOnly = false,
  showPercent = true,
}: {
  projectId?: string;
  introOnly?: boolean;
  showPercent?: boolean;
}) {
  const [open, setOpen] = useState<HeizenProject | null>(null);
  const { focus } = useFocus(projectId);

  const base = introOnly ? safeDeliveredWork(2) : clioSimilarWork;
  // Focus re-ranks by domain overlap (stable; nothing hidden).
  const items = [...base]
    .map((p, i) => ({ p, i }))
    .sort(
      (a, b) =>
        scoreDomains(b.p.domains, focus) - scoreDomains(a.p.domains, focus) || a.i - b.i
    )
    .map((x) => x.p);

  return (
    <div className="simw">
      {introOnly && (
        <p className="simw__intro">
          <ShieldCheck aria-hidden /> Showing only delivered, safe-to-mention work for a first
          call. Open Research for the full list with provenance.
        </p>
      )}
      <div className="simw__grid">
        {items.map((p) => (
          <SimCard key={p.id} p={p} showPercent={showPercent} onOpen={() => setOpen(p)} />
        ))}
      </div>
      <SimDrawer project={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function SimCard({
  p,
  showPercent,
  onOpen,
}: {
  p: HeizenProject;
  showPercent: boolean;
  onOpen: () => void;
}) {
  const prov = provenanceMeta[p.provenance];
  const pct = overallSimilarity(p.overlap);
  const lvl = similarityLevelMeta[similarityLevel(pct)];
  return (
    <button className={`simw-card simw-card--${p.provenance}`} onClick={onOpen}>
      <div className="simw-card__top">
        <Badge tone={prov.tone} dot={p.provenance !== "delivered"} icon={p.provenance === "delivered" ? <ShieldCheck aria-hidden /> : undefined}>
          {prov.label}
        </Badge>
        <Badge tone={lvl.tone}>
          {showPercent ? `${pct}% · ${lvl.label}` : lvl.label}
        </Badge>
      </div>

      <div className="simw-card__id">
        <span className="simw-card__name">{p.name}</span>
        <span className="simw-card__industry">{p.industry}</span>
      </div>

      <dl className="simw-card__facts">
        <div>
          <dt>Problem solved</dt>
          <dd>{p.problem}</dd>
        </div>
        <div>
          <dt>What Heizen delivered</dt>
          <dd>{p.delivered}</dd>
        </div>
        <div>
          <dt>Why relevant to Clio Snacks</dt>
          <dd>{p.whyRelevant}</dd>
        </div>
      </dl>

      <div className="simw-card__foot">
        <span className="simw-card__evi">
          <FileText aria-hidden /> {p.evidence}
        </span>
        <ChevronRight className="simw-card__chev" aria-hidden />
      </div>
    </button>
  );
}

function OverlapBar({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Cpu }) {
  return (
    <div className="simw-bar">
      <span className="simw-bar__label">
        <Icon aria-hidden /> {label}
      </span>
      <span className="simw-bar__track" aria-hidden>
        <span className="simw-bar__fill" style={{ width: `${value}%` }} />
      </span>
      <span className="simw-bar__val">{value}%</span>
    </div>
  );
}

function SimDrawer({ project, onClose }: { project: HeizenProject | null; onClose: () => void }) {
  if (!project) return null;
  const prov = provenanceMeta[project.provenance];
  const pct = overallSimilarity(project.overlap);
  const lvl = similarityLevelMeta[similarityLevel(pct)];
  return (
    <SidePanel
      open={!!project}
      onClose={onClose}
      title={project.name}
      subtitle={project.industry}
    >
      <div className="simw-d">
        <div className="simw-d__badges">
          <Badge tone={prov.tone} icon={project.provenance === "delivered" ? <ShieldCheck aria-hidden /> : undefined} dot={project.provenance !== "delivered"}>
            {prov.label}
          </Badge>
          <Badge tone={lvl.tone}>
            {pct}% · {lvl.label}
          </Badge>
        </div>

        {/* Similarity breakdown */}
        <section className="simw-d__sec">
          <h4 className="simw-d__h">How similarity is calculated</h4>
          <div className="simw-bars">
            <OverlapBar label="Process" value={project.overlap.process} icon={Workflow} />
            <OverlapBar label="Technology" value={project.overlap.technology} icon={Cpu} />
            <OverlapBar label="Business context" value={project.overlap.business} icon={Building2} />
            <div className="simw-bar simw-bar--total">
              <span className="simw-bar__label">Overall</span>
              <span className="simw-bar__track" aria-hidden>
                <span className="simw-bar__fill simw-bar__fill--total" style={{ width: `${pct}%` }} />
              </span>
              <span className="simw-bar__val">{pct}%</span>
            </div>
          </div>
          <p className="simw-d__explainer">
            <Info aria-hidden /> {SIMILARITY_EXPLAINER}
          </p>
        </section>

        <section className="simw-d__sec">
          <h4 className="simw-d__h">
            <Workflow aria-hidden /> Process overlap
          </h4>
          <p>{project.drawer.process}</p>
        </section>
        <section className="simw-d__sec">
          <h4 className="simw-d__h">
            <Cpu aria-hidden /> Technology overlap
          </h4>
          <p>{project.drawer.technology}</p>
        </section>
        <section className="simw-d__sec">
          <h4 className="simw-d__h">
            <Building2 aria-hidden /> Business-context overlap
          </h4>
          <p>{project.drawer.business}</p>
        </section>
        <section className="simw-d__sec simw-d__risks">
          <h4 className="simw-d__h">
            <AlertTriangle aria-hidden /> Important differences / risks
          </h4>
          <p>{project.drawer.differences}</p>
        </section>

        <section className={`simw-d__safe${prov.safe ? " is-safe" : " is-unsafe"}`}>
          <h4 className="simw-d__safe-h">
            {prov.safe ? <ShieldCheck aria-hidden /> : <AlertTriangle aria-hidden />}
            Safe to say on call
          </h4>
          <p>{project.drawer.safeToSay}</p>
        </section>
      </div>
    </SidePanel>
  );
}
