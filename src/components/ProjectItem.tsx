import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CalendarOff,
  FlaskConical,
  HelpCircle,
  Target,
  Clock3,
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
  const clickable = project.id === "clio-snacks"; // only Clio has a built overview

  const open = () => navigate(`/projects/${project.id}`);

  return (
    <article
      className={`project-row stripe-${tone}${clickable ? " is-clickable" : ""}`}
      onClick={clickable ? open : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
              }
            }
          : undefined
      }
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `Open ${project.name} overview` : undefined}
    >
      <div className="project-row__main">
        <div className="project-row__head">
          <div className="project-row__id">
            <h3 className="project-row__name">{project.name}</h3>
            <span className="project-row__industry">{project.industry}</span>
          </div>
          <ReadinessBadge state={project.readiness} />
        </div>

        <div className="project-row__people">
          <span>
            Owner <b>{project.owner}</b>
          </span>
          <span className="dotsep">·</span>
          <span>
            Stakeholder{" "}
            <b>
              {project.stakeholder.name === "—"
                ? "Not identified"
                : `${project.stakeholder.name}, ${project.stakeholder.role}`}
            </b>
          </span>
        </div>

        <div className="project-row__stats">
          <Stat
            icon={project.meeting ? <CalendarClock /> : <CalendarOff />}
            label="Next meeting"
          >
            {project.meeting ? (
              <>
                {project.meeting.relative}
                <span className="pstat__soft">
                  {" · "}
                  {project.meeting.date}, {project.meeting.time}
                </span>
              </>
            ) : (
              <span className="pstat__soft">Not scheduled</span>
            )}
          </Stat>

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
              : "None"}
          </Stat>

          <Stat
            icon={<Target />}
            label="Opportunities"
            tone={project.confirmedOpportunities > 0 ? "good" : "muted"}
          >
            {project.confirmedOpportunities > 0
              ? `${project.confirmedOpportunities} confirmed`
              : "—"}
          </Stat>

          <Stat icon={<Clock3 />} label="Last activity" tone="muted">
            {project.lastActivity}
          </Stat>
        </div>
      </div>

      <div className={`project-row__action tone-${tone}`}>
        <div className="nextaction">
          <span className="nextaction__label">Recommended next</span>
          <span className="nextaction__text">{project.nextAction}</span>
        </div>
        {clickable ? (
          <span className="nextaction__go" aria-hidden>
            Open <ArrowRight />
          </span>
        ) : (
          <span className="nextaction__go is-disabled" aria-hidden>
            Preview soon
          </span>
        )}
      </div>
    </article>
  );
}
