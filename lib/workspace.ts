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

export type Workspace = {
  projects: Project[];
  tasks: Task[];
  activity: ActivityItem[];
  reviews?: WeeklyReview[];
  inbox?: InboxItem[];
};

export const emptyWorkspace: Workspace = { projects: [], tasks: [], activity: [], reviews: [], inbox: [] };
export const workspaceStorageKey = "work-ctrl-workspace-v1";
