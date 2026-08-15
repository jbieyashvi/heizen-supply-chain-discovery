/* ================================================================
   Clio Snacks — Sources

   The evidence intake for the project. Statuses and counts line up with
   the Research source ledger and the findings/questions/opportunities
   used elsewhere in the prototype. Nothing here is persisted.
   ================================================================ */

export type Origin = "client" | "public" | "internal";
export type SourceStatus = "processed" | "processing" | "failed";

export const originMeta: Record<
  Origin,
  { label: string; tone: "accent" | "info" | "violet" }
> = {
  client: { label: "Client", tone: "accent" },
  public: { label: "Public", tone: "info" },
  internal: { label: "Internal", tone: "violet" },
};

export const statusMeta: Record<
  SourceStatus,
  { label: string; tone: "green" | "amber" | "red" }
> = {
  processed: { label: "Processed", tone: "green" },
  processing: { label: "Processing", tone: "amber" },
  failed: { label: "Failed", tone: "red" },
};

export interface TimelineStep {
  label: string;
  state: "done" | "active" | "pending";
  at?: string;
}

export interface SourceItem {
  id: string;
  name: string;
  type: string;
  origin: Origin;
  addedBy: string;
  date: string;
  status: SourceStatus;
  /** 0–100 while processing; 100 when processed. */
  progress: number;
  findings: number;
  questions: number;
  opportunities: number;
  included: boolean;
  needsAttention: boolean;
  /** file / domain / size line shown in the drawer + row. */
  metaLine: string;
  original: string;
  timeline: TimelineStep[];
  findingsList: string[];
  questionsList: string[];
  relatedOpportunities: string[];
  processStages: string[];
}

export const sourcesSummary = {
  total: 7,
  processed: 5,
  processing: 2,
  findings: 18,
  needsRefresh: true,
  pendingNotIncluded: 2,
};

export const AUTOMATION_NOTE =
  "Questions, Opportunities and the Process Map update automatically after processing. A Research brief refresh requires your approval.";

export const clioSources: SourceItem[] = [
  {
    id: "src-discovery",
    name: "Initial discovery call transcript",
    type: "Discovery transcript",
    origin: "client",
    addedBy: "Yashvi",
    date: "10 Aug 2026",
    status: "processed",
    progress: 100,
    findings: 5,
    questions: 4,
    opportunities: 2,
    included: true,
    needsAttention: false,
    metaLine: "clio-discovery-2026-08-10.txt · 42 min · 8,900 words",
    original: "clio-discovery-2026-08-10.txt",
    timeline: [
      { label: "Uploaded", state: "done", at: "10 Aug 2026, 16:20" },
      { label: "Parsed & transcribed", state: "done", at: "10 Aug 2026, 16:22" },
      { label: "Findings extracted", state: "done", at: "10 Aug 2026, 16:24" },
      { label: "Included in Research brief", state: "done", at: "12 Aug 2026" },
    ],
    findingsList: [
      "Paper-based work-order completion creates a 24-hour inventory lag",
      "24-hour finished-goods inventory lag distorts availability during peak",
      "Production completion is recorded on paper and keyed the next morning",
      "Warehouse execution runs in NetSuite WMS",
      "The COO is the most likely champion for operational visibility",
    ],
    questionsList: [
      "How long after production does finished-goods inventory reflect in NetSuite today?",
      "Walk me through how a completed work order moves into NetSuite.",
      "Who owns production-data entry and correction when work orders are posted late?",
      "What operational data did buyers request during recent diligence?",
    ],
    relatedOpportunities: ["Real-time Inventory Visibility"],
    processStages: ["Make", "Store"],
  },
  {
    id: "src-followup",
    name: "Follow-up operations call transcript",
    type: "Discovery transcript",
    origin: "client",
    addedBy: "Yashvi",
    date: "13 Aug 2026",
    status: "processed",
    progress: 100,
    findings: 6,
    questions: 4,
    opportunities: 2,
    included: false,
    needsAttention: true,
    metaLine: "clio-followup-2026-08-13.txt · 31 min · 6,400 words",
    original: "clio-followup-2026-08-13.txt",
    timeline: [
      { label: "Uploaded", state: "done", at: "13 Aug 2026, 11:05" },
      { label: "Parsed & transcribed", state: "done", at: "13 Aug 2026, 11:07" },
      { label: "Findings extracted", state: "done", at: "13 Aug 2026, 11:09" },
      { label: "Awaiting Research brief refresh", state: "active" },
    ],
    findingsList: [
      "A named owner and a Q4 window exist for the ACS support decision",
      "FSMA 204 scope is limited to the refrigerated lines",
      "Lot genealogy is kept in a standalone spreadsheet, not TraceGains",
      "Manual overrides correct the production plan when availability looks wrong",
      "Cycle counts partly reconcile the inventory lag today",
      "Peak-season volume roughly doubles daily order throughput",
    ],
    questionsList: [
      "If lot genealogy lives in a spreadsheet, who maintains it and how often is it reconciled?",
      "What's the internal fallback if no ACS support decision is made before October?",
      "During peak, how many orders get promised against day-old inventory?",
      "At which handoff do corrections most often get introduced?",
    ],
    relatedOpportunities: [
      "Lot Traceability & Compliance",
      "NetSuite operational support",
    ],
    processStages: ["Make", "Quality", "Data & Systems"],
  },
  {
    id: "src-website",
    name: "Company website",
    type: "Public web",
    origin: "public",
    addedBy: "Research agent",
    date: "12 Aug 2026",
    status: "processed",
    progress: 100,
    findings: 4,
    questions: 1,
    opportunities: 1,
    included: true,
    needsAttention: false,
    metaLine: "cliosnacks.com · 14 pages crawled",
    original: "cliosnacks.com",
    timeline: [
      { label: "Collected", state: "done", at: "12 Aug 2026, 09:02" },
      { label: "Parsed", state: "done", at: "12 Aug 2026, 09:05" },
      { label: "Findings extracted", state: "done", at: "12 Aug 2026, 09:08" },
      { label: "Included in Research brief", state: "done", at: "12 Aug 2026" },
    ],
    findingsList: [
      "Refrigerated snack manufacturer scaling capacity",
      "Recent line expansion appears to have increased throughput",
      "Active hiring in operations and quality",
      "Multiple refrigerated SKUs across the range",
    ],
    questionsList: [
      "What operational data did buyers request during recent diligence?",
    ],
    relatedOpportunities: ["Real-time Inventory Visibility"],
    processStages: ["Plan", "Make"],
  },
  {
    id: "src-netsuite",
    name: "NetSuite support summary",
    type: "Vendor summary",
    origin: "client",
    addedBy: "Yashvi",
    date: "11 Aug 2026",
    status: "processed",
    progress: 100,
    findings: 2,
    questions: 1,
    opportunities: 1,
    included: true,
    needsAttention: false,
    metaLine: "netsuite-support-summary.pdf · 6 pages",
    original: "netsuite-support-summary.pdf",
    timeline: [
      { label: "Uploaded", state: "done", at: "11 Aug 2026, 14:40" },
      { label: "Parsed", state: "done", at: "11 Aug 2026, 14:42" },
      { label: "Findings extracted", state: "done", at: "11 Aug 2026, 14:44" },
      { label: "Included in Research brief", state: "done", at: "12 Aug 2026" },
    ],
    findingsList: [
      "NetSuite ACS support ends in October with no renewal",
      "Configuration and escalation support fall away during peak and FSMA work",
    ],
    questionsList: [
      "What is your plan for NetSuite support once ACS lapses in October?",
    ],
    relatedOpportunities: ["NetSuite operational support"],
    processStages: ["Data & Systems"],
  },
  {
    id: "src-addendum",
    name: "Vendor support addendum",
    type: "Vendor addendum",
    origin: "client",
    addedBy: "Yashvi",
    date: "14 Aug 2026",
    status: "processing",
    progress: 62,
    findings: 0,
    questions: 0,
    opportunities: 0,
    included: false,
    needsAttention: false,
    metaLine: "netsuite-support-addendum.pdf · 3 pages",
    original: "netsuite-support-addendum.pdf",
    timeline: [
      { label: "Uploaded", state: "done", at: "14 Aug 2026, 09:15" },
      { label: "Parsing", state: "active" },
      { label: "Extract findings", state: "pending" },
      { label: "Ready", state: "pending" },
    ],
    findingsList: [],
    questionsList: [],
    relatedOpportunities: [],
    processStages: ["Data & Systems"],
  },
  {
    id: "src-spreadsheet",
    name: "Plant workflow spreadsheet",
    type: "Spreadsheet",
    origin: "client",
    addedBy: "Yashvi",
    date: "14 Aug 2026",
    status: "processing",
    progress: 34,
    findings: 0,
    questions: 0,
    opportunities: 0,
    included: false,
    needsAttention: false,
    metaLine: "plant-workflow.xlsx · 5 tabs",
    original: "plant-workflow.xlsx",
    timeline: [
      { label: "Uploaded", state: "done", at: "14 Aug 2026, 10:02" },
      { label: "Parsing", state: "active" },
      { label: "Extract findings", state: "pending" },
      { label: "Ready", state: "pending" },
    ],
    findingsList: [],
    questionsList: [],
    relatedOpportunities: [],
    processStages: ["Make", "Plan"],
  },
  {
    id: "src-market",
    name: "Public market context",
    type: "Market benchmark",
    origin: "public",
    addedBy: "Research agent",
    date: "12 Aug 2026",
    status: "processed",
    progress: 100,
    findings: 1,
    questions: 1,
    opportunities: 1,
    included: true,
    needsAttention: false,
    metaLine: "public sources · FSMA 204 timelines & benchmarks",
    original: "Public market context",
    timeline: [
      { label: "Collected", state: "done", at: "12 Aug 2026, 09:20" },
      { label: "Parsed", state: "done", at: "12 Aug 2026, 09:24" },
      { label: "Findings extracted", state: "done", at: "12 Aug 2026, 09:27" },
      { label: "Included in Research brief", state: "done", at: "12 Aug 2026" },
    ],
    findingsList: [
      "FSMA 204 deadlines are pulling forward traceability work across the sector",
    ],
    questionsList: [
      "Which product lines fall under FSMA 204, and what is the current lot-tracking method?",
    ],
    relatedOpportunities: ["Lot Traceability & Compliance"],
    processStages: ["Quality"],
  },
];

/** The add-source methods shown in the toolbar. */
export const ADD_METHODS: {
  id: string;
  label: string;
  icon: string;
  origin: Origin;
  type: string;
}[] = [
  { id: "upload", label: "Upload file", icon: "upload", origin: "client", type: "Uploaded file" },
  { id: "paste", label: "Paste transcript / text", icon: "clipboard", origin: "client", type: "Pasted transcript" },
  { id: "url", label: "Add website or YouTube URL", icon: "link", origin: "public", type: "Web / video source" },
  { id: "studio", label: "Import Heizen Studio meeting", icon: "video", origin: "internal", type: "Heizen Studio meeting" },
];
