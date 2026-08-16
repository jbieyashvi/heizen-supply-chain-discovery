import { useMemo, useRef, useState } from "react";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Users,
  Layers,
  Eye,
  Send,
  UserX,
  UserCheck,
  Briefcase,
  CalendarClock,
  FlaskConical,
  Activity,
  FolderKanban,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { Segmented } from "../components/Segmented";
import { SidePanel } from "../components/SidePanel";
import { Modal } from "../components/Modal";
import { useToast } from "../components/Toast";
import { useClickOutside } from "../hooks/useClickOutside";
import {
  teamMembers,
  ROLES,
  availabilityMeta,
  accountStatusMeta,
  type TeamMember,
  type MemberRole,
  type AccountStatus,
} from "../data/team";

type Tab = "members" | "workload";

export function TeamPage() {
  const { notify } = useToast();
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<TeamMember[]>(() =>
    teamMembers.map((m) => ({ ...m }))
  );
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | MemberRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AccountStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const proto = (label: string) =>
    notify({ title: label, body: "Prototype action — no changes were made.", tone: "info" });

  const setRole = (id: string, role: MemberRole) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    notify({ title: "Role updated", body: "Prototype — this session only.", tone: "info" });
  };
  const setStatus = (id: string, accountStatus: AccountStatus, title: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, accountStatus } : m)));
    notify({ title, body: "Prototype — this session only.", tone: "info" });
  };

  const q = query.trim().toLowerCase();
  const matchesQuery = (m: TeamMember) =>
    !q || `${m.name} ${m.title} ${m.email}`.toLowerCase().includes(q);

  const membersVisible = useMemo(
    () =>
      members.filter(
        (m) =>
          matchesQuery(m) &&
          (roleFilter === "all" || m.role === roleFilter) &&
          (statusFilter === "all" || m.accountStatus === statusFilter)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, q, roleFilter, statusFilter]
  );
  const workloadVisible = useMemo(
    () => members.filter(matchesQuery),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, q]
  );

  const active = members.find((m) => m.id === openId) ?? null;
  const seq = useRef(0);

  const invite = (email: string, role: MemberRole) => {
    const clean = email.trim();
    if (!clean) return;
    const name = clean.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const m: TeamMember = {
      id: `invite-${++seq.current}`,
      name,
      initials,
      title: "Invited member",
      email: clean,
      joined: "—",
      role,
      accountStatus: "invited",
      availability: "away",
      activeProjects: 0,
      upcomingCall: null,
      researchJobs: 0,
      projects: [],
      calls: [],
      jobs: [],
      activity: [{ text: "Invitation sent", when: "just now" }],
    };
    setMembers((prev) => [m, ...prev]);
    setInviteOpen(false);
    notify({ title: "Invitation sent", body: `${clean} was invited as ${role}. Prototype only.` });
  };

  return (
    <div className="page tm-page">
      <PageHeader
        crumbs={[{ label: "Workspace" }, { label: "Team" }]}
        title={<h1 className="page-title">Team Management</h1>}
        subtitle="Manage workspace members, roles and invitations."
        actions={
          <button className="btn btn-primary" onClick={() => setInviteOpen(true)}>
            <UserPlus /> Invite member
          </button>
        }
      />

      <div className="tm-tabs">
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          ariaLabel="Team view"
          options={[
            { id: "members", label: "Members", icon: <Users aria-hidden /> },
            { id: "workload", label: "Workload", icon: <Layers aria-hidden /> },
          ]}
        />
      </div>

      {tab === "members" ? (
        <>
          <div className="tm-toolbar">
            <div className="tm-search">
              <Search aria-hidden />
              <input
                type="search"
                placeholder="Search members…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search members"
              />
            </div>
            <div className="tm-filters">
              <label className="tm-select">
                <span className="sr-only">Filter by role</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as "all" | MemberRole)}
                >
                  <option value="all">All roles</option>
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="tm-select">
                <span className="sr-only">Filter by status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | AccountStatus)}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="pending">Pending</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </label>
            </div>
          </div>

          <div className="tm-table tm-table--members" role="table" aria-label="Members">
            <div className="tm-head" role="row">
              <span role="columnheader">Member</span>
              <span role="columnheader" className="tm-email-h">Email</span>
              <span role="columnheader" className="tm-joined-h">Joined</span>
              <span role="columnheader">Role</span>
              <span role="columnheader">Status</span>
              <span role="columnheader" className="tm-actions-h">
                Actions
              </span>
            </div>
            {membersVisible.length === 0 ? (
              <div className="tm-empty">
                <p className="muted">No members match your search or filters.</p>
              </div>
            ) : (
              membersVisible.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  onOpen={() => setOpenId(m.id)}
                  onRole={(r) => setRole(m.id, r)}
                  onResend={() => proto("Invitation resent")}
                  onDeactivate={() =>
                    setStatus(m.id, "deactivated", "Member deactivated")
                  }
                  onReactivate={() => setStatus(m.id, "active", "Member reactivated")}
                />
              ))
            )}
          </div>
          <p className="tm-count">
            {membersVisible.length} of {members.length} members
          </p>
        </>
      ) : (
        <>
          <div className="tm-toolbar">
            <div className="tm-search">
              <Search aria-hidden />
              <input
                type="search"
                placeholder="Search members…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search members"
              />
            </div>
          </div>

          <div className="tm-table tm-table--workload" role="table" aria-label="Workload">
            <div className="tm-head" role="row">
              <span role="columnheader">Member</span>
              <span role="columnheader" className="tm-wl-proj-h">Active projects</span>
              <span role="columnheader" className="tm-wl-call-h">Upcoming call</span>
              <span role="columnheader" className="tm-wl-jobs-h">Research jobs</span>
              <span role="columnheader">Availability</span>
            </div>
            {workloadVisible.map((m) => (
              <WorkloadRow key={m.id} member={m} onOpen={() => setOpenId(m.id)} />
            ))}
          </div>
          <p className="tm-count">{workloadVisible.length} members</p>
        </>
      )}

      <MemberDetail member={active} onClose={() => setOpenId(null)} />
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={invite} />
    </div>
  );
}

/* ---------- Avatar ---------- */
function Avatar({ member }: { member: TeamMember }) {
  return <span className="tm-avatar" aria-hidden>{member.initials}</span>;
}

/* ---------- Row menu ---------- */
function RowMenu({
  member: m,
  onOpen,
  onResend,
  onDeactivate,
  onReactivate,
}: {
  member: TeamMember;
  onOpen: () => void;
  onResend: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  const pending = m.accountStatus === "invited" || m.accountStatus === "pending";
  return (
    <div className="menu tm-menu" ref={ref}>
      <button
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${m.name}`}
      >
        <MoreHorizontal />
      </button>
      {open && (
        <div className="menu__pop" role="menu">
          <button role="menuitem" onClick={() => { setOpen(false); onOpen(); }}>
            <Eye /> View profile
          </button>
          {pending && (
            <button role="menuitem" onClick={() => { setOpen(false); onResend(); }}>
              <Send /> Resend invite
            </button>
          )}
          <div className="menu__sep" />
          {m.accountStatus === "deactivated" ? (
            <button role="menuitem" onClick={() => { setOpen(false); onReactivate(); }}>
              <UserCheck /> Reactivate
            </button>
          ) : (
            <button role="menuitem" onClick={() => { setOpen(false); onDeactivate(); }}>
              <UserX /> Deactivate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Members row ---------- */
function MemberRow({
  member: m,
  onOpen,
  onRole,
  onResend,
  onDeactivate,
  onReactivate,
}: {
  member: TeamMember;
  onOpen: () => void;
  onRole: (r: MemberRole) => void;
  onResend: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}) {
  const st = accountStatusMeta[m.accountStatus];
  const disabled = m.accountStatus === "deactivated";
  return (
    <div className={`tm-row${disabled ? " is-dim" : ""}`} role="row">
      <div className="tm-cell tm-member">
        <Avatar member={m} />
        <div className="tm-member__id">
          <span className="tm-member__name">
            <button className="tm-namebtn" onClick={onOpen}>
              {m.name}
            </button>
            {m.isYou && <span className="tm-you">You</span>}
          </span>
          <span className="tm-member__title">{m.title}</span>
        </div>
      </div>
      <div className="tm-cell tm-email">{m.email}</div>
      <div className="tm-cell tm-muted tm-joined">{m.joined}</div>
      <div className="tm-cell">
        <label className="tm-role">
          <span className="sr-only">Role for {m.name}</span>
          <select
            value={m.role}
            disabled={disabled}
            onChange={(e) => onRole(e.target.value as MemberRole)}
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="tm-cell">
        <Badge tone={st.tone} dot>
          {st.label}
        </Badge>
      </div>
      <div className="tm-cell tm-actions">
        <RowMenu
          member={m}
          onOpen={onOpen}
          onResend={onResend}
          onDeactivate={onDeactivate}
          onReactivate={onReactivate}
        />
      </div>
    </div>
  );
}

/* ---------- Workload row ---------- */
function WorkloadRow({ member: m, onOpen }: { member: TeamMember; onOpen: () => void }) {
  const a = availabilityMeta[m.availability];
  return (
    <div className="tm-row tm-row--click" role="row" onClick={onOpen}>
      <div className="tm-cell tm-member">
        <Avatar member={m} />
        <div className="tm-member__id">
          <span className="tm-member__name">
            <button className="tm-namebtn" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
              {m.name}
            </button>
            {m.isYou && <span className="tm-you">You</span>}
          </span>
          <span className="tm-member__title">{m.title}</span>
        </div>
      </div>
      <div className="tm-cell tm-wl tm-wl--projects">
        <Briefcase aria-hidden /> {m.activeProjects}
      </div>
      <div className="tm-cell tm-wl tm-wl--call">
        {m.upcomingCall ? (
          <>
            <CalendarClock aria-hidden /> {m.upcomingCall}
          </>
        ) : (
          <span className="tm-muted">No call scheduled</span>
        )}
      </div>
      <div className="tm-cell tm-wl tm-wl--jobs">
        <FlaskConical aria-hidden /> {m.researchJobs}
      </div>
      <div className="tm-cell">
        <Badge tone={a.tone} dot pulse={a.pulse}>
          {a.label}
        </Badge>
      </div>
    </div>
  );
}

/* ---------- Invite modal ---------- */
function InviteModal({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: MemberRole) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite member"
      subtitle="Prototype — invitations are simulated, nothing is sent"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!email.trim()}
            onClick={() => onInvite(email, role)}
          >
            <Send /> Send invite
          </button>
        </>
      }
    >
      <div className="field">
        <label className="field__label" htmlFor="inv-email">
          Work email
        </label>
        <input
          id="inv-email"
          className="field-control"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label className="field__label" htmlFor="inv-role">
          Role
        </label>
        <div className="select-wrap">
          <select
            id="inv-role"
            className="field-control"
            value={role}
            onChange={(e) => setRole(e.target.value as MemberRole)}
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Profile / workload drawer ---------- */
function MemberDetail({
  member: m,
  onClose,
}: {
  member: TeamMember | null;
  onClose: () => void;
}) {
  return (
    <SidePanel
      open={Boolean(m)}
      onClose={onClose}
      title={m?.name ?? "Team member"}
      subtitle={m?.title ?? "Team member"}
    >
      {m && (
        <div className="team-d" key={m.id}>
          <div className="team-d__head">
            <span className="tm-avatar tm-avatar--lg" aria-hidden>
              {m.initials}
            </span>
            <div className="team-d__id">
              <span className="team-d__name">
                {m.name}
                {m.isYou && <span className="tm-you">You</span>}
              </span>
              <span className="team-d__role">{m.title}</span>
              <div className="team-d__badges">
                <Badge tone={accountStatusMeta[m.accountStatus].tone} dot>
                  {accountStatusMeta[m.accountStatus].label}
                </Badge>
                <Badge tone="neutral">
                  {ROLES.find((r) => r.id === m.role)?.label}
                </Badge>
                <Badge tone={availabilityMeta[m.availability].tone} dot pulse={availabilityMeta[m.availability].pulse}>
                  {availabilityMeta[m.availability].label}
                </Badge>
              </div>
            </div>
          </div>

          <p className="tm-drawer-email">{m.email}</p>

          <div className="team-d__quick">
            <div className="team-d__quickitem">
              <Briefcase aria-hidden />
              <b>{m.activeProjects}</b> active projects
            </div>
            <div className="team-d__quickitem">
              <FlaskConical aria-hidden />
              <b>{m.researchJobs}</b> research jobs
            </div>
          </div>

          <section className="team-d__section">
            <h3 className="team-d__label">
              <FolderKanban aria-hidden /> Assigned projects
              <span className="team-d__count">{m.projects.length}</span>
            </h3>
            {m.projects.length > 0 ? (
              <ul className="team-d__list">
                {m.projects.map((p) => (
                  <li className="team-proj" key={p.name}>
                    <div className="team-proj__main">
                      <span className="team-proj__name">{p.name}</span>
                      <span className="team-proj__role">{p.role}</span>
                    </div>
                    <span className="team-proj__state">{p.state}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="team-d__muted">No projects assigned.</p>
            )}
          </section>

          <section className="team-d__section">
            <h3 className="team-d__label">
              <CalendarClock aria-hidden /> Upcoming calls
            </h3>
            {m.calls.length > 0 ? (
              <ul className="team-d__list">
                {m.calls.map((c) => (
                  <li className="team-call" key={`${c.client}-${c.when}`}>
                    <span className="team-call__client">{c.client}</span>
                    <span className="team-call__when">{c.when}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="team-d__muted">No calls scheduled.</p>
            )}
          </section>

          <section className="team-d__section">
            <h3 className="team-d__label">
              <FlaskConical aria-hidden /> Current research jobs
            </h3>
            {m.jobs.length > 0 ? (
              <ul className="team-d__list">
                {m.jobs.map((j) => (
                  <li className="team-job" key={j.label}>
                    <span className="team-job__label">{j.label}</span>
                    <span className="team-job__stage">{j.stage}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="team-d__muted">No research jobs running.</p>
            )}
          </section>

          <section className="team-d__section">
            <h3 className="team-d__label">
              <Activity aria-hidden /> Recent activity
            </h3>
            <ul className="team-activity">
              {m.activity.map((x, i) => (
                <li key={i}>
                  <span className="team-activity__dot" aria-hidden />
                  <span className="team-activity__text">{x.text}</span>
                  <span className="team-activity__when">{x.when}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </SidePanel>
  );
}
