import type { ProjectStatus } from "@/lib/project-status";
import { projectStatusDefinitions } from "@/lib/project-status";
import { Badge } from "@/components/ui/badge";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const definition = projectStatusDefinitions[status];
  return <Badge variant="outline" className={definition.className} title={definition.description}>{status}</Badge>;
}
