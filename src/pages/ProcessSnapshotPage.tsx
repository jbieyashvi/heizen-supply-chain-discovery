import { useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  HelpCircle,
  Link2,
  MessageCircleQuestion,
  Server,
  User,
} from "lucide-react";
import { useToast } from "../components/Toast";
import { readStage } from "../lib/stage";
import {
  clioHandoffs,
  clioProcessAreas,
  FLOW_ORDER,
  snapshotReadiness,
  snapshotStatus,
  snapshotStatusMeta,
  type ProcessArea,
  type SnapshotStatus,
} from "../data/processmap";

/* ================================================================
   Client snapshot — a clean presentation view of the six-stage flow:
   no app navigation, filters or editing, just what we believe about
   each stage today and how much of it the client has confirmed. The
   sheet element is exactly what "Download PNG" exports.
   ================================================================ */

/** The one line a client should see about a stage's key risk: a broken
   outbound handoff outranks a pain point; unexplored stages ask for
   validation instead of asserting anything. */
function keyIssue(
  a: ProcessArea
): { label: "Key handoff" | "Key gap" | "To validate"; warn: boolean; text: string } | null {
  const outbound = clioHandoffs.find((h) => h.from === a.id);
  if (outbound && outbound.state === "broken")
    return { label: "Key handoff", warn: true, text: outbound.label };
  if (a.coverage === "not-explored")
    return a.unknowns[0] ? { label: "To validate", warn: false, text: a.unknowns[0] } : null;
  return a.painPoints[0] ? { label: "Key gap", warn: false, text: a.painPoints[0] } : null;
}

export function ProcessSnapshotPage() {
  const { projectId } = useParams();
  const { notify } = useToast();
  const stage = readStage(projectId);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Only Clio Snacks has a mapped process to present.
  if (projectId !== "clio-snacks")
    return <Navigate to={`/projects/${projectId}/process-map`} replace />;

  const stages = FLOW_ORDER.map((id) => clioProcessAreas.find((a) => a.id === id)!);
  const unexplored = stages.filter((a) => a.coverage === "not-explored");
  const preparedOn = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify({
        title: "Presentation link copied",
        body: "Prototype — the link opens this read-only snapshot view.",
        tone: "info",
      });
    } catch {
      notify({
        title: "Couldn't copy the link",
        body: "Copy the address bar URL instead.",
        tone: "info",
      });
    }
  };

  const downloadPng = async () => {
    const sheet = sheetRef.current;
    if (!sheet || exporting) return;
    setExporting(true);
    try {
      // Race a timeout so a stalled render re-enables the button with an
      // error toast instead of hanging on "Preparing PNG…" forever.
      const dataUrl = await Promise.race([
        toPng(sheet, {
          pixelRatio: 2,
          backgroundColor: getComputedStyle(sheet.parentElement!).backgroundColor,
        }),
        new Promise<never>((_, reject) =>
          window.setTimeout(() => reject(new Error("PNG export timed out")), 15000)
        ),
      ]);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `clio-snacks-process-snapshot-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      notify({
        title: "Snapshot PNG downloaded",
        body: "Exported at 2× resolution for slides and email.",
      });
    } catch {
      notify({
        title: "PNG export failed",
        body: "Try again, or screenshot the sheet as a fallback.",
        tone: "info",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="snapview">
      <header className="snapview__bar">
        <Link to={`/projects/${projectId}/process-map`} className="btn btn-sm">
          <ArrowLeft /> Back to interactive map
        </Link>
        <div className="snapview__bar-actions">
          <button type="button" className="btn btn-sm" onClick={copyLink}>
            <Link2 /> Copy presentation link
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={downloadPng}
            disabled={exporting}
          >
            <Download /> {exporting ? "Preparing PNG…" : "Download PNG"}
          </button>
        </div>
      </header>

      <main className="snapview__stage">
        <div className="snapsheet" ref={sheetRef}>
          <header className="snapsheet__head">
            <div>
              <span className="snapsheet__brand">Heizen · Supply-chain discovery</span>
              <h1 className="snapsheet__title">
                Our current understanding of Clio Snacks’ workflow
              </h1>
            </div>
            <div className="snapsheet__meta">
              <span className="snapsheet__prepared">Prepared on {preparedOn}</span>
              <span className={`snapsheet__ctx snapsheet__ctx--${stage}`}>
                {snapshotReadiness[stage]}
              </span>
            </div>
          </header>

          <ol className="snapflow" aria-label="Six-stage process flow">
            {stages.map((a, i) => (
              <SnapshotStageCard
                key={a.id}
                area={a}
                index={i}
                status={snapshotStatus(a, stage)}
              />
            ))}
          </ol>

          <footer className="snapsheet__foot">
            <div className="snaplegend" aria-label="How to read the statuses">
              <span className="snapmark st-confirmed">Confirmed — evidenced with the client</span>
              <span className="snapmark st-inferred">Inferred — from research; to be validated</span>
              <span className="snapmark st-not-explored">Not explored — not yet discussed</span>
            </div>
            {unexplored.length > 0 && (
              <div className="snapquestions">
                <span className="snapquestions__title">
                  <MessageCircleQuestion aria-hidden /> Questions to validate
                </span>
                <ul>
                  {unexplored.map((a) => (
                    <li key={a.id}>
                      <b>{a.name}:</b> {a.suggestedQuestions?.[0] ?? a.nextAction}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </footer>
        </div>
      </main>
    </div>
  );
}

function SnapshotStageCard({
  area,
  index,
  status,
}: {
  area: ProcessArea;
  index: number;
  status: SnapshotStatus;
}) {
  const issue = keyIssue(area);
  const explored = area.coverage !== "not-explored";
  return (
    <li className={`snapcard st-${status}`}>
      <div className="snapcard__head">
        <span className="snapcard__step" aria-hidden>
          {index + 1}
        </span>
        <span className="snapcard__name">{area.flowLabel ?? area.name}</span>
      </div>
      <span className={`snapmark st-${status}`}>{snapshotStatusMeta[status].label}</span>
      <p className="snapcard__today">
        {explored && area.today
          ? area.today
          : "Not yet explored on a call — nothing here is assumed."}
      </p>
      <dl className="snapcard__facts">
        <div>
          <dt>
            <Server aria-hidden /> System
          </dt>
          <dd>{area.tool ?? "—"}</dd>
        </div>
        <div>
          <dt>
            <User aria-hidden /> Owner
          </dt>
          <dd>{area.responsible ?? "—"}</dd>
        </div>
        {issue && (
          <div className={issue.warn ? "is-warn" : undefined}>
            <dt>
              {issue.label === "To validate" ? (
                <HelpCircle aria-hidden />
              ) : (
                <AlertTriangle aria-hidden />
              )}{" "}
              {issue.label}
            </dt>
            <dd>{issue.text}</dd>
          </div>
        )}
      </dl>
    </li>
  );
}
