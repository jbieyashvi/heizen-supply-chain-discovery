import { useEffect, useMemo, useState } from "react";
import {
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Undo2,
  FileText,
  RefreshCw,
  CheckCircle2,
  Circle,
  MinusCircle,
} from "lucide-react";
import { SidePanel } from "../SidePanel";
import { Badge } from "../Badge";
import { EvidenceBadge } from "../StatusBadges";
import { useToast } from "../Toast";
import {
  clioReviewChanges,
  REVIEW_GROUPS,
  reviewConfidenceMeta,
  isSafe,
  type ProposedChange,
} from "../../data/reviewChanges";

type Decision = "pending" | "accepted" | "rejected";

export function ReviewChangesPanel({
  open,
  onClose,
  onRefreshBrief,
}: {
  open: boolean;
  onClose: () => void;
  /** Fold accepted changes into the written brief (opens the refresh flow). */
  onRefreshBrief: () => void;
}) {
  const { notify } = useToast();
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [applied, setApplied] = useState(false);

  // Reset each time the panel opens.
  useEffect(() => {
    if (open) {
      setDecisions(
        Object.fromEntries(clioReviewChanges.map((c) => [c.id, "pending"]))
      );
      setApplied(false);
    }
  }, [open]);

  const counts = useMemo(() => {
    let accepted = 0,
      rejected = 0,
      pending = 0;
    for (const c of clioReviewChanges) {
      const d = decisions[c.id] ?? "pending";
      if (d === "accepted") accepted++;
      else if (d === "rejected") rejected++;
      else pending++;
    }
    return { accepted, rejected, pending };
  }, [decisions]);

  const safePending = clioReviewChanges.filter(
    (c) => isSafe(c) && (decisions[c.id] ?? "pending") === "pending"
  );

  const set = (id: string, d: Decision) =>
    setDecisions((prev) => ({ ...prev, [id]: prev[id] === d ? "pending" : d }));

  const acceptAllSafe = () => {
    setDecisions((prev) => {
      const next = { ...prev };
      for (const c of clioReviewChanges) {
        if (isSafe(c) && (next[c.id] ?? "pending") === "pending") next[c.id] = "accepted";
      }
      return next;
    });
    notify({
      title: "Accepted all safe changes",
      body: "Contradictions and low-confidence changes still need individual review.",
      tone: "info",
    });
  };

  const apply = () => {
    setApplied(true);
    notify({
      title: `Applied ${counts.accepted} change${counts.accepted === 1 ? "" : "s"}`,
      body: "Questions, Hypotheses and the Process Map were updated. The Research Brief updates only when you refresh it.",
    });
  };

  const grouped = REVIEW_GROUPS.map((g) => ({
    group: g,
    items: clioReviewChanges.filter((c) => c.group === g.id),
  })).filter((g) => g.items.length > 0);

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Review changes"
      subtitle={
        applied
          ? "Confirmation summary"
          : "Approve what a refresh would fold into the project"
      }
      footer={
        applied ? (
          <div className="rvw-foot">
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              Done
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={onRefreshBrief}
              disabled={counts.accepted === 0}
            >
              <RefreshCw /> Refresh brief
            </button>
          </div>
        ) : (
          <div className="rvw-foot">
            <span className="rvw-foot__counts">
              <span className="rvw-tally rvw-tally--ok">{counts.accepted} accepted</span>
              <span className="rvw-tally rvw-tally--no">{counts.rejected} rejected</span>
              <span className="rvw-tally">{counts.pending} pending</span>
            </span>
            <button
              className="btn btn-primary btn-sm"
              onClick={apply}
              disabled={counts.accepted === 0}
            >
              Apply {counts.accepted} accepted
            </button>
          </div>
        )
      }
    >
      {applied ? (
        <AppliedSummary decisions={decisions} />
      ) : (
        <div className="rvw">
          <div className="rvw-bulk">
            <button
              className="btn btn-sm"
              onClick={acceptAllSafe}
              disabled={safePending.length === 0}
            >
              <ShieldCheck /> Accept all safe changes ({safePending.length})
            </button>
            <p className="rvw-bulk__note">
              <AlertTriangle aria-hidden /> Contradictions and low-confidence changes must be
              reviewed individually.
            </p>
          </div>

          {grouped.map(({ group, items }) => (
            <section className="rvw-group" key={group.id}>
              <div className="rvw-group__head">
                <h3 className="rvw-group__title">
                  {group.label}
                  <span className="rvw-group__count">{items.length}</span>
                </h3>
                <p className="rvw-group__help">{group.help}</p>
              </div>
              {items.map((c) => (
                <ChangeCard
                  key={c.id}
                  change={c}
                  decision={decisions[c.id] ?? "pending"}
                  onAccept={() => set(c.id, "accepted")}
                  onReject={() => set(c.id, "rejected")}
                />
              ))}
            </section>
          ))}
        </div>
      )}
    </SidePanel>
  );
}

/* ---------- Change card ---------- */
function ChangeCard({
  change: c,
  decision,
  onAccept,
  onReject,
}: {
  change: ProposedChange;
  decision: Decision;
  onAccept: () => void;
  onReject: () => void;
}) {
  const cm = reviewConfidenceMeta[c.confidence];
  const safe = isSafe(c);
  return (
    <article className={`rvw-card is-${decision}${safe ? "" : " needs-review"}`}>
      <div className="rvw-card__top">
        <h4 className="rvw-card__title">{c.title}</h4>
        {!safe && (
          <span className="rvw-card__flag">
            <AlertTriangle aria-hidden /> Needs review
          </span>
        )}
      </div>

      {/* Before → After */}
      <div className="rvw-ba">
        <div className="rvw-ba__row">
          <span className="rvw-ba__k">Before</span>
          <span className="rvw-ba__before">{c.before}</span>
        </div>
        <ArrowRight className="rvw-ba__arrow" aria-hidden />
        <div className="rvw-ba__row">
          <span className="rvw-ba__k">After</span>
          <span className="rvw-ba__after">{c.after}</span>
        </div>
      </div>

      {/* Excerpt + source */}
      <blockquote className="rvw-ex">
        <FileText aria-hidden />
        <span>
          <span className="rvw-ex__text">{c.excerpt}</span>
          <span className="rvw-ex__src">{c.source}</span>
        </span>
      </blockquote>

      {/* Evidence + confidence */}
      <div className="rvw-card__badges">
        <EvidenceBadge level={c.evidence} />
        <Badge tone={cm.tone} dot>
          {cm.label}
        </Badge>
      </div>

      {/* Affected screens */}
      <div className="rvw-screens">
        <span className="rvw-screens__k">Affects</span>
        {c.screens.map((s) => (
          <span className="rvw-screen" key={s}>
            {s}
          </span>
        ))}
      </div>

      {/* Accept / Reject */}
      <div className="rvw-actions">
        <button
          className={`rvw-btn rvw-btn--accept${decision === "accepted" ? " is-on" : ""}`}
          aria-pressed={decision === "accepted"}
          onClick={onAccept}
        >
          {decision === "accepted" ? <Undo2 aria-hidden /> : <Check aria-hidden />}
          {decision === "accepted" ? "Accepted" : "Accept"}
        </button>
        <button
          className={`rvw-btn rvw-btn--reject${decision === "rejected" ? " is-on" : ""}`}
          aria-pressed={decision === "rejected"}
          onClick={onReject}
        >
          {decision === "rejected" ? <Undo2 aria-hidden /> : <X aria-hidden />}
          {decision === "rejected" ? "Rejected" : "Reject"}
        </button>
      </div>
    </article>
  );
}

/* ---------- Applied confirmation summary ---------- */
function AppliedSummary({ decisions }: { decisions: Record<string, Decision> }) {
  const by = (d: Decision) =>
    clioReviewChanges.filter((c) => (decisions[c.id] ?? "pending") === d);
  const accepted = by("accepted");
  const rejected = by("rejected");
  const pending = by("pending");

  return (
    <div className="rvw-summary">
      <div className="rvw-sum-stats">
        <div className="rvw-sum-stat rvw-sum-stat--ok">
          <CheckCircle2 aria-hidden />
          <b>{accepted.length}</b> accepted
        </div>
        <div className="rvw-sum-stat rvw-sum-stat--no">
          <MinusCircle aria-hidden />
          <b>{rejected.length}</b> rejected
        </div>
        <div className="rvw-sum-stat">
          <Circle aria-hidden />
          <b>{pending.length}</b> still pending
        </div>
      </div>

      <div className="rvw-applied-note">
        <CheckCircle2 aria-hidden />
        <span>
          <b>Questions, Hypotheses and the Process Map have been updated</b> (simulated).
          The Research Brief only changes when you click <b>Refresh brief</b>.
        </span>
      </div>

      {accepted.length > 0 && (
        <SummaryList title="Accepted & applied" tone="ok" items={accepted} />
      )}
      {pending.length > 0 && (
        <SummaryList title="Still pending review" tone="pending" items={pending} />
      )}
      {rejected.length > 0 && (
        <SummaryList title="Rejected" tone="no" items={rejected} />
      )}
    </div>
  );
}

function SummaryList({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "ok" | "no" | "pending";
  items: ProposedChange[];
}) {
  return (
    <section className="rvw-sumlist">
      <span className={`rvw-sumlist__title rvw-sumlist__title--${tone}`}>{title}</span>
      <ul>
        {items.map((c) => (
          <li key={c.id}>
            <span className="rvw-sumlist__name">{c.title}</span>
            <span className="rvw-sumlist__screens">{c.screens.join(" · ")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
