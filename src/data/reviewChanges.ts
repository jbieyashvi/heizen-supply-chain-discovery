import type { EvidenceLevel } from "./types";

/* ================================================================
   Clio Snacks — Review Changes (approval workflow)

   The concrete changes two newly-processed client sources (the 13 Aug
   follow-up operations call and the 14 Aug vendor support addendum) would
   fold into the project. Each is reviewed and accepted/rejected before it
   updates Questions, Hypotheses and the Process Map. The Research Brief
   only changes when the consultant clicks "Refresh brief".

   A change is "safe" to bulk-accept unless it is a contradiction or rests
   on low-confidence evidence — those must be reviewed individually.
   ================================================================ */

export type ReviewGroup =
  | "new-facts"
  | "confirmed-assumptions"
  | "contradictions"
  | "updated-questions"
  | "updated-hypotheses"
  | "process-map";

export const REVIEW_GROUPS: {
  id: ReviewGroup;
  label: string;
  help: string;
}[] = [
  { id: "new-facts", label: "New facts", help: "Newly established, evidence-backed facts." },
  {
    id: "confirmed-assumptions",
    label: "Confirmed assumptions",
    help: "Prior assumptions the client has now confirmed.",
  },
  {
    id: "contradictions",
    label: "Contradictions",
    help: "New evidence conflicts with a current finding — review individually.",
  },
  { id: "updated-questions", label: "Updated questions", help: "Discovery questions added or changed." },
  {
    id: "updated-hypotheses",
    label: "Updated hypotheses & opportunities",
    help: "Confidence or framing changes to hypotheses and opportunities.",
  },
  { id: "process-map", label: "Process Map changes", help: "Coverage or health changes to process stages." },
];

export type ReviewConfidence = "high" | "medium" | "low";

export const reviewConfidenceMeta: Record<
  ReviewConfidence,
  { label: string; tone: "green" | "amber" | "red" }
> = {
  high: { label: "High confidence", tone: "green" },
  medium: { label: "Medium confidence", tone: "amber" },
  low: { label: "Low confidence", tone: "red" },
};

export interface ProposedChange {
  id: string;
  group: ReviewGroup;
  title: string;
  before: string;
  after: string;
  /** Exact supporting excerpt from the source. */
  excerpt: string;
  source: string;
  evidence: EvidenceLevel;
  confidence: ReviewConfidence;
  /** Screens this change touches once accepted. */
  screens: string[];
}

/** Contradictions and low-confidence changes can't be bulk-accepted. */
export function isSafe(c: ProposedChange): boolean {
  return c.group !== "contradictions" && c.confidence !== "low";
}

const SRC_FOLLOWUP = "Follow-up operations call transcript · 13 Aug 2026";
const SRC_ADDENDUM = "Vendor support addendum · 14 Aug 2026";
const SRC_PUBLIC = "Company website & public market context · 12 Aug 2026";

export const clioReviewChanges: ProposedChange[] = [
  /* ---- New facts ---- */
  {
    id: "nf-owner",
    group: "new-facts",
    title: "NetSuite ACS decision now has an owner and timeline",
    before: "No named owner or timeline for support after ACS lapses.",
    after: "John Thompson (CFO) owns the decision, expected in the Q4 window.",
    excerpt:
      "\"The CFO said he owns the ACS renewal call and expects to decide within Q4.\"",
    source: SRC_FOLLOWUP,
    evidence: "client-confirmed",
    confidence: "high",
    screens: ["Research", "Process Map", "Opportunities"],
  },
  {
    id: "nf-fsma",
    group: "new-facts",
    title: "FSMA 204 scope limited to the refrigerated lines",
    before: "In-scope FSMA 204 SKUs were unknown.",
    after: "Scope confirmed: only the refrigerated lines fall under FSMA 204.",
    excerpt:
      "\"Only the refrigerated SKUs fall under the 204 rule for us — the ambient range doesn't.\"",
    source: SRC_FOLLOWUP,
    evidence: "client-confirmed",
    confidence: "high",
    screens: ["Research", "Process Map", "Questions"],
  },

  /* ---- Confirmed assumptions ---- */
  {
    id: "ca-paper",
    group: "confirmed-assumptions",
    title: "Paper-based completion confirmed as the inventory-lag cause",
    before: "Assumed production completion is keyed the next morning.",
    after: "Confirmed: paper at shift end, keyed the next morning — the lag's root cause.",
    excerpt:
      "\"Supervisors still fill in the paper work order and it's entered the next morning.\"",
    source: SRC_FOLLOWUP,
    evidence: "client-confirmed",
    confidence: "high",
    screens: ["Research", "Process Map"],
  },
  {
    id: "ca-acs",
    group: "confirmed-assumptions",
    title: "NetSuite ACS support ends in October with no renewal",
    before: "Assumed a support gap was approaching.",
    after: "Confirmed: the ACS term closes in October with no renewal line.",
    excerpt:
      "\"The addendum shows the ACS term closing in October with no renewal line item.\"",
    source: SRC_ADDENDUM,
    evidence: "client-document",
    confidence: "high",
    screens: ["Research", "Process Map"],
  },

  /* ---- Contradictions (individual review) ---- */
  {
    id: "ct-genealogy",
    group: "contradictions",
    title: "Lot-genealogy source of truth conflicts with research",
    before: "Research inferred lot lineage spans TraceGains and NetSuite.",
    after: "Client says genealogy is kept in a standalone spreadsheet.",
    excerpt:
      "\"Honestly the lot history lives in a spreadsheet a supervisor keeps, not in the systems.\"",
    source: SRC_FOLLOWUP,
    evidence: "client-confirmed",
    confidence: "medium",
    screens: ["Research", "Process Map", "Opportunities"],
  },

  /* ---- Updated questions ---- */
  {
    id: "uq-owner",
    group: "updated-questions",
    title: "New question: who owns production-data entry & corrections?",
    before: "—",
    after: "Added as a critical unknown for the next call.",
    excerpt:
      "\"We weren't sure who fixes it when a posting is wrong the next day.\"",
    source: SRC_FOLLOWUP,
    evidence: "client-confirmed",
    confidence: "high",
    screens: ["Questions", "Process Map"],
  },
  {
    id: "uq-genealogy",
    group: "updated-questions",
    title: "Lot-genealogy question now partially answered",
    before: "Open — system of record for lot genealogy unknown.",
    after: "Partially answered: a spreadsheet — scope still to validate.",
    excerpt:
      "\"…lives in a spreadsheet a supervisor keeps\" — confirm which SKUs and the method.",
    source: SRC_FOLLOWUP,
    evidence: "client-confirmed",
    confidence: "medium",
    screens: ["Questions"],
  },

  /* ---- Updated hypotheses & opportunities ---- */
  {
    id: "uh-inventory",
    group: "updated-hypotheses",
    title: "Real-time Inventory Visibility → higher confidence",
    before: "Medium confidence — cost and ownership unconfirmed.",
    after: "High confidence — lag, cause and owner all client-confirmed.",
    excerpt:
      "\"The lag and who owns the fix were both confirmed on the follow-up call.\"",
    source: SRC_FOLLOWUP,
    evidence: "client-confirmed",
    confidence: "high",
    screens: ["Opportunities", "Overview"],
  },
  {
    id: "uh-planning",
    group: "updated-hypotheses",
    title: "Supplier & Production Planning stays low confidence",
    before: "Low confidence — planning drift inferred from public data.",
    after: "Still low — planning drift is not client-confirmed yet.",
    excerpt:
      "Public-source inference only; the follow-up call did not touch planning.",
    source: SRC_PUBLIC,
    evidence: "public-inference",
    confidence: "low",
    screens: ["Opportunities"],
  },

  /* ---- Process Map changes ---- */
  {
    id: "pm-make",
    group: "process-map",
    title: "Make · Completion capture → Critical",
    before: "Friction (inferred).",
    after: "Critical — client-confirmed root cause of the 24-hour lag.",
    excerpt:
      "\"Next-morning entry is the reason inventory is a day behind.\"",
    source: SRC_FOLLOWUP,
    evidence: "client-confirmed",
    confidence: "high",
    screens: ["Process Map"],
  },
  {
    id: "pm-data",
    group: "process-map",
    title: "Data & Systems · Support & config → owner named",
    before: "No owner for configuration/escalations after October.",
    after: "Owner named (CFO); Q4 decision window set.",
    excerpt: "\"The CFO owns the ACS call and will decide in Q4.\"",
    source: SRC_FOLLOWUP,
    evidence: "client-confirmed",
    confidence: "high",
    screens: ["Process Map", "Opportunities"],
  },
];
