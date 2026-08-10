import { ProjectStatusBadge } from "@/components/project-status-badge";
import { projectStatusDefinitions, projectStatuses } from "@/lib/project-status";

export function ProjectStatusLegend() {
  return <aside aria-labelledby="project-status-heading" className="mt-8 border-y border-border"><h3 id="project-status-heading" className="sr-only">Project status definitions</h3><div className="grid sm:grid-cols-2 lg:grid-cols-4">{projectStatuses.map((status) => <div key={status} className="border-t border-border px-0 py-4 first:border-t-0 sm:px-4 sm:[&:nth-child(-n+2)]:border-t-0 sm:[&:nth-child(odd)]:border-r lg:border-t-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"><ProjectStatusBadge status={status} /><p className="mt-2 text-xs leading-5 text-muted-foreground">{projectStatusDefinitions[status].description}.</p></div>)}</div></aside>;
}
