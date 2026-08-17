import { useState } from "react";
import {
  Compass,
  MessageSquareText,
  Search,
  CheckCircle2,
  Flag,
  ArrowRight,
  ChevronRight,
  FileText,
  Globe,
  BarChart3,
} from "lucide-react";
import { SidePanel } from "./SidePanel";
import { Badge } from "./Badge";
import { evidenceMeta } from "../lib/status";
import { confLabel, confTone } from "../data/discovery";
import {
  compassSteps,
  compassBandMeta,
  compassCues,
  sourceKindLabel,
  type CompassStep,
  type CompassBand,
  type CompassCue,
  type BriefSource,
} from "../data/firstcall";

/* ================================================================
   First-call compass — a compact four-step conversation journey
   (Start with → Learn → Validate → Land the call) followed by a
   three-column "safe to say / ask, don't assume / avoid mentioning"
   cue strip. Every cue shows its evidence + confidence and opens its
   source in the shared side panel. Intro-call only (rendered by
   FirstCallBrief, which is gated to the Introductory Call stage).
   ================================================================ */

const stepIcon: Record<CompassStep["key"], typeof Compass> = {
  start: MessageSquareText,
  learn: Search,
  validate: CheckCircle2,
  land: Flag,
};

const sourceIcon: Record<BriefSource["kind"], typeof FileText> = {
  client: FileText,
  public: Globe,
  market: BarChart3,
};

const bandOrder: CompassBand[] = ["safe", "ask", "avoid"];

export function FirstCallCompass() {
  const [cue, setCue] = useState<CompassCue | null>(null);

  return (
    <section className="fcb-sec compass">
      <div className="fcb-sec__head">
        <span className="fcb-sec__num" aria-hidden>
          <Compass />
        </span>
        <div>
          <h3 className="fcb-sec__title">
            <span className="fcb-sec__n">1.</span> First-call compass
          </h3>
          <p className="fcb-sec__sub">
            A four-step path through the conversation — where to open, what to
            learn, what to validate, and where to land.
          </p>
        </div>
      </div>

      {/* Four-step journey — connected left-to-right on desktop, stacked on
          smaller screens. */}
      <ol className="compass-journey">
        {compassSteps.map((step, i) => {
          const Icon = stepIcon[step.key];
          return (
            <li className="compass-step" key={step.key}>
              <div className="compass-step__head">
                <span className="compass-step__node" aria-hidden>
                  <Icon />
                </span>
                <span className="compass-step__label">
                  <span className="compass-step__n">{i + 1}</span>
                  {step.label}
                </span>
              </div>

              {step.kind === "prompt" ? (
                <p
                  className={`compass-step__prompt${
                    step.key === "land" ? " is-land" : ""
                  }`}
                >
                  {step.prompt}
                </p>
              ) : (
                <ul className="compass-step__list">
                  {step.items!.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              )}

              {i < compassSteps.length - 1 && (
                <span className="compass-step__arrow" aria-hidden>
                  <ArrowRight />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Safe to say · Ask, don't assume · Avoid mentioning */}
      <div className="compass-bands">
        {bandOrder.map((band) => {
          const meta = compassBandMeta[band];
          const cues = compassCues.filter((c) => c.band === band);
          return (
            <div className={`compass-band compass-band--${band}`} key={band}>
              <div className="compass-band__head">
                <span className="compass-band__dot" aria-hidden />
                <span className="compass-band__title">{meta.title}</span>
                <span className="compass-band__desc">{meta.desc}</span>
              </div>
              <div className="compass-band__cues">
                {cues.map((c) => {
                  const ev = evidenceMeta[c.evidence];
                  return (
                    <button
                      className="compass-cue"
                      key={c.id}
                      onClick={() => setCue(c)}
                      aria-label={`${c.text} — ${ev.label}, ${confLabel[c.confidence]}. Open source`}
                    >
                      <span className="compass-cue__text">{c.text}</span>
                      <span className="compass-cue__meta">
                        <Badge tone={ev.tone as never}>{ev.label}</Badge>
                        <span className="compass-cue__conf">
                          <span
                            className={`compass-cue__confdot conf-${c.confidence}`}
                            aria-hidden
                          />
                          {confLabel[c.confidence]}
                        </span>
                        <ChevronRight className="compass-cue__chev" aria-hidden />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <CueDrawer cue={cue} onClose={() => setCue(null)} />
    </section>
  );
}

/* ---- source drawer (opened from any cue) ------------------------- */
function CueDrawer({
  cue,
  onClose,
}: {
  cue: CompassCue | null;
  onClose: () => void;
}) {
  if (!cue) return null;
  const ev = evidenceMeta[cue.evidence];
  const meta = compassBandMeta[cue.band];
  return (
    <SidePanel
      open={!!cue}
      onClose={onClose}
      title={cue.text}
      subtitle={`${meta.title} — ${meta.desc}`}
    >
      <div className="fcb-d">
        <div className="fcb-d__conf">
          <div className="fcb-d__confitem">
            <span className="fcb-d__k">Confidence</span>
            <Badge tone={confTone[cue.confidence]} dot>
              {confLabel[cue.confidence]}
            </Badge>
          </div>
          <div className="fcb-d__confitem">
            <span className="fcb-d__k">Evidence</span>
            <Badge tone={ev.tone as never}>{ev.label}</Badge>
          </div>
        </div>

        <p className="fcb-d__detail">{cue.detail}</p>

        <section className="fcb-d__sec">
          <h4 className="fcb-d__h">Source</h4>
          <div className="fcb-d__sources">
            {cue.sources.map((s) => {
              const SIcon = sourceIcon[s.kind];
              return (
                <div className="fcb-d__source" key={s.label}>
                  <span className="fcb-d__source-icon" aria-hidden>
                    <SIcon />
                  </span>
                  <div>
                    <div className="fcb-d__source-top">
                      <span className="fcb-d__source-name">{s.label}</span>
                      <span className="fcb-d__source-kind">
                        {sourceKindLabel[s.kind]}
                      </span>
                    </div>
                    <p className="fcb-d__source-excerpt">"{s.excerpt}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </SidePanel>
  );
}
