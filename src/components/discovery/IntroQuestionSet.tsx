import { useMemo, useState } from "react";
import {
  Star,
  StarOff,
  Search,
  Info,
  ChevronRight,
  Ear,
  BookOpen,
  Target,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "../PageHeader";
import { Badge } from "../Badge";
import { Tooltip } from "../Tooltip";
import { SidePanel } from "../SidePanel";
import { Modal } from "../Modal";
import { EmptyState } from "../EmptyState";
import { FocusChip } from "../FocusChip";
import { useDiscovery } from "../../hooks/useDiscovery";
import { useFocus } from "../../hooks/useFocus";
import { scoreDomains, type FocusDomain } from "../../data/focus";
import type { Project } from "../../data/types";
import {
  clioIntroQuestions,
  INTRO_DOMAINS,
  INTRO_TYPES,
  INTRO_FLAG_META,
  introTypeLabel,
  introTypeOrder,
  introDomainLabel,
  INTRO_STAKEHOLDER_NOTE,
  STAKEHOLDER,
  type IntroDomain,
  type IntroType,
  type IntroQuestion,
} from "../../data/discovery";
import { conversationStarters, desiredOutcome } from "../../data/firstcall";

function possessive(name: string): string {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

const INTRO_TO_FOCUS: Record<string, FocusDomain> = {
  manufacturing: "manufacturing",
  "supply-chain": "supply-chain",
  "tech-data": "tech-ai",
  procurement: "procurement",
};

export function IntroQuestionSet({
  project,
  projectId,
  tabs,
}: {
  project: Project;
  projectId: string;
  tabs: React.ReactNode;
}) {
  const { introShortlist, toggleIntroShortlist } = useDiscovery();
  const { focus } = useFocus(projectId);
  const [query, setQuery] = useState("");
  const [fDomain, setFDomain] = useState<IntroDomain | "all">("all");
  const [fType, setFType] = useState<IntroType | "all">("all");
  const [selected, setSelected] = useState<IntroQuestion | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const filtering = query.trim() !== "" || fDomain !== "all" || fType !== "all";

  /** Questions passing the current text/type filter. */
  const matches = (q: IntroQuestion) => {
    if (fType !== "all" && q.type !== fType) return false;
    const s = query.trim().toLowerCase();
    if (s && !q.question.toLowerCase().includes(s)) return false;
    return true;
  };

  /* Build the grouped view. Procurement is excluded from the default
     sequence for this stakeholder unless explicitly filtered to. */
  const groups = useMemo(() => {
    const base =
      fDomain === "all"
        ? INTRO_DOMAINS
        : INTRO_DOMAINS.filter((d) => d.id === fDomain);

    // Focus floats the most relevant domains to the top (stable, nothing hidden).
    const domainsToShow = [...base]
      .map((d, i) => ({ d, i }))
      .sort(
        (a, b) =>
          scoreDomains([INTRO_TO_FOCUS[a.d.id]], focus) === scoreDomains([INTRO_TO_FOCUS[b.d.id]], focus)
            ? a.i - b.i
            : scoreDomains([INTRO_TO_FOCUS[b.d.id]], focus) - scoreDomains([INTRO_TO_FOCUS[a.d.id]], focus)
      )
      .map((x) => x.d);

    return domainsToShow.map((d) => {
      const setAside = d.id === "procurement" && fDomain === "all";
      const items = clioIntroQuestions
        .filter((q) => q.domain === d.id)
        .filter((q) => (fDomain === "all" ? q.inDefault : true))
        .filter(matches)
        .sort((a, b) => introTypeOrder(a.type) - introTypeOrder(b.type));
      return { domain: d, items, setAside };
    });
  }, [fDomain, fType, query, focus]);

  const defaultCount = clioIntroQuestions.filter((q) => q.inDefault).length;
  const shortlistCount = clioIntroQuestions.filter(
    (q) => introShortlist[q.id]
  ).length;

  const clearFilters = () => {
    setQuery("");
    setFDomain("all");
    setFType("all");
  };

  const hasAny = groups.some((g) => g.items.length > 0);

  return (
    <div className="page discovery">
      <PageHeader
        crumbs={[
          { label: "Projects", to: "/projects" },
          { label: project.name, to: `/projects/${projectId}` },
          { label: "Discovery Questions" },
        ]}
        title={<h1 className="page-title">Discovery Questions</h1>}
        subtitle={`A broad, first-call talk track for ${possessive(project.name)} introductory call.`}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setGuideOpen(true)}>
            <BookOpen /> Open conversation guide
          </button>
        }
        meta={tabs}
      />

      <FocusChip projectId={projectId} />

      {/* Stakeholder note */}
      <div className="notice notice--info" role="note">
        <span className="notice__icon" aria-hidden>
          <Info />
        </span>
        <div className="notice__main">
          <div className="notice__text">
            <span className="notice__title">
              {defaultCount} broad questions · sequenced for {STAKEHOLDER.name}
            </span>
            <span className="notice__body">{INTRO_STAKEHOLDER_NOTE}</span>
          </div>
        </div>
      </div>

      {/* Toolbar: search + Domain + Type filters */}
      <div className="dtoolbar">
        <div className="searchbox searchbox--sm">
          <Search aria-hidden />
          <input
            type="search"
            placeholder="Search questions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search questions"
          />
        </div>
        <div className="dfilters">
          <div className="dfilter">
            <label className="sr-only">Domain</label>
            <select
              value={fDomain}
              onChange={(e) => setFDomain(e.target.value as IntroDomain | "all")}
            >
              <option value="all">All domains</option>
              {INTRO_DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="dfilter">
            <label className="sr-only">Question type</label>
            <select
              value={fType}
              onChange={(e) => setFType(e.target.value as IntroType | "all")}
            >
              <option value="all">All question types</option>
              {INTRO_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {filtering && (
            <button className="link-btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
        {shortlistCount > 0 && (
          <span className="intro-shortcount">
            <Star aria-hidden /> {shortlistCount} shortlisted
          </span>
        )}
      </div>

      {/* Grouped list */}
      {!hasAny ? (
        <EmptyState
          icon={<BookOpen />}
          title="No questions here"
          body="No questions match the current filters."
          action={
            filtering ? (
              <button className="btn" onClick={clearFilters}>
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="intro-groups">
          {groups.map((g) => {
            if (g.setAside) {
              return (
                <section className="intro-group intro-group--aside" key={g.domain.id}>
                  <div className="intro-group__head">
                    <h2 className="intro-group__title">{g.domain.label}</h2>
                    <span className="intro-group__aside-note">
                      Set aside for {STAKEHOLDER.name} · filter to {g.domain.label} to view
                    </span>
                  </div>
                </section>
              );
            }
            if (g.items.length === 0) return null;
            return (
              <section className="intro-group" key={g.domain.id}>
                <div className="intro-group__head">
                  <h2 className="intro-group__title">{g.domain.label}</h2>
                  {g.domain.prioritised && (
                    <Tooltip label={`Prioritised for ${STAKEHOLDER.name} (${STAKEHOLDER.role}).`}>
                      <Badge tone="accent">Prioritised</Badge>
                    </Tooltip>
                  )}
                  <span className="intro-group__count">
                    {g.items.length} question{g.items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="intro-list">
                  {g.items.map((q) => (
                    <IntroRow
                      key={q.id}
                      q={q}
                      starred={!!introShortlist[q.id]}
                      onStar={() => toggleIntroShortlist(q.id)}
                      onSelect={() => setSelected(q)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <IntroDetailPanel q={selected} onClose={() => setSelected(null)} />
      <ConversationGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        project={project}
      />
    </div>
  );
}

/* ---------- Row ---------- */
function IntroRow({
  q,
  starred,
  onStar,
  onSelect,
}: {
  q: IntroQuestion;
  starred: boolean;
  onStar: () => void;
  onSelect: () => void;
}) {
  const flag = INTRO_FLAG_META[q.flag];
  return (
    <article className={`qrow intro-row${q.flag === "skip" ? " is-skip" : ""}`}>
      <div className="qrow__lead">
        <Tooltip label={starred ? "Remove from shortlist" : "Add to shortlist"}>
          <button
            className={`qrow__star${starred ? " is-on" : ""}`}
            onClick={onStar}
            aria-pressed={starred}
            aria-label={starred ? "Remove from shortlist" : "Add to shortlist"}
          >
            {starred ? <Star /> : <StarOff />}
          </button>
        </Tooltip>
      </div>
      <button className="qrow__main" onClick={onSelect}>
        <span className="qrow__q">{q.question}</span>
        <span className="qrow__meta">
          <Badge tone={flag.tone}>{flag.label}</Badge>
          <span className="qrow__type">{introTypeLabel(q.type)}</span>
        </span>
      </button>
      <div className="qrow__side">
        <ChevronRight className="intro-row__chev" aria-hidden />
      </div>
    </article>
  );
}

/* ---------- Detail drawer ---------- */
function IntroDetailPanel({
  q,
  onClose,
}: {
  q: IntroQuestion | null;
  onClose: () => void;
}) {
  const flag = q ? INTRO_FLAG_META[q.flag] : null;
  return (
    <SidePanel
      open={!!q}
      onClose={onClose}
      title={q?.question ?? ""}
      subtitle={q ? `${introDomainLabel(q.domain)} · ${introTypeLabel(q.type)}` : undefined}
    >
      {q && flag && (
        <div className="qdetail">
          <div className="qdetail__badges">
            <Badge tone={flag.tone}>{flag.label}</Badge>
            <Badge tone="neutral">{introTypeLabel(q.type)}</Badge>
            <Badge tone="info">{introDomainLabel(q.domain)}</Badge>
          </div>

          <section className="qdetail__block">
            <h4 className="qdetail__label">Why ask this now</h4>
            <p>{q.intent}</p>
          </section>

          <section className="qdetail__block">
            <h4 className="qdetail__label">
              <Ear aria-hidden /> Listen for
            </h4>
            <ul className="qdetail__list">
              {q.listenFor.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>

          <p className="qdetail__rel-note">
            <Info aria-hidden /> Introductory questions are broad by design — use them to
            build rapport and surface pains, then go deeper on the Discovery Call.
          </p>
        </div>
      )}
    </SidePanel>
  );
}

/* ---------- Conversation guide (read-only talk track) ---------- */
function ConversationGuideModal({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: Project;
}) {
  const ordered = INTRO_DOMAINS.filter((d) => d.id !== "procurement").map((d) => ({
    domain: d,
    items: clioIntroQuestions
      .filter((q) => q.domain === d.id && q.inDefault)
      .sort((a, b) => introTypeOrder(a.type) - introTypeOrder(b.type)),
  }));

  let n = 0;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conversation guide"
      subtitle={`Introductory call · ${project.name} · ${STAKEHOLDER.name}, ${STAKEHOLDER.role}`}
      size="sheet"
      footer={
        <button className="btn btn-primary btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="cguide">
        <section className="cguide__open">
          <span className="cguide__label">Openers</span>
          <ol className="cguide__openers">
            {conversationStarters.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ol>
        </section>

        {ordered.map(({ domain, items }) => (
          <section className="cguide__group" key={domain.id}>
            <h3 className="cguide__group-title">
              {domain.label}
              {domain.prioritised && <Badge tone="accent">Prioritised</Badge>}
            </h3>
            <ol className="cguide__list">
              {items.map((q) => {
                n += 1;
                const flag = INTRO_FLAG_META[q.flag];
                return (
                  <li className="cguide__q" key={q.id}>
                    <span className="cguide__n">{n}</span>
                    <div className="cguide__qbody">
                      <span className="cguide__qtext">{q.question}</span>
                      <span className="cguide__qmeta">
                        <Badge tone={flag.tone}>{flag.label}</Badge>
                        <span className="qrow__type">{introTypeLabel(q.type)}</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        <section className="cguide__outcome">
          <span className="cguide__label">
            <Target aria-hidden /> Desired call outcome
          </span>
          <p>{desiredOutcome}</p>
        </section>

        <p className="cguide__note">
          <ArrowRight aria-hidden /> This is a prototype guide — nothing is recorded. Switch
          to the Discovery Call set for evidence-backed questions and Call Mode.
        </p>
      </div>
    </Modal>
  );
}
