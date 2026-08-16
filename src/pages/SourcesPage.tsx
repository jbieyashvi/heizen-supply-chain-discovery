import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Upload,
  ClipboardPaste,
  Link2,
  Video,
  Search,
  RefreshCw,
  MoreHorizontal,
  FileText,
  HelpCircle,
  Target,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Lock,
  Globe,
  Building2,
  Clock3,
  ExternalLink,
  Trash2,
  Loader,
  FileStack,
  Layers,
  Info,
  ChevronDown,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { Segmented } from "../components/Segmented";
import { SidePanel } from "../components/SidePanel";
import { Modal } from "../components/Modal";
import { ReviewChangesPanel } from "../components/sources/ReviewChangesPanel";
import { useToast } from "../components/Toast";
import { useClickOutside } from "../hooks/useClickOutside";
import { projects } from "../data/mock";
import {
  clioSources,
  originMeta,
  statusMeta,
  AUTOMATION_NOTE,
  ADD_METHODS,
  type SourceItem,
  type Origin,
} from "../data/sources";

type Filter = "all" | "processing" | "processed" | "needs-attention" | "client";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "processing", label: "Processing" },
  { id: "processed", label: "Processed" },
  { id: "needs-attention", label: "Needs attention" },
  { id: "client", label: "Client-provided" },
];

const ADD_ICON: Record<string, React.ReactNode> = {
  upload: <Upload aria-hidden />,
  clipboard: <ClipboardPaste aria-hidden />,
  link: <Link2 aria-hidden />,
  video: <Video aria-hidden />,
};

function OriginBadge({ origin }: { origin: Origin }) {
  const m = originMeta[origin];
  const icon =
    origin === "client" ? <Lock /> : origin === "public" ? <Globe /> : <Building2 />;
  return (
    <Badge tone={m.tone} icon={icon}>
      {m.label}
    </Badge>
  );
}

export function SourcesPage() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);
  const { notify } = useToast();

  const [sources, setSources] = useState<SourceItem[]>(() =>
    clioSources.map((s) => ({ ...s }))
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [addMethod, setAddMethod] = useState<(typeof ADD_METHODS)[number] | null>(null);
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const timers = useRef<number[]>([]);
  const seq = useRef(0);

  const proto = (label: string) =>
    notify({ title: label, body: "Prototype action — no changes were made.", tone: "info" });

  /* ---- Simulate adding + processing a source ---- */
  const addSource = (method: (typeof ADD_METHODS)[number]) => {
    setAddMethod(null);
    const id = `src-new-${++seq.current}`;
    const now = "15 Aug 2026";
    const draft: SourceItem = {
      id,
      name: `${method.type} (new)`,
      type: method.type,
      origin: method.origin,
      addedBy: "Yashvi",
      date: now,
      status: "processing",
      progress: 4,
      findings: 0,
      questions: 0,
      opportunities: 0,
      included: false,
      needsAttention: false,
      metaLine: "Added just now · prototype simulation",
      original: method.type,
      timeline: [
        { label: "Uploaded", state: "done", at: `${now}, just now` },
        { label: "Parsing", state: "active" },
        { label: "Extract findings", state: "pending" },
        { label: "Ready", state: "pending" },
      ],
      findingsList: [],
      questionsList: [],
      relatedOpportunities: [],
      processStages: [],
    };
    setSources((prev) => [draft, ...prev]);
    notify({
      title: `${method.label} — processing`,
      body: "Simulated intake. Findings extract automatically when it completes.",
      tone: "info",
    });

    // Advance the progress bar, then flip to processed.
    let p = 4;
    const iv = window.setInterval(() => {
      p += 16;
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, progress: Math.min(96, p) } : s))
      );
      if (p >= 96) window.clearInterval(iv);
    }, 500);
    timers.current.push(iv);
    const done = window.setTimeout(() => {
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "processed",
                progress: 100,
                findings: 3,
                questions: 2,
                opportunities: 1,
                needsAttention: true,
                metaLine: "Processed · prototype simulation",
                timeline: [
                  { label: "Uploaded", state: "done", at: `${now}` },
                  { label: "Parsed", state: "done", at: `${now}` },
                  { label: "Findings extracted", state: "done", at: `${now}` },
                  { label: "Awaiting Research brief refresh", state: "active" },
                ],
                findingsList: [
                  "New finding extracted from this source (prototype).",
                  "Questions and the Process Map updated automatically.",
                  "Research brief refresh still required to include it.",
                ],
                questionsList: [
                  "Prototype question generated from this source.",
                  "Prototype follow-up question generated from this source.",
                ],
              }
            : s
        )
      );
      notify({
        title: "Processing complete",
        body: "Questions, Opportunities and the Process Map were updated. Refresh Research to include it in the brief.",
      });
    }, 3400);
    timers.current.push(done);
  };

  /* ---- Simulate a Research brief refresh ---- */
  const runRefresh = () => {
    setRefreshOpen(false);
    setRefreshing(true);
    notify({
      title: "Refreshing Research",
      body: "Folding processed sources into the written brief…",
      tone: "info",
    });
    const done = window.setTimeout(() => {
      setSources((prev) =>
        prev.map((s) =>
          s.status === "processed" && !s.included
            ? { ...s, included: true, needsAttention: false }
            : s
        )
      );
      setRefreshing(false);
      notify({
        title: "Research refreshed",
        body: "Processed sources are now included in the brief.",
      });
    }, 2600);
    timers.current.push(done);
  };

  // Ready = processed but not yet in the brief. Refresh only ever includes these.
  const pending = sources.filter((s) => s.status === "processed" && !s.included);
  const readyCount = pending.length;
  const findingsTotal = sources.reduce((n, s) => n + s.findings, 0);
  const processedCount = sources.filter((s) => s.status === "processed").length;
  const processingCount = sources.filter((s) => s.status === "processing").length;
  const needsAttentionCount = sources.filter((s) => s.needsAttention).length;

  const filterOptions = FILTERS.map((f) =>
    f.id === "processing"
      ? { ...f, label: `Processing ${processingCount}` }
      : f.id === "needs-attention"
      ? { ...f, label: `Needs attention ${needsAttentionCount}` }
      : f
  );

  const [confirmRemove, setConfirmRemove] = useState<SourceItem | null>(null);
  const doRemove = (s: SourceItem) => {
    setSources((prev) => prev.filter((x) => x.id !== s.id));
    if (openId === s.id) setOpenId(null);
    setConfirmRemove(null);
    notify({
      title: "Source removed",
      body: "Prototype — removed from this session only.",
      tone: "info",
    });
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sources.filter((s) => {
      if (q && !`${s.name} ${s.type}`.toLowerCase().includes(q)) return false;
      if (filter === "processing") return s.status === "processing";
      if (filter === "processed") return s.status === "processed";
      if (filter === "needs-attention") return s.needsAttention;
      if (filter === "client") return s.origin === "client";
      return true;
    });
  }, [sources, filter, query]);

  const active = sources.find((s) => s.id === openId) ?? null;

  if (projectId !== "clio-snacks") {
    return (
      <div className="page">
        <PageHeader
          crumbs={[
            { label: "Projects", to: "/projects" },
            { label: project?.name ?? "Project", to: `/projects/${projectId}` },
            { label: "Sources" },
          ]}
          title={<h1 className="page-title">Sources</h1>}
          subtitle={`Sources for ${project?.name ?? "this project"}.`}
        />
        <div className="card card-pad" style={{ textAlign: "center", padding: 48 }}>
          <p className="muted">
            Sources are shown for a project with research in progress. Clio Snacks
            shows the full experience.
          </p>
          <Link className="btn btn-primary btn-sm" to="/projects/clio-snacks/sources" style={{ marginTop: 12 }}>
            Open a completed example
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page src-page">
      <PageHeader
        crumbs={[
          { label: "Projects", to: "/projects" },
          { label: project?.name ?? "Clio Snacks", to: `/projects/${projectId}` },
          { label: "Sources" },
        ]}
        title={<h1 className="page-title">Sources</h1>}
        subtitle="Every input behind the research — transcripts, documents and public context — and how far each has been processed."
      />

      {/* Freshness banner — ready-to-include vs still-processing are separate */}
      {readyCount > 0 ? (
        <div className="src-banner" role="region" aria-label="Research freshness">
          <span className="src-banner__icon" aria-hidden>
            <AlertTriangle />
          </span>
          <div className="src-banner__main">
            <p className="src-banner__title">
              {readyCount} processed source{readyCount === 1 ? " is" : "s are"} ready
              to include in Research.
            </p>
            {processingCount > 0 && (
              <p className="src-banner__sub">
                <Loader aria-hidden /> {processingCount} source
                {processingCount === 1 ? " is" : "s are"} still processing — available
                after processing.
              </p>
            )}
            <p className="src-banner__note">
              <Info aria-hidden /> {AUTOMATION_NOTE}
            </p>
          </div>
          <div className="src-banner__actions">
            <button className="btn btn-sm" onClick={() => setReviewOpen(true)}>
              Review changes
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setRefreshOpen(true)}
              disabled={refreshing}
            >
              <RefreshCw className={refreshing ? "spin" : ""} />
              {refreshing
                ? "Refreshing…"
                : `Refresh with ${readyCount} source${readyCount === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      ) : (
        <div className="src-banner src-banner--ok" role="status">
          <span className="src-banner__icon" aria-hidden>
            <CheckCircle2 />
          </span>
          <div className="src-banner__main">
            <p className="src-banner__title">
              Research brief is up to date — all processed sources are included.
            </p>
            {processingCount > 0 && (
              <p className="src-banner__sub">
                <Loader aria-hidden /> {processingCount} source
                {processingCount === 1 ? " is" : "s are"} still processing — available
                after processing.
              </p>
            )}
            <p className="src-banner__note">
              <Info aria-hidden /> {AUTOMATION_NOTE}
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <section className="card card-pad src-summary">
        <div className="src-sum-grid">
          <SrcStat icon={<FileStack aria-hidden />} value={sources.length} label="Total sources" />
          <SrcStat icon={<CheckCircle2 aria-hidden />} value={processedCount} label="Processed" tone="green" />
          <SrcStat icon={<Loader aria-hidden />} value={processingCount} label="Processing" tone="amber" />
          <SrcStat icon={<FileText aria-hidden />} value={findingsTotal} label="Findings extracted" tone="brand" />
          <div className="src-refreshstat">
            {readyCount === 0 ? (
              <Badge tone="green" dot>Brief up to date</Badge>
            ) : (
              <Badge tone="amber" dot>Research brief needs refresh</Badge>
            )}
          </div>
        </div>
      </section>

      {/* Add source actions */}
      <div className="src-add">
        <span className="src-add__label">Add source</span>
        <div className="src-add__btns">
          {ADD_METHODS.map((m) => (
            <button key={m.id} className="btn btn-sm" onClick={() => setAddMethod(m)}>
              {ADD_ICON[m.icon]} {m.label}
            </button>
          ))}
        </div>
        <span className="src-add__proto">Prototype — intake is simulated</span>
      </div>

      {/* Search + filters */}
      <div className="src-toolbar">
        <div className="src-search">
          <Search aria-hidden />
          <input
            type="search"
            placeholder="Search sources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search sources"
          />
        </div>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          ariaLabel="Filter sources"
          options={filterOptions}
        />
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="card card-pad src-empty">
          <p className="muted">No sources match this filter or search.</p>
        </div>
      ) : (
        <div className="src-list">
          {visible.map((s) => (
            <SourceRow
              key={s.id}
              source={s}
              onOpen={() => setOpenId(s.id)}
              onAction={proto}
              onRemove={() => setConfirmRemove(s)}
            />
          ))}
        </div>
      )}

      {/* Detail drawer */}
      <SourceDetail
        source={active}
        projectId={projectId!}
        onClose={() => setOpenId(null)}
        onAction={proto}
        onRemove={() => active && setConfirmRemove(active)}
      />

      {/* Add source modal (prototype) */}
      <Modal
        open={Boolean(addMethod)}
        onClose={() => setAddMethod(null)}
        title={addMethod?.label ?? "Add source"}
        subtitle="Prototype — intake is simulated, no file leaves your machine"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddMethod(null)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={() => addMethod && addSource(addMethod)}>
              Simulate adding &amp; processing
            </button>
          </>
        }
      >
        <ul className="confirm-list">
          <li>
            <Upload aria-hidden /> A new source will appear as <b>Processing</b> and
            advance to <b>Processed</b>.
          </li>
          <li>
            <CheckCircle2 aria-hidden /> Questions, Opportunities and the Process Map
            update automatically once processing completes.
          </li>
          <li>
            <RefreshCw aria-hidden /> Including it in the written Research brief still
            needs your approval.
          </li>
        </ul>
      </Modal>

      {/* Refresh confirm */}
      <Modal
        open={refreshOpen}
        onClose={() => setRefreshOpen(false)}
        title="Refresh Research brief?"
        subtitle="Fold processed sources into the written brief"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setRefreshOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={runRefresh}>
              <RefreshCw /> Refresh Research
            </button>
          </>
        }
      >
        <ul className="confirm-list">
          <li>
            <FileText aria-hidden /> {pending.length} processed source
            {pending.length === 1 ? "" : "s"} will be added to the brief.
          </li>
          <li>
            <CheckCircle2 aria-hidden /> Questions and Opportunities are already
            current — only the written brief needs refreshing.
          </li>
          <li>
            <Clock3 aria-hidden /> This usually takes about 10–15 minutes (simulated
            here).
          </li>
        </ul>
      </Modal>

      {/* Review changes — approval workflow */}
      <ReviewChangesPanel
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onRefreshBrief={() => {
          setReviewOpen(false);
          setRefreshOpen(true);
        }}
      />

      {/* Remove confirmation */}
      <Modal
        open={Boolean(confirmRemove)}
        onClose={() => setConfirmRemove(null)}
        title="Remove this source?"
        subtitle={confirmRemove?.name}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmRemove(null)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => confirmRemove && doRemove(confirmRemove)}
            >
              <Trash2 /> Remove source
            </button>
          </>
        }
      >
        <ul className="confirm-list">
          <li>
            <Trash2 aria-hidden /> The source is removed from this project's intake.
          </li>
          <li>
            <Info aria-hidden /> Findings already folded into the brief are not
            retroactively removed. Prototype — this session only.
          </li>
        </ul>
      </Modal>
    </div>
  );
}

/* ---------- Summary stat ---------- */
function SrcStat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  tone?: "green" | "amber" | "brand";
}) {
  return (
    <div className="src-stat">
      <span className={`src-stat__icon${tone ? ` src-stat__icon--${tone}` : ""}`}>
        {icon}
      </span>
      <div className="src-stat__body">
        <span className="src-stat__value">{value}</span>
        <span className="src-stat__label">{label}</span>
      </div>
    </div>
  );
}

/* ---------- Collapsible drawer section (keeps status/metadata always open) ---------- */
function CollapsibleSection({
  icon,
  label,
  count,
  defaultOpen = true,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="src-d__section">
      <button
        className="src-d__label src-d__toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="src-d__toggle-l">
          {icon} {label}
          {count != null && <span className="src-d__count">{count}</span>}
        </span>
        <ChevronDown className={`src-d__chev${open ? " is-open" : ""}`} aria-hidden />
      </button>
      {open && children}
    </section>
  );
}

/* ---------- Row ---------- */
function RowMenu({
  onOpen,
  onAction,
  onRemove,
}: {
  onOpen: () => void;
  onAction: (l: string) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div className="menu" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
      >
        <MoreHorizontal />
      </button>
      {open && (
        <div className="menu__pop" role="menu">
          <button role="menuitem" onClick={() => { setOpen(false); onOpen(); }}>
            <FileText /> View details
          </button>
          <button role="menuitem" onClick={() => { setOpen(false); onAction("View original"); }}>
            <ExternalLink /> View original
          </button>
          <button role="menuitem" onClick={() => { setOpen(false); onAction("Re-run processing"); }}>
            <RefreshCw /> Re-run processing
          </button>
          <div className="menu__sep" />
          <button role="menuitem" onClick={() => { setOpen(false); onRemove(); }}>
            <Trash2 /> Remove source
          </button>
        </div>
      )}
    </div>
  );
}

function SourceRow({
  source: s,
  onOpen,
  onAction,
  onRemove,
}: {
  source: SourceItem;
  onOpen: () => void;
  onAction: (l: string) => void;
  onRemove: () => void;
}) {
  const sm = statusMeta[s.status];
  return (
    <article className="src-row" onClick={onOpen}>
      <div className="src-row__main">
        <span className={`src-row__icon origin-${s.origin}`} aria-hidden>
          <FileText />
        </span>
        <div className="src-row__id">
          <div className="src-row__title">
            <button className="src-row__name" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
              {s.name}
            </button>
            <OriginBadge origin={s.origin} />
            {s.needsAttention && <Badge tone="amber" dot>Needs attention</Badge>}
          </div>
          <div className="src-row__type">
            {s.type} · {s.metaLine}
          </div>
          <div className="src-row__by">
            Added by {s.addedBy} · {s.date}
          </div>
        </div>
      </div>

      <div className="src-row__status">
        <Badge tone={sm.tone} dot pulse={s.status === "processing"}>
          {sm.label}
        </Badge>
        {s.status === "processing" && (
          <div className="src-progress" aria-label={`Processing ${s.progress}%`}>
            <div className="src-progress__bar" style={{ width: `${s.progress}%` }} />
            <span className="src-progress__pct">{s.progress}%</span>
          </div>
        )}
      </div>

      <div className="src-row__counts">
        <span title="Findings">
          <FileText aria-hidden /> {s.findings}
        </span>
        <span title="Questions">
          <HelpCircle aria-hidden /> {s.questions}
        </span>
        <span title="Opportunities">
          <Target aria-hidden /> {s.opportunities}
        </span>
      </div>

      <div className="src-row__incl">
        {s.status === "processing" ? (
          <span className="src-incl src-incl--wait">Available after processing</span>
        ) : s.included ? (
          <span className="src-incl src-incl--in">
            <CheckCircle2 aria-hidden /> In brief
          </span>
        ) : (
          <span className="src-incl src-incl--out">
            <Circle aria-hidden /> Not in brief
          </span>
        )}
      </div>

      <RowMenu onOpen={onOpen} onAction={onAction} onRemove={onRemove} />
    </article>
  );
}

/* ---------- Detail drawer ---------- */
function SourceDetail({
  source: s,
  projectId,
  onClose,
  onAction,
  onRemove,
}: {
  source: SourceItem | null;
  projectId: string;
  onClose: () => void;
  onAction: (l: string) => void;
  onRemove: () => void;
}) {
  const footer = s ? (
    <div className="src-d__foot">
      <button className="btn btn-sm" onClick={() => onAction("View original")}>
        <ExternalLink /> View original
      </button>
      <button className="btn btn-sm btn-danger" onClick={onRemove}>
        <Trash2 /> Remove source
      </button>
    </div>
  ) : undefined;

  return (
    <SidePanel
      open={Boolean(s)}
      onClose={onClose}
      title={s?.name ?? "Source"}
      subtitle={s ? s.type : "Source detail"}
      footer={footer}
    >
      {s && (
        <div className="src-d" key={s.id}>
          <div className="src-d__badges">
            <OriginBadge origin={s.origin} />
            <Badge tone={statusMeta[s.status].tone} dot pulse={s.status === "processing"}>
              {statusMeta[s.status].label}
            </Badge>
            {s.status === "processing" ? (
              <Badge tone="neutral">Available after processing</Badge>
            ) : s.included ? (
              <Badge tone="green" dot>Included in Research</Badge>
            ) : (
              <Badge tone="amber" dot>Not included in Research</Badge>
            )}
          </div>

          {/* Processing timeline */}
          <section className="src-d__section">
            <h3 className="src-d__label">
              <Clock3 aria-hidden /> Processing timeline
            </h3>
            <ol className="src-timeline">
              {s.timeline.map((t, i) => (
                <li key={i} className={`src-tl src-tl--${t.state}`}>
                  <span className="src-tl__dot" aria-hidden>
                    {t.state === "done" ? (
                      <CheckCircle2 />
                    ) : t.state === "active" ? (
                      <Loader className="spin" />
                    ) : (
                      <Circle />
                    )}
                  </span>
                  <div className="src-tl__body">
                    <span className="src-tl__label">{t.label}</span>
                    {t.at && <span className="src-tl__at">{t.at}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Metadata */}
          <section className="src-d__section">
            <h3 className="src-d__label">
              <Info aria-hidden /> Source metadata
            </h3>
            <dl className="src-meta">
              <div><dt>Type</dt><dd>{s.type}</dd></div>
              <div><dt>Origin</dt><dd>{originMeta[s.origin].label}</dd></div>
              <div><dt>Added by</dt><dd>{s.addedBy}</dd></div>
              <div><dt>Added</dt><dd>{s.date}</dd></div>
              <div><dt>Source</dt><dd>{s.metaLine}</dd></div>
            </dl>
          </section>

          {/* Findings — collapsible */}
          {s.findingsList.length > 0 ? (
            <CollapsibleSection
              icon={<FileText aria-hidden />}
              label="Extracted findings"
              count={s.findings}
            >
              <ul className="src-d__list">
                {s.findingsList.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </CollapsibleSection>
          ) : (
            <section className="src-d__section">
              <h3 className="src-d__label">
                <FileText aria-hidden /> Extracted findings
              </h3>
              <p className="src-d__muted">
                Findings extract automatically once processing completes.
              </p>
            </section>
          )}

          {/* Questions — collapsible */}
          {s.questionsList.length > 0 && (
            <CollapsibleSection
              icon={<HelpCircle aria-hidden />}
              label="Generated questions"
              count={s.questions}
            >
              <ul className="src-qa">
                {s.questionsList.map((q) => (
                  <li key={q}>
                    <Circle className="src-qa__ic" aria-hidden /> {q}
                  </li>
                ))}
              </ul>
              <Link
                to={`/projects/${projectId}/discovery`}
                className="src-d__link"
                onClick={onClose}
              >
                Open Discovery Questions <ExternalLink aria-hidden />
              </Link>
            </CollapsibleSection>
          )}

          {/* Opportunities + process stages — collapsible */}
          {(s.relatedOpportunities.length > 0 || s.processStages.length > 0) && (
            <CollapsibleSection
              icon={<Target aria-hidden />}
              label="Related opportunities & stages"
            >
              {s.relatedOpportunities.length > 0 && (
                <div className="src-chips">
                  {s.relatedOpportunities.map((o) => (
                    <Link
                      key={o}
                      to={`/projects/${projectId}/opportunities`}
                      className="src-chip src-chip--link"
                      onClick={onClose}
                    >
                      <Target aria-hidden /> {o}
                    </Link>
                  ))}
                </div>
              )}
              {s.processStages.length > 0 && (
                <div className="src-chips" style={{ marginTop: 8 }}>
                  {s.processStages.map((p) => (
                    <Link
                      key={p}
                      to={`/projects/${projectId}/process-map`}
                      className="src-chip src-chip--link"
                      onClick={onClose}
                    >
                      <Layers aria-hidden /> {p}
                    </Link>
                  ))}
                </div>
              )}
            </CollapsibleSection>
          )}
        </div>
      )}
    </SidePanel>
  );
}
