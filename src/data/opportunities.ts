import type { EvidenceLevel } from "./types";
import type { FocusDomain } from "./focus";

/* ================================================================
   Clio Snacks — Opportunities

   Grounded in the existing Research and Discovery data. Confidence and
   status reflect how well each opportunity is evidenced today; nothing
   here is a commitment or a real financial figure — value ranges are
   indicative, pre-validation estimates.
   ================================================================ */

export type OppPriority = "high" | "medium";
export type OppConfidence = "high" | "medium" | "low";
export type OppStatus = "identified" | "validating" | "confirmed" | "not-pursuing";

export interface OppEvidence {
  finding: string;
  evidence: EvidenceLevel;
  source: string;
  sourceType: string;
  date: string;
  visibility: "client" | "public";
  excerpt: string;
}

export interface OppQA {
  id: string;
  question: string;
  answered: boolean;
  answer: string;
}

export interface Opportunity {
  id: string;
  name: string;
  priority: OppPriority;
  confidence: OppConfidence;
  /** Default workflow status (user can change it in the prototype). */
  status: OppStatus;
  /** One-line opportunity summary / value hypothesis. */
  summary: string;
  problem: string;
  currentProcess: string;
  businessImpact: string;
  stakeholders: string[];
  evidence: OppEvidence[];
  questions: OppQA[];
  assumptions: string[];
  unknowns: string[];
  confidenceReason: string;
  /** Recommended next action (solution-oriented) — used post-validation. */
  nextAction: string;
  /** A validation question / action to run on the call — never a solution. */
  validationAction: string;
  lastUpdated: string;
  /** Indicative annual value range (pre-validation). */
  estValue: string;
}

export const OPP_STATUSES: { id: OppStatus; label: string }[] = [
  { id: "identified", label: "Identified" },
  { id: "validating", label: "Validating" },
  { id: "confirmed", label: "Confirmed" },
  { id: "not-pursuing", label: "Not pursuing" },
];

export const statusMeta: Record<
  OppStatus,
  { label: string; tone: "green" | "amber" | "info" | "neutral" }
> = {
  identified: { label: "Identified", tone: "info" },
  validating: { label: "Validating", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "green" },
  "not-pursuing": { label: "Not pursuing", tone: "neutral" },
};

export const confidenceMeta: Record<
  OppConfidence,
  { label: string; tone: "green" | "amber" | "neutral" }
> = {
  high: { label: "High confidence", tone: "green" },
  medium: { label: "Medium confidence", tone: "amber" },
  low: { label: "Low confidence", tone: "neutral" },
};

export const priorityMeta: Record<
  OppPriority,
  { label: string; tone: "amber" | "neutral" }
> = {
  high: { label: "High priority", tone: "amber" },
  medium: { label: "Medium priority", tone: "neutral" },
};

/* Source labels reused from the Research source ledger */
const SRC_DISCOVERY = "Initial discovery call transcript";
const SRC_PUBLIC = "Company website & public market context";
const SRC_FOLLOWUP = "Follow-up operations call transcript";

export const clioOpportunities: Opportunity[] = [
  {
    id: "opp-inventory",
    name: "Real-time Inventory Visibility",
    priority: "high",
    confidence: "high",
    status: "confirmed",
    summary:
      "Close the 24-hour inventory lag by capturing production completion at the source, so finished-goods availability is current during peak.",
    problem:
      "Production completion is recorded on paper and keyed into NetSuite the next morning, so inventory is up to 24 hours behind actual.",
    currentProcess:
      "Shift supervisors complete work orders on paper. A clerk keys them into NetSuite the following morning. Between the shift and that entry, availability-to-promise runs against numbers that are up to a day old.",
    businessImpact:
      "During peak demand, orders are promised against inventory that is a day old — risking over-commitment, expedite costs and lost sales. The cost grows as the plant scales.",
    stakeholders: [
      "Rafael Rodas, COO",
      "Warehouse Manager",
      "John Thompson, CFO",
    ],
    evidence: [
      {
        finding: "Paper-based work-order completion creates a 24-hour inventory lag",
        evidence: "client-confirmed",
        source: SRC_DISCOVERY,
        sourceType: "Discovery call transcript (client-provided)",
        date: "10 Aug 2026",
        visibility: "client",
        excerpt:
          "The COO described supervisors completing work orders on paper and a clerk keying results into NetSuite the next morning — a roughly one-day delay before inventory reflects production.",
      },
      {
        finding: "24-hour finished-goods inventory lag distorts availability during peak",
        evidence: "client-confirmed",
        source: SRC_DISCOVERY,
        sourceType: "Discovery call transcript (client-provided)",
        date: "10 Aug 2026",
        visibility: "client",
        excerpt:
          "The initial call established a ~24-hour delay between production and inventory reflection, distorting availability-to-promise during peak demand.",
      },
      {
        finding: "A named owner and Q4 window exist to act on the data workflow",
        evidence: "client-confirmed",
        source: SRC_FOLLOWUP,
        sourceType: "Follow-up call transcript (client-provided)",
        date: "13 Aug 2026",
        visibility: "client",
        excerpt:
          "The follow-up call confirmed leadership ownership and a Q4 window to address the production-to-inventory workflow.",
      },
      {
        finding: "Comparable F&B manufacturers have closed similar paper-to-ERP gaps",
        evidence: "market-benchmark",
        source: SRC_PUBLIC,
        sourceType: "Market benchmark",
        date: "12 Aug 2026",
        visibility: "public",
        excerpt:
          "Comparable manufacturers closed posting lags with source-side capture, per market pattern research — a demonstrated precedent for the approach.",
      },
    ],
    questions: [
      {
        id: "q1",
        question:
          "How long after production does finished-goods inventory reflect in NetSuite today?",
        answered: true,
        answer:
          "Next-morning entry — roughly a 24-hour lag; entry is manual after the shift.",
      },
      {
        id: "q2",
        question:
          "Walk me through how a completed work order moves from the line clipboard into NetSuite.",
        answered: true,
        answer:
          "Paper completion at shift end, keyed by a clerk the following morning; a few handoffs in between.",
      },
      {
        id: "q11",
        question:
          "Who owns production-data entry and correction when work orders are posted late?",
        answered: false,
        answer: "Not yet answered — confirm the process owner on the next call.",
      },
    ],
    assumptions: [
      "Source-side capture can be introduced without replacing NetSuite.",
      "Peak-season volume makes the lag materially costly.",
    ],
    unknowns: ["Exact daily volume and who owns production-data entry."],
    confidenceReason:
      "High — the lag, its cause and its peak-demand cost are all client-confirmed on the discovery call, with a comparable prior project as precedent.",
    nextAction:
      "Scope a source-side capture pilot on one line and size the peak-season value with the COO.",
    validationAction:
      "Ask: “How long after production does inventory actually reflect today, and who owns that data entry?” Confirm the lag and the peak-season cost before proposing anything.",
    lastUpdated: "13 Aug 2026",
    estValue: "$0.6M–0.9M / yr",
  },
  {
    id: "opp-traceability",
    name: "Lot Traceability & Compliance",
    priority: "high",
    confidence: "medium",
    status: "validating",
    summary:
      "Deliver FSMA 204 / GS1 lot traceability and recall readiness without stalling the operational roadmap.",
    problem:
      "Lot genealogy is fragmented and the true source of truth is unconfirmed, so recall readiness and FSMA 204 reporting are slow and manual.",
    currentProcess:
      "Lot data appears to span TraceGains, NetSuite and the warehouse store, but the follow-up call suggests genealogy may actually live in a standalone spreadsheet. No single lineage owner exists.",
    businessImpact:
      "A slow or incomplete recall risks regulatory exposure under FSMA 204 and brand damage. Maintaining lineage by hand also consumes scarce engineering capacity.",
    stakeholders: [
      "Rafael Rodas, COO",
      "Warehouse Manager",
      "Quality & Compliance lead",
    ],
    evidence: [
      {
        finding: "FSMA 204 and GS1 traceability are consuming development capacity",
        evidence: "public-inference",
        source: SRC_PUBLIC,
        sourceType: "Public-source inference",
        date: "12 Aug 2026",
        visibility: "public",
        excerpt:
          "Public FSMA 204 timelines plus a traceability-analyst job posting suggest lot-level traceability is absorbing meaningful internal roadmap capacity.",
      },
      {
        finding: "Lot genealogy is stitched across multiple systems",
        evidence: "public-inference",
        source: SRC_PUBLIC,
        sourceType: "Public-source inference",
        date: "12 Aug 2026",
        visibility: "public",
        excerpt:
          "The system footprint implies lot data spans TraceGains, NetSuite and the warehouse store, with no unified genealogy.",
      },
    ],
    questions: [
      {
        id: "q4",
        question:
          "Which system is the current source of truth for inventory, production, and lot genealogy?",
        answered: true,
        answer:
          "Client indicated lot genealogy is kept in a standalone spreadsheet — contradicting the inferred TraceGains/NetSuite map. To validate.",
      },
      {
        id: "q6",
        question:
          "Which product lines fall under FSMA 204, and what is the current lot-tracking method?",
        answered: false,
        answer: "Not yet answered — confirm in-scope SKUs and tracking method.",
      },
      {
        id: "q7",
        question:
          "Walk me through how a finished lot moves from quality checks to released inventory.",
        answered: false,
        answer: "Not yet answered.",
      },
    ],
    assumptions: [
      "FSMA 204 applies to at least the refrigerated lines.",
      "A single lineage view can be built over existing systems.",
    ],
    unknowns: [
      "Whether lot genealogy lives in a system or a spreadsheet.",
      "Which SKUs are in FSMA 204 scope.",
    ],
    confidenceReason:
      "Medium — the regulatory pressure is well-evidenced from public sources, but the system of record is contested and not yet client-confirmed. A recent call contradicts the inferred system map.",
    nextAction:
      "Validate the lot-genealogy source of truth and confirm in-scope SKUs before scoping the traceability build.",
    validationAction:
      "Ask: “Where does lot genealogy actually live today — a system or a spreadsheet — and which SKUs fall under FSMA 204?” Confirm before assuming a traceability gap.",
    lastUpdated: "13 Aug 2026",
    estValue: "$0.4M–0.7M / yr (risk-avoidance)",
  },
  {
    id: "opp-planning",
    name: "Supplier and Production Planning",
    priority: "medium",
    confidence: "low",
    status: "identified",
    summary:
      "Align demand and production planning with real-time production state so plans stop working from stale availability.",
    problem:
      "Planning consumes availability that is already a day stale, so production and demand drift out of sync and supplier scheduling is weakened.",
    currentProcess:
      "Netstock produces demand and inventory plans from NetSuite data that lags actual production, and planners may override manually. PLC / plant-automation data is not linked to inventory or lot records.",
    businessImpact:
      "Stale inputs cause over- and under-production, excess inventory and expedite costs, and weaken supplier scheduling — an effect magnified as the plant scales.",
    stakeholders: [
      "Rafael Rodas, COO",
      "Planning lead",
      "Procurement",
    ],
    evidence: [
      {
        finding: "Planning consumes availability that is already a day stale",
        evidence: "public-inference",
        source: SRC_PUBLIC,
        sourceType: "Public-source inference",
        date: "12 Aug 2026",
        visibility: "public",
        excerpt:
          "NetSuite availability feeding Netstock is a day behind actual production, so demand and production planning drift out of sync.",
      },
      {
        finding: "PLC / plant-automation data is not linked to inventory or lot records",
        evidence: "public-inference",
        source: SRC_PUBLIC,
        sourceType: "Public-source inference",
        date: "12 Aug 2026",
        visibility: "public",
        excerpt:
          "Line automation appears isolated from ERP/WMS, so the floor generates data that never reaches the systems planning depends on.",
      },
      {
        finding: "A recent capacity expansion appears to have increased throughput",
        evidence: "public-inference",
        source: SRC_PUBLIC,
        sourceType: "Public-source inference",
        date: "12 Aug 2026",
        visibility: "public",
        excerpt:
          "Public coverage references a line expansion and higher volume, which magnifies the cost of every planning error.",
      },
    ],
    questions: [
      {
        id: "q9",
        question:
          "What role does Netstock play in setting the constrained production plan?",
        answered: false,
        answer: "Not yet answered — confirm how Netstock output feeds production.",
      },
      {
        id: "q10",
        question:
          "What machine and downtime signals are retained from the plant PLCs?",
        answered: false,
        answer: "Not yet answered.",
      },
    ],
    assumptions: [
      "Netstock output drives the production plan.",
      "Demand-to-production drift is a data problem, not only a process one.",
    ],
    unknowns: [
      "Whether planners trust current availability and how often the plan is overridden.",
      "What PLC / downtime data exists and where it lands today.",
    ],
    confidenceReason:
      "Low — this opportunity rests entirely on public-source inference. There is no client confirmation yet of the planning workflow or the value at stake.",
    nextAction:
      "Confirm how Netstock feeds production and whether planners trust current availability before pursuing this.",
    validationAction:
      "Ask: “How often is the production plan overridden by hand, and do planners trust the availability they’re working from?” Establish the problem is real before scoping.",
    lastUpdated: "12 Aug 2026",
    estValue: "$0.3M–0.6M / yr (indicative)",
  },
];

/** Combined, indicative annual value range shown in the page summary. */
export const OPP_EST_VALUE_TOTAL = "$1.3M–2.2M / yr";

/* ---------------------------------------------------------------- */
/* Stage-aware helpers (Introductory / Discovery / Account Expansion) */
/* ---------------------------------------------------------------- */

/** Domain tags — used to decide stakeholder relevance on a first call. */
export const OPP_DOMAINS: Record<string, FocusDomain[]> = {
  "opp-inventory": ["manufacturing", "supply-chain"],
  "opp-traceability": ["quality", "supply-chain"],
  "opp-planning": ["supply-chain", "manufacturing"],
};

/** Financial value is only shown once evidence is strong enough to
   stand behind it — high confidence or a confirmed status. Before that
   we show a qualitative "potential impact" instead of a number. */
export function hasSufficientEvidence(o: Opportunity, status: OppStatus): boolean {
  return status === "confirmed" || o.confidence === "high";
}

export type ImpactLevel = "high" | "moderate" | "emerging";

export const impactMeta: Record<
  ImpactLevel,
  { label: string; tone: "amber" | "neutral" | "info" }
> = {
  high: { label: "High potential impact", tone: "amber" },
  moderate: { label: "Moderate potential impact", tone: "neutral" },
  emerging: { label: "Emerging — needs validation", tone: "info" },
};

/** Qualitative impact used on introductory calls (never a $ figure). */
export function potentialImpact(o: Opportunity): ImpactLevel {
  if (o.priority === "high" && o.confidence !== "low") return "high";
  if (o.confidence === "low") return "emerging";
  return "moderate";
}
