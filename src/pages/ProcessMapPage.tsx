import { useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Layers,
  Boxes,
  FileText,
  HelpCircle,
  Target,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Lightbulb,
  Server,
  Users,
  User,
  FileStack,
  Plus,
  ArrowRight,
  GitCompare,
  Cpu,
  Layers3,
  Clock3,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Badge } from "../components/Badge";
import { Segmented } from "../components/Segmented";
import { SidePanel } from "../components/SidePanel";
import { EvidenceBadge } from "../components/StatusBadges";
import { Canvas, type MiniNode } from "../components/Canvas";
import { useToast } from "../components/Toast";
import { projects } from "../data/mock";
import {
  clioProcessAreas,
  clioEntities,
  ENTITY_KINDS,
  coverageMeta,
  healthMeta,
  pmapSummary,
  type ProcessArea,
  type SubProcess,
  type Health,
  type EntityKind,
  type Entity,
} from "../data/processmap";

type View = "processes" | "entities";
type NodeLike = ProcessArea | SubProcess;

/* Health → Badge tone (accent = brand #5C95A8 for healthy/validated). */
const healthBadgeTone: Record<Health, "neutral" | "accent" | "amber" | "red"> = {
  unknown: "neutral",
  healthy: "accent",
  friction: "amber",
  critical: "red",
};

/* Level-0 layout — larger nodes so labels + counts stay readable. */
const NODE_W = 214;
const NODE_H = 166;
const GAP = 56;
const FLOW = ["plan", "source", "make", "quality", "store", "deliver"];

function isArea(n: NodeLike): n is ProcessArea {
  return (n as ProcessArea).subprocesses !== undefined;
}
function counts(n: NodeLike) {
  const q =
    n.coverage === "not-explored" && isArea(n) && n.suggestedQuestions
      ? n.suggestedQuestions.length
      : n.questions.length;
  return { ev: n.evidence.length, q, opp: n.opportunities.length };
}

/* Never present Friction/Critical without evidence — fall back to Unknown and
   flag it as a research inference. */
function displayHealth(n: NodeLike): {
  key: Health;
  inferred: boolean;
  raw: Health;
} {
  if (n.coverage === "not-explored")
    return { key: "unknown", inferred: false, raw: "unknown" };
  const inferred =
    n.evidence.length === 0 && (n.health === "friction" || n.health === "critical");
  return { key: inferred ? "unknown" : n.health, inferred, raw: n.health };
}

export function ProcessMapPage() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);
  const { notify } = useToast();
  const proto = (label: string) =>
    notify({ title: label, body: "Prototype action — no changes were made.", tone: "info" });

  const [view, setView] = useState<View>("processes");
  const [drillId, setDrillId] = useState<string | null>(null);
  const [openNode, setOpenNode] = useState<NodeLike | null>(null);
  const [openEntity, setOpenEntity] = useState<Entity | null>(null);

  if (projectId !== "clio-snacks") {
    return (
      <div className="page">
        <PageHeader
          crumbs={[
            { label: "Projects", to: "/projects" },
            { label: project?.name ?? "Project", to: `/projects/${projectId}` },
            { label: "Process Map" },
          ]}
          title={<h1 className="page-title">Process Map</h1>}
          subtitle={`Process Map for ${project?.name ?? "this project"}.`}
        />
        <EmptyState
          icon={<Layers />}
          title="Process Map is coming soon"
          body={`The process map is generated for ${
            project?.name ?? "this project"
          } once its research completes. Clio Snacks shows the full experience.`}
          action={
            <Link className="btn btn-primary" to="/projects/clio-snacks/process-map">
              Open a completed example
            </Link>
          }
        />
      </div>
    );
  }

  const drillArea = drillId
    ? clioProcessAreas.find((a) => a.id === drillId) ?? null
    : null;

  return (
    <div className="page pmap-page">
      <PageHeader
        crumbs={[
          { label: "Projects", to: "/projects" },
          { label: project?.name ?? "Clio Snacks", to: `/projects/${projectId}` },
          { label: "Process Map" },
        ]}
        title={<h1 className="page-title">Process Map</h1>}
        subtitle="How Clio Snacks plans, makes, checks, stores and ships — mapped from the evidence, with the gaps called out."
      />

      {/* Summary */}
      <section className="card card-pad pmap-summary">
        <div className="pmap-sum-grid">
          <div className="pmap-stat">
            <span className="pmap-stat__icon">
              <Layers3 aria-hidden />
            </span>
            <div className="pmap-stat__body">
              <span className="pmap-stat__value">{pmapSummary.stages}</span>
              <span className="pmap-stat__label">Process stages</span>
              <span className="pmap-stat__sub">· {pmapSummary.enabling} enabling layer</span>
            </div>
          </div>
          <PmapStat icon={<CheckCircle2 aria-hidden />} value={pmapSummary.explored} label="Explored" tone="brand" />
          <PmapStat icon={<AlertTriangle aria-hidden />} value={pmapSummary.critical} label="Critical issues" tone="red" />
          <PmapStat icon={<HelpCircle aria-hidden />} value={pmapSummary.openQuestions} label="Unique open questions" tone="amber" />
          <div className="pmap-updated">
            <span className="pmap-updated__label">
              <Clock3 aria-hidden /> Map refreshed
            </span>
            <span className="pmap-updated__value">{pmapSummary.refreshed}</span>
            <span className="pmap-updated__pending">
              <AlertTriangle aria-hidden /> {pmapSummary.pendingSources} newer sources
              awaiting inclusion
            </span>
          </div>
        </div>
      </section>

      {/* View toggle + legend */}
      <div className="pmap-toolbar">
        <Segmented<View>
          value={view}
          onChange={setView}
          ariaLabel="Process Map view"
          options={[
            { id: "processes", label: "Processes", icon: <Layers aria-hidden /> },
            { id: "entities", label: "Entities", icon: <Boxes aria-hidden /> },
          ]}
        />
        {view === "processes" && drillArea && (
          <nav className="pmap-breadcrumb" aria-label="Process level">
            <button className="pmap-crumb" onClick={() => setDrillId(null)}>
              <ChevronLeft aria-hidden /> Process Map
            </button>
            <ChevronRight className="pmap-crumb-sep" aria-hidden />
            <span className="pmap-crumb-current">{drillArea.name}</span>
          </nav>
        )}
        {view === "processes" && <PmapLegend />}
      </div>

      {view === "processes" ? (
        <ProcessesView
          drillArea={drillArea}
          onOpen={setOpenNode}
          onDrill={(id) => setDrillId(id)}
        />
      ) : (
        <EntitiesView onAction={proto} onOpenEntity={setOpenEntity} />
      )}

      <NodeDetail
        node={openNode}
        projectId={projectId!}
        onClose={() => setOpenNode(null)}
        onAction={proto}
        onDrill={
          openNode && isArea(openNode) && openNode.subprocesses.length > 0
            ? () => {
                setDrillId((openNode as ProcessArea).id);
                setOpenNode(null);
              }
            : undefined
        }
      />

      <EntityDetail
        entity={openEntity}
        projectId={projectId!}
        onClose={() => setOpenEntity(null)}
      />
    </div>
  );
}

/* ---------- Summary stat ---------- */
function PmapStat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  tone?: "brand" | "red" | "amber";
}) {
  return (
    <div className="pmap-stat">
      <span className={`pmap-stat__icon${tone ? ` pmap-stat__icon--${tone}` : ""}`}>
        {icon}
      </span>
      <div className="pmap-stat__body">
        <span className="pmap-stat__value">{value}</span>
        <span className="pmap-stat__label">{label}</span>
      </div>
    </div>
  );
}

/* ---------- Legend ---------- */
function PmapLegend() {
  return (
    <div className="pmap-legend" aria-label="Legend">
      <span className="pmap-legend__group">
        <span className="pmap-legend__label">Coverage</span>
        <span className="pmap-legend__cov cov-not-explored">Not explored</span>
        <span className="pmap-legend__cov cov-partial">Partial</span>
        <span className="pmap-legend__cov cov-validated">Validated</span>
      </span>
      <span className="pmap-legend__group">
        <span className="pmap-legend__label">Health</span>
        <span className="pmap-legend__item"><i className="pmap-sw h-unknown" /> Unknown</span>
        <span className="pmap-legend__item"><i className="pmap-sw h-healthy" /> Healthy</span>
        <span className="pmap-legend__item"><i className="pmap-sw h-friction" /> Friction</span>
        <span className="pmap-legend__item"><i className="pmap-sw h-critical" /> Critical</span>
      </span>
    </div>
  );
}

/* ---------- Processes view (canvas) ---------- */
function ProcessesView({
  drillArea,
  onOpen,
  onDrill,
}: {
  drillArea: ProcessArea | null;
  onOpen: (n: NodeLike) => void;
  onDrill: (id: string) => void;
}) {
  const layout = useMemo(() => {
    if (drillArea) {
      const subs = drillArea.subprocesses;
      const nodes = subs.map((s, i) => ({
        node: s,
        x: i * (NODE_W + GAP),
        y: 0,
        w: NODE_W,
        h: NODE_H,
      }));
      const width = Math.max(NODE_W, subs.length * NODE_W + (subs.length - 1) * GAP);
      return { nodes, width, height: NODE_H, seq: nodes.map((n) => n) };
    }
    // Level 0: 6 flow stages in a row + Data backbone below
    const flowAreas = FLOW.map((id) => clioProcessAreas.find((a) => a.id === id)!);
    const flow = flowAreas.map((a, i) => ({
      node: a,
      x: i * (NODE_W + GAP),
      y: 0,
      w: NODE_W,
      h: NODE_H,
    }));
    const width = 6 * NODE_W + 5 * GAP;
    const data = clioProcessAreas.find((a) => a.crossCutting)!;
    const dataNode = { node: data, x: 0, y: NODE_H + 64, w: width, h: 104 };
    return {
      nodes: [...flow, dataNode],
      width,
      height: NODE_H + 64 + 104,
      seq: flow,
    };
  }, [drillArea]);

  const miniNodes: MiniNode[] = layout.nodes.map((n) => ({
    x: n.x,
    y: n.y,
    w: n.w,
    h: n.h,
    tone: displayHealth(n.node).key,
  }));

  return (
    <Canvas
      contentWidth={layout.width}
      contentHeight={layout.height}
      nodes={miniNodes}
      fitKey={drillArea ? `sub-${drillArea.id}` : "level0"}
    >
      {/* Sequential connectors */}
      <svg className="pmap-edges" width={layout.width} height={layout.height} aria-hidden>
        <defs>
          <marker id="pm-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" className="pmap-arrowhead" />
          </marker>
        </defs>
        {layout.seq.slice(0, -1).map((n, i) => {
          const next = layout.seq[i + 1];
          const y = n.y + n.h / 2;
          return (
            <line
              key={i}
              x1={n.x + n.w}
              y1={y}
              x2={next.x}
              y2={next.y + next.h / 2}
              className="pmap-edge"
              markerEnd="url(#pm-arrow)"
            />
          );
        })}
      </svg>

      {layout.nodes.map(({ node, x, y, w, h }) => (
        <ProcessNode
          key={node.id}
          node={node}
          x={x}
          y={y}
          w={w}
          h={h}
          crossCutting={isArea(node) && !!node.crossCutting}
          onOpen={() => onOpen(node)}
          onDrill={
            isArea(node) && node.subprocesses.length > 0
              ? () => onDrill(node.id)
              : undefined
          }
        />
      ))}
    </Canvas>
  );
}

function ProcessNode({
  node,
  x,
  y,
  w,
  h,
  crossCutting,
  onOpen,
  onDrill,
}: {
  node: NodeLike;
  x: number;
  y: number;
  w: number;
  h: number;
  crossCutting?: boolean;
  onOpen: () => void;
  onDrill?: () => void;
}) {
  const c = counts(node);
  const dh = displayHealth(node);
  return (
    <div
      data-node
      className={`pmap-node h-${dh.key}${crossCutting ? " pmap-node--wide" : ""}`}
      style={{ left: x, top: y, width: w, height: h }}
    >
      {/* Whole card opens details — a single accessible button */}
      <button
        className="pmap-node__open"
        aria-label={`Open ${node.name} details`}
        onClick={onOpen}
      />

      <div className="pmap-node__content">
        <div className="pmap-node__head">
          <span className="pmap-node__name">
            {crossCutting && <Cpu aria-hidden />}
            {node.name}
          </span>
          <span className={`pmap-node__health${dh.inferred ? " is-inferred" : ""}`}>
            <span className="pmap-node__dot" />
            {dh.inferred ? `${healthMeta[dh.raw].label} · inferred` : healthMeta[dh.key].label}
          </span>
        </div>

        <span className={`pmap-node__coverage cov-${node.coverage}`}>
          {coverageMeta[node.coverage].label}
        </span>

        {crossCutting && <span className="pmap-node__cc">Underpins every stage</span>}

        <div className="pmap-node__counts">
          <span title="Evidence">
            <FileText aria-hidden /> {c.ev}
          </span>
          <span title="Questions">
            <HelpCircle aria-hidden /> {c.q}
          </span>
          <span title="Opportunities">
            <Target aria-hidden /> {c.opp}
          </span>
        </div>

        {onDrill && (
          <button
            className="pmap-node__drill"
            aria-label={`Open Level 1 subprocesses for ${node.name}`}
            onClick={onDrill}
          >
            <Layers aria-hidden /> Level 1
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Entities view ---------- */
const kindIcon: Record<EntityKind, ReactNode> = {
  system: <Server aria-hidden />,
  team: <Users aria-hidden />,
  stakeholder: <User aria-hidden />,
  document: <FileStack aria-hidden />,
};
const isPending = (e: Entity) => Boolean(e.meta && /pending/i.test(e.meta));

function EntitiesView({
  onAction,
  onOpenEntity,
}: {
  onAction: (l: string) => void;
  onOpenEntity: (e: Entity) => void;
}) {
  const total = Object.values(clioEntities).reduce((n, l) => n + l.length, 0);

  if (total === 0) {
    return (
      <div className="card card-pad pmap-entities-empty">
        <Boxes aria-hidden />
        <h2 className="block-title">No entities extracted yet</h2>
        <p className="block-sub">
          Entities are the systems, teams, stakeholders and documents found in
          your sources. Add a source or check extraction to populate this view.
        </p>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => onAction("Add source")}>
            <Plus /> Add source
          </button>
          <button className="btn btn-sm" onClick={() => onAction("Review extraction status")}>
            Review extraction status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pmap-entities">
      {ENTITY_KINDS.map((k) => (
        <section className="card card-pad pmap-ent-group" key={k.id}>
          <div className="section-head">
            <h2 className="block-title">
              <span className="pmap-ent-ic">{kindIcon[k.id]}</span> {k.label}
              <span className="pmap-ent-count">{clioEntities[k.id].length}</span>
            </h2>
          </div>
          <ul className="pmap-ent-list">
            {clioEntities[k.id].map((e) => (
              <li key={e.id}>
                <button
                  className={`pmap-ent${isPending(e) ? " is-pending" : ""}`}
                  onClick={() => onOpenEntity(e)}
                >
                  <div className="pmap-ent__main">
                    <span className="pmap-ent__name">
                      {e.name}
                      {isPending(e) && <span className="pmap-ent__pending">Pending</span>}
                    </span>
                    <span className="pmap-ent__role">{e.role}</span>
                    {e.meta && <span className="pmap-ent__meta">{e.meta}</span>}
                  </div>
                  <div className="pmap-ent__rel">
                    {e.related.map((r) => (
                      <span className="pmap-ent__tag" key={r}>
                        {r}
                      </span>
                    ))}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ---------- Collapsible list helper ---------- */
function MoreList<T>({
  items,
  initial,
  render,
  noun,
}: {
  items: T[];
  initial: number;
  render: (item: T, i: number) => ReactNode;
  noun: string;
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, initial);
  const hidden = items.length - initial;
  return (
    <>
      {shown.map(render)}
      {hidden > 0 && (
        <button className="pmap-more" onClick={() => setOpen((o) => !o)}>
          <ChevronDown className={open ? "is-open" : ""} aria-hidden />
          {open ? "Show less" : `Show ${hidden} more ${noun}`}
        </button>
      )}
    </>
  );
}

/* ---------- Node detail drawer ---------- */
function NodeDetail({
  node,
  projectId,
  onClose,
  onAction,
  onDrill,
}: {
  node: NodeLike | null;
  projectId: string;
  onClose: () => void;
  onAction: (l: string) => void;
  onDrill?: () => void;
}) {
  const unexplored = node?.coverage === "not-explored";
  const dh = node ? displayHealth(node) : null;

  const footer = node ? (
    unexplored ? (
      <div className="pmap-d__footactions">
        <Link
          to={`/projects/${projectId}/discovery`}
          className="btn btn-primary btn-sm"
          onClick={onClose}
        >
          <HelpCircle /> View suggested questions
        </Link>
        <button className="btn btn-sm" onClick={() => onAction("Add source")}>
          <Plus /> Add source
        </button>
      </div>
    ) : (
      <div className="pmap-d__foot-next">
        <span className="pmap-d__foot-label">
          <Lightbulb aria-hidden /> Recommended next action
        </span>
        <p>{node.nextAction}</p>
      </div>
    )
  ) : undefined;

  return (
    <SidePanel
      open={Boolean(node)}
      onClose={onClose}
      title={node?.name ?? "Process"}
      subtitle="Process detail"
      footer={footer}
    >
      {node && dh && (
        <div className="pmap-d" key={node.id}>
          <div className="pmap-d__badges">
            <Badge tone="neutral">{coverageMeta[node.coverage].label}</Badge>
            <Badge tone={healthBadgeTone[dh.key]} dot>
              {dh.inferred
                ? `${healthMeta[dh.raw].label} · inferred`
                : healthMeta[dh.key].label}
            </Badge>
          </div>

          {dh.inferred && (
            <p className="pmap-inference">
              <AlertTriangle aria-hidden /> This “{healthMeta[dh.raw].label}” reading is a
              research inference — no client evidence has confirmed it yet.
            </p>
          )}

          {unexplored ? (
            <div className="pmap-unexplored">
              <p className="pmap-unexplored__msg">
                No client workflow has been captured yet.
              </p>
              {node.unknowns.length > 0 && (
                <ul className="pmap-d__list">
                  {node.unknowns.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              )}
              {isArea(node) && node.suggestedQuestions && (
                <div className="pmap-suggest">
                  <span className="pmap-d__label">Suggested questions</span>
                  <ul className="pmap-d__list">
                    {node.suggestedQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              {onDrill && (
                <button className="pmap-d__drill" onClick={onDrill}>
                  <Layers aria-hidden /> Open Level 1 subprocesses
                  <ChevronRight aria-hidden />
                </button>
              )}

              <section className="pmap-d__section">
                <h3 className="pmap-d__label">Workflow</h3>
                <p className="pmap-d__text">{node.description}</p>
              </section>

              {node.systems.length > 0 && (
                <section className="pmap-d__section">
                  <h3 className="pmap-d__label">
                    <Server aria-hidden /> Systems
                  </h3>
                  <div className="pmap-chips">
                    {node.systems.map((s) => (
                      <span className="pmap-chip" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {node.owners.length > 0 && (
                <section className="pmap-d__section">
                  <h3 className="pmap-d__label">
                    <User aria-hidden /> Owners
                  </h3>
                  <div className="pmap-chips">
                    {node.owners.map((o) => (
                      <span className="pmap-chip" key={o}>
                        {o}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {node.evidence.length > 0 && (
                <section className="pmap-d__section">
                  <h3 className="pmap-d__label">
                    <FileText aria-hidden /> Evidence
                    <span className="pmap-d__count">{node.evidence.length}</span>
                  </h3>
                  <ul className="pmap-ev">
                    <MoreList
                      items={node.evidence}
                      initial={1}
                      noun="evidence"
                      render={(e, i) => (
                        <li className="pmap-ev__item" key={i}>
                          <div className="pmap-ev__top">
                            <span className="pmap-ev__finding">{e.finding}</span>
                            <EvidenceBadge level={e.level} />
                          </div>
                          <span className="pmap-ev__src">{e.source}</span>
                        </li>
                      )}
                    />
                  </ul>
                  <Link
                    to={`/projects/${projectId}/research`}
                    className="pmap-d__link"
                    onClick={onClose}
                  >
                    View sources in Research <ArrowRight aria-hidden />
                  </Link>
                </section>
              )}

              {node.painPoints.length > 0 && (
                <section className="pmap-d__section">
                  <h3 className="pmap-d__label">
                    <AlertTriangle aria-hidden /> Pain points
                  </h3>
                  <ul className="pmap-d__list pmap-d__list--pain">
                    {node.painPoints.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </section>
              )}

              {node.questions.length > 0 && (
                <section className="pmap-d__section">
                  <h3 className="pmap-d__label">
                    <HelpCircle aria-hidden /> Related discovery questions
                  </h3>
                  <ul className="pmap-qa">
                    <MoreList
                      items={node.questions}
                      initial={1}
                      noun="questions"
                      render={(q) => (
                        <li key={q.id} className="pmap-qa__item">
                          {q.answered ? (
                            <CheckCircle2 className="pmap-qa__ic pmap-qa__ic--done" aria-hidden />
                          ) : (
                            <Circle className="pmap-qa__ic" aria-hidden />
                          )}
                          <span>{q.question}</span>
                        </li>
                      )}
                    />
                  </ul>
                  <Link
                    to={`/projects/${projectId}/discovery`}
                    className="pmap-d__link"
                    onClick={onClose}
                  >
                    Open Discovery Questions <ArrowRight aria-hidden />
                  </Link>
                </section>
              )}

              {node.opportunities.length > 0 && (
                <section className="pmap-d__section">
                  <h3 className="pmap-d__label">
                    <Target aria-hidden /> Opportunities
                  </h3>
                  <div className="pmap-chips">
                    {node.opportunities.map((o) => (
                      <Link
                        key={o.id}
                        to={`/projects/${projectId}/opportunities`}
                        className="pmap-chip pmap-chip--link"
                        onClick={onClose}
                      >
                        {o.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {node.unknowns.length > 0 && (
                <section className="pmap-d__section">
                  <h3 className="pmap-d__label">
                    <HelpCircle aria-hidden /> Open unknowns
                  </h3>
                  <ul className="pmap-d__list">
                    {node.unknowns.map((u) => (
                      <li key={u}>{u}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Comparison — only when source-supported */}
              {isArea(node) && node.comparison && (
                <ComparisonBlock comparison={node.comparison} />
              )}
            </>
          )}
        </div>
      )}
    </SidePanel>
  );
}

/* Comparison collapses detail after the first two rows. */
function ComparisonBlock({
  comparison,
}: {
  comparison: NonNullable<ProcessArea["comparison"]>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="pmap-d__section pmap-compare">
      <h3 className="pmap-d__label">
        <GitCompare aria-hidden /> Compare with Heizen work
      </h3>
      <div className="pmap-compare__row">
        <span className="pmap-compare__k">Client workflow</span>
        <p>{comparison.clientWorkflow}</p>
      </div>
      <div className="pmap-compare__row">
        <span className="pmap-compare__k pmap-compare__k--brand">
          Similar Heizen workflow
        </span>
        <p>{comparison.heizenWorkflow}</p>
      </div>
      {open && (
        <>
          <div className="pmap-compare__grid">
            <div>
              <span className="pmap-compare__k">Key difference</span>
              <p>{comparison.keyDifference}</p>
            </div>
            <div>
              <span className="pmap-compare__k">Possible implication</span>
              <p>{comparison.implication}</p>
            </div>
          </div>
          <span className="pmap-compare__src">
            <FileText aria-hidden /> Supported by {comparison.source}
          </span>
        </>
      )}
      <button className="pmap-more" onClick={() => setOpen((o) => !o)}>
        <ChevronDown className={open ? "is-open" : ""} aria-hidden />
        {open ? "Show less" : "Show difference & implication"}
      </button>
    </section>
  );
}

/* ---------- Entity detail drawer ---------- */
function entityContext(entity: Entity) {
  const relatedAreas = clioProcessAreas.filter((a) =>
    entity.related.includes(a.short)
  );
  const evMap = new Map<string, ProcessArea["evidence"][number]>();
  relatedAreas.forEach((a) => a.evidence.forEach((e) => evMap.set(e.finding, e)));
  const evidence = [...evMap.values()];
  const oppMap = new Map<string, { id: string; name: string }>();
  relatedAreas.forEach((a) => a.opportunities.forEach((o) => oppMap.set(o.id, o)));
  const opportunities = [...oppMap.values()];
  const sources = [...new Set(evidence.map((e) => e.source))];
  return { relatedAreas, evidence, opportunities, sources };
}

const KIND_LABEL: Record<EntityKind, string> = {
  system: "System",
  team: "Team",
  stakeholder: "Stakeholder",
  document: "Document",
};

function EntityDetail({
  entity,
  projectId,
  onClose,
}: {
  entity: Entity | null;
  projectId: string;
  onClose: () => void;
}) {
  const ctx = entity ? entityContext(entity) : null;
  const kind = entity
    ? (Object.keys(clioEntities) as EntityKind[]).find((k) =>
        clioEntities[k].some((e) => e.id === entity.id)
      )
    : undefined;

  return (
    <SidePanel
      open={Boolean(entity)}
      onClose={onClose}
      title={entity?.name ?? "Entity"}
      subtitle={kind ? KIND_LABEL[kind] : "Entity"}
    >
      {entity && ctx && (
        <div className="pmap-d" key={entity.id}>
          <div className="pmap-d__badges">
            {kind && (
              <Badge tone="neutral" icon={kindIcon[kind]}>
                {KIND_LABEL[kind]}
              </Badge>
            )}
            {isPending(entity) && <Badge tone="amber" dot>Pending inclusion</Badge>}
          </div>
          <p className="pmap-d__text">{entity.role}</p>
          {entity.meta && <p className="pmap-entmeta">{entity.meta}</p>}

          <section className="pmap-d__section">
            <h3 className="pmap-d__label">
              <Layers aria-hidden /> Related processes
            </h3>
            {ctx.relatedAreas.length > 0 ? (
              <div className="pmap-relproc">
                {ctx.relatedAreas.map((a) => {
                  const dh = displayHealth(a);
                  return (
                    <div className="pmap-relproc__item" key={a.id}>
                      <span className="pmap-relproc__name">{a.name}</span>
                      <span className="pmap-relproc__badges">
                        <span className={`pmap-node__coverage cov-${a.coverage}`}>
                          {coverageMeta[a.coverage].label}
                        </span>
                        <span className={`pmap-relproc__health h-${dh.key}`}>
                          <span className="pmap-node__dot" />
                          {dh.inferred
                            ? `${healthMeta[dh.raw].label} · inferred`
                            : healthMeta[dh.key].label}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="pmap-d__text">Not yet linked to a process.</p>
            )}
          </section>

          {ctx.evidence.length > 0 && (
            <section className="pmap-d__section">
              <h3 className="pmap-d__label">
                <FileText aria-hidden /> Evidence
                <span className="pmap-d__count">{ctx.evidence.length}</span>
              </h3>
              <ul className="pmap-ev">
                <MoreList
                  items={ctx.evidence}
                  initial={1}
                  noun="evidence"
                  render={(e, i) => (
                    <li className="pmap-ev__item" key={i}>
                      <div className="pmap-ev__top">
                        <span className="pmap-ev__finding">{e.finding}</span>
                        <EvidenceBadge level={e.level} />
                      </div>
                      <span className="pmap-ev__src">{e.source}</span>
                    </li>
                  )}
                />
              </ul>
            </section>
          )}

          {ctx.sources.length > 0 && (
            <section className="pmap-d__section">
              <h3 className="pmap-d__label">
                <FileStack aria-hidden /> Sources
              </h3>
              <ul className="pmap-d__list pmap-d__list--plain">
                {ctx.sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <Link
                to={`/projects/${projectId}/research`}
                className="pmap-d__link"
                onClick={onClose}
              >
                View sources in Research <ArrowRight aria-hidden />
              </Link>
            </section>
          )}

          {ctx.opportunities.length > 0 && (
            <section className="pmap-d__section">
              <h3 className="pmap-d__label">
                <Target aria-hidden /> Opportunities
              </h3>
              <div className="pmap-chips">
                {ctx.opportunities.map((o) => (
                  <Link
                    key={o.id}
                    to={`/projects/${projectId}/opportunities`}
                    className="pmap-chip pmap-chip--link"
                    onClick={onClose}
                  >
                    {o.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </SidePanel>
  );
}
