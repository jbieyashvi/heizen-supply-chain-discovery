import type { EvidenceLevel } from "./types";

/* ---------- Shared ---------- */
export interface EvidenceDetail {
  source: string;
  excerpt: string; // paraphrased, not heavily quoted
  sourceType: string;
  date: string;
  visibility: "public" | "client";
  supports: string;
  conflicts?: string;
  relatedQuestions: string[];
  relatedOpportunities: string[];
}

export type Confidence = "high" | "medium" | "low";

/* ---------- Header / meta ---------- */
export interface ResearchMeta {
  status: string;
  statusNote: string;
  generated: string;
  sourcesIncluded: number;
  sourcesPending: number;
  freshness: "fresh" | "usable-pending" | "stale";
}

/* ---------- Brief ---------- */
export interface Signal {
  id: string;
  finding: string;
  evidence: EvidenceLevel;
  whyItMatters: string;
  relatedOpportunity: string;
  detail: EvidenceDetail;
}

export interface OppThesis {
  id: string;
  title: string;
  value: string;
  strength: "strong" | "moderate" | "emerging";
  confirmation: EvidenceLevel;
  validation: string;
}

export interface Module {
  id: string;
  name: string;
  problem: string;
  outcome: string;
  worksWith: string[];
  evidence: EvidenceLevel;
  priorWork: boolean;
}

export interface TechSystem {
  name: string;
  role: string;
}
export interface Handoff {
  id: string;
  from: string;
  to: string;
  problem: string;
  severity: "high" | "medium";
}

export interface Stakeholder {
  name: string;
  title: string;
  role: string;
  why: string;
  focus: string;
}

export interface Unknown {
  id: string;
  text: string;
  question: string;
}

export interface SimilarWork {
  id: string;
  area: string;
  relatedPain: string;
  clientLabel: string;
  relevance: string;
  similarity: "high" | "medium";
}

/* ---------- Full research ---------- */
export interface Finding {
  id: string;
  finding: string;
  whyItMatters: string;
  evidence: EvidenceLevel;
  confidence: Confidence;
  sourceCount: number;
  relatedOpportunity?: string;
  relatedQuestion?: string;
  lastUpdated: string;
  detail: EvidenceDetail;
}
export interface ResearchSection {
  id: string;
  title: string;
  summary: string;
  findings: Finding[];
}

/* ---------- Sources ---------- */
export interface Source {
  id: string;
  title: string;
  type: string;
  domainOrFile: string;
  visibility: "public" | "client";
  state: "processed" | "processing" | "failed";
  signals: number;
  included: boolean;
  pending: boolean;
}

export interface PendingSource {
  id: string;
  title: string;
  type: string;
  addedRelative: string;
  visibility: "public" | "client";
  updated: string[];
  pending: string;
}

export interface ResearchData {
  meta: ResearchMeta;
  brief: {
    headline: string;
    situation: string;
    whyNow: string;
    signals: Signal[];
    opportunities: OppThesis[];
    modules: { primary: Module[]; additional: Module[] };
    tech: {
      record: TechSystem[];
      planning: TechSystem[];
      ot: TechSystem[];
      handoffs: Handoff[];
    };
    stakeholders: Stakeholder[];
    unknowns: Unknown[];
    similar: SimilarWork[];
  };
  full: ResearchSection[];
  sources: Source[];
  pending: PendingSource[];
}

/* ================================================================
   Clio Snacks research content
   ================================================================ */
export const clioResearch: ResearchData = {
  meta: {
    status: "Completed",
    statusNote: "Usable, but 2 sources are pending",
    generated: "12 Aug 2026, 09:20",
    sourcesIncluded: 3,
    sourcesPending: 2,
    freshness: "usable-pending",
  },
  brief: {
    headline: "The plant is scaling. Control data must keep up.",
    situation:
      "Clio Snacks is scaling a high-volume refrigerated manufacturing operation while dealing with paper-based production completion, traceability pressure, and an approaching NetSuite support gap. Heizen's strongest opportunity is improving the handoffs between production, inventory, quality, and planning without replacing existing systems of record.",
    whyNow:
      "A recent capacity expansion has increased daily volume faster than the plant's data workflows can keep up, and the NetSuite ACS support contract lapses in October — narrowing the window to stabilise operations before peak.",
    signals: [
      {
        id: "sig-1",
        finding:
          "Paper-based work-order completion creates a 24-hour inventory lag",
        evidence: "client-confirmed",
        whyItMatters:
          "Finished-goods availability is up to a day behind actual, distorting order promising and planning during peak demand.",
        relatedOpportunity: "Manufacturing execution visibility",
        detail: {
          source: "Discovery call transcript — 13 Aug",
          excerpt:
            "The COO described shift supervisors completing work orders on paper and a clerk keying results into NetSuite the next morning, confirming a roughly one-day delay before inventory reflects production.",
          sourceType: "Discovery call transcript",
          date: "13 Aug 2026",
          visibility: "client",
          supports:
            "Confirms the inventory lag is caused by manual, batched data entry rather than a system limitation.",
          conflicts:
            "Exact transaction-level cause (posting step vs. data entry) is not yet isolated.",
          relatedQuestions: [
            "How long after production does finished-goods inventory reflect in NetSuite today?",
          ],
          relatedOpportunities: ["Manufacturing execution visibility"],
        },
      },
      {
        id: "sig-2",
        finding: "NetSuite ACS support ends in October",
        evidence: "client-document",
        whyItMatters:
          "Escalation SLAs and configuration support fall away just as FSMA and peak-season work intensify.",
        relatedOpportunity: "NetSuite operational support",
        detail: {
          source: "Vendor support contract summary",
          excerpt:
            "The shared contract summary shows the Advanced Customer Support term ending in October with no renewal line item, leaving configuration changes and escalations without a defined owner.",
          sourceType: "Vendor contract (client-provided)",
          date: "Uploaded 13 Aug 2026",
          visibility: "client",
          supports:
            "Establishes a firm date for the support gap and its scope (config + escalations).",
          relatedQuestions: [
            "What is your plan for NetSuite support once ACS lapses in October?",
          ],
          relatedOpportunities: ["NetSuite operational support"],
        },
      },
      {
        id: "sig-3",
        finding:
          "FSMA 204 and GS1 traceability are consuming development capacity",
        evidence: "public-inference",
        whyItMatters:
          "Compliance work competes with operational improvements for the same limited internal engineering time.",
        relatedOpportunity: "Traceability & recall readiness",
        detail: {
          source: "FDA FSMA 204 guidance · Clio careers page · GS1 brief",
          excerpt:
            "Public FSMA 204 timelines plus a recent Clio job posting for a traceability analyst suggest lot-level traceability is absorbing meaningful internal roadmap capacity — to be confirmed on the call.",
          sourceType: "Public-source inference",
          date: "Accessed 12 Aug 2026",
          visibility: "public",
          supports:
            "Indicates traceability is an active internal priority and a likely capacity constraint.",
          conflicts:
            "No client confirmation yet of which SKUs are in scope or the internal effort involved.",
          relatedQuestions: [
            "Which product lines fall under FSMA 204, and what is your current lot-tracking method?",
          ],
          relatedOpportunities: ["Traceability & recall readiness"],
        },
      },
    ],
    opportunities: [
      {
        id: "opp-1",
        title: "Manufacturing execution visibility",
        value:
          "Close the 24-hour inventory lag by capturing production completion at the source.",
        strength: "strong",
        confirmation: "client-confirmed",
        validation: "Confirm daily volume and current data-entry ownership.",
      },
      {
        id: "opp-2",
        title: "Traceability & recall readiness",
        value:
          "Deliver FSMA 204 / GS1 lot traceability without stalling the operational roadmap.",
        strength: "moderate",
        confirmation: "public-inference",
        validation: "Confirm which SKUs are in scope and the compliance deadline.",
      },
      {
        id: "opp-3",
        title: "NetSuite operational support",
        value:
          "Provide continuity of configuration and escalation support after ACS lapses.",
        strength: "strong",
        confirmation: "client-document",
        validation: "Confirm decision timeline and internal support headcount.",
      },
    ],
    modules: {
      primary: [
        {
          id: "mod-1",
          name: "Inventory and lot-exception control tower",
          problem:
            "Inventory reflects production up to a day late, and lot exceptions surface too slowly.",
          outcome:
            "Near-real-time finished-goods visibility with exception alerts before they reach planning.",
          worksWith: ["NetSuite", "NetSuite WMS", "Power BI"],
          evidence: "client-confirmed",
          priorWork: true,
        },
        {
          id: "mod-2",
          name: "Demand-to-production readiness board",
          problem:
            "Planning works from stale availability, so production and demand drift out of sync.",
          outcome:
            "A shared readiness view aligning Netstock demand signals with actual production state.",
          worksWith: ["Netstock", "NetSuite", "In-house warehouse"],
          evidence: "public-inference",
          priorWork: true,
        },
        {
          id: "mod-3",
          name: "Traceability and recall-response cockpit",
          problem:
            "Lot genealogy is fragmented across systems, slowing recall readiness and FSMA reporting.",
          outcome:
            "One lineage view for lot genealogy and a rehearsed recall-response workflow.",
          worksWith: ["TraceGains", "NetSuite", "In-house warehouse"],
          evidence: "public-inference",
          priorWork: true,
        },
      ],
      additional: [
        {
          id: "mod-4",
          name: "Maintenance reliability and spares hub",
          problem:
            "Unplanned downtime and spares availability are not tied to production impact.",
          outcome:
            "Reliability signals and spares planning linked to line criticality.",
          worksWith: ["PLC / plant automation", "NetSuite"],
          evidence: "unverified",
          priorWork: false,
        },
        {
          id: "mod-5",
          name: "Close-ready operations data pack",
          problem:
            "Month-end operational data is assembled manually across systems.",
          outcome:
            "A close-ready pack that reconciles operational and financial views on schedule.",
          worksWith: ["NetSuite", "Power BI", "In-house warehouse"],
          evidence: "market-benchmark",
          priorWork: true,
        },
      ],
    },
    tech: {
      record: [
        { name: "NetSuite", role: "ERP · inventory · production system of record" },
        { name: "NetSuite WMS", role: "Warehouse execution and putaway/picking" },
      ],
      planning: [
        { name: "Netstock", role: "Demand and inventory planning" },
        { name: "TraceGains", role: "Supplier and compliance information" },
        { name: "Power BI", role: "Operational and management reporting" },
        { name: "In-house data warehouse", role: "Cross-system reporting store" },
      ],
      ot: [
        { name: "PLC / plant automation", role: "Line control and machine data" },
      ],
      handoffs: [
        {
          id: "ho-1",
          from: "Production (paper)",
          to: "NetSuite inventory",
          problem:
            "Manual, next-morning data entry creates the 24-hour inventory lag.",
          severity: "high",
        },
        {
          id: "ho-2",
          from: "PLC / plant automation",
          to: "NetSuite / warehouse",
          problem:
            "Machine and line data isn't linked to inventory or lot records.",
          severity: "high",
        },
        {
          id: "ho-3",
          from: "NetSuite",
          to: "Netstock",
          problem:
            "Planning consumes availability that is already a day stale.",
          severity: "medium",
        },
        {
          id: "ho-4",
          from: "TraceGains / NetSuite",
          to: "Lot genealogy",
          problem:
            "Lot lineage is stitched across systems with no single source.",
          severity: "medium",
        },
      ],
    },
    stakeholders: [
      {
        name: "Rafael Rodas",
        title: "COO",
        role: "Likely champion",
        why: "Owns the operational pain and the plant-scaling mandate.",
        focus: "Frame the inventory lag as a scaling risk, not an IT project.",
      },
      {
        name: "John McGuckin",
        title: "CEO",
        role: "Economic buyer",
        why: "Sets growth targets that the data gaps put at risk.",
        focus: "Connect operational visibility to capacity and service goals.",
      },
      {
        name: "John Thompson",
        title: "CFO",
        role: "Economic buyer",
        why: "Owns the NetSuite spend and the ACS renewal decision.",
        focus: "Position support continuity and close-readiness value.",
      },
      {
        name: "Warehouse Manager",
        title: "Operations",
        role: "Operational champion",
        why: "Lives the daily handoff failures between floor and system.",
        focus: "Validate where data entry breaks down day to day.",
      },
    ],
    unknowns: [
      {
        id: "unk-1",
        text: "Exact transaction-level cause of the 24-hour inventory lag",
        question:
          "How long after production does finished-goods inventory reflect in NetSuite today?",
      },
      {
        id: "unk-2",
        text: "Manufacturing data requested during buyer diligence",
        question:
          "What operational data did buyers ask for during recent diligence?",
      },
      {
        id: "unk-3",
        text: "Current system of record for lot genealogy",
        question:
          "Which product lines fall under FSMA 204, and what is your current lot-tracking method?",
      },
      {
        id: "unk-4",
        text: "Ownership and timeline for replacing NetSuite ACS support",
        question:
          "What is your plan for NetSuite support once ACS lapses in October?",
      },
    ],
    similar: [
      {
        id: "sim-1",
        area: "Inventory and posting visibility",
        relatedPain: "Delayed inventory posting distorting availability",
        clientLabel: "Prior project — mid-market F&B manufacturer",
        relevance:
          "Same paper-to-ERP gap; closed the lag with source-side capture.",
        similarity: "high",
      },
      {
        id: "sim-2",
        area: "Traceability and recall workflows",
        relatedPain: "Fragmented lot genealogy across systems",
        clientLabel: "Prior project — packaged foods producer",
        relevance: "Built a single lineage view and rehearsed recall workflow.",
        similarity: "high",
      },
      {
        id: "sim-3",
        area: "Demand-to-production coordination",
        relatedPain: "Planning working from stale production state",
        clientLabel: "Prior project — beverage manufacturer",
        relevance: "Aligned demand planning with real-time production readiness.",
        similarity: "medium",
      },
      {
        id: "sim-4",
        area: "Procurement master-data governance",
        relatedPain: "Inconsistent supplier and item master data",
        clientLabel: "Prior project — CPG distributor",
        relevance: "Related discipline; lower direct overlap with current pains.",
        similarity: "medium",
      },
    ],
  },
  full: [
    {
      id: "company",
      title: "Company context",
      summary: "What Clio Snacks does and the shape of the business.",
      findings: [
        {
          id: "f-1",
          finding:
            "Clio Snacks is a high-volume refrigerated snack manufacturer scaling capacity",
          whyItMatters:
            "Growth is outpacing the plant's data workflows, which is the root of most operational pain.",
          evidence: "public-inference",
          confidence: "high",
          sourceCount: 3,
          relatedOpportunity: "Manufacturing execution visibility",
          lastUpdated: "12 Aug",
          detail: {
            source: "Company site · industry press · LinkedIn",
            excerpt:
              "Public sources describe a refrigerated snack line with a recent capacity expansion and hiring in operations and quality.",
            sourceType: "Public-source inference",
            date: "Accessed 12 Aug 2026",
            visibility: "public",
            supports: "Establishes scale and growth trajectory.",
            relatedQuestions: [
              "What operational data did buyers ask for during recent diligence?",
            ],
            relatedOpportunities: ["Manufacturing execution visibility"],
          },
        },
      ],
    },
    {
      id: "operating",
      title: "Operating model",
      summary: "How production, inventory and planning run day to day.",
      findings: [
        {
          id: "f-2",
          finding:
            "Production completion is recorded on paper and keyed into NetSuite the next morning",
          whyItMatters:
            "This is the direct cause of the 24-hour inventory lag and downstream planning drift.",
          evidence: "client-confirmed",
          confidence: "high",
          sourceCount: 2,
          relatedOpportunity: "Manufacturing execution visibility",
          relatedQuestion:
            "How long after production does finished-goods inventory reflect in NetSuite today?",
          lastUpdated: "13 Aug",
          detail: {
            source: "Discovery call transcript — 13 Aug",
            excerpt:
              "The COO confirmed paper work orders completed at shift end and entered by a clerk the following morning.",
            sourceType: "Discovery call transcript",
            date: "13 Aug 2026",
            visibility: "client",
            supports:
              "Confirms manual, batched data entry as the mechanism of the lag.",
            conflicts: "Transaction-level posting step not yet isolated.",
            relatedQuestions: [
              "How long after production does finished-goods inventory reflect in NetSuite today?",
            ],
            relatedOpportunities: ["Manufacturing execution visibility"],
          },
        },
      ],
    },
    {
      id: "growth",
      title: "Growth and strategic events",
      summary: "Recent events shaping urgency.",
      findings: [
        {
          id: "f-3",
          finding: "Recent capacity expansion increased daily throughput",
          whyItMatters:
            "Higher volume magnifies the cost of every data delay and handoff gap.",
          evidence: "public-inference",
          confidence: "medium",
          sourceCount: 2,
          lastUpdated: "12 Aug",
          detail: {
            source: "Industry press · company updates",
            excerpt:
              "Coverage references a line expansion and increased production volume over the past year.",
            sourceType: "Public-source inference",
            date: "Accessed 12 Aug 2026",
            visibility: "public",
            supports: "Explains why existing workflows are now strained.",
            relatedQuestions: [],
            relatedOpportunities: ["Manufacturing execution visibility"],
          },
        },
      ],
    },
    {
      id: "signals",
      title: "Supply-chain signals",
      summary: "The strongest operational problems found.",
      findings: [
        {
          id: "f-4",
          finding: "24-hour finished-goods inventory lag",
          whyItMatters:
            "Distorts availability-to-promise and planning during peak demand.",
          evidence: "client-confirmed",
          confidence: "high",
          sourceCount: 2,
          relatedOpportunity: "Manufacturing execution visibility",
          relatedQuestion:
            "How long after production does finished-goods inventory reflect in NetSuite today?",
          lastUpdated: "13 Aug",
          detail: {
            source: "Discovery call transcript — 13 Aug · Ops walkthrough notes",
            excerpt:
              "Two client sources corroborate a ~24-hour delay between production and inventory reflection.",
            sourceType: "Client confirmed",
            date: "13 Aug 2026",
            visibility: "client",
            supports: "High-confidence operational pain with a clear cause.",
            relatedQuestions: [
              "How long after production does finished-goods inventory reflect in NetSuite today?",
            ],
            relatedOpportunities: ["Manufacturing execution visibility"],
          },
        },
        {
          id: "f-5",
          finding: "Lot genealogy is stitched across multiple systems",
          whyItMatters:
            "Slows recall readiness and FSMA 204 reporting; no single lineage owner.",
          evidence: "public-inference",
          confidence: "medium",
          sourceCount: 2,
          relatedOpportunity: "Traceability & recall readiness",
          relatedQuestion:
            "Which product lines fall under FSMA 204, and what is your current lot-tracking method?",
          lastUpdated: "12 Aug",
          detail: {
            source: "TraceGains overview · FSMA 204 guidance",
            excerpt:
              "System footprint implies lot data spans TraceGains, NetSuite and the warehouse store, with no unified genealogy.",
            sourceType: "Public-source inference",
            date: "Accessed 12 Aug 2026",
            visibility: "public",
            supports: "Points to a traceability consolidation opportunity.",
            conflicts: "System of record for lot genealogy unconfirmed.",
            relatedQuestions: [
              "Which product lines fall under FSMA 204, and what is your current lot-tracking method?",
            ],
            relatedOpportunities: ["Traceability & recall readiness"],
          },
        },
      ],
    },
    {
      id: "tech",
      title: "Technology landscape",
      summary: "Systems in use and the weak handoffs between them.",
      findings: [
        {
          id: "f-6",
          finding:
            "PLC/plant automation data is not linked to inventory or lot records",
          whyItMatters:
            "The floor generates data that never reaches the systems that need it.",
          evidence: "public-inference",
          confidence: "medium",
          sourceCount: 1,
          relatedOpportunity: "Manufacturing execution visibility",
          lastUpdated: "12 Aug",
          detail: {
            source: "Ops walkthrough notes",
            excerpt:
              "Line automation appears isolated from ERP/WMS, requiring manual bridging.",
            sourceType: "Public-source inference",
            date: "12 Aug 2026",
            visibility: "public",
            supports: "Confirms a high-value integration gap.",
            relatedQuestions: [],
            relatedOpportunities: ["Manufacturing execution visibility"],
          },
        },
      ],
    },
    {
      id: "risks",
      title: "Operational risks",
      summary: "Risks that could affect the engagement or the business.",
      findings: [
        {
          id: "f-7",
          finding: "NetSuite ACS support lapses in October with no named owner",
          whyItMatters:
            "Configuration and escalation support disappear during peak and FSMA work.",
          evidence: "client-document",
          confidence: "high",
          sourceCount: 1,
          relatedOpportunity: "NetSuite operational support",
          relatedQuestion:
            "What is your plan for NetSuite support once ACS lapses in October?",
          lastUpdated: "13 Aug",
          detail: {
            source: "Vendor support contract summary",
            excerpt:
              "Contract summary shows the ACS term ending in October without a renewal line.",
            sourceType: "Client document",
            date: "Uploaded 13 Aug 2026",
            visibility: "client",
            supports: "Firm date and scope for the support gap.",
            relatedQuestions: [
              "What is your plan for NetSuite support once ACS lapses in October?",
            ],
            relatedOpportunities: ["NetSuite operational support"],
          },
        },
      ],
    },
    {
      id: "stakeholders",
      title: "Stakeholders",
      summary: "Who to engage and why.",
      findings: [
        {
          id: "f-8",
          finding: "COO is the most likely champion for operational visibility",
          whyItMatters:
            "Aligns budget authority with the team feeling the daily pain.",
          evidence: "client-confirmed",
          confidence: "high",
          sourceCount: 1,
          lastUpdated: "13 Aug",
          detail: {
            source: "Discovery call transcript — 13 Aug",
            excerpt:
              "The COO led the operational discussion and framed scaling as the priority.",
            sourceType: "Client confirmed",
            date: "13 Aug 2026",
            visibility: "client",
            supports: "Identifies the champion and their framing.",
            relatedQuestions: [],
            relatedOpportunities: ["Manufacturing execution visibility"],
          },
        },
      ],
    },
    {
      id: "market",
      title: "Market and regulatory context",
      summary: "External pressures shaping priorities.",
      findings: [
        {
          id: "f-9",
          finding: "FSMA 204 deadlines are pulling forward traceability work",
          whyItMatters:
            "Regulatory timing competes with operational improvements for capacity.",
          evidence: "market-benchmark",
          confidence: "medium",
          sourceCount: 2,
          relatedOpportunity: "Traceability & recall readiness",
          lastUpdated: "12 Aug",
          detail: {
            source: "FDA FSMA 204 guidance · GS1 industry brief",
            excerpt:
              "Industry benchmarks show FSMA 204 absorbing 20–30% of mid-market food IT roadmaps.",
            sourceType: "Market benchmark",
            date: "Accessed 12 Aug 2026",
            visibility: "public",
            supports: "Contextualises the capacity pressure.",
            conflicts: "Clio-specific effort not yet confirmed.",
            relatedQuestions: [
              "Which product lines fall under FSMA 204, and what is your current lot-tracking method?",
            ],
            relatedOpportunities: ["Traceability & recall readiness"],
          },
        },
      ],
    },
    {
      id: "similar",
      title: "Similar Heizen work",
      summary: "Prior work relevant as proof.",
      findings: [
        {
          id: "f-10",
          finding:
            "Heizen has closed paper-to-ERP inventory gaps for a similar F&B manufacturer",
          whyItMatters:
            "De-risks the primary opportunity with a demonstrated approach.",
          evidence: "client-document",
          confidence: "high",
          sourceCount: 1,
          relatedOpportunity: "Manufacturing execution visibility",
          lastUpdated: "12 Aug",
          detail: {
            source: "Internal project record",
            excerpt:
              "A prior mid-market F&B engagement closed a comparable posting lag with source-side capture.",
            sourceType: "Client document",
            date: "Internal",
            visibility: "client",
            supports: "Direct precedent for the proposed approach.",
            relatedQuestions: [],
            relatedOpportunities: ["Manufacturing execution visibility"],
          },
        },
      ],
    },
  ],
  sources: [
    {
      id: "src-1",
      title: "Discovery call transcript — 13 Aug",
      type: "Discovery transcript",
      domainOrFile: "clio-discovery-2026-08-13.txt",
      visibility: "client",
      state: "processed",
      signals: 6,
      included: false,
      pending: true,
    },
    {
      id: "src-2",
      title: "Vendor support contract summary",
      type: "Vendor contract",
      domainOrFile: "netsuite-acs-summary.pdf",
      visibility: "client",
      state: "processed",
      signals: 2,
      included: false,
      pending: true,
    },
    {
      id: "src-3",
      title: "Company website",
      type: "Public web",
      domainOrFile: "cliosnacks.com",
      visibility: "public",
      state: "processed",
      signals: 4,
      included: true,
      pending: false,
    },
    {
      id: "src-4",
      title: "FDA FSMA 204 final rule guidance",
      type: "Regulatory",
      domainOrFile: "fda.gov",
      visibility: "public",
      state: "processed",
      signals: 3,
      included: true,
      pending: false,
    },
    {
      id: "src-5",
      title: "GS1 traceability industry brief",
      type: "Industry brief",
      domainOrFile: "gs1.org",
      visibility: "public",
      state: "processed",
      signals: 2,
      included: true,
      pending: false,
    },
    {
      id: "src-6",
      title: "Clio careers page",
      type: "Public web",
      domainOrFile: "cliosnacks.com/careers",
      visibility: "public",
      state: "processed",
      signals: 1,
      included: true,
      pending: false,
    },
    {
      id: "src-7",
      title: "Press release — regional distribution award",
      type: "Public web",
      domainOrFile: "prnewswire.com",
      visibility: "public",
      state: "processed",
      signals: 0,
      included: true,
      pending: false,
    },
    {
      id: "src-8",
      title: "Archived investor deck (2019)",
      type: "Public web",
      domainOrFile: "web.archive.org",
      visibility: "public",
      state: "failed",
      signals: 0,
      included: false,
      pending: false,
    },
  ],
  pending: [
    {
      id: "src-1",
      title: "Discovery call transcript — 13 Aug",
      type: "Discovery transcript (client-provided)",
      addedRelative: "Added 2h ago",
      visibility: "client",
      updated: ["4 questions updated", "2 opportunities strengthened"],
      pending: "Research brief not yet regenerated",
    },
    {
      id: "src-2",
      title: "Vendor support contract summary",
      type: "Vendor contract (client-provided)",
      addedRelative: "Added 3h ago",
      visibility: "client",
      updated: ["1 opportunity strengthened", "1 critical risk added"],
      pending: "Research brief not yet regenerated",
    },
  ],
};

export const researchByProject: Record<string, ResearchData> = {
  "clio-snacks": clioResearch,
};
