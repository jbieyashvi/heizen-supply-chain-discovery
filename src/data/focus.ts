/* ================================================================
   Project "Focus" model

   A focus lets the consultant tilt the whole project toward a
   stakeholder, a domain and/or a call stage. It RE-RANKS content —
   it never deletes or permanently hides anything. Scoring here is
   shared by the Research signals, the Overview hypotheses, the
   discovery questions and the related-Heizen-work lists.
   ================================================================ */

export type FocusDomain =
  | "manufacturing"
  | "supply-chain"
  | "tech-ai"
  | "quality"
  | "procurement";

export type FocusStage = "intro" | "discovery" | "expansion";

export interface FocusStakeholder {
  id: string;
  name: string;
  role: string;
  /** Domains this stakeholder cares about most. */
  domains: FocusDomain[];
}

export const FOCUS_DOMAINS: { id: FocusDomain; label: string }[] = [
  { id: "manufacturing", label: "Manufacturing" },
  { id: "supply-chain", label: "Supply Chain" },
  { id: "tech-ai", label: "Technology & AI" },
  { id: "quality", label: "Quality & Traceability" },
  { id: "procurement", label: "Procurement" },
];

export const FOCUS_STAKEHOLDERS: FocusStakeholder[] = [
  {
    id: "meera",
    name: "Meera Iyer",
    role: "VP Operations",
    domains: ["manufacturing", "supply-chain", "quality"],
  },
  {
    id: "rafael",
    name: "Rafael Rodas",
    role: "COO",
    domains: ["manufacturing", "quality", "tech-ai"],
  },
  {
    id: "thompson",
    name: "John Thompson",
    role: "CFO",
    domains: ["tech-ai"],
  },
  {
    id: "mcguckin",
    name: "John McGuckin",
    role: "CEO",
    domains: ["manufacturing"],
  },
];

export const FOCUS_STAGES: { id: FocusStage; label: string }[] = [
  { id: "intro", label: "Introductory Call" },
  { id: "discovery", label: "Discovery Call" },
  { id: "expansion", label: "Account Expansion" },
];

export interface Focus {
  stakeholderId?: string;
  domain?: FocusDomain;
  stage?: FocusStage;
}

export function stakeholderById(id?: string) {
  return FOCUS_STAKEHOLDERS.find((s) => s.id === id);
}
export function domainLabel(d: FocusDomain) {
  return FOCUS_DOMAINS.find((x) => x.id === d)?.label ?? d;
}
export function stageLabel(s: FocusStage) {
  return FOCUS_STAGES.find((x) => x.id === s)?.label ?? s;
}

export function isActiveFocus(f: Focus | null | undefined): f is Focus {
  return !!f && (!!f.domain || !!f.stakeholderId || !!f.stage);
}

/** The union of domains implied by a focus (explicit + stakeholder). */
export function focusDomains(f: Focus): FocusDomain[] {
  const set = new Set<FocusDomain>();
  if (f.domain) set.add(f.domain);
  const s = stakeholderById(f.stakeholderId);
  if (s) s.domains.forEach((d) => set.add(d));
  return [...set];
}

/** Short human summary for the focus chip. */
export function focusSummary(f: Focus): string {
  const parts: string[] = [];
  const s = stakeholderById(f.stakeholderId);
  if (s) parts.push(s.name);
  if (f.domain) parts.push(domainLabel(f.domain));
  if (f.stage) parts.push(stageLabel(f.stage));
  return parts.join(" · ");
}

/** Score item domains against a focus. Higher = more relevant; 0 = no focus. */
export function scoreDomains(itemDomains: FocusDomain[], f: Focus | null | undefined): number {
  if (!isActiveFocus(f)) return 0;
  const pref = focusDomains(f);
  if (pref.length === 0) return 0;
  let score = 0;
  for (const d of itemDomains) {
    if (f.domain && d === f.domain) score += 2; // explicit domain weighs most
    else if (pref.includes(d)) score += 1; // stakeholder-preferred
  }
  return score;
}

/* ---- Domain tags for existing content (by id) ------------------ */

/** Research first-call signals (tech initiatives + stakeholder signals). */
export const SIGNAL_DOMAINS: Record<string, FocusDomain[]> = {
  "ti-acs": ["tech-ai"],
  "ti-capacity": ["manufacturing"],
  "ti-analytics": ["tech-ai"],
  "ss-inventory-lag": ["manufacturing"],
  "ss-traceability": ["quality", "supply-chain"],
  "ss-planning-stale": ["supply-chain"],
  "ss-ot-data": ["manufacturing", "tech-ai"],
};

/** Overview first-call hypotheses. */
export const HYPOTHESIS_DOMAINS: Record<string, FocusDomain[]> = {
  "hyp-inventory-lag": ["manufacturing"],
  "hyp-traceability": ["quality", "supply-chain"],
  "hyp-planning-stale": ["supply-chain"],
  "hyp-support-gap": ["tech-ai"],
  "hyp-ot-data": ["manufacturing", "tech-ai"],
};

/** Discovery question area → focus domain. */
export const AREA_DOMAIN: Record<string, FocusDomain> = {
  production: "manufacturing",
  quality: "quality",
  "data-systems": "tech-ai",
  demand: "supply-chain",
  procurement: "procurement",
};

/** Similar Heizen work (research.similar) → domains. */
export const SIMILAR_DOMAINS: Record<string, FocusDomain[]> = {
  "sim-1": ["manufacturing", "supply-chain"],
  "sim-2": ["quality", "supply-chain"],
  "sim-3": ["supply-chain", "manufacturing"],
  "sim-4": ["procurement"],
};
