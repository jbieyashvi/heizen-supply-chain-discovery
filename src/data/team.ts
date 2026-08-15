/* ================================================================
   Workspace team — members (account management) + workload.
   Prototype data only; nothing here is persisted.
   ================================================================ */

/* Availability (workload tab) */
export type Availability = "available" | "in-call" | "research" | "away";

export const availabilityMeta: Record<
  Availability,
  { label: string; tone: "green" | "amber" | "info" | "neutral"; pulse?: boolean }
> = {
  available: { label: "Available", tone: "green" },
  "in-call": { label: "In client call", tone: "amber", pulse: true },
  research: { label: "Research running", tone: "info", pulse: true },
  away: { label: "Away", tone: "neutral" },
};

/* Account role (members tab) */
export type MemberRole = "admin" | "member" | "viewer";
export const ROLES: { id: MemberRole; label: string }[] = [
  { id: "admin", label: "Admin" },
  { id: "member", label: "Member" },
  { id: "viewer", label: "Viewer" },
];

/* Account status (members tab) */
export type AccountStatus = "active" | "invited" | "pending" | "deactivated";
export const accountStatusMeta: Record<
  AccountStatus,
  { label: string; tone: "green" | "amber" | "info" | "neutral" }
> = {
  active: { label: "Active", tone: "green" },
  invited: { label: "Invited", tone: "amber" },
  pending: { label: "Pending", tone: "info" },
  deactivated: { label: "Deactivated", tone: "neutral" },
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
  initials: string;
  title: string;
  email: string;
  joined: string; // "10 Aug 2026" or "—" for not-yet-joined
  role: MemberRole;
  accountStatus: AccountStatus;
  isYou?: boolean;
  // Workload
  availability: Availability;
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
    initials: "Y",
    title: "Discovery Consultant",
    email: "yashvi@heizen.work",
    joined: "2 Jun 2025",
    role: "admin",
    accountStatus: "active",
    isYou: true,
    availability: "in-call",
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
    ],
  },
  {
    id: "dev-menon",
    name: "Dev Menon",
    initials: "DM",
    title: "Discovery Consultant",
    email: "dev@heizen.work",
    joined: "14 Jul 2025",
    role: "member",
    accountStatus: "active",
    availability: "available",
    activeProjects: 2,
    upcomingCall: "Bajaj Auto · Thu, 20 Aug · 15:00",
    researchJobs: 0,
    projects: [
      { name: "Bajaj Auto", role: "Owner", state: "Research running" },
      { name: "Clio Snacks", role: "Contributor", state: "Needs attention" },
    ],
    calls: [{ client: "Bajaj Auto", when: "Thu, 20 Aug · 15:00" }],
    jobs: [],
    activity: [{ text: "Reviewed Bajaj Auto opportunities", when: "4h ago" }],
  },
  {
    id: "priya-nair",
    name: "Priya Nair",
    initials: "PN",
    title: "Senior Consultant",
    email: "priya@heizen.work",
    joined: "3 Mar 2025",
    role: "admin",
    accountStatus: "active",
    availability: "research",
    activeProjects: 4,
    upcomingCall: "JSW Steel · Mon, 24 Aug · 11:00",
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
    activity: [{ text: "Kicked off JSW Steel research", when: "1h ago" }],
  },
  {
    id: "aryan",
    name: "Aryan",
    initials: "A",
    title: "Consultant",
    email: "aryan@heizen.work",
    joined: "9 Aug 2025",
    role: "member",
    accountStatus: "active",
    availability: "available",
    activeProjects: 1,
    upcomingCall: null,
    researchJobs: 0,
    projects: [{ name: "Compass India", role: "Contributor", state: "Research running" }],
    calls: [],
    jobs: [],
    activity: [{ text: "Tidied Compass India sources", when: "Yesterday" }],
  },
  {
    id: "jeet-ghosh",
    name: "Jeet Ghosh",
    initials: "JG",
    title: "Product / Operations",
    email: "jeet@heizen.work",
    joined: "20 Jan 2025",
    role: "member",
    accountStatus: "active",
    availability: "research",
    activeProjects: 2,
    upcomingCall: null,
    researchJobs: 1,
    projects: [
      { name: "JSW Steel", role: "Operations", state: "Research running" },
      { name: "Vedanta Copper", role: "Operations", state: "Setup" },
    ],
    calls: [],
    jobs: [{ label: "JSW Steel — process extraction", stage: "Extracting workflow" }],
    activity: [{ text: "Checked extraction status across projects", when: "3h ago" }],
  },
  {
    id: "ananya-rao",
    name: "Ananya Rao",
    initials: "AR",
    title: "Discovery Consultant",
    email: "ananya@heizen.work",
    joined: "5 May 2025",
    role: "member",
    accountStatus: "active",
    availability: "available",
    activeProjects: 2,
    upcomingCall: "Compass India · Wed, 19 Aug · 12:30",
    researchJobs: 0,
    projects: [
      { name: "Compass India", role: "Owner", state: "Research running" },
      { name: "Bajaj Auto", role: "Contributor", state: "Research running" },
    ],
    calls: [{ client: "Compass India", when: "Wed, 19 Aug · 12:30" }],
    jobs: [],
    activity: [{ text: "Drafted Compass India discovery questions", when: "5h ago" }],
  },
  {
    id: "kabir-shah",
    name: "Kabir Shah",
    initials: "KS",
    title: "Consultant",
    email: "kabir@heizen.work",
    joined: "18 Jun 2025",
    role: "member",
    accountStatus: "active",
    availability: "in-call",
    activeProjects: 2,
    upcomingCall: "Vedanta Copper · Thu, 20 Aug · 09:30",
    researchJobs: 0,
    projects: [
      { name: "Vedanta Copper", role: "Owner", state: "Setup" },
      { name: "JSW Steel", role: "Contributor", state: "Research running" },
    ],
    calls: [{ client: "Vedanta Copper", when: "Thu, 20 Aug · 09:30" }],
    jobs: [],
    activity: [{ text: "Set up Vedanta Copper workspace", when: "Yesterday" }],
  },
  {
    id: "meera-pillai",
    name: "Meera Pillai",
    initials: "MP",
    title: "Senior Consultant",
    email: "meera@heizen.work",
    joined: "11 Feb 2025",
    role: "admin",
    accountStatus: "active",
    availability: "available",
    activeProjects: 3,
    upcomingCall: null,
    researchJobs: 1,
    projects: [
      { name: "Bajaj Auto", role: "Owner", state: "Research running" },
      { name: "JSW Steel", role: "Reviewer", state: "Research running" },
      { name: "Compass India", role: "Reviewer", state: "Research running" },
    ],
    calls: [],
    jobs: [{ label: "Bajaj Auto — company research", stage: "Checking evidence" }],
    activity: [{ text: "Reviewed three project briefs", when: "6h ago" }],
  },
  {
    id: "rohan-verma",
    name: "Rohan Verma",
    initials: "RV",
    title: "Consultant",
    email: "rohan@heizen.work",
    joined: "—",
    role: "member",
    accountStatus: "invited",
    availability: "away",
    activeProjects: 0,
    upcomingCall: null,
    researchJobs: 0,
    projects: [],
    calls: [],
    jobs: [],
    activity: [{ text: "Invitation sent", when: "2 days ago" }],
  },
  {
    id: "sara-khan",
    name: "Sara Khan",
    initials: "SK",
    title: "Research Analyst",
    email: "sara@heizen.work",
    joined: "28 Apr 2025",
    role: "viewer",
    accountStatus: "active",
    availability: "research",
    activeProjects: 2,
    upcomingCall: null,
    researchJobs: 1,
    projects: [
      { name: "JSW Steel", role: "Analyst", state: "Research running" },
      { name: "Compass India", role: "Analyst", state: "Research running" },
    ],
    calls: [],
    jobs: [{ label: "Compass India — market context", stage: "Collecting sources" }],
    activity: [{ text: "Added market benchmarks to Compass India", when: "Yesterday" }],
  },
  {
    id: "ishaan-gupta",
    name: "Ishaan Gupta",
    initials: "IG",
    title: "Consultant",
    email: "ishaan@heizen.work",
    joined: "—",
    role: "member",
    accountStatus: "invited",
    availability: "away",
    activeProjects: 0,
    upcomingCall: null,
    researchJobs: 0,
    projects: [],
    calls: [],
    jobs: [],
    activity: [{ text: "Invitation sent", when: "Yesterday" }],
  },
  {
    id: "nisha-reddy",
    name: "Nisha Reddy",
    initials: "NR",
    title: "Operations",
    email: "nisha@heizen.work",
    joined: "7 Dec 2024",
    role: "member",
    accountStatus: "deactivated",
    availability: "away",
    activeProjects: 0,
    upcomingCall: null,
    researchJobs: 0,
    projects: [],
    calls: [],
    jobs: [],
    activity: [{ text: "Account deactivated", when: "2 weeks ago" }],
  },
  {
    id: "arjun-das",
    name: "Arjun Das",
    initials: "AD",
    title: "Discovery Consultant",
    email: "arjun@heizen.work",
    joined: "16 Sep 2025",
    role: "member",
    accountStatus: "active",
    availability: "available",
    activeProjects: 1,
    upcomingCall: "Bajaj Auto · Fri, 21 Aug · 16:00",
    researchJobs: 0,
    projects: [{ name: "Bajaj Auto", role: "Contributor", state: "Research running" }],
    calls: [{ client: "Bajaj Auto", when: "Fri, 21 Aug · 16:00" }],
    jobs: [],
    activity: [{ text: "Prepped Bajaj Auto call agenda", when: "3h ago" }],
  },
  {
    id: "tara-sen",
    name: "Tara Sen",
    initials: "TS",
    title: "Consultant",
    email: "tara@heizen.work",
    joined: "—",
    role: "viewer",
    accountStatus: "pending",
    availability: "away",
    activeProjects: 0,
    upcomingCall: null,
    researchJobs: 0,
    projects: [],
    calls: [],
    jobs: [],
    activity: [{ text: "Accepted invite — finishing setup", when: "3h ago" }],
  },
  {
    id: "vikram-iyer",
    name: "Vikram Iyer",
    initials: "VI",
    title: "Senior Consultant",
    email: "vikram@heizen.work",
    joined: "22 Nov 2024",
    role: "admin",
    accountStatus: "active",
    availability: "available",
    activeProjects: 3,
    upcomingCall: null,
    researchJobs: 0,
    projects: [
      { name: "JSW Steel", role: "Reviewer", state: "Research running" },
      { name: "Vedanta Copper", role: "Reviewer", state: "Setup" },
      { name: "Clio Snacks", role: "Reviewer", state: "Needs attention" },
    ],
    calls: [],
    jobs: [],
    activity: [{ text: "Approved a research refresh", when: "Yesterday" }],
  },
  {
    id: "zoya-ahmed",
    name: "Zoya Ahmed",
    initials: "ZA",
    title: "Research Analyst",
    email: "zoya@heizen.work",
    joined: "—",
    role: "viewer",
    accountStatus: "invited",
    availability: "away",
    activeProjects: 0,
    upcomingCall: null,
    researchJobs: 0,
    projects: [],
    calls: [],
    jobs: [],
    activity: [{ text: "Invitation sent", when: "4 days ago" }],
  },
];
