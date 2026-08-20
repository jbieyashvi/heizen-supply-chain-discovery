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

export type ConfLevel = "low" | "medium" | "high";

/** One optional AI-suggested follow-up, shown after an answer is captured.
   Advisory only — the consultant chooses whether to use it. */
export interface AiFollowUp {
  question: string;
  why: string;
}

/** The confidence effect a captured answer has on an opportunity. */
export interface EvidenceImpact {
  opportunityId: string;
  opportunity: string;
  from: ConfLevel;
  to: ConfLevel;
  reason: string;
  nextQuestionId: string;
  nextReason: string;
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
  /** Set when a good answer here shifts an opportunity's confidence. */
  evidenceImpact?: EvidenceImpact;
  /** Optional AI-suggested probe surfaced once an answer is captured. */
  aiFollowUp?: AiFollowUp;
  /** When this question is the right one to ask (Discovery Call detail). */
  useWhen?: string;
  /** When to skip it (Discovery Call detail). */
  skipWhen?: string;
  /** Conditional follow-ups keyed to the likely answers you might hear. */
  answerBranches?: { likely: string; followUp: string }[];
}

/* Confirmed problem areas for the Discovery Call, in first-to-last order.
   Questions group under these (via relatedOpportunity). */
export const PROBLEM_AREAS: string[] = [
  "Manufacturing execution visibility",
  "Traceability & recall readiness",
  "NetSuite operational support",
];

export interface OpportunityConfidence {
  id: string;
  name: string;
  level: ConfLevel;
  evidenceCount: number;
  openUnknowns: number;
  biggestUncertainty: string;
  nextQuestionId: string;
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
    aiFollowUp: {
      question:
        "During peak, how many orders get promised against inventory that's already a day old?",
      why: "Ties the 24-hour lag to at-risk revenue, which sizes the business case.",
    },
    stakeholder: "Rafael Rodas, COO",
    estMinutes: 2,
    criticalUnknown: true,
    shortlisted: true,
    recommendedIndex: 1,
    evidenceImpact: {
      opportunityId: "opp-1",
      opportunity: "Manufacturing execution visibility",
      from: "medium",
      to: "high",
      reason:
        "The client quantified the ~24-hour lag and its peak-demand cost, confirming the core pain.",
      nextQuestionId: "q11",
      nextReason:
        "Confirm who owns production-data entry so the fix can be scoped to a real workflow.",
    },
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
    aiFollowUp: {
      question:
        "At which handoff do corrections most often get introduced or caught?",
      why: "Pinpoints where source-side capture would remove the most rework.",
    },
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
    aiFollowUp: {
      question:
        "Which of those diligence figures took longest to assemble, and who pulled them?",
      why: "Reveals a reporting gap leadership already feels — and a ready-made success metric.",
    },
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
    aiFollowUp: {
      question:
        "If lot genealogy lives in a spreadsheet, who maintains it and how often is it reconciled?",
      why: "Confirms the real source of truth before traceability scope is committed.",
    },
    stakeholder: "Rafael Rodas, COO",
    estMinutes: 2,
    criticalUnknown: true,
    shortlisted: true,
    recommendedIndex: 5,
    evidenceImpact: {
      opportunityId: "opp-2",
      opportunity: "Traceability & recall readiness",
      from: "medium",
      to: "low",
      reason:
        "Client says lot genealogy is kept in a standalone spreadsheet — contradicting the inferred TraceGains/NetSuite map.",
      nextQuestionId: "q6",
      nextReason:
        "Re-scope traceability around a manual source: confirm which SKUs and the lot-tracking method.",
    },
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
    aiFollowUp: {
      question:
        "What's the internal fallback if no support decision is made before October?",
      why: "Surfaces the cost of inaction and sharpens the case for managed support.",
    },
    stakeholder: "John Thompson, CFO",
    estMinutes: 2,
    criticalUnknown: true,
    shortlisted: true,
    recommendedIndex: 8,
    evidenceImpact: {
      opportunityId: "opp-3",
      opportunity: "NetSuite operational support",
      from: "medium",
      to: "high",
      reason:
        "Client named a decision owner and a timeline to replace ACS support before peak.",
      nextQuestionId: "q3",
      nextReason:
        "Tie the support gap to the diligence data asks to frame the commercial case.",
    },
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
    aiFollowUp: {
      question:
        "What would a mock recall look like end-to-end with today's tooling?",
      why: "Turns FSMA 204 exposure into a concrete, testable readiness gap.",
    },
    stakeholder: "Rafael Rodas, COO",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: true,
    recommendedIndex: 6,
    evidenceImpact: {
      opportunityId: "opp-2",
      opportunity: "Traceability & recall readiness",
      from: "low",
      to: "medium",
      reason:
        "Client identified the in-scope FSMA 204 SKUs and today's lot-tracking method, narrowing the gap.",
      nextQuestionId: "q7",
      nextReason:
        "Trace a finished lot from quality to release to find where lineage breaks.",
    },
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
    aiFollowUp: {
      question:
        "Where does lot lineage most often break between quality sign-off and release?",
      why: "Locates the seam where a single lineage view would add the most value.",
    },
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
    aiFollowUp: {
      question:
        "Do the GS1 case labels carry lot data downstream, or is it re-keyed?",
      why: "Identifies whether labelling is the seam where traceability data is lost.",
    },
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
  /* --- Conversation-tree asks (Discovery Questions screen) ---------------
     Bank records behind the tree nodes that had none, so every node can sit
     on the call agenda and flow into Call Mode. Off the agenda by default. */
  {
    id: "i-mfg-context",
    question:
      "Walk me through what the plant makes and how production is set up today.",
    priority: "medium",
    type: "workflow",
    area: "production",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding:
      "Public signals point to added capacity and a fast-growing refrigerated range.",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Opens the call on familiar ground and gives you the shape of the operation before probing.",
    decision:
      "Which line, shift or product family the discovery round should anchor on.",
    listenFor: [
      "Product mix and volumes",
      "Number of lines / shifts",
      "Recent capacity changes",
    ],
    evidenceToClose:
      "A first-hand sketch of lines, shifts and where volume is growing fastest.",
    partial: null,
    followUps: [
      "Which line or shift feels the strain first when volume steps up?",
    ],
    stakeholder: "Meera Iyer, VP Operations",
    estMinutes: 3,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 13,
  },
  {
    id: "i-mfg-priorities",
    question:
      "What are your biggest operational priorities as you scale over the next few quarters?",
    priority: "medium",
    type: "stakeholder",
    area: "demand",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding:
      "Growth and co-manufacturing announcements imply throughput targets without added headcount.",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Surfaces what Meera is measured on, so you can frame value against it.",
    decision:
      "How the proposal's value story is framed against leadership's own targets.",
    listenFor: [
      "Throughput / service goals",
      "Cost or quality pressure",
      "Any board or growth targets",
    ],
    evidenceToClose:
      "Priorities in the client's own words, ideally with a number attached.",
    partial: null,
    followUps: ["Which of those priorities has a number attached to it today?"],
    stakeholder: "Meera Iyer, VP Operations",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 14,
  },
  {
    id: "i-mfg-pain",
    question:
      "As volume grows, where does keeping production and inventory data accurate get hardest?",
    priority: "high",
    type: "workflow",
    area: "production",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding:
      "Hiring and capacity signals suggest manual capture is already under strain.",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Gently surfaces the paper-to-ERP lag without leading with a solution.",
    decision:
      "Whether execution visibility is the lead pain the first phase should target.",
    listenFor: [
      "Manual data entry",
      "Timing of inventory updates",
      "Firefighting or reconciliation",
    ],
    evidenceToClose:
      "The client naming where accuracy breaks first, unprompted.",
    partial: null,
    followUps: [
      "Which decisions get made on numbers you already suspect are stale?",
    ],
    stakeholder: "Meera Iyer, VP Operations",
    estMinutes: 3,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 15,
  },
  {
    id: "i-sc-process",
    question:
      "How do you track inventory and lot information from production through to dispatch?",
    priority: "high",
    type: "workflow",
    area: "quality",
    relatedOpportunity: "Traceability & recall readiness",
    relatedFinding:
      "Research infers lot data is spread across TraceGains, NetSuite and warehouse records.",
    relatedFindingEvidence: "public-inference",
    whyItMatters: "Maps the visibility chain and where traceability could break.",
    decision:
      "Where the traceability workstream starts — systems integration or consolidating manual sources.",
    listenFor: [
      "Systems in the path",
      "Manual steps",
      "Where lot data is created",
    ],
    evidenceToClose:
      "The end-to-end lot path named system by system, including any spreadsheets.",
    partial: null,
    followUps: [
      "If a retailer called about a lot right now, how long would the full trace take?",
    ],
    stakeholder: "Meera Iyer, VP Operations",
    estMinutes: 3,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 16,
  },
  {
    id: "i-tech-process",
    question:
      "Which systems run operations day to day — NetSuite, Netstock, Power BI — and where do they not talk to each other?",
    priority: "high",
    type: "data",
    area: "data-systems",
    relatedOpportunity: "NetSuite operational support",
    relatedFinding:
      "The public stack — NetSuite, Netstock, Power BI — implies hand-built bridges between systems.",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Confirms the stack and finds the integration seams to explore later.",
    decision: "Which integration seams a build would close first.",
    listenFor: [
      "Named systems",
      "Manual bridges between them",
      "Reporting gaps",
    ],
    evidenceToClose: "A confirmed system map with the manual bridges named.",
    partial: null,
    followUps: ["Which of those hand-built bridges breaks most often?"],
    stakeholder: "Meera Iyer, VP Operations",
    estMinutes: 3,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 17,
  },
  {
    id: "i-sc-impact",
    question:
      "When availability or traceability slips, what does that cost you operationally?",
    priority: "high",
    type: "commercial",
    area: "demand",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding:
      "Peak-season strain suggests short-ships and expedites are absorbing the drift.",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Turns process gaps into business impact in the client's own words.",
    decision:
      "How the business case is sized — service, compliance or cost recovery.",
    listenFor: [
      "Short-ships or expedites",
      "Recall / audit risk",
      "Overtime or safety stock",
    ],
    evidenceToClose:
      "A client-stated cost — orders shorted, hours reconciling, or expedite spend.",
    partial: null,
    followUps: [
      "Which of those costs shows up on a report leadership already reads?",
    ],
    stakeholder: "Meera Iyer, VP Operations",
    estMinutes: 3,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 18,
  },
  {
    id: "planning-diagnostic",
    question:
      "How often does the weekly plan get overridden on the floor, and what usually triggers it?",
    priority: "high",
    type: "validation",
    area: "demand",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding:
      "Research suggests the plan consumes availability that is already a day stale.",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Override frequency reveals whether planning or execution data is the weaker link.",
    decision:
      "Whether better planning inputs or floor-level execution data comes first.",
    listenFor: [
      "Override frequency per week",
      "Who authorises changes",
      "Stale availability as the trigger",
    ],
    evidenceToClose:
      "A rough override count and the trigger named for the last one.",
    partial: null,
    followUps: [
      "Walk me through the last override — what did the plan say, and what did the floor do?",
    ],
    stakeholder: "Rafael Rodas, COO",
    estMinutes: 3,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 19,
  },
  {
    id: "inventory-evidence",
    question:
      "Could you share a recent week of inventory adjustments and short-ship reports so we can size the drift?",
    priority: "medium",
    type: "data",
    area: "production",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding:
      "Morning reconciliation rituals imply a steady stream of inventory adjustments.",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Adjustment volume is the hard number that turns “counts drift” into a cost the CFO recognises.",
    decision:
      "How the value of accurate, real-time inventory is quantified in the proposal.",
    listenFor: [
      "Willingness to share reports",
      "Who pulls the data",
      "Any sensitivity about sharing",
    ],
    evidenceToClose: "One week of adjustment and short-ship data in hand.",
    partial: null,
    followUps: ["Who on your side can pull that export, and in what format?"],
    stakeholder: "Warehouse Manager",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 20,
  },
  {
    id: "planning-evidence",
    question:
      "Could you share last quarter's forecast-versus-actuals by SKU family?",
    priority: "medium",
    type: "data",
    area: "demand",
    relatedOpportunity: "Manufacturing execution visibility",
    relatedFinding:
      "Netstock in the stack implies forecast-versus-actuals reporting already exists.",
    relatedFindingEvidence: "public-inference",
    whyItMatters:
      "Forecast error by family shows where better inputs would move service or waste first.",
    decision: "Which SKU families anchor the planning improvement story.",
    listenFor: [
      "Whether the report exists today",
      "Which families miss worst",
      "Who owns forecast accuracy",
    ],
    evidenceToClose:
      "Forecast-versus-actuals for one quarter, split by SKU family.",
    partial: null,
    followUps: [
      "Which family's misses hurt most — service penalties or write-offs?",
    ],
    stakeholder: "John Thompson, CFO",
    estMinutes: 2,
    criticalUnknown: false,
    shortlisted: false,
    recommendedIndex: 21,
  },
];

/* Discovery-Call detail guidance, merged into the questions above.
   Kept separate so the question literals stay readable. */
const discoveryGuidance: Record<
  string,
  Pick<DiscoveryQuestion, "useWhen" | "skipWhen" | "answerBranches">
> = {
  q1: {
    useWhen: "Early — it anchors the whole manufacturing-visibility thread.",
    skipWhen: "The client already gave a precise, current delay figure in writing.",
    answerBranches: [
      { likely: "\"About a day / next morning\"", followUp: "What does that delay cost you during peak?" },
      { likely: "\"It's basically real-time\"", followUp: "Then where do availability errors actually come from?" },
    ],
  },
  q2: {
    useWhen: "Right after the lag is confirmed, to map where to intervene.",
    skipWhen: "The end-to-end workflow is already documented from a prior call.",
    answerBranches: [
      { likely: "Many manual handoffs", followUp: "Which handoff introduces the most errors or rework?" },
      { likely: "Mostly automated already", followUp: "What's the one manual step that still trips you up?" },
    ],
  },
  q3: {
    useWhen: "When a commercial/leadership stakeholder is on the call.",
    skipWhen: "There was no recent diligence, financing or board data request.",
    answerBranches: [
      { likely: "Named specific metrics", followUp: "Which of those was hardest to produce, and who pulled it?" },
      { likely: "\"Nothing unusual\"", followUp: "What operational number does leadership ask for most?" },
    ],
  },
  q4: {
    useWhen: "Before scoping any traceability or visibility work.",
    skipWhen: "The system of record for each domain is already confirmed.",
    answerBranches: [
      { likely: "One clear system named", followUp: "Where does reconciliation between systems happen?" },
      { likely: "\"A spreadsheet\"", followUp: "Who maintains it and how often is it reconciled?" },
    ],
  },
  q5: {
    useWhen: "Whenever the ACS October deadline is in scope.",
    skipWhen: "A renewal or replacement is already signed and owned.",
    answerBranches: [
      { likely: "No owner yet", followUp: "What's the internal fallback if no decision is made by October?" },
      { likely: "Owner + timeline exist", followUp: "What would make an external managed option worth considering?" },
    ],
  },
  q6: {
    useWhen: "When traceability / FSMA 204 is a live concern for the client.",
    skipWhen: "None of the client's SKUs fall under FSMA 204.",
    answerBranches: [
      { likely: "Manual lot tracking", followUp: "What would a mock recall look like end-to-end today?" },
      { likely: "System-based tracking", followUp: "Where does the lineage break between systems?" },
    ],
  },
  q7: {
    useWhen: "After the source of truth for lots is established.",
    skipWhen: "The quality-to-release flow is already mapped.",
    answerBranches: [
      { likely: "Clear sign-off step", followUp: "How does release tie back to inventory records?" },
      { likely: "Ad-hoc / unclear", followUp: "Where does lot lineage most often get lost?" },
    ],
  },
  q8: {
    useWhen: "When labelling could be the seam where lot data is created or lost.",
    skipWhen: "Labelling is out of scope for the engagement.",
    answerBranches: [
      { likely: "Labels carry lot/GS1 data", followUp: "Does that data flow downstream or get re-keyed?" },
      { likely: "Generic labels", followUp: "How is lot data attached after labelling?" },
    ],
  },
  q9: {
    useWhen: "When demand-to-production alignment might be in scope.",
    skipWhen: "Planning isn't a pain the client raises.",
    answerBranches: [
      { likely: "Plan often overridden", followUp: "What triggers the manual overrides?" },
      { likely: "Planners trust the data", followUp: "Then where does availability drift actually show up?" },
    ],
  },
  q10: {
    useWhen: "When exploring whether OT/machine data could feed visibility.",
    skipWhen: "OT integration is clearly out of scope or budget.",
    answerBranches: [
      { likely: "Data is retained", followUp: "Is any of it reaching NetSuite or Power BI today?" },
      { likely: "Nothing retained", followUp: "What would it take to start capturing downtime?" },
    ],
  },
  q11: {
    useWhen: "When designing the capture workflow and its owners.",
    skipWhen: "Ownership of production-data entry is already clear.",
    answerBranches: [
      { likely: "A named owner", followUp: "How are corrections handled when a posting is wrong?" },
      { likely: "\"Nobody really\"", followUp: "Who should own it as you scale?" },
    ],
  },
  q12: {
    useWhen: "Late — to frame the business case and next step.",
    skipWhen: "The funding outcome and sponsor are already agreed.",
    answerBranches: [
      { likely: "A specific target", followUp: "Who signs off on prioritising that next quarter?" },
      { likely: "Vague / unsure", followUp: "What happens if this slips another two quarters?" },
    ],
  },
};
clioQuestions.forEach((q) => {
  const g = discoveryGuidance[q.id];
  if (g) {
    q.useWhen = g.useWhen;
    q.skipWhen = g.skipWhen;
    q.answerBranches = g.answerBranches;
  }
});

/* ================================================================
   Introductory-Call question set (broad, stakeholder-relevant)

   6–8 questions grouped by domain, ordered within each domain by the
   conversation-type sequence. Tuned for Meera Iyer (VP Operations):
   Manufacturing and Supply Chain lead; Procurement / SAP questions are
   set aside (skip) and excluded from the default sequence.
   ================================================================ */

export type IntroDomain =
  | "tech-data"
  | "manufacturing"
  | "supply-chain"
  | "procurement";

export const INTRO_DOMAINS: {
  id: IntroDomain;
  label: string;
  /** Prioritised for this stakeholder (shown first, flagged). */
  prioritised: boolean;
}[] = [
  { id: "manufacturing", label: "Manufacturing", prioritised: true },
  { id: "supply-chain", label: "Supply Chain", prioritised: true },
  { id: "tech-data", label: "Technology & Data", prioritised: false },
  { id: "procurement", label: "Procurement", prioritised: false },
];

/** Conversation-type sequence — questions within a domain follow this order. */
export type IntroType =
  | "context"
  | "priorities"
  | "process"
  | "pain"
  | "impact"
  | "budget"
  | "next-step";

export const INTRO_TYPES: { id: IntroType; label: string; order: number }[] = [
  { id: "context", label: "Context", order: 1 },
  { id: "priorities", label: "Current priorities", order: 2 },
  { id: "process", label: "Current process", order: 3 },
  { id: "pain", label: "Pain / friction", order: 4 },
  { id: "impact", label: "Business impact", order: 5 },
  { id: "budget", label: "Budget / intent", order: 6 },
  { id: "next-step", label: "Next step", order: 7 },
];

export function introTypeLabel(t: IntroType) {
  return INTRO_TYPES.find((x) => x.id === t)?.label ?? t;
}
export function introTypeOrder(t: IntroType) {
  return INTRO_TYPES.find((x) => x.id === t)?.order ?? 99;
}
export function introDomainLabel(d: IntroDomain) {
  return INTRO_DOMAINS.find((x) => x.id === d)?.label ?? d;
}

export type IntroFlag = "start-here" | "ask-next" | "optional" | "skip";

export const INTRO_FLAG_META: Record<
  IntroFlag,
  { label: string; tone: "accent" | "info" | "neutral" | "amber" }
> = {
  "start-here": { label: "Start here", tone: "accent" },
  "ask-next": { label: "Ask next", tone: "info" },
  optional: { label: "Optional follow-up", tone: "neutral" },
  skip: { label: "Skip when irrelevant", tone: "amber" },
};

export interface IntroQuestion {
  id: string;
  question: string;
  domain: IntroDomain;
  type: IntroType;
  flag: IntroFlag;
  /** Why this is worth asking on a first call. */
  intent: string;
  listenFor: string[];
  /** In the default sequence for this stakeholder. */
  inDefault: boolean;
}

export const INTRO_STAKEHOLDER_NOTE =
  "Sequenced for Meera Iyer (VP Operations) — Manufacturing and Supply Chain lead. Procurement / SAP questions are set aside as not relevant to this stakeholder; filter to Procurement to view them.";

export const clioIntroQuestions: IntroQuestion[] = [
  /* --- Manufacturing (prioritised) --- */
  {
    id: "i-mfg-context",
    question:
      "Walk me through what the plant makes and how production is set up today.",
    domain: "manufacturing",
    type: "context",
    flag: "start-here",
    intent:
      "Opens the call on familiar ground and gives you the shape of the operation before probing.",
    listenFor: ["Product mix and volumes", "Number of lines / shifts", "Recent capacity changes"],
    inDefault: true,
  },
  {
    id: "i-mfg-priorities",
    question:
      "What are your biggest operational priorities as you scale over the next few quarters?",
    domain: "manufacturing",
    type: "priorities",
    flag: "ask-next",
    intent: "Surfaces what Meera is measured on, so you can frame value against it.",
    listenFor: ["Throughput / service goals", "Cost or quality pressure", "Any board or growth targets"],
    inDefault: true,
  },
  {
    id: "i-mfg-pain",
    question:
      "As volume grows, where does keeping production and inventory data accurate get hardest?",
    domain: "manufacturing",
    type: "pain",
    flag: "ask-next",
    intent: "Gently surfaces the paper-to-ERP lag without leading with a solution.",
    listenFor: ["Manual data entry", "Timing of inventory updates", "Firefighting or reconciliation"],
    inDefault: true,
  },
  {
    id: "i-mfg-next",
    question:
      "If something we discuss today looks worth pursuing, what would a good next step look like for you?",
    domain: "manufacturing",
    type: "next-step",
    flag: "optional",
    intent: "Tests intent and sets up a concrete follow-up without pushing.",
    listenFor: ["Willingness to go deeper", "Who else should be involved", "Any timing constraints"],
    inDefault: true,
  },
  /* --- Supply Chain (prioritised) --- */
  {
    id: "i-sc-process",
    question:
      "How do you track inventory and lot information from production through to dispatch?",
    domain: "supply-chain",
    type: "process",
    flag: "ask-next",
    intent: "Maps the visibility chain and where traceability could break.",
    listenFor: ["Systems in the path", "Manual steps", "Where lot data is created"],
    inDefault: true,
  },
  {
    id: "i-sc-impact",
    question:
      "When availability or traceability slips, what does that cost you operationally?",
    domain: "supply-chain",
    type: "impact",
    flag: "optional",
    intent: "Turns process gaps into business impact in the client's own words.",
    listenFor: ["Short-ships or expedites", "Recall / audit risk", "Overtime or safety stock"],
    inDefault: true,
  },
  /* --- Technology & Data --- */
  {
    id: "i-tech-process",
    question:
      "Which systems run operations day to day — NetSuite, Netstock, Power BI — and where do they not talk to each other?",
    domain: "tech-data",
    type: "process",
    flag: "ask-next",
    intent: "Confirms the stack and finds the integration seams to explore later.",
    listenFor: ["Named systems", "Manual bridges between them", "Reporting gaps"],
    inDefault: true,
  },
  {
    id: "i-tech-budget",
    question:
      "With NetSuite ACS support ending in October, how are you thinking about support and any tech investment?",
    domain: "tech-data",
    type: "budget",
    flag: "optional",
    intent: "Tests appetite and timing for investment against a known, dated trigger.",
    listenFor: ["Decision owner", "Budget window", "Build vs. managed leaning"],
    inDefault: true,
  },
  /* --- Procurement (set aside for this stakeholder) --- */
  {
    id: "i-proc-context",
    question: "How is procurement structured, and which systems (e.g. SAP) support it?",
    domain: "procurement",
    type: "context",
    flag: "skip",
    intent: "Only relevant if a procurement or finance stakeholder joins — not Meera's remit.",
    listenFor: ["Procurement systems", "Who owns supplier relationships"],
    inDefault: false,
  },
  {
    id: "i-proc-process",
    question: "How do you manage supplier onboarding and purchase approvals today?",
    domain: "procurement",
    type: "process",
    flag: "skip",
    intent: "Set aside for a first call with an operations leader; revisit with procurement.",
    listenFor: ["Approval workflow", "Supplier data quality"],
    inDefault: false,
  },
];

/* ---------- Discovery confidence (baseline, before this round's answers) ---------- */
export const clioConfidence: OpportunityConfidence[] = [
  {
    id: "opp-1",
    name: "Manufacturing execution visibility",
    level: "medium",
    evidenceCount: 4,
    openUnknowns: 2,
    biggestUncertainty:
      "Exact daily volume and who owns production-data entry.",
    nextQuestionId: "q1",
  },
  {
    id: "opp-2",
    name: "Traceability & recall readiness",
    level: "low",
    evidenceCount: 2,
    openUnknowns: 3,
    biggestUncertainty:
      "Whether lot genealogy lives in a system or a spreadsheet.",
    nextQuestionId: "q4",
  },
  {
    id: "opp-3",
    name: "NetSuite operational support",
    level: "medium",
    evidenceCount: 3,
    openUnknowns: 2,
    biggestUncertainty: "Owner and timeline to replace ACS support.",
    nextQuestionId: "q5",
  },
];

/* Curated "what changed" narrative for the Call Summary. Includes one
   conflicting-evidence example where research and the client disagree. */
export const clioWhatChanged = {
  confirmed: [
    "Production completion is recorded on paper and keyed in the next morning — the cause of the 24-hour inventory lag.",
    "NetSuite ACS support ends in October with no renewal.",
  ],
  newFindings: [
    "A named owner and a Q4 window exist for the ACS support decision.",
    "FSMA 204 scope is limited to the refrigerated lines.",
  ],
  conflict: {
    opportunity: "Traceability & recall readiness",
    researchSaid:
      "Public research inferred lot genealogy spans TraceGains and NetSuite.",
    clientSaid:
      "The client said lot genealogy is tracked in a standalone spreadsheet, not TraceGains.",
    implication:
      "Traceability scope shifts from system integration to consolidating a manual source — validate before proposing.",
  },
  recommendedNext:
    "Confirm who owns production-data entry, then validate the lot-genealogy source of truth.",
};

export function questionById(id: string): DiscoveryQuestion | undefined {
  return clioQuestions.find((q) => q.id === id);
}

export const confLabel: Record<ConfLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
export const confTone: Record<ConfLevel, "red" | "amber" | "green"> = {
  low: "red",
  medium: "amber",
  high: "green",
};
