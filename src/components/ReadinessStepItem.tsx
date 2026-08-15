import { Link } from "react-router-dom";
import { Check, AlertTriangle, Loader, Circle, ChevronRight } from "lucide-react";
import type { ReadinessStep } from "../data/types";

const stateIcon = {
  done: <Check />,
  attention: <AlertTriangle />,
  progress: <Loader />,
  pending: <Circle />,
};

export function ReadinessStepItem({
  step,
  projectId,
  index,
  total,
}: {
  step: ReadinessStep;
  projectId: string;
  index: number;
  total: number;
}) {
  return (
    <Link
      to={`/projects/${projectId}/${step.route}`}
      className={`rstep rstep--${step.state}`}
    >
      <div className="rstep__rail" aria-hidden>
        <span className="rstep__node">{stateIcon[step.state]}</span>
        {index < total - 1 && <span className="rstep__line" />}
      </div>
      <div className="rstep__body">
        <div className="rstep__top">
          <span className="rstep__label">{step.label}</span>
          <span className="rstep__meta">{step.meta}</span>
        </div>
        <span className="rstep__detail">{step.detail}</span>
      </div>
      <ChevronRight className="rstep__chev" aria-hidden />
    </Link>
  );
}
