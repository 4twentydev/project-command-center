"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertCircle, Archive, ArrowRightCircle, ArrowUpRight, BarChart3, Bell, BellOff, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleDot, Clock3, Cloud, Command, DatabaseBackup, Download, ExternalLink, Flame, GitPullRequest as CodePullRequest, Inbox,
  CornerDownLeft, GitCommitHorizontal, Github, Grid2X2, Keyboard, LayoutDashboard, Lightbulb, ListChecks, ListFilter, Pencil,
  BookOpenCheck, CircleDotDashed, ClipboardCheck, DownloadCloud, Gauge, Megaphone, Plus, RefreshCw, Rocket, RotateCcw, Search, Send, Settings, Sparkles, Square, Target, TerminalSquare, Trash2, TrendingUp, Upload, X,
} from "lucide-react";
import type { Project, ProjectKind, ProjectStatus } from "@/lib/projects";
import { defaultWorkspaceSettings, emptyWorkspace, workspaceStorageKey, type InboxItem, type ProjectNote, type Task, type WeeklyReview, type Workspace, type WorkspaceSettings } from "@/lib/workspace";
import { selectFocusTasks, selectTasksForView } from "@/lib/planning";
import { isWorkspaceData, normalizeWorkspace } from "@/lib/workspace-validation";
import { cn } from "@/lib/utils";
import { addDaysToDateKey, dateKeyInTimeZone, normalizeTimeZone, weekdayLabelForDateKey } from "@/lib/date-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DialogBoundary } from "@/components/ui/dialog-boundary";
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
type SyncState = "loading" | "saved" | "saving" | "offline" | "conflict";
type TaskView = "Today" | "Next" | "All";
type Confirmation = { title: string; message: string; actionLabel: string; onConfirm: () => void };
type UndoState = { label: string; workspace: Workspace };

type ProjectIntelligence = {
  github: null | { available: boolean; private?: boolean; defaultBranch?: string; openIssues?: number; pushedAt?: string; latestCommit?: null | { sha: string; message: string; url: string; date?: string }; pullRequests?: Array<{ number: number; title: string; url: string; draft: boolean; updatedAt: string }>; issues?: Array<{ number: number; title: string; url: string; updatedAt: string }> };
  vercel: null | { reachable: boolean; state: string | null; target?: string | null; createdAt?: number; url: string; checkedAt: string };
  fetchedAt: string;
};
type ImportCandidate = { id: string; name: string; description: string; repo: string; deployment?: string; stack: string[]; private: boolean; pushedAt: string; vercelProject?: string };

function ConfirmDialog({ confirmation, onClose }: { confirmation: Confirmation; onClose: () => void }) {
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><Card className="w-full max-w-md shadow-2xl"><CardContent className="p-6"><div className="mb-4 grid size-10 place-items-center rounded-full bg-red-500/10 text-red-500"><AlertCircle /></div><h2 className="text-lg font-semibold">{confirmation.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{confirmation.message}</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button className="bg-red-600 text-white shadow-none hover:bg-red-700" onClick={() => { confirmation.onConfirm(); onClose(); }}><Trash2 />{confirmation.actionLabel}</Button></div></CardContent></Card></div>;
}

function ProjectImportDialog({ existing, onClose, onImport }: { existing: Project[]; onClose: () => void; onImport: (candidates: ImportCandidate[]) => void }) {
  const [candidates, setCandidates] = useState<ImportCandidate[]>([]); const [selected, setSelected] = useState<Set<string>>(new Set()); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  useEffect(() => { async function discover() { try { const response = await fetch("/api/project-import", { cache: "no-store" }); if (!response.ok) throw new Error(); const payload = await response.json() as { candidates: ImportCandidate[] }; const repos = new Set(existing.map((project) => project.repo)); setCandidates(payload.candidates.filter((candidate) => !repos.has(candidate.repo))); } catch { setError(true); } finally { setLoading(false); } } void discover(); }, [existing]);
  function toggle(id: string) { setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  return <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><Card className="my-6 w-full max-w-2xl shadow-2xl"><CardContent className="p-6"><div className="mb-5 flex items-center justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">Connected discovery</div><h2 className="mt-1 text-xl font-semibold">Import projects</h2><p className="mt-1 text-xs text-muted-foreground">GitHub repositories matched with Vercel deployments.</p></div><Button variant="ghost" size="icon" onClick={onClose}><X /></Button></div>{loading ? <div className="grid min-h-56 place-items-center"><RefreshCw className="size-5 animate-spin text-primary" /></div> : error ? <div className="grid min-h-56 place-items-center text-sm text-muted-foreground">Project discovery is unavailable.</div> : candidates.length ? <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">{candidates.map((candidate) => <button key={candidate.id} onClick={() => toggle(candidate.id)} className={cn("flex w-full items-center gap-3 rounded-lg border p-3 text-left", selected.has(candidate.id) ? "border-primary/40 bg-primary/5" : "border-border hover:bg-accent/50")}><span className={cn("grid size-5 place-items-center rounded border", selected.has(candidate.id) ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{selected.has(candidate.id) && <CheckCircle2 className="size-3.5" />}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-sm font-medium">{candidate.name}</span>{candidate.private && <Badge className="border-border bg-secondary text-muted-foreground">Private</Badge>}{candidate.vercelProject && <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500">Vercel</Badge>}</div><p className="mt-1 truncate text-xs text-muted-foreground">{candidate.description}</p></div><span className="font-mono text-[9px] text-muted-foreground">{candidate.stack[0] ?? "Repo"}</span></button>)}</div> : <div className="grid min-h-56 place-items-center text-center text-sm text-muted-foreground">Every discovered repository is already tracked.</div>}<div className="mt-5 flex justify-end gap-2 border-t border-border pt-4"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={!selected.size} onClick={() => { onImport(candidates.filter((candidate) => selected.has(candidate.id))); onClose(); }}><DownloadCloud />Import {selected.size || "selected"}</Button></div></CardContent></Card></div>;
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

function DevelopmentQueue({ projects, intelligence }: { projects: Project[]; intelligence: Record<string, ProjectIntelligence> }) {
  const pullRequests = projects.flatMap((project) => (intelligence[project.id]?.github?.pullRequests ?? []).map((pull) => ({ ...pull, project: project.name })));
  const issues = projects.flatMap((project) => (intelligence[project.id]?.github?.issues ?? []).map((issue) => ({ ...issue, project: project.name })));
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

function ProjectCard({ project, intelligence, onDelete, onEdit, onOpen }: { project: Project; intelligence?: ProjectIntelligence; onDelete: () => void; onEdit: () => void; onOpen: () => void }) {
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
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);
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
  const [reviewOpen, setReviewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const workspaceVersionRef = useRef<string | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const saveGenerationRef = useRef(0);

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
        const payload = await response.json() as { workspace: Workspace | null; updatedAt?: string | null; lastSnapshotAt?: string | null };
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
    const generation = ++saveGenerationRef.current;
    const timer = window.setTimeout(async () => {
      setSyncState("saving");
      saveQueueRef.current = saveQueueRef.current.catch(() => undefined).then(async () => {
        if (generation !== saveGenerationRef.current) return;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (workspaceVersionRef.current) headers["X-Workspace-Version"] = workspaceVersionRef.current;
        try {
          const response = await fetch("/api/workspace", { method: "PUT", headers, body: JSON.stringify(workspace) });
          if (response.status === 409) { if (generation === saveGenerationRef.current) setSyncState("conflict"); return; }
          if (!response.ok) throw new Error("Cloud write failed");
          const payload = await response.json() as { updatedAt?: string };
          workspaceVersionRef.current = payload.updatedAt ?? workspaceVersionRef.current;
          if (generation === saveGenerationRef.current) setSyncState("saved");
        } catch {
          if (generation === saveGenerationRef.current) setSyncState("offline");
        }
      });
      await saveQueueRef.current;
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
  function addTask(title: string, projectId?: string, priority?: Task["priority"], dueDate?: string) { setWorkspace((current) => ({ ...current, tasks: [{ id: crypto.randomUUID(), title, projectId, priority: priority ?? current.settings?.defaultTaskPriority ?? "Medium", dueDate, done: false, createdAt: new Date().toISOString() }, ...current.tasks], activity: [record(`Added task · ${title}`), ...current.activity].slice(0, 30) })); }
  function addIdea(idea: string) { setWorkspace((current) => ({ ...current, inbox: [{ id: crypto.randomUUID(), text: idea, createdAt: new Date().toISOString() }, ...(current.inbox ?? [])], activity: [record(`Captured idea · ${idea}`), ...current.activity].slice(0, 30) })); }
  function toggleTask(id: string) { setWorkspace((current) => { const task = current.tasks.find((item) => item.id === id); return { ...current, tasks: current.tasks.map((item) => item.id === id ? { ...item, done: !item.done, completedAt: item.done ? undefined : new Date().toISOString() } : item), activity: task ? [record(`${task.done ? "Reopened" : "Completed"} task · ${task.title}`), ...current.activity].slice(0, 30) : current.activity }; }); }
  function deleteProject(id: string) { const project = workspace.projects.find((item) => item.id === id); if (!project) return; setConfirmation({ title: `Delete ${project.name}?`, message: "The project will be removed and its tasks moved to General. You can undo this briefly afterward.", actionLabel: "Delete project", onConfirm: () => { setUndo({ label: `Deleted ${project.name}`, workspace }); setWorkspace((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== id), tasks: current.tasks.map((task) => task.projectId === id ? { ...task, projectId: undefined } : task), activity: [record(`Removed project · ${project.name}`), ...current.activity].slice(0, 30) })); } }); }
  function updateProject(project: Project) { setWorkspace((current) => ({ ...current, projects: current.projects.map((item) => item.id === project.id ? project : item), activity: [record(`Updated project · ${project.name}`), ...current.activity].slice(0, 30) })); }
  function updateTask(task: Task) { setWorkspace((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === task.id ? task : item), activity: [record(`Updated task · ${task.title}`), ...current.activity].slice(0, 30) })); }
  function deleteTask(id: string) { const task = workspace.tasks.find((item) => item.id === id); if (!task) return; setConfirmation({ title: "Delete this task?", message: `“${task.title}” will be removed. You can undo this briefly afterward.`, actionLabel: "Delete task", onConfirm: () => { setUndo({ label: `Deleted ${task.title}`, workspace }); setWorkspace((current) => ({ ...current, tasks: current.tasks.filter((item) => item.id !== id), activity: [record(`Removed task · ${task.title}`), ...current.activity].slice(0, 30) })); } }); }

  function exportWorkspace() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), workspace }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `work-ctrl-backup-${today}.json`; anchor.click();
    URL.revokeObjectURL(url);
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
    try { const response = await fetch("/api/workspace", { method: "POST" }); const payload = await response.json() as { createdAt?: string }; if (!response.ok || !payload.createdAt) throw new Error(); setLastSnapshotAt(payload.createdAt); }
    finally { setSnapshotting(false); }
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
      {composer && <DialogBoundary label="Create a project, task, or idea" onClose={() => setComposer(null)}><Composer mode={composer} projects={workspace.projects} onClose={() => setComposer(null)} onProject={addProject} onTask={addTask} onIdea={addIdea} /></DialogBoundary>}
      {editingProject && <DialogBoundary label="Edit project" onClose={() => setEditingProject(null)}><ProjectEditor project={editingProject} onClose={() => setEditingProject(null)} onSave={updateProject} /></DialogBoundary>}
      {viewingProjectId && workspace.projects.find((project) => project.id === viewingProjectId) && <DialogBoundary label="Project workspace" onClose={() => setViewingProjectId(null)}><ProjectWorkspace project={workspace.projects.find((project) => project.id === viewingProjectId)!} tasks={workspace.tasks} intelligence={intelligence[viewingProjectId]} onClose={() => setViewingProjectId(null)} onEdit={() => { setEditingProject(workspace.projects.find((project) => project.id === viewingProjectId)!); setViewingProjectId(null); }} onAddTask={(title) => addTask(title, viewingProjectId)} onToggleTask={toggleTask} onEditTask={setEditingTask} /></DialogBoundary>}
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
          <div className="mt-auto rounded-xl border border-border bg-background/60 p-3"><div className="mb-2 flex items-center gap-2 text-xs font-medium"><TerminalSquare className="size-4 text-primary" />Cloud workspace</div><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"><span className={cn("size-1.5 rounded-full", syncState === "saved" ? "bg-emerald-400" : syncState === "offline" || syncState === "conflict" ? "bg-amber-400" : "animate-pulse bg-primary")} />{syncState === "loading" ? "Loading cloud data" : syncState === "saving" ? "Saving changes" : syncState === "offline" ? "Offline · Saved locally" : syncState === "conflict" ? "Cloud changed · Reload before editing" : "Synced across devices"}</div></div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-16 sm:px-6 xl:px-10">
          <header className="flex h-20 items-center justify-between border-b border-border/60"><div className="flex items-center gap-2 text-xs text-muted-foreground"><CircleDot className={cn("size-3", syncState === "offline" || syncState === "conflict" ? "text-amber-400" : "text-emerald-400")} /><span className="hidden sm:inline">{syncState === "offline" ? "Working offline" : syncState === "conflict" ? "Reload to resolve cloud changes" : syncState === "saving" ? "Saving…" : "Workspace ready"}</span></div><div className="flex items-center gap-2"><Button variant="outline" className="hidden text-muted-foreground md:flex" onClick={() => setCommandOpen(true)}><Search />Commands <kbd className="ml-4 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px]">Ctrl K</kbd></Button><Button variant="outline" size="icon" onClick={() => void refreshIntelligence()} aria-label="Refresh project status"><RefreshCw className={cn(refreshing && "animate-spin")} /></Button><ThemeToggle /><Button onClick={() => setComposer("project")}><Plus />New project</Button></div></header>

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
            {filtered.length ? <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{filtered.map((project) => <ProjectCard key={project.id} project={project} intelligence={intelligence[project.id]} onOpen={() => setViewingProjectId(project.id)} onEdit={() => setEditingProject(project)} onDelete={() => deleteProject(project.id)} />)}</div> : <Card><CardContent className="grid min-h-64 place-items-center text-center"><div><Sparkles className="mx-auto mb-3 size-7 text-primary" /><h3 className="font-medium">Clean slate</h3><p className="mt-1 text-sm text-muted-foreground">Create your first project when you&apos;re ready.</p><Button className="mt-5" onClick={() => setComposer("project")}><Plus />New project</Button></div></CardContent></Card>}
          </section>

          <section className="mt-10 grid gap-4 xl:grid-cols-[1.15fr_1fr]">
            <Card id="tasks"><CardContent className="p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Tasks</h2><p className="mt-1 text-xs text-muted-foreground">Small, concrete next actions.</p></div><Button size="sm" variant="outline" onClick={() => setComposer("task")}><Plus />Add task</Button></div><div className="mb-4 flex gap-1 rounded-lg border border-border bg-background/50 p-1">{(["Today", "Next", "All"] as TaskView[]).map((view) => <button key={view} onClick={() => setTaskView(view)} className={cn("flex-1 rounded-md px-3 py-1.5 text-xs transition", taskView === view ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>{view}</button>)}</div>{visibleTasks.length ? <div className="space-y-5">{Object.entries(taskGroups).map(([group, tasks]) => <div key={group}><div className="mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{group}</div><div className="space-y-1">{tasks.map((task) => { const overdue = !task.done && Boolean(task.dueDate && task.dueDate < today); return <div key={task.id} className="group/task flex items-center gap-2 rounded-lg px-2 py-2.5 hover:bg-accent/50"><button onClick={() => toggleTask(task.id)} aria-label={task.done ? "Reopen task" : "Complete task"}>{task.done ? <CheckCircle2 className="size-4 shrink-0 text-emerald-400" /> : <Square className="size-4 shrink-0 text-muted-foreground" />}</button><div className="min-w-0 flex-1"><div className={cn("truncate text-xs", task.done && "text-muted-foreground line-through")}>{task.title}</div>{task.notes && <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{task.notes}</div>}</div><Badge className={cn("border-border", task.priority === "High" ? "border-red-500/20 bg-red-500/10 text-red-500" : task.priority === "Low" ? "bg-secondary text-muted-foreground" : "border-amber-500/20 bg-amber-500/10 text-amber-500")}>{task.priority ?? "Medium"}</Badge>{task.dueDate && <span className={cn("flex items-center gap-1 font-mono text-[9px]", overdue ? "text-red-500" : "text-muted-foreground")}>{overdue ? <AlertCircle className="size-3" /> : <CalendarDays className="size-3" />}{task.dueDate.slice(5)}</span>}<Button size="icon" variant="ghost" className="size-7 opacity-0 group-hover/task:opacity-100" onClick={() => setEditingTask(task)}><Pencil /></Button><Button size="icon" variant="ghost" className="size-7 opacity-0 group-hover/task:opacity-100" onClick={() => deleteTask(task.id)}><Trash2 /></Button></div>})}</div></div>)}</div> : <div className="grid min-h-32 place-items-center text-center text-xs text-muted-foreground">{taskView === "Today" ? "Nothing due today. You're clear." : taskView === "Next" ? "No upcoming tasks." : "No tasks yet. Add one useful next action."}</div>}</CardContent></Card>
            <Card><CardContent className="p-5"><div className="mb-5 flex items-center gap-2"><Sparkles className="size-4 text-violet-400" /><h2 className="text-sm font-semibold">Quick launch</h2></div><div className="grid grid-cols-2 gap-2"><Button variant="outline" className="h-auto justify-start p-3" asChild><a href="https://github.com/4twentydev" target="_blank" rel="noreferrer"><Github />GitHub <ExternalLink className="ml-auto size-3" /></a></Button><Button variant="outline" className="h-auto justify-start p-3" asChild><a href="https://vercel.com/4twentydev" target="_blank" rel="noreferrer"><Rocket />Vercel <ExternalLink className="ml-auto size-3" /></a></Button><Button variant="outline" className="h-auto justify-start p-3" onClick={() => setComposer("task")}><ListChecks />New task</Button><Button variant="outline" className="h-auto justify-start p-3" onClick={() => setComposer("idea")}><Lightbulb />Capture idea</Button></div></CardContent></Card>
          </section>

          <section id="inbox" className="mt-4"><Card><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2"><Inbox className="size-4 text-primary" /><h2 className="text-sm font-semibold">Capture inbox</h2></div><p className="mt-1 text-xs text-muted-foreground">Ideas stay loose until you decide what they should become.</p></div><Button variant="outline" size="sm" onClick={() => setComposer("idea")}><Plus />Capture</Button></div>{workspace.inbox?.length ? <div className="space-y-2">{workspace.inbox.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/45 p-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="text-sm leading-5">{item.text}</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">Captured {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p></div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => inboxToTask(item)}><ArrowRightCircle />Task</Button><Button variant="ghost" size="sm" onClick={() => inboxToProject(item)}><Grid2X2 />Project</Button><Button variant="ghost" size="icon" onClick={() => archiveInboxItem(item)} aria-label="Archive inbox item"><Archive /></Button></div></div>)}</div> : <div className="grid min-h-28 place-items-center text-center"><div><CheckCircle2 className="mx-auto mb-2 size-5 text-emerald-400" /><p className="text-xs text-muted-foreground">Inbox zero. Nothing waiting for a decision.</p></div></div>}</CardContent></Card></section>

          <section id="activity" className="mt-4"><Card><CardContent className="p-5"><div className="mb-5"><h2 className="text-sm font-semibold">Activity</h2><p className="mt-1 text-xs text-muted-foreground">An automatic trail of meaningful workspace changes.</p></div>{workspace.activity.length ? <div className="space-y-1">{workspace.activity.map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-accent/50"><div className={cn("size-2 rounded-full", index === 0 ? "bg-emerald-400" : "bg-muted-foreground/40")} /><span className="min-w-0 flex-1 truncate text-xs">{item.message}</span><span className="shrink-0 font-mono text-[9px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span></div>)}</div> : <div className="grid min-h-28 place-items-center text-xs text-muted-foreground">Activity appears as you work.</div>}</CardContent></Card></section>
          <section className="mt-4"><Card><CardContent className="p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="mb-2 flex items-center gap-2"><BookOpenCheck className="size-4 text-primary" /><h2 className="text-sm font-semibold">Weekly review</h2></div>{workspace.reviews?.[0] ? <div><p className="text-xs text-muted-foreground">Last completed {new Date(workspace.reviews[0].createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric" })}</p><p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6"><span className="font-medium">Next:</span> {workspace.reviews[0].nextPriorities || "No priorities recorded."}</p></div> : <p className="text-xs text-muted-foreground">No review yet. Close your first operating loop.</p>}</div><Button variant="outline" onClick={() => setReviewOpen(true)}><BookOpenCheck />{workspace.reviews?.length ? "New review" : "Start review"}</Button></div></CardContent></Card></section>
          <section className="mt-4"><NotificationManager /></section>
          <section className="mt-4"><Card><CardContent className="p-5"><div className="mb-5"><h2 className="text-sm font-semibold">Data safety</h2><p className="mt-1 text-xs text-muted-foreground">Portable backups and recoverable workspace controls.</p></div><input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importWorkspace(file); }} /><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><Button variant="outline" className="justify-start" onClick={exportWorkspace}><Download />Export JSON</Button><Button variant="outline" className="justify-start" onClick={() => importInputRef.current?.click()}><Upload />Import backup</Button><Button variant="outline" className="justify-start" onClick={() => void createSnapshot()} disabled={snapshotting}><DatabaseBackup className={cn(snapshotting && "animate-pulse")} />Cloud snapshot</Button><Button variant="outline" className="justify-start text-red-500 hover:text-red-500" onClick={resetWorkspace}><RotateCcw />Reset workspace</Button></div><div className="mt-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{lastSnapshotAt ? `Last cloud snapshot · ${new Date(lastSnapshotAt).toLocaleString()}` : "No cloud snapshot yet"}</div></CardContent></Card></section>
        </main>
        <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-2xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground"><LayoutDashboard className="size-4" />Home</button><button onClick={() => document.querySelector("#focus")?.scrollIntoView()} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground"><Target className="size-4" />Focus</button><button onClick={() => setComposer("task")} className="mx-auto grid size-11 -translate-y-3 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg" aria-label="New task"><Plus className="size-5" /></button><button onClick={() => document.querySelector("#projects")?.scrollIntoView()} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground"><Grid2X2 className="size-4" />Projects</button><button onClick={() => setCommandOpen(true)} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground"><Command className="size-4" />More</button></nav>
      </div>
    </div>
  );
}
