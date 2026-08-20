import { Link } from "react-router-dom";
import {
  Workflow,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  MapPinned,
} from "lucide-react";
import { Badge } from "./Badge";
import {
  clioProcessAreas,
  handoffById,
  introCoverageLabel,
  type ProcessArea,
  type Coverage,
} from "../data/processmap";

/* ================================================================
   "How they operate today" — a compact, read-only value-chain strip
   for the Introductory Call Overview. Plan → Source → Make → Quality
   → Store → Deliver, with one highlighted broken handoff (Make →
   Store, the 24-hour inventory lag). Deliberately fits without
   scrolling, dragging or zooming; the full canvas lives in the
   Process Map screen. No opportunities, solutions or expansion.

   Clicking a stage (or the broken handoff) does NOT open its own
   drawer — it asks the surrounding brief workspace, via onOpenDetail,
   to show the detail in its single in-panel inspector.
   ================================================================ */

/* Left-to-right stage order (the cross-cutting Data backbone is omitted). */
const FLOW_IDS = ["plan", "source", "make", "quality", "store", "deliver"];

/* Connector certainty between each consecutive pair. The one broken
   handoff (Make → Store) is surfaced separately, below the strip, so the
   inline arrows stay quiet and readable. */
type LinkState = "confirmed" | "inferred" | "unexplored";
const LINK_STATE: Record<string, LinkState> = {
  "plan>source": "unexplored",
  "source>make": "unexplored",
  "make>quality": "confirmed",
  "quality>store": "inferred",
  "store>deliver": "unexplored",
};

/* At most one short, client-confirmed issue per stage. Only Make has a
   confirmed, source-backed issue on an introductory call. */
const STAGE_ISSUE: Record<string, string> = {
  make: "Completion entered next morning",
};

const coverageTone: Record<Coverage, "green" | "amber" | "neutral"> = {
  validated: "green",
  partial: "amber",
  "not-explored": "neutral",
};

const OPERATE_SUMMARY =
  "Clio plans in Netstock, runs production through paper and plant systems, then records inventory and warehouse activity in NetSuite.";

export const flowStageName = (a: ProcessArea) => a.flowLabel ?? a.name;

/** The one broken handoff to highlight — Make → Store, the 24-hour lag.
    Reuses the evidenced Make-side handoff detail for the inspector. */
const brokenSource = handoffById("ho-make-quality");

/** What a click inside the section asks the surrounding workspace to show. */
export type OperateDetail =
  | { kind: "stage"; area: ProcessArea }
  | { kind: "broken" };

export function OperateToday({
  projectId,
  onOpenDetail,
}: {
  projectId: string;
  onOpenDetail: (detail: OperateDetail) => void;
}) {
  const areas = FLOW_IDS.map(
    (id) => clioProcessAreas.find((a) => a.id === id)!
  ).filter(Boolean);

  return (
    <section className="fcb-sec">
      <div className="fcb-sec__head">
        <span className="fcb-sec__num" aria-hidden>
          <Workflow />
        </span>
        <div className="opflow__headtext">
          <h3 className="fcb-sec__title">
            <span className="fcb-sec__n">4.</span> How they operate today
          </h3>
          <p className="fcb-sec__sub">
            The current value chain, as-is — one line per stage. Click a stage for detail.
          </p>
        </div>
        <Link
          to={`/projects/${projectId}/process-map`}
          className="opflow__full"
        >
          <MapPinned aria-hidden /> View full process map
        </Link>
      </div>

      <p className="opflow__summary">{OPERATE_SUMMARY}</p>

      {/* Horizontal value-chain strip */}
      <div className="opflow" role="list" aria-label="Current process flow">
        {areas.map((a, i) => {
          const status = introCoverageLabel[a.coverage];
          const issue = STAGE_ISSUE[a.id];
          const next = areas[i + 1];
          const link = next ? LINK_STATE[`${a.id}>${next.id}`] : null;
          return (
            <div className="opflow__cell" key={a.id} role="listitem">
              <button
                className="opflow__stage"
                onClick={() => onOpenDetail({ kind: "stage", area: a })}
                aria-label={`${flowStageName(a)} — ${status}. Open detail`}
              >
                <span className="opflow__name">{flowStageName(a)}</span>
                <span className="opflow__tool">{a.tool ?? "Not explored"}</span>
                <span className="opflow__statusrow">
                  <Badge tone={coverageTone[a.coverage]} dot>
                    {status}
                  </Badge>
                </span>
                {issue ? (
                  <span className="opflow__issue">
                    <AlertTriangle aria-hidden /> {issue}
                  </span>
                ) : (
                  <span className="opflow__issue opflow__issue--none">
                    No confirmed issue yet
                  </span>
                )}
              </button>

              {link && (
                <span
                  className={`opflow__arrow is-${link}`}
                  aria-hidden
                  title={
                    link === "inferred"
                      ? "Inferred flow"
                      : link === "unexplored"
                      ? "Not yet explored"
                      : "Confirmed flow"
                  }
                >
                  <ArrowRight />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* The one highlighted broken handoff — Make → Store */}
      <button
        className="opflow__broken"
        onClick={() => onOpenDetail({ kind: "broken" })}
      >
        <span className="opflow__broken-ic" aria-hidden>
          <AlertTriangle />
        </span>
        <span className="opflow__broken-main">
          <span className="opflow__broken-title">
            Broken handoff · Make <ArrowRight aria-hidden /> Store
          </span>
          <span className="opflow__broken-impact">24-hour inventory update delay</span>
        </span>
        <ChevronRight className="opflow__broken-chev" aria-hidden />
      </button>
    </section>
  );
}

/* ---- stage detail (rendered in the workspace inspector) ----------- */
export function StageDetailBody({ area }: { area: ProcessArea }) {
  const status = introCoverageLabel[area.coverage];
  const issue = STAGE_ISSUE[area.id];
  // The related introductory question: an open stage question, else a
  // suggested one for an unexplored stage.
  const question =
    area.questions.find((q) => !q.answered)?.question ??
    area.suggestedQuestions?.[0] ??
    area.questions[0]?.question;

  return (
    <div className="opflow-d">
      <div className="opflow-d__meta">
        <div className="opflow-d__metaitem">
          <span className="opflow-d__k">System / tool</span>
          <span className="opflow-d__v">{area.tool ?? "Not explored"}</span>
        </div>
        <div className="opflow-d__metaitem">
          <span className="opflow-d__k">Status</span>
          <Badge tone={coverageTone[area.coverage]} dot>
            {status}
          </Badge>
        </div>
      </div>

      <section className="opflow-d__sec">
        <h4 className="opflow-d__h">What happens today</h4>
        <p className="opflow-d__body">
          {area.today ?? "Not yet explored — no captured workflow for this stage."}
        </p>
      </section>

      {area.responsible && (
        <section className="opflow-d__sec">
          <h4 className="opflow-d__h">Person / team responsible</h4>
          <p className="opflow-d__body">{area.responsible}</p>
        </section>
      )}

      {issue && (
        <section className="opflow-d__sec">
          <h4 className="opflow-d__h">Confirmed issue</h4>
          <p className="opflow-d__issue">
            <AlertTriangle aria-hidden /> {issue}
          </p>
        </section>
      )}

      {question && (
        <section className="opflow-d__sec">
          <h4 className="opflow-d__h">Related introductory question</h4>
          <p className="opflow-d__q">"{question}"</p>
        </section>
      )}
    </div>
  );
}

/* ---- broken-handoff detail (rendered in the workspace inspector) -- */
export function BrokenDetailBody() {
  return (
    <div className="opflow-d">
      <div className="opflow-d__impact">
        <AlertTriangle aria-hidden />
        <span>24-hour inventory update delay</span>
      </div>

      <section className="opflow-d__sec">
        <h4 className="opflow-d__h">What moves</h4>
        <p className="opflow-d__body">
          {brokenSource?.detail ??
            "Production completion is recorded on paper at shift end and keyed into NetSuite the next morning, before finished-goods inventory updates."}
        </p>
      </section>

      {brokenSource?.uncertainty && (
        <section className="opflow-d__sec">
          <h4 className="opflow-d__h">What's unclear</h4>
          <p className="opflow-d__body">{brokenSource.uncertainty}</p>
        </section>
      )}

      {brokenSource && brokenSource.evidence.length > 0 && (
        <section className="opflow-d__sec">
          <h4 className="opflow-d__h">Evidence</h4>
          <div className="opflow-d__ev">
            {brokenSource.evidence.map((e) => (
              <div className="opflow-d__evrow" key={e.finding}>
                <p className="opflow-d__evfind">{e.finding}</p>
                <span className="opflow-d__evsrc">{e.source}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {brokenSource?.suggestedQuestion && (
        <section className="opflow-d__sec">
          <h4 className="opflow-d__h">Suggested introductory question</h4>
          <p className="opflow-d__q">"{brokenSource.suggestedQuestion}"</p>
        </section>
      )}
    </div>
  );
}

/** The footer actions both process details share. `onNavigate` lets the
    workspace close the whole panel when a link leaves the page. */
export function OpflowDetailLinks({
  projectId,
  onNavigate,
}: {
  projectId: string;
  onNavigate: () => void;
}) {
  return (
    <div className="opflow-d__foot">
      <Link
        to={`/projects/${projectId}/discovery`}
        className="btn btn-primary btn-sm"
        onClick={onNavigate}
      >
        <HelpCircle aria-hidden /> Ask about this step
      </Link>
      <Link
        to={`/projects/${projectId}/process-map`}
        className="btn btn-sm"
        onClick={onNavigate}
      >
        View in process map
      </Link>
    </div>
  );
}
