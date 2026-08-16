/* ================================================================
   Clio Snacks — Research "First-call Brief" view

   A fast, scannable pre-call read that sits above Brief and Full
   Research. Every signal opens a right drawer with the full story,
   why it matters to Meera Iyer, evidence, confidence, the related
   hypothesis/opportunity, a conversation starter, related discovery
   questions and similar Heizen projects.

   Confidence taxonomy for this view:
     confirmed  — client stated it directly / client document
     strong     — strong signal, multiple corroborating sources
     inference  — reasoned from public sources, not confirmed
     unverified — assumption; do not rely on it without checking
   ================================================================ */

export type SignalConfidence = "confirmed" | "strong" | "inference" | "unverified";

export const signalConfidenceMeta: Record<
  SignalConfidence,
  { label: string; tone: "green" | "accent" | "amber" | "neutral" }
> = {
  confirmed: { label: "Confirmed", tone: "green" },
  strong: { label: "Strong signal", tone: "accent" },
  inference: { label: "Inference", tone: "amber" },
  unverified: { label: "Unverified", tone: "neutral" },
};

export interface SignalEvidence {
  source: string;
  kind: "client" | "public" | "market";
  excerpt: string;
}

export interface HeizenProject {
  label: string;
  relevance: string;
}

export interface FirstCallSignal {
  id: string;
  title: string;
  /** One-line summary shown on the card. */
  summary: string;
  confidence: SignalConfidence;
  /** Full explanation shown in the drawer. */
  explanation: string;
  /** Why it matters specifically to Meera Iyer (VP Operations). */
  whyMeera: string;
  evidence: SignalEvidence[];
  /** Related hypothesis or opportunity. */
  related: string;
  /** A ready-to-use opener for the call. */
  starter: string;
  /** Discovery question ids (resolved via questionById). */
  discoveryQuestionIds: string[];
  heizen: HeizenProject[];
}

export const sourceKindLabel: Record<SignalEvidence["kind"], string> = {
  client: "Client-provided",
  public: "Public source",
  market: "Market benchmark",
};

/* ---- Business context (concise) -------------------------------- */
export interface FcFact {
  label: string;
  value: string;
  note?: string;
}

export const fcBusinessContext: FcFact[] = [
  { label: "Revenue", value: "≈ $46M / year", note: "Public estimate — confirm" },
  { label: "Locations", value: "1 refrigerated plant + HQ, US Midwest" },
  { label: "Customers", value: "Regional grocery & club-store chains" },
  { label: "Product lines", value: "Refrigerated dips, snacking packs, plant-based" },
  { label: "Stage", value: "Scaling capacity into peak demand" },
];

export const fcBusinessContextNote =
  "From the company website and public market context (12 Aug). Revenue is an estimate — confirm the shape of the business early.";

/* ---- 2 · Technology & AI initiatives --------------------------- */
export const fcTechInitiatives: FirstCallSignal[] = [
  {
    id: "ti-acs",
    title: "NetSuite ACS support lapses in October",
    summary: "A dated, client-confirmed ERP support decision is live now.",
    confidence: "confirmed",
    explanation:
      "The client-provided NetSuite support summary shows the Advanced Customer Support term ending in October with no renewal line item. After it lapses, configuration changes and escalations have no defined owner — a concrete near-term spend and risk decision.",
    whyMeera:
      "Operational changes Meera needs through peak would have no support owner — this is continuity risk on her watch, not just a finance line item.",
    evidence: [
      {
        source: "NetSuite support summary — 11 Aug 2026",
        kind: "client",
        excerpt: "ACS term ends October; no renewal, no named owner for post-lapse changes.",
      },
    ],
    related: "Opportunity: NetSuite operational support",
    starter:
      "With NetSuite ACS support ending in October, who picks up operational changes after that?",
    discoveryQuestionIds: ["q5"],
    heizen: [
      {
        label: "NetSuite operational support (F&B manufacturer)",
        relevance: "Took over ACS-style support and change management without a re-implementation.",
      },
    ],
  },
  {
    id: "ti-capacity",
    title: "Recent refrigerated capacity expansion",
    summary: "Public context points to a capex-backed line/capacity increase.",
    confidence: "inference",
    explanation:
      "Company and trade-press context suggest a recent expansion of refrigerated production capacity. If accurate, it compounds the cost of today's data delays — more volume through the same paper-based completion and next-morning keying.",
    whyMeera:
      "More volume through a manual data path is exactly where Meera's throughput and accuracy start to break.",
    evidence: [
      {
        source: "Company website & public market context",
        kind: "public",
        excerpt: "References to added refrigerated capacity and production hiring over the past year.",
      },
    ],
    related: "Hypothesis: inventory lag becomes a scaling constraint",
    starter: "How much has volume grown this year, and where does that strain operations most?",
    discoveryQuestionIds: ["q3", "q1"],
    heizen: [
      {
        label: "Production data capture at scale",
        relevance: "Closed a paper-to-ERP lag for a manufacturer during a volume ramp.",
      },
    ],
  },
  {
    id: "ti-analytics",
    title: "Early analytics & AI interest in operations",
    summary: "Power BI is in place; forecasting / AI is a likely next step.",
    confidence: "unverified",
    explanation:
      "Power BI already supports operational and management reporting, and peers at this scale commonly evaluate demand forecasting and AI-assisted analytics next. This is directional from market benchmarks — not a confirmed Clio initiative.",
    whyMeera:
      "If Meera is being asked to do more with the same team, better forecasting is an easy value story — but only if she raises it.",
    evidence: [
      {
        source: "Category technology benchmark — mid-market F&B",
        kind: "market",
        excerpt: "Manufacturers at this band typically move from BI dashboards toward forecasting next.",
      },
    ],
    related: "Hypothesis: appetite for analytics/AI investment",
    starter: "Where would better forecasting or analytics help your team most right now?",
    discoveryQuestionIds: ["q9"],
    heizen: [
      {
        label: "Demand planning analytics",
        relevance: "Aligned forecasting with live production readiness on Netstock + Power BI.",
      },
    ],
  },
];

/* ---- 3 · Stakeholder-relevant signals (for Meera Iyer) --------- */
export const fcStakeholderSignals: FirstCallSignal[] = [
  {
    id: "ss-inventory-lag",
    title: "24-hour inventory lag from paper-based completion",
    summary: "Work orders are completed on paper and keyed in the next morning.",
    confidence: "confirmed",
    explanation:
      "On the initial discovery call the COO described supervisors completing work orders on paper and a clerk keying results into NetSuite the next morning — a ~24-hour delay before inventory reflects production. The cost of that lag grows with volume.",
    whyMeera:
      "This sits directly on Meera's ability to promise availability and run the plant reliably as volume climbs.",
    evidence: [
      {
        source: "Initial discovery call transcript — 10 Aug 2026",
        kind: "client",
        excerpt: "Supervisors complete work orders on paper; a clerk keys results into NetSuite the next morning.",
      },
    ],
    related: "Opportunity: Manufacturing execution visibility",
    starter: "Where does keeping inventory accurate get hardest as you scale volume?",
    discoveryQuestionIds: ["q1", "q2"],
    heizen: [
      {
        label: "Inventory posting visibility (F&B manufacturer)",
        relevance: "Closed the same paper-to-ERP gap with source-side capture on the line.",
      },
    ],
  },
  {
    id: "ss-traceability",
    title: "Lot traceability stitched manually across systems",
    summary: "FSMA 204 exposure with no single source of lot genealogy.",
    confidence: "inference",
    explanation:
      "Lot lineage appears assembled across TraceGains and NetSuite with no single source of genealogy. Under FSMA 204 that raises both compliance and recall-speed risk. Which SKUs are in scope and the current method are unconfirmed.",
    whyMeera:
      "Traceability and audit readiness are Meera's responsibility — a slow recall is her risk to carry.",
    evidence: [
      {
        source: "Company website & public market context",
        kind: "public",
        excerpt: "Refrigerated mix subject to FSMA 204; no public detail on the lot-tracking method.",
      },
    ],
    related: "Opportunity: Traceability & recall readiness",
    starter: "When an auditor or retailer asks you to trace a lot, how long does that take?",
    discoveryQuestionIds: ["q4", "q6"],
    heizen: [
      {
        label: "Traceability & recall workflows (packaged foods)",
        relevance: "Built a single lineage view and rehearsed the recall workflow end-to-end.",
      },
    ],
  },
  {
    id: "ss-planning-stale",
    title: "Planning runs on day-stale availability",
    summary: "Netstock consumes availability that is already a day old.",
    confidence: "inference",
    explanation:
      "If inventory posts a day late, demand planning in Netstock consumes stale availability — a plausible driver of expedites and short-ships. Inferred from the data flow, not yet confirmed by the client.",
    whyMeera:
      "It turns into firefighting for Meera's team — avoidable shortages and expedites she has to absorb.",
    evidence: [
      {
        source: "Initial discovery call transcript — 10 Aug 2026",
        kind: "client",
        excerpt: "Planning is downstream of NetSuite inventory, which reflects production a day late.",
      },
    ],
    related: "Hypothesis: planning drift from stale data",
    starter: "How often does planning get caught out by inventory that turned out to be wrong?",
    discoveryQuestionIds: ["q9"],
    heizen: [
      {
        label: "Demand-to-production coordination (beverage)",
        relevance: "Aligned demand planning with real-time production readiness.",
      },
    ],
  },
  {
    id: "ss-ot-data",
    title: "Machine / PLC data not linked to inventory",
    summary: "Line data isn't connected to inventory or lot records.",
    confidence: "unverified",
    explanation:
      "Line control runs on PLC/plant automation, but that data does not appear connected to inventory or lot genealogy. Linking it would give real-time throughput and yield visibility — likely a later-phase opportunity.",
    whyMeera:
      "Real-time line visibility is a 'nice to have' for Meera today — worth flagging, not leading with.",
    evidence: [
      {
        source: "Company website & public market context",
        kind: "public",
        excerpt: "Automated refrigerated lines; no public indication machine data links to ERP.",
      },
    ],
    related: "Hypothesis: OT integration as a later phase",
    starter: "Do you get real-time line performance today, or is it reported after the shift?",
    discoveryQuestionIds: ["q10"],
    heizen: [
      {
        label: "Line data into inventory (mid-market manufacturer)",
        relevance: "Captured PLC/line data into inventory and lot records.",
      },
    ],
  },
];

/* ---- 5 · Relevant vendors -------------------------------------- */
export type VendorCategory = "tech" | "supply-chain" | "audit";

export const vendorCategoryLabel: Record<VendorCategory, string> = {
  tech: "Technology",
  "supply-chain": "Supply chain",
  audit: "Audit / statutory",
};

export interface FcVendor {
  name: string;
  category: VendorCategory;
  relevance: string;
  evidence: string;
  status: "verified" | "unverified";
}

/** Technology + supply-chain vendors — shown by default. */
export const fcVendors: FcVendor[] = [
  {
    name: "NetSuite",
    category: "tech",
    relevance: "ERP & system of record; ACS support lapsing in October.",
    evidence: "Client support summary (11 Aug) + discovery call.",
    status: "verified",
  },
  {
    name: "Power BI",
    category: "tech",
    relevance: "Operational & management reporting layer.",
    evidence: "Mentioned on the discovery call.",
    status: "verified",
  },
  {
    name: "NetSuite WMS",
    category: "supply-chain",
    relevance: "Warehouse execution — putaway & picking.",
    evidence: "Public / company site; not client-confirmed.",
    status: "unverified",
  },
  {
    name: "Netstock",
    category: "supply-chain",
    relevance: "Demand & inventory planning; may run on stale availability.",
    evidence: "Public inference; role not client-confirmed.",
    status: "unverified",
  },
  {
    name: "TraceGains",
    category: "supply-chain",
    relevance: "Supplier & compliance information for traceability.",
    evidence: "Public inference; lot-genealogy role unconfirmed.",
    status: "unverified",
  },
];

/** Audit / statutory / back-office vendors — hidden under "Other vendors". */
export const fcOtherVendors: FcVendor[] = [
  {
    name: "Grant Thornton",
    category: "audit",
    relevance: "External audit / assurance — not a supply-chain topic.",
    evidence: "Public filing reference.",
    status: "unverified",
  },
  {
    name: "ADP",
    category: "audit",
    relevance: "Payroll & HR administration — back-office, not relevant to this call.",
    evidence: "Public source.",
    status: "unverified",
  },
];

export const fcOtherVendorsNote =
  "Audit and statutory back-office vendors detected in public sources. Not relevant to a supply-chain or technology conversation — do not lead with these.";

export const DO_NOT_MENTION =
  "Do not mention on call until verified.";
