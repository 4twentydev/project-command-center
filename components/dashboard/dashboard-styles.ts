import type { ProjectStatus } from "@/lib/projects";

export const statusStyles: Record<ProjectStatus, string> = {
  Active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  Planning: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  Shipped: "border-cyan-500/20 bg-cyan-500/10 text-cyan-500",
  Paused: "border-border bg-muted text-muted-foreground",
};

export const accentStyles = {
  cyan: "from-cyan-400/75 to-blue-500/10",
  amber: "from-amber-400/75 to-orange-500/10",
  violet: "from-violet-400/75 to-fuchsia-500/10",
  lime: "from-lime-400/75 to-emerald-500/10",
};
