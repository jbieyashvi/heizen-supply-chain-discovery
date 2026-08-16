import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Cpu,
  UserSquare,
  Boxes,
  Store,
  Sparkles,
  ChevronRight,
  FileText,
  Globe,
  BarChart3,
  Target,
  MessageSquareText,
  HelpCircle,
  AlertTriangle,
  CircleCheck,
  ShieldCheck,
} from "lucide-react";
import { SidePanel } from "../SidePanel";
import { Badge } from "../Badge";
import { FocusChip } from "../FocusChip";
import { OnThisPageNav } from "./OnThisPageNav";
import type { ResearchData } from "../../data/research";
import { questionById } from "../../data/discovery";
import { useFocus } from "../../hooks/useFocus";
import { scoreDomains, SIGNAL_DOMAINS, SIMILAR_DOMAINS } from "../../data/focus";
import {
  fcBusinessContext,
  fcBusinessContextNote,
  fcTechInitiatives,
  fcStakeholderSignals,
  fcVendors,
  fcOtherVendors,
  fcOtherVendorsNote,
  vendorCategoryLabel,
  signalConfidenceMeta,
  sourceKindLabel,
  DO_NOT_MENTION,
  type FirstCallSignal,
  type SignalEvidence,
  type FcVendor,
} from "../../data/firstCallResearch";

const SECTIONS = [
  { id: "fc-context", label: "Business context" },
  { id: "fc-tech", label: "Technology & AI" },
  { id: "fc-signals", label: "Stakeholder signals" },
  { id: "fc-stack", label: "Tech stack" },
  { id: "fc-vendors", label: "Relevant vendors" },
  { id: "fc-similar", label: "Similar Heizen work" },
];

const sourceIcon: Record<SignalEvidence["kind"], typeof FileText> = {
  client: FileText,
  public: Globe,
  market: BarChart3,
};

export function ResearchFirstCall({
  data,
  projectId,
}: {
  data: ResearchData;
  projectId: string;
}) {
  const [signal, setSignal] = useState<FirstCallSignal | null>(null);
  const { focus } = useFocus(projectId);

  const byFocus = <T extends { id: string }>(
    items: T[],
    tags: Record<string, string[]>
  ) =>
    [...items]
      .map((it, i) => ({ it, i }))
      .sort(
        (a, b) =>
          scoreDomains((tags[b.it.id] as never) ?? [], focus) -
            scoreDomains((tags[a.it.id] as never) ?? [], focus) || a.i - b.i
      )
      .map((x) => x.it);

  const techInitiatives = byFocus(fcTechInitiatives, SIGNAL_DOMAINS);
  const stakeholderSignals = byFocus(fcStakeholderSignals, SIGNAL_DOMAINS);

  const tech = data.brief.tech;
  const techStack = [...tech.record, ...tech.planning, ...tech.ot].slice(0, 5);
  // Related Heizen work re-ranked by focus (top 3 shown, all retained).
  const similar = byFocus(data.brief.similar, SIMILAR_DOMAINS).slice(0, 3);

  return (
    <div className="brief">
      <OnThisPageNav sections={SECTIONS} />

      <div className="brief__content fcr">
        <FocusChip projectId={projectId} />

        {/* 1 · Business context */}
        <section id="fc-context" className="brief-section">
          <SecHead icon={Building2} title="Business context" />
          <div className="fcr-facts">
            {fcBusinessContext.map((f) => (
              <div className="fcr-fact" key={f.label}>
                <span className="fcr-fact__k">{f.label}</span>
                <span className="fcr-fact__v">{f.value}</span>
                {f.note && <span className="fcr-fact__note">{f.note}</span>}
              </div>
            ))}
          </div>
          <p className="fcr-note">{fcBusinessContextNote}</p>
        </section>

        {/* 2 · Technology & AI initiatives */}
        <section id="fc-tech" className="brief-section">
          <SecHead
            icon={Cpu}
            title="Technology & AI initiatives"
            sub="Spend and initiative signals. Click any for detail."
          />
          <div className="fcr-signals">
            {techInitiatives.map((s) => (
              <SignalCard key={s.id} signal={s} onOpen={() => setSignal(s)} />
            ))}
          </div>
        </section>

        {/* 3 · Stakeholder-relevant signals */}
        <section id="fc-signals" className="brief-section">
          <SecHead
            icon={UserSquare}
            title="Stakeholder-relevant signals"
            sub="For Meera Iyer, VP Operations. Click any for detail."
          />
          <div className="fcr-signals">
            {stakeholderSignals.map((s) => (
              <SignalCard key={s.id} signal={s} onOpen={() => setSignal(s)} />
            ))}
          </div>
        </section>

        {/* 4 · Tech stack */}
        <section id="fc-stack" className="brief-section">
          <SecHead icon={Boxes} title="Tech stack" sub="Core systems in use." />
          <div className="fcr-stack">
            {techStack.map((s) => (
              <div className="fcr-stackitem" key={s.name}>
                <span className="fcr-stackitem__name">{s.name}</span>
                <span className="fcr-stackitem__role">{s.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5 · Relevant vendors */}
        <section id="fc-vendors" className="brief-section">
          <SecHead
            icon={Store}
            title="Relevant vendors"
            sub="Technology and supply-chain vendors only. Verify before referencing."
          />
          <div className="fcr-vendors">
            {fcVendors.map((v) => (
              <VendorCard key={v.name} vendor={v} />
            ))}
          </div>

          <details className="fcr-other">
            <summary>
              <AlertTriangle aria-hidden /> Other vendors ({fcOtherVendors.length}) — audit /
              statutory, not relevant
            </summary>
            <p className="fcr-other__note">{fcOtherVendorsNote}</p>
            <div className="fcr-vendors">
              {fcOtherVendors.map((v) => (
                <VendorCard key={v.name} vendor={v} />
              ))}
            </div>
          </details>
        </section>

        {/* 6 · Similar Heizen work */}
        <section id="fc-similar" className="brief-section">
          <SecHead icon={Sparkles} title="Similar Heizen work" sub="Prior work as supporting proof." />
          <div className="fcr-similar">
            {similar.map((s) => (
              <div className="simwork" key={s.id}>
                <div className="simwork__top">
                  <span className="simwork__area">{s.area}</span>
                  <Badge tone={s.similarity === "high" ? "green" : "neutral"} dot>
                    {s.similarity === "high" ? "High similarity" : "Some overlap"}
                  </Badge>
                </div>
                <p className="simwork__pain">
                  <CircleCheck aria-hidden /> {s.relatedPain}
                </p>
                <p className="simwork__rel">{s.relevance}</p>
                <span className="simwork__client">{s.clientLabel}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <SignalDrawer signal={signal} projectId={projectId} onClose={() => setSignal(null)} />
    </div>
  );
}

/* ---- Section heading ---- */
function SecHead({
  icon: Icon,
  title,
  sub,
}: {
  icon: typeof Cpu;
  title: string;
  sub?: string;
}) {
  return (
    <header className="brief-head fcr-head">
      <span className="fcr-head__icon" aria-hidden>
        <Icon />
      </span>
      <div>
        <h3 className="brief-title">{title}</h3>
        {sub && <p className="brief-sub">{sub}</p>}
      </div>
    </header>
  );
}

/* ---- Clickable signal card ---- */
function SignalCard({
  signal,
  onOpen,
}: {
  signal: FirstCallSignal;
  onOpen: () => void;
}) {
  const c = signalConfidenceMeta[signal.confidence];
  return (
    <button className="fcr-signal" onClick={onOpen}>
      <div className="fcr-signal__main">
        <div className="fcr-signal__top">
          <Badge tone={c.tone} dot>
            {c.label}
          </Badge>
        </div>
        <h4 className="fcr-signal__title">{signal.title}</h4>
        <p className="fcr-signal__summary">{signal.summary}</p>
      </div>
      <ChevronRight className="fcr-signal__chev" aria-hidden />
    </button>
  );
}

/* ---- Vendor card ---- */
function VendorCard({ vendor: v }: { vendor: FcVendor }) {
  const verified = v.status === "verified";
  return (
    <div className={`fcr-vendor${verified ? "" : " is-unverified"}`}>
      <div className="fcr-vendor__top">
        <span className="fcr-vendor__name">{v.name}</span>
        <span className="fcr-vendor__cat">{vendorCategoryLabel[v.category]}</span>
      </div>
      <p className="fcr-vendor__rel">{v.relevance}</p>
      <p className="fcr-vendor__evi">
        <span className="fcr-vendor__evi-k">Evidence</span> {v.evidence}
      </p>
      <div className="fcr-vendor__foot">
        {verified ? (
          <Badge tone="green" icon={<ShieldCheck aria-hidden />}>
            Verified relevance
          </Badge>
        ) : (
          <Badge tone="amber" dot>
            Unverified
          </Badge>
        )}
      </div>
      {!verified && (
        <p className="fcr-vendor__warn">
          <AlertTriangle aria-hidden /> {DO_NOT_MENTION}
        </p>
      )}
    </div>
  );
}

/* ---- Signal drawer ---- */
function SignalDrawer({
  signal,
  projectId,
  onClose,
}: {
  signal: FirstCallSignal | null;
  projectId: string;
  onClose: () => void;
}) {
  if (!signal) return null;
  const c = signalConfidenceMeta[signal.confidence];
  const questions = signal.discoveryQuestionIds
    .map((id) => questionById(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  return (
    <SidePanel open={!!signal} onClose={onClose} title={signal.title} subtitle="First-call signal">
      <div className="fcr-d">
        <div className="fcr-d__conf">
          <div className="fcr-d__confitem">
            <span className="fcr-d__k">Confidence</span>
            <Badge tone={c.tone} dot>
              {c.label}
            </Badge>
          </div>
          <div className="fcr-d__confitem">
            <span className="fcr-d__k">Related</span>
            <span className="fcr-d__related">
              <Target aria-hidden /> {signal.related}
            </span>
          </div>
        </div>

        <section className="fcr-d__sec">
          <h4 className="fcr-d__h">Full explanation</h4>
          <p className="fcr-d__p">{signal.explanation}</p>
        </section>

        <section className="fcr-d__sec fcr-d__meera">
          <h4 className="fcr-d__h">
            <UserSquare aria-hidden /> Why it matters to Meera Iyer
          </h4>
          <p className="fcr-d__p">{signal.whyMeera}</p>
        </section>

        <section className="fcr-d__sec">
          <h4 className="fcr-d__h">Evidence &amp; linked sources</h4>
          <div className="fcr-d__sources">
            {signal.evidence.map((e) => {
              const SIcon = sourceIcon[e.kind];
              return (
                <div className="fcr-d__source" key={e.source}>
                  <span className="fcr-d__source-icon" aria-hidden>
                    <SIcon />
                  </span>
                  <div>
                    <div className="fcr-d__source-top">
                      <span className="fcr-d__source-name">{e.source}</span>
                      <span className="fcr-d__source-kind">{sourceKindLabel[e.kind]}</span>
                    </div>
                    <p className="fcr-d__source-excerpt">"{e.excerpt}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="fcr-d__sec fcr-d__starter">
          <h4 className="fcr-d__h">
            <MessageSquareText aria-hidden /> Suggested conversation starter
          </h4>
          <p className="fcr-d__quote">"{signal.starter}"</p>
        </section>

        {questions.length > 0 && (
          <section className="fcr-d__sec">
            <h4 className="fcr-d__h">Related discovery questions</h4>
            <div className="fcr-d__qs">
              {questions.map((q) => (
                <Link
                  key={q.id}
                  to={`/projects/${projectId}/discovery`}
                  className="fcr-d__q"
                >
                  <HelpCircle aria-hidden /> {q.question}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="fcr-d__sec">
          <h4 className="fcr-d__h">
            <Sparkles aria-hidden /> Similar Heizen projects
          </h4>
          <div className="fcr-d__heizen">
            {signal.heizen.map((h) => (
              <div className="fcr-d__href" key={h.label}>
                <span className="fcr-d__href-name">{h.label}</span>
                <span className="fcr-d__href-rel">{h.relevance}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SidePanel>
  );
}
