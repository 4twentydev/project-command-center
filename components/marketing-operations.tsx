"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, ClipboardCheck, FileText, Handshake, Inbox, Megaphone, Plus, Target, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogBoundary } from "@/components/ui/dialog-boundary";
import { SyncConflictDialog } from "@/components/ui/sync-conflict-dialog";
import { launchWeeks, type MarketingFunnelStage } from "@/lib/marketing-plan";
import { beginMarketingCampaign, emptyMarketingWorkspace, normalizeMarketingWorkspace, type MarketingActivity, type MarketingContentItem, type MarketingProspect, type MarketingWorkspace } from "@/lib/marketing-workspace";
import { dateKeyInTimeZone, normalizeTimeZone } from "@/lib/date-time";
import { cn } from "@/lib/utils";
import { readVersionedWorkspace, saveVersionedWorkspace } from "@/lib/versioned-workspace-client";
import { ActivityDialog, ContentDialog, ProspectDialog } from "@/components/marketing/marketing-dialogs";
import { campaignWeek, newContentItem, newProspect, scoreFor } from "@/components/marketing/marketing-metrics";
import {
  MarketingCampaignStart,
  MarketingContentView,
  MarketingPartnersView,
  MarketingPipelineView,
  MarketingPlanView,
  MarketingTemplatesView,
  MarketingTodayView,
} from "@/components/marketing/marketing-views";

type MarketingView = "today" | "pipeline" | "content" | "plan" | "templates" | "partners";
type SyncState = "idle" | "saving" | "saved" | "error" | "conflict";
type MarketingConflict = { local: MarketingWorkspace; cloud: MarketingWorkspace | null; cloudVersion: string | null; loading: boolean; resolving: boolean; error: string | null };

export function MarketingOperations({ initialWorkspace, initialUpdatedAt, storageAvailable, timeZone: timeZoneValue }: { initialWorkspace: MarketingWorkspace; initialUpdatedAt: string | null; storageAvailable: boolean; timeZone: string }) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [view, setView] = useState<MarketingView>("today"); const [sync, setSync] = useState<SyncState>(storageAvailable ? "idle" : "error");
  const [prospectEditor, setProspectEditor] = useState<MarketingProspect | null>(null); const [activityProspect, setActivityProspect] = useState<MarketingProspect | null | undefined>(); const [contentEditor, setContentEditor] = useState<MarketingContentItem | null>(null);
  const [search, setSearch] = useState(""); const [stageFilter, setStageFilter] = useState<"all" | MarketingFunnelStage>("all"); const [notice, setNotice] = useState<string | null>(storageAvailable ? null : "Run the database migration before saving marketing data.");
  const [conflict, setConflict] = useState<MarketingConflict | null>(null);
  const workspaceVersionRef = useRef(initialUpdatedAt);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const saveGenerationRef = useRef(0);
  const conflictRef = useRef(false);
  const timeZone = normalizeTimeZone(timeZoneValue); const today = dateKeyInTimeZone(new Date(), timeZone);
  const currentWeek = campaignWeek(workspace.campaignStart, today); const score = scoreFor(workspace, currentWeek, timeZone); const totalScore = Array.from({ length: 12 }, (_, index) => scoreFor(workspace, index + 1, timeZone)).reduce((total, item) => ({ accounts: total.accounts + item.accounts, outreach: total.outreach + item.outreach, conversations: total.conversations + item.conversations, fitCalls: total.fitCalls + item.fitCalls, paidAudits: total.paidAudits + item.paidAudits, paidClients: total.paidClients + item.paidClients, bookedRevenue: total.bookedRevenue + item.bookedRevenue }), { accounts: 0, outreach: 0, conversations: 0, fitCalls: 0, paidAudits: 0, paidClients: 0, bookedRevenue: 0 });
  const activeWeek = launchWeeks[currentWeek - 1];
  const dueProspects = workspace.prospects.filter((item) => item.nextActionAt && item.nextActionAt <= today && !["won", "lost"].includes(item.stage)).sort((a, b) => a.nextActionAt.localeCompare(b.nextActionAt));
  const filteredProspects = workspace.prospects.filter((item) => (stageFilter === "all" || item.stage === stageFilter) && [item.company, item.contactName, item.location, item.operationalSignals].join(" ").toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  async function loadConflict(local: MarketingWorkspace) {
    conflictRef.current = true;
    setSync("conflict");
    setNotice(null);
    setConflict({ local, cloud: null, cloudVersion: null, loading: true, resolving: false, error: null });
    const result = await readVersionedWorkspace("/api/marketing-workspace", normalizeMarketingWorkspace);
    if (result.status === "error") {
      setConflict((current) => current ? { ...current, loading: false, error: "The current cloud marketing workspace could not be loaded. Your local copy is still preserved." } : current);
      return;
    }
    setConflict((current) => current ? { ...current, cloud: result.workspace ?? emptyMarketingWorkspace, cloudVersion: result.updatedAt, loading: false, error: null } : current);
  }

  async function persist(next: MarketingWorkspace) {
    if (conflictRef.current) return;
    const generation = ++saveGenerationRef.current;
    setWorkspace(next); setSync("saving");
    saveQueueRef.current = saveQueueRef.current.catch(() => undefined).then(async () => {
      const result = await saveVersionedWorkspace("/api/marketing-workspace", next, workspaceVersionRef.current);
      if (result.status === "conflict") { if (generation === saveGenerationRef.current) await loadConflict(next); return; }
      if (result.status === "error") { if (generation === saveGenerationRef.current) { setSync("error"); setNotice("Marketing data could not be saved."); } return; }
      workspaceVersionRef.current = result.updatedAt ?? workspaceVersionRef.current;
      if (generation === saveGenerationRef.current) setSync("saved");
    });
    await saveQueueRef.current;
  }

  function downloadLocalMarketing(value: MarketingWorkspace) {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), marketingWorkspace: value }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `work-ctrl-marketing-conflict-${today}.json`; anchor.click();
    URL.revokeObjectURL(url);
  }

  function useCloudConflict() {
    if (!conflict?.cloud) return;
    saveGenerationRef.current += 1;
    conflictRef.current = false;
    workspaceVersionRef.current = conflict.cloudVersion;
    setWorkspace(conflict.cloud);
    setConflict(null);
    setSync("saved");
  }

  async function keepLocalConflict() {
    if (!conflict || conflict.loading || conflict.error) return;
    setConflict((current) => current ? { ...current, resolving: true } : current);
    const result = await saveVersionedWorkspace("/api/marketing-workspace", conflict.local, conflict.cloudVersion);
    if (result.status === "conflict") { await loadConflict(conflict.local); return; }
    if (result.status === "error") {
      setConflict((current) => current ? { ...current, resolving: false, error: "The local marketing workspace could not be saved. Export it for safekeeping or retry the cloud read." } : current);
      return;
    }
    workspaceVersionRef.current = result.updatedAt ?? conflict.cloudVersion;
    conflictRef.current = false;
    setWorkspace(conflict.local);
    setConflict(null);
    setSync("saved");
  }

  function startCampaign() {
    void persist(beginMarketingCampaign(workspace, new Date(), timeZone));
  }

  function saveProspect(prospect: MarketingProspect) { void persist({ ...workspace, prospects: [prospect, ...workspace.prospects.filter((item) => item.id !== prospect.id)] }); }
  function saveActivity(activity: MarketingActivity) {
    const prospects = activity.prospectId ? workspace.prospects.map((prospect) => prospect.id === activity.prospectId ? { ...prospect, stage: activity.type === "conversation" ? "conversation" as const : activity.type === "fit-call" ? "fit-call" as const : activity.type === "audit-proposed" ? "audit-proposed" as const : activity.type === "audit-paid" ? "audit-paid" as const : activity.type === "build-proposed" ? "build-proposed" as const : activity.type === "client-won" ? "won" as const : prospect.stage, updatedAt: activity.createdAt } : prospect) : workspace.prospects;
    void persist({ ...workspace, prospects, activities: [activity, ...workspace.activities].slice(0, 5000) });
  }
  function saveContent(item: MarketingContentItem) { void persist({ ...workspace, content: [item, ...workspace.content.filter((current) => current.id !== item.id)].sort((a, b) => a.week - b.week) }); }
  function deleteProspect(prospect: MarketingProspect) { if (!window.confirm(`Delete ${prospect.company} and its activity history?`)) return; void persist({ ...workspace, prospects: workspace.prospects.filter((item) => item.id !== prospect.id), activities: workspace.activities.filter((item) => item.prospectId !== prospect.id) }); }
  async function copy(value: string) { try { await navigator.clipboard.writeText(value); setNotice("Template copied."); } catch { setNotice("Clipboard access was unavailable."); } }

  const nav: Array<{ id: MarketingView; label: string; icon: typeof Target }> = [{ id: "today", label: "Today", icon: Target }, { id: "pipeline", label: "Pipeline", icon: BriefcaseBusiness }, { id: "content", label: "Content", icon: Megaphone }, { id: "plan", label: "90-day plan", icon: CalendarDays }, { id: "templates", label: "Scripts", icon: FileText }, { id: "partners", label: "Partners", icon: Handshake }];
  return <main className="min-h-screen min-w-0 bg-background px-4 py-5 text-foreground sm:px-7 lg:px-9"><div className="mx-auto w-full min-w-0 max-w-[1600px]">
    {conflict && <DialogBoundary label="Resolve marketing workspace conflict" onClose={() => undefined}><SyncConflictDialog title="Choose which marketing workspace to keep" comparisons={[
      { label: "Prospects", local: conflict.local.prospects.length, cloud: conflict.cloud?.prospects.length ?? "—" },
      { label: "Activity entries", local: conflict.local.activities.length, cloud: conflict.cloud?.activities.length ?? "—" },
      { label: "Content items", local: conflict.local.content.length, cloud: conflict.cloud?.content.length ?? "—" },
      { label: "Campaign start", local: conflict.local.campaignStart || "Not started", cloud: conflict.cloud?.campaignStart || "Not started" },
    ]} cloudUpdatedAt={conflict.cloudVersion} loading={conflict.loading} resolving={conflict.resolving} error={conflict.error} onRetry={() => void loadConflict(conflict.local)} onUseCloud={useCloudConflict} onKeepLocal={() => void keepLocalConflict()} onExportLocal={() => downloadLocalMarketing(conflict.local)} /></DialogBoundary>}
    {prospectEditor && <DialogBoundary label="Prospect details" onClose={() => setProspectEditor(null)}><ProspectDialog prospect={prospectEditor} onClose={() => setProspectEditor(null)} onSave={saveProspect} /></DialogBoundary>}
    {activityProspect !== undefined && <DialogBoundary label="Record marketing activity" onClose={() => setActivityProspect(undefined)}><ActivityDialog prospect={activityProspect} onClose={() => setActivityProspect(undefined)} onSave={saveActivity} /></DialogBoundary>}
    {contentEditor && <DialogBoundary label="Content item" onClose={() => setContentEditor(null)}><ContentDialog item={contentEditor} onClose={() => setContentEditor(null)} onSave={saveContent} /></DialogBoundary>}
    <header className="mb-6 flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between"><div><Link href="/dashboard" className="mb-3 inline-flex min-h-10 items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Command Center</Link><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Founder-led acquisition system</div><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Marketing Operations</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">A 90-day field, content, and relationship engine for turning real operational problems into qualified conversations.</p></div><div className="flex flex-wrap items-center gap-2"><Badge className={cn("border-border bg-secondary", sync === "error" ? "text-red-400" : sync === "conflict" ? "text-amber-500" : sync === "saving" ? "text-amber-400" : "text-muted-foreground")}>{sync === "saving" ? "Saving…" : sync === "saved" ? "Cloud saved" : sync === "conflict" ? "Resolution required" : sync === "error" ? "Save unavailable" : "Ready"}</Badge><Button size="sm" variant="ghost" asChild><Link href="/dashboard/leads"><Inbox />Leads</Link></Button><Button size="sm" variant="ghost" asChild><Link href="/dashboard/consultations"><ClipboardCheck />Consultations</Link></Button><Button variant="outline" asChild><Link href="/dashboard/marketing/one-sheet"><FileText />Print collateral</Link></Button><Button onClick={() => setProspectEditor(newProspect())}><Plus />Add prospect</Button></div></header>
    {notice && <div role="status" className="mb-5 flex min-h-11 items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 text-xs"><span>{notice}</span><button className="grid size-9 place-items-center" onClick={() => setNotice(null)} aria-label="Dismiss notice"><X className="size-3.5" /></button></div>}
    <nav className="mb-6 flex max-w-full gap-1 overflow-x-auto overscroll-x-contain rounded-xl border border-border bg-card p-1.5">{nav.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setView(item.id)} className={cn("flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-xs transition", view === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}><Icon className="size-4" />{item.label}</button>; })}</nav>

    {!workspace.campaignStart ? <MarketingCampaignStart onStart={startCampaign} /> : <>
      {view === "today" && <MarketingTodayView score={score} totalScore={totalScore} currentWeek={currentWeek} activeWeek={activeWeek} dueProspects={dueProspects} onOpenPipeline={() => setView("pipeline")} onEditProspect={setProspectEditor} />}
      {view === "pipeline" && <MarketingPipelineView prospects={workspace.prospects} stageFilter={stageFilter} search={search} filteredProspects={filteredProspects} onStageFilter={setStageFilter} onSearch={setSearch} onLogActivity={setActivityProspect} onAddProspect={() => setProspectEditor(newProspect())} onEditProspect={setProspectEditor} onDeleteProspect={deleteProspect} />}
      {view === "content" && <MarketingContentView items={workspace.content} onCreate={() => setContentEditor(newContentItem(currentWeek))} onEdit={setContentEditor} />}
      {view === "plan" && <MarketingPlanView currentWeek={currentWeek} />}
      {view === "templates" && <MarketingTemplatesView onCopy={copy} />}
      {view === "partners" && <MarketingPartnersView />}
    </>}
  </div></main>;
}
