import { clioWhatChanged, clioConfidence, STAKEHOLDER } from "./discovery";

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
