import type { CallReadiness, EvidenceLevel, ResearchFreshness } from "../data/types";
import { Badge } from "./Badge";
import { Tooltip } from "./Tooltip";
import {
  evidenceMeta,
  freshnessMeta,
  readinessMeta,
} from "../lib/status";

export function ReadinessBadge({
  state,
  withTip = true,
}: {
  state: CallReadiness;
  withTip?: boolean;
}) {
  const m = readinessMeta[state];
  const badge = (
    <Badge tone={m.tone} dot pulse={state === "running" || state === "processing"}>
      {m.label}
    </Badge>
  );
  return withTip ? <Tooltip label={m.help}>{badge}</Tooltip> : badge;
}

export function FreshnessBadge({ state }: { state: ResearchFreshness }) {
  const m = freshnessMeta[state];
  if (state === "unknown") return <span className="tertiary">—</span>;
  return (
    <Tooltip label={m.help}>
      <Badge tone={m.tone} dot>
        {m.label}
      </Badge>
    </Tooltip>
  );
}

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const m = evidenceMeta[level];
  return (
    <Tooltip label={m.help}>
      <Badge tone={m.tone} dot>
        {m.label}
      </Badge>
    </Tooltip>
  );
}
