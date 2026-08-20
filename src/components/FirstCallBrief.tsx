import { useCallback, useEffect, useRef, useState } from "react";
import {
  Clock,
  Building2,
  Cpu,
  UserSquare,
  FlaskConical,
  Boxes,
  MessageSquareText,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Globe,
  BarChart3,
  Sparkles,
  Target,
} from "lucide-react";
import { SidePanel } from "./SidePanel";
import { Badge } from "./Badge";
import { FocusChip } from "./FocusChip";
import {
  OperateToday,
  StageDetailBody,
  BrokenDetailBody,
  OpflowDetailLinks,
  flowStageName,
} from "./OperateToday";
import { SimilarWork, SimilarWorkDetailBody } from "./SimilarWork";
import { evidenceMeta } from "../lib/status";
import { confLabel, confTone } from "../data/discovery";
import { useFocus } from "../hooks/useFocus";
import { scoreDomains, HYPOTHESIS_DOMAINS } from "../data/focus";
import {
  businessContext,
  businessContextNote,
  techSignals,
  stakeholderLens,
  hypotheses,
  HYPOTHESIS_LABEL,
  vendors,
  otherVendors,
  otherVendorsWarning,
  vendorCategoryLabel,
  conversationStarters,
  desiredOutcome,
  sourceKindLabel,
  type BriefDetail,
  type BriefSource,
} from "../data/firstcall";
import type { ProcessArea } from "../data/processmap";
import type { HeizenProject } from "../data/heizenWork";

/* A normalised, inspector-ready view of a clickable brief item. */
interface DrawerItem extends BriefDetail {
  title: string;
  kindLabel: string;
  lead?: string;
  chips?: { label: string; tone?: "amber" | "info" | "neutral" | "accent" }[];
}

/** Everything the brief's single in-panel inspector can show. Exactly one
    of these is open at a time — never a second drawer on top. */
export type BriefInspectorDetail =
  | { kind: "item"; item: DrawerItem }
  | { kind: "stage"; area: ProcessArea }
  | { kind: "broken" }
  | { kind: "work"; project: HeizenProject };

const sourceIcon: Record<BriefSource["kind"], typeof FileText> = {
  client: FileText,
  public: Globe,
  market: BarChart3,
};

/* ------------------------------------------------------------------ */
export function FirstCallBrief({
  projectId,
  onOpenDetail,
}: {
  projectId: string;
  onOpenDetail: (detail: BriefInspectorDetail) => void;
}) {
  const { focus } = useFocus(projectId);

  // Focus re-orders hypotheses by relevance (stable; nothing removed).
  const rankedHypotheses = [...hypotheses]
    .map((h, i) => ({ h, i }))
    .sort(
      (a, b) =>
        scoreDomains(HYPOTHESIS_DOMAINS[b.h.id] ?? [], focus) -
          scoreDomains(HYPOTHESIS_DOMAINS[a.h.id] ?? [], focus) || a.i - b.i
    )
    .map((x) => x.h);

  const openItem = (item: DrawerItem) => onOpenDetail({ kind: "item", item });

  return (
    <div className="fcb">
      <FocusChip projectId={projectId} />
      <header className="fcb__head">
        <span className="fcb__badge">
          <Clock aria-hidden /> 15-minute first-call brief
        </span>
        <p className="fcb__lead">
          The last-fifteen-minutes read before the introductory call with{" "}
          <b>{stakeholderLens.name}</b>. Estimates are labelled — treat signals
          and hypotheses as prompts to test, not facts.
        </p>
      </header>

      {/* 1 · Business context ---------------------------------------- */}
      <section className="fcb-sec">
        <SecHead icon={Building2} n={1} title="Business context" />
        <div className="fcb-facts">
          {businessContext.map((f) => (
            <div className="fcb-fact" key={f.label}>
              <span className="fcb-fact__k">{f.label}</span>
              <span className="fcb-fact__v">{f.value}</span>
              {f.note && <span className="fcb-fact__note">{f.note}</span>}
            </div>
          ))}
        </div>
        <p className="fcb-sec__note">{businessContextNote}</p>
      </section>

      {/* 2 · Technology & AI signals --------------------------------- */}
      <section className="fcb-sec">
        <SecHead
          icon={Cpu}
          n={2}
          title="Technology & AI initiatives"
          sub="Three source-backed spend and initiative signals. Click any for detail."
        />
        <div className="fcb-cards">
          {techSignals.map((s) => {
            const ev = evidenceMeta[s.evidence];
            return (
              <button
                key={s.id}
                className="fcb-item"
                onClick={() =>
                  openItem({
                    title: s.title,
                    kindLabel: "Technology / AI signal",
                    lead: s.signal,
                    chips: [{ label: s.tag, tone: "info" }],
                    detail: s.detail,
                    evidence: s.evidence,
                    confidence: s.confidence,
                    sources: s.sources,
                    heizen: s.heizen,
                    questions: s.questions,
                  })
                }
              >
                <div className="fcb-item__main">
                  <div className="fcb-item__top">
                    <span className="fcb-tag">{s.tag}</span>
                    <Badge tone={confTone[s.confidence]} dot>
                      {confLabel[s.confidence]} confidence
                    </Badge>
                  </div>
                  <h4 className="fcb-item__title">{s.title}</h4>
                  <p className="fcb-item__sig">{s.signal}</p>
                  <span className="fcb-item__evi">{ev.label}</span>
                </div>
                <ChevronRight className="fcb-item__chev" aria-hidden />
              </button>
            );
          })}
        </div>
      </section>

      {/* 3 · Stakeholder lens ---------------------------------------- */}
      <section className="fcb-sec">
        <SecHead
          icon={UserSquare}
          n={3}
          title={`Stakeholder lens — ${stakeholderLens.name}`}
          sub={`${stakeholderLens.title} · primary stakeholder for this call`}
        />
        <p className="fcb-sec__note fcb-sec__note--lead">{stakeholderLens.summary}</p>
        <div className="fcb-lens">
          <LensCol title="Responsibilities" items={stakeholderLens.responsibilities} />
          <LensCol title="Relevant domains" items={stakeholderLens.domains} />
          <LensCol title="Likely conversation areas" items={stakeholderLens.conversationAreas} />
        </div>
      </section>

      {/* 4 · How they operate today (current value chain, as-is) ----- */}
      <OperateToday projectId={projectId} onOpenDetail={onOpenDetail} />

      {/* 5 · Unvalidated hypotheses ---------------------------------- */}
      <section className="fcb-sec">
        <SecHead
          icon={FlaskConical}
          n={5}
          title="Hypotheses to test"
          sub="Five unvalidated hypotheses, ranked by relevance to this stakeholder."
        />
        <div className="fcb-hyps">
          {rankedHypotheses.map((h) => (
            <button
              key={h.id}
              className="fcb-item fcb-hyp"
              onClick={() =>
                openItem({
                  title: h.statement,
                  kindLabel: "Unvalidated hypothesis",
                  lead: h.relevance,
                  chips: [
                    { label: HYPOTHESIS_LABEL, tone: "amber" },
                    {
                      label:
                        h.relevanceTone === "high"
                          ? "High stakeholder relevance"
                          : "Medium relevance",
                      tone: h.relevanceTone === "high" ? "accent" : "neutral",
                    },
                  ],
                  detail: h.detail,
                  evidence: h.evidence,
                  confidence: h.confidence,
                  sources: h.sources,
                  heizen: h.heizen,
                  questions: h.questions,
                })
              }
            >
              <span className="fcb-hyp__rank">{h.rank}</span>
              <div className="fcb-item__main">
                <p className="fcb-hyp__stmt">{h.statement}</p>
                <div className="fcb-hyp__meta">
                  <span className="fcb-flag">
                    <AlertTriangle aria-hidden /> {HYPOTHESIS_LABEL}
                  </span>
                  <span className="dotsep">·</span>
                  <span className="fcb-hyp__rel">{h.relevance}</span>
                </div>
              </div>
              <ChevronRight className="fcb-item__chev" aria-hidden />
            </button>
          ))}
        </div>
      </section>

      {/* 5 · Tech stack ---------------------------------------------- */}
      <section className="fcb-sec">
        <SecHead
          icon={Boxes}
          n={6}
          title="Tech stack"
          sub="Technology and supply-chain vendors we can speak to."
        />
        <div className="fcb-vendors">
          {vendors.map((v) => (
            <div className="fcb-vendor" key={v.name}>
              <div className="fcb-vendor__top">
                <span className="fcb-vendor__name">{v.name}</span>
                <span className="fcb-vendor__cat">{vendorCategoryLabel[v.category]}</span>
              </div>
              <p className="fcb-vendor__role">{v.role}</p>
              <p className="fcb-vendor__heizen">
                <Sparkles aria-hidden /> {v.heizen}
              </p>
            </div>
          ))}
        </div>

        <details className="fcb-other">
          <summary>
            <AlertTriangle aria-hidden /> Other vendors ({otherVendors.length}) — not relevant to this
            conversation
          </summary>
          <p className="fcb-other__warn">{otherVendorsWarning}</p>
          <div className="fcb-other__list">
            {otherVendors.map((v) => (
              <div className="fcb-other__item" key={v.name}>
                <span className="fcb-other__name">{v.name}</span>
                <span className="fcb-other__role">
                  {vendorCategoryLabel[v.category]} · {v.role}
                </span>
              </div>
            ))}
          </div>
        </details>
      </section>

      {/* 6 · Similar Heizen work ------------------------------------- */}
      <section className="fcb-sec">
        <SecHead
          icon={Sparkles}
          n={7}
          title="Similar Heizen work"
          sub="Delivered, safe-to-mention proof. Click any for overlap detail."
        />
        <SimilarWork
          projectId={projectId}
          introOnly
          onOpenDetail={(project) => onOpenDetail({ kind: "work", project })}
        />
      </section>

      {/* 7 · Conversation starters & outcome ------------------------- */}
      <section className="fcb-sec">
        <SecHead icon={MessageSquareText} n={8} title="How to open — and where to land" />
        <div className="fcb-open">
          <div className="fcb-starters">
            <span className="fcb-open__label">Three conversation starters</span>
            <ol className="fcb-starters__list">
              {conversationStarters.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ol>
          </div>
          <div className="fcb-outcome">
            <span className="fcb-open__label">
              <Target aria-hidden /> Desired call outcome
            </span>
            <p className="fcb-outcome__text">{desiredOutcome}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---- small building blocks --------------------------------------- */
function SecHead({
  icon: Icon,
  n,
  title,
  sub,
}: {
  icon: typeof Cpu;
  n: number;
  title: string;
  sub?: string;
}) {
  return (
    <div className="fcb-sec__head">
      <span className="fcb-sec__num" aria-hidden>
        <Icon />
      </span>
      <div>
        <h3 className="fcb-sec__title">
          <span className="fcb-sec__n">{n}.</span> {title}
        </h3>
        {sub && <p className="fcb-sec__sub">{sub}</p>}
      </div>
    </div>
  );
}

function LensCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="fcb-lenscol">
      <span className="fcb-lenscol__title">{title}</span>
      <ul className="fcb-lenscol__list">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

/* ---- signal / hypothesis detail (shared by both kinds) ------------ */
function BriefItemDetail({ item }: { item: DrawerItem }) {
  const ev = evidenceMeta[item.evidence];
  return (
    <div className="fcb-d">
      {item.chips && item.chips.length > 0 && (
        <div className="fcb-d__chips">
          {item.chips.map((c) => (
            <Badge key={c.label} tone={c.tone ?? "neutral"}>
              {c.label}
            </Badge>
          ))}
        </div>
      )}

      <div className="fcb-d__conf">
        <div className="fcb-d__confitem">
          <span className="fcb-d__k">Confidence</span>
          <Badge tone={confTone[item.confidence]} dot>
            {confLabel[item.confidence]}
          </Badge>
        </div>
        <div className="fcb-d__confitem">
          <span className="fcb-d__k">Evidence</span>
          <Badge tone={ev.tone as never}>{ev.label}</Badge>
        </div>
      </div>

      <p className="fcb-d__detail">{item.detail}</p>

      <section className="fcb-d__sec">
        <h4 className="fcb-d__h">Sources</h4>
        <div className="fcb-d__sources">
          {item.sources.map((s) => {
            const SIcon = sourceIcon[s.kind];
            return (
              <div className="fcb-d__source" key={s.label}>
                <span className="fcb-d__source-icon" aria-hidden>
                  <SIcon />
                </span>
                <div>
                  <div className="fcb-d__source-top">
                    <span className="fcb-d__source-name">{s.label}</span>
                    <span className="fcb-d__source-kind">{sourceKindLabel[s.kind]}</span>
                  </div>
                  <p className="fcb-d__source-excerpt">"{s.excerpt}"</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="fcb-d__sec">
        <h4 className="fcb-d__h">
          <Sparkles aria-hidden /> Related Heizen work
        </h4>
        <div className="fcb-d__heizen">
          {item.heizen.map((h) => (
            <div className="fcb-d__href" key={h.label}>
              <span className="fcb-d__href-name">{h.label}</span>
              <span className="fcb-d__href-rel">{h.relevance}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fcb-d__sec">
        <h4 className="fcb-d__h">Suggested questions</h4>
        <ul className="fcb-d__qs">
          {item.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---- workspace plumbing ------------------------------------------- */

/** Below this width the inspector replaces the brief instead of docking
    beside it. Must match the breakpoint in firstcall.css. */
const COMPACT_QUERY = "(max-width: 1099px)";

function useCompactBrief() {
  const [compact, setCompact] = useState(
    () => window.matchMedia(COMPACT_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return compact;
}

function inspectorHeader(d: BriefInspectorDetail): { title: string; subtitle: string } {
  switch (d.kind) {
    case "item":
      return { title: d.item.title, subtitle: d.item.kindLabel };
    case "stage":
      return { title: flowStageName(d.area), subtitle: "Current process — as is" };
    case "broken":
      return { title: "Make → Store", subtitle: "Broken handoff" };
    case "work":
      return { title: d.project.name, subtitle: d.project.industry };
  }
}

/* A stable identity per selection, so switching remounts the inspector
   (fresh scroll, focus back to its heading). */
const detailKey = (d: BriefInspectorDetail) =>
  d.kind === "item"
    ? `item:${d.item.title}`
    : d.kind === "stage"
    ? `stage:${d.area.id}`
    : d.kind === "work"
    ? `work:${d.project.id}`
    : "broken";

/**
 * Compact stand-in for the brief on the Overview: who the call is with, what
 * it should achieve, and the top conversation areas — with the complete
 * eight-section brief one click away in a wide side panel.
 *
 * The panel is a single dialog. Clicking a signal, hypothesis, process stage
 * or similar-work item opens an inspector INSIDE it — docked right of the
 * brief on desktop, replacing the brief (with "Back to brief") below 1100px.
 * One overlay, one focus trap, at most one inspector at a time.
 */
export function FirstCallBriefPreview({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<BriefInspectorDetail | null>(null);
  const compact = useCompactBrief();

  const briefPaneRef = useRef<HTMLDivElement>(null);
  const detailTitleRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const briefScroll = useRef(0);
  const hadDetail = useRef(false);

  const openDetail = (d: BriefInspectorDetail) => {
    // Capture the brief's scroll position while the pane is still visible —
    // hiding it (compact replace-mode) resets scrollTop to 0.
    const pane = briefPaneRef.current;
    if (pane && pane.offsetParent !== null) briefScroll.current = pane.scrollTop;
    const el = document.activeElement;
    triggerRef.current = el instanceof HTMLElement && el !== document.body ? el : null;
    setDetail(d);
  };
  const closeDetail = () => setDetail(null);
  /* Stable identity: SidePanel re-runs its focus/key effect when onClose
     changes, which would steal focus every time the inspector opens. */
  const closeAll = useCallback(() => {
    setOpen(false);
    setDetail(null);
  }, []);

  /* Escape closes the inspector first; only with no inspector open does it
     reach SidePanel and close the whole panel. Capture phase, so it runs
     before SidePanel's bubble-phase document listener. */
  useEffect(() => {
    if (!open || !detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setDetail(null);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, detail]);

  /* Move focus into the inspector when it opens or switches; when it closes,
     restore the brief's scroll position (compact mode replaced the pane) and
     hand focus back to the element that opened it. */
  useEffect(() => {
    const had = hadDetail.current;
    hadDetail.current = !!detail;
    if (!open) return;
    let raf = 0;
    if (detail) {
      raf = requestAnimationFrame(() => detailTitleRef.current?.focus());
    } else if (had) {
      raf = requestAnimationFrame(() => {
        // Focus first, restore scroll last — refocusing the trigger can
        // scroll it into view, which must not override the saved position.
        triggerRef.current?.focus({ preventScroll: true });
        if (compact) briefPaneRef.current?.scrollTo({ top: briefScroll.current });
      });
    }
    return () => cancelAnimationFrame(raf);
  }, [detail, open, compact]);

  /* Coming back from compact replace-mode to the two-pane layout, the brief
     pane re-appears at scroll 0 — put it back where it was. */
  useEffect(() => {
    if (!compact && detail) {
      briefPaneRef.current?.scrollTo({ top: briefScroll.current });
    }
  }, [compact, detail]);

  const header = detail ? inspectorHeader(detail) : null;

  return (
    <>
      <section className="card card-pad fcbp" aria-labelledby="fcbp-title">
        <div className="section-head">
          <div>
            <h2 className="block-title" id="fcbp-title">
              15-minute first-call brief
            </h2>
            <p className="block-sub">
              The essentials for the introductory call — open the full brief for
              context, hypotheses, tech stack and how to open.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              briefScroll.current = 0;
              setOpen(true);
            }}
          >
            Open full brief
            <ChevronRight aria-hidden />
          </button>
        </div>

        <dl className="fcbp__grid">
          <div className="fcbp__cell">
            <dt>Stakeholder</dt>
            <dd>
              {stakeholderLens.name}
              <span className="fcbp__sub">{stakeholderLens.title}</span>
            </dd>
          </div>
          <div className="fcbp__cell">
            <dt>Meeting goal</dt>
            <dd>{desiredOutcome}</dd>
          </div>
          <div className="fcbp__cell">
            <dt>Top conversation areas</dt>
            <dd>
              <ol className="fcbp__areas">
                {stakeholderLens.conversationAreas.slice(0, 3).map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
            </dd>
          </div>
        </dl>
      </section>

      <SidePanel
        wide
        flush
        open={open}
        onClose={closeAll}
        title="15-minute first-call brief"
        subtitle={`Introductory call with ${stakeholderLens.name}, ${stakeholderLens.title}`}
        panelClassName={detail ? "drawer--has-detail" : undefined}
        headerStart={
          compact && detail ? (
            <button className="btn btn-sm fcbw__back" onClick={closeDetail}>
              <ArrowLeft aria-hidden /> Back to brief
            </button>
          ) : undefined
        }
      >
        <div className={`fcbw${detail ? " fcbw--detail" : ""}`}>
          <div className="fcbw__brief" ref={briefPaneRef}>
            <FirstCallBrief projectId={projectId} onOpenDetail={openDetail} />
          </div>

          {detail && header && (
            <aside
              key={detailKey(detail)}
              className="fcbw__detail"
              role="region"
              aria-label={`${header.title} — detail`}
            >
              <header className="fcbw__detail-head">
                <div className="fcbw__detail-titles">
                  <h3 className="fcbw__detail-title" tabIndex={-1} ref={detailTitleRef}>
                    {header.title}
                  </h3>
                  <p className="fcbw__detail-sub">{header.subtitle}</p>
                </div>
                <button className="btn btn-sm fcbw__detail-close" onClick={closeDetail}>
                  Close detail
                </button>
              </header>

              <div className="fcbw__detail-body">
                {detail.kind === "item" && <BriefItemDetail item={detail.item} />}
                {detail.kind === "stage" && <StageDetailBody area={detail.area} />}
                {detail.kind === "broken" && <BrokenDetailBody />}
                {detail.kind === "work" && <SimilarWorkDetailBody project={detail.project} />}
              </div>

              {(detail.kind === "stage" || detail.kind === "broken") && (
                <div className="fcbw__detail-foot">
                  <OpflowDetailLinks projectId={projectId} onNavigate={closeAll} />
                </div>
              )}
            </aside>
          )}
        </div>
      </SidePanel>
    </>
  );
}
