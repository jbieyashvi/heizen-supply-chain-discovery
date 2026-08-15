import { Link, useParams } from "react-router-dom";
import { Construction } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { projects } from "../data/mock";

export function PlaceholderPage({ section }: { section: string }) {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);

  return (
    <div className="page">
      <PageHeader
        crumbs={[
          { label: "Projects", to: "/projects" },
          { label: project?.name ?? "Project", to: `/projects/${projectId}` },
          { label: section },
        ]}
        title={<h1 className="page-title">{section}</h1>}
        subtitle={`${section} for ${project?.name ?? "this project"}.`}
      />
      <EmptyState
        icon={<Construction />}
        title={`${section} arrives in the next phase`}
        body="This prototype phase focuses on the Projects Command Centre and Project Overview. This section is stubbed so navigation stays intact."
        action={
          <Link className="btn btn-primary" to={`/projects/${projectId}`}>
            Back to overview
          </Link>
        }
      />
    </div>
  );
}
