import type { Project } from "@/lib/projects";

export type Task = {
  id: string;
  title: string;
  projectId?: string;
  priority?: "Low" | "Medium" | "High";
  dueDate?: string;
  notes?: string;
  done: boolean;
  completedAt?: string;
  createdAt: string;
};

export type ActivityItem = {
  id: string;
  message: string;
  createdAt: string;
};

export type WeeklyReview = {
  id: string;
  wins: string;
  blockers: string;
  lessons: string;
  nextPriorities: string;
  createdAt: string;
};

export type InboxItem = {
  id: string;
  text: string;
  createdAt: string;
};

export type WorkspaceSettings = {
  displayName: string;
  timezone: string;
  githubUsername: string;
  vercelTeam: string;
  staleProjectDays: number;
  defaultTaskPriority: "Low" | "Medium" | "High";
};

export const defaultWorkspaceSettings: WorkspaceSettings = {
  displayName: "4twen",
  timezone: "America/Denver",
  githubUsername: "4twentydev",
  vercelTeam: "4twentydev",
  staleProjectDays: 14,
  defaultTaskPriority: "Medium",
};

export type Workspace = {
  projects: Project[];
  tasks: Task[];
  activity: ActivityItem[];
  reviews?: WeeklyReview[];
  inbox?: InboxItem[];
  settings?: WorkspaceSettings;
};

export const emptyWorkspace: Workspace = { projects: [], tasks: [], activity: [], reviews: [], inbox: [], settings: defaultWorkspaceSettings };
export const workspaceStorageKey = "work-ctrl-workspace-v1";
