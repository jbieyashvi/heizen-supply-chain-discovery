import { clioWhatChanged, clioConfidence, STAKEHOLDER } from "./discovery";
import type { Focus, FocusDomain } from "./focus";

/* ================================================================
   Lightweight in-product assistant (prototype)

   All content here is drawn from the existing Clio Snacks research
   and discovery data — it is grounded, not generative. Answers cite
   the project sources they were assembled from so the consultant can
   verify every claim. Nothing here is sent or persisted.
   ================================================================ */

export interface AiSourceRef {
  label: string;
  date?: string;
  visibility: "client" | "public";
  /** true when the source is not yet folded into the written brief. */
  pending?: boolean;
}

export interface AiAnswerBlock {
  heading: string;
  tone?: "ok" | "warn" | "info";
  points: string[];
}

export interface AiPrompt {
  id: string;
  prompt: string;
  answer: {
    summary: string;
    blocks: AiAnswerBlock[];
    sources: AiSourceRef[];
  };
}

const SRC_DISCOVERY: AiSourceRef = {
  label: "Initial discovery call transcript",
  date: "10 Aug 2026",
  visibility: "client",
};
const SRC_NETSUITE: AiSourceRef = {
  label: "NetSuite support summary",
  date: "11 Aug 2026",
  visibility: "client",
};
const SRC_PUBLIC: AiSourceRef = {
  label: "Company website & public market context",
  date: "12 Aug 2026",
  visibility: "public",
};
const SRC_FOLLOWUP: AiSourceRef = {
  label: "Follow-up operations call transcript",
  date: "13 Aug 2026",
  visibility: "client",
  pending: true,
};

/** The suggested prompts shown in the Ask AI panel, with grounded answers. */
export const ASK_AI_PROMPTS: AiPrompt[] = [
  {
    id: "prep",
    prompt: "What should I prepare before the call?",
    answer: {
      summary:
        "Lead with the four critical unknowns. The brief is usable, but two client sources added on 13–14 Aug aren't folded in yet — review them first.",
      blocks: [
        {
          heading: "Ask these first",
          tone: "info",
          points: [
            "Confirm the ~24-hour inventory lag precisely and quantify its cost during peak.",
            "Map how a completed work order moves from the line clipboard into NetSuite.",
            "Confirm the system of record for inventory, production and lot genealogy.",
            "Confirm the owner and timeline for NetSuite support after ACS lapses in October.",
          ],
        },
        {
          heading: "Watch-outs",
          tone: "warn",
          points: [
            "Research needs a refresh — two new sources aren't in the written brief yet.",
            "The lot-genealogy source of truth is contested (see “weak evidence”).",
          ],
        },
      ],
      sources: [SRC_DISCOVERY, SRC_NETSUITE, SRC_PUBLIC],
    },
  },
  {
    id: "weak-evidence",
    prompt: "Which assumptions have weak evidence?",
    answer: {
      summary:
        "Three findings rest on public inference rather than client confirmation, and one is directly contradicted by the latest call.",
      blocks: [
        {
          heading: "Public-source inference — unconfirmed",
          tone: "warn",
          points: [
            "Lot genealogy is stitched across TraceGains, NetSuite and the warehouse store.",
            "PLC / plant-automation data is not linked to inventory or lot records.",
            "A recent capacity expansion increased throughput.",
          ],
        },
        {
          heading: "Contradicted by the client",
          tone: "warn",
          points: [
            "The follow-up call suggests lot genealogy is kept in a standalone spreadsheet — not TraceGains. Validate before scoping traceability.",
          ],
        },
      ],
      sources: [SRC_PUBLIC, SRC_FOLLOWUP],
    },
  },
  {
    id: "risks",
    prompt: "What are the top operational risks?",
    answer: {
      summary:
        "Three risks stand out — ordered by how firm the evidence is and how soon they bite.",
      blocks: [
        {
          heading: "Ranked",
          tone: "info",
          points: [
            "NetSuite ACS support lapses in October with no named owner (client document).",
            "The 24-hour inventory lag distorts availability-to-promise during peak (client-confirmed).",
            "FSMA 204 traceability work is competing with operational improvements for capacity (market benchmark).",
          ],
        },
      ],
      sources: [SRC_NETSUITE, SRC_DISCOVERY, SRC_PUBLIC],
    },
  },
  {
    id: "transcript-change",
    prompt: "What changed after the latest transcript?",
    answer: {
      summary:
        "The 13 Aug follow-up call updated four discovery questions and strengthened two opportunities. It isn't in the written brief yet — refresh research to fold it in.",
      blocks: [
        {
          heading: "Confirmed",
          tone: "ok",
          points: clioWhatChanged.confirmed,
        },
        {
          heading: "New findings",
          tone: "info",
          points: clioWhatChanged.newFindings,
        },
        {
          heading: `Conflict · ${clioWhatChanged.conflict.opportunity}`,
          tone: "warn",
          points: [
            `Research: ${clioWhatChanged.conflict.researchSaid}`,
            `Client: ${clioWhatChanged.conflict.clientSaid}`,
          ],
        },
      ],
      sources: [SRC_FOLLOWUP],
    },
  },
];

/* ================================================================
   Project research assistant — suggested actions

   Answers stay grounded in Clio Snacks data, separate confirmed facts
   from inference, warn on weak evidence, link to related screens, and
   never claim prior work was delivered for THIS client. All simulated.
   ================================================================ */

const SRC_INTERNAL: AiSourceRef = {
  label: "Heizen delivery history (internal)",
  visibility: "public",
};

/** A link from an answer to a related project screen. */
export interface AiLink {
  label: string;
  screen: "research" | "discovery" | "opportunities" | "sources" | "process-map";
}

export interface AiRichAnswer {
  summary: string;
  blocks: AiAnswerBlock[]; // tone: ok = confirmed, info = inference, warn = weak/caution
  sources: AiSourceRef[];
  links?: AiLink[];
  /** Contextual follow-up prompts offered as chips under the answer. */
  followUps?: string[];
  /** If set, the answer can be focused on this domain (with confirmation). */
  domain?: FocusDomain;
  /** If set, offers "Add this question to shortlist" (review required). */
  shortlistQuestion?: string;
  /** Related opportunity label, surfaced as a review-gated action. */
  relatedOpportunity?: string;
}

export type AssistantActionKind = "answer" | "focus" | "investigate";

export interface AssistantAction {
  id: string;
  label: string;
  kind: AssistantActionKind;
  /** Applied to the project when the action is chosen. */
  focus?: Focus;
  /** Shown in the thread for answer actions. */
  answer?: AiRichAnswer;
  /** Short confirmation shown for pure focus actions. */
  focusNote?: string;
}

export const ASSISTANT_ACTIONS: AssistantAction[] = [
  {
    id: "prep-meera",
    label: "Prepare me for Meera Iyer",
    kind: "answer",
    focus: { stakeholderId: "meera" },
    answer: {
      summary:
        "Focused the project on Meera Iyer (VP Operations). Lead with operations and throughput — Manufacturing and Supply Chain matter most to her.",
      blocks: [
        {
          heading: "Confirmed — safe to state",
          tone: "ok",
          points: [
            "Paper-based work-order completion creates a ~24-hour inventory lag (client, 10 Aug call).",
            "NetSuite ACS support lapses in October with no named owner (client document).",
          ],
        },
        {
          heading: "Inference — raise as a question",
          tone: "info",
          points: [
            "Lot traceability appears stitched manually across systems — FSMA 204 exposure (public inference).",
            "Planning may be running on day-stale availability (inference from the data flow).",
          ],
        },
        {
          heading: "Weak evidence — don't assume",
          tone: "warn",
          points: [
            "Machine / PLC data linkage to inventory is unverified.",
            "Revenue and capacity-expansion figures are public estimates, not confirmed.",
          ],
        },
      ],
      sources: [SRC_DISCOVERY, SRC_NETSUITE, SRC_PUBLIC],
      links: [
        { label: "Open Research", screen: "research" },
        { label: "Prioritised questions", screen: "discovery" },
        { label: "Opportunities", screen: "opportunities" },
      ],
      domain: "manufacturing",
      shortlistQuestion:
        "Walk me through how a completed work order reaches NetSuite today — who posts it, and when?",
      relatedOpportunity: "Real-time inventory & posting visibility",
      followUps: [
        "What can I safely mention to Meera?",
        "What's the biggest operational risk?",
        "Any similar work Heizen has delivered?",
      ],
    },
  },
  {
    id: "focus-manufacturing",
    label: "Focus this project on Manufacturing",
    kind: "focus",
    focus: { domain: "manufacturing" },
    focusNote:
      "Focused on Manufacturing. Research signals, hypotheses and questions are re-ranked and related Heizen work is filtered to the top — nothing is hidden. Clear the focus chip to reset.",
  },
  {
    id: "focus-tech",
    label: "Show only Technology & AI initiatives",
    kind: "focus",
    focus: { domain: "tech-ai" },
    focusNote:
      "Focused on Technology & AI. Technology and AI signals rise to the top across Research, hypotheses and questions. Other items stay available — this re-ranks, it doesn't hide.",
  },
  {
    id: "safe-mention",
    label: "What can I safely mention on the call?",
    kind: "answer",
    answer: {
      summary:
        "Safe to raise what the client has confirmed. Frame everything else as a question, not a finding — and hold back anything with weak evidence.",
      blocks: [
        {
          heading: "Safe to mention — confirmed",
          tone: "ok",
          points: [
            "The ~24-hour inventory lag from paper-based completion (client-confirmed).",
            "The NetSuite ACS support deadline in October (client document).",
          ],
        },
        {
          heading: "Raise as a question — inference",
          tone: "info",
          points: [
            "How lot traceability actually works today (inferred, not confirmed).",
            "Whether planning runs on stale availability (inference).",
            "The recent capacity expansion (public inference).",
          ],
        },
        {
          heading: "Do not state as fact — weak / contested",
          tone: "warn",
          points: [
            "Lot genealogy living in TraceGains — the follow-up call suggests a spreadsheet instead.",
            "Machine / PLC data linkage — unverified.",
            "Vendors marked Unverified in Research (Netstock, TraceGains, NetSuite WMS) — do not mention on call until verified.",
          ],
        },
      ],
      sources: [SRC_DISCOVERY, SRC_NETSUITE, SRC_FOLLOWUP],
      links: [
        { label: "Check Research signals", screen: "research" },
        { label: "Review sources", screen: "sources" },
      ],
      shortlistQuestion:
        "Which of today's findings are you comfortable confirming, and which are still open?",
      followUps: [
        "Which assumptions have weak evidence?",
        "What changed after the latest transcript?",
        "What should I prepare before the call?",
      ],
    },
  },
  {
    id: "similar-work",
    label: "Find similar work Heizen has delivered",
    kind: "answer",
    answer: {
      summary:
        "Comparable prior work you can reference as proof. Present it as experience with other clients — none of this has been delivered for Clio Snacks.",
      blocks: [
        {
          heading: "Strong overlap",
          tone: "ok",
          points: [
            "Inventory & posting visibility — mid-market F&B manufacturer: closed the same paper-to-ERP lag with source-side capture.",
            "Traceability & recall workflows — packaged foods producer: built a single lineage view and rehearsed the recall.",
          ],
        },
        {
          heading: "Some overlap",
          tone: "info",
          points: [
            "Demand-to-production coordination — beverage manufacturer: aligned planning with real-time production readiness.",
          ],
        },
        {
          heading: "Say it carefully",
          tone: "warn",
          points: [
            "None of this has been delivered for Clio Snacks. Describe it as relevant prior experience — never as committed or completed work here.",
          ],
        },
      ],
      sources: [SRC_INTERNAL],
      links: [{ label: "Similar work in Research", screen: "research" }],
      relatedOpportunity: "Traceability & recall readiness",
      followUps: [
        "How relevant is the traceability work to Clio?",
        "What can I safely mention on the call?",
        "What are the top operational risks?",
      ],
    },
  },
  {
    id: "research-domain",
    label: "Research this domain further",
    kind: "investigate",
  },
];

/* ================================================================
   Free-text Q&A — grounded keyword matcher (prototype)

   Answers are assembled from the same Clio Snacks research, so every
   reply separates confirmed facts / inference / weak evidence, cites
   project sources, and offers contextual follow-ups. Nothing here is
   generative and nothing is ever written back to the project.
   ================================================================ */

function actionAnswer(id: string): AiRichAnswer {
  const a = ASSISTANT_ACTIONS.find((x) => x.id === id)?.answer;
  if (!a) throw new Error(`missing action answer ${id}`);
  return a;
}

const ANS_INVENTORY: AiRichAnswer = {
  summary:
    "The ~24-hour inventory lag is the firmest problem on the table — client-confirmed and safe to open with. What it costs at peak is still unquantified.",
  blocks: [
    {
      heading: "Confirmed — safe to state",
      tone: "ok",
      points: [
        "Paper-based work-order completion creates a ~24-hour inventory lag (client, 10 Aug call).",
        "The lag distorts availability-to-promise during peak periods (client-confirmed).",
      ],
    },
    {
      heading: "Inference — raise as a question",
      tone: "info",
      points: [
        "Planning is likely running on day-stale availability as a knock-on effect (inference from the data flow).",
      ],
    },
    {
      heading: "Weak / missing evidence — don't assume",
      tone: "warn",
      points: [
        "The cost of the lag during peak hasn't been quantified — ask, don't estimate.",
        "The exact hand-off from line clipboard to NetSuite is not yet mapped.",
      ],
    },
  ],
  sources: [SRC_DISCOVERY, SRC_NETSUITE],
  links: [
    { label: "Open Research", screen: "research" },
    { label: "Related opportunity", screen: "opportunities" },
  ],
  domain: "supply-chain",
  shortlistQuestion:
    "How does a completed work order move from the line into NetSuite today, and how long does posting take?",
  relatedOpportunity: "Real-time inventory & posting visibility",
  followUps: [
    "How much does the lag cost at peak?",
    "What can I safely mention about this?",
    "Is there similar Heizen work?",
  ],
};

const ANS_NETSUITE: AiRichAnswer = {
  summary:
    "The NetSuite ACS support deadline is a concrete, client-documented risk with no named owner — worth pinning down early.",
  blocks: [
    {
      heading: "Confirmed — safe to state",
      tone: "ok",
      points: [
        "NetSuite ACS support lapses in October with no named owner (client document).",
      ],
    },
    {
      heading: "Inference — raise as a question",
      tone: "info",
      points: [
        "Losing ACS could stall change requests and system fixes during peak (inference).",
      ],
    },
    {
      heading: "Weak / missing evidence — don't assume",
      tone: "warn",
      points: [
        "Who owns support after October, the replacement plan and its cost are all unknown.",
      ],
    },
  ],
  sources: [SRC_NETSUITE],
  links: [
    { label: "Opportunities", screen: "opportunities" },
    { label: "Review sources", screen: "sources" },
  ],
  domain: "tech-ai",
  shortlistQuestion:
    "Who owns NetSuite support once ACS lapses in October, and what's the transition plan?",
  followUps: [
    "What are the top operational risks?",
    "What can I safely mention on the call?",
    "What should I prepare before the call?",
  ],
};

const ANS_TRACE: AiRichAnswer = {
  summary:
    "Traceability is high-stakes but the evidence is contested — treat it as a question, not a finding. A follow-up call already contradicts the public picture.",
  blocks: [
    {
      heading: "Confirmed — safe to state",
      tone: "ok",
      points: [
        "FSMA 204 is a real, dated regulatory obligation for food producers (market context).",
      ],
    },
    {
      heading: "Inference — raise as a question",
      tone: "info",
      points: [
        "Lot genealogy appears stitched manually across systems today (public inference).",
      ],
    },
    {
      heading: "Weak / missing evidence — don't assume",
      tone: "warn",
      points: [
        "The follow-up call suggests lineage lives in a standalone spreadsheet, not TraceGains — contradiction, validate first.",
        "PLC / machine data linkage to lot records is unverified.",
        "TraceGains is marked Unverified in Research — do not mention on the call until confirmed.",
      ],
    },
  ],
  sources: [SRC_PUBLIC, SRC_FOLLOWUP],
  links: [
    { label: "Check Research signals", screen: "research" },
    { label: "Related opportunity", screen: "opportunities" },
  ],
  domain: "quality",
  shortlistQuestion:
    "Where does lot genealogy actually live today — a system of record or a spreadsheet?",
  relatedOpportunity: "Traceability & recall readiness",
  followUps: [
    "Which assumptions have weak evidence?",
    "What can I safely mention on the call?",
    "Any similar traceability work Heizen has done?",
  ],
};

const ANS_VENDORS: AiRichAnswer = {
  summary:
    "Only NetSuite is confirmed in use. The other tools are inferred or unverified — hold them back on the call until the client names them.",
  blocks: [
    {
      heading: "Confirmed — safe to state",
      tone: "ok",
      points: ["NetSuite is the ERP in use (client, discovery call)."],
    },
    {
      heading: "Inference — raise as a question",
      tone: "info",
      points: [
        "TraceGains and Netstock may be in the stack, but this is inferred from public context.",
      ],
    },
    {
      heading: "Weak / missing evidence — don't assume",
      tone: "warn",
      points: [
        "Netstock, TraceGains and NetSuite WMS are marked Unverified in Research — do not mention on the call until verified.",
      ],
    },
  ],
  sources: [SRC_DISCOVERY, SRC_PUBLIC],
  links: [
    { label: "Vendors in Research", screen: "research" },
    { label: "Review sources", screen: "sources" },
  ],
  domain: "tech-ai",
  shortlistQuestion:
    "Which planning, traceability and WMS tools are actually in use today?",
  followUps: [
    "What can I safely mention on the call?",
    "Which assumptions have weak evidence?",
    "Research the vendor landscape further",
  ],
};

const ANS_PLANNING: AiRichAnswer = {
  summary:
    "There's no confirmed planning problem yet — the strongest thread is that day-stale availability may be feeding planning. Frame it as a question.",
  blocks: [
    {
      heading: "Confirmed — safe to state",
      tone: "ok",
      points: [
        "The ~24-hour inventory lag is confirmed and would naturally affect planning inputs (client).",
      ],
    },
    {
      heading: "Inference — raise as a question",
      tone: "info",
      points: [
        "Demand and production planning may be running on stale availability (inference from the data flow).",
      ],
    },
    {
      heading: "Weak / missing evidence — don't assume",
      tone: "warn",
      points: [
        "No planning tool or S&OP cadence has been confirmed; Netstock is Unverified — do not name it on the call.",
      ],
    },
  ],
  sources: [SRC_DISCOVERY, SRC_PUBLIC],
  links: [{ label: "Prioritised questions", screen: "discovery" }],
  domain: "supply-chain",
  shortlistQuestion:
    "How is demand and production planning done today, and what data does it rely on?",
  followUps: [
    "How does the inventory lag affect planning?",
    "Which vendors are actually in use?",
    "What are the top operational risks?",
  ],
};

const ANS_RISKS: AiRichAnswer = {
  summary:
    "Three risks stand out, ordered by how firm the evidence is and how soon they bite.",
  blocks: [
    {
      heading: "Confirmed — firm evidence",
      tone: "ok",
      points: [
        "NetSuite ACS support lapses in October with no named owner (client document).",
        "The 24-hour inventory lag distorts availability-to-promise during peak (client-confirmed).",
      ],
    },
    {
      heading: "Inference — watch and validate",
      tone: "info",
      points: [
        "FSMA 204 traceability work is likely competing with operational fixes for capacity (market benchmark).",
      ],
    },
    {
      heading: "Weak / missing evidence — don't assume",
      tone: "warn",
      points: [
        "Machine / PLC data linkage and the lot-genealogy source of truth remain unverified.",
      ],
    },
  ],
  sources: [SRC_NETSUITE, SRC_DISCOVERY, SRC_PUBLIC],
  links: [{ label: "Opportunities", screen: "opportunities" }],
  shortlistQuestion:
    "Which of these risks is most urgent from your side before October?",
  followUps: [
    "Tell me more about the NetSuite deadline",
    "Which assumptions have weak evidence?",
    "What should I prepare before the call?",
  ],
};

const ANS_WEAK: AiRichAnswer = {
  summary:
    "Three findings rest on public inference rather than client confirmation, and one is directly contradicted by the latest call.",
  blocks: [
    {
      heading: "Confirmed — the firm ground",
      tone: "ok",
      points: [
        "The inventory lag and the NetSuite ACS deadline are the only client-confirmed items — build from these.",
      ],
    },
    {
      heading: "Inference — public sources only",
      tone: "info",
      points: [
        "Lot genealogy stitched across TraceGains, NetSuite and the warehouse store.",
        "PLC / plant-automation data not linked to inventory or lot records.",
        "A recent capacity expansion increased throughput.",
      ],
    },
    {
      heading: "Contradicted by the client — don't state",
      tone: "warn",
      points: [
        "The follow-up call suggests lot genealogy sits in a standalone spreadsheet, not TraceGains. Validate before scoping traceability.",
      ],
    },
  ],
  sources: [SRC_PUBLIC, SRC_FOLLOWUP],
  links: [{ label: "Review sources", screen: "sources" }],
  shortlistQuestion:
    "Can we confirm where lot genealogy lives and whether PLC data is linked?",
  followUps: [
    "What can I safely mention on the call?",
    "What changed after the latest transcript?",
    "What are the top operational risks?",
  ],
};

const ANS_CHANGED: AiRichAnswer = {
  summary:
    "The 13 Aug follow-up call updated four discovery questions and strengthened two opportunities. It isn't in the written brief yet — refresh research to fold it in.",
  blocks: [
    { heading: "Confirmed", tone: "ok", points: clioWhatChanged.confirmed },
    { heading: "New findings — inference", tone: "info", points: clioWhatChanged.newFindings },
    {
      heading: `Conflict · ${clioWhatChanged.conflict.opportunity}`,
      tone: "warn",
      points: [
        `Research: ${clioWhatChanged.conflict.researchSaid}`,
        `Client: ${clioWhatChanged.conflict.clientSaid}`,
      ],
    },
  ],
  sources: [SRC_FOLLOWUP],
  links: [
    { label: "Review sources", screen: "sources" },
    { label: "Opportunities", screen: "opportunities" },
  ],
  followUps: [
    "Which assumptions have weak evidence?",
    "What can I safely mention on the call?",
    "What should I prepare before the call?",
  ],
};

const ANS_PREP: AiRichAnswer = {
  summary:
    "Lead with the four critical unknowns. The brief is usable, but two client sources added on 13–14 Aug aren't folded in yet — review them first.",
  blocks: [
    {
      heading: "Confirmed — open with these",
      tone: "ok",
      points: [
        "The ~24-hour inventory lag from paper-based completion (client-confirmed).",
        "The NetSuite ACS support deadline in October (client document).",
      ],
    },
    {
      heading: "Inference — ask to confirm",
      tone: "info",
      points: [
        "How a completed work order actually reaches NetSuite today.",
        "Whether planning runs on day-stale availability.",
      ],
    },
    {
      heading: "Weak / missing evidence — verify first",
      tone: "warn",
      points: [
        "Research needs a refresh — two new sources aren't in the written brief yet.",
        "The lot-genealogy source of truth is contested.",
      ],
    },
  ],
  sources: [SRC_DISCOVERY, SRC_NETSUITE, SRC_PUBLIC],
  links: [
    { label: "Open Research", screen: "research" },
    { label: "Prioritised questions", screen: "discovery" },
  ],
  shortlistQuestion:
    "Confirm the ~24-hour inventory lag precisely and quantify its cost during peak.",
  followUps: [
    "What are the top operational risks?",
    "Which assumptions have weak evidence?",
    "What can I safely mention on the call?",
  ],
};

interface Topic {
  keys: string[];
  answer: () => AiRichAnswer;
}

/** Ordered topic library — first match wins. */
const TOPICS: Topic[] = [
  { keys: ["meera", "iyer", "vp operations", "operations lead"], answer: () => actionAnswer("prep-meera") },
  { keys: ["safe", "mention", "say on", "bring up", "raise on"], answer: () => actionAnswer("safe-mention") },
  { keys: ["similar", "delivered", "done before", "proof", "case study", "reference"], answer: () => actionAnswer("similar-work") },
  { keys: ["inventory", "lag", "posting", "24", "availability", "atp", "promise", "stock accuracy"], answer: () => ANS_INVENTORY },
  { keys: ["netsuite", "acs", "erp support", "october", "license", "maintenance"], answer: () => ANS_NETSUITE },
  { keys: ["trace", "lot", "genealogy", "recall", "fsma", "204", "lineage"], answer: () => ANS_TRACE },
  { keys: ["vendor", "tool", "software", "system in use", "netstock", "tracegains", "wms", "stack"], answer: () => ANS_VENDORS },
  { keys: ["plan", "demand", "forecast", "s&op", "sop", "replenish"], answer: () => ANS_PLANNING },
  { keys: ["risk", "concern", "danger", "worst", "urgent"], answer: () => ANS_RISKS },
  { keys: ["weak", "assumption", "unverified", "shaky", "uncertain", "evidence gap"], answer: () => ANS_WEAK },
  { keys: ["changed", "transcript", "update", "latest call", "new since", "follow-up call"], answer: () => ANS_CHANGED },
  { keys: ["prepare", "prep", "before the call", "get ready", "ahead of"], answer: () => ANS_PREP },
];

const ANS_FALLBACK: AiRichAnswer = {
  summary:
    "I can only answer from this project's research, so here's the grounded picture — treat the inferred and weak items as questions, not findings.",
  blocks: [
    {
      heading: "Confirmed — client-verified",
      tone: "ok",
      points: [
        "A ~24-hour inventory lag from paper-based work-order completion (client, 10 Aug call).",
        "NetSuite ACS support lapses in October with no named owner (client document).",
      ],
    },
    {
      heading: "Inference — raise as a question",
      tone: "info",
      points: [
        "Lot traceability and planning may be affected by the same data-flow gaps (inference).",
      ],
    },
    {
      heading: "Weak / missing evidence — don't assume",
      tone: "warn",
      points: [
        "I couldn't map your question to confirmed evidence — narrow it, or check Research directly. Nothing here should be stated as fact without verifying.",
      ],
    },
  ],
  sources: [SRC_DISCOVERY, SRC_NETSUITE, SRC_PUBLIC],
  links: [
    { label: "Open Research", screen: "research" },
    { label: "Prioritised questions", screen: "discovery" },
  ],
  followUps: [
    "What should I prepare before the call?",
    "What are the top operational risks?",
    "What can I safely mention on the call?",
  ],
};

/**
 * Answer a free-text question, grounded in the Clio Snacks project data.
 * Never generative: matches the question to a known topic and returns a
 * pre-built grounded answer, or a safe fallback. Nothing is written back.
 */
export function answerQuestion(query: string): AiRichAnswer {
  const q = query.toLowerCase();
  for (const t of TOPICS) {
    if (t.keys.some((k) => q.includes(k))) return t.answer();
  }
  return ANS_FALLBACK;
}

/* ---------- Simulated domain investigation ---------- */

export interface InvestigateFinding {
  text: string;
  confidence: "inference" | "unverified";
}
export interface InvestigateSource {
  label: string;
  type: string;
}
export interface InvestigateResult {
  query: string;
  summary: string;
  findings: InvestigateFinding[];
  suggestedSources: InvestigateSource[];
  note: string;
}

/** Simulate the assistant researching a domain. Returns additional
   research and suggested sources — NOT confirmed gaps. Nothing is added
   to the project automatically. */
export function investigateDomain(query: string): InvestigateResult {
  const q = query.trim() || "this domain";
  return {
    query: q,
    summary: `Simulated research on “${q}”. These are AI-suggested leads to verify — not confirmed findings, and nothing has been added to the project.`,
    findings: [
      {
        text: `Peer ${q.toLowerCase()} setups at this scale often centralise data before automating — a likely sequencing question for Clio.`,
        confidence: "inference",
      },
      {
        text: `Common ${q.toLowerCase()} vendors in mid-market F&B may already be in use here — confirm on the call rather than assuming.`,
        confidence: "unverified",
      },
      {
        text: `Regulatory or seasonal pressure could be shaping ${q.toLowerCase()} priorities this year.`,
        confidence: "inference",
      },
    ],
    suggestedSources: [
      { label: `${q} industry benchmark report`, type: "Market benchmark" },
      { label: `Clio Snacks ${q.toLowerCase()} page / press`, type: "Public source" },
      { label: `Ask the client for a ${q.toLowerCase()} systems list`, type: "Client request" },
    ],
    note: "AI-suggested — not confirmed gaps. Review each lead and add real sources from the Sources screen to fold them into research.",
  };
}

/* ---------- Follow-up email draft ---------- */

/** Owner mapping used only to draft the recap email (prototype). */
const EMAIL_OWNERS = [
  {
    item: "Production-data entry ownership",
    owner: "Clio · Rafael Rodas (COO)",
    next: "confirm the process owner for late work-order postings",
  },
  {
    item: "Lot-genealogy source of truth",
    owner: "Heizen + Clio",
    next: "validate whether lineage lives in a system or a spreadsheet",
  },
  {
    item: "Post-ACS NetSuite support",
    owner: "Clio · John Thompson (CFO)",
    next: "confirm the decision owner and timeline before October",
  },
];

const SIGNOFF = "Yashvi\nHeizen · Discovery";

/**
 * Build an editable recap email from the call's confirmed problems,
 * open unknowns, owners and recommended next step. `variant` lets
 * "Regenerate" offer a slightly different tone without inventing facts.
 */
export function buildFollowUpEmail(variant = 0): string {
  const unknowns = clioConfidence.map((c) => c.biggestUncertainty);
  const opening =
    variant % 2 === 0
      ? `Hi ${STAKEHOLDER.name.split(" ")[0]},\n\nThank you for your time today. Here's a short recap of what we confirmed and what we'll each pick up next.`
      : `Hi ${STAKEHOLDER.name.split(" ")[0]},\n\nGreat to talk today — a quick recap so we're aligned on what's confirmed and what's still open.`;

  const confirmed = clioWhatChanged.confirmed.map((c) => `• ${c}`).join("\n");
  const requested = unknowns.map((u) => `• ${u}`).join("\n");
  const owners = EMAIL_OWNERS.map(
    (o) => `• ${o.item} — ${o.owner} to ${o.next}.`
  ).join("\n");

  return [
    "Subject: Clio Snacks — discovery recap & next steps",
    "",
    opening,
    "",
    "Confirmed problems",
    confirmed,
    "",
    "Information we'd still like to confirm",
    requested,
    "",
    "Owners & next steps",
    owners,
    "",
    "Recommended next action",
    clioWhatChanged.recommendedNext,
    "",
    "We'll fold today's notes into the research brief and share an updated opportunity view. Please tell me if I've misstated anything above.",
    "",
    "Best,",
    SIGNOFF,
  ].join("\n");
}
