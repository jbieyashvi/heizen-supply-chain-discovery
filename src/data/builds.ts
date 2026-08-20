/**
 * Recommended builds — the "what should we build for this customer?" layer.
 *
 * These are not new facts. Each build is a ranked read of data that already
 * exists elsewhere in the app:
 *   · research evidence   → data/mock.ts insights + data/opportunities.ts evidence
 *   · customer context    → the discovery calls, stakeholders and open unknowns
 *   · Heizen experience   → data/heizenWork.ts prior delivery
 * The three ranking signals below are what make that ordering visible on screen.
 */
import type { EvidenceLevel } from "./types";
import type { Provenance } from "./heizenWork";
import type { Stage } from "../lib/stage";

export type BuildConfidence = "high" | "medium" | "low";

/** How much a single ranking signal contributes. Three levels, no more. */
export type SignalLevel = "strong" | "moderate" | "thin";

export interface RankSignal {
  id: "research" | "context" | "experience";
  label: string;
  level: SignalLevel;
  /** One line: what actually backs this signal. */
  note: string;
}

export interface BuildEvidence {
  text: string;
  level: EvidenceLevel;
  source: string;
}

export interface BuildQuestion {
  /** Matches an id in data/discovery.ts so the Discovery page stays the source. */
  id: string;
  question: string;
  unlocks: string;
}

export interface BuildProcess {
  /** Human summary of where in their process this build lands. */
  headline: string;
  steps: { area: string; step: string; note: string }[];
}

export interface BuildPriorWork {
  /** Matches an id in data/heizenWork.ts. */
  id: string;
  title: string;
  client: string;
  provenance: Provenance;
  overlap: number;
  outcome: string;
  /** Reference-safe phrasing, mirroring heizenWork's `safeToSay`. */
  safeToSay: string;
  difference: string;
}

export interface RecommendedBuild {
  id: string;
  /** Cross-reference into data/opportunities.ts — same thing, decision framing. */
  opportunityId: string;
  name: string;
  /** One line, in the customer's terms. */
  problem: string;
  impact: string;
  impactValue: string;
  delivery: string;
  deliveryNote: string;
  confidence: BuildConfidence;
  confidenceNote: string;
  /** The at-a-glance "has Heizen built this before?" answer. */
  builtBefore: { label: string; detail: string; provenance: Provenance };
  /** Why this build sits at this rank, in one sentence. */
  rankNote: string;
  signals: RankSignal[];
  why: {
    evidence: BuildEvidence[];
    unknowns: string[];
    questions: BuildQuestion[];
    process: BuildProcess;
    priorWork: BuildPriorWork;
  };
}

export const buildConfidenceMeta: Record<
  BuildConfidence,
  { label: string; tone: "green" | "amber" | "neutral" }
> = {
  high: { label: "High confidence", tone: "green" },
  medium: { label: "Medium confidence", tone: "amber" },
  low: { label: "Low confidence", tone: "neutral" },
};

export const signalMeta: Record<SignalLevel, { label: string; filled: number }> = {
  strong: { label: "Strong", filled: 3 },
  moderate: { label: "Moderate", filled: 2 },
  thin: { label: "Thin", filled: 1 },
};

/** Shown behind the "How ranking works" hint on the Recommended builds
    header. The three signals never change, but their weighting does — it
    follows how much customer context exists at each preparation stage. */
export const rankingExplainer: Record<Stage, string> = {
  intro:
    "Builds are ordered on three signals: research evidence, customer context and Heizen delivery experience. Their weighting shifts as customer context accumulates — before the first call there is almost none, so external research, industry benchmarks and similar Heizen work carry the ranking. Everything here is provisional until Clio confirms it. The signals are shown so you can disagree with the order.",
  discovery:
    "Builds are ordered on three signals: research evidence, customer context and Heizen delivery experience. Their weighting shifts as customer context accumulates — with two calls and a client document in, Clio's own evidence now leads the ranking, ahead of benchmarks and prior work. The signals are shown so you can disagree with the order.",
  expansion:
    "Builds are ordered on three signals: research evidence, customer context and Heizen delivery experience. Their weighting shifts as customer context accumulates — in an established account, delivery feasibility, effort and time-to-value weigh in alongside the signals, favouring builds the team already in the account can prove quickly. The signals are shown so you can disagree with the order.",
};

/** The subtle "Ranking updated from…" note under the section header —
    absent at Introductory Call, which is the baseline ranking. */
export const rankingShift: Record<Stage, string | null> = {
  intro: null,
  discovery:
    "Ranking updated from Introductory Call — two client calls and a shared support document folded in.",
  expansion:
    "Ranking updated from Discovery Call — delivery feasibility and account context folded in.",
};

export const clioBuilds: RecommendedBuild[] = [
  /* ---------------- 1 · primary ---------------- */
  {
    id: "build-capture",
    opportunityId: "opp-inventory",
    name: "Line-side production capture into NetSuite",
    problem:
      "Production is written on paper at shift end and keyed in the next morning, so inventory runs up to a day behind.",
    impact: "Same-shift finished-goods accuracy; order promising stops guessing during peak.",
    impactValue: "$0.6M–0.9M / yr",
    delivery: "6–8 weeks",
    deliveryNote: "One line first, then roll out across the plant.",
    confidence: "high",
    confidenceNote:
      "Client-confirmed on the 10 Aug call and re-stated on 13 Aug. What's open is sizing and ownership, not whether the problem is real.",
    builtBefore: {
      label: "Yes — delivered",
      detail: "Mid-market F&B manufacturer, same paper-to-NetSuite gap",
      provenance: "delivered",
    },
    rankNote:
      "Ranked first: the only build where all three signals are strong — confirmed evidence, named by the COO as the peak-season blocker, and Heizen has shipped the same fix on NetSuite.",
    signals: [
      {
        id: "research",
        label: "Research evidence",
        level: "strong",
        note: "Client-confirmed finding, corroborated by the follow-up operations call.",
      },
      {
        id: "context",
        label: "Customer context",
        level: "strong",
        note: "Raised unprompted by operations as the constraint during peak demand.",
      },
      {
        id: "experience",
        label: "Heizen delivery experience",
        level: "strong",
        note: "Delivered for an F&B manufacturer on NetSuite — 85% process overlap.",
      },
    ],
    why: {
      evidence: [
        {
          text: "Line supervisors record output on paper at shift end; it is keyed into NetSuite the following morning, leaving finished goods up to 24 hours behind actual.",
          level: "client-confirmed",
          source: "Initial discovery call transcript — 10 Aug",
        },
        {
          text: "Availability-to-promise is distorted during peak demand, so orders are promised against stale stock.",
          level: "client-confirmed",
          source: "Follow-up operations call transcript — 13 Aug",
        },
        {
          text: "NetSuite is already the system of record for inventory, so this is an input problem rather than a platform change.",
          level: "client-document",
          source: "NetSuite support summary — 11 Aug (client-provided)",
        },
      ],
      unknowns: [
        "Daily work-order volume per line — sizing depends on it.",
        "Who owns production-data entry and correction when postings run late.",
        "Whether line tablets or scanners already exist on the floor.",
      ],
      questions: [
        {
          id: "q1",
          question:
            "How long after production does finished-goods inventory reflect in NetSuite today?",
          unlocks: "Turns the 24-hour lag from a quote into a measured number.",
        },
        {
          id: "q2",
          question:
            "Walk me through how a completed work order moves from the line clipboard into NetSuite.",
          unlocks: "Exposes every touchpoint the build has to replace.",
        },
        {
          id: "q11",
          question:
            "Who owns production-data entry and correction when work orders are posted late?",
          unlocks: "Names the process owner the pilot needs on side.",
        },
      ],
      process: {
        headline:
          "Sits on the Make → Store handoff, where the delayed posting is already mapped.",
        steps: [
          {
            area: "Make",
            step: "Completion capture",
            note: "Paper at shift end — the origin of the lag.",
          },
          {
            area: "Make",
            step: "NetSuite posting",
            note: "Next-morning keying, mapped as a delayed handoff.",
          },
          {
            area: "Store",
            step: "Availability update",
            note: "Inherits the lag and feeds order promising.",
          },
        ],
      },
      priorWork: {
        id: "hw-inventory",
        title: "Real-time inventory visibility",
        client: "Mid-market F&B manufacturer",
        provenance: "delivered",
        overlap: 85,
        outcome:
          "Replaced end-of-shift paper capture with line-side entry posting to NetSuite, closing a comparable overnight lag.",
        safeToSay:
          "We've delivered line-side production capture into NetSuite for a food manufacturer with the same paper-at-shift-end process.",
        difference:
          "That plant ran three lines against Clio's five, and had scanners already on the floor.",
      },
    },
  },

  /* ---------------- 2 · secondary ---------------- */
  {
    id: "build-lot",
    opportunityId: "opp-traceability",
    name: "Lot genealogy and recall rehearsal",
    problem:
      "A recall today means reconstructing lot lineage by hand across spreadsheets, paper and NetSuite.",
    impact: "Hours instead of days to trace a lot, and an FSMA 204 story that holds up.",
    impactValue: "$0.4M–0.7M / yr risk avoided",
    delivery: "8–10 weeks",
    deliveryNote: "Scope depends on how many SKUs fall under FSMA 204.",
    confidence: "medium",
    confidenceNote:
      "The capability gap is visible, but FSMA 204 scope is inferred from public signals rather than confirmed by Clio.",
    builtBefore: {
      label: "Yes — delivered",
      detail: "Packaged foods producer, lot genealogy and recall drill",
      provenance: "delivered",
    },
    rankNote:
      "Ranked above NetSuite cover because Heizen has delivered it before — the open question is scope, not capability.",
    signals: [
      {
        id: "research",
        label: "Research evidence",
        level: "moderate",
        note: "Regulatory pressure is public-inference; Clio hasn't confirmed SKU scope.",
      },
      {
        id: "context",
        label: "Customer context",
        level: "moderate",
        note: "Hiring a traceability analyst, but no internal deadline shared yet.",
      },
      {
        id: "experience",
        label: "Heizen delivery experience",
        level: "strong",
        note: "Delivered lot genealogy and a recall drill for a packaged foods producer.",
      },
    ],
    why: {
      evidence: [
        {
          text: "FSMA 204 and GS1 lot-level traceability are reported to absorb 20–30% of mid-market food IT roadmaps.",
          level: "public-inference",
          source: "FDA FSMA 204 guidance · GS1 industry brief",
        },
        {
          text: "Clio is publicly hiring a traceability analyst, suggesting the load is being felt internally.",
          level: "public-inference",
          source: "Clio careers page",
        },
        {
          text: "Lot genealogy is maintained outside the ERP today, so recall reconstruction is manual.",
          level: "unverified",
          source: "Process map — Quality area, not yet validated",
        },
      ],
      unknowns: [
        "Whether lot genealogy lives in a system or in spreadsheets.",
        "Which product lines actually fall under FSMA 204.",
        "Whether a recall drill has ever been run, and how long it took.",
      ],
      questions: [
        {
          id: "q6",
          question:
            "Which product lines fall under FSMA 204, and what is the current lot-tracking method?",
          unlocks: "Sizes the build — this is the single largest scope driver.",
        },
        {
          id: "q4",
          question:
            "Which system is the current source of truth for inventory, production, and lot genealogy?",
          unlocks: "Decides whether this extends NetSuite or sits beside it.",
        },
      ],
      process: {
        headline: "Lands in Quality, where lot genealogy is mapped but not validated.",
        steps: [
          {
            area: "Quality",
            step: "Lot genealogy",
            note: "Maintained outside the ERP — the gap to close.",
          },
          {
            area: "Quality",
            step: "GS1 labelling",
            note: "Case labels are produced today; the lineage behind them isn't linked.",
          },
        ],
      },
      priorWork: {
        id: "hw-traceability",
        title: "Lot traceability and recall readiness",
        client: "Packaged foods producer",
        provenance: "delivered",
        overlap: 78,
        outcome:
          "Built lot genealogy on top of the existing ERP and ran a timed recall rehearsal against it.",
        safeToSay:
          "We've built lot genealogy and run recall rehearsals for a packaged foods producer under the same FSMA 204 pressure.",
        difference:
          "That producer had already chosen its FSMA 204 scope; Clio hasn't, so scoping comes first.",
      },
    },
  },

  /* ---------------- 3 · secondary ---------------- */
  {
    id: "build-netsuite-cover",
    opportunityId: "opp-inventory",
    name: "NetSuite support cover after ACS lapses",
    problem:
      "Advanced Customer Support ends in October with no renewal planned, right as compliance work peaks.",
    impact: "Escalation SLAs and configuration support continue through the FSMA window.",
    impactValue: "Continuity — not yet sized",
    delivery: "3–4 weeks to stand up",
    deliveryNote: "Runs alongside whichever build goes first.",
    confidence: "medium",
    confidenceNote:
      "The lapse is documented in writing. What's unknown is Clio's decision timeline and whether they intend to absorb it internally.",
    builtBefore: {
      label: "Not yet — in discovery",
      detail: "Scoping a similar NetSuite support engagement elsewhere",
      provenance: "in-discovery",
    },
    rankNote:
      "The best-documented of the three, but ranked third because Heizen hasn't delivered a support engagement like this yet.",
    signals: [
      {
        id: "research",
        label: "Research evidence",
        level: "strong",
        note: "Confirmed by a client-provided support document, with a dated deadline.",
      },
      {
        id: "context",
        label: "Customer context",
        level: "moderate",
        note: "Not raised by Clio on either call — surfaced from their own document.",
      },
      {
        id: "experience",
        label: "Heizen delivery experience",
        level: "thin",
        note: "One comparable engagement in discovery; nothing delivered yet.",
      },
    ],
    why: {
      evidence: [
        {
          text: "Clio's ACS contract for NetSuite lapses in October and is not slated for renewal; escalation SLAs and configuration support fall away with it.",
          level: "client-document",
          source: "NetSuite support summary — 11 Aug (client-provided)",
        },
        {
          text: "The lapse coincides with the FSMA compliance push, so support demand rises as cover disappears.",
          level: "public-inference",
          source: "FDA FSMA 204 guidance",
        },
      ],
      unknowns: [
        "Whether Clio intends to renew, replace, or absorb support internally.",
        "How many internal NetSuite administrators they have.",
        "The decision timeline — October is the lapse, not necessarily the decision.",
      ],
      questions: [
        {
          id: "q5",
          question: "What is your plan for NetSuite support once ACS lapses in October?",
          unlocks:
            "Establishes whether there is a real gap or an internal plan already in place.",
        },
      ],
      process: {
        headline:
          "Cross-cutting — it protects every NetSuite-dependent step rather than changing one.",
        steps: [
          {
            area: "Make",
            step: "NetSuite posting",
            note: "Configuration changes here need support cover.",
          },
          {
            area: "Store",
            step: "Availability update",
            note: "Depends on the same NetSuite configuration.",
          },
        ],
      },
      priorWork: {
        id: "hw-netsuite-support",
        title: "NetSuite managed support",
        client: "Another discovery-stage client",
        provenance: "in-discovery",
        overlap: 65,
        outcome:
          "Currently being scoped — no delivered engagement to reference yet.",
        safeToSay:
          "We're scoping a NetSuite managed-support engagement with another client. Don't present it as delivered work.",
        difference:
          "Nothing has shipped, so this can be offered as capability but not as a reference.",
      },
    },
  },
];

/* ---------------- Stage awareness ----------------
   The base builds above are written at Discovery Call level, where call
   transcripts and client documents exist. The overlays below re-read the
   same builds for the other two stages: the Introductory Call view strips
   every client-confirmed claim back to external research, benchmarks and
   prior Heizen work, and the Account Expansion view folds in delivery
   feasibility, effort and time-to-value for an account Heizen is already
   inside. Anything an overlay doesn't override carries over unchanged. */

export interface BuildStageOverlay {
  confidence?: BuildConfidence;
  confidenceNote?: string;
  deliveryNote?: string;
  rankNote?: string;
  signals?: RankSignal[];
  evidence?: BuildEvidence[];
  unknowns?: string[];
}

const introOverlays: Record<string, BuildStageOverlay> = {
  "build-capture": {
    confidence: "medium",
    confidenceNote:
      "Provisional — assembled from benchmarks and the plant profile, not from Clio. The first call must confirm the paper-to-NetSuite lag exists and how large it is.",
    rankNote:
      "Ranked first provisionally: mid-market F&B benchmarks make this lag the most likely constraint for a plant of this shape, and it is the build Heizen has delivered before at the highest process overlap.",
    signals: [
      {
        id: "research",
        label: "Research evidence",
        level: "moderate",
        note: "Benchmark-driven — the lag pattern is typical for plants this size. Nothing from Clio yet.",
      },
      {
        id: "context",
        label: "Customer context",
        level: "thin",
        note: "No conversation has happened yet — this is exactly what the first call validates.",
      },
      {
        id: "experience",
        label: "Heizen delivery experience",
        level: "strong",
        note: "Delivered for an F&B manufacturer on NetSuite — 85% process overlap.",
      },
    ],
    evidence: [
      {
        text: "Mid-market F&B plants that close production on paper typically run finished-goods inventory 12–24 hours behind actual.",
        level: "market-benchmark",
        source: "F&B operations benchmarks",
      },
      {
        text: "Clio runs five production lines from a single refrigerated plant — the profile where end-of-shift capture becomes the constraint.",
        level: "public-inference",
        source: "Company website · trade press",
      },
      {
        text: "Production capture at Clio is assumed to be manual. No client statement supports this yet.",
        level: "unverified",
        source: "Working hypothesis — first-call brief",
      },
    ],
    unknowns: [
      "Whether production is actually captured on paper and keyed in later — the entire premise.",
      "How far behind actual the finished-goods position runs.",
      "Which system is the source of truth for inventory today.",
    ],
  },
  "build-lot": {
    confidence: "medium",
    confidenceNote:
      "Provisional — the regulatory pressure and the traceability hire are public signals. Nothing from Clio confirms scope or urgency; the first call must establish both.",
    rankNote:
      "Ranked second provisionally: credible public FSMA 204 signals and a delivered Heizen reference, held back by a scope that is entirely unvalidated.",
    signals: [
      {
        id: "research",
        label: "Research evidence",
        level: "moderate",
        note: "FSMA 204 exposure and the traceability hire are public signals — credible, unconfirmed.",
      },
      {
        id: "context",
        label: "Customer context",
        level: "thin",
        note: "No client conversation yet — the job posting is the only Clio-specific signal.",
      },
      {
        id: "experience",
        label: "Heizen delivery experience",
        level: "strong",
        note: "Delivered lot genealogy and a recall drill for a packaged foods producer.",
      },
    ],
    evidence: [
      {
        text: "FSMA 204 and GS1 lot-level traceability are reported to absorb 20–30% of mid-market food IT roadmaps.",
        level: "market-benchmark",
        source: "FDA FSMA 204 guidance · GS1 industry brief",
      },
      {
        text: "Clio is publicly hiring a traceability analyst, suggesting the load is being felt internally.",
        level: "public-inference",
        source: "Clio careers page",
      },
      {
        text: "Lot genealogy is assumed to live outside the ERP, which would make recall reconstruction manual.",
        level: "unverified",
        source: "Working hypothesis — process research",
      },
    ],
    unknowns: [
      "Which product lines fall under FSMA 204 — the largest scope driver.",
      "Whether lot genealogy lives in a system or in spreadsheets.",
      "Whether a recall has ever been rehearsed, and how long a trace takes.",
    ],
  },
  "build-netsuite-cover": {
    confidence: "medium",
    confidenceNote:
      "Provisional — the lapse date is documented in the shared support summary, but Clio's intent is unknown. The first call must establish whether a real gap exists.",
    rankNote:
      "Ranked third provisionally: the support document is the hardest pre-call evidence of the three, but Heizen has no delivered support engagement to stand behind it yet.",
    signals: [
      {
        id: "research",
        label: "Research evidence",
        level: "strong",
        note: "A client-shared support summary dates the lapse — the hardest evidence before any call.",
      },
      {
        id: "context",
        label: "Customer context",
        level: "thin",
        note: "Not yet discussed with Clio — the document arrived without commentary.",
      },
      {
        id: "experience",
        label: "Heizen delivery experience",
        level: "thin",
        note: "One comparable engagement in discovery; nothing delivered yet.",
      },
    ],
    unknowns: [
      "Whether Clio plans to renew, replace or absorb support internally — ask directly.",
      "How many internal NetSuite administrators they have today.",
      "When the decision gets made — October is the lapse, not the decision.",
    ],
  },
};

const expansionOverlays: Record<string, BuildStageOverlay> = {
  "build-capture": {
    confidence: "high",
    confidenceNote:
      "Confirmed problem in a known account — the plant, stakeholders and NetSuite estate are mapped, so what remains is execution rather than validation.",
    deliveryNote: "One line first — low mobilisation effort on the account's existing NetSuite estate.",
    rankNote:
      "Ranked first: confirmed value with well-understood effort — the team already in the account extends the mapped Make → Store handoff, the shortest path to measurable value here.",
    signals: [
      {
        id: "research",
        label: "Research evidence",
        level: "strong",
        note: "Client-confirmed finding, corroborated by the follow-up operations call.",
      },
      {
        id: "context",
        label: "Customer context",
        level: "strong",
        note: "Established account — the plant, stakeholders and NetSuite estate are already mapped.",
      },
      {
        id: "experience",
        label: "Heizen delivery experience",
        level: "strong",
        note: "Delivered before at 85% overlap, and the pattern fits this account's NetSuite configuration.",
      },
    ],
  },
  "build-netsuite-cover": {
    confidenceNote:
      "The gap is documented and the account is known. It stays medium because Heizen's first support engagement of this kind would be proven inside this account.",
    deliveryNote: "Fastest time-to-value of the three — runs alongside delivery already in the account.",
    rankNote:
      "Ranked second for this account on effort and time-to-value: 3–4 weeks to stand up, it protects every NetSuite-dependent process already delivered here, and it deepens the account relationship.",
    signals: [
      {
        id: "research",
        label: "Research evidence",
        level: "strong",
        note: "Confirmed by a client-provided support document, with a dated deadline.",
      },
      {
        id: "context",
        label: "Customer context",
        level: "moderate",
        note: "The lapse lands inside an account Heizen already operates in — the support surface is known.",
      },
      {
        id: "experience",
        label: "Heizen delivery experience",
        level: "moderate",
        note: "No delivered support reference yet, but the team already works in this account's NetSuite configuration.",
      },
    ],
  },
  "build-lot": {
    confidenceNote:
      "Scope remains the swing factor — FSMA 204 SKU coverage decides whether this is an eight-week build or a multi-quarter programme for this account.",
    deliveryNote: "Largest effort of the three — scope hinges on FSMA 204 SKU coverage.",
    rankNote:
      "Ranked third for this account on effort and time-to-value: the heaviest build here, best sequenced after the quicker wins — the delivered reference keeps it firmly on the roadmap.",
    signals: [
      {
        id: "research",
        label: "Research evidence",
        level: "moderate",
        note: "Regulatory pressure is public-inference; Clio hasn't confirmed SKU scope.",
      },
      {
        id: "context",
        label: "Customer context",
        level: "moderate",
        note: "The account's Quality area is mapped, but FSMA scope was never pinned down in discovery.",
      },
      {
        id: "experience",
        label: "Heizen delivery experience",
        level: "strong",
        note: "Delivered lot genealogy and a recall drill for a packaged foods producer.",
      },
    ],
  },
};

const stageOverlays: Record<Stage, Record<string, BuildStageOverlay>> = {
  intro: introOverlays,
  discovery: {},
  expansion: expansionOverlays,
};

/** Rank order per stage. Intro and Discovery agree on the order — for
    different reasons, which each stage's rank notes spell out — while
    Account Expansion lifts the fast, low-effort support cover above the
    heavier lot-genealogy build. */
const stageOrder: Record<Stage, string[]> = {
  intro: ["build-capture", "build-lot", "build-netsuite-cover"],
  discovery: ["build-capture", "build-lot", "build-netsuite-cover"],
  expansion: ["build-capture", "build-netsuite-cover", "build-lot"],
};

/** The recommended builds as read at a given preparation stage — base data
    with that stage's overlay applied, in that stage's rank order. */
export function buildsForStage(stage: Stage): RecommendedBuild[] {
  return stageOrder[stage].map((id) => {
    const base = clioBuilds.find((b) => b.id === id)!;
    const o = stageOverlays[stage][id];
    if (!o) return base;
    return {
      ...base,
      confidence: o.confidence ?? base.confidence,
      confidenceNote: o.confidenceNote ?? base.confidenceNote,
      deliveryNote: o.deliveryNote ?? base.deliveryNote,
      rankNote: o.rankNote ?? base.rankNote,
      signals: o.signals ?? base.signals,
      why: {
        ...base.why,
        evidence: o.evidence ?? base.why.evidence,
        unknowns: o.unknowns ?? base.why.unknowns,
      },
    };
  });
}
