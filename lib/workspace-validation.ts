import type { Workspace } from "@/lib/workspace";

export function isWorkspaceData(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Workspace>;
  return Array.isArray(candidate.projects) && Array.isArray(candidate.tasks) && Array.isArray(candidate.activity) && (candidate.reviews === undefined || Array.isArray(candidate.reviews)) && (candidate.inbox === undefined || Array.isArray(candidate.inbox));
}

export function normalizeWorkspace(value: Workspace): Workspace {
  return {
    projects: value.projects,
    tasks: value.tasks.map((task) => ({ priority: "Medium", ...task })),
    activity: value.activity,
    reviews: value.reviews ?? [],
    inbox: value.inbox ?? [],
  };
}
