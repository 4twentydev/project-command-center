import type { Project } from "@/lib/projects";

export type Task = {
  id: string;
  title: string;
  projectId?: string;
  done: boolean;
  createdAt: string;
};

export type ActivityItem = {
  id: string;
  message: string;
  createdAt: string;
};

export type Workspace = {
  projects: Project[];
  tasks: Task[];
  activity: ActivityItem[];
};

export const emptyWorkspace: Workspace = { projects: [], tasks: [], activity: [] };
export const workspaceStorageKey = "work-ctrl-workspace-v1";
