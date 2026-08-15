import type { EvidenceLevel } from "./types";

/* ================================================================
   Clio Snacks — Process Map

   A Level-0 value-chain map (Plan → Source → Make → Quality → Store →
   Deliver) plus a cross-cutting Data & Systems backbone. Coverage and
   health reflect how much client workflow has actually been extracted;
   no health colour is shown for areas with no captured workflow.
   Grounded in the existing Research and Discovery evidence.
   ================================================================ */

export type Coverage = "not-explored" | "partial" | "validated";
export type Health = "unknown" | "healthy" | "friction" | "critical";

export const coverageMeta: Record<Coverage, { label: string }> = {
  "not-explored": { label: "Not explored" },
  partial: { label: "Partial" },
  validated: { label: "Validated" },
};

export const healthMeta: Record<
  Health,
  { label: string; tone: "neutral" | "green" | "amber" | "red" }
> = {
  unknown: { label: "Unknown", tone: "neutral" },
  healthy: { label: "Healthy", tone: "green" },
  friction: { label: "Friction", tone: "amber" },
  critical: { label: "Critical", tone: "red" },
};

export interface NodeEvidence {
  finding: string;
  level: EvidenceLevel;
  source: string;
  date: string;
}
export interface NodeQuestion {
  id: string;
  question: string;
  answered: boolean;
}
export interface NodeOpportunity {
  id: string;
  name: string;
}

export interface ProcessComparison {
  clientWorkflow: string;
  heizenWorkflow: string;
  keyDifference: string;
  implication: string;
  source: string; // shown only because it is source-supported
}

export interface ProcessNodeDetail {
  description: string;
  systems: string[];
  owners: string[];
  evidence: NodeEvidence[];
  painPoints: string[];
  questions: NodeQuestion[];
  opportunities: NodeOpportunity[];
  unknowns: string[];
  nextAction: string;
}

export interface SubProcess extends ProcessNodeDetail {
  id: string;
  name: string;
  coverage: Coverage;
  health: Health;
}

export interface ProcessArea extends ProcessNodeDetail {
  id: string;
  name: string;
  short: string;
  coverage: Coverage;
  health: Health;
  /** Underpins every stage — rendered as a full-width backbone. */
  crossCutting?: boolean;
  suggestedQuestions?: string[];
  subprocesses: SubProcess[];
  comparison?: ProcessComparison;
}

const SRC_DISCOVERY = "Initial discovery call transcript · 10 Aug 2026";
const SRC_NETSUITE = "NetSuite support summary · 11 Aug 2026";
const SRC_PUBLIC = "Company website & public market context · 12 Aug 2026";
const SRC_FOLLOWUP = "Follow-up operations call transcript · 13 Aug 2026";

export const pmapSummary = {
  areas: 7,
  stages: 6,
  enabling: 1,
  explored: 5,
  critical: 2,
  openQuestions: 4,
  refreshed: "13 Aug",
  pendingSources: 2,
  lastUpdated: "13 Aug 2026",
  lastUpdatedSource: "follow-up operations call transcript",
};

export const clioProcessAreas: ProcessArea[] = [
  /* ---------------- Plan ---------------- */
  {
    id: "plan",
    name: "Plan",
    short: "Plan",
    coverage: "partial",
    health: "friction",
    description:
      "Demand and inventory planning is run in Netstock off NetSuite data. Because availability lags actual production by up to a day, the plan works from stale inputs and is corrected by manual overrides.",
    systems: ["Netstock", "NetSuite", "In-house data warehouse"],
    owners: ["Planning lead", "Rafael Rodas, COO"],
    evidence: [
      {
        finding: "Planning consumes availability that is already a day stale",
        level: "public-inference",
        source: SRC_PUBLIC,
        date: "12 Aug 2026",
      },
      {
        finding: "Recent capacity expansion appears to have increased throughput",
        level: "public-inference",
        source: SRC_PUBLIC,
        date: "12 Aug 2026",
      },
    ],
    painPoints: [
      "Plans built on day-old availability drift from reality.",
      "Manual overrides mask the underlying data gap.",
    ],
    questions: [
      {
        id: "q9",
        question:
          "What role does Netstock play in setting the constrained production plan?",
        answered: false,
      },
    ],
    opportunities: [{ id: "opp-planning", name: "Supplier and Production Planning" }],
    unknowns: [
      "Whether planners trust current availability and how often the plan is overridden.",
    ],
    nextAction:
      "Confirm how Netstock output feeds production and how often planners override it.",
    comparison: {
      clientWorkflow:
        "Netstock plans from NetSuite availability that is a day behind actual production.",
      heizenWorkflow:
        "A demand-to-production readiness board aligns planning with real-time production state.",
      keyDifference:
        "Planning inputs are near-real-time rather than batched overnight.",
      implication:
        "Fewer manual overrides and less over/under-production as volume scales.",
      source: SRC_PUBLIC,
    },
    subprocesses: [
      {
        id: "plan-forecast",
        name: "Demand forecast",
        coverage: "partial",
        health: "friction",
        description:
          "Netstock generates demand and replenishment signals from historical NetSuite data.",
        systems: ["Netstock", "NetSuite"],
        owners: ["Planning lead"],
        evidence: [],
        painPoints: ["Forecast inputs lag actual production by ~a day."],
        questions: [],
        opportunities: [],
        unknowns: ["How forecast accuracy is measured today."],
        nextAction: "Confirm the forecast inputs and cadence.",
      },
      {
        id: "plan-constrained",
        name: "Constrained plan",
        coverage: "partial",
        health: "friction",
        description:
          "The demand signal is turned into a constrained production plan against capacity.",
        systems: ["Netstock", "NetSuite"],
        owners: ["Planning lead", "Rafael Rodas, COO"],
        evidence: [],
        painPoints: ["Capacity constraints are reconciled manually."],
        questions: [],
        opportunities: [],
        unknowns: ["Where the constrained plan is authored and stored."],
        nextAction: "Map how constraints are applied to the plan.",
      },
      {
        id: "plan-overrides",
        name: "Manual overrides",
        coverage: "not-explored",
        health: "unknown",
        description: "Planners adjust the plan by hand when availability looks wrong.",
        systems: [],
        owners: [],
        evidence: [],
        painPoints: [],
        questions: [],
        opportunities: [],
        unknowns: ["Frequency and triggers for manual overrides."],
        nextAction: "Ask how often the plan is overridden and why.",
      },
    ],
  },

  /* ---------------- Source ---------------- */
  {
    id: "source",
    name: "Source",
    short: "Source",
    coverage: "not-explored",
    health: "unknown",
    description: "",
    systems: [],
    owners: [],
    evidence: [],
    painPoints: [],
    questions: [],
    opportunities: [],
    unknowns: [
      "Supplier base, master data quality and procurement workflow are all unmapped.",
    ],
    nextAction: "Add a procurement source or ask the supplier-management questions.",
    suggestedQuestions: [
      "How is supplier and item master data maintained today?",
      "Which systems hold purchasing and supplier records?",
    ],
    subprocesses: [],
  },

  /* ---------------- Make ---------------- */
  {
    id: "make",
    name: "Make",
    short: "Make",
    coverage: "validated",
    health: "critical",
    description:
      "Production is completed on paper at shift end and keyed into NetSuite the next morning. This manual, batched capture is the root cause of the 24-hour finished-goods inventory lag.",
    systems: ["NetSuite", "PLC / plant automation", "Paper work orders"],
    owners: ["Rafael Rodas, COO", "Warehouse Manager"],
    evidence: [
      {
        finding: "Paper-based work-order completion creates a 24-hour inventory lag",
        level: "client-confirmed",
        source: SRC_DISCOVERY,
        date: "10 Aug 2026",
      },
      {
        finding: "Production completion is recorded on paper and keyed the next morning",
        level: "client-confirmed",
        source: SRC_DISCOVERY,
        date: "10 Aug 2026",
      },
      {
        finding: "A named owner and a Q4 window exist to act on the workflow",
        level: "client-confirmed",
        source: SRC_FOLLOWUP,
        date: "13 Aug 2026",
      },
      {
        finding: "PLC / plant-automation data is not linked to inventory or lot records",
        level: "public-inference",
        source: SRC_PUBLIC,
        date: "12 Aug 2026",
      },
    ],
    painPoints: [
      "Finished-goods inventory is up to 24 hours behind actual.",
      "Machine and line data never reaches the systems that need it.",
    ],
    questions: [
      {
        id: "q1",
        question:
          "How long after production does finished-goods inventory reflect in NetSuite today?",
        answered: true,
      },
      {
        id: "q2",
        question:
          "Walk me through how a completed work order moves from the line clipboard into NetSuite.",
        answered: true,
      },
      {
        id: "q11",
        question:
          "Who owns production-data entry and correction when work orders are posted late?",
        answered: false,
      },
    ],
    opportunities: [
      { id: "opp-inventory", name: "Real-time Inventory Visibility" },
    ],
    unknowns: ["Exact daily volume and who owns production-data entry."],
    nextAction:
      "Scope a source-side capture pilot on one line and size the peak-season value.",
    comparison: {
      clientWorkflow:
        "Supervisors complete work orders on paper; a clerk keys them into NetSuite the next morning.",
      heizenWorkflow:
        "Source-side capture posts completion to the ERP as the shift finishes.",
      keyDifference: "Completion is captured once, at source, instead of re-keyed later.",
      implication: "The 24-hour lag closes and reconciliation effort drops.",
      source: SRC_DISCOVERY,
    },
    subprocesses: [
      {
        id: "make-execution",
        name: "Work-order execution",
        coverage: "validated",
        health: "friction",
        description:
          "Supervisors run the line against a work order and record completion on paper.",
        systems: ["Paper work orders", "PLC / plant automation"],
        owners: ["Shift supervisors", "Warehouse Manager"],
        evidence: [
          {
            finding: "Completion recorded on paper at shift end",
            level: "client-confirmed",
            source: SRC_DISCOVERY,
            date: "10 Aug 2026",
          },
        ],
        painPoints: ["No digital record until the next morning."],
        questions: [],
        opportunities: [],
        unknowns: ["Number of handoffs on the floor."],
        nextAction: "Map the on-floor handoffs precisely.",
      },
      {
        id: "make-capture",
        name: "Completion capture",
        coverage: "validated",
        health: "critical",
        description:
          "A clerk keys paper completions into NetSuite the following morning — the lag's root cause.",
        systems: ["NetSuite"],
        owners: ["Data-entry clerk"],
        evidence: [
          {
            finding: "Next-morning manual data entry causes the 24-hour lag",
            level: "client-confirmed",
            source: SRC_DISCOVERY,
            date: "10 Aug 2026",
          },
        ],
        painPoints: ["Batched, manual entry delays inventory by ~24 hours."],
        questions: [
          {
            id: "q11",
            question: "Who owns production-data entry and correction?",
            answered: false,
          },
        ],
        opportunities: [{ id: "opp-inventory", name: "Real-time Inventory Visibility" }],
        unknowns: ["Who owns corrections when a posting is wrong."],
        nextAction: "Confirm the data-entry owner and correction path.",
      },
      {
        id: "make-posting",
        name: "NetSuite posting",
        coverage: "partial",
        health: "friction",
        description:
          "The keyed completion posts to NetSuite inventory, updating availability once processed.",
        systems: ["NetSuite"],
        owners: ["Data-entry clerk"],
        evidence: [],
        painPoints: ["Availability only refreshes after the morning posting."],
        questions: [],
        opportunities: [],
        unknowns: ["Whether posting is a distinct step from data entry."],
        nextAction: "Isolate the posting step from data entry.",
      },
    ],
  },

  /* ---------------- Quality ---------------- */
  {
    id: "quality",
    name: "Quality",
    short: "Quality",
    coverage: "partial",
    health: "critical",
    description:
      "Lot genealogy is fragmented and the true source of truth is unconfirmed. FSMA 204 and GS1 traceability are pulling forward compliance work, but recall readiness is slow and manual.",
    systems: ["TraceGains", "NetSuite", "In-house data warehouse"],
    owners: ["Quality & Compliance lead", "Warehouse Manager"],
    evidence: [
      {
        finding: "FSMA 204 and GS1 traceability are consuming development capacity",
        level: "public-inference",
        source: SRC_PUBLIC,
        date: "12 Aug 2026",
      },
      {
        finding: "Lot genealogy is stitched across multiple systems",
        level: "public-inference",
        source: SRC_PUBLIC,
        date: "12 Aug 2026",
      },
    ],
    painPoints: [
      "No single lineage owner; recall readiness is slow.",
      "System of record for lot genealogy is contested.",
    ],
    questions: [
      {
        id: "q4",
        question:
          "Which system is the current source of truth for inventory, production, and lot genealogy?",
        answered: true,
      },
      {
        id: "q6",
        question:
          "Which product lines fall under FSMA 204, and what is the current lot-tracking method?",
        answered: false,
      },
      {
        id: "q7",
        question:
          "Walk me through how a finished lot moves from quality checks to released inventory.",
        answered: false,
      },
    ],
    opportunities: [
      { id: "opp-traceability", name: "Lot Traceability & Compliance" },
    ],
    unknowns: [
      "Whether lot genealogy lives in a system or a spreadsheet.",
      "Which SKUs are in FSMA 204 scope.",
    ],
    nextAction:
      "Validate the lot-genealogy source of truth and confirm in-scope SKUs.",
    comparison: {
      clientWorkflow:
        "Lot lineage is assembled across TraceGains, NetSuite and the warehouse store — possibly a spreadsheet.",
      heizenWorkflow:
        "A traceability cockpit gives one lineage view and a rehearsed recall workflow.",
      keyDifference: "A single source of lineage replaces cross-system stitching.",
      implication: "Recalls become fast and defensible under FSMA 204.",
      source: SRC_PUBLIC,
    },
    subprocesses: [
      {
        id: "quality-signoff",
        name: "QA sign-off",
        coverage: "partial",
        health: "friction",
        description: "Quality approves a finished lot before it can be released.",
        systems: ["TraceGains", "NetSuite"],
        owners: ["Quality & Compliance lead"],
        evidence: [],
        painPoints: ["Where sign-off is recorded is unclear."],
        questions: [],
        opportunities: [],
        unknowns: ["Where quality sign-off is recorded."],
        nextAction: "Confirm where QA sign-off is captured.",
      },
      {
        id: "quality-genealogy",
        name: "Lot genealogy",
        coverage: "partial",
        health: "critical",
        description:
          "Lot lineage is stitched across systems, with the source of truth contested.",
        systems: ["TraceGains", "NetSuite", "In-house data warehouse"],
        owners: ["Quality & Compliance lead"],
        evidence: [
          {
            finding: "Lot genealogy is stitched across multiple systems",
            level: "public-inference",
            source: SRC_PUBLIC,
            date: "12 Aug 2026",
          },
        ],
        painPoints: ["No unified lineage; recall readiness suffers."],
        questions: [
          {
            id: "q4",
            question: "Which system is the source of truth for lot genealogy?",
            answered: true,
          },
        ],
        opportunities: [{ id: "opp-traceability", name: "Lot Traceability & Compliance" }],
        unknowns: ["System vs. spreadsheet for genealogy."],
        nextAction: "Validate the genealogy source of truth.",
      },
      {
        id: "quality-labelling",
        name: "GS1 labelling",
        coverage: "not-explored",
        health: "unknown",
        description: "Case labels are produced with GS1 / lot data for downstream traceability.",
        systems: [],
        owners: [],
        evidence: [],
        painPoints: [],
        questions: [],
        opportunities: [],
        unknowns: ["Which application produces GS1 case labels."],
        nextAction: "Ask which application generates GS1 case labels.",
      },
    ],
  },

  /* ---------------- Store ---------------- */
  {
    id: "store",
    name: "Store",
    short: "Store",
    coverage: "validated",
    health: "healthy",
    description:
      "Warehouse putaway and picking run in NetSuite WMS and work well operationally. The issue is upstream: availability is only current once production posts the next morning.",
    systems: ["NetSuite WMS", "NetSuite"],
    owners: ["Warehouse Manager"],
    evidence: [
      {
        finding: "Warehouse execution runs in NetSuite WMS",
        level: "client-confirmed",
        source: SRC_DISCOVERY,
        date: "10 Aug 2026",
      },
      {
        finding: "Availability reflects production only after the morning posting",
        level: "client-confirmed",
        source: SRC_DISCOVERY,
        date: "10 Aug 2026",
      },
    ],
    painPoints: [
      "Availability-to-promise trails production by up to a day (upstream cause).",
    ],
    questions: [
      {
        id: "q2",
        question:
          "Walk me through how a completed work order moves from the line clipboard into NetSuite.",
        answered: true,
      },
    ],
    opportunities: [{ id: "opp-inventory", name: "Real-time Inventory Visibility" }],
    unknowns: ["Whether cycle counts reconcile the lag in practice."],
    nextAction:
      "Confirm the WMS flow is sound so effort focuses on upstream capture.",
    subprocesses: [
      {
        id: "store-putaway",
        name: "Putaway",
        coverage: "validated",
        health: "healthy",
        description: "Finished goods are put away in NetSuite WMS after production.",
        systems: ["NetSuite WMS"],
        owners: ["Warehouse Manager"],
        evidence: [],
        painPoints: [],
        questions: [],
        opportunities: [],
        unknowns: [],
        nextAction: "No action — workflow validated.",
      },
      {
        id: "store-picking",
        name: "Picking",
        coverage: "validated",
        health: "healthy",
        description: "Orders are picked against WMS inventory.",
        systems: ["NetSuite WMS"],
        owners: ["Warehouse Manager"],
        evidence: [],
        painPoints: [],
        questions: [],
        opportunities: [],
        unknowns: [],
        nextAction: "No action — workflow validated.",
      },
      {
        id: "store-availability",
        name: "Availability update",
        coverage: "partial",
        health: "friction",
        description:
          "Available-to-promise updates only once production posts the next morning.",
        systems: ["NetSuite"],
        owners: ["Warehouse Manager"],
        evidence: [],
        painPoints: ["ATP trails production by up to a day."],
        questions: [],
        opportunities: [{ id: "opp-inventory", name: "Real-time Inventory Visibility" }],
        unknowns: [],
        nextAction: "Tie availability to source-side capture.",
      },
    ],
  },

  /* ---------------- Deliver ---------------- */
  {
    id: "deliver",
    name: "Deliver",
    short: "Deliver",
    coverage: "not-explored",
    health: "unknown",
    description: "",
    systems: [],
    owners: [],
    evidence: [],
    painPoints: [],
    questions: [],
    opportunities: [],
    unknowns: [
      "Order fulfilment, shipping and carrier workflow are unmapped.",
    ],
    nextAction: "Add a fulfilment source or ask the delivery workflow questions.",
    suggestedQuestions: [
      "How are outbound orders released and shipped today?",
      "Which system tracks order fulfilment and carriers?",
    ],
    subprocesses: [],
  },

  /* ---------------- Data & Systems (cross-cutting) ---------------- */
  {
    id: "data",
    name: "Data & Systems",
    short: "Data",
    coverage: "partial",
    health: "friction",
    crossCutting: true,
    description:
      "NetSuite is the ERP and system of record, with Netstock, TraceGains, Power BI and an in-house warehouse around it. NetSuite ACS support lapses in October with no named owner, and integrations across the stack are thin.",
    systems: [
      "NetSuite",
      "NetSuite WMS",
      "Netstock",
      "TraceGains",
      "Power BI",
      "In-house data warehouse",
    ],
    owners: ["John Thompson, CFO", "Rafael Rodas, COO"],
    evidence: [
      {
        finding: "NetSuite ACS support ends in October with no renewal",
        level: "client-document",
        source: SRC_NETSUITE,
        date: "11 Aug 2026",
      },
      {
        finding: "A named owner and a Q4 window exist for the support decision",
        level: "client-confirmed",
        source: SRC_FOLLOWUP,
        date: "13 Aug 2026",
      },
      {
        finding: "Lot and machine data are stitched across systems with no single store",
        level: "public-inference",
        source: SRC_PUBLIC,
        date: "12 Aug 2026",
      },
    ],
    painPoints: [
      "Configuration and escalation support disappear in October.",
      "Cross-system integration is thin, so data is re-keyed and reconciled by hand.",
    ],
    questions: [
      {
        id: "q5",
        question:
          "What is your plan for NetSuite support once ACS lapses in October?",
        answered: true,
      },
      {
        id: "q3",
        question:
          "What operational or manufacturing data did buyers request during recent diligence?",
        answered: false,
      },
    ],
    opportunities: [
      { id: "opp-inventory", name: "Real-time Inventory Visibility" },
    ],
    unknowns: ["Owner and timeline to replace ACS support."],
    nextAction:
      "Confirm the post-ACS support owner and timeline before peak season.",
    subprocesses: [
      {
        id: "data-record",
        name: "System of record",
        coverage: "validated",
        health: "friction",
        description: "NetSuite is the ERP and inventory/production system of record.",
        systems: ["NetSuite", "NetSuite WMS"],
        owners: ["John Thompson, CFO"],
        evidence: [],
        painPoints: ["Some domains (lot genealogy) may live outside it."],
        questions: [],
        opportunities: [],
        unknowns: ["Whether lot genealogy is inside NetSuite."],
        nextAction: "Confirm which domains NetSuite owns.",
      },
      {
        id: "data-integrations",
        name: "Integrations",
        coverage: "partial",
        health: "friction",
        description:
          "Netstock, TraceGains, Power BI and the warehouse store connect to NetSuite with thin links.",
        systems: ["Netstock", "TraceGains", "Power BI", "In-house data warehouse"],
        owners: ["Rafael Rodas, COO"],
        evidence: [],
        painPoints: ["Manual bridging between systems."],
        questions: [],
        opportunities: [],
        unknowns: ["Where reconciliation happens between systems."],
        nextAction: "Map the key integration seams.",
      },
      {
        id: "data-support",
        name: "Support & config",
        coverage: "validated",
        health: "critical",
        description:
          "NetSuite ACS support lapses in October, leaving config and escalations without a named owner.",
        systems: ["NetSuite"],
        owners: ["John Thompson, CFO"],
        evidence: [
          {
            finding: "ACS support ends in October with no renewal",
            level: "client-document",
            source: SRC_NETSUITE,
            date: "11 Aug 2026",
          },
        ],
        painPoints: ["No owner for configuration and escalations after October."],
        questions: [
          {
            id: "q5",
            question: "What is your plan for NetSuite support once ACS lapses?",
            answered: true,
          },
        ],
        opportunities: [],
        unknowns: ["Owner and timeline to replace ACS support."],
        nextAction: "Confirm the post-ACS support owner and timeline.",
      },
    ],
  },
];

/* ---------------- Entities ---------------- */
export type EntityKind = "system" | "team" | "stakeholder" | "document";

export interface Entity {
  id: string;
  name: string;
  role: string;
  related: string[]; // related process-area short labels
  meta?: string; // e.g. document date / visibility
}

export const clioEntities: Record<EntityKind, Entity[]> = {
  system: [
    { id: "sys-netsuite", name: "NetSuite", role: "ERP · inventory & production system of record", related: ["Make", "Store", "Data"] },
    { id: "sys-wms", name: "NetSuite WMS", role: "Warehouse execution — putaway & picking", related: ["Store"] },
    { id: "sys-netstock", name: "Netstock", role: "Demand & inventory planning", related: ["Plan"] },
    { id: "sys-tracegains", name: "TraceGains", role: "Supplier & compliance information", related: ["Quality"] },
    { id: "sys-powerbi", name: "Power BI", role: "Operational & management reporting", related: ["Data"] },
    { id: "sys-warehouse", name: "In-house data warehouse", role: "Cross-system reporting store", related: ["Data"] },
    { id: "sys-plc", name: "PLC / plant automation", role: "Line control & machine data", related: ["Make"] },
  ],
  team: [
    { id: "team-ops", name: "Operations", role: "Runs the production floor", related: ["Make"] },
    { id: "team-quality", name: "Quality & Compliance", role: "Owns traceability & recall readiness", related: ["Quality"] },
    { id: "team-planning", name: "Planning", role: "Demand & production planning", related: ["Plan"] },
    { id: "team-warehouse", name: "Warehouse", role: "Putaway, picking & availability", related: ["Store"] },
    { id: "team-finance", name: "Finance", role: "Owns the NetSuite spend & ACS decision", related: ["Data"] },
  ],
  stakeholder: [
    { id: "stk-meera", name: "Meera Iyer", role: "VP Operations · primary contact", related: ["Make", "Store"] },
    { id: "stk-rafael", name: "Rafael Rodas", role: "COO · likely champion", related: ["Make", "Plan", "Quality"] },
    { id: "stk-john-c", name: "John McGuckin", role: "CEO · economic buyer", related: ["Data"] },
    { id: "stk-john-t", name: "John Thompson", role: "CFO · owns ACS decision", related: ["Data"] },
    { id: "stk-warehouse", name: "Warehouse Manager", role: "Operational champion", related: ["Make", "Store"] },
  ],
  document: [
    { id: "doc-discovery", name: "Initial discovery call transcript", role: "Discovery transcript", related: ["Make", "Store"], meta: "Client · 10 Aug 2026" },
    { id: "doc-netsuite", name: "NetSuite support summary", role: "Vendor summary", related: ["Data"], meta: "Client · 11 Aug 2026" },
    { id: "doc-public", name: "Company website & public market context", role: "Public web & context", related: ["Plan", "Quality", "Data"], meta: "Public · 12 Aug 2026" },
    { id: "doc-followup", name: "Follow-up operations call transcript", role: "Discovery transcript", related: ["Make", "Data"], meta: "Client · 13 Aug 2026 · pending" },
    { id: "doc-addendum", name: "Vendor support addendum", role: "Vendor addendum", related: ["Data"], meta: "Client · 14 Aug 2026 · pending" },
  ],
};

export const ENTITY_KINDS: { id: EntityKind; label: string }[] = [
  { id: "system", label: "Systems" },
  { id: "team", label: "Teams" },
  { id: "stakeholder", label: "Stakeholders" },
  { id: "document", label: "Documents" },
];
