/* ================================================================
   Workspace team — sample members and their current workload.
   Prototype data only; nothing here is persisted.
   ================================================================ */

export type MemberStatus = "available" | "in-call" | "research" | "away";

export const statusMeta: Record<
  MemberStatus,
  { label: string; tone: "green" | "amber" | "info" | "neutral"; pulse?: boolean }
> = {
  available: { label: "Available", tone: "green" },
  "in-call": { label: "In client call", tone: "amber", pulse: true },
  research: { label: "Research running", tone: "info", pulse: true },
  away: { label: "Away", tone: "neutral" },
};

export interface MemberProject {
  name: string;
  role: string;
  state: string;
}
export interface MemberCall {
  client: string;
  when: string;
}
export interface MemberJob {
  label: string;
  stage: string;
}
export interface MemberActivity {
  text: string;
  when: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  status: MemberStatus;
  activeProjects: number;
  upcomingCall: string | null;
  researchJobs: number;
  projects: MemberProject[];
  calls: MemberCall[];
  jobs: MemberJob[];
  activity: MemberActivity[];
}

export const teamMembers: TeamMember[] = [
  {
    id: "yashvi",
    name: "Yashvi",
    role: "Discovery Consultant",
    initials: "Y",
    status: "in-call",
    activeProjects: 3,
    upcomingCall: "Clio Snacks · Tue, 18 Aug · 10:30",
    researchJobs: 1,
    projects: [
      { name: "Clio Snacks", role: "Owner", state: "Needs attention" },
      { name: "Compass India", role: "Owner", state: "Research running" },
      { name: "Vedanta Copper", role: "Contributor", state: "Setup" },
    ],
    calls: [
      { client: "Clio Snacks", when: "Tue, 18 Aug · 10:30" },
      { client: "Compass India", when: "Fri, 21 Aug · 14:00" },
    ],
    jobs: [{ label: "Compass India — company research", stage: "Mapping systems" }],
    activity: [
      { text: "Processed the Clio follow-up transcript", when: "2h ago" },
      { text: "Shortlisted 8 discovery questions for Clio Snacks", when: "Yesterday" },
      { text: "Created Compass India", when: "2 days ago" },
    ],
  },
  {
    id: "dev-menon",
    name: "Dev Menon",
    role: "Discovery Consultant",
    initials: "DM",
    status: "available",
    activeProjects: 2,
    upcomingCall: "Bajaj Auto · Thu, 20 Aug · 15:00",
    researchJobs: 0,
    projects: [
      { name: "Bajaj Auto", role: "Owner", state: "Research running" },
      { name: "Clio Snacks", role: "Contributor", state: "Needs attention" },
    ],
    calls: [{ client: "Bajaj Auto", when: "Thu, 20 Aug · 15:00" }],
    jobs: [],
    activity: [
      { text: "Reviewed Bajaj Auto opportunities", when: "4h ago" },
      { text: "Added a vendor document to Clio Snacks", when: "Yesterday" },
    ],
  },
  {
    id: "priya-nair",
    name: "Priya Nair",
    role: "Senior Consultant",
    initials: "PN",
    status: "research",
    activeProjects: 4,
    upcomingCall: "JSW Steel · next week",
    researchJobs: 2,
    projects: [
      { name: "JSW Steel", role: "Owner", state: "Research running" },
      { name: "Bajaj Auto", role: "Reviewer", state: "Research running" },
      { name: "Clio Snacks", role: "Reviewer", state: "Needs attention" },
      { name: "Vedanta Copper", role: "Owner", state: "Setup" },
    ],
    calls: [{ client: "JSW Steel", when: "Mon, 24 Aug · 11:00" }],
    jobs: [
      { label: "JSW Steel — company research", stage: "Analysing context" },
      { label: "Vedanta Copper — company research", stage: "Queued" },
    ],
    activity: [
      { text: "Kicked off JSW Steel research", when: "1h ago" },
      { text: "Reviewed Bajaj Auto discovery questions", when: "Yesterday" },
      { text: "Set up Vedanta Copper", when: "3 days ago" },
    ],
  },
  {
    id: "aryan",
    name: "Aryan",
    role: "Consultant",
    initials: "A",
    status: "available",
    activeProjects: 1,
    upcomingCall: null,
    researchJobs: 0,
    projects: [{ name: "Compass India", role: "Contributor", state: "Research running" }],
    calls: [],
    jobs: [],
    activity: [
      { text: "Tidied Compass India sources", when: "Yesterday" },
      { text: "Joined the workspace", when: "1 week ago" },
    ],
  },
  {
    id: "jeet-ghosh",
    name: "Jeet Ghosh",
    role: "Product / Operations",
    initials: "JG",
    status: "research",
    activeProjects: 2,
    upcomingCall: null,
    researchJobs: 1,
    projects: [
      { name: "JSW Steel", role: "Operations", state: "Research running" },
      { name: "Vedanta Copper", role: "Operations", state: "Setup" },
    ],
    calls: [],
    jobs: [{ label: "JSW Steel — process extraction", stage: "Extracting workflow" }],
    activity: [
      { text: "Checked extraction status across projects", when: "3h ago" },
      { text: "Updated the workspace research queue", when: "2 days ago" },
    ],
  },
];
