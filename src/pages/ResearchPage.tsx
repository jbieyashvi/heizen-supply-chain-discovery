import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  RefreshCw,
  FileStack,
  Clock3,
  CheckCircle2,
  MoreHorizontal,
  FileText,
  Eye,
  Download,
  Loader,
  Layers,
  BookOpen,
  FlaskConical,
  Handshake,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { Segmented } from "../components/Segmented";
import { Badge } from "../components/Badge";
import { FreshnessBadge } from "../components/StatusBadges";
import { Tooltip } from "../components/Tooltip";
import { useToast } from "../components/Toast";
import { useClickOutside } from "../hooks/useClickOutside";
import { SidePanel } from "../components/SidePanel";
import { EvidencePanel, type EvidenceView } from "../components/research/EvidencePanel";
import { ResearchBrief } from "../components/research/ResearchBrief";
import { ResearchFull } from "../components/research/ResearchFull";
import { ResearchFirstCall } from "../components/research/ResearchFirstCall";
import { ClientReadyPreview } from "../components/research/ClientReadyPreview";
import { StageBadge } from "../components/StageBadge";
import { projects } from "../data/mock";
import { researchByProject } from "../data/research";
import { Lock, Globe } from "lucide-react";

type Mode = "first-call" | "brief" | "full";
const MODE_KEY = "heizen-v2-research-mode";

const REFRESH_STAGES = [
  "Queued",
  "Analysing company context",
  "Mapping systems and operations",
  "Checking evidence",
  "Building the brief",
];

function OverflowMenu({
  onPreview,
  notify,
}: {
  onPreview: () => void;
  notify: ReturnType<typeof useToast>["notify"];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div className="menu" ref={ref}>
      <button
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More research actions"
      >
        <MoreHorizontal />
      </button>
      {open && (
        <div className="menu__pop" role="menu">
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onPreview();
            }}
          >
            <Eye /> Preview client-ready brief
          </button>
          <Tooltip label="PDF export is not available in this prototype yet.">
            <button role="menuitem" disabled aria-disabled="true">
              <Download /> Export brief (soon)
            </button>
          </Tooltip>
          <div className="menu__sep" />
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              notify({
                title: "Source ledger",
                body: "Open Full Research to browse every source.",
                tone: "info",
              });
            }}
          >
            <FileStack /> View source ledger
          </button>
        </div>
      )}
    </div>
  );
}

export function ResearchPage() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);
  const data = projectId ? researchByProject[projectId] : undefined;
  const { notify } = useToast();

  const [mode, setMode] = useState<Mode>(() => {
    const saved = sessionStorage.getItem(MODE_KEY);
    return saved === "full" || saved === "brief" ? saved : "first-call";
  });
  const setModePersist = (m: Mode) => {
    setMode(m);
    sessionStorage.setItem(MODE_KEY, m);
  };

  const [evidence, setEvidence] = useState<EvidenceView | null>(null);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [refreshDialog, setRefreshDialog] = useState(false);
  const [clientPreview, setClientPreview] = useState(false);

  // Simulated refresh run
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [refreshed, setRefreshed] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const startRefresh = () => {
    setRefreshDialog(false);
    setRunning(true);
    setStage(0);
    notify({
      title: "Refresh queued",
      body: "Regenerating the brief with all sources. You can keep reading the current research.",
      tone: "info",
    });
    REFRESH_STAGES.forEach((_, i) => {
      const t = window.setTimeout(() => setStage(i), i * 1600);
      timers.current.push(t);
    });
    const done = window.setTimeout(() => {
      setRunning(false);
      setRefreshed(true);
      notify({
        title: "Research refreshed",
        body: "The brief now includes all 5 sources. Freshness: up to date.",
      });
    }, REFRESH_STAGES.length * 1600 + 400);
    timers.current.push(done);
  };

  if (!project) {
    return (
      <div className="page">
        <EmptyState
          icon={<FlaskConical />}
          title="Project not found"
          body="This project may have been removed or the link is out of date."
          action={
            <Link className="btn btn-primary" to="/projects">
              Back to projects
            </Link>
          }
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page">
        <PageHeader
          crumbs={[
            { label: "Projects", to: "/projects" },
            { label: project.name, to: `/projects/${projectId}` },
            { label: "Research" },
          ]}
          title={<h1 className="page-title">Research</h1>}
        />
        <EmptyState
          icon={<FlaskConical />}
          title="Research is coming soon"
          body={`Full research for ${project.name} is generated once its automated run completes. Clio Snacks shows the complete experience.`}
          action={
            <Link className="btn btn-primary" to="/projects/clio-snacks/research">
              Open a completed example
            </Link>
          }
        />
      </div>
    );
  }

  const meta = data.meta;
  const includedCount = refreshed ? meta.sourcesIncluded + meta.sourcesPending : meta.sourcesIncluded;
  const pendingCount = refreshed ? 0 : meta.sourcesPending;

  return (
    <div className="page research">
      <PageHeader
        crumbs={[
          { label: "Projects", to: "/projects" },
          { label: project.name, to: `/projects/${projectId}` },
          { label: "Research" },
        ]}
        title={
          <>
            <h1 className="page-title">Research</h1>
            <StageBadge projectId={projectId} />
          </>
        }
        subtitle={`Client preparation research for ${project.name}.`}
        actions={
          <div className="row" style={{ gap: 8 }}>
            {!refreshed && pendingCount > 0 && (
              <button className="btn btn-sm" onClick={() => setPendingOpen(true)}>
                Review pending changes
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setRefreshDialog(true)}
              disabled={running}
            >
              <RefreshCw className={running ? "spin" : ""} />
              {running ? "Refreshing…" : "Refresh research"}
            </button>
            <OverflowMenu onPreview={() => setClientPreview(true)} notify={notify} />
          </div>
        }
      />

      {/* Status + mode toolbar */}
      <div className="research-bar">
        <Segmented<Mode>
          value={mode}
          onChange={setModePersist}
          ariaLabel="Research mode"
          options={[
            { id: "first-call", label: "First-call Brief", icon: <Handshake aria-hidden /> },
            { id: "brief", label: "Brief", icon: <BookOpen aria-hidden /> },
            { id: "full", label: "Full Research", icon: <Layers aria-hidden /> },
          ]}
        />
        <div className="research-status" role="status">
          <span className="rstat">
            <CheckCircle2 aria-hidden /> {meta.status}
          </span>
          <span className="rstat">
            <Clock3 aria-hidden /> Generated {meta.generated}
          </span>
          <span className="rstat">
            <FileStack aria-hidden /> {includedCount} sources included
            {pendingCount > 0 && (
              <span className="rstat__pending"> · {pendingCount} pending</span>
            )}
          </span>
          {refreshed ? (
            <FreshnessBadge state="fresh" />
          ) : (
            <Tooltip label="The current brief is usable for preparation, but two recently added sources are not yet included. Refresh to fold them in.">
              <Badge tone="amber" dot>
                {meta.statusNote}
              </Badge>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Running strip — non-blocking */}
      {running && (
        <div className="run-strip" role="status" aria-live="polite">
          <Loader className="spin" aria-hidden />
          <span className="run-strip__stage">{REFRESH_STAGES[stage]}…</span>
          <span className="run-strip__hint">
            Existing research stays available while the refresh runs.
          </span>
          <div className="run-strip__track" aria-hidden>
            {REFRESH_STAGES.map((_, i) => (
              <span
                key={i}
                className={`run-strip__dot${i <= stage ? " is-on" : ""}`}
              />
            ))}
          </div>
        </div>
      )}

      {mode === "first-call" ? (
        <ResearchFirstCall data={data} projectId={projectId!} />
      ) : mode === "brief" ? (
        <ResearchBrief
          data={data}
          projectId={projectId!}
          meeting={project.meeting}
          openEvidence={setEvidence}
          onPreviewClientBrief={() => setClientPreview(true)}
        />
      ) : (
        <ResearchFull
          data={data}
          projectId={projectId!}
          openEvidence={setEvidence}
          refreshed={refreshed}
        />
      )}

      {/* Shared evidence side panel */}
      <EvidencePanel view={evidence} onClose={() => setEvidence(null)} />

      {/* Pending changes side panel */}
      <SidePanel
        open={pendingOpen}
        onClose={() => setPendingOpen(false)}
        title="Pending changes"
        subtitle="Sources added since the current brief was generated"
      >
        <div className="pending">
          <p className="pending__intro">
            These sources have already updated Questions and Opportunities. The
            written research brief is regenerated when you refresh research.
          </p>
          {data.pending.map((s) => (
            <div className="pending__item" key={s.id}>
              <div className="pending__head">
                <span className="pending__vis" aria-hidden>
                  {s.visibility === "client" ? <Lock /> : <Globe />}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="pending__title">{s.title}</div>
                  <div className="pending__meta">
                    {s.type} · {s.addedRelative}
                  </div>
                </div>
              </div>
              <div className="pending__block">
                <span className="pending__label pending__label--ok">
                  Already updated
                </span>
                <ul className="pending__list">
                  {s.updated.map((u) => (
                    <li key={u}>
                      <CheckCircle2 aria-hidden /> {u}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pending__block">
                <span className="pending__label pending__label--wait">
                  Needs research refresh
                </span>
                <p className="pending__wait">{s.pending}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="pending__foot">
          <button
            className="btn btn-primary"
            onClick={() => {
              setPendingOpen(false);
              setRefreshDialog(true);
            }}
            disabled={running}
          >
            <RefreshCw /> Refresh research
          </button>
        </div>
      </SidePanel>

      {/* Refresh confirmation dialog */}
      <Modal
        open={refreshDialog}
        onClose={() => setRefreshDialog(false)}
        title="Refresh research?"
        subtitle="Regenerate the written brief with the latest sources"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setRefreshDialog(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={startRefresh}>
              <RefreshCw /> Refresh research
            </button>
          </>
        }
      >
        <ul className="confirm-list">
          <li>
            <RefreshCw aria-hidden /> Existing research will be regenerated from
            scratch.
          </li>
          <li>
            <FileText aria-hidden /> Two new sources will be included — the 13 Aug
            follow-up operations call transcript and the 14 Aug vendor support
            addendum.
          </li>
          <li>
            <CheckCircle2 aria-hidden /> Questions and Opportunities are already
            current — only the brief needs refreshing.
          </li>
          <li>
            <Clock3 aria-hidden /> This usually takes about 10–15 minutes.
          </li>
          <li>
            <BookOpen aria-hidden /> The current research stays available to read
            while the refresh runs.
          </li>
        </ul>
      </Modal>

      {/* Client-ready preview */}
      <ClientReadyPreview
        open={clientPreview}
        onClose={() => setClientPreview(false)}
        data={data}
        clientName={project.name}
      />
    </div>
  );
}
