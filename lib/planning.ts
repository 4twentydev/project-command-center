import type { Task } from "@/lib/workspace";

const priorityRank = { High: 0, Medium: 1, Low: 2 } as const;

export function selectFocusTasks(tasks: Task[], limit = 3) {
  return [...tasks].filter((task) => !task.done).sort((a, b) => {
    const dueA = a.dueDate ?? "9999-12-31";
    const dueB = b.dueDate ?? "9999-12-31";
    if (dueA !== dueB) return dueA.localeCompare(dueB);
    return priorityRank[a.priority ?? "Medium"] - priorityRank[b.priority ?? "Medium"];
  }).slice(0, limit);
}

export function selectTasksForView(tasks: Task[], view: "Today" | "Next" | "All", today: string) {
  return tasks.filter((task) => {
    if (view === "All") return true;
    if (view === "Today") return !task.done && Boolean(task.dueDate && task.dueDate <= today);
    return !task.done && (!task.dueDate || task.dueDate > today);
  }).sort((a, b) => priorityRank[a.priority ?? "Medium"] - priorityRank[b.priority ?? "Medium"]);
}
