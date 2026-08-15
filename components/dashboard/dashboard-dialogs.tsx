"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Github, Pencil, BookOpenCheck, DownloadCloud, Plus, RefreshCw, Rocket, Settings, Square, Trash2, X } from "lucide-react";
import type { Project, ProjectKind, ProjectStatus } from "@/lib/projects";
import type { Task, WeeklyReview, WorkspaceSettings } from "@/lib/workspace";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { IntegrationReport, ProjectIntelligence } from "@/lib/project-intelligence-client";
import type { ComposerMode, Confirmation, ImportCandidate } from "@/components/dashboard/dashboard-feature-types";
import { accentStyles, statusStyles } from "@/components/dashboard/dashboard-styles";

function integrationMessage(name: "GitHub" | "Vercel", report?: IntegrationReport) {
  if (!report || report.status === "ok" || report.status === "not_configured") return null;
  if (report.status === "rate_limited") return `${name} is rate-limited${report.rateLimit?.retryAfterSeconds ? `; retry in about ${report.rateLimit.retryAfterSeconds} seconds` : ""}.`;
  if (report.status === "unauthorized") return `${name} rejected the configured credentials.`;
  if (report.status === "timeout") return `${name} did not respond before the request deadline.`;
  if (report.status === "invalid_response") return `${name} returned an unexpected response.`;
  return `${name} is temporarily unavailable.`;
}

function ConfirmDialog({ confirmation, onClose }: { confirmation: Confirmation; onClose: () => void }) {
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><Card className="w-full max-w-md shadow-2xl"><CardContent className="p-6"><div className="mb-4 grid size-10 place-items-center rounded-full bg-red-500/10 text-red-500"><AlertCircle /></div><h2 className="text-lg font-semibold">{confirmation.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{confirmation.message}</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button className="bg-red-600 text-white shadow-none hover:bg-red-700" onClick={() => { confirmation.onConfirm(); onClose(); }}><Trash2 />{confirmation.actionLabel}</Button></div></CardContent></Card></div>;
}

function ProjectImportDialog({ existing, onClose, onImport }: { existing: Project[]; onClose: () => void; onImport: (candidates: ImportCandidate[]) => void }) {
  const [candidates, setCandidates] = useState<ImportCandidate[]>([]); const [selected, setSelected] = useState<Set<string>>(new Set()); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => { async function discover() { try { const response = await fetch("/api/project-import", { cache: "no-store" }); const payload = await response.json() as { candidates?: ImportCandidate[]; integrations?: { github?: IntegrationReport; vercel?: IntegrationReport } }; const githubMessage = integrationMessage("GitHub", payload.integrations?.github); if (!response.ok) { setError(githubMessage ?? "Project discovery is unavailable."); return; } const vercelMessage = integrationMessage("Vercel", payload.integrations?.vercel); setNotice(vercelMessage); const repos = new Set(existing.map((project) => project.repo)); setCandidates((payload.candidates ?? []).filter((candidate) => !repos.has(candidate.repo))); } catch { setError("Project discovery is unavailable."); } finally { setLoading(false); } } void discover(); }, [existing]);
  function toggle(id: string) { setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  return <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><Card className="my-6 w-full max-w-2xl shadow-2xl"><CardContent className="p-6"><div className="mb-5 flex items-center justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">Connected discovery</div><h2 className="mt-1 text-xl font-semibold">Import projects</h2><p className="mt-1 text-xs text-muted-foreground">GitHub repositories matched with Vercel deployments.</p></div><Button variant="ghost" size="icon" onClick={onClose}><X /></Button></div>{notice && <div role="status" className="mb-4 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-500"><AlertCircle className="size-4 shrink-0" />{notice} GitHub repositories are still available to import.</div>}{loading ? <div className="grid min-h-56 place-items-center"><RefreshCw className="size-5 animate-spin text-primary" /></div> : error ? <div role="alert" className="grid min-h-56 place-items-center text-sm text-muted-foreground">{error}</div> : candidates.length ? <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">{candidates.map((candidate) => <button key={candidate.id} onClick={() => toggle(candidate.id)} className={cn("flex w-full items-center gap-3 rounded-lg border p-3 text-left", selected.has(candidate.id) ? "border-primary/40 bg-primary/5" : "border-border hover:bg-accent/50")}><span className={cn("grid size-5 place-items-center rounded border", selected.has(candidate.id) ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{selected.has(candidate.id) && <CheckCircle2 className="size-3.5" />}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-sm font-medium">{candidate.name}</span>{candidate.private && <Badge className="border-border bg-secondary text-muted-foreground">Private</Badge>}{candidate.vercelProject && <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500">Vercel</Badge>}</div><p className="mt-1 truncate text-xs text-muted-foreground">{candidate.description}</p></div><span className="font-mono text-[9px] text-muted-foreground">{candidate.stack[0] ?? "Repo"}</span></button>)}</div> : <div className="grid min-h-56 place-items-center text-center text-sm text-muted-foreground">Every discovered repository is already tracked.</div>}<div className="mt-5 flex justify-end gap-2 border-t border-border pt-4"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={!selected.size} onClick={() => { onImport(candidates.filter((candidate) => selected.has(candidate.id))); onClose(); }}><DownloadCloud />Import {selected.size || "selected"}</Button></div></CardContent></Card></div>;
}

function SettingsDialog({ settings, onClose, onSave }: { settings: WorkspaceSettings; onClose: () => void; onSave: (settings: WorkspaceSettings) => void }) {
  const [draft, setDraft] = useState(settings);
  const inputClass = "mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50";
  return <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><Card className="my-6 w-full max-w-2xl shadow-2xl"><CardContent className="p-6"><div className="mb-6 flex items-center justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">Workspace configuration</div><h2 className="mt-1 text-xl font-semibold">Settings</h2><p className="mt-1 text-xs text-muted-foreground">Preferences sync across every signed-in device.</p></div><Button variant="ghost" size="icon" onClick={onClose}><X /></Button></div><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSave({ ...draft, staleProjectDays: Math.max(1, Number(draft.staleProjectDays) || 14) }); onClose(); }}><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium">Display name<input className={inputClass} value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></label><label className="text-xs font-medium">Timezone<select className={inputClass} value={draft.timezone} onChange={(event) => setDraft({ ...draft, timezone: event.target.value })}>{["America/Denver", "America/Los_Angeles", "America/Chicago", "America/New_York", "UTC"].map((zone) => <option key={zone}>{zone}</option>)}</select></label><label className="text-xs font-medium">GitHub username<input className={inputClass} value={draft.githubUsername} onChange={(event) => setDraft({ ...draft, githubUsername: event.target.value })} /></label><label className="text-xs font-medium">Vercel team slug<input className={inputClass} value={draft.vercelTeam} onChange={(event) => setDraft({ ...draft, vercelTeam: event.target.value })} /></label><label className="text-xs font-medium">Stalled after (days)<input className={inputClass} type="number" min="1" max="365" value={draft.staleProjectDays} onChange={(event) => setDraft({ ...draft, staleProjectDays: Number(event.target.value) })} /></label><label className="text-xs font-medium">Default task priority<select className={inputClass} value={draft.defaultTaskPriority} onChange={(event) => setDraft({ ...draft, defaultTaskPriority: event.target.value as Task["priority"] ?? "Medium" })}>{["Low", "Medium", "High"].map((priority) => <option key={priority}>{priority}</option>)}</select></label></div><div className="flex justify-end gap-2 pt-3"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit"><Settings />Save settings</Button></div></form></CardContent></Card></div>;
}

function WeeklyReviewDialog({ onClose, onSave }: { onClose: () => void; onSave: (review: WeeklyReview) => void }) {
  const [wins, setWins] = useState("");
  const [blockers, setBlockers] = useState("");
  const [lessons, setLessons] = useState("");
  const [nextPriorities, setNextPriorities] = useState("");
  const fieldClass = "mt-2 min-h-24 w-full resize-none rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary/50";
  return <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><Card className="my-6 w-full max-w-2xl shadow-2xl"><CardContent className="p-6"><div className="mb-6 flex items-center justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">Operating rhythm</div><h2 className="mt-1 text-xl font-semibold">Weekly review</h2><p className="mt-1 text-xs text-muted-foreground">Close the loop, clear the noise, choose the next moves.</p></div><Button variant="ghost" size="icon" onClick={onClose}><X /></Button></div><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (![wins, blockers, lessons, nextPriorities].some((value) => value.trim())) return; onSave({ id: crypto.randomUUID(), wins: wins.trim(), blockers: blockers.trim(), lessons: lessons.trim(), nextPriorities: nextPriorities.trim(), createdAt: new Date().toISOString() }); onClose(); }}><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium">Wins<textarea value={wins} onChange={(event) => setWins(event.target.value)} className={fieldClass} placeholder="What moved forward?" /></label><label className="text-xs font-medium">Blockers<textarea value={blockers} onChange={(event) => setBlockers(event.target.value)} className={fieldClass} placeholder="What created drag?" /></label><label className="text-xs font-medium">Lessons<textarea value={lessons} onChange={(event) => setLessons(event.target.value)} className={fieldClass} placeholder="What did you learn?" /></label><label className="text-xs font-medium">Next-week priorities<textarea value={nextPriorities} onChange={(event) => setNextPriorities(event.target.value)} className={fieldClass} placeholder="What must matter next?" /></label></div><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit"><BookOpenCheck />Complete review</Button></div></form></CardContent></Card></div>;
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

function ProjectWorkspace({ project, tasks, intelligence, onClose, onEdit, onAddTask, onToggleTask, onEditTask }: { project: Project; tasks: Task[]; intelligence?: ProjectIntelligence; onClose: () => void; onEdit: () => void; onAddTask: (title: string) => void; onToggleTask: (id: string) => void; onEditTask: (task: Task) => void }) {
  const [taskTitle, setTaskTitle] = useState("");
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const open = projectTasks.filter((task) => !task.done);
  const completed = projectTasks.filter((task) => task.done);
  const completion = projectTasks.length ? Math.round(completed.length / projectTasks.length * 100) : 0;
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-background/85 p-4 backdrop-blur-md" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="mx-auto my-6 max-w-4xl"><Card className="overflow-hidden shadow-2xl"><div className={cn("h-1 bg-gradient-to-r", accentStyles[project.accent])} /><CardContent className="p-6 sm:p-8"><div className="mb-8 flex items-start justify-between gap-4"><div><div className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-primary">{project.eyebrow} · Project workspace</div><h2 className="text-2xl font-semibold tracking-tight">{project.name}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{project.description}</p></div><div className="flex"><Button variant="ghost" size="icon" onClick={onEdit}><Pencil /></Button><Button variant="ghost" size="icon" onClick={onClose}><X /></Button></div></div><div className="mb-6 grid gap-3 sm:grid-cols-4"><div className="rounded-lg border border-border bg-background/45 p-3"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Status</div><Badge className={cn("mt-2", statusStyles[project.status])}>{project.status}</Badge></div><div className="rounded-lg border border-border bg-background/45 p-3"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Momentum</div><div className="mt-1 text-xl font-semibold">{project.progress}%</div></div><div className="rounded-lg border border-border bg-background/45 p-3"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Open tasks</div><div className="mt-1 text-xl font-semibold">{open.length}</div></div><div className="rounded-lg border border-border bg-background/45 p-3"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Task completion</div><div className="mt-1 text-xl font-semibold">{completion}%</div></div></div><div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]"><div><Card className="bg-background/35"><CardContent className="p-4"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Project tasks</h3><p className="mt-1 text-[10px] text-muted-foreground">Actions tied directly to this project.</p></div></div><form className="mb-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (!taskTitle.trim()) return; onAddTask(taskTitle.trim()); setTaskTitle(""); }}><input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Add a project task…" className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" /><Button size="sm" type="submit"><Plus />Add</Button></form>{projectTasks.length ? <div className="space-y-1">{projectTasks.map((task) => <div key={task.id} className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-accent/50"><button onClick={() => onToggleTask(task.id)}>{task.done ? <CheckCircle2 className="size-4 text-emerald-400" /> : <Square className="size-4 text-muted-foreground" />}</button><button onClick={() => onEditTask(task)} className={cn("min-w-0 flex-1 truncate text-left text-xs", task.done && "text-muted-foreground line-through")}>{task.title}</button><Badge className={cn("border-border", task.priority === "High" ? "border-red-500/20 bg-red-500/10 text-red-500" : "bg-secondary text-muted-foreground")}>{task.priority ?? "Medium"}</Badge>{task.dueDate && <span className="font-mono text-[9px] text-muted-foreground">{task.dueDate.slice(5)}</span>}</div>)}</div> : <div className="grid min-h-24 place-items-center text-xs text-muted-foreground">No project tasks yet.</div>}</CardContent></Card></div><div className="space-y-4"><div className="rounded-lg border border-border bg-background/45 p-4"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Next useful action</div><p className="mt-2 text-sm leading-6">{project.note}</p></div><div className="rounded-lg border border-border bg-background/45 p-4"><div className="mb-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Project links</div><div className="space-y-2">{project.repo ? <Button asChild variant="outline" className="w-full justify-start"><a href={project.repo} target="_blank" rel="noreferrer"><Github />Repository{intelligence?.github?.latestCommit && <span className="ml-auto font-mono text-[9px] text-muted-foreground">{intelligence.github.latestCommit.sha}</span>}</a></Button> : <div className="text-xs text-muted-foreground">No repository linked</div>}{project.deployment && <Button asChild variant="outline" className="w-full justify-start"><a href={project.deployment} target="_blank" rel="noreferrer"><Rocket />Deployment<span className={cn("ml-auto size-2 rounded-full", intelligence?.vercel?.reachable ? "bg-emerald-400" : "bg-muted-foreground")} /></a></Button>}</div></div>{project.stack.length > 0 && <div className="flex flex-wrap gap-1.5">{project.stack.map((item) => <Badge key={item} className="border-border bg-secondary text-muted-foreground">{item}</Badge>)}</div>}</div></div></CardContent></Card></div></div>;
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


export { Composer, ConfirmDialog, ProjectEditor, ProjectImportDialog, ProjectWorkspace, SettingsDialog, TaskEditor, WeeklyReviewDialog };
