import { clioIntroQuestions, questionById } from "./discovery";
import type { Stage } from "../lib/stage";

/** Conversation-tree model for the Discovery Questions screen.
 *
 *  Five fixed threads — Production, Inventory, Traceability, Planning,
 *  Technology — each sequenced opening → clarifying → diagnostic → evidence.
 *  Every node links to a clioQuestions record (questionId) so the call
 *  agenda, Call Mode and the detail panel work off the same records;
 *  intro-sourced nodes also keep introId for the first-call phrasing.
 *  Captured answers are the intro-call / client-document record; the page
 *  decides per prep stage whether they are shown. */

export type ThreadId =
  | "production"
  | "inventory"
  | "traceability"
  | "planning"
  | "technology";

export type SeqRole = "opening" | "clarifying" | "diagnostic" | "evidence";
export type NodeKind = "business" | "technical";

export const SEQ_META: Record<SeqRole, { step: number; label: string }> = {
  opening: { step: 1, label: "Opening" },
  clarifying: { step: 2, label: "Clarifying" },
  diagnostic: { step: 3, label: "Diagnostic" },
  evidence: { step: 4, label: "Evidence request" },
};

export const KIND_LABEL: Record<NodeKind, string> = {
  business: "Business impact",
  technical: "Technical",
};

export interface NodeFollowUp {
  question: string;
  why: string;
}

/** Answer captured on the intro call or from client documents. */
export interface NodeAnswer {
  text: string;
  source: string;
  /** Contextual follow-up this answer opens up. */
  followUp: NodeFollowUp;
}

export interface TreeNode {
  id: string;
  role: SeqRole;
  kind: NodeKind;
  question: string;
  stakeholder: string;
  /** What asking this buys us — shown when the card is expanded. */
  why: string;
  /** Linked record in clioQuestions — enables agenda, Call Mode and detail. */
  questionId?: string;
  /** Linked record in clioIntroQuestions (source of the first-call phrasing). */
  introId?: string;
  answer?: NodeAnswer;
  /** Research-based working assumption standing in while unanswered. */
  assumption?: string;
}

export interface Thread {
  id: ThreadId;
  label: string;
  blurb: string;
  /** Always in sequence order — one node per role, opening first. */
  nodes: TreeNode[];
  /** Value-expansion prompt surfaced at the Account Expansion stage. */
  expansion: string;
}

const intro = (id: string) => clioIntroQuestions.find((q) => q.id === id)!;

type NodeExtras = Pick<TreeNode, "answer" | "assumption">;

/** Node backed by a discovery-bank question: text, stakeholder and rationale
 *  come from the bank so the tree can never drift from Call Mode. */
function fromBank(
  id: string,
  questionId: string,
  role: SeqRole,
  kind: NodeKind,
  extras: NodeExtras = {}
): TreeNode {
  const q = questionById(questionId)!;
  return {
    id,
    role,
    kind,
    questionId,
    question: q.question,
    stakeholder: q.stakeholder,
    why: q.whyItMatters,
    ...extras,
  };
}

/** Node backed by an intro-bank question, asked of Meera on the first call.
 *  A discovery-bank record with the same id powers agenda and Call Mode. */
function fromIntro(
  id: string,
  introId: string,
  role: SeqRole,
  kind: NodeKind,
  extras: NodeExtras = {}
): TreeNode {
  const q = intro(introId);
  return {
    id,
    role,
    kind,
    introId,
    questionId: introId,
    question: q.question,
    stakeholder: "Meera Iyer, VP Operations",
    why: q.intent,
    ...extras,
  };
}

const INTRO_SOURCE = "Intro call · 5 Aug";
const DOC_SOURCE = "Client documents";

export const CONVERSATION_THREADS: Thread[] = [
  {
    id: "production",
    label: "Production",
    blurb: "How the lines run and where execution data is captured.",
    expansion:
      "If line-side capture proves out on one line, what would the wider rollout need — and who else should be in the room?",
    nodes: [
      fromIntro("production-opening", "i-mfg-context", "opening", "business", {
        assumption:
          "Public signals point to added capacity and a fast-growing refrigerated range.",
        answer: {
          text: "Three lines over two shifts, with refrigerated bars the fastest-growing volume; a co-packer absorbs peak overflow.",
          source: INTRO_SOURCE,
          followUp: {
            question:
              "Which line or shift feels the strain first when volume steps up?",
            why: "Locates where execution visibility breaks before scaling plans firm up.",
          },
        },
      }),
      fromBank("production-clarifying", "q2", "clarifying", "technical", {
        assumption:
          "Research suggests completion is captured on paper and keyed into NetSuite the next morning.",
        answer: {
          text: "Completion is recorded on paper at shift end and keyed into NetSuite the following morning.",
          source: DOC_SOURCE,
          followUp: {
            question:
              "At which handoff do corrections most often get introduced — the clipboard, the keying, or the count?",
            why: "Pinpoints where source-side capture would remove the most rework.",
          },
        },
      }),
      fromBank("production-diagnostic", "q11", "diagnostic", "business"),
      fromBank("production-evidence", "q10", "evidence", "technical", {
        assumption:
          "Research infers plant-automation signals stay in the PLCs, unlinked to inventory or lot records.",
      }),
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    blurb: "Stock accuracy and the lag between the floor and the system.",
    expansion:
      "Once availability is trusted, which daily decision would real-time numbers change first?",
    nodes: [
      fromIntro("inventory-opening", "i-mfg-pain", "opening", "business", {
        assumption:
          "Hiring and capacity signals suggest manual capture is already under strain.",
        answer: {
          text: "Keeping NetSuite in step with the floor — counts drift through peak weeks and mornings go to reconciling.",
          source: INTRO_SOURCE,
          followUp: {
            question:
              "Which decisions get made on numbers you already suspect are stale?",
            why: "Connects the drift to a concrete operational cost before any fix is sized.",
          },
        },
      }),
      fromBank("inventory-clarifying", "q1", "clarifying", "business", {
        assumption:
          "Research points to a roughly 24-hour lag between production and system inventory.",
        answer: {
          text: "About a day — finished goods post the next morning once the paper work orders are keyed in.",
          source: DOC_SOURCE,
          followUp: {
            question:
              "During peak weeks, how many orders get promised against inventory that is already a day old?",
            why: "Ties the 24-hour lag to at-risk revenue, which sizes the business case.",
          },
        },
      }),
      fromIntro("inventory-diagnostic", "i-sc-impact", "diagnostic", "business"),
      {
        id: "inventory-evidence",
        role: "evidence",
        kind: "technical",
        questionId: "inventory-evidence",
        question:
          "Could you share a recent week of inventory adjustments and short-ship reports so we can size the drift?",
        stakeholder: "Warehouse Manager",
        why: "Adjustment volume is the hard number that turns “counts drift” into a cost the CFO recognises.",
      },
    ],
  },
  {
    id: "traceability",
    label: "Traceability",
    blurb: "Lot lineage from production to dispatch — and FSMA 204 readiness.",
    expansion:
      "Beyond compliance — could one-click recall readiness become a selling point with your retail buyers?",
    nodes: [
      fromIntro("traceability-opening", "i-sc-process", "opening", "technical", {
        assumption:
          "Research infers lot data is spread across TraceGains, NetSuite and warehouse records.",
        answer: {
          text: "Lots are labelled on the line; tracing one end-to-end means stitching NetSuite, the label system and a spreadsheet together.",
          source: INTRO_SOURCE,
          followUp: {
            question:
              "If a retailer called about a lot right now, how long would the full trace take?",
            why: "Turns the stitched-together process into a measurable recall-readiness gap.",
          },
        },
      }),
      fromBank("traceability-clarifying", "q6", "clarifying", "business", {
        assumption:
          "Public FSMA 204 timelines suggest traceability work is already on the clock.",
      }),
      fromBank("traceability-diagnostic", "q7", "diagnostic", "technical"),
      fromBank("traceability-evidence", "q8", "evidence", "technical"),
    ],
  },
  {
    id: "planning",
    label: "Planning",
    blurb: "Demand, forecasting and how the plan meets the floor.",
    expansion:
      "Which operational metric would have to move for this work to earn next quarter's budget — and who signs that off?",
    nodes: [
      fromIntro("planning-opening", "i-mfg-priorities", "opening", "business", {
        answer: {
          text: "Scale throughput for the co-manufacturing push without adding headcount, and protect service levels through peak.",
          source: INTRO_SOURCE,
          followUp: {
            question:
              "Which of those priorities has a number attached to it today?",
            why: "Anchors discovery on outcomes leadership is already measured on.",
          },
        },
      }),
      fromBank("planning-clarifying", "q9", "clarifying", "technical", {
        assumption:
          "Research suggests the plan consumes availability that is already a day stale.",
      }),
      {
        id: "planning-diagnostic",
        role: "diagnostic",
        kind: "business",
        questionId: "planning-diagnostic",
        question:
          "How often does the weekly plan get overridden on the floor, and what usually triggers it?",
        stakeholder: "Rafael Rodas, COO",
        why: "Override frequency reveals whether planning or execution data is the weaker link.",
      },
      {
        id: "planning-evidence",
        role: "evidence",
        kind: "technical",
        questionId: "planning-evidence",
        question:
          "Could you share last quarter's forecast-versus-actuals by SKU family?",
        stakeholder: "John Thompson, CFO",
        why: "Forecast error by family shows where better inputs would move service or waste first.",
      },
    ],
  },
  {
    id: "technology",
    label: "Technology",
    blurb: "Systems of record, integrations and the support runway.",
    expansion:
      "With ACS lapsing in October, how is next year's systems budget being framed — run cost or growth investment?",
    nodes: [
      fromIntro("technology-opening", "i-tech-process", "opening", "technical", {
        assumption:
          "The public stack — NetSuite, Netstock, Power BI — implies hand-built bridges between systems.",
        answer: {
          text: "NetSuite at the core, Netstock for planning and Power BI for reporting — hand-built exports bridge the gaps.",
          source: INTRO_SOURCE,
          followUp: {
            question: "Which of those hand-built bridges breaks most often?",
            why: "Finds the integration seam with the most operational pain attached.",
          },
        },
      }),
      fromBank("technology-clarifying", "q4", "clarifying", "technical", {
        assumption:
          "Research infers lot genealogy spans TraceGains, NetSuite and warehouse records — unconfirmed; the client mentions a standalone spreadsheet.",
      }),
      fromBank("technology-diagnostic", "q5", "diagnostic", "business", {
        assumption:
          "A client document confirms ACS support ends in October; no renewal decision is on record.",
      }),
      fromBank("technology-evidence", "q3", "evidence", "business"),
    ],
  },
];

/** Bank ids of the tree's diagnostic and evidence asks — held off the
 *  introductory-call agenda by default; users may add them manually. */
export const HOLD_FOR_DISCOVERY_IDS: ReadonlySet<string> = new Set(
  CONVERSATION_THREADS.flatMap((t) =>
    t.nodes
      .filter((n) => n.role === "diagnostic" || n.role === "evidence")
      .map((n) => n.questionId!)
  )
);

/** Captured answers only become visible once the intro call has happened —
 *  at the intro stage there is nothing on record yet. */
export const answersVisible = (stage: Stage) => stage !== "intro";

export const STAGE_NOTE: Record<Stage, string> = {
  intro:
    "Introductory call — lead with the broad openers; diagnostics and evidence requests are queued for the discovery round.",
  discovery:
    "Discovery call — the openers are captured below; focus this call on the diagnostics and evidence requests that close each thread.",
  expansion:
    "Account expansion — work the unanswered gaps and take each thread's value-expansion prompt into the conversation.",
};
