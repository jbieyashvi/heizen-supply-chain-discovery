import { readStage, stageMeta } from "../lib/stage";

/* Compact current-stage badge shown in the project header on Research,
   Questions, Opportunities and Process Map so users keep stage context.
   Reads the same per-project stage the Overview selector writes. */

export function StageBadge({ projectId }: { projectId: string | undefined }) {
  const m = stageMeta[readStage(projectId)];
  const Icon = m.icon;
  return (
    <span className="stage-badge" title={`Preparation stage: ${m.label}`}>
      <Icon aria-hidden />
      <span className="stage-badge__label">{m.label}</span>
    </span>
  );
}
