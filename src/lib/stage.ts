import { Handshake, Compass, TrendingUp } from "lucide-react";

/* Per-project preparation stage. The Overview stage selector is the single
   writer (localStorage `heizen-stage-<id>`); every other surface reads it. */

export type Stage = "intro" | "discovery" | "expansion";

export const stageMeta: Record<
  Stage,
  { label: string; short: string; icon: typeof Handshake }
> = {
  intro: { label: "Introductory Call", short: "Intro call", icon: Handshake },
  discovery: { label: "Discovery Call", short: "Discovery", icon: Compass },
  expansion: { label: "Account Expansion", short: "Expansion", icon: TrendingUp },
};

export function readStage(projectId: string | undefined): Stage {
  try {
    const s = localStorage.getItem(`heizen-stage-${projectId}`);
    return s === "discovery" || s === "expansion" ? s : "intro";
  } catch {
    return "intro";
  }
}
