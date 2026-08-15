"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertCircle, Archive, ArrowRightCircle, CalendarDays, CheckCircle2, CircleDot, Clock3, Command,
  DatabaseBackup, Download, ExternalLink, Flame, Inbox, CornerDownLeft, Github, Grid2X2, Keyboard, LayoutDashboard,
  Lightbulb, ListChecks, ListFilter, Pencil, BookOpenCheck, ClipboardCheck, DownloadCloud, Gauge, Megaphone, Plus,
  RefreshCw, Rocket, RotateCcw, Search, Settings, Sparkles, Square, Target, TerminalSquare, Trash2, Upload, X,
} from "lucide-react";
import type { Project, ProjectKind } from "@/lib/projects";
import { defaultWorkspaceSettings, emptyWorkspace, workspaceStorageKey, type InboxItem, type ProjectNote, type Task, type WeeklyReview, type Workspace, type WorkspaceSettings } from "@/lib/workspace";
import { selectFocusTasks, selectTasksForView } from "@/lib/planning";
import { isWorkspaceData, normalizeWorkspace } from "@/lib/workspace-validation";
import { cn } from "@/lib/utils";
import { dateKeyInTimeZone, normalizeTimeZone } from "@/lib/date-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DialogBoundary } from "@/components/ui/dialog-boundary";
import { SyncConflictDialog } from "@/components/ui/sync-conflict-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { readVersionedWorkspace, saveVersionedWorkspace } from "@/lib/versioned-workspace-client";
import { createWorkspaceSnapshotRequester, requestWorkspaceSnapshotRestore } from "@/lib/workspace-snapshot-client";
import { fetchProjectIntelligence, markProjectIntelligenceRefreshing, mergeProjectIntelligenceResults, type ProjectIntelligenceEntry } from "@/lib/project-intelligence-client";
import type { ComposerMode, Confirmation, ImportCandidate, UndoState } from "@/components/dashboard/dashboard-feature-types";
import {
  Composer,
  ConfirmDialog,
  ProjectEditor,
  ProjectImportDialog,
  ProjectWorkspace,
  SettingsDialog,
  TaskEditor,
  WeeklyReviewDialog,
} from "@/components/dashboard/dashboard-dialogs";
import { AnalyticsSection, CalendarTimeline, DevelopmentQueue, NotificationManager, ProjectCard, ProjectJournal } from "@/components/dashboard/dashboard-sections";

type SyncState = "loading" | "saved" | "saving" | "offline" | "conflict";
type TaskView = "Today" | "Next" | "All";
type WorkspaceConflict = { local: Workspace; cloud: Workspace | null; cloudVersion: string | null; loading: boolean; resolving: boolean; error: string | null };
type SnapshotNotice = { tone: "success" | "error"; message: string; authenticationRequired?: boolean };
type SnapshotHistoryItem = { id: string; createdAt: string };

export function Dashboard() {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"All" | ProjectKind>("All");
  const [composer, setComposer] = useState<ComposerMode>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskView, setTaskView] = useState<TaskView>("Today");
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const [intelligence, setIntelligence] = useState<Record<string, ProjectIntelligenceEntry>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const [lastSnapshotAt, setLastSnapshotAt] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotHistoryItem[]>([]);
  const [snapshotting, setSnapshotting] = useState(false);
  const [restoringSnapshotId, setRestoringSnapshotId] = useState<string | null>(null);
  const [snapshotNotice, setSnapshotNotice] = useState<SnapshotNotice | null>(null);
  const [requestSnapshot] = useState(() => createWorkspaceSnapshotRequester());
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conflict, setConflict] = useState<WorkspaceConflict | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const workspaceVersionRef = useRef<string | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const saveGenerationRef = useRef(0);
  const conflictRef = useRef(false);
  const skipNextSaveRef = useRef(false);

  const loadConflict = useCallback(async (local: Workspace) => {
    conflictRef.current = true;
    setSyncState("conflict");
    setConflict({ local, cloud: null, cloudVersion: null, loading: true, resolving: false, error: null });
    const result = await readVersionedWorkspace("/api/workspace", (value) => isWorkspaceData(value) ? normalizeWorkspace(value) : null);
    if (result.status === "error") {
      setConflict((current) => current ? { ...current, loading: false, error: "The current cloud workspace could not be loaded. Your local copy is still safe in this browser." } : current);
      return;
    }
    setConflict((current) => current ? { ...current, cloud: result.workspace ?? emptyWorkspace, cloudVersion: result.updatedAt, loading: false, error: null } : current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      let localWorkspace: Workspace = emptyWorkspace;
      try {
        const saved = localStorage.getItem(workspaceStorageKey);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (!isWorkspaceData(parsed)) throw new Error("Invalid local workspace");
          localWorkspace = normalizeWorkspace(parsed);
        }
      } catch {
        localStorage.removeItem(workspaceStorageKey);
      }
      try {
        const response = await fetch("/api/workspace", { cache: "no-store" });
        if (!response.ok) throw new Error("Cloud read failed");
        const payload = await response.json() as { workspace: Workspace | null; updatedAt?: string | null; lastSnapshotAt?: string | null; snapshots?: SnapshotHistoryItem[] };
        if (cancelled) return;
        workspaceVersionRef.current = payload.updatedAt ?? null;
        if (payload.workspace) {
          const normalized = normalizeWorkspace(payload.workspace);
          setWorkspace(normalized);
          localStorage.setItem(workspaceStorageKey, JSON.stringify(normalized));
        } else {
          setWorkspace(localWorkspace);
          if (localWorkspace.projects.length || localWorkspace.tasks.length || localWorkspace.activity.length) {
            const migrationResponse = await fetch("/api/workspace", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localWorkspace) });
            if (!migrationResponse.ok) throw new Error("Cloud migration failed");
            const migrationPayload = await migrationResponse.json() as { updatedAt?: string };
            workspaceVersionRef.current = migrationPayload.updatedAt ?? null;
          }
        }
        setLastSnapshotAt(payload.lastSnapshotAt ?? null);
        setSnapshots((payload.snapshots ?? []).filter((snapshot) => /^[1-9]\d*$/.test(snapshot.id) && !Number.isNaN(Date.parse(snapshot.createdAt))));
        setSyncState("saved");
      } catch {
        if (cancelled) return;
        setWorkspace(localWorkspace);
        setSyncState("offline");
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void hydrate();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(workspaceStorageKey, JSON.stringify(workspace));
    if (skipNextSaveRef.current) { skipNextSaveRef.current = false; return; }
    if (conflictRef.current) return;
    const generation = ++saveGenerationRef.current;
    const timer = window.setTimeout(async () => {
      setSyncState("saving");
      saveQueueRef.current = saveQueueRef.current.catch(() => undefined).then(async () => {
        if (generation !== saveGenerationRef.current) return;
        const result = await saveVersionedWorkspace("/api/workspace", workspace, workspaceVersionRef.current);
        if (result.status === "conflict") { if (generation === saveGenerationRef.current) await loadConflict(workspace); return; }
        if (result.status === "error") { if (generation === saveGenerationRef.current) setSyncState("offline"); return; }
        workspaceVersionRef.current = result.updatedAt ?? workspaceVersionRef.current;
        if (generation === saveGenerationRef.current) setSyncState("saved");
      });
      await saveQueueRef.current;
    }, 500);
    return () => window.clearTimeout(timer);
  }, [loadConflict, ready, workspace]);

  const refreshIntelligence = useCallback(async () => {
    const linked = workspace.projects.filter((project) => project.repo || project.deployment);
    if (!linked.length) return;
    setRefreshing(true);
    const projectIds = linked.map((project) => project.id);
    setIntelligence((current) => markProjectIntelligenceRefreshing(current, projectIds));
    try {
      const results = await Promise.allSettled(linked.map((project) => fetchProjectIntelligence(project)));
      setIntelligence((current) => mergeProjectIntelligenceResults(current, projectIds, results));
    } finally {
      setRefreshing(false);
    }
  }, [workspace.projects]);

  const intelligenceKey = workspace.projects.map((project) => `${project.id}:${project.repo ?? ""}:${project.deployment ?? ""}`).join("|");
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => void refreshIntelligence(), 0);
    return () => window.clearTimeout(timer);
  }, [ready, intelligenceKey, refreshIntelligence]);

  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(() => setUndo(null), 8000);
    return () => window.clearTimeout(timer);
  }, [undo]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setCommandOpen((open) => !open); return;
      }
      if (event.key === "Escape") { setCommandOpen(false); return; }
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT";
      if (!typing && event.altKey && event.key.toLowerCase() === "n") { event.preventDefault(); setComposer("task"); }
      if (!typing && event.altKey && event.key.toLowerCase() === "i") { event.preventDefault(); setComposer("idea"); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function record(message: string) {
    return { id: crypto.randomUUID(), message, createdAt: new Date().toISOString() };
  }
  function addProject(project: Project) { setWorkspace((current) => ({ ...current, projects: [project, ...current.projects], activity: [record(`Created project · ${project.name}`), ...current.activity].slice(0, 30) })); }
  function addTask(title: string, projectId?: string, priority?: Task["priority"], dueDate?: string) { setWorkspace((current) => ({ ...current, tasks: [{ id: crypto.randomUUID(), title, projectId, priority: priority ?? current.settings?.defaultTaskPriority ?? "Medium", dueDate, done: false, createdAt: new Date().toISOString() }, ...current.tasks], activity: [record(`Added task · ${title}`), ...current.activity].slice(0, 30) })); }
  function addIdea(idea: string) { setWorkspace((current) => ({ ...current, inbox: [{ id: crypto.randomUUID(), text: idea, createdAt: new Date().toISOString() }, ...(current.inbox ?? [])], activity: [record(`Captured idea · ${idea}`), ...current.activity].slice(0, 30) })); }
  function toggleTask(id: string) { setWorkspace((current) => { const task = current.tasks.find((item) => item.id === id); return { ...current, tasks: current.tasks.map((item) => item.id === id ? { ...item, done: !item.done, completedAt: item.done ? undefined : new Date().toISOString() } : item), activity: task ? [record(`${task.done ? "Reopened" : "Completed"} task · ${task.title}`), ...current.activity].slice(0, 30) : current.activity }; }); }
  function deleteProject(id: string) { const project = workspace.projects.find((item) => item.id === id); if (!project) return; setConfirmation({ title: `Delete ${project.name}?`, message: "The project will be removed and its tasks moved to General. You can undo this briefly afterward.", actionLabel: "Delete project", onConfirm: () => { setUndo({ label: `Deleted ${project.name}`, workspace }); setWorkspace((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== id), tasks: current.tasks.map((task) => task.projectId === id ? { ...task, projectId: undefined } : task), activity: [record(`Removed project · ${project.name}`), ...current.activity].slice(0, 30) })); } }); }
  function updateProject(project: Project) { setWorkspace((current) => ({ ...current, projects: current.projects.map((item) => item.id === project.id ? project : item), activity: [record(`Updated project · ${project.name}`), ...current.activity].slice(0, 30) })); }
  function updateTask(task: Task) { setWorkspace((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === task.id ? task : item), activity: [record(`Updated task · ${task.title}`), ...current.activity].slice(0, 30) })); }
  function deleteTask(id: string) { const task = workspace.tasks.find((item) => item.id === id); if (!task) return; setConfirmation({ title: "Delete this task?", message: `“${task.title}” will be removed. You can undo this briefly afterward.`, actionLabel: "Delete task", onConfirm: () => { setUndo({ label: `Deleted ${task.title}`, workspace }); setWorkspace((current) => ({ ...current, tasks: current.tasks.filter((item) => item.id !== id), activity: [record(`Removed task · ${task.title}`), ...current.activity].slice(0, 30) })); } }); }

  function downloadWorkspace(value: Workspace, filename = `work-ctrl-backup-${today}.json`) {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), workspace: value }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename; anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportWorkspace() { downloadWorkspace(workspace); }

  function useCloudConflict() {
    if (!conflict?.cloud) return;
    saveGenerationRef.current += 1;
    skipNextSaveRef.current = true;
    conflictRef.current = false;
    workspaceVersionRef.current = conflict.cloudVersion;
    localStorage.setItem(workspaceStorageKey, JSON.stringify(conflict.cloud));
    setWorkspace(conflict.cloud);
    setConflict(null);
    setSyncState("saved");
  }

  async function keepLocalConflict() {
    if (!conflict || conflict.loading || conflict.error) return;
    setConflict((current) => current ? { ...current, resolving: true } : current);
    const result = await saveVersionedWorkspace("/api/workspace", conflict.local, conflict.cloudVersion);
    if (result.status === "conflict") { await loadConflict(conflict.local); return; }
    if (result.status === "error") {
      setConflict((current) => current ? { ...current, resolving: false, error: "The local workspace could not be saved. Export it for safekeeping or retry the cloud read." } : current);
      return;
    }
    workspaceVersionRef.current = result.updatedAt ?? conflict.cloudVersion;
    conflictRef.current = false;
    setWorkspace(conflict.local);
    localStorage.setItem(workspaceStorageKey, JSON.stringify(conflict.local));
    setConflict(null);
    setSyncState("saved");
  }

  async function importWorkspace(file: File) {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const incoming: unknown = parsed && typeof parsed === "object" && "workspace" in parsed ? (parsed as { workspace?: unknown }).workspace : parsed;
      if (!isWorkspaceData(incoming)) throw new Error("Invalid backup");
      const normalized = normalizeWorkspace(incoming);
      setConfirmation({ title: "Restore this backup?", message: "The current workspace will be replaced by the imported projects, tasks, and activity. You can undo this briefly afterward.", actionLabel: "Restore backup", onConfirm: () => { setUndo({ label: "Restored backup", workspace }); setWorkspace(normalized); } });
    } catch { setConfirmation({ title: "Backup not recognized", message: "Choose a JSON backup exported from WORK//CTRL.", actionLabel: "Close", onConfirm: () => undefined }); }
    if (importInputRef.current) importInputRef.current.value = "";
  }

  async function createSnapshot() {
    setSnapshotting(true);
    setSnapshotNotice(null);
    try {
      const result = await requestSnapshot();
      if (result.status === "created") {
        setLastSnapshotAt(result.createdAt);
        setSnapshots((current) => [{ id: result.id, createdAt: result.createdAt }, ...current.filter((snapshot) => snapshot.id !== result.id)].slice(0, 10));
        setSnapshotNotice({ tone: "success", message: "Cloud snapshot created successfully." });
      } else if (result.status === "authentication-required") {
        setSnapshotNotice({ tone: "error", message: "Your session expired. Sign in again before creating a snapshot.", authenticationRequired: true });
      } else if (result.status === "workspace-not-saved") {
        setSnapshotNotice({ tone: "error", message: "Save the workspace to the cloud before creating its first snapshot." });
      } else if (result.status === "storage-unavailable") {
        setSnapshotNotice({ tone: "error", message: "Cloud storage could not create the snapshot. Try again in a moment." });
      } else if (result.status === "invalid-response") {
        setSnapshotNotice({ tone: "error", message: "Cloud storage returned an unexpected response. No snapshot was confirmed." });
      } else {
        setSnapshotNotice({ tone: "error", message: "The snapshot request could not reach cloud storage. Check your connection and try again." });
      }
    } finally {
      setSnapshotting(false);
    }
  }

  async function restoreSnapshot(snapshot: SnapshotHistoryItem) {
    setRestoringSnapshotId(snapshot.id);
    setSnapshotNotice(null);
    try {
      const result = await requestWorkspaceSnapshotRestore(snapshot.id);
      if (result.status === "restored" && isWorkspaceData(result.workspace)) {
        const restored = normalizeWorkspace(result.workspace);
        setUndo({ label: "Restored cloud snapshot", workspace });
        workspaceVersionRef.current = result.updatedAt;
        conflictRef.current = false;
        setWorkspace(restored);
        localStorage.setItem(workspaceStorageKey, JSON.stringify(restored));
        setSnapshots((current) => [result.safetySnapshot, ...current.filter((item) => item.id !== result.safetySnapshot.id)].slice(0, 10));
        setLastSnapshotAt(result.safetySnapshot.createdAt);
        setSyncState("saved");
        setSnapshotNotice({ tone: "success", message: "Cloud snapshot restored. A safety snapshot preserved the workspace it replaced." });
      } else if (result.status === "authentication-required") {
        setSnapshotNotice({ tone: "error", message: "Your session expired. Sign in again before restoring a snapshot.", authenticationRequired: true });
      } else if (result.status === "snapshot-not-found") {
        setSnapshots((current) => current.filter((item) => item.id !== snapshot.id));
        setSnapshotNotice({ tone: "error", message: "That snapshot is no longer available. The recovery list has been updated." });
      } else if (result.status === "snapshot-not-restorable" || result.status === "invalid-response" || result.status === "restored") {
        setSnapshotNotice({ tone: "error", message: "That snapshot did not contain a valid workspace and was not restored." });
      } else if (result.status === "storage-unavailable") {
        setSnapshotNotice({ tone: "error", message: "Cloud storage could not restore the snapshot. Try again in a moment." });
      } else {
        setSnapshotNotice({ tone: "error", message: "The restore request could not reach cloud storage. Check your connection and try again." });
      }
    } finally {
      setRestoringSnapshotId(null);
    }
  }

  function confirmSnapshotRestore(snapshot: SnapshotHistoryItem) {
    setConfirmation({
      title: "Restore this cloud snapshot?",
      message: `The current workspace will be replaced with the snapshot from ${new Date(snapshot.createdAt).toLocaleString()}. A new safety snapshot will preserve the workspace being replaced.`,
      actionLabel: "Restore snapshot",
      onConfirm: () => void restoreSnapshot(snapshot),
    });
  }

  function resetWorkspace() { setConfirmation({ title: "Reset the entire workspace?", message: "All projects, tasks, ideas, and activity will be cleared. Export a backup or create a snapshot first. You can undo this briefly afterward.", actionLabel: "Reset workspace", onConfirm: () => { setUndo({ label: "Reset workspace", workspace }); setWorkspace(emptyWorkspace); } }); }
  function inboxToTask(item: InboxItem) { setWorkspace((current) => ({ ...current, inbox: (current.inbox ?? []).filter((entry) => entry.id !== item.id), tasks: [{ id: crypto.randomUUID(), title: item.text, priority: "Medium", done: false, createdAt: new Date().toISOString() }, ...current.tasks], activity: [record(`Promoted inbox item to task · ${item.text}`), ...current.activity].slice(0, 30) })); }
  function inboxToProject(item: InboxItem) { const now = new Date(); const project: Project = { id: crypto.randomUUID(), name: item.text.length > 48 ? `${item.text.slice(0, 45)}…` : item.text, eyebrow: "New concept", description: item.text, status: "Planning", kind: "Experiment", stack: [], updatedAt: now.toISOString(), updatedLabel: "Just now", note: "Define the next useful action.", progress: 0, accent: "violet" }; setWorkspace((current) => ({ ...current, inbox: (current.inbox ?? []).filter((entry) => entry.id !== item.id), projects: [project, ...current.projects], activity: [record(`Promoted inbox item to project · ${project.name}`), ...current.activity].slice(0, 30) })); }
  function archiveInboxItem(item: InboxItem) { setWorkspace((current) => ({ ...current, inbox: (current.inbox ?? []).filter((entry) => entry.id !== item.id), activity: [record(`Archived inbox item · ${item.text}`), ...current.activity].slice(0, 30) })); }
  function importProjects(candidates: ImportCandidate[]) { const imported: Project[] = candidates.map((candidate) => ({ id: crypto.randomUUID(), name: candidate.name, eyebrow: candidate.vercelProject ? "GitHub + Vercel" : "GitHub repository", description: candidate.description, status: "Active", kind: "Software", stack: candidate.stack, repo: candidate.repo, deployment: candidate.deployment, updatedAt: candidate.pushedAt, updatedLabel: "Imported", note: "Define the next useful action.", progress: 0, accent: candidate.vercelProject ? "cyan" : "violet" })); setWorkspace((current) => ({ ...current, projects: [...imported, ...current.projects], activity: [record(`Imported ${imported.length} project${imported.length === 1 ? "" : "s"} from GitHub`), ...current.activity].slice(0, 30) })); }
  function saveSettings(settings: WorkspaceSettings) { setWorkspace((current) => ({ ...current, settings, activity: [record("Updated workspace settings"), ...current.activity].slice(0, 30) })); }
  function addProjectNote(note: ProjectNote) { const project = workspace.projects.find((item) => item.id === note.projectId); setWorkspace((current) => ({ ...current, notes: [note, ...(current.notes ?? [])], activity: [record(`Added ${note.type.toLowerCase()} to ${project?.name ?? "project"}`), ...current.activity].slice(0, 30) })); }
  function deleteProjectNote(note: ProjectNote) { setConfirmation({ title: "Delete journal entry?", message: "This entry will be removed from the project history. You can undo this briefly afterward.", actionLabel: "Delete entry", onConfirm: () => { setUndo({ label: "Deleted journal entry", workspace }); setWorkspace((current) => ({ ...current, notes: (current.notes ?? []).filter((item) => item.id !== note.id), activity: [record("Removed project journal entry"), ...current.activity].slice(0, 30) })); } }); }
  function saveWeeklyReview(review: WeeklyReview) {
    setWorkspace((current) => ({ ...current, reviews: [review, ...(current.reviews ?? [])].slice(0, 52), activity: [record("Completed weekly review"), ...current.activity].slice(0, 30) }));
    window.setTimeout(() => void createSnapshot(), 900);
  }

  const commandActions = [
    { id: "new-project", section: "Create", label: "New project", hint: "Create a workspace project", icon: <Grid2X2 />, run: () => setComposer("project") },
    { id: "new-task", section: "Create", label: "New task", hint: "Alt + N", icon: <ListChecks />, run: () => setComposer("task") },
    { id: "capture-idea", section: "Create", label: "Capture idea", hint: "Alt + I", icon: <Lightbulb />, run: () => setComposer("idea") },
    { id: "projects", section: "Navigate", label: "Go to projects", hint: "Project grid", icon: <Grid2X2 />, run: () => document.querySelector("#projects")?.scrollIntoView() },
    { id: "tasks", section: "Navigate", label: "Go to tasks", hint: "Daily actions", icon: <ListChecks />, run: () => document.querySelector("#tasks")?.scrollIntoView() },
    { id: "activity", section: "Navigate", label: "Go to activity", hint: "Workspace history", icon: <Activity />, run: () => document.querySelector("#activity")?.scrollIntoView() },
    { id: "refresh", section: "Workspace", label: "Refresh live status", hint: "GitHub + Vercel", icon: <RefreshCw />, run: () => void refreshIntelligence() },
    { id: "snapshot", section: "Workspace", label: "Create cloud snapshot", hint: "Neon backup", icon: <DatabaseBackup />, run: () => void createSnapshot() },
    { id: "export", section: "Workspace", label: "Export workspace", hint: "Download JSON", icon: <Download />, run: exportWorkspace },
    { id: "import-projects", section: "Workspace", label: "Import connected projects", hint: "GitHub + Vercel", icon: <DownloadCloud />, run: () => setImportOpen(true) },
    { id: "weekly-review", section: "Workspace", label: "Start weekly review", hint: "Wins + blockers + priorities", icon: <BookOpenCheck />, run: () => setReviewOpen(true) },
    { id: "settings", section: "Workspace", label: "Workspace settings", hint: "Identity + defaults", icon: <Settings />, run: () => setSettingsOpen(true) },
    ...workspace.projects.map((project) => ({ id: `project-${project.id}`, section: "Projects", label: project.name, hint: `Edit · ${project.status}`, icon: <CircleDot />, run: () => setEditingProject(project) })),
    ...workspace.tasks.map((task) => ({ id: `task-${task.id}`, section: "Tasks", label: task.title, hint: `${task.done ? "Completed" : task.priority ?? "Medium"}${task.dueDate ? ` · ${task.dueDate}` : ""}`, icon: task.done ? <CheckCircle2 /> : <ListChecks />, run: () => setEditingTask(task) })),
    ...(workspace.inbox ?? []).map((item) => ({ id: `inbox-${item.id}`, section: "Inbox", label: item.text, hint: "Untriaged capture", icon: <Inbox />, run: () => document.querySelector("#inbox")?.scrollIntoView() })),
    ...(workspace.notes ?? []).map((note) => ({ id: `note-${note.id}`, section: "Journal", label: note.content, hint: `${workspace.projects.find((project) => project.id === note.projectId)?.name ?? "Project"} · ${note.type}`, icon: <BookOpenCheck />, run: () => document.querySelector("#journal")?.scrollIntoView() })),
    ...(workspace.reviews ?? []).slice(0, 12).map((review) => ({ id: `review-${review.id}`, section: "Reviews", label: review.nextPriorities || review.wins || "Weekly review", hint: new Date(review.createdAt).toLocaleDateString(), icon: <BookOpenCheck />, run: () => setReviewOpen(true) })),
  ];
  const filteredCommands = commandActions.filter((action) => `${action.label} ${action.hint} ${action.section}`.toLowerCase().includes(commandQuery.toLowerCase()));
  const commandSections = [...new Set(filteredCommands.map((action) => action.section))];

  const filtered = useMemo(() => workspace.projects.filter((project) => (kind === "All" || project.kind === kind) && `${project.name} ${project.description} ${project.stack.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [kind, query, workspace.projects]);
  const openTasks = workspace.tasks.filter((task) => !task.done).length;
  const timeZone = normalizeTimeZone(workspace.settings?.timezone);
  const today = dateKeyInTimeZone(new Date(), timeZone);
  const overdueTasks = workspace.tasks.filter((task) => !task.done && task.dueDate && task.dueDate < today);
  const highPriorityTasks = workspace.tasks.filter((task) => !task.done && task.priority === "High");
  const focusTasks = selectFocusTasks(workspace.tasks);
  const todayTime = new Date(`${today}T12:00:00Z`).getTime();
  const stalledProjects = workspace.projects.filter((project) => project.status !== "Shipped" && todayTime - new Date(project.updatedAt).getTime() > (workspace.settings?.staleProjectDays ?? 14) * 24 * 60 * 60 * 1000);
  const averageMomentum = workspace.projects.length ? Math.round(workspace.projects.reduce((sum, project) => sum + project.progress, 0) / workspace.projects.length) : 0;
  const visibleTasks = selectTasksForView(workspace.tasks, taskView, today);
  const taskGroups = visibleTasks.reduce<Record<string, Task[]>>((groups, task) => { const name = workspace.projects.find((project) => project.id === task.projectId)?.name ?? "General"; (groups[name] ??= []).push(task); return groups; }, {});
  const kinds: Array<"All" | ProjectKind> = ["All", "Software", "CNC", "Business", "Experiment"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {conflict && <DialogBoundary label="Resolve workspace conflict" onClose={() => undefined}><SyncConflictDialog title="Choose which workspace to keep" comparisons={[
        { label: "Projects", local: conflict.local.projects.length, cloud: conflict.cloud?.projects.length ?? "—" },
        { label: "Tasks", local: conflict.local.tasks.length, cloud: conflict.cloud?.tasks.length ?? "—" },
        { label: "Inbox items", local: conflict.local.inbox?.length ?? 0, cloud: conflict.cloud?.inbox?.length ?? "—" },
        { label: "Activity entries", local: conflict.local.activity.length, cloud: conflict.cloud?.activity.length ?? "—" },
      ]} cloudUpdatedAt={conflict.cloudVersion} loading={conflict.loading} resolving={conflict.resolving} error={conflict.error} onRetry={() => void loadConflict(conflict.local)} onUseCloud={useCloudConflict} onKeepLocal={() => void keepLocalConflict()} onExportLocal={() => downloadWorkspace(conflict.local, `work-ctrl-conflict-local-${today}.json`)} /></DialogBoundary>}
      {composer && <DialogBoundary label="Create a project, task, or idea" onClose={() => setComposer(null)}><Composer mode={composer} projects={workspace.projects} onClose={() => setComposer(null)} onProject={addProject} onTask={addTask} onIdea={addIdea} /></DialogBoundary>}
      {editingProject && <DialogBoundary label="Edit project" onClose={() => setEditingProject(null)}><ProjectEditor project={editingProject} onClose={() => setEditingProject(null)} onSave={updateProject} /></DialogBoundary>}
      {viewingProjectId && workspace.projects.find((project) => project.id === viewingProjectId) && <DialogBoundary label="Project workspace" onClose={() => setViewingProjectId(null)}><ProjectWorkspace project={workspace.projects.find((project) => project.id === viewingProjectId)!} tasks={workspace.tasks} intelligence={intelligence[viewingProjectId]?.data} onClose={() => setViewingProjectId(null)} onEdit={() => { setEditingProject(workspace.projects.find((project) => project.id === viewingProjectId)!); setViewingProjectId(null); }} onAddTask={(title) => addTask(title, viewingProjectId)} onToggleTask={toggleTask} onEditTask={setEditingTask} /></DialogBoundary>}
      {editingTask && <DialogBoundary label="Edit task" onClose={() => setEditingTask(null)}><TaskEditor task={editingTask} projects={workspace.projects} onClose={() => setEditingTask(null)} onSave={updateTask} /></DialogBoundary>}
      {confirmation && <DialogBoundary label="Confirm action" onClose={() => setConfirmation(null)}><ConfirmDialog confirmation={confirmation} onClose={() => setConfirmation(null)} /></DialogBoundary>}
      {commandOpen && <DialogBoundary label="Command palette" onClose={() => setCommandOpen(false)}><div className="fixed inset-0 z-[55] flex justify-center bg-background/75 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setCommandOpen(false)}><Card className="h-fit w-full max-w-xl overflow-hidden shadow-2xl"><div className="flex items-center gap-3 border-b border-border px-4"><Search className="size-4 text-muted-foreground" /><input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Type a command or search projects…" aria-label="Search commands and projects" className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none" /><kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">ESC</kbd></div><div className="max-h-[55vh] overflow-y-auto p-2">{filteredCommands.length ? commandSections.map((section) => <div key={section} className="mb-2"><div className="px-2 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{section}</div>{filteredCommands.filter((action) => action.section === section).map((action) => <button key={action.id} onClick={() => { action.run(); setCommandOpen(false); setCommandQuery(""); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent"><span className="text-muted-foreground [&_svg]:size-4">{action.icon}</span><span className="min-w-0 flex-1 truncate text-sm">{action.label}</span><span className="text-[10px] text-muted-foreground">{action.hint}</span><CornerDownLeft className="size-3 text-muted-foreground/50" /></button>)}</div>) : <div className="grid min-h-32 place-items-center text-sm text-muted-foreground">No matching commands</div>}</div><div className="flex items-center gap-4 border-t border-border bg-secondary/30 px-4 py-2 font-mono text-[9px] text-muted-foreground"><span className="flex items-center gap-1"><Keyboard className="size-3" />Ctrl/⌘ K</span><span>Alt N · task</span><span>Alt I · idea</span></div></Card></div></DialogBoundary>}
      {reviewOpen && <DialogBoundary label="Weekly review" onClose={() => setReviewOpen(false)}><WeeklyReviewDialog onClose={() => setReviewOpen(false)} onSave={saveWeeklyReview} /></DialogBoundary>}
      {importOpen && <DialogBoundary label="Import projects" onClose={() => setImportOpen(false)}><ProjectImportDialog existing={workspace.projects} onClose={() => setImportOpen(false)} onImport={importProjects} /></DialogBoundary>}
      {settingsOpen && <DialogBoundary label="Workspace settings" onClose={() => setSettingsOpen(false)}><SettingsDialog settings={workspace.settings ?? defaultWorkspaceSettings} onClose={() => setSettingsOpen(false)} onSave={saveSettings} /></DialogBoundary>}
      {undo && <div className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-xs shadow-2xl"><span>{undo.label}</span><Button size="sm" variant="ghost" className="text-primary" onClick={() => { setWorkspace(undo.workspace); setUndo(null); }}>Undo</Button><button onClick={() => setUndo(null)} aria-label="Dismiss"><X className="size-3.5 text-muted-foreground" /></button></div>}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_-10%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card/30 p-4 backdrop-blur lg:flex">
          <div className="flex h-14 items-center gap-3 px-2"><div className="grid size-9 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary"><Command className="size-5" /></div><div><div className="text-sm font-bold tracking-tight">WORK//CTRL</div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Project operating system</div></div></div>
          <nav className="mt-8 space-y-1 text-sm"><a className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 font-medium text-primary" href="#"><LayoutDashboard className="size-4" />Command center</a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="/dashboard/marketing"><Megaphone className="size-4" />Marketing</a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="/dashboard/consultations"><ClipboardCheck className="size-4" />Consultations</a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#projects"><Grid2X2 className="size-4" />Projects<span className="ml-auto font-mono text-[10px]">{workspace.projects.length}</span></a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#tasks"><ListChecks className="size-4" />Tasks<span className="ml-auto font-mono text-[10px]">{openTasks}</span></a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#activity"><Activity className="size-4" />Activity</a></nav>
          <div className="mt-auto rounded-xl border border-border bg-background/60 p-3"><div className="mb-2 flex items-center gap-2 text-xs font-medium"><TerminalSquare className="size-4 text-primary" />Cloud workspace</div><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"><span className={cn("size-1.5 rounded-full", syncState === "saved" ? "bg-emerald-400" : syncState === "offline" || syncState === "conflict" ? "bg-amber-400" : "animate-pulse bg-primary")} />{syncState === "loading" ? "Loading cloud data" : syncState === "saving" ? "Saving changes" : syncState === "offline" ? "Offline · Saved locally" : syncState === "conflict" ? "Cloud conflict · Resolution required" : "Synced across devices"}</div></div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-16 sm:px-6 xl:px-10">
          <header className="flex h-20 items-center justify-between border-b border-border/60"><div className="flex items-center gap-2 text-xs text-muted-foreground"><CircleDot className={cn("size-3", syncState === "offline" || syncState === "conflict" ? "text-amber-400" : "text-emerald-400")} /><span className="hidden sm:inline">{syncState === "offline" ? "Working offline" : syncState === "conflict" ? "Resolve the cloud conflict" : syncState === "saving" ? "Saving…" : "Workspace ready"}</span></div><div className="flex items-center gap-2"><Button variant="outline" className="hidden text-muted-foreground md:flex" onClick={() => setCommandOpen(true)}><Search />Commands <kbd className="ml-4 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px]">Ctrl K</kbd></Button><Button variant="outline" size="icon" onClick={() => void refreshIntelligence()} aria-label="Refresh project status" disabled={refreshing}><RefreshCw className={cn(refreshing && "animate-spin")} /></Button><ThemeToggle /><Button onClick={() => setComposer("project")}><Plus />New project</Button></div></header>

          <section className="py-10"><div className="mb-8"><div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Personal operations</div><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Build what matters next.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Projects, tasks, ideas, and movement—captured in one clean operating view.</p></div><div className="grid gap-3 sm:grid-cols-3"><Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Projects</div><div className="mt-1 text-2xl font-semibold">{workspace.projects.length}</div></div><Grid2X2 className="size-5 text-primary" /></CardContent></Card><Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Open tasks</div><div className="mt-1 text-2xl font-semibold">{openTasks}</div></div><ListChecks className="size-5 text-amber-400" /></CardContent></Card><Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Signals logged</div><div className="mt-1 text-2xl font-semibold">{workspace.activity.length}</div></div><Activity className="size-5 text-emerald-400" /></CardContent></Card></div></section>

          <section id="focus" className="mb-10 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
            <Card><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><div><div className="mb-1 flex items-center gap-2"><Target className="size-4 text-primary" /><h2 className="text-sm font-semibold">Focus briefing</h2></div><p className="text-xs text-muted-foreground">The three most time-sensitive open actions.</p></div><Badge className="border-primary/20 bg-primary/10 text-primary">{focusTasks.length} queued</Badge></div>{focusTasks.length ? <div className="space-y-2">{focusTasks.map((task, index) => { const overdue = Boolean(task.dueDate && task.dueDate < today); const project = workspace.projects.find((item) => item.id === task.projectId); return <div key={task.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/45 p-3"><button onClick={() => toggleTask(task.id)} className="grid size-7 shrink-0 place-items-center rounded-full border border-border font-mono text-[10px] text-muted-foreground hover:border-primary hover:text-primary">{index + 1}</button><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{task.title}</div><div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">{project && <span>{project.name}</span>}<span className={cn(overdue && "text-red-500")}>{task.dueDate ? `${overdue ? "Overdue" : "Due"} ${new Date(`${task.dueDate}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : "No deadline"}</span></div></div><Badge className={cn("border-border", task.priority === "High" ? "border-red-500/20 bg-red-500/10 text-red-500" : "bg-secondary text-muted-foreground")}>{task.priority ?? "Medium"}</Badge><Button variant="ghost" size="icon" onClick={() => setEditingTask(task)}><Pencil /></Button></div>})}</div> : <div className="grid min-h-32 place-items-center text-center"><div><CheckCircle2 className="mx-auto mb-2 size-6 text-emerald-400" /><div className="text-sm font-medium">The runway is clear</div><div className="mt-1 text-xs text-muted-foreground">Add a task when the next move becomes clear.</div></div></div>}</CardContent></Card>
            <Card><CardContent className="p-5"><div className="mb-5"><h2 className="text-sm font-semibold">Pressure map</h2><p className="mt-1 text-xs text-muted-foreground">Signals that may need intervention.</p></div><div className="space-y-3"><div className="flex items-center justify-between rounded-lg bg-background/45 p-3"><div className="flex items-center gap-2 text-xs"><Flame className="size-4 text-red-500" />Overdue tasks</div><span className="font-mono text-sm font-semibold">{overdueTasks.length}</span></div><div className="flex items-center justify-between rounded-lg bg-background/45 p-3"><div className="flex items-center gap-2 text-xs"><AlertCircle className="size-4 text-amber-500" />High priority</div><span className="font-mono text-sm font-semibold">{highPriorityTasks.length}</span></div><div className="flex items-center justify-between rounded-lg bg-background/45 p-3"><div className="flex items-center gap-2 text-xs"><Clock3 className="size-4 text-violet-400" />Stalled projects</div><span className="font-mono text-sm font-semibold">{stalledProjects.length}</span></div><div className="flex items-center justify-between rounded-lg bg-background/45 p-3"><div className="flex items-center gap-2 text-xs"><Gauge className="size-4 text-emerald-400" />Avg. momentum</div><span className="font-mono text-sm font-semibold">{averageMomentum}%</span></div></div>{stalledProjects.length > 0 && <div className="mt-4 border-t border-border pt-3"><div className="mb-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Needs a pulse</div><div className="flex flex-wrap gap-1.5">{stalledProjects.slice(0, 4).map((project) => <button key={project.id} onClick={() => setEditingProject(project)}><Badge className="border-border bg-secondary text-muted-foreground hover:text-foreground">{project.name}</Badge></button>)}</div></div>}</CardContent></Card>
          </section>

          <ProjectJournal projects={workspace.projects} notes={workspace.notes ?? []} onAdd={addProjectNote} onDelete={deleteProjectNote} />
          <DevelopmentQueue projects={workspace.projects} intelligence={intelligence} />
          <AnalyticsSection tasks={workspace.tasks} projects={workspace.projects} today={today} timeZone={timeZone} />
          <CalendarTimeline tasks={workspace.tasks} projects={workspace.projects} todayKey={today} onEdit={setEditingTask} onToggle={toggleTask} />

          <section id="projects"><div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-base font-semibold">Project grid</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} projects visible</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none sm:w-64" /></label><div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1"><ListFilter className="mx-2 size-3.5 shrink-0 text-muted-foreground" />{kinds.map((item) => <button key={item} onClick={() => setKind(item)} className={cn("rounded-md px-2.5 py-1.5 text-xs transition", kind === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>{item}</button>)}</div></div></div>
            {filtered.length ? <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{filtered.map((project) => <ProjectCard key={project.id} project={project} intelligenceEntry={intelligence[project.id]} onOpen={() => setViewingProjectId(project.id)} onEdit={() => setEditingProject(project)} onDelete={() => deleteProject(project.id)} />)}</div> : <Card><CardContent className="grid min-h-64 place-items-center text-center"><div><Sparkles className="mx-auto mb-3 size-7 text-primary" /><h3 className="font-medium">Clean slate</h3><p className="mt-1 text-sm text-muted-foreground">Create your first project when you&apos;re ready.</p><Button className="mt-5" onClick={() => setComposer("project")}><Plus />New project</Button></div></CardContent></Card>}
          </section>

          <section className="mt-10 grid gap-4 xl:grid-cols-[1.15fr_1fr]">
            <Card id="tasks"><CardContent className="p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Tasks</h2><p className="mt-1 text-xs text-muted-foreground">Small, concrete next actions.</p></div><Button size="sm" variant="outline" onClick={() => setComposer("task")}><Plus />Add task</Button></div><div className="mb-4 flex gap-1 rounded-lg border border-border bg-background/50 p-1">{(["Today", "Next", "All"] as TaskView[]).map((view) => <button key={view} onClick={() => setTaskView(view)} className={cn("flex-1 rounded-md px-3 py-1.5 text-xs transition", taskView === view ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>{view}</button>)}</div>{visibleTasks.length ? <div className="space-y-5">{Object.entries(taskGroups).map(([group, tasks]) => <div key={group}><div className="mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{group}</div><div className="space-y-1">{tasks.map((task) => { const overdue = !task.done && Boolean(task.dueDate && task.dueDate < today); return <div key={task.id} className="group/task flex items-center gap-2 rounded-lg px-2 py-2.5 hover:bg-accent/50"><button onClick={() => toggleTask(task.id)} aria-label={task.done ? "Reopen task" : "Complete task"}>{task.done ? <CheckCircle2 className="size-4 shrink-0 text-emerald-400" /> : <Square className="size-4 shrink-0 text-muted-foreground" />}</button><div className="min-w-0 flex-1"><div className={cn("truncate text-xs", task.done && "text-muted-foreground line-through")}>{task.title}</div>{task.notes && <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{task.notes}</div>}</div><Badge className={cn("border-border", task.priority === "High" ? "border-red-500/20 bg-red-500/10 text-red-500" : task.priority === "Low" ? "bg-secondary text-muted-foreground" : "border-amber-500/20 bg-amber-500/10 text-amber-500")}>{task.priority ?? "Medium"}</Badge>{task.dueDate && <span className={cn("flex items-center gap-1 font-mono text-[9px]", overdue ? "text-red-500" : "text-muted-foreground")}>{overdue ? <AlertCircle className="size-3" /> : <CalendarDays className="size-3" />}{task.dueDate.slice(5)}</span>}<Button size="icon" variant="ghost" className="size-7 opacity-0 group-hover/task:opacity-100" onClick={() => setEditingTask(task)}><Pencil /></Button><Button size="icon" variant="ghost" className="size-7 opacity-0 group-hover/task:opacity-100" onClick={() => deleteTask(task.id)}><Trash2 /></Button></div>})}</div></div>)}</div> : <div className="grid min-h-32 place-items-center text-center text-xs text-muted-foreground">{taskView === "Today" ? "Nothing due today. You're clear." : taskView === "Next" ? "No upcoming tasks." : "No tasks yet. Add one useful next action."}</div>}</CardContent></Card>
            <Card><CardContent className="p-5"><div className="mb-5 flex items-center gap-2"><Sparkles className="size-4 text-violet-400" /><h2 className="text-sm font-semibold">Quick launch</h2></div><div className="grid grid-cols-2 gap-2"><Button variant="outline" className="h-auto justify-start p-3" asChild><a href="https://github.com/4twentydev" target="_blank" rel="noreferrer"><Github />GitHub <ExternalLink className="ml-auto size-3" /></a></Button><Button variant="outline" className="h-auto justify-start p-3" asChild><a href="https://vercel.com/4twentydev" target="_blank" rel="noreferrer"><Rocket />Vercel <ExternalLink className="ml-auto size-3" /></a></Button><Button variant="outline" className="h-auto justify-start p-3" onClick={() => setComposer("task")}><ListChecks />New task</Button><Button variant="outline" className="h-auto justify-start p-3" onClick={() => setComposer("idea")}><Lightbulb />Capture idea</Button></div></CardContent></Card>
          </section>

          <section id="inbox" className="mt-4"><Card><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2"><Inbox className="size-4 text-primary" /><h2 className="text-sm font-semibold">Capture inbox</h2></div><p className="mt-1 text-xs text-muted-foreground">Ideas stay loose until you decide what they should become.</p></div><Button variant="outline" size="sm" onClick={() => setComposer("idea")}><Plus />Capture</Button></div>{workspace.inbox?.length ? <div className="space-y-2">{workspace.inbox.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/45 p-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="text-sm leading-5">{item.text}</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">Captured {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p></div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => inboxToTask(item)}><ArrowRightCircle />Task</Button><Button variant="ghost" size="sm" onClick={() => inboxToProject(item)}><Grid2X2 />Project</Button><Button variant="ghost" size="icon" onClick={() => archiveInboxItem(item)} aria-label="Archive inbox item"><Archive /></Button></div></div>)}</div> : <div className="grid min-h-28 place-items-center text-center"><div><CheckCircle2 className="mx-auto mb-2 size-5 text-emerald-400" /><p className="text-xs text-muted-foreground">Inbox zero. Nothing waiting for a decision.</p></div></div>}</CardContent></Card></section>

          <section id="activity" className="mt-4"><Card><CardContent className="p-5"><div className="mb-5"><h2 className="text-sm font-semibold">Activity</h2><p className="mt-1 text-xs text-muted-foreground">An automatic trail of meaningful workspace changes.</p></div>{workspace.activity.length ? <div className="space-y-1">{workspace.activity.map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-accent/50"><div className={cn("size-2 rounded-full", index === 0 ? "bg-emerald-400" : "bg-muted-foreground/40")} /><span className="min-w-0 flex-1 truncate text-xs">{item.message}</span><span className="shrink-0 font-mono text-[9px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span></div>)}</div> : <div className="grid min-h-28 place-items-center text-xs text-muted-foreground">Activity appears as you work.</div>}</CardContent></Card></section>
          <section className="mt-4"><Card><CardContent className="p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="mb-2 flex items-center gap-2"><BookOpenCheck className="size-4 text-primary" /><h2 className="text-sm font-semibold">Weekly review</h2></div>{workspace.reviews?.[0] ? <div><p className="text-xs text-muted-foreground">Last completed {new Date(workspace.reviews[0].createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric" })}</p><p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6"><span className="font-medium">Next:</span> {workspace.reviews[0].nextPriorities || "No priorities recorded."}</p></div> : <p className="text-xs text-muted-foreground">No review yet. Close your first operating loop.</p>}</div><Button variant="outline" onClick={() => setReviewOpen(true)}><BookOpenCheck />{workspace.reviews?.length ? "New review" : "Start review"}</Button></div></CardContent></Card></section>
          <section className="mt-4"><NotificationManager /></section>
          <section className="mt-4"><Card><CardContent className="p-5">
            <div className="mb-5"><h2 className="text-sm font-semibold">Data safety</h2><p className="mt-1 text-xs text-muted-foreground">Portable backups and the 10 newest recovery points. Cloud storage retains the newest 30 snapshots.</p></div>
            <input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importWorkspace(file); }} />
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><Button variant="outline" className="justify-start" onClick={exportWorkspace}><Download />Export JSON</Button><Button variant="outline" className="justify-start" onClick={() => importInputRef.current?.click()}><Upload />Import backup</Button><Button variant="outline" className="justify-start" onClick={() => void createSnapshot()} disabled={snapshotting || Boolean(restoringSnapshotId)}><DatabaseBackup className={cn(snapshotting && "animate-pulse")} />{snapshotting ? "Creating snapshot…" : "Cloud snapshot"}</Button><Button variant="outline" className="justify-start text-red-500 hover:text-red-500" onClick={resetWorkspace}><RotateCcw />Reset workspace</Button></div>
            {snapshotNotice && <div role={snapshotNotice.tone === "error" ? "alert" : "status"} className={cn("mt-3 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs", snapshotNotice.tone === "success" ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400" : "border-amber-500/25 bg-amber-500/5 text-amber-400")}><span>{snapshotNotice.message}</span><span className="flex shrink-0 items-center gap-2">{snapshotNotice.authenticationRequired && <a href="/login?next=/dashboard" className="font-medium underline underline-offset-4">Sign in</a>}<button onClick={() => setSnapshotNotice(null)} aria-label="Dismiss snapshot message"><X className="size-3.5" /></button></span></div>}
            <div className="mt-4 border-t border-border pt-4"><div className="mb-2 flex items-center justify-between gap-3"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{lastSnapshotAt ? `Last cloud snapshot · ${new Date(lastSnapshotAt).toLocaleString()}` : "No cloud snapshot yet"}</div>{snapshots.length ? <span className="text-[10px] text-muted-foreground">Newest {snapshots.length}</span> : null}</div>{snapshots.length ? <div className="grid gap-2 sm:grid-cols-2">{snapshots.map((snapshot) => <div key={snapshot.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2"><span className="text-xs text-muted-foreground">{new Date(snapshot.createdAt).toLocaleString()}</span><Button size="sm" variant="ghost" disabled={Boolean(restoringSnapshotId) || snapshotting} onClick={() => confirmSnapshotRestore(snapshot)}><RotateCcw className={cn(restoringSnapshotId === snapshot.id && "animate-spin")} />{restoringSnapshotId === snapshot.id ? "Restoring…" : "Restore"}</Button></div>)}</div> : null}</div>
          </CardContent></Card></section>
        </main>
        <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-2xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground"><LayoutDashboard className="size-4" />Home</button><button onClick={() => document.querySelector("#focus")?.scrollIntoView()} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground"><Target className="size-4" />Focus</button><button onClick={() => setComposer("task")} className="mx-auto grid size-11 -translate-y-3 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg" aria-label="New task"><Plus className="size-5" /></button><button onClick={() => document.querySelector("#projects")?.scrollIntoView()} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground"><Grid2X2 className="size-4" />Projects</button><button onClick={() => setCommandOpen(true)} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground"><Command className="size-4" />More</button></nav>
      </div>
    </div>
  );
}
