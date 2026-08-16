import { clioWhatChanged, clioConfidence, STAKEHOLDER } from "./discovery";
import type { Focus } from "./focus";

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
  screen: "research" | "discovery" | "opportunities" | "sources";
}

export interface AiRichAnswer {
  summary: string;
  blocks: AiAnswerBlock[]; // tone: ok = confirmed, info = inference, warn = weak/caution
  sources: AiSourceRef[];
  links?: AiLink[];
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
    },
  },
  {
    id: "research-domain",
    label: "Research this domain further",
    kind: "investigate",
  },
];

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
