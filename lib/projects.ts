export type ProjectStatus = "Active" | "Planning" | "Shipped" | "Paused";
export type ProjectKind = "Software" | "CNC" | "Business" | "Experiment";

export type Project = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  status: ProjectStatus;
  kind: ProjectKind;
  stack: string[];
  repo?: string;
  deployment?: string;
  updatedAt: string;
  updatedLabel: string;
  note: string;
  progress: number;
  accent: "cyan" | "amber" | "violet" | "lime";
  pinned?: boolean;
};

// Start clean. New projects created in the dashboard persist in local storage.
export const projects: Project[] = [];
