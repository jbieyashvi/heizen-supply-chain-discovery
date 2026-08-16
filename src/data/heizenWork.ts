/* ================================================================
   Similar Heizen work (shared by Overview + Research)

   Every project carries an explicit PROVENANCE so we never dress up
   discussed-only or research-based similarity as delivered proof:

     delivered        — Heizen actually built and shipped this
     discussed        — only talked about with a prospect/client
     in-discovery     — currently being scoped, not yet delivered
     research-based   — similarity inferred from research, no engagement

   Only "delivered" work is safe to present as social proof on a call.
   A similarity % is the mean of process, technology and business
   overlap — shown with that breakdown so it's never a black box.
   ================================================================ */

import type { FocusDomain } from "./focus";

export type Provenance = "delivered" | "discussed" | "in-discovery" | "research-based";

export const provenanceMeta: Record<
  Provenance,
  { label: string; tone: "green" | "amber" | "info" | "neutral"; safe: boolean }
> = {
  delivered: { label: "Delivered by Heizen", tone: "green", safe: true },
  discussed: { label: "Discussed only", tone: "amber", safe: false },
  "in-discovery": { label: "Currently in discovery", tone: "info", safe: false },
  "research-based": { label: "Research-based similarity", tone: "neutral", safe: false },
};

export interface OverlapBreakdown {
  /** 0–100 each. */
  process: number;
  technology: number;
  business: number;
}

export type SimilarityLevel = "high" | "medium" | "some";

export interface HeizenProject {
  id: string;
  /** Anonymised client label. */
  name: string;
  industry: string;
  problem: string;
  /** What Heizen actually delivered (or, for non-delivered, the true status). */
  delivered: string;
  whyRelevant: string;
  evidence: string;
  provenance: Provenance;
  overlap: OverlapBreakdown;
  domains: FocusDomain[];
  drawer: {
    process: string;
    technology: string;
    business: string;
    differences: string;
    /** Exactly what is safe to say on the call for this provenance. */
    safeToSay: string;
  };
}

/** Overall similarity = mean of the three overlap dimensions. */
export function overallSimilarity(o: OverlapBreakdown): number {
  return Math.round((o.process + o.technology + o.business) / 3);
}

export function similarityLevel(pct: number): SimilarityLevel {
  return pct >= 75 ? "high" : pct >= 55 ? "medium" : "some";
}

export const similarityLevelMeta: Record<
  SimilarityLevel,
  { label: string; tone: "green" | "amber" | "neutral" }
> = {
  high: { label: "High similarity", tone: "green" },
  medium: { label: "Medium similarity", tone: "amber" },
  some: { label: "Some overlap", tone: "neutral" },
};

export const SIMILARITY_EXPLAINER =
  "Similarity is the average of three overlaps — process, technology and business context — scored against Clio Snacks. It's a guide to relevance, not a promise of fit.";

export const clioSimilarWork: HeizenProject[] = [
  {
    id: "hw-inventory",
    name: "Mid-market F&B manufacturer",
    industry: "Food & beverage manufacturing",
    problem: "Paper-based production completion created a ~24-hour inventory lag.",
    delivered:
      "Source-side capture on the line feeding NetSuite, removing the next-morning keying step.",
    whyRelevant:
      "Almost the same paper-to-ERP gap Clio described on the discovery call.",
    evidence: "Heizen delivery history · closed engagement",
    provenance: "delivered",
    overlap: { process: 90, technology: 80, business: 85 },
    domains: ["manufacturing", "supply-chain"],
    drawer: {
      process:
        "Near-identical: shift-end paper completion, next-morning data entry, inventory posting lag.",
      technology:
        "NetSuite as system of record with floor capture bolted on — the same stack Clio runs.",
      business:
        "Comparable scale and peak-season availability pressure during a volume ramp.",
      differences:
        "Their lines were less automated than Clio's; Clio's PLC data may open a faster path.",
      safeToSay:
        "\"We've closed this exact paper-to-ERP inventory lag for another F&B manufacturer on NetSuite.\" — delivered, safe to reference.",
    },
  },
  {
    id: "hw-traceability",
    name: "Packaged foods producer",
    industry: "Packaged foods",
    problem: "Lot genealogy was fragmented across systems, slowing recalls.",
    delivered:
      "A single lot-lineage view and a rehearsed recall workflow spanning quality, inventory and shipping.",
    whyRelevant:
      "Matches Clio's FSMA 204 traceability exposure and stitched-together lot data.",
    evidence: "Heizen delivery history · closed engagement",
    provenance: "delivered",
    overlap: { process: 85, technology: 70, business: 80 },
    domains: ["quality", "supply-chain"],
    drawer: {
      process:
        "Same recall-readiness workflow: trace a finished lot from quality sign-off to released inventory.",
      technology:
        "Consolidated lineage across an ERP and a compliance system — comparable to NetSuite + TraceGains.",
      business:
        "Regulated refrigerated/packaged mix with retailer and audit pressure, like Clio.",
      differences:
        "Their lot data already lived in a system; Clio's may be in a spreadsheet — confirm before scoping.",
      safeToSay:
        "\"We've built a single lot-lineage view and rehearsed recalls for a packaged-foods producer.\" — delivered, safe to reference.",
    },
  },
  {
    id: "hw-demand",
    name: "Beverage manufacturer",
    industry: "Beverage manufacturing",
    problem: "Planning worked from stale production state, driving expedites.",
    delivered:
      "Aligned demand planning with real-time production readiness, cutting short-ships.",
    whyRelevant:
      "Relevant if Clio's Netstock planning is running on day-stale availability.",
    evidence: "Heizen delivery history · closed engagement",
    provenance: "delivered",
    overlap: { process: 70, technology: 65, business: 60 },
    domains: ["supply-chain", "manufacturing"],
    drawer: {
      process:
        "Demand-to-production coordination once inventory reflected the true, current state.",
      technology:
        "Planning tool integrated with the ERP — analogous to Netstock + NetSuite at Clio.",
      business:
        "Similar make-to-stock rhythm, though a different sub-sector of F&B.",
      differences:
        "Beverage seasonality differs from refrigerated snacking; the planning cadence may not map 1:1.",
      safeToSay:
        "\"We've aligned planning with live production for a beverage manufacturer.\" — delivered, safe to reference.",
    },
  },
  {
    id: "hw-netsuite-support",
    name: "Frozen foods manufacturer",
    industry: "Frozen foods",
    problem: "Losing NetSuite ACS support with no internal owner for changes.",
    delivered:
      "Scoping a managed operational-support model — engagement is currently in discovery, not delivered.",
    whyRelevant:
      "Directly mirrors Clio's NetSuite ACS lapse in October.",
    evidence: "Active discovery · not yet delivered",
    provenance: "in-discovery",
    overlap: { process: 55, technology: 80, business: 60 },
    domains: ["tech-ai"],
    drawer: {
      process:
        "Support-continuity and change-management process — still being defined, not run in production.",
      technology:
        "Same NetSuite ACS gap and support model under discussion.",
      business:
        "Comparable mid-market manufacturer facing a support deadline.",
      differences:
        "Nothing has shipped — this is a live discovery, so outcomes are unproven.",
      safeToSay:
        "Do NOT present as delivered. You may say \"we're actively scoping this exact NetSuite support gap with a similar manufacturer.\"",
    },
  },
  {
    id: "hw-procurement",
    name: "CPG distributor",
    industry: "Consumer packaged goods distribution",
    problem: "Inconsistent supplier and item master data.",
    delivered:
      "Only discussed in a prior conversation — no engagement or delivery took place.",
    whyRelevant:
      "Loosely related discipline; low overlap with Clio's operational pains.",
    evidence: "Prospect conversation · discussed only",
    provenance: "discussed",
    overlap: { process: 45, technology: 40, business: 55 },
    domains: ["procurement"],
    drawer: {
      process:
        "Master-data governance — a different workflow from Clio's production/inventory focus.",
      technology:
        "Different stack; limited overlap with NetSuite operations at Clio.",
      business:
        "Distribution rather than manufacturing — adjacent, not the same shape.",
      differences:
        "Never engaged beyond a conversation. Treat as a talking point, not proof.",
      safeToSay:
        "Do NOT present as delivered or as a case study. At most: \"master-data quality is a theme we've talked through with distributors.\"",
    },
  },
  {
    id: "hw-coldchain",
    name: "Cold-chain benchmark",
    industry: "Cold-chain logistics",
    problem: "Temperature-integrity visibility across the cold chain.",
    delivered:
      "No Heizen engagement — similarity is inferred from market research only.",
    whyRelevant:
      "Background context for refrigerated operations; not a client reference.",
    evidence: "Market research · no engagement",
    provenance: "research-based",
    overlap: { process: 50, technology: 35, business: 45 },
    domains: ["supply-chain"],
    drawer: {
      process:
        "Cold-chain monitoring overlaps loosely with refrigerated production, not directly.",
      technology:
        "Sensor/IoT-heavy stack unlike Clio's NetSuite-centred operations.",
      business:
        "Same refrigerated context, but logistics rather than in-plant manufacturing.",
      differences:
        "Purely research-derived — no delivery, no client. Use only as background reading.",
      safeToSay:
        "Do NOT present as Heizen work at all. This is research context, not experience.",
    },
  },
];

/** Introductory-call view: only the top delivered, safe-to-mention work. */
export function safeDeliveredWork(limit = 2): HeizenProject[] {
  return clioSimilarWork
    .filter((p) => provenanceMeta[p.provenance].safe)
    .sort((a, b) => overallSimilarity(b.overlap) - overallSimilarity(a.overlap))
    .slice(0, limit);
}
