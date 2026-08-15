import { defaultWorkspaceSettings, emptyWorkspace, type ActivityItem, type InboxItem, type ProjectNote, type Task, type WeeklyReview, type Workspace, type WorkspaceSettings } from "@/lib/workspace";
import type { Project, ProjectKind, ProjectStatus } from "@/lib/projects";
import { isValidDateKey, normalizeTimeZone } from "@/lib/date-time";
import { isValidDateValue, normalizeHTTPSURL, uniqueById } from "@/lib/semantic-validation";

const projectStatuses = new Set<ProjectStatus>(["Active", "Planning", "Shipped", "Paused"]);
const projectKinds = new Set<ProjectKind>(["Software", "CNC", "Business", "Experiment"]);
const accents = new Set<Project["accent"]>(["cyan", "amber", "violet", "lime"]);
const priorities = new Set<NonNullable<Task["priority"]>>(["Low", "Medium", "High"]);
const noteTypes = new Set<ProjectNote["type"]>(["Update", "Decision", "Blocker", "Note"]);

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function text(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function date(value: unknown, dateOnly = false) {
  const candidate = text(value, 40);
  if (!candidate) return "";
  return (dateOnly ? isValidDateKey(candidate) : isValidDateValue(candidate)) ? candidate : "";
}

function optionalUrl(value: unknown) {
  return normalizeHTTPSURL(value);
}

function project(value: unknown): Project | null {
  const item = record(value);
  if (!item) return null;
  const id = text(item.id, 80); const name = text(item.name, 200);
  if (!id || !name) return null;
  const status = projectStatuses.has(item.status as ProjectStatus) ? item.status as ProjectStatus : "Planning";
  const kind = projectKinds.has(item.kind as ProjectKind) ? item.kind as ProjectKind : "Software";
  const accent = accents.has(item.accent as Project["accent"]) ? item.accent as Project["accent"] : "cyan";
  return {
    id, name, eyebrow: text(item.eyebrow, 160), description: text(item.description, 4000), status, kind,
    stack: Array.isArray(item.stack) ? item.stack.flatMap((entry) => typeof entry === "string" ? [entry.trim().slice(0, 80)] : []).filter(Boolean).slice(0, 30) : [],
    repo: optionalUrl(item.repo), deployment: optionalUrl(item.deployment), updatedAt: date(item.updatedAt) || new Date().toISOString(),
    updatedLabel: text(item.updatedLabel, 120), note: text(item.note, 4000), progress: Math.max(0, Math.min(100, Number(item.progress) || 0)), accent,
    pinned: Boolean(item.pinned),
  };
}

function task(value: unknown, projectIds: Set<string>): Task | null {
  const item = record(value);
  if (!item) return null;
  const id = text(item.id, 80); const title = text(item.title, 500);
  if (!id || !title) return null;
  const projectId = text(item.projectId, 80);
  const priority = priorities.has(item.priority as NonNullable<Task["priority"]>) ? item.priority as NonNullable<Task["priority"]> : "Medium";
  return { id, title, projectId: projectIds.has(projectId) ? projectId : undefined, priority, dueDate: date(item.dueDate, true) || undefined, notes: text(item.notes, 5000) || undefined, done: Boolean(item.done), completedAt: date(item.completedAt) || undefined, createdAt: date(item.createdAt) || new Date().toISOString() };
}

function activity(value: unknown): ActivityItem | null {
  const item = record(value); if (!item) return null;
  const id = text(item.id, 80); const message = text(item.message, 1000);
  return id && message ? { id, message, createdAt: date(item.createdAt) || new Date().toISOString() } : null;
}

function review(value: unknown): WeeklyReview | null {
  const item = record(value); if (!item) return null;
  const id = text(item.id, 80); if (!id) return null;
  return { id, wins: text(item.wins, 5000), blockers: text(item.blockers, 5000), lessons: text(item.lessons, 5000), nextPriorities: text(item.nextPriorities, 5000), createdAt: date(item.createdAt) || new Date().toISOString() };
}

function inboxItem(value: unknown): InboxItem | null {
  const item = record(value); if (!item) return null;
  const id = text(item.id, 80); const valueText = text(item.text, 2000);
  return id && valueText ? { id, text: valueText, createdAt: date(item.createdAt) || new Date().toISOString() } : null;
}

function note(value: unknown, projectIds: Set<string>): ProjectNote | null {
  const item = record(value); if (!item) return null;
  const id = text(item.id, 80); const projectId = text(item.projectId, 80); const content = text(item.content, 5000);
  if (!id || !projectIds.has(projectId) || !content) return null;
  const type = noteTypes.has(item.type as ProjectNote["type"]) ? item.type as ProjectNote["type"] : "Note";
  return { id, projectId, type, content, createdAt: date(item.createdAt) || new Date().toISOString() };
}

function settings(value: unknown): WorkspaceSettings {
  const item = record(value) ?? {};
  const priority = priorities.has(item.defaultTaskPriority as WorkspaceSettings["defaultTaskPriority"]) ? item.defaultTaskPriority as WorkspaceSettings["defaultTaskPriority"] : defaultWorkspaceSettings.defaultTaskPriority;
  return {
    displayName: text(item.displayName, 100) || defaultWorkspaceSettings.displayName,
    timezone: normalizeTimeZone(text(item.timezone, 100), defaultWorkspaceSettings.timezone),
    githubUsername: text(item.githubUsername, 100) || defaultWorkspaceSettings.githubUsername,
    vercelTeam: text(item.vercelTeam, 100) || defaultWorkspaceSettings.vercelTeam,
    staleProjectDays: Math.max(1, Math.min(365, Number(item.staleProjectDays) || defaultWorkspaceSettings.staleProjectDays)),
    defaultTaskPriority: priority,
  };
}

export function parseWorkspace(value: unknown): Workspace | null {
  const candidate = record(value);
  if (!candidate || !Array.isArray(candidate.projects) || !Array.isArray(candidate.tasks) || !Array.isArray(candidate.activity)) return null;
  const projects = uniqueById(candidate.projects.slice(0, 1000).flatMap((item) => project(item) ?? []));
  const projectIds = new Set(projects.map((item) => item.id));
  return {
    projects,
    tasks: uniqueById(candidate.tasks.slice(0, 5000).flatMap((item) => task(item, projectIds) ?? [])),
    activity: uniqueById(candidate.activity.slice(0, 500).flatMap((item) => activity(item) ?? [])),
    reviews: Array.isArray(candidate.reviews) ? uniqueById(candidate.reviews.slice(0, 52).flatMap((item) => review(item) ?? [])) : [],
    inbox: Array.isArray(candidate.inbox) ? uniqueById(candidate.inbox.slice(0, 1000).flatMap((item) => inboxItem(item) ?? [])) : [],
    settings: settings(candidate.settings),
    notes: Array.isArray(candidate.notes) ? uniqueById(candidate.notes.slice(0, 5000).flatMap((item) => note(item, projectIds) ?? [])) : [],
  };
}

export function isWorkspaceData(value: unknown): value is Workspace {
  return parseWorkspace(value) !== null;
}

export function normalizeWorkspace(value: unknown): Workspace {
  return parseWorkspace(value) ?? emptyWorkspace;
}
