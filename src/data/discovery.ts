import type { EvidenceLevel } from "./types";

export type QPriority = "critical" | "high" | "medium";
export type QType =
  | "workflow"
  | "commercial"
  | "data"
  | "stakeholder"
  | "validation";
export type QArea =
  | "production"
  | "quality"
  | "data-systems"
  | "demand"
  | "procurement";

/** Outcome captured during/after a call. null = not yet touched. */
export type QOutcome =
  | null
  | "answered"
  | "partial"
  | "not-answered"
  | "in-progress"
  | "skipped"
  | "not-relevant";
export type EvidenceStrength = "strong" | "medium" | "weak";
export type Completeness = "answered" | "partial" | "not-answered";

export const QUESTION_TYPES: { id: QType; label: string }[] = [
  { id: "workflow", label: "Workflow & decision" },
  { id: "commercial", label: "Commercial" },
  { id: "data", label: "Data readiness" },
  { id: "stakeholder", label: "Stakeholder" },
  { id: "validation", label: "Validation" },
];

export const QUESTION_AREAS: { id: QArea; label: string; short: string }[] = [
  { id: "production", label: "Production Scheduling & Execution", short: "Production" },
  {
    id: "quality",
    label: "Quality, Traceability & Regulatory Compliance",
    short: "Quality & Traceability",
  },
  {
    id: "data-systems",
    label: "Supply Chain Data, Master Data, Systems & Analytics",
    short: "Data & Systems",
  },
  { id: "demand", label: "Demand Planning & Forecasting", short: "Demand Planning" },
  {
    id: "procurement",
    label: "Procurement & Supplier Management",
    short: "Procurement",
  },
];

export const PRIORITIES: { id: QPriority; label: string }[] = [
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
];

export function typeLabel(t: QType) {
  return QUESTION_TYPES.find((x) => x.id === t)?.label ?? t;
}
export function areaLabel(a: QArea) {
  return QUESTION_AREAS.find((x) => x.id === a)?.label ?? a;
}
export function areaShort(a: QArea) {
  return QUESTION_AREAS.find((x) => x.id === a)?.short ?? a;
}

export interface PartialEvidence {
  summary: string;
  evidence: EvidenceLevel;
  remainingUnknown: string;
  worthAsking: string;
}

export interface DiscoveryQuestion {
  id: string;
  question: string;
  priority: QPriority;
  type: QType;
  area: QArea;
  relatedOpportunity: string;
  relatedFinding: string;
  relatedFindingEvidence: EvidenceLevel;
  whyItMatters: string;
  decision: string;
  listenFor: string[];
  evidenceToClose: string;
  partial: PartialEvidence | null;
  followUps: string[];
  stakeholder: string;
  estMinutes: number;
  criticalUnknown: boolean;
  shortlisted: boolean;
  /** 1-based position in the recommended order (lower = earlier). */
  recommendedIndex: number;
}

export const STAKEHOLDER = { name: "Meera Iyer", role: "VP Operations" };
export const MEETING = {
  full: "Tuesday, 18 August 2026",
  date: "Tue, 18 Aug",
  time: "10:30",
  relative: "In 3 days",
};

export const discoveryMeta = {
  round: 2,
  total: 12,
  shortlisted: 8,
  toReview: 4,
  answered: 0,
  criticalUnknowns: 4,
  sourcesProcessed: 3,
  opportunities: 3,
  minutesPerQuestion: 2,
};

/* Recommended order narrative:
   current process → business impact → evidence → decision & next steps */
export const RECOMMENDED_ORDER_NOTE =
  "Current process → business impact → evidence → decisions";

export const clioQuestions: DiscoveryQuestion[] = [
  {
    id: "q1",
    question:
      "How long after production does finished-goods inventory reflect in NetSuite today?",
    priority: "critical",
    type: "workflow",
    area: "production",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding: "Paper-based work-order completion creates a 24-hour inventory lag",
    relatedFindingEvidence: "client-confirmed",
    whyItMatters:
      "Quantifies the inventory lag and its cost during peak demand — the anchor pain for the primary opportunity.",
    decision:
      "Whether source-side capture is scoped as the first phase, and how its value is sized.",
    listenFor: [
      "A specific delay (e.g. 'next morning', '~24 hours')",
      "Whether the delay varies by shift or product line",
      "Any manual reconciliation steps mentioned in passing",
    ],
    evidenceToClose:
      "A specific, client-stated delay figure and its business impact during peak.",
    partial: {
      summary:
        "Research confirms a ~24-hour lag caused by manual, next-morning data entry.",
      evidence: "client-confirmed",
      remainingUnknown:
        "The exact transaction-level cause (posting step vs. data entry) isn't isolated.",
      worthAsking:
        "Confirm the current delay precisely and quantify its cost during peak.",
    },
    followUps: [
      "What operational decision is delayed because inventory is not current?",
      "How is the gap handled today when a customer order comes in?",
    ],
    stakeholder: "Rafael Rodas, COO",
    estMinutes: 2,
    criticalUnknown: true,
    shortlisted: true,
    recommendedIndex: 1,
  },
  {
    id: "q2",
    question:
      "Walk me through how a completed work order moves from the line clipboard into NetSuite.",
    priority: "critical",
    type: "workflow",
    area: "production",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding: "Production completion is recorded on paper and keyed in the next morning",
    relatedFindingEvidence: "client-confirmed",
    whyItMatters:
      "Maps the manual workflow end-to-end so automation targets are concrete, not assumed.",
    decision: "Where in the flow to introduce capture and validation.",
    listenFor: [
      "Number of handoffs and who performs each",
      "Where errors or corrections happen",
      "Any spreadsheets or side systems in the path",
    ],
    evidenceToClose:
      "A step-by-step description of the workflow with owners and touchpoints.",
    partial: {
      summary:
        "Research establishes paper completion at shift end, keyed in the following morning.",
      evidence: "client-confirmed",
      remainingUnknown: "The intermediate touchpoints and error-correction steps.",
      worthAsking: "Get the concrete step sequence to target automation precisely.",
    },
    followUps: ["Where do errors most often get introduced or caught?"],
    stakeholder: "Warehouse Manager",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: true,
    recommendedIndex: 2,
  },
  {
    id: "q3",
    question:
      "What operational or manufacturing data did buyers request during recent diligence?",
    priority: "critical",
    type: "commercial",
    area: "data-systems",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding: "Company is scaling capacity (public context)",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Reveals which metrics leadership already cares about — and where data was hard to produce.",
    decision: "Which outputs to prioritise so the work supports commercial goals.",
    listenFor: [
      "Specific metrics buyers asked for",
      "Data that was slow or hard to assemble",
      "Any diligence findings about operations",
    ],
    evidenceToClose:
      "A list of the diligence data requests and which were difficult to produce.",
    partial: null,
    followUps: ["Which of those figures were hardest to produce, and why?"],
    stakeholder: "John Thompson, CFO",
    estMinutes: 2,
    criticalUnknown: true,
    shortlisted: true,
    recommendedIndex: 4,
  },
  {
    id: "q4",
    question:
      "Which system is the current source of truth for inventory, production, and lot genealogy?",
    priority: "critical",
    type: "data",
    area: "data-systems",
    relatedOpportunity: "Traceability & recall readiness",
    relatedFinding: "Lot genealogy is stitched across multiple systems",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Determines the authoritative system before any traceability or visibility work is scoped.",
    decision: "Which system integrations anchor the solution architecture.",
    listenFor: [
      "One clear system named as source of truth — or several",
      "Where reconciliation happens between systems",
      "Confidence level in the current data",
    ],
    evidenceToClose:
      "A named system of record for each domain, confirmed by the client.",
    partial: {
      summary:
        "Public research suggests lot data spans TraceGains, NetSuite and the warehouse store.",
      evidence: "public-inference",
      remainingUnknown: "The actual system of record for lot genealogy is unconfirmed.",
      worthAsking: "Confirm the authoritative source before scoping traceability.",
    },
    followUps: ["When two systems disagree, which one wins today?"],
    stakeholder: "Rafael Rodas, COO",
    estMinutes: 2,
    criticalUnknown: true,
    shortlisted: true,
    recommendedIndex: 5,
  },
  {
    id: "q5",
    question:
      "What is your plan for NetSuite support once ACS lapses in October?",
    priority: "critical",
    type: "commercial",
    area: "data-systems",
    relatedOpportunity: "NetSuite operational support",
    relatedFinding: "NetSuite ACS support ends in October",
    relatedFindingEvidence: "client-document",
    whyItMatters:
      "A firm deadline creates urgency and a clear entry point for a managed-support offer.",
    decision: "Whether continuity of support is in scope and on what timeline.",
    listenFor: [
      "Whether a decision owner exists",
      "Any internal capacity to absorb support",
      "Appetite for a managed alternative",
    ],
    evidenceToClose: "A named owner and a decision timeline for post-ACS support.",
    partial: {
      summary: "A client document confirms ACS support ends in October with no renewal.",
      evidence: "client-document",
      remainingUnknown: "Ownership and the replacement timeline are unknown.",
      worthAsking: "Confirm who owns the decision and by when.",
    },
    followUps: ["Who would own that decision internally?"],
    stakeholder: "John Thompson, CFO",
    estMinutes: 2,
    criticalUnknown: true,
    shortlisted: true,
    recommendedIndex: 8,
  },
  {
    id: "q6",
    question:
      "Which product lines fall under FSMA 204, and what is the current lot-tracking method?",
    priority: "high",
    type: "workflow",
    area: "quality",
    relatedOpportunity: "Traceability & recall readiness",
    relatedFinding: "FSMA 204 deadlines are pulling forward traceability work",
    relatedFindingEvidence: "market-benchmark",
    whyItMatters:
      "Sizes the traceability and recall-readiness gap with client specifics.",
    decision: "The scope and phasing of traceability work.",
    listenFor: [
      "Which SKUs are in FSMA 204 scope",
      "Current lot-tracking method (manual vs. system)",
      "Compliance deadline pressure",
    ],
    evidenceToClose: "In-scope SKUs and the current tracking method, client-confirmed.",
    partial: {
      summary: "Public FSMA 204 timelines suggest active traceability work.",
      evidence: "public-inference",
      remainingUnknown: "Which SKUs are in scope and the current lot-tracking method.",
      worthAsking: "Confirm scope and method to size the gap.",
    },
    followUps: ["What would a recall look like with today's tooling?"],
    stakeholder: "Rafael Rodas, COO",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: true,
    recommendedIndex: 6,
  },
  {
    id: "q7",
    question:
      "Walk me through how a finished lot moves from quality checks to released inventory.",
    priority: "high",
    type: "workflow",
    area: "quality",
    relatedOpportunity: "Traceability & recall readiness",
    relatedFinding: "Lot genealogy is stitched across multiple systems",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Exposes where lot lineage breaks between quality, inventory and shipping.",
    decision: "Where to consolidate lot lineage into a single view.",
    listenFor: [
      "Where quality sign-off is recorded",
      "How release ties to inventory",
      "Any gaps between systems in the path",
    ],
    evidenceToClose: "A description of the quality-to-release flow with system touchpoints.",
    partial: null,
    followUps: ["Where does lot lineage most often break down?"],
    stakeholder: "Warehouse Manager",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: true,
    recommendedIndex: 3,
  },
  {
    id: "q8",
    question: "Which application currently produces GS1 case labels?",
    priority: "high",
    type: "data",
    area: "quality",
    relatedOpportunity: "Traceability & recall readiness",
    relatedFinding: "Lot genealogy is stitched across multiple systems",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Label generation is often the seam where traceability data is created or lost.",
    decision: "Whether labelling is a fixable seam or a deeper integration need.",
    listenFor: [
      "The specific labelling application",
      "Whether labels carry lot/GS1 data",
      "Manual steps around labelling",
    ],
    evidenceToClose: "The named labelling application and what data it carries.",
    partial: null,
    followUps: ["Do those labels carry lot data downstream?"],
    stakeholder: "Warehouse Manager",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: true,
    recommendedIndex: 7,
  },
  {
    id: "q9",
    question: "What role does Netstock play in setting the constrained production plan?",
    priority: "high",
    type: "workflow",
    area: "demand",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding: "Planning consumes availability that is already a day stale",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Clarifies whether planning drift is a data problem or a process problem.",
    decision: "Whether demand-to-production alignment is in scope.",
    listenFor: [
      "How Netstock output feeds production",
      "Whether planners trust current availability",
      "Manual overrides to the plan",
    ],
    evidenceToClose: "How Netstock and production planning interact in practice.",
    partial: null,
    followUps: ["How often is the plan overridden manually?"],
    stakeholder: "Rafael Rodas, COO",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 9,
  },
  {
    id: "q10",
    question: "What machine and downtime signals are retained from the plant PLCs?",
    priority: "high",
    type: "data",
    area: "production",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding: "PLC/plant automation data is not linked to inventory or lot records",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Determines whether machine data can feed visibility without new instrumentation.",
    decision: "Whether OT integration is feasible in an early phase.",
    listenFor: [
      "What PLC data is retained and where",
      "Any historian or edge collection",
      "Downtime capture method",
    ],
    evidenceToClose: "What machine/downtime data exists and where it lands today.",
    partial: null,
    followUps: ["Is any of that data reaching NetSuite or Power BI today?"],
    stakeholder: "Warehouse Manager",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 10,
  },
  {
    id: "q11",
    question:
      "Who owns production-data entry and correction when work orders are posted late?",
    priority: "high",
    type: "stakeholder",
    area: "production",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding: "Production completion is recorded on paper and keyed in the next morning",
    relatedFindingEvidence: "client-confirmed",
    whyItMatters:
      "Identifies the process owner and where accountability for data quality sits.",
    decision: "Who to involve in designing the capture workflow.",
    listenFor: [
      "A named role or person",
      "How corrections are handled",
      "Whether ownership is shared or unclear",
    ],
    evidenceToClose: "A clear owner for production-data entry and correction.",
    partial: null,
    followUps: ["Who fixes it when a posting is wrong?"],
    stakeholder: "Rafael Rodas, COO",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 11,
  },
  {
    id: "q12",
    question:
      "Which operational outcome would justify prioritising this work in the next quarter?",
    priority: "medium",
    type: "commercial",
    area: "data-systems",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding: "Opportunity prioritisation (to establish)",
    relatedFindingEvidence: "unverified",
    whyItMatters:
      "Surfaces the outcome leadership will fund, framing the business case.",
    decision: "How to frame the proposal's headline outcome.",
    listenFor: [
      "A specific target metric or outcome",
      "Timing pressure tied to a business event",
      "Who signs off on the priority",
    ],
    evidenceToClose: "A client-stated outcome that would justify prioritisation.",
    partial: null,
    followUps: ["What happens if this slips another two quarters?"],
    stakeholder: "John McGuckin, CEO",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 12,
  },
];
