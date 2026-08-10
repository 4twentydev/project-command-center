"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertCircle, ArrowUpRight, CalendarDays, CheckCircle2, CircleDot, Clock3, Cloud, Command, DatabaseBackup, Download, ExternalLink, Flame,
  CornerDownLeft, GitCommitHorizontal, Github, Grid2X2, Keyboard, LayoutDashboard, Lightbulb, ListChecks, ListFilter, Pencil,
  Gauge, Plus, RefreshCw, Rocket, RotateCcw, Search, Sparkles, Square, Target, TerminalSquare, Trash2, Upload, X,
} from "lucide-react";
import type { Project, ProjectKind, ProjectStatus } from "@/lib/projects";
import { emptyWorkspace, workspaceStorageKey, type Task, type Workspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const statusStyles: Record<ProjectStatus, string> = {
  Active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  Planning: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  Shipped: "border-cyan-500/20 bg-cyan-500/10 text-cyan-500",
  Paused: "border-border bg-muted text-muted-foreground",
};

const accentStyles = {
  cyan: "from-cyan-400/75 to-blue-500/10",
  amber: "from-amber-400/75 to-orange-500/10",
  violet: "from-violet-400/75 to-fuchsia-500/10",
  lime: "from-lime-400/75 to-emerald-500/10",
};

type ComposerMode = "project" | "task" | "idea" | null;
type SyncState = "loading" | "saved" | "saving" | "offline";
type TaskView = "Today" | "Next" | "All";
type Confirmation = { title: string; message: string; actionLabel: string; onConfirm: () => void };
type UndoState = { label: string; workspace: Workspace };

function isWorkspaceData(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Workspace>;
  return Array.isArray(candidate.projects) && Array.isArray(candidate.tasks) && Array.isArray(candidate.activity);
}
type ProjectIntelligence = {
  github: null | { available: boolean; private?: boolean; defaultBranch?: string; openIssues?: number; pushedAt?: string; latestCommit?: null | { sha: string; message: string; url: string; date?: string } };
  vercel: null | { reachable: boolean; state: string | null; target?: string | null; createdAt?: number; url: string; checkedAt: string };
  fetchedAt: string;
};

function ConfirmDialog({ confirmation, onClose }: { confirmation: Confirmation; onClose: () => void }) {
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><Card className="w-full max-w-md shadow-2xl"><CardContent className="p-6"><div className="mb-4 grid size-10 place-items-center rounded-full bg-red-500/10 text-red-500"><AlertCircle /></div><h2 className="text-lg font-semibold">{confirmation.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{confirmation.message}</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button className="bg-red-600 text-white shadow-none hover:bg-red-700" onClick={() => { confirmation.onConfirm(); onClose(); }}><Trash2 />{confirmation.actionLabel}</Button></div></CardContent></Card></div>;
}

function ProjectEditor({ project, onClose, onSave }: { project: Project; onClose: () => void; onSave: (project: Project) => void }) {
  const [draft, setDraft] = useState(project);
  const update = <K extends keyof Project,>(key: K, value: Project[K]) => setDraft((current) => ({ ...current, [key]: value }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    onSave({ ...draft, name: draft.name.trim(), description: draft.description.trim(), note: draft.note.trim(), updatedAt: new Date().toISOString(), updatedLabel: "Just now" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <Card className="my-6 w-full max-w-2xl shadow-2xl">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">Project controls</div><h2 className="mt-1 text-xl font-semibold">Edit project</h2></div><Button variant="ghost" size="icon" onClick={onClose}><X /></Button></div>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium">Name<input value={draft.name} onChange={(event) => update("name", event.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" /></label>
              <label className="block text-xs font-medium">Label<input value={draft.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" /></label>
            </div>
            <label className="block text-xs font-medium">Description<textarea value={draft.description} onChange={(event) => update("description", event.target.value)} className="mt-2 min-h-20 w-full resize-none rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" /></label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-xs font-medium">Status<select value={draft.status} onChange={(event) => update("status", event.target.value as ProjectStatus)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm">{["Active", "Planning", "Shipped", "Paused"].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="block text-xs font-medium">Workspace<select value={draft.kind} onChange={(event) => update("kind", event.target.value as ProjectKind)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm">{["Software", "CNC", "Business", "Experiment"].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="block text-xs font-medium">Momentum · {draft.progress}%<input type="range" min="0" max="100" value={draft.progress} onChange={(event) => update("progress", Number(event.target.value))} className="mt-4 w-full accent-[var(--primary)]" /></label>
            </div>
            <label className="block text-xs font-medium">Stack <span className="font-normal text-muted-foreground">(comma separated)</span><input value={draft.stack.join(", ")} onChange={(event) => update("stack", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" placeholder="Next.js, TypeScript, Bun" /></label>
            <label className="block text-xs font-medium">Next action<input value={draft.note} onChange={(event) => update("note", event.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium">GitHub repository<input type="url" value={draft.repo ?? ""} onChange={(event) => update("repo", event.target.value || undefined)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" placeholder="https://github.com/..." /></label>
              <label className="block text-xs font-medium">Deployment<input type="url" value={draft.deployment ?? ""} onChange={(event) => update("deployment", event.target.value || undefined)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" placeholder="https://...vercel.app" /></label>
            </div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit"><CheckCircle2 />Save changes</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Composer({ mode, projects, onClose, onProject, onTask, onIdea }: {
  mode: Exclude<ComposerMode, null>;
  projects: Project[];
  onClose: () => void;
  onProject: (project: Project) => void;
  onTask: (title: string, projectId?: string, priority?: Task["priority"], dueDate?: string) => void;
  onIdea: (idea: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<ProjectKind>("Software");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [dueDate, setDueDate] = useState("");
  const labels = { project: "New project", task: "New task", idea: "Capture idea" };

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    if (mode === "project") {
      const now = new Date();
      onProject({
        id: crypto.randomUUID(), name: title.trim(), eyebrow: kind,
        description: description.trim() || "No description yet.", status: "Planning", kind,
        stack: [], updatedAt: now.toISOString(), updatedLabel: "Just now",
        note: "Define the next useful action.", progress: 0, accent: "cyan",
      });
    } else if (mode === "task") onTask(title.trim(), projectId || undefined, priority, dueDate || undefined);
    else onIdea(title.trim());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <Card className="w-full max-w-lg shadow-2xl">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">Quick capture</div><h2 className="mt-1 text-xl font-semibold">{labels[mode]}</h2></div><Button variant="ghost" size="icon" onClick={onClose}><X /></Button></div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-xs font-medium">{mode === "idea" ? "Idea" : mode === "task" ? "Task" : "Project name"}<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" placeholder={mode === "project" ? "e.g. Shop scheduler" : "What needs attention?"} /></label>
            {mode === "project" && <><label className="block text-xs font-medium">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-24 w-full resize-none rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary/50" placeholder="What is this project for?" /></label><label className="block text-xs font-medium">Workspace<select value={kind} onChange={(event) => setKind(event.target.value as ProjectKind)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm">{["Software", "CNC", "Business", "Experiment"].map((item) => <option key={item}>{item}</option>)}</select></label></>}
            {mode === "task" && projects.length > 0 && <label className="block text-xs font-medium">Project (optional)<select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"><option value="">General</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>}
            {mode === "task" && <div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-medium">Priority<select value={priority} onChange={(event) => setPriority(event.target.value as Task["priority"])} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm">{["Low", "Medium", "High"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="block text-xs font-medium">Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label></div>}
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit"><Plus />Save</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskEditor({ task, projects, onClose, onSave }: { task: Task; projects: Project[]; onClose: () => void; onSave: (task: Task) => void }) {
  const [draft, setDraft] = useState(task);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><Card className="w-full max-w-lg shadow-2xl"><CardContent className="p-6"><div className="mb-6 flex items-center justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">Task controls</div><h2 className="mt-1 text-xl font-semibold">Edit task</h2></div><Button variant="ghost" size="icon" onClick={onClose}><X /></Button></div><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!draft.title.trim()) return; onSave({ ...draft, title: draft.title.trim() }); onClose(); }}><label className="block text-xs font-medium">Task<input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" /></label><label className="block text-xs font-medium">Notes<textarea value={draft.notes ?? ""} onChange={(event) => setDraft({ ...draft, notes: event.target.value || undefined })} className="mt-2 min-h-20 w-full resize-none rounded-md border border-border bg-background p-3 text-sm outline-none" placeholder="Context, acceptance criteria, or useful details" /></label><div className="grid gap-4 sm:grid-cols-3"><label className="block text-xs font-medium">Project<select value={draft.projectId ?? ""} onChange={(event) => setDraft({ ...draft, projectId: event.target.value || undefined })} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"><option value="">General</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="block text-xs font-medium">Priority<select value={draft.priority ?? "Medium"} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Task["priority"] })} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm">{["Low", "Medium", "High"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="block text-xs font-medium">Due<input type="date" value={draft.dueDate ?? ""} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value || undefined })} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" /></label></div><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit"><CheckCircle2 />Save task</Button></div></form></CardContent></Card></div>;
}

function ProjectCard({ project, intelligence, onDelete, onEdit }: { project: Project; intelligence?: ProjectIntelligence; onDelete: () => void; onEdit: () => void }) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl">
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r", accentStyles[project.accent])} />
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><span className={cn("h-1.5 w-1.5 rounded-full", project.status === "Active" ? "bg-emerald-400" : "bg-muted-foreground/50")} />{project.eyebrow}</div><h3 className="text-lg font-semibold tracking-tight">{project.name}</h3></div><div className="flex"><Button size="icon" variant="ghost" aria-label={`Edit ${project.name}`} onClick={onEdit}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${project.name}`} onClick={onDelete}><Trash2 /></Button></div></div>
        <p className="min-h-12 text-sm leading-6 text-muted-foreground">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5"><Badge className={statusStyles[project.status]}>{project.status}</Badge>{project.stack.map((item) => <Badge key={item} className="border-border bg-secondary/70 text-muted-foreground">{item}</Badge>)}</div>
        <div className="mt-6 border-t border-border/70 pt-4"><div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground"><span>Momentum</span><span>{project.progress}%</span></div><div className="h-1 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full rounded-full bg-gradient-to-r", accentStyles[project.accent])} style={{ width: `${project.progress}%` }} /></div></div>
        <div className="mt-4 rounded-lg border border-border/60 bg-background/50 p-3 text-xs leading-5 text-muted-foreground"><span className="mr-1.5 font-semibold text-foreground">Next:</span>{project.note}</div>
        {(project.repo || project.deployment) && <div className="mt-3 space-y-2 rounded-lg border border-border/60 bg-background/40 p-3">
          {project.repo && <div className="flex items-start gap-2 text-[11px]"><GitCommitHorizontal className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /><div className="min-w-0 flex-1">{intelligence?.github?.latestCommit ? <><a className="block truncate font-medium hover:text-primary" href={intelligence.github.latestCommit.url} target="_blank" rel="noreferrer">{intelligence.github.latestCommit.message}</a><span className="font-mono text-[9px] text-muted-foreground">{intelligence.github.latestCommit.sha} · {intelligence.github.defaultBranch}</span></> : <span className="text-muted-foreground">{intelligence ? "Repository unavailable" : "Checking repository…"}</span>}</div></div>}
          {project.deployment && <div className="flex items-center gap-2 text-[11px]"><Cloud className="size-3.5 text-muted-foreground" /><span className="text-muted-foreground">Deployment</span><span className={cn("ml-auto flex items-center gap-1.5 font-medium", intelligence?.vercel?.reachable ? "text-emerald-500" : intelligence ? "text-amber-500" : "text-muted-foreground")}><span className={cn("size-1.5 rounded-full", intelligence?.vercel?.reachable ? "bg-emerald-400" : "bg-muted-foreground/40")} />{intelligence?.vercel?.state ?? (intelligence?.vercel?.reachable ? "ONLINE" : intelligence ? "UNAVAILABLE" : "CHECKING")}</span></div>}
        </div>}
        <div className="mt-auto flex items-center justify-between pt-5"><span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground"><Clock3 className="size-3" />{project.updatedLabel}</span><div className="flex gap-1">{project.repo && <Button asChild size="icon" variant="ghost"><a href={project.repo} target="_blank" rel="noreferrer"><Github /></a></Button>}{project.deployment && <Button asChild size="icon" variant="ghost"><a href={project.deployment} target="_blank" rel="noreferrer"><ArrowUpRight /></a></Button>}</div></div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"All" | ProjectKind>("All");
  const [composer, setComposer] = useState<ComposerMode>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskView, setTaskView] = useState<TaskView>("Today");
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const [intelligence, setIntelligence] = useState<Record<string, ProjectIntelligence>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const [lastSnapshotAt, setLastSnapshotAt] = useState<string | null>(null);
  const [snapshotting, setSnapshotting] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const saved = localStorage.getItem(workspaceStorageKey);
      const localWorkspace: Workspace = saved ? JSON.parse(saved) : emptyWorkspace;
      try {
        const response = await fetch("/api/workspace", { cache: "no-store" });
        if (!response.ok) throw new Error("Cloud read failed");
        const payload = await response.json() as { workspace: Workspace | null; lastSnapshotAt?: string | null };
        if (cancelled) return;
        if (payload.workspace) {
          setWorkspace(payload.workspace);
          localStorage.setItem(workspaceStorageKey, JSON.stringify(payload.workspace));
        } else {
          setWorkspace(localWorkspace);
          if (localWorkspace.projects.length || localWorkspace.tasks.length || localWorkspace.activity.length) {
            await fetch("/api/workspace", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localWorkspace) });
          }
        }
        setLastSnapshotAt(payload.lastSnapshotAt ?? null);
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
    const timer = window.setTimeout(async () => {
      setSyncState("saving");
      try {
        const response = await fetch("/api/workspace", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(workspace) });
        if (!response.ok) throw new Error("Cloud write failed");
        setSyncState("saved");
      } catch {
        setSyncState("offline");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [ready, workspace]);

  const refreshIntelligence = useCallback(async () => {
    const linked = workspace.projects.filter((project) => project.repo || project.deployment);
    if (!linked.length) return;
    setRefreshing(true);
    const results = await Promise.all(linked.map(async (project) => {
      const params = new URLSearchParams();
      if (project.repo) params.set("repo", project.repo);
      if (project.deployment) params.set("deployment", project.deployment);
      const response = await fetch(`/api/project-status?${params}`, { cache: "no-store" });
      return [project.id, response.ok ? await response.json() as ProjectIntelligence : null] as const;
    }));
    setIntelligence((current) => ({ ...current, ...Object.fromEntries(results.filter((entry): entry is readonly [string, ProjectIntelligence] => Boolean(entry[1]))) }));
    setRefreshing(false);
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
  function addTask(title: string, projectId?: string, priority: Task["priority"] = "Medium", dueDate?: string) { setWorkspace((current) => ({ ...current, tasks: [{ id: crypto.randomUUID(), title, projectId, priority, dueDate, done: false, createdAt: new Date().toISOString() }, ...current.tasks], activity: [record(`Added task · ${title}`), ...current.activity].slice(0, 30) })); }
  function addIdea(idea: string) { addTask(`Idea: ${idea}`); setWorkspace((current) => ({ ...current, activity: [record(`Captured idea · ${idea}`), ...current.activity].slice(0, 30) })); }
  function toggleTask(id: string) { setWorkspace((current) => { const task = current.tasks.find((item) => item.id === id); return { ...current, tasks: current.tasks.map((item) => item.id === id ? { ...item, done: !item.done } : item), activity: task ? [record(`${task.done ? "Reopened" : "Completed"} task · ${task.title}`), ...current.activity].slice(0, 30) : current.activity }; }); }
  function deleteProject(id: string) { const project = workspace.projects.find((item) => item.id === id); if (!project) return; setConfirmation({ title: `Delete ${project.name}?`, message: "The project will be removed and its tasks moved to General. You can undo this briefly afterward.", actionLabel: "Delete project", onConfirm: () => { setUndo({ label: `Deleted ${project.name}`, workspace }); setWorkspace((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== id), tasks: current.tasks.map((task) => task.projectId === id ? { ...task, projectId: undefined } : task), activity: [record(`Removed project · ${project.name}`), ...current.activity].slice(0, 30) })); } }); }
  function updateProject(project: Project) { setWorkspace((current) => ({ ...current, projects: current.projects.map((item) => item.id === project.id ? project : item), activity: [record(`Updated project · ${project.name}`), ...current.activity].slice(0, 30) })); }
  function updateTask(task: Task) { setWorkspace((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === task.id ? task : item), activity: [record(`Updated task · ${task.title}`), ...current.activity].slice(0, 30) })); }
  function deleteTask(id: string) { const task = workspace.tasks.find((item) => item.id === id); if (!task) return; setConfirmation({ title: "Delete this task?", message: `“${task.title}” will be removed. You can undo this briefly afterward.`, actionLabel: "Delete task", onConfirm: () => { setUndo({ label: `Deleted ${task.title}`, workspace }); setWorkspace((current) => ({ ...current, tasks: current.tasks.filter((item) => item.id !== id), activity: [record(`Removed task · ${task.title}`), ...current.activity].slice(0, 30) })); } }); }

  function exportWorkspace() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), workspace }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `work-ctrl-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importWorkspace(file: File) {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const incoming: unknown = parsed && typeof parsed === "object" && "workspace" in parsed ? (parsed as { workspace?: unknown }).workspace : parsed;
      if (!isWorkspaceData(incoming)) throw new Error("Invalid backup");
      setConfirmation({ title: "Restore this backup?", message: "The current workspace will be replaced by the imported projects, tasks, and activity. You can undo this briefly afterward.", actionLabel: "Restore backup", onConfirm: () => { setUndo({ label: "Restored backup", workspace }); setWorkspace(incoming); } });
    } catch { setConfirmation({ title: "Backup not recognized", message: "Choose a JSON backup exported from WORK//CTRL.", actionLabel: "Close", onConfirm: () => undefined }); }
    if (importInputRef.current) importInputRef.current.value = "";
  }

  async function createSnapshot() {
    setSnapshotting(true);
    try { const response = await fetch("/api/workspace", { method: "POST" }); const payload = await response.json() as { createdAt?: string }; if (!response.ok || !payload.createdAt) throw new Error(); setLastSnapshotAt(payload.createdAt); }
    finally { setSnapshotting(false); }
  }

  function resetWorkspace() { setConfirmation({ title: "Reset the entire workspace?", message: "All projects, tasks, ideas, and activity will be cleared. Export a backup or create a snapshot first. You can undo this briefly afterward.", actionLabel: "Reset workspace", onConfirm: () => { setUndo({ label: "Reset workspace", workspace }); setWorkspace(emptyWorkspace); } }); }

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
    ...workspace.projects.map((project) => ({ id: `project-${project.id}`, section: "Projects", label: project.name, hint: `Edit · ${project.status}`, icon: <CircleDot />, run: () => setEditingProject(project) })),
  ];
  const filteredCommands = commandActions.filter((action) => `${action.label} ${action.hint} ${action.section}`.toLowerCase().includes(commandQuery.toLowerCase()));
  const commandSections = [...new Set(filteredCommands.map((action) => action.section))];

  const filtered = useMemo(() => workspace.projects.filter((project) => (kind === "All" || project.kind === kind) && `${project.name} ${project.description} ${project.stack.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [kind, query, workspace.projects]);
  const openTasks = workspace.tasks.filter((task) => !task.done).length;
  const today = new Date().toISOString().slice(0, 10);
  const overdueTasks = workspace.tasks.filter((task) => !task.done && task.dueDate && task.dueDate < today);
  const highPriorityTasks = workspace.tasks.filter((task) => !task.done && task.priority === "High");
  const focusTasks = [...workspace.tasks].filter((task) => !task.done).sort((a, b) => {
    const dueA = a.dueDate ?? "9999-12-31";
    const dueB = b.dueDate ?? "9999-12-31";
    if (dueA !== dueB) return dueA.localeCompare(dueB);
    return ({ High: 0, Medium: 1, Low: 2 }[a.priority ?? "Medium"] - { High: 0, Medium: 1, Low: 2 }[b.priority ?? "Medium"]);
  }).slice(0, 3);
  const stalledProjects = workspace.projects.filter((project) => project.status !== "Shipped" && new Date(today).getTime() - new Date(project.updatedAt).getTime() > 14 * 24 * 60 * 60 * 1000);
  const averageMomentum = workspace.projects.length ? Math.round(workspace.projects.reduce((sum, project) => sum + project.progress, 0) / workspace.projects.length) : 0;
  const visibleTasks = workspace.tasks.filter((task) => {
    if (taskView === "All") return true;
    if (taskView === "Today") return !task.done && Boolean(task.dueDate && task.dueDate <= today);
    return !task.done && (!task.dueDate || task.dueDate > today);
  }).sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.priority ?? "Medium"] - { High: 0, Medium: 1, Low: 2 }[b.priority ?? "Medium"]));
  const taskGroups = visibleTasks.reduce<Record<string, Task[]>>((groups, task) => { const name = workspace.projects.find((project) => project.id === task.projectId)?.name ?? "General"; (groups[name] ??= []).push(task); return groups; }, {});
  const kinds: Array<"All" | ProjectKind> = ["All", "Software", "CNC", "Business", "Experiment"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {composer && <Composer mode={composer} projects={workspace.projects} onClose={() => setComposer(null)} onProject={addProject} onTask={addTask} onIdea={addIdea} />}
      {editingProject && <ProjectEditor project={editingProject} onClose={() => setEditingProject(null)} onSave={updateProject} />}
      {editingTask && <TaskEditor task={editingTask} projects={workspace.projects} onClose={() => setEditingTask(null)} onSave={updateTask} />}
      {confirmation && <ConfirmDialog confirmation={confirmation} onClose={() => setConfirmation(null)} />}
      {commandOpen && <div className="fixed inset-0 z-[55] flex justify-center bg-background/75 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setCommandOpen(false)}><Card className="h-fit w-full max-w-xl overflow-hidden shadow-2xl"><div className="flex items-center gap-3 border-b border-border px-4"><Search className="size-4 text-muted-foreground" /><input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Type a command or search projects…" className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none" /><kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">ESC</kbd></div><div className="max-h-[55vh] overflow-y-auto p-2">{filteredCommands.length ? commandSections.map((section) => <div key={section} className="mb-2"><div className="px-2 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{section}</div>{filteredCommands.filter((action) => action.section === section).map((action) => <button key={action.id} onClick={() => { action.run(); setCommandOpen(false); setCommandQuery(""); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent"><span className="text-muted-foreground [&_svg]:size-4">{action.icon}</span><span className="min-w-0 flex-1 truncate text-sm">{action.label}</span><span className="text-[10px] text-muted-foreground">{action.hint}</span><CornerDownLeft className="size-3 text-muted-foreground/50" /></button>)}</div>) : <div className="grid min-h-32 place-items-center text-sm text-muted-foreground">No matching commands</div>}</div><div className="flex items-center gap-4 border-t border-border bg-secondary/30 px-4 py-2 font-mono text-[9px] text-muted-foreground"><span className="flex items-center gap-1"><Keyboard className="size-3" />Ctrl/⌘ K</span><span>Alt N · task</span><span>Alt I · idea</span></div></Card></div>}
      {undo && <div className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-xs shadow-2xl"><span>{undo.label}</span><Button size="sm" variant="ghost" className="text-primary" onClick={() => { setWorkspace(undo.workspace); setUndo(null); }}>Undo</Button><button onClick={() => setUndo(null)} aria-label="Dismiss"><X className="size-3.5 text-muted-foreground" /></button></div>}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_-10%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card/30 p-4 backdrop-blur lg:flex">
          <div className="flex h-14 items-center gap-3 px-2"><div className="grid size-9 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary"><Command className="size-5" /></div><div><div className="text-sm font-bold tracking-tight">WORK//CTRL</div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Project operating system</div></div></div>
          <nav className="mt-8 space-y-1 text-sm"><a className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 font-medium text-primary" href="#"><LayoutDashboard className="size-4" />Command center</a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#projects"><Grid2X2 className="size-4" />Projects<span className="ml-auto font-mono text-[10px]">{workspace.projects.length}</span></a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#tasks"><ListChecks className="size-4" />Tasks<span className="ml-auto font-mono text-[10px]">{openTasks}</span></a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#activity"><Activity className="size-4" />Activity</a></nav>
          <div className="mt-auto rounded-xl border border-border bg-background/60 p-3"><div className="mb-2 flex items-center gap-2 text-xs font-medium"><TerminalSquare className="size-4 text-primary" />Cloud workspace</div><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"><span className={cn("size-1.5 rounded-full", syncState === "saved" ? "bg-emerald-400" : syncState === "offline" ? "bg-amber-400" : "animate-pulse bg-primary")} />{syncState === "loading" ? "Loading cloud data" : syncState === "saving" ? "Saving changes" : syncState === "offline" ? "Offline · Saved locally" : "Synced across devices"}</div></div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-16 sm:px-6 xl:px-10">
          <header className="flex h-20 items-center justify-between border-b border-border/60"><div className="flex items-center gap-2 text-xs text-muted-foreground"><CircleDot className={cn("size-3", syncState === "offline" ? "text-amber-400" : "text-emerald-400")} /><span className="hidden sm:inline">{syncState === "offline" ? "Working offline" : syncState === "saving" ? "Saving…" : "Workspace ready"}</span></div><div className="flex items-center gap-2"><Button variant="outline" className="hidden text-muted-foreground md:flex" onClick={() => setCommandOpen(true)}><Search />Commands <kbd className="ml-4 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px]">Ctrl K</kbd></Button><Button variant="outline" size="icon" onClick={() => void refreshIntelligence()} aria-label="Refresh project status"><RefreshCw className={cn(refreshing && "animate-spin")} /></Button><ThemeToggle /><Button onClick={() => setComposer("project")}><Plus />New project</Button></div></header>

          <section className="py-10"><div className="mb-8"><div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Personal operations</div><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Build what matters next.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Projects, tasks, ideas, and movement—captured in one clean operating view.</p></div><div className="grid gap-3 sm:grid-cols-3"><Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Projects</div><div className="mt-1 text-2xl font-semibold">{workspace.projects.length}</div></div><Grid2X2 className="size-5 text-primary" /></CardContent></Card><Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Open tasks</div><div className="mt-1 text-2xl font-semibold">{openTasks}</div></div><ListChecks className="size-5 text-amber-400" /></CardContent></Card><Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Signals logged</div><div className="mt-1 text-2xl font-semibold">{workspace.activity.length}</div></div><Activity className="size-5 text-emerald-400" /></CardContent></Card></div></section>

          <section id="focus" className="mb-10 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
            <Card><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><div><div className="mb-1 flex items-center gap-2"><Target className="size-4 text-primary" /><h2 className="text-sm font-semibold">Focus briefing</h2></div><p className="text-xs text-muted-foreground">The three most time-sensitive open actions.</p></div><Badge className="border-primary/20 bg-primary/10 text-primary">{focusTasks.length} queued</Badge></div>{focusTasks.length ? <div className="space-y-2">{focusTasks.map((task, index) => { const overdue = Boolean(task.dueDate && task.dueDate < today); const project = workspace.projects.find((item) => item.id === task.projectId); return <div key={task.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/45 p-3"><button onClick={() => toggleTask(task.id)} className="grid size-7 shrink-0 place-items-center rounded-full border border-border font-mono text-[10px] text-muted-foreground hover:border-primary hover:text-primary">{index + 1}</button><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{task.title}</div><div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">{project && <span>{project.name}</span>}<span className={cn(overdue && "text-red-500")}>{task.dueDate ? `${overdue ? "Overdue" : "Due"} ${new Date(`${task.dueDate}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : "No deadline"}</span></div></div><Badge className={cn("border-border", task.priority === "High" ? "border-red-500/20 bg-red-500/10 text-red-500" : "bg-secondary text-muted-foreground")}>{task.priority ?? "Medium"}</Badge><Button variant="ghost" size="icon" onClick={() => setEditingTask(task)}><Pencil /></Button></div>})}</div> : <div className="grid min-h-32 place-items-center text-center"><div><CheckCircle2 className="mx-auto mb-2 size-6 text-emerald-400" /><div className="text-sm font-medium">The runway is clear</div><div className="mt-1 text-xs text-muted-foreground">Add a task when the next move becomes clear.</div></div></div>}</CardContent></Card>
            <Card><CardContent className="p-5"><div className="mb-5"><h2 className="text-sm font-semibold">Pressure map</h2><p className="mt-1 text-xs text-muted-foreground">Signals that may need intervention.</p></div><div className="space-y-3"><div className="flex items-center justify-between rounded-lg bg-background/45 p-3"><div className="flex items-center gap-2 text-xs"><Flame className="size-4 text-red-500" />Overdue tasks</div><span className="font-mono text-sm font-semibold">{overdueTasks.length}</span></div><div className="flex items-center justify-between rounded-lg bg-background/45 p-3"><div className="flex items-center gap-2 text-xs"><AlertCircle className="size-4 text-amber-500" />High priority</div><span className="font-mono text-sm font-semibold">{highPriorityTasks.length}</span></div><div className="flex items-center justify-between rounded-lg bg-background/45 p-3"><div className="flex items-center gap-2 text-xs"><Clock3 className="size-4 text-violet-400" />Stalled projects</div><span className="font-mono text-sm font-semibold">{stalledProjects.length}</span></div><div className="flex items-center justify-between rounded-lg bg-background/45 p-3"><div className="flex items-center gap-2 text-xs"><Gauge className="size-4 text-emerald-400" />Avg. momentum</div><span className="font-mono text-sm font-semibold">{averageMomentum}%</span></div></div>{stalledProjects.length > 0 && <div className="mt-4 border-t border-border pt-3"><div className="mb-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Needs a pulse</div><div className="flex flex-wrap gap-1.5">{stalledProjects.slice(0, 4).map((project) => <button key={project.id} onClick={() => setEditingProject(project)}><Badge className="border-border bg-secondary text-muted-foreground hover:text-foreground">{project.name}</Badge></button>)}</div></div>}</CardContent></Card>
          </section>

          <section id="projects"><div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-base font-semibold">Project grid</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} projects visible</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none sm:w-64" /></label><div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1"><ListFilter className="mx-2 size-3.5 shrink-0 text-muted-foreground" />{kinds.map((item) => <button key={item} onClick={() => setKind(item)} className={cn("rounded-md px-2.5 py-1.5 text-xs transition", kind === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>{item}</button>)}</div></div></div>
            {filtered.length ? <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{filtered.map((project) => <ProjectCard key={project.id} project={project} intelligence={intelligence[project.id]} onEdit={() => setEditingProject(project)} onDelete={() => deleteProject(project.id)} />)}</div> : <Card><CardContent className="grid min-h-64 place-items-center text-center"><div><Sparkles className="mx-auto mb-3 size-7 text-primary" /><h3 className="font-medium">Clean slate</h3><p className="mt-1 text-sm text-muted-foreground">Create your first project when you&apos;re ready.</p><Button className="mt-5" onClick={() => setComposer("project")}><Plus />New project</Button></div></CardContent></Card>}
          </section>

          <section className="mt-10 grid gap-4 xl:grid-cols-[1.15fr_1fr]">
            <Card id="tasks"><CardContent className="p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Tasks</h2><p className="mt-1 text-xs text-muted-foreground">Small, concrete next actions.</p></div><Button size="sm" variant="outline" onClick={() => setComposer("task")}><Plus />Add task</Button></div><div className="mb-4 flex gap-1 rounded-lg border border-border bg-background/50 p-1">{(["Today", "Next", "All"] as TaskView[]).map((view) => <button key={view} onClick={() => setTaskView(view)} className={cn("flex-1 rounded-md px-3 py-1.5 text-xs transition", taskView === view ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>{view}</button>)}</div>{visibleTasks.length ? <div className="space-y-5">{Object.entries(taskGroups).map(([group, tasks]) => <div key={group}><div className="mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{group}</div><div className="space-y-1">{tasks.map((task) => { const overdue = !task.done && Boolean(task.dueDate && task.dueDate < today); return <div key={task.id} className="group/task flex items-center gap-2 rounded-lg px-2 py-2.5 hover:bg-accent/50"><button onClick={() => toggleTask(task.id)} aria-label={task.done ? "Reopen task" : "Complete task"}>{task.done ? <CheckCircle2 className="size-4 shrink-0 text-emerald-400" /> : <Square className="size-4 shrink-0 text-muted-foreground" />}</button><div className="min-w-0 flex-1"><div className={cn("truncate text-xs", task.done && "text-muted-foreground line-through")}>{task.title}</div>{task.notes && <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{task.notes}</div>}</div><Badge className={cn("border-border", task.priority === "High" ? "border-red-500/20 bg-red-500/10 text-red-500" : task.priority === "Low" ? "bg-secondary text-muted-foreground" : "border-amber-500/20 bg-amber-500/10 text-amber-500")}>{task.priority ?? "Medium"}</Badge>{task.dueDate && <span className={cn("flex items-center gap-1 font-mono text-[9px]", overdue ? "text-red-500" : "text-muted-foreground")}>{overdue ? <AlertCircle className="size-3" /> : <CalendarDays className="size-3" />}{task.dueDate.slice(5)}</span>}<Button size="icon" variant="ghost" className="size-7 opacity-0 group-hover/task:opacity-100" onClick={() => setEditingTask(task)}><Pencil /></Button><Button size="icon" variant="ghost" className="size-7 opacity-0 group-hover/task:opacity-100" onClick={() => deleteTask(task.id)}><Trash2 /></Button></div>})}</div></div>)}</div> : <div className="grid min-h-32 place-items-center text-center text-xs text-muted-foreground">{taskView === "Today" ? "Nothing due today. You're clear." : taskView === "Next" ? "No upcoming tasks." : "No tasks yet. Add one useful next action."}</div>}</CardContent></Card>
            <Card><CardContent className="p-5"><div className="mb-5 flex items-center gap-2"><Sparkles className="size-4 text-violet-400" /><h2 className="text-sm font-semibold">Quick launch</h2></div><div className="grid grid-cols-2 gap-2"><Button variant="outline" className="h-auto justify-start p-3" asChild><a href="https://github.com/4twentydev" target="_blank" rel="noreferrer"><Github />GitHub <ExternalLink className="ml-auto size-3" /></a></Button><Button variant="outline" className="h-auto justify-start p-3" asChild><a href="https://vercel.com/4twentydev" target="_blank" rel="noreferrer"><Rocket />Vercel <ExternalLink className="ml-auto size-3" /></a></Button><Button variant="outline" className="h-auto justify-start p-3" onClick={() => setComposer("task")}><ListChecks />New task</Button><Button variant="outline" className="h-auto justify-start p-3" onClick={() => setComposer("idea")}><Lightbulb />Capture idea</Button></div></CardContent></Card>
          </section>

          <section id="activity" className="mt-4"><Card><CardContent className="p-5"><div className="mb-5"><h2 className="text-sm font-semibold">Activity</h2><p className="mt-1 text-xs text-muted-foreground">An automatic trail of meaningful workspace changes.</p></div>{workspace.activity.length ? <div className="space-y-1">{workspace.activity.map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-accent/50"><div className={cn("size-2 rounded-full", index === 0 ? "bg-emerald-400" : "bg-muted-foreground/40")} /><span className="min-w-0 flex-1 truncate text-xs">{item.message}</span><span className="shrink-0 font-mono text-[9px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span></div>)}</div> : <div className="grid min-h-28 place-items-center text-xs text-muted-foreground">Activity appears as you work.</div>}</CardContent></Card></section>
          <section className="mt-4"><Card><CardContent className="p-5"><div className="mb-5"><h2 className="text-sm font-semibold">Data safety</h2><p className="mt-1 text-xs text-muted-foreground">Portable backups and recoverable workspace controls.</p></div><input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importWorkspace(file); }} /><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><Button variant="outline" className="justify-start" onClick={exportWorkspace}><Download />Export JSON</Button><Button variant="outline" className="justify-start" onClick={() => importInputRef.current?.click()}><Upload />Import backup</Button><Button variant="outline" className="justify-start" onClick={() => void createSnapshot()} disabled={snapshotting}><DatabaseBackup className={cn(snapshotting && "animate-pulse")} />Cloud snapshot</Button><Button variant="outline" className="justify-start text-red-500 hover:text-red-500" onClick={resetWorkspace}><RotateCcw />Reset workspace</Button></div><div className="mt-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{lastSnapshotAt ? `Last cloud snapshot · ${new Date(lastSnapshotAt).toLocaleString()}` : "No cloud snapshot yet"}</div></CardContent></Card></section>
        </main>
      </div>
    </div>
  );
}
