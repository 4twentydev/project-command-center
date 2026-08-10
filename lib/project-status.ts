export const projectStatusDefinitions = {
  "Live system": {
    description: "Implemented and currently operational",
    className: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/25 dark:text-emerald-400",
  },
  "Working prototype": {
    description: "Functional enough to demonstrate or test",
    className: "border-amber-600/30 bg-amber-500/10 text-amber-800 dark:border-amber-500/25 dark:text-amber-400",
  },
  "Active concept": {
    description: "Defined product or workflow still under development",
    className: "border-violet-600/30 bg-violet-500/10 text-violet-700 dark:border-violet-500/25 dark:text-violet-400",
  },
  "Case study": {
    description: "Completed work supported by real evidence",
    className: "border-cyan-600/30 bg-cyan-500/10 text-cyan-700 dark:border-cyan-500/25 dark:text-cyan-400",
  },
} as const;

export type ProjectStatus = keyof typeof projectStatusDefinitions;

export const projectStatuses = Object.keys(projectStatusDefinitions) as ProjectStatus[];
