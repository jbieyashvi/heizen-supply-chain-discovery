import { Handshake, Compass, TrendingUp } from "lucide-react";

/* Compact current-stage badge shown in the project header on Research,
   Questions, Opportunities and Process Map so users keep stage context.
   Reads the same per-project stage the Overview selector writes. */

type Stage = "intro" | "discovery" | "expansion";

const STAGE_META: Record<Stage, { label: string; icon: typeof Handshake }> = {
  intro: { label: "Introductory Call", icon: Handshake },
  discovery: { label: "Discovery Call", icon: Compass },
  expansion: { label: "Account Expansion", icon: TrendingUp },
};

function readStage(projectId: string | undefined): Stage {
  try {
    const s = localStorage.getItem(`heizen-stage-${projectId}`);
    return s === "discovery" || s === "expansion" ? s : "intro";
  } catch {
    return "intro";
  }
}

export function StageBadge({ projectId }: { projectId: string | undefined }) {
  const m = STAGE_META[readStage(projectId)];
  const Icon = m.icon;
  return (
    <span className="stage-badge" title={`Preparation stage: ${m.label}`}>
      <Icon aria-hidden />
      <span className="stage-badge__label">{m.label}</span>
    </span>
  );
}
