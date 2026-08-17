/* ================================================================
   Clio Snacks — 15-minute First-call Brief (Introductory Call stage)

   Everything here is what a consultant would skim in the last fifteen
   minutes before an introductory call: public/market context, a few
   spend/AI signals, a read on the stakeholder, unvalidated hypotheses
   to test, the tech stack we can speak to, and a way into the conversation.

   Consistent with the Clio Snacks research (NetSuite / Netstock /
   TraceGains / Power BI / PLC, paper-based production completion, FSMA 204
   traceability, NetSuite ACS support ending October, plant scaling).

   Figures are pre-call estimates from public sources — clearly labelled,
   never presented as confirmed fact.
   ================================================================ */

import type { EvidenceLevel } from "./types";
import type { ConfLevel } from "./discovery";

/* ---- shared shapes --------------------------------------------- */

export type SourceKind = "client" | "public" | "market";

export interface BriefSource {
  label: string;
  kind: SourceKind;
  excerpt: string;
}

export interface HeizenRef {
  label: string;
  relevance: string;
}

/** Everything a clickable brief item opens into a drawer. */
export interface BriefDetail {
  detail: string;
  evidence: EvidenceLevel;
  confidence: ConfLevel;
  sources: BriefSource[];
  heizen: HeizenRef[];
  questions: string[];
}

export const sourceKindLabel: Record<SourceKind, string> = {
  client: "Client-provided",
  public: "Public source",
  market: "Market benchmark",
};

/* ---- 1 · Business context -------------------------------------- */

export interface Fact {
  label: string;
  value: string;
  note?: string;
}

export const businessContext: Fact[] = [
  { label: "Revenue", value: "≈ $46M / year", note: "Public estimate — confirm" },
  { label: "Profitability", value: "Mid-teens EBITDA", note: "Category benchmark — confirm" },
  { label: "Locations", value: "1 refrigerated plant + HQ, US Midwest" },
  { label: "Customers", value: "Regional grocery & club-store chains" },
  { label: "Suppliers", value: "Dairy, produce & packaging co-manufacturers" },
  { label: "Product lines", value: "Refrigerated dips, snacking packs, plant-based range" },
];

export const businessContextNote =
  "Compiled from the company website and public market context on 12 Aug. Revenue and margin are estimates — confirm the shape of the business early in the call.";

/* ---- 2 · Technology & AI signals (spend / initiative) ---------- */

export interface TechSignal extends BriefDetail {
  id: string;
  title: string;
  signal: string;
  tag: string;
}

export const techSignals: TechSignal[] = [
  {
    id: "sig-erp-support",
    title: "NetSuite ACS support lapses in October",
    signal: "ERP support spend decision is live now — a firm, dated window.",
    tag: "Spend signal",
    evidence: "client-document",
    confidence: "high",
    detail:
      "The client-provided NetSuite support summary shows the Advanced Customer Support term ending in October with no renewal line item. Configuration changes and escalations lose a defined owner right as the plant scales — a concrete, near-term spend and risk decision.",
    sources: [
      {
        label: "NetSuite support summary — 11 Aug 2026",
        kind: "client",
        excerpt:
          "ACS term ends October; no renewal line item, no named owner for configuration changes after the lapse.",
      },
    ],
    heizen: [
      {
        label: "NetSuite operational support (F&B manufacturer)",
        relevance: "Picked up ACS-style support and change management without a full re-implementation.",
      },
    ],
    questions: [
      "What's your plan for NetSuite support once ACS lapses in October?",
      "Who owns configuration changes and escalations today?",
    ],
  },
  {
    id: "sig-capacity",
    title: "Recent refrigerated capacity expansion",
    signal: "Public context points to a capex-backed line/capacity increase.",
    tag: "Capex signal",
    evidence: "public-inference",
    confidence: "medium",
    detail:
      "Company and trade-press context suggests a recent expansion of refrigerated production capacity. If accurate, it compounds the cost of today's data delays — more volume moving through the same paper-based completion and next-morning keying.",
    sources: [
      {
        label: "Company website & public market context",
        kind: "public",
        excerpt:
          "References to added refrigerated capacity and hiring on the production side over the past year.",
      },
    ],
    heizen: [
      {
        label: "Production data capture at scale",
        relevance: "Closed a paper-to-ERP lag for a mid-market manufacturer during a volume ramp.",
      },
    ],
    questions: [
      "How much has volume grown over the last year, and where does that strain operations most?",
      "Did the expansion change how production data reaches NetSuite?",
    ],
  },
  {
    id: "sig-analytics",
    title: "Early analytics & AI interest in operations",
    signal: "Power BI in place; exploring forecasting / analytics investment.",
    tag: "AI initiative",
    evidence: "market-benchmark",
    confidence: "low",
    detail:
      "Power BI is already used for operational and management reporting, and peers at this scale are beginning to evaluate demand forecasting and AI-assisted analytics. This is a directional signal from market benchmarks, not a confirmed Clio initiative — a light-touch topic to probe, not to assume.",
    sources: [
      {
        label: "Category technology benchmark — mid-market F&B",
        kind: "market",
        excerpt:
          "Manufacturers at this revenue band commonly move from BI dashboards toward forecasting and anomaly detection next.",
      },
    ],
    heizen: [
      {
        label: "Demand planning analytics",
        relevance: "Aligned forecasting with live production readiness on Netstock + Power BI.",
      },
    ],
    questions: [
      "Where would better forecasting or analytics help your team most right now?",
      "Is anyone internally looking at AI for operations or planning yet?",
    ],
  },
];

/* ---- 3 · Stakeholder lens — Meera Iyer ------------------------- */

export const stakeholderLens = {
  name: "Meera Iyer",
  title: "VP Operations",
  summary:
    "Primary stakeholder for this call. Owns the day-to-day operation and the scaling mandate — frame everything as operational risk and throughput, not as an IT project.",
  responsibilities: [
    "End-to-end plant operations and throughput",
    "Inventory accuracy and fulfilment reliability",
    "Quality, traceability and audit readiness",
    "Scaling operations to meet volume growth",
  ],
  domains: [
    "Production scheduling & execution",
    "Inventory & warehouse operations",
    "Quality & lot traceability (FSMA 204)",
    "Demand-to-production coordination",
  ],
  conversationAreas: [
    "The 24-hour inventory lag from paper-based production completion",
    "How lot traceability holds up under a recall or audit",
    "Whether planning is working from stale availability",
    "What breaks first as volume keeps climbing",
  ],
};

/* ---- 4 · Unvalidated hypotheses (ranked by stakeholder fit) ---- */

export const HYPOTHESIS_LABEL = "Unvalidated — confirm on call";

export interface Hypothesis extends BriefDetail {
  id: string;
  rank: number;
  statement: string;
  relevance: string;
  relevanceTone: "high" | "medium";
}

export const hypotheses: Hypothesis[] = [
  {
    id: "hyp-inventory-lag",
    rank: 1,
    statement:
      "Paper-based production completion creates a ~24-hour inventory lag that is starting to constrain Meera's ability to promise availability as volume scales.",
    relevance: "Directly on Meera's throughput and fulfilment mandate.",
    relevanceTone: "high",
    evidence: "public-inference",
    confidence: "medium",
    detail:
      "On the initial discovery call the COO described supervisors completing work orders on paper and a clerk keying results into NetSuite the next morning. The operational cost of that lag grows with volume — the hypothesis is that it is now a scaling constraint Meera feels, not just an inconvenience.",
    sources: [
      {
        label: "Initial discovery call transcript — 10 Aug 2026",
        kind: "client",
        excerpt:
          "Shift supervisors complete work orders on paper; a clerk keys results into NetSuite the next morning — roughly a one-day delay before inventory reflects production.",
      },
    ],
    heizen: [
      {
        label: "Inventory posting visibility (F&B manufacturer)",
        relevance: "Closed the same paper-to-ERP gap with source-side capture on the line.",
      },
    ],
    questions: [
      "How long after production does finished-goods inventory reflect in NetSuite today?",
      "Where does that delay cost you — short-ships, safety stock, overtime?",
    ],
  },
  {
    id: "hyp-traceability",
    rank: 2,
    statement:
      "Lot traceability for FSMA 204 is stitched together manually across systems, leaving Meera exposed on recall and audit response time.",
    relevance: "Traceability and audit readiness sit squarely with Meera.",
    relevanceTone: "high",
    evidence: "public-inference",
    confidence: "medium",
    detail:
      "Lot lineage appears to be assembled across TraceGains and NetSuite with no single source of genealogy. Under FSMA 204 that raises both compliance and recall-speed risk. Which SKUs are in scope and the current lot-tracking method are unconfirmed.",
    sources: [
      {
        label: "Company website & public market context",
        kind: "public",
        excerpt:
          "Refrigerated product mix subject to FSMA 204 traceability requirements; no public detail on the lot-tracking method.",
      },
    ],
    heizen: [
      {
        label: "Traceability & recall workflows (packaged foods)",
        relevance: "Built a single lineage view and rehearsed the recall workflow end-to-end.",
      },
    ],
    questions: [
      "When an auditor or retailer asks you to trace a lot, how long does that take?",
      "Which product lines fall under FSMA 204, and how are you tracking lots today?",
    ],
  },
  {
    id: "hyp-planning-stale",
    rank: 3,
    statement:
      "Demand planning in Netstock is running on availability that is already a day stale, so Meera's team firefights avoidable shortages.",
    relevance: "Planning reliability is an operational headache Meera owns.",
    relevanceTone: "high",
    evidence: "public-inference",
    confidence: "low",
    detail:
      "If inventory posts a day late, planning consumes stale availability — a plausible driver of expedites and short-ships. This is an inference from the data-flow, not yet confirmed by the client.",
    sources: [
      {
        label: "Initial discovery call transcript — 10 Aug 2026",
        kind: "client",
        excerpt:
          "Planning is downstream of NetSuite inventory, which reflects production a day late.",
      },
    ],
    heizen: [
      {
        label: "Demand-to-production coordination (beverage manufacturer)",
        relevance: "Aligned demand planning with real-time production readiness.",
      },
    ],
    questions: [
      "How often does planning get caught out by inventory that turned out to be wrong?",
      "What does a typical shortage or expedite cost you?",
    ],
  },
  {
    id: "hyp-support-gap",
    rank: 4,
    statement:
      "The NetSuite ACS lapse in October will leave Meera's operational changes without a support owner right as demand peaks.",
    relevance: "A near-term risk to operational continuity on Meera's watch.",
    relevanceTone: "medium",
    evidence: "client-document",
    confidence: "high",
    detail:
      "The support summary confirms the ACS term ends in October. The hypothesis is that this becomes an operational continuity problem for Meera — changes and escalations with no clear owner — not just a procurement item for finance.",
    sources: [
      {
        label: "NetSuite support summary — 11 Aug 2026",
        kind: "client",
        excerpt: "ACS term ends October; no renewal and no named owner for post-lapse changes.",
      },
    ],
    heizen: [
      {
        label: "NetSuite operational support",
        relevance: "Provides the change-management and escalation owner an ACS lapse leaves open.",
      },
    ],
    questions: [
      "Once ACS ends, who handles NetSuite changes and escalations for operations?",
      "What operational changes are you expecting to make through peak?",
    ],
  },
  {
    id: "hyp-ot-data",
    rank: 5,
    statement:
      "Machine and PLC line data isn't linked to inventory or lot records, so Meera lacks real-time visibility into line performance.",
    relevance: "Useful, but a step beyond the most pressing pains.",
    relevanceTone: "medium",
    evidence: "public-inference",
    confidence: "low",
    detail:
      "Line control runs on PLC/plant automation, but that data does not appear connected to inventory or lot genealogy. Linking it would give real-time throughput and yield visibility — likely a later-phase opportunity rather than a day-one topic.",
    sources: [
      {
        label: "Company website & public market context",
        kind: "public",
        excerpt: "Automated refrigerated lines; no public indication that machine data links to ERP.",
      },
    ],
    heizen: [
      {
        label: "Line data into inventory (mid-market manufacturer)",
        relevance: "Captured PLC/line data into inventory and lot records.",
      },
    ],
    questions: [
      "Do you get real-time line performance today, or is it reported after the shift?",
      "Is machine data connected to inventory or lots at all right now?",
    ],
  },
];

/* ---- 5 · Tech stack & related Heizen experience ---------------- */

export type VendorCategory = "tech" | "supply-chain" | "audit";

export interface Vendor {
  name: string;
  category: VendorCategory;
  role: string;
  heizen: string;
}

export const vendorCategoryLabel: Record<VendorCategory, string> = {
  tech: "Technology",
  "supply-chain": "Supply chain",
  audit: "Audit / back-office",
};

/** Tech + supply-chain vendors are shown by default; audit vendors are
   surfaced separately with a warning (not relevant to this conversation). */
export const vendors: Vendor[] = [
  {
    name: "NetSuite",
    category: "tech",
    role: "ERP · inventory · production system of record",
    heizen: "Delivered NetSuite operational support and integrations for F&B manufacturers.",
  },
  {
    name: "NetSuite WMS",
    category: "supply-chain",
    role: "Warehouse execution — putaway & picking",
    heizen: "Built putaway/picking flows and floor capture on NetSuite WMS.",
  },
  {
    name: "Netstock",
    category: "supply-chain",
    role: "Demand & inventory planning",
    heizen: "Aligned Netstock planning with live production readiness.",
  },
  {
    name: "TraceGains",
    category: "supply-chain",
    role: "Supplier & compliance information",
    heizen: "Integrated TraceGains lot data into a unified genealogy view.",
  },
  {
    name: "Power BI",
    category: "tech",
    role: "Operational & management reporting",
    heizen: "Built operational dashboards and KPI reporting on Power BI.",
  },
  {
    name: "PLC / plant automation",
    category: "tech",
    role: "Line control & machine data",
    heizen: "Captured PLC/line data into inventory and lot records.",
  },
];

export const otherVendors: Vendor[] = [
  {
    name: "Grant Thornton",
    category: "audit",
    role: "External audit / assurance",
    heizen: "—",
  },
  {
    name: "ADP",
    category: "audit",
    role: "Payroll & HR administration",
    heizen: "—",
  },
];

export const otherVendorsWarning =
  "Detected in public sources but not relevant to a supply-chain or technology conversation. Verify before referencing — don't lead with these.";

/* ---- 6 · Conversation starters & desired outcome --------------- */

export const conversationStarters: string[] = [
  "You're scaling refrigerated volume fast — where does keeping inventory accurate get hardest today?",
  "When a retailer or auditor asks you to trace a lot, how long does that actually take?",
  "With NetSuite ACS support ending in October, who picks up operational changes after that?",
];

export const desiredOutcome =
  "Leave the call with Meera's read on the single biggest operational pain, who owns it, and agreement to a focused follow-up — a short discovery on the inventory lag and traceability.";
