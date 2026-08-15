import type {
  CallReadiness,
  EvidenceLevel,
  Priority,
  ResearchFreshness,
} from "../data/types";

type Tone = "green" | "amber" | "red" | "info" | "violet" | "neutral" | "accent";

export const readinessMeta: Record<
  CallReadiness,
  { label: string; tone: Tone; help: string }
> = {
  ready: {
    label: "Ready for discovery",
    tone: "green",
    help: "Research is fresh and questions are shortlisted. Ready to run the call.",
  },
  "needs-attention": {
    label: "Needs attention",
    tone: "amber",
    help: "Something requires action before this project is call-ready — often a stale brief or open critical questions.",
  },
  running: {
    label: "Research running",
    tone: "info",
    help: "An automated research job is generating company context right now.",
  },
  processing: {
    label: "Processing",
    tone: "info",
    help: "A transcript or document is being ingested. Findings will update shortly.",
  },
  setup: {
    label: "Setup required",
    tone: "violet",
    help: "Not enough context yet. Add a website and stakeholder to start research.",
  },
};

export const freshnessMeta: Record<
  ResearchFreshness,
  { label: string; tone: Tone; help: string }
> = {
  fresh: {
    label: "Fresh",
    tone: "green",
    help: "The brief reflects all known sources.",
  },
  stale: {
    label: "Stale",
    tone: "amber",
    help: "New sources exist that the written brief hasn't incorporated yet. Refresh research to include them.",
  },
  unknown: {
    label: "—",
    tone: "neutral",
    help: "Freshness is not yet established for this project.",
  },
};

export const evidenceMeta: Record<
  EvidenceLevel,
  { label: string; tone: Tone; help: string }
> = {
  "client-confirmed": {
    label: "Client confirmed",
    tone: "green",
    help: "Stated directly by the client on a call or in writing. Treat as fact.",
  },
  "client-document": {
    label: "Client document",
    tone: "accent",
    help: "Sourced from a document the client shared. High confidence.",
  },
  "public-inference": {
    label: "Public-source inference",
    tone: "info",
    help: "Inferred from public sources. Plausible but unconfirmed — validate on the call.",
  },
  "market-benchmark": {
    label: "Market benchmark",
    tone: "violet",
    help: "Drawn from industry benchmarks, not this client specifically.",
  },
  unverified: {
    label: "Unverified assumption",
    tone: "amber",
    help: "An assumption with no supporting evidence yet. Confirm before relying on it.",
  },
};

export const priorityMeta: Record<Priority, { label: string; tone: Tone }> = {
  critical: { label: "Critical", tone: "red" },
  high: { label: "High", tone: "amber" },
  medium: { label: "Medium", tone: "neutral" },
};

export const confidenceMeta: Record<
  "strong" | "moderate" | "emerging",
  { label: string; tone: Tone }
> = {
  strong: { label: "Strong evidence", tone: "green" },
  moderate: { label: "Moderate evidence", tone: "amber" },
  emerging: { label: "Emerging", tone: "info" },
};
