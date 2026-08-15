import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CalendarOff,
  FlaskConical,
  HelpCircle,
  Target,
} from "lucide-react";
import type { Project } from "../data/types";
import { ReadinessBadge, FreshnessBadge } from "./StatusBadges";
import { readinessMeta } from "../lib/status";

const researchLabel: Record<Project["research"], string> = {
  complete: "Complete",
  running: "Running",
  "not-started": "Not started",
};

function Stat({
  icon,
  label,
  children,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tone?: "critical" | "good" | "muted";
}) {
  return (
    <div className="pstat">
      <span className="pstat__icon" aria-hidden>
        {icon}
      </span>
      <span className="pstat__body">
        <span className="pstat__label">{label}</span>
        <span className={`pstat__value${tone ? ` is-${tone}` : ""}`}>
          {children}
        </span>
      </span>
    </div>
  );
}

export function ProjectItem({ project }: { project: Project }) {
  const navigate = useNavigate();
  const tone = readinessMeta[project.readiness].tone;
  const soon = project.meeting?.relative === "Tomorrow";

  const open = () => navigate(`/projects/${project.id}`);

  return (
    <article
      className={`project-row stripe-${tone} is-clickable`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${project.name} overview`}
    >
      <div className="project-row__main">
        {/* PRIMARY: client + status */}
        <div className="project-row__head">
          <div className="project-row__id">
            <h3 className="project-row__name">{project.name}</h3>
            <span className="project-row__industry">{project.industry}</span>
          </div>
          <ReadinessBadge state={project.readiness} />
        </div>

        {/* PRIMARY: next meeting */}
        <div className={`project-row__meeting${soon ? " is-soon" : ""}`}>
          {project.meeting ? (
            <>
              {soon ? <CalendarClock aria-hidden /> : <CalendarClock aria-hidden />}
              <span className="project-row__meeting-rel">
                {project.meeting.relative}
              </span>
              <span className="project-row__meeting-abs">
                {project.meeting.date}, {project.meeting.time}
              </span>
            </>
          ) : (
            <>
              <CalendarOff aria-hidden />
              <span className="project-row__meeting-abs">No meeting scheduled</span>
            </>
          )}
        </div>

        {/* SECONDARY: research / questions / opportunities */}
        <div className="project-row__stats">
          <Stat icon={<FlaskConical />} label="Research">
            {project.research === "running" ? (
              <span className="research-running">
                {researchLabel[project.research]}
                <span className="minibar">
                  <span
                    className="minibar__fill info"
                    style={{ width: `${project.researchProgress ?? 0}%` }}
                  />
                </span>
                <span className="pstat__soft">{project.researchProgress}%</span>
              </span>
            ) : project.research === "not-started" ? (
              <span className="pstat__soft">Not started</span>
            ) : (
              <span className="research-fresh">
                {researchLabel[project.research]}
                <FreshnessBadge state={project.freshness} />
              </span>
            )}
          </Stat>

          <Stat
            icon={<HelpCircle />}
            label="Critical questions"
            tone={project.criticalOpenQuestions > 0 ? "critical" : "muted"}
          >
            {project.criticalOpenQuestions > 0
              ? `${project.criticalOpenQuestions} open`
              : "None open"}
          </Stat>

          <Stat
            icon={<Target />}
            label="Opportunities"
            tone={project.confirmedOpportunities > 0 ? "good" : "muted"}
          >
            {project.confirmedOpportunities > 0
              ? `${project.confirmedOpportunities} identified`
              : "—"}
          </Stat>
        </div>

        {/* TERTIARY: owner / stakeholder / last activity */}
        <div className="project-row__tertiary">
          <span>
            Owner <b>{project.owner}</b>
          </span>
          <span className="dotsep">·</span>
          <span>
            {project.stakeholder.name === "—"
              ? "Stakeholder not identified"
              : `${project.stakeholder.name}, ${project.stakeholder.role}`}
          </span>
          <span className="dotsep">·</span>
          <span>{project.lastActivity}</span>
        </div>
      </div>

      {/* PRIMARY: recommended next action */}
      <div className={`project-row__action tone-${tone}`}>
        <div className="nextaction">
          <span className="nextaction__label">Recommended next</span>
          <span className="nextaction__text">{project.nextAction}</span>
        </div>
        <span className="nextaction__go" aria-hidden>
          Open <ArrowRight />
        </span>
      </div>
    </article>
  );
}
