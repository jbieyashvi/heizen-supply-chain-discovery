import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Eye,
  Target,
  Link2,
  FileStack,
  Globe,
  Lock,
  AlertTriangle,
  Loader,
  Ban,
} from "lucide-react";
import type {
  ResearchData,
  Finding,
  Source,
} from "../../data/research";
import type { EvidenceLevel } from "../../data/types";
import { Badge } from "../Badge";
import { EvidenceBadge } from "../StatusBadges";
import { evidenceMeta, confidenceLevelMeta } from "../../lib/status";
import type { EvidenceView } from "./EvidencePanel";

type EvFilter = EvidenceLevel | "all";
type ConfFilter = "all" | "high" | "medium" | "low";

const EVIDENCE_KEYS: EvidenceLevel[] = [
  "client-confirmed",
  "client-document",
  "public-inference",
  "market-benchmark",
  "unverified",
];

/* ---------- Finding ---------- */
function FindingRow({
  f,
  projectId,
  onEvidence,
}: {
  f: Finding;
  projectId: string;
  onEvidence: (v: EvidenceView) => void;
}) {
  const conf = confidenceLevelMeta[f.confidence];
  return (
    <div className="finding">
      <button
        className="finding__main"
        onClick={() =>
          onEvidence({ title: f.finding, evidence: f.evidence, detail: f.detail })
        }
      >
        <span className="finding__text">{f.finding}</span>
        <Eye className="finding__eye" aria-hidden />
      </button>
      <p className="finding__why">{f.whyItMatters}</p>
      <div className="finding__meta">
        <EvidenceBadge level={f.evidence} />
        <Badge tone={conf.tone} dot>
          {conf.label}
        </Badge>
        <span className="finding__chip">
          <FileStack aria-hidden /> {f.sourceCount}{" "}
          {f.sourceCount === 1 ? "source" : "sources"}
        </span>
        {f.relatedOpportunity && (
          <span className="finding__chip">
            <Target aria-hidden /> {f.relatedOpportunity}
          </span>
        )}
        {f.relatedQuestion && (
          <Link
            to={`/projects/${projectId}/discovery`}
            className="finding__chip finding__chip--link"
          >
            <Link2 aria-hidden /> Discovery question
          </Link>
        )}
        <span className="finding__updated">Updated {f.lastUpdated}</span>
      </div>
    </div>
  );
}

/* ---------- Source ledger ---------- */
type LedgerFilter =
  | "all"
  | "client"
  | "public"
  | "included"
  | "pending"
  | "no-signals"
  | "failed";

const LEDGER_FILTERS: { id: LedgerFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "client", label: "Client-provided" },
  { id: "public", label: "Public" },
  { id: "included", label: "Included" },
  { id: "pending", label: "Pending refresh" },
  { id: "no-signals", label: "No useful signals" },
  { id: "failed", label: "Failed / skipped" },
];

function matchLedger(s: Source, f: LedgerFilter): boolean {
  switch (f) {
    case "all":
      return true;
    case "client":
      return s.visibility === "client";
    case "public":
      return s.visibility === "public";
    case "included":
      return s.included;
    case "pending":
      return s.pending;
    case "no-signals":
      return s.signals === 0;
    case "failed":
      return s.state === "failed";
  }
}

function SourceLedger({ sources }: { sources: Source[] }) {
  const [filter, setFilter] = useState<LedgerFilter>("all");
  const [query, setQuery] = useState("");
  const [showQuiet, setShowQuiet] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sources.filter((s) => {
      if (!matchLedger(s, filter)) return false;
      if (!showQuiet && filter !== "no-signals" && s.signals === 0) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.domainOrFile.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      );
    });
  }, [sources, filter, query, showQuiet]);

  const quietCount = sources.filter((s) => s.signals === 0).length;

  return (
    <section id="ledger" className="ledger">
      <header className="brief-head ledger__head">
        <div>
          <h3 className="brief-title">Source ledger</h3>
          <p className="brief-sub">
            Every source considered. Sources with no useful signals are hidden by
            default.
          </p>
        </div>
      </header>

      <div className="ledger__toolbar">
        <div className="searchbox searchbox--sm">
          <Search aria-hidden />
          <input
            type="search"
            placeholder="Search sources"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search sources"
          />
        </div>
        <div className="filter-chips">
          {LEDGER_FILTERS.map((f) => (
            <button
              key={f.id}
              className={`chip${filter === f.id ? " is-active" : ""}`}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="ledger__list">
        {visible.map((s) => (
          <li key={s.id} className={`ledger__row${s.signals === 0 ? " is-quiet" : ""}`}>
            <span className="ledger__vis" aria-hidden>
              {s.visibility === "client" ? <Lock /> : <Globe />}
            </span>
            <div className="ledger__id">
              <span className="ledger__title">{s.title}</span>
              <span className="ledger__file">
                {s.type} · {s.domainOrFile}
              </span>
            </div>
            <span className="ledger__signals">
              {s.signals > 0 ? `${s.signals} signals` : "No signals"}
            </span>
            <span className="ledger__state">
              {s.state === "failed" ? (
                <Badge tone="neutral" icon={<Ban aria-hidden />}>
                  Failed
                </Badge>
              ) : s.state === "processing" ? (
                <Badge tone="info" dot pulse icon={<Loader aria-hidden />}>
                  Processing
                </Badge>
              ) : s.pending ? (
                <Badge tone="amber" dot>
                  Pending refresh
                </Badge>
              ) : s.included ? (
                <Badge tone="green" dot>
                  Included
                </Badge>
              ) : (
                <Badge tone="neutral">Not included</Badge>
              )}
            </span>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="ledger__empty">No sources match this filter.</li>
        )}
      </ul>

      {quietCount > 0 && filter !== "no-signals" && (
        <button
          className="link-btn ledger__quiet-toggle"
          onClick={() => setShowQuiet((v) => !v)}
        >
          {showQuiet ? "Hide" : "Show"} {quietCount} source
          {quietCount === 1 ? "" : "s"} with no useful signals
        </button>
      )}
    </section>
  );
}

/* ---------- Full research ---------- */
export function ResearchFull({
  data,
  projectId,
  openEvidence,
}: {
  data: ResearchData;
  projectId: string;
  openEvidence: (v: EvidenceView) => void;
  refreshed: boolean;
}) {
  const [query, setQuery] = useState("");
  const [evFilter, setEvFilter] = useState<EvFilter>("all");
  const [confFilter, setConfFilter] = useState<ConfFilter>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtering = Boolean(query.trim()) || evFilter !== "all" || confFilter !== "all";

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.full
      .map((sec) => ({
        ...sec,
        findings: sec.findings.filter((f) => {
          if (evFilter !== "all" && f.evidence !== evFilter) return false;
          if (confFilter !== "all" && f.confidence !== confFilter) return false;
          if (!q) return true;
          return (
            f.finding.toLowerCase().includes(q) ||
            f.whyItMatters.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((sec) => sec.findings.length > 0 || !filtering);
  }, [data.full, query, evFilter, confFilter, filtering]);

  const totalMatches = filteredSections.reduce(
    (n, s) => n + s.findings.length,
    0
  );

  const setAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    data.full.forEach((s) => (next[s.id] = value));
    setCollapsed(next);
  };

  return (
    <div className="full">
      <div className="full__toolbar">
        <div className="searchbox">
          <Search aria-hidden />
          <input
            type="search"
            placeholder="Search within research"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search within research"
          />
        </div>

        <div className="full__filter">
          <label htmlFor="ev-filter" className="sr-only">
            Filter by evidence type
          </label>
          <select
            id="ev-filter"
            value={evFilter}
            onChange={(e) => setEvFilter(e.target.value as EvFilter)}
          >
            <option value="all">All evidence</option>
            {EVIDENCE_KEYS.map((k) => (
              <option key={k} value={k}>
                {evidenceMeta[k].label}
              </option>
            ))}
          </select>
        </div>

        <div className="full__filter">
          <label htmlFor="conf-filter" className="sr-only">
            Filter by confidence
          </label>
          <select
            id="conf-filter"
            value={confFilter}
            onChange={(e) => setConfFilter(e.target.value as ConfFilter)}
          >
            <option value="all">All confidence</option>
            <option value="high">High confidence</option>
            <option value="medium">Medium confidence</option>
            <option value="low">Low confidence</option>
          </select>
        </div>

        <div className="full__expand">
          <button className="btn btn-sm btn-ghost" onClick={() => setAll(false)}>
            <ChevronsUpDown /> Expand all
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => setAll(true)}>
            <ChevronsDownUp /> Collapse all
          </button>
        </div>
      </div>

      {filtering && (
        <p className="full__count" role="status">
          {totalMatches} finding{totalMatches === 1 ? "" : "s"} match
          {query.trim() ? ` “${query.trim()}”` : ""}
          {(evFilter !== "all" || confFilter !== "all") && " with current filters"}.
          <button
            className="link-btn"
            onClick={() => {
              setQuery("");
              setEvFilter("all");
              setConfFilter("all");
            }}
          >
            Clear
          </button>
        </p>
      )}

      <div className="full__sections">
        {filteredSections.map((sec) => {
          const isCollapsed = collapsed[sec.id] && !filtering;
          return (
            <section key={sec.id} id={`full-${sec.id}`} className="fsection card">
              <button
                className="fsection__head"
                aria-expanded={!isCollapsed}
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [sec.id]: !c[sec.id] }))
                }
              >
                <div className="fsection__id">
                  <h3 className="fsection__title">{sec.title}</h3>
                  <span className="fsection__summary">{sec.summary}</span>
                </div>
                <span className="fsection__meta">
                  {sec.findings.length}{" "}
                  {sec.findings.length === 1 ? "finding" : "findings"}
                  <ChevronDown
                    className={`fsection__chev${isCollapsed ? "" : " is-open"}`}
                    aria-hidden
                  />
                </span>
              </button>
              {!isCollapsed && (
                <div className="fsection__body">
                  {sec.findings.length === 0 ? (
                    <p className="fsection__empty">
                      No findings in this section match the current filters.
                    </p>
                  ) : (
                    sec.findings.map((f) => (
                      <FindingRow
                        key={f.id}
                        f={f}
                        projectId={projectId}
                        onEvidence={openEvidence}
                      />
                    ))
                  )}
                </div>
              )}
            </section>
          );
        })}

        {filtering && totalMatches === 0 && (
          <div className="full__noresults">
            <AlertTriangle aria-hidden />
            No findings match. Try a different search or clear the filters.
          </div>
        )}
      </div>

      <SourceLedger sources={data.sources} />
    </div>
  );
}
