import { useState } from "react";
import {
  Clock,
  Building2,
  Cpu,
  UserSquare,
  FlaskConical,
  Boxes,
  MessageSquareText,
  ChevronRight,
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
import { OperateToday } from "./OperateToday";
import { SimilarWork } from "./SimilarWork";
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

/* A normalised, drawer-ready view of a clickable brief item. */
interface DrawerItem extends BriefDetail {
  title: string;
  kindLabel: string;
  lead?: string;
  chips?: { label: string; tone?: "amber" | "info" | "neutral" | "accent" }[];
}

const sourceIcon: Record<BriefSource["kind"], typeof FileText> = {
  client: FileText,
  public: Globe,
  market: BarChart3,
};

/* ------------------------------------------------------------------ */
export function FirstCallBrief({ projectId }: { projectId: string }) {
  const [item, setItem] = useState<DrawerItem | null>(null);
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
                  setItem({
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
      <OperateToday projectId={projectId} />

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
                setItem({
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
        <SimilarWork projectId={projectId} introOnly />
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

      <BriefDrawer item={item} onClose={() => setItem(null)} />
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

/* ---- detail drawer (shared by signals + hypotheses) -------------- */
function BriefDrawer({ item, onClose }: { item: DrawerItem | null; onClose: () => void }) {
  if (!item) return null;
  const ev = evidenceMeta[item.evidence];
  return (
    <SidePanel open={!!item} onClose={onClose} title={item.title} subtitle={item.kindLabel}>
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
    </SidePanel>
  );
}
