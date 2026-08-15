export type ResearchState = "complete" | "running" | "not-started";

export type CallReadiness =
  | "ready" // ready for discovery
  | "needs-attention" // stale / action required
  | "running" // research in progress
  | "processing" // post-call ingest
  | "setup"; // insufficient context

export type ResearchFreshness = "fresh" | "stale" | "unknown";

export type EvidenceLevel =
  | "client-confirmed"
  | "client-document"
  | "public-inference"
  | "market-benchmark"
  | "unverified";

export type Priority = "critical" | "high" | "medium";

export interface Stakeholder {
  name: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  industry: string;
  owner: string;
  ownerInitials: string;
  isMine: boolean;
  stakeholder: Stakeholder;
  /** ISO-ish display; null when unscheduled */
  meeting: { date: string; time: string; relative: string } | null;
  callThisWeek: boolean;
  research: ResearchState;
  researchProgress?: number; // 0-100 when running
  freshness: ResearchFreshness;
  freshnessNote?: string;
  readiness: CallReadiness;
  criticalOpenQuestions: number;
  confirmedOpportunities: number;
  lastActivity: string;
  lastActivityAt: number; // sortable epoch-ish
  priority: number; // 1 (highest) .. 5
  nextAction: string;
}

export interface EvidenceMeta {
  level: EvidenceLevel;
  label: string;
  source: string;
}

export interface Insight {
  id: string;
  title: string;
  evidence: EvidenceLevel;
  detail: string;
  sources: string[];
  impact: string;
}

export interface Question {
  id: string;
  priority: Priority;
  question: string;
  purpose: string;
  relatedOpportunity: string;
  status: "shortlisted" | "suggested" | "asked";
}

export interface Opportunity {
  id: string;
  title: string;
  confidence: "strong" | "moderate" | "emerging";
  confirmation: EvidenceLevel;
  impact: string;
  validation: string;
}

export interface ReadinessStep {
  id: string;
  label: string;
  detail: string;
  state: "done" | "attention" | "progress" | "pending";
  meta: string;
  route: string;
}

export interface ActivityEntry {
  id: string;
  kind: "transcript" | "questions" | "opportunity" | "source" | "research";
  text: string;
  time: string;
}

export interface ProjectDetail {
  attention: {
    title: string;
    body: string;
    detail: string;
  } | null;
  readiness: ReadinessStep[];
  insights: Insight[];
  questions: Question[];
  opportunities: Opportunity[];
  activity: ActivityEntry[];
  nextAction: {
    headline: string;
    detail: string;
    primary: string;
    secondary: string;
  };
}
