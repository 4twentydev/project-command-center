"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle, ArrowUpRight, BarChart3, Bell, BellOff, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3,
  Cloud, GitPullRequest as CodePullRequest, GitCommitHorizontal, Github, Pencil, BookOpenCheck, CircleDotDashed,
  Plus, Send, Square, Trash2, TrendingUp,
} from "lucide-react";
import type { Project } from "@/lib/projects";
import type { ProjectNote, Task } from "@/lib/workspace";
import { cn } from "@/lib/utils";
import { addDaysToDateKey, dateKeyInTimeZone, weekdayLabelForDateKey } from "@/lib/date-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectIntelligenceEntry } from "@/lib/project-intelligence-client";
import { accentStyles, statusStyles } from "@/components/dashboard/dashboard-styles";

function decodeApplicationKey(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
}

function NotificationManager() {
  const [supported, setSupported] = useState(true);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function inspect() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) { setSupported(false); return; }
      const registration = await navigator.serviceWorker.ready;
      setSubscription(await registration.pushManager.getSubscription());
    }
    void inspect();
  }, []);

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) { setMessage("Public notification key is missing."); return; }
    setBusy(true); setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setMessage("Notification permission was not granted."); return; }
      const registration = await navigator.serviceWorker.ready;
      const nextSubscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeApplicationKey(publicKey) });
      const response = await fetch("/api/push/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nextSubscription) });
      if (!response.ok) throw new Error();
      setSubscription(nextSubscription); setMessage("Daily reminders enabled.");
    } catch { setMessage("Could not enable reminders on this device."); }
    finally { setBusy(false); }
  }

  async function disable() {
    if (!subscription) return;
    setBusy(true); setMessage(null);
    try {
      await fetch("/api/push/subscription", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
      await subscription.unsubscribe(); setSubscription(null); setMessage("Reminders disabled on this device.");
    } catch { setMessage("Could not disable reminders."); }
    finally { setBusy(false); }
  }

  async function test() {
    if (!subscription) return;
    setBusy(true); setMessage(null);
    try { const response = await fetch("/api/push/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) }); if (!response.ok) throw new Error(); setMessage("Test notification sent."); }
    catch { setMessage("Test notification failed."); }
    finally { setBusy(false); }
  }

  return <Card><CardContent className="p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="mb-2 flex items-center gap-2">{subscription ? <Bell className="size-4 text-primary" /> : <BellOff className="size-4 text-muted-foreground" />}<h2 className="text-sm font-semibold">Daily reminders</h2></div><p className="text-xs text-muted-foreground">Due-today and overdue tasks · Denver morning · This device</p>{message && <p className="mt-2 text-xs text-primary">{message}</p>}</div><div className="flex gap-2">{!supported ? <Badge className="border-border bg-secondary text-muted-foreground">Not supported</Badge> : subscription ? <><Button variant="outline" onClick={() => void test()} disabled={busy}><Send />Test</Button><Button variant="outline" onClick={() => void disable()} disabled={busy}><BellOff />Disable</Button></> : <Button onClick={() => void enable()} disabled={busy}><Bell />Enable reminders</Button>}</div></div></CardContent></Card>;
}

function ProjectJournal({ projects, notes, onAdd, onDelete }: { projects: Project[]; notes: ProjectNote[]; onAdd: (note: ProjectNote) => void; onDelete: (note: ProjectNote) => void }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [type, setType] = useState<ProjectNote["type"]>("Update");
  const [content, setContent] = useState("");
  const filtered = notes.filter((note) => !projectId || note.projectId === projectId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const typeStyle: Record<ProjectNote["type"], string> = { Update: "border-cyan-500/20 bg-cyan-500/10 text-cyan-500", Decision: "border-violet-500/20 bg-violet-500/10 text-violet-500", Blocker: "border-red-500/20 bg-red-500/10 text-red-500", Note: "border-border bg-secondary text-muted-foreground" };
  if (!projects.length) return null;
  return <section id="journal" className="mt-4"><Card><CardContent className="p-5"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><BookOpenCheck className="size-4 text-primary" /><h2 className="text-sm font-semibold">Project journal</h2></div><p className="mt-1 text-xs text-muted-foreground">A durable trail of updates, decisions, and blockers.</p></div><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-9 rounded-md border border-border bg-background px-3 text-xs">{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></div><form className="mb-5 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); if (!content.trim() || !projectId) return; onAdd({ id: crypto.randomUUID(), projectId, type, content: content.trim(), createdAt: new Date().toISOString() }); setContent(""); }}><select value={type} onChange={(event) => setType(event.target.value as ProjectNote["type"])} className="h-10 rounded-md border border-border bg-background px-3 text-xs">{["Update", "Decision", "Blocker", "Note"].map((item) => <option key={item}>{item}</option>)}</select><input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Record what changed, what was decided, or what is blocked…" className="h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" /><Button type="submit"><Plus />Add entry</Button></form>{filtered.length ? <div className="space-y-2">{filtered.slice(0, 20).map((note) => <div key={note.id} className="group flex items-start gap-3 rounded-lg border border-border/60 bg-background/45 p-3"><Badge className={typeStyle[note.type]}>{note.type}</Badge><div className="min-w-0 flex-1"><p className="text-sm leading-5">{note.content}</p><p className="mt-1.5 font-mono text-[9px] text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p></div><Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100" onClick={() => onDelete(note)}><Trash2 /></Button></div>)}</div> : <div className="grid min-h-24 place-items-center text-xs text-muted-foreground">No journal entries for this project yet.</div>}</CardContent></Card></section>;
}

function DevelopmentQueue({ projects, intelligence }: { projects: Project[]; intelligence: Record<string, ProjectIntelligenceEntry> }) {
  const pullRequests = projects.flatMap((project) => (intelligence[project.id]?.data?.github?.pullRequests ?? []).map((pull) => ({ ...pull, project: project.name })));
  const issues = projects.flatMap((project) => (intelligence[project.id]?.data?.github?.issues ?? []).map((issue) => ({ ...issue, project: project.name })));
  if (!pullRequests.length && !issues.length) return null;
  return <section id="development" className="mb-10"><Card><CardContent className="p-5"><div className="mb-5 flex items-center gap-2"><CodePullRequest className="size-4 text-primary" /><div><h2 className="text-sm font-semibold">Development queue</h2><p className="mt-1 text-xs text-muted-foreground">Open GitHub work across tracked repositories.</p></div></div><div className="grid gap-5 lg:grid-cols-2"><div><div className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Pull requests · {pullRequests.length}</div><div className="space-y-1">{pullRequests.slice(0, 8).map((pull) => <a key={`${pull.project}-${pull.number}`} href={pull.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-lg px-2 py-2.5 hover:bg-accent/50"><CodePullRequest className="mt-0.5 size-4 shrink-0 text-violet-400" /><div className="min-w-0 flex-1"><div className="truncate text-xs">{pull.title}</div><div className="mt-0.5 font-mono text-[9px] text-muted-foreground">{pull.project} · #{pull.number}</div></div><Badge className={pull.draft ? "border-border bg-secondary text-muted-foreground" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"}>{pull.draft ? "Draft" : "Ready"}</Badge></a>)}</div></div><div><div className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Issues · {issues.length}</div><div className="space-y-1">{issues.slice(0, 8).map((issue) => <a key={`${issue.project}-${issue.number}`} href={issue.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-lg px-2 py-2.5 hover:bg-accent/50"><CircleDotDashed className="mt-0.5 size-4 shrink-0 text-amber-400" /><div className="min-w-0 flex-1"><div className="truncate text-xs">{issue.title}</div><div className="mt-0.5 font-mono text-[9px] text-muted-foreground">{issue.project} · #{issue.number}</div></div></a>)}</div></div></div></CardContent></Card></section>;
}

function AnalyticsSection({ tasks, projects, today, timeZone }: { tasks: Task[]; projects: Project[]; today: string; timeZone: string }) {
  const days = Array.from({ length: 7 }, (_, index) => { const key = addDaysToDateKey(today, index - 6); return { key, label: weekdayLabelForDateKey(key) }; });
  const completed = tasks.filter((task) => task.done && task.completedAt);
  const completed7 = completed.filter((task) => dateKeyInTimeZone(new Date(task.completedAt!), timeZone) >= addDaysToDateKey(today, -6));
  const created30 = tasks.filter((task) => dateKeyInTimeZone(new Date(task.createdAt), timeZone) >= addDaysToDateKey(today, -29));
  const completed30 = completed.filter((task) => dateKeyInTimeZone(new Date(task.completedAt!), timeZone) >= addDaysToDateKey(today, -29));
  const completionRate = created30.length ? Math.min(100, Math.round(completed30.length / created30.length * 100)) : 0;
  const cycleTasks = completed.filter((task) => new Date(task.completedAt!).getTime() >= new Date(task.createdAt).getTime());
  const averageCycle = cycleTasks.length ? Math.round(cycleTasks.reduce((sum, task) => sum + (new Date(task.completedAt!).getTime() - new Date(task.createdAt).getTime()) / 86400000, 0) / cycleTasks.length * 10) / 10 : 0;
  const daily = days.map((day) => ({ ...day, count: completed.filter((task) => task.completedAt && dateKeyInTimeZone(new Date(task.completedAt), timeZone) === day.key).length }));
  const maxDaily = Math.max(1, ...daily.map((day) => day.count));
  const open = tasks.filter((task) => !task.done);
  const priority = { High: open.filter((task) => task.priority === "High").length, Medium: open.filter((task) => (task.priority ?? "Medium") === "Medium").length, Low: open.filter((task) => task.priority === "Low").length };
  const status = { Active: projects.filter((project) => project.status === "Active").length, Planning: projects.filter((project) => project.status === "Planning").length, Paused: projects.filter((project) => project.status === "Paused").length, Shipped: projects.filter((project) => project.status === "Shipped").length };
  return <section id="analytics" className="mb-10"><Card><CardContent className="p-5"><div className="mb-6 flex items-center gap-2"><BarChart3 className="size-4 text-primary" /><div><h2 className="text-sm font-semibold">Operating analytics</h2><p className="mt-1 text-xs text-muted-foreground">Throughput, flow, and portfolio balance.</p></div></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-border bg-background/45 p-4"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">7-day throughput</div><div className="mt-2 flex items-end justify-between"><span className="text-2xl font-semibold">{completed7.length}</span><TrendingUp className="size-4 text-emerald-400" /></div></div><div className="rounded-lg border border-border bg-background/45 p-4"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">30-day completion</div><div className="mt-2 text-2xl font-semibold">{completionRate}%</div></div><div className="rounded-lg border border-border bg-background/45 p-4"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Avg. cycle time</div><div className="mt-2 text-2xl font-semibold">{averageCycle}<span className="ml-1 text-xs font-normal text-muted-foreground">days</span></div></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr]"><div className="rounded-lg border border-border bg-background/35 p-4"><div className="mb-4 text-xs font-medium">Daily completions</div><div className="flex h-32 items-end gap-2">{daily.map((day) => <div key={day.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="font-mono text-[9px] text-muted-foreground">{day.count || ""}</span><div className="w-full rounded-t bg-primary/75 transition-all" style={{ height: `${Math.max(day.count ? 10 : 2, day.count / maxDaily * 82)}%` }} /><span className="font-mono text-[9px] text-muted-foreground">{day.label}</span></div>)}</div></div><div className="rounded-lg border border-border bg-background/35 p-4"><div className="mb-4 text-xs font-medium">Open priority</div><div className="space-y-3">{Object.entries(priority).map(([label, count]) => <div key={label}><div className="mb-1 flex justify-between font-mono text-[9px] text-muted-foreground"><span>{label}</span><span>{count}</span></div><div className="h-1.5 rounded-full bg-secondary"><div className={cn("h-full rounded-full", label === "High" ? "bg-red-500" : label === "Medium" ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${open.length ? count / open.length * 100 : 0}%` }} /></div></div>)}</div></div><div className="rounded-lg border border-border bg-background/35 p-4"><div className="mb-4 text-xs font-medium">Project portfolio</div><div className="space-y-2">{Object.entries(status).map(([label, count]) => <div key={label} className="flex items-center justify-between rounded-md bg-secondary/40 px-2.5 py-2 text-xs"><span className="text-muted-foreground">{label}</span><span className="font-mono font-semibold">{count}</span></div>)}</div></div></div></CardContent></Card></section>;
}

function CalendarTimeline({ tasks, projects, todayKey, onEdit, onToggle }: { tasks: Task[]; projects: Project[]; todayKey: string; onEdit: (task: Task) => void; onToggle: (id: string) => void }) {
  const [cursor, setCursor] = useState(() => { const [year, month] = todayKey.split("-").map(Number); return { year, month: month - 1 }; });
  const monthStart = new Date(Date.UTC(cursor.year, cursor.month, 1, 12));
  const gridStart = new Date(Date.UTC(cursor.year, cursor.month, 1 - monthStart.getUTCDay(), 12));
  const days = Array.from({ length: 42 }, (_, index) => { const date = new Date(gridStart); date.setUTCDate(gridStart.getUTCDate() + index); return date; });
  const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
  const dueTasks = tasks.filter((task) => task.dueDate).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
  const upcoming = dueTasks.filter((task) => !task.done && String(task.dueDate) >= todayKey).slice(0, 8);
  const completed = [...tasks].filter((task) => task.done).sort((a, b) => String(b.completedAt ?? b.createdAt).localeCompare(String(a.completedAt ?? a.createdAt))).slice(0, 8);

  function moveMonth(delta: number) {
    const date = new Date(Date.UTC(cursor.year, cursor.month + delta, 1, 12));
    setCursor({ year: date.getUTCFullYear(), month: date.getUTCMonth() });
  }

  return <section id="calendar" className="mb-10 grid gap-4 2xl:grid-cols-[1.45fr_0.75fr]">
    <Card><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" /><h2 className="text-sm font-semibold">Planning calendar</h2></div><p className="mt-1 text-xs text-muted-foreground">Deadlines across every project.</p></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => moveMonth(-1)}><ChevronLeft /></Button><div className="min-w-32 text-center text-sm font-medium">{monthLabel}</div><Button variant="ghost" size="icon" onClick={() => moveMonth(1)}><ChevronRight /></Button></div></div><div className="grid grid-cols-7 border-l border-t border-border text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="border-b border-r border-border py-2">{day}</div>)}{days.map((date) => { const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`; const dayTasks = dueTasks.filter((task) => task.dueDate === key); const currentMonth = date.getUTCMonth() === cursor.month; return <div key={key} className={cn("min-h-24 border-b border-r border-border p-1.5 text-left", !currentMonth && "bg-secondary/20 text-muted-foreground/40", key === todayKey && "bg-primary/5")}><div className={cn("mb-1 grid size-6 place-items-center rounded-full text-[10px]", key === todayKey && "bg-primary font-semibold text-primary-foreground")}>{date.getUTCDate()}</div><div className="space-y-1">{dayTasks.slice(0, 3).map((task) => <button key={task.id} onClick={() => onEdit(task)} title={task.title} className={cn("block w-full truncate rounded px-1.5 py-1 text-[9px]", task.done ? "bg-secondary text-muted-foreground line-through" : task.priority === "High" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary")}>{task.title}</button>)}{dayTasks.length > 3 && <div className="px-1 text-[9px] text-muted-foreground">+{dayTasks.length - 3} more</div>}</div></div>})}</div></CardContent></Card>
    <Card><CardContent className="p-5"><div className="mb-5"><h2 className="text-sm font-semibold">Timeline</h2><p className="mt-1 text-xs text-muted-foreground">What&apos;s approaching and what just closed.</p></div><div className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Upcoming</div>{upcoming.length ? <div className="space-y-1">{upcoming.map((task) => { const project = projects.find((item) => item.id === task.projectId); return <div key={task.id} className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-accent/50"><button onClick={() => onToggle(task.id)}><Square className="size-4 text-muted-foreground" /></button><button onClick={() => onEdit(task)} className="min-w-0 flex-1 text-left"><div className="truncate text-xs">{task.title}</div><div className="mt-0.5 text-[9px] text-muted-foreground">{project?.name ?? "General"}</div></button><span className="font-mono text-[9px] text-muted-foreground">{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div>})}</div> : <div className="mb-5 rounded-lg bg-background/50 p-4 text-center text-xs text-muted-foreground">No upcoming deadlines</div>}<div className="mb-3 mt-6 border-t border-border pt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Recently completed</div>{completed.length ? <div className="space-y-1">{completed.map((task) => <button key={task.id} onClick={() => onToggle(task.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-accent/50"><CheckCircle2 className="size-4 shrink-0 text-emerald-400" /><span className="min-w-0 flex-1 truncate text-xs text-muted-foreground line-through">{task.title}</span><span className="font-mono text-[9px] text-muted-foreground">{new Date(task.completedAt ?? task.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></button>)}</div> : <div className="text-xs text-muted-foreground">Completed tasks will appear here.</div>}</CardContent></Card>
  </section>;
}

function ProjectCard({ project, intelligenceEntry, onDelete, onEdit, onOpen }: { project: Project; intelligenceEntry?: ProjectIntelligenceEntry; onDelete: () => void; onEdit: () => void; onOpen: () => void }) {
  const intelligence = intelligenceEntry?.data;
  const refreshFailed = intelligenceEntry?.status === "stale" || intelligenceEntry?.status === "error";
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl">
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r", accentStyles[project.accent])} />
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><span className={cn("h-1.5 w-1.5 rounded-full", project.status === "Active" ? "bg-emerald-400" : "bg-muted-foreground/50")} />{project.eyebrow}</div><button onClick={onOpen} className="text-left"><h3 className="text-lg font-semibold tracking-tight hover:text-primary">{project.name}</h3></button></div><div className="flex"><Button size="icon" variant="ghost" aria-label={`Open ${project.name}`} onClick={onOpen}><ArrowUpRight /></Button><Button size="icon" variant="ghost" aria-label={`Edit ${project.name}`} onClick={onEdit}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${project.name}`} onClick={onDelete}><Trash2 /></Button></div></div>
        <p className="min-h-12 text-sm leading-6 text-muted-foreground">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5"><Badge className={statusStyles[project.status]}>{project.status}</Badge>{project.stack.map((item) => <Badge key={item} className="border-border bg-secondary/70 text-muted-foreground">{item}</Badge>)}</div>
        <div className="mt-6 border-t border-border/70 pt-4"><div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground"><span>Momentum</span><span>{project.progress}%</span></div><div className="h-1 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full rounded-full bg-gradient-to-r", accentStyles[project.accent])} style={{ width: `${project.progress}%` }} /></div></div>
        <div className="mt-4 rounded-lg border border-border/60 bg-background/50 p-3 text-xs leading-5 text-muted-foreground"><span className="mr-1.5 font-semibold text-foreground">Next:</span>{project.note}</div>
        {(project.repo || project.deployment) && <div className="mt-3 space-y-2 rounded-lg border border-border/60 bg-background/40 p-3">
          {(refreshFailed || intelligenceEntry?.status === "degraded") && <div role="status" className="flex items-center gap-2 border-b border-border/60 pb-2 text-[10px] text-amber-500"><AlertCircle className="size-3.5" />{intelligenceEntry?.status === "stale" ? "Refresh failed · showing last known status" : intelligenceEntry?.status === "degraded" ? "One or more connected services returned partial status" : "Status refresh unavailable"}</div>}
          {project.repo && <div className="flex items-start gap-2 text-[11px]"><GitCommitHorizontal className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /><div className="min-w-0 flex-1">{intelligence?.github?.latestCommit ? <><a className="block truncate font-medium hover:text-primary" href={intelligence.github.latestCommit.url} target="_blank" rel="noreferrer">{intelligence.github.latestCommit.message}</a><span className="font-mono text-[9px] text-muted-foreground">{intelligence.github.latestCommit.sha} · {intelligence.github.defaultBranch}</span></> : <span className="text-muted-foreground">{intelligence ? "Repository unavailable" : refreshFailed ? "Repository refresh failed" : "Checking repository…"}</span>}</div></div>}
          {project.deployment && <div className="flex items-center gap-2 text-[11px]"><Cloud className="size-3.5 text-muted-foreground" /><span className="text-muted-foreground">Deployment</span><span className={cn("ml-auto flex items-center gap-1.5 font-medium", intelligence?.vercel?.reachable ? "text-emerald-500" : intelligence || refreshFailed ? "text-amber-500" : "text-muted-foreground")}><span className={cn("size-1.5 rounded-full", intelligence?.vercel?.reachable ? "bg-emerald-400" : "bg-muted-foreground/40")} />{intelligence?.vercel?.state ?? (intelligence?.vercel?.reachable ? "ONLINE" : intelligence ? "UNAVAILABLE" : refreshFailed ? "REFRESH FAILED" : "CHECKING")}</span></div>}
        </div>}
        <div className="mt-auto flex items-center justify-between pt-5"><span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground"><Clock3 className="size-3" />{project.updatedLabel}</span><div className="flex gap-1">{project.repo && <Button asChild size="icon" variant="ghost"><a href={project.repo} target="_blank" rel="noreferrer"><Github /></a></Button>}{project.deployment && <Button asChild size="icon" variant="ghost"><a href={project.deployment} target="_blank" rel="noreferrer"><ArrowUpRight /></a></Button>}</div></div>
      </CardContent>
    </Card>
  );
}



export { AnalyticsSection, CalendarTimeline, DevelopmentQueue, NotificationManager, ProjectCard, ProjectJournal };
