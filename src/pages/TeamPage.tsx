import { useMemo, useState } from "react";
import {
  Search,
  Briefcase,
  CalendarClock,
  FlaskConical,
  ArrowRight,
  Users,
  FolderKanban,
  Activity,
  CalendarOff,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../components/Badge";
import { Segmented } from "../components/Segmented";
import { SidePanel } from "../components/SidePanel";
import { EmptyState } from "../components/EmptyState";
import {
  teamMembers,
  statusMeta,
  type TeamMember,
  type MemberStatus,
} from "../data/team";

type Filter = "all" | "available" | "in-call" | "research";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "in-call", label: "In client call" },
  { id: "research", label: "Research running" },
];

const matchesFilter = (s: MemberStatus, f: Filter) =>
  f === "all" ? true : f === s;

export function TeamPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teamMembers.filter((m) => {
      if (!matchesFilter(m.status, filter)) return false;
      if (!q) return true;
      return `${m.name} ${m.role}`.toLowerCase().includes(q);
    });
  }, [query, filter]);

  const active = teamMembers.find((m) => m.id === openId) ?? null;

  const filterOptions = FILTERS.map((f) => {
    if (f.id === "all") return f;
    const n = teamMembers.filter((m) => m.status === f.id).length;
    return { ...f, label: `${f.label} ${n}` };
  });

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Workspace" }, { label: "Team" }]}
        title={<h1 className="page-title">Team</h1>}
        subtitle="Who's on the workspace, what they're working on, and where they are right now."
      />

      <div className="src-toolbar">
        <div className="src-search">
          <Search aria-hidden />
          <input
            type="search"
            placeholder="Search team members…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search team members"
          />
        </div>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          ariaLabel="Filter team"
          options={filterOptions}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="No team members match"
          body="Try a different filter or clear your search."
          action={
            <button
              className="btn"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="team-list">
          {visible.map((m) => (
            <MemberRow key={m.id} member={m} onOpen={() => setOpenId(m.id)} />
          ))}
        </div>
      )}

      <MemberDetail member={active} onClose={() => setOpenId(null)} />
    </div>
  );
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const m = statusMeta[status];
  return (
    <Badge tone={m.tone} dot pulse={m.pulse}>
      {m.label}
    </Badge>
  );
}

function MemberRow({
  member: m,
  onOpen,
}: {
  member: TeamMember;
  onOpen: () => void;
}) {
  return (
    <article className="team-row" onClick={onOpen}>
      <div className="team-row__main">
        <span className={`team-avatar status-${m.status}`} aria-hidden>
          {m.initials}
        </span>
        <div className="team-row__id">
          <button
            className="team-row__name"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            {m.name}
          </button>
          <span className="team-row__role">{m.role}</span>
        </div>
      </div>

      <div className="team-row__stats">
        <span className="team-stat" title="Active projects">
          <Briefcase aria-hidden /> {m.activeProjects} project
          {m.activeProjects === 1 ? "" : "s"}
        </span>
        <span className="team-stat" title="Upcoming call">
          {m.upcomingCall ? (
            <>
              <CalendarClock aria-hidden /> {m.upcomingCall}
            </>
          ) : (
            <>
              <CalendarOff aria-hidden /> No call scheduled
            </>
          )}
        </span>
        <span className="team-stat" title="Research jobs running">
          <FlaskConical aria-hidden /> {m.researchJobs} research job
          {m.researchJobs === 1 ? "" : "s"}
        </span>
      </div>

      <div className="team-row__status">
        <StatusBadge status={m.status} />
      </div>

      <div className="team-row__action">
        <button
          className="btn btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          View workload <ArrowRight />
        </button>
      </div>
    </article>
  );
}

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
      subtitle={m?.role ?? "Team member"}
    >
      {m && (
        <div className="team-d" key={m.id}>
          <div className="team-d__head">
            <span className={`team-avatar team-avatar--lg status-${m.status}`} aria-hidden>
              {m.initials}
            </span>
            <div className="team-d__id">
              <span className="team-d__name">{m.name}</span>
              <span className="team-d__role">{m.role}</span>
              <StatusBadge status={m.status} />
            </div>
          </div>

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

          {/* Assigned projects */}
          <section className="team-d__section">
            <h3 className="team-d__label">
              <FolderKanban aria-hidden /> Assigned projects
              <span className="team-d__count">{m.projects.length}</span>
            </h3>
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
          </section>

          {/* Upcoming calls */}
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

          {/* Research jobs */}
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

          {/* Recent activity */}
          <section className="team-d__section">
            <h3 className="team-d__label">
              <Activity aria-hidden /> Recent activity
            </h3>
            <ul className="team-activity">
              {m.activity.map((a, i) => (
                <li key={i}>
                  <span className="team-activity__dot" aria-hidden />
                  <span className="team-activity__text">{a.text}</span>
                  <span className="team-activity__when">{a.when}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </SidePanel>
  );
}
