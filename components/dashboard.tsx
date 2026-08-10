"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowUpRight, CheckCircle2, CircleDot, Clock3, Command, ExternalLink,
  Github, Grid2X2, LayoutDashboard, Lightbulb, ListChecks, ListFilter, Pencil,
  Plus, Rocket, Search, Sparkles, Square, TerminalSquare, Trash2, X,
} from "lucide-react";
import type { Project, ProjectKind, ProjectStatus } from "@/lib/projects";
import { emptyWorkspace, workspaceStorageKey, type Workspace } from "@/lib/workspace";
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
  onTask: (title: string, projectId?: string) => void;
  onIdea: (idea: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<ProjectKind>("Software");
  const [projectId, setProjectId] = useState("");
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
    } else if (mode === "task") onTask(title.trim(), projectId || undefined);
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
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit"><Plus />Save</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectCard({ project, onDelete, onEdit }: { project: Project; onDelete: () => void; onEdit: () => void }) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl">
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r", accentStyles[project.accent])} />
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><span className={cn("h-1.5 w-1.5 rounded-full", project.status === "Active" ? "bg-emerald-400" : "bg-muted-foreground/50")} />{project.eyebrow}</div><h3 className="text-lg font-semibold tracking-tight">{project.name}</h3></div><div className="flex"><Button size="icon" variant="ghost" aria-label={`Edit ${project.name}`} onClick={onEdit}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${project.name}`} onClick={onDelete}><Trash2 /></Button></div></div>
        <p className="min-h-12 text-sm leading-6 text-muted-foreground">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5"><Badge className={statusStyles[project.status]}>{project.status}</Badge>{project.stack.map((item) => <Badge key={item} className="border-border bg-secondary/70 text-muted-foreground">{item}</Badge>)}</div>
        <div className="mt-6 border-t border-border/70 pt-4"><div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground"><span>Momentum</span><span>{project.progress}%</span></div><div className="h-1 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full rounded-full bg-gradient-to-r", accentStyles[project.accent])} style={{ width: `${project.progress}%` }} /></div></div>
        <div className="mt-4 rounded-lg border border-border/60 bg-background/50 p-3 text-xs leading-5 text-muted-foreground"><span className="mr-1.5 font-semibold text-foreground">Next:</span>{project.note}</div>
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

  useEffect(() => {
    const saved = localStorage.getItem(workspaceStorageKey);
    queueMicrotask(() => { setWorkspace(saved ? JSON.parse(saved) : emptyWorkspace); setReady(true); });
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(workspaceStorageKey, JSON.stringify(workspace)); }, [ready, workspace]);

  function record(message: string) {
    return { id: crypto.randomUUID(), message, createdAt: new Date().toISOString() };
  }
  function addProject(project: Project) { setWorkspace((current) => ({ ...current, projects: [project, ...current.projects], activity: [record(`Created project · ${project.name}`), ...current.activity].slice(0, 30) })); }
  function addTask(title: string, projectId?: string) { setWorkspace((current) => ({ ...current, tasks: [{ id: crypto.randomUUID(), title, projectId, done: false, createdAt: new Date().toISOString() }, ...current.tasks], activity: [record(`Added task · ${title}`), ...current.activity].slice(0, 30) })); }
  function addIdea(idea: string) { addTask(`Idea: ${idea}`); setWorkspace((current) => ({ ...current, activity: [record(`Captured idea · ${idea}`), ...current.activity].slice(0, 30) })); }
  function toggleTask(id: string) { setWorkspace((current) => { const task = current.tasks.find((item) => item.id === id); return { ...current, tasks: current.tasks.map((item) => item.id === id ? { ...item, done: !item.done } : item), activity: task ? [record(`${task.done ? "Reopened" : "Completed"} task · ${task.title}`), ...current.activity].slice(0, 30) : current.activity }; }); }
  function deleteProject(id: string) { setWorkspace((current) => { const project = current.projects.find((item) => item.id === id); return { ...current, projects: current.projects.filter((item) => item.id !== id), tasks: current.tasks.map((task) => task.projectId === id ? { ...task, projectId: undefined } : task), activity: project ? [record(`Removed project · ${project.name}`), ...current.activity].slice(0, 30) : current.activity }; }); }
  function updateProject(project: Project) { setWorkspace((current) => ({ ...current, projects: current.projects.map((item) => item.id === project.id ? project : item), activity: [record(`Updated project · ${project.name}`), ...current.activity].slice(0, 30) })); }

  const filtered = useMemo(() => workspace.projects.filter((project) => (kind === "All" || project.kind === kind) && `${project.name} ${project.description} ${project.stack.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [kind, query, workspace.projects]);
  const openTasks = workspace.tasks.filter((task) => !task.done).length;
  const kinds: Array<"All" | ProjectKind> = ["All", "Software", "CNC", "Business", "Experiment"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {composer && <Composer mode={composer} projects={workspace.projects} onClose={() => setComposer(null)} onProject={addProject} onTask={addTask} onIdea={addIdea} />}
      {editingProject && <ProjectEditor project={editingProject} onClose={() => setEditingProject(null)} onSave={updateProject} />}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_-10%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card/30 p-4 backdrop-blur lg:flex">
          <div className="flex h-14 items-center gap-3 px-2"><div className="grid size-9 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary"><Command className="size-5" /></div><div><div className="text-sm font-bold tracking-tight">WORK//CTRL</div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Project operating system</div></div></div>
          <nav className="mt-8 space-y-1 text-sm"><a className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 font-medium text-primary" href="#"><LayoutDashboard className="size-4" />Command center</a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#projects"><Grid2X2 className="size-4" />Projects<span className="ml-auto font-mono text-[10px]">{workspace.projects.length}</span></a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#tasks"><ListChecks className="size-4" />Tasks<span className="ml-auto font-mono text-[10px]">{openTasks}</span></a><a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#activity"><Activity className="size-4" />Activity</a></nav>
          <div className="mt-auto rounded-xl border border-border bg-background/60 p-3"><div className="mb-2 flex items-center gap-2 text-xs font-medium"><TerminalSquare className="size-4 text-primary" />Local persistence</div><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Saved automatically · This browser</div></div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-16 sm:px-6 xl:px-10">
          <header className="flex h-20 items-center justify-between border-b border-border/60"><div className="flex items-center gap-2 text-xs text-muted-foreground"><CircleDot className="size-3 text-emerald-400" /><span className="hidden sm:inline">Workspace ready</span></div><div className="flex items-center gap-2"><ThemeToggle /><Button onClick={() => setComposer("project")}><Plus />New project</Button></div></header>

          <section className="py-10"><div className="mb-8"><div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Personal operations</div><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Build what matters next.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Projects, tasks, ideas, and movement—captured in one clean operating view.</p></div><div className="grid gap-3 sm:grid-cols-3"><Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Projects</div><div className="mt-1 text-2xl font-semibold">{workspace.projects.length}</div></div><Grid2X2 className="size-5 text-primary" /></CardContent></Card><Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Open tasks</div><div className="mt-1 text-2xl font-semibold">{openTasks}</div></div><ListChecks className="size-5 text-amber-400" /></CardContent></Card><Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Signals logged</div><div className="mt-1 text-2xl font-semibold">{workspace.activity.length}</div></div><Activity className="size-5 text-emerald-400" /></CardContent></Card></div></section>

          <section id="projects"><div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-base font-semibold">Project grid</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} projects visible</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none sm:w-64" /></label><div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1"><ListFilter className="mx-2 size-3.5 shrink-0 text-muted-foreground" />{kinds.map((item) => <button key={item} onClick={() => setKind(item)} className={cn("rounded-md px-2.5 py-1.5 text-xs transition", kind === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>{item}</button>)}</div></div></div>
            {filtered.length ? <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{filtered.map((project) => <ProjectCard key={project.id} project={project} onEdit={() => setEditingProject(project)} onDelete={() => deleteProject(project.id)} />)}</div> : <Card><CardContent className="grid min-h-64 place-items-center text-center"><div><Sparkles className="mx-auto mb-3 size-7 text-primary" /><h3 className="font-medium">Clean slate</h3><p className="mt-1 text-sm text-muted-foreground">Create your first project when you&apos;re ready.</p><Button className="mt-5" onClick={() => setComposer("project")}><Plus />New project</Button></div></CardContent></Card>}
          </section>

          <section className="mt-10 grid gap-4 xl:grid-cols-[1.15fr_1fr]">
            <Card id="tasks"><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Tasks</h2><p className="mt-1 text-xs text-muted-foreground">Small, concrete next actions.</p></div><Button size="sm" variant="outline" onClick={() => setComposer("task")}><Plus />Add task</Button></div>{workspace.tasks.length ? <div className="space-y-1">{workspace.tasks.map((task) => <button key={task.id} onClick={() => toggleTask(task.id)} className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-accent/50">{task.done ? <CheckCircle2 className="size-4 shrink-0 text-emerald-400" /> : <Square className="size-4 shrink-0 text-muted-foreground" />}<span className={cn("min-w-0 flex-1 truncate text-xs", task.done && "text-muted-foreground line-through")}>{task.title}</span>{task.projectId && <Badge className="border-border bg-secondary text-muted-foreground">{workspace.projects.find((project) => project.id === task.projectId)?.name ?? "General"}</Badge>}</button>)}</div> : <div className="grid min-h-32 place-items-center text-center text-xs text-muted-foreground">No tasks yet. Add one useful next action.</div>}</CardContent></Card>
            <Card><CardContent className="p-5"><div className="mb-5 flex items-center gap-2"><Sparkles className="size-4 text-violet-400" /><h2 className="text-sm font-semibold">Quick launch</h2></div><div className="grid grid-cols-2 gap-2"><Button variant="outline" className="h-auto justify-start p-3" asChild><a href="https://github.com/4twentydev" target="_blank" rel="noreferrer"><Github />GitHub <ExternalLink className="ml-auto size-3" /></a></Button><Button variant="outline" className="h-auto justify-start p-3" asChild><a href="https://vercel.com/4twentydev" target="_blank" rel="noreferrer"><Rocket />Vercel <ExternalLink className="ml-auto size-3" /></a></Button><Button variant="outline" className="h-auto justify-start p-3" onClick={() => setComposer("task")}><ListChecks />New task</Button><Button variant="outline" className="h-auto justify-start p-3" onClick={() => setComposer("idea")}><Lightbulb />Capture idea</Button></div></CardContent></Card>
          </section>

          <section id="activity" className="mt-4"><Card><CardContent className="p-5"><div className="mb-5"><h2 className="text-sm font-semibold">Activity</h2><p className="mt-1 text-xs text-muted-foreground">An automatic trail of meaningful workspace changes.</p></div>{workspace.activity.length ? <div className="space-y-1">{workspace.activity.map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-accent/50"><div className={cn("size-2 rounded-full", index === 0 ? "bg-emerald-400" : "bg-muted-foreground/40")} /><span className="min-w-0 flex-1 truncate text-xs">{item.message}</span><span className="shrink-0 font-mono text-[9px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span></div>)}</div> : <div className="grid min-h-28 place-items-center text-xs text-muted-foreground">Activity appears as you work.</div>}</CardContent></Card></section>
        </main>
      </div>
    </div>
  );
}
