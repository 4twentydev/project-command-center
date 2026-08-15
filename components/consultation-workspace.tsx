"use client";

import { useState } from "react";
import {
  AlertTriangle, ArrowLeft, Check, CheckCircle2, ClipboardCheck, ClipboardCopy, Factory,
  FileSearch, Globe2, Lightbulb, Loader2, Megaphone, Plus, Save, ScanLine, Trash2, Workflow, X,
} from "lucide-react";
import Link from "next/link";
import { PaginationControls } from "@/components/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { consultationFieldCount, consultationPlaybooks, getConsultationPlaybook, getConsultationService, type ConsultationField } from "@/lib/consultation-playbooks";
import { consultationStatuses, type ConsultationInput, type ConsultationRecord, type ConsultationStatus } from "@/lib/consultations";
import type { ContactInquiry } from "@/lib/contact-inquiries";
import { createPagination, type Pagination } from "@/lib/pagination";
import type { ServiceSlug } from "@/lib/services";
import { cn } from "@/lib/utils";

type Draft = ConsultationInput & { id?: string; createdAt?: string; updatedAt?: string };

const statusLabels: Record<ConsultationStatus, string> = { draft: "Draft", discovery: "Discovery", scoped: "Scoped", archived: "Archived" };
const serviceIcons = { factory: Factory, workflow: Workflow, website: Globe2, "scan-line": ScanLine } as const;
const selectClass = "h-11 w-full rounded-lg border border-border bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function serviceForLead(lead: ContactInquiry | null) {
  if (!lead?.projectType) return "manufacturing-software" satisfies ServiceSlug;
  const normalized = lead.projectType.toLowerCase();
  if (normalized.includes("automation")) return "workflow-automation";
  if (normalized.includes("website")) return "small-business-websites";
  if (normalized.includes("cnc") || normalized.includes("sign")) return "cnc-signage-systems";
  return "manufacturing-software";
}

function newDraft(serviceSlug: ServiceSlug, lead: ContactInquiry | null = null): Draft {
  return {
    leadId: lead?.id ?? null,
    serviceSlug,
    clientName: lead?.name ?? "",
    business: lead?.company ?? "",
    email: lead?.email ?? "",
    consultationDate: new Date().toISOString().slice(0, 10),
    status: "draft",
    responses: lead ? {
      trigger: lead.message,
      "desired-outcome": lead.intake?.desiredOutcome ?? "",
      "decision-makers": lead.notes ?? "",
      "data-owner": lead.intake?.currentTools ?? "",
    } : {},
  };
}

function summaryFor(draft: Draft) {
  const playbook = getConsultationPlaybook(draft.serviceSlug);
  if (!playbook) return "";
  const service = getConsultationService(playbook);
  const answers = playbook.sections.flatMap((section) => section.fields
    .filter((field) => draft.responses[field.id])
    .map((field) => `### ${field.label}\n${draft.responses[field.id]}`));
  return `# ${draft.business || draft.clientName || "Consultation"} — ${service.name}\n\nClient: ${draft.clientName || "Not recorded"}\nEmail: ${draft.email || "Not recorded"}\nDate: ${draft.consultationDate || "Not scheduled"}\nStage: ${statusLabels[draft.status]}\n\n## Consultation objective\n${playbook.objective}\n\n${answers.join("\n\n")}\n\n## Development gate\n${playbook.developmentGate.map((item) => `- [ ] ${item}`).join("\n")}`;
}

function Field({ field, value, onChange }: { field: ConsultationField; value: string; onChange: (value: string) => void }) {
  const id = `consultation-${field.id}`;
  return <label htmlFor={id} className="block rounded-xl border border-border/70 bg-background/35 p-4 transition focus-within:border-primary/40">
    <span className="flex items-center gap-2 text-sm font-medium">{field.label}{field.required && <span className="text-primary" aria-label="required">*</span>}</span>
    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{field.prompt}</span>
    {field.kind === "long" ? <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 min-h-28 bg-card/70" /> : field.kind === "select" ? <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={cn(selectClass, "mt-3 bg-card/70")}><option value="">Select one</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 bg-card/70" />}
  </label>;
}

function PlaybookGuide({ serviceSlug }: { serviceSlug: ServiceSlug }) {
  const playbook = getConsultationPlaybook(serviceSlug)!;
  const service = getConsultationService(playbook);
  return <aside className="space-y-3 xl:sticky xl:top-5 xl:self-start">
    <Card className="overflow-hidden border-primary/20 bg-primary/[0.035]"><CardContent className="p-5"><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">Call objective</div><p className="mt-3 text-sm leading-6">{playbook.objective}</p><div className="mt-5 space-y-2">{playbook.callPlan.map((item, index) => <div key={item} className="flex gap-3 text-xs leading-5"><span className="font-mono text-primary">{String(index + 1).padStart(2, "0")}</span><span>{item}</span></div>)}</div></CardContent></Card>
    <details className="rounded-xl border border-border bg-card" open><summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium"><FileSearch className="size-4 text-primary" />Evidence to request</summary><div className="space-y-2 border-t border-border px-4 py-4">{playbook.evidenceToRequest.map((item) => <p key={item} className="flex gap-2 text-xs leading-5 text-muted-foreground"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" />{item}</p>)}</div></details>
    <details className="rounded-xl border border-border bg-card"><summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium"><AlertTriangle className="size-4 text-amber-400" />Caution signals</summary><div className="space-y-2 border-t border-border px-4 py-4">{playbook.cautionSignals.map((item) => <p key={item} className="text-xs leading-5 text-muted-foreground">— {item}</p>)}</div></details>
    <details className="rounded-xl border border-border bg-card"><summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium"><Lightbulb className="size-4 text-cyan-400" />Likely deliverables</summary><div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-4">{service.deliverables.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div></details>
    <details className="rounded-xl border border-border bg-card"><summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium"><CheckCircle2 className="size-4 text-emerald-400" />Development gate</summary><div className="space-y-2 border-t border-border px-4 py-4">{playbook.developmentGate.map((item) => <p key={item} className="flex gap-2 text-xs leading-5 text-muted-foreground"><span className="mt-1 size-3.5 shrink-0 rounded border border-emerald-500/40" />{item}</p>)}</div></details>
  </aside>;
}

export function ConsultationWorkspace({ initialConsultations, initialActiveTotal, initialLead, pagination, storageAvailable }: { initialConsultations: ConsultationRecord[]; initialActiveTotal: number; initialLead: ContactInquiry | null; pagination: Pagination; storageAvailable: boolean }) {
  const leadDraft = initialLead ? newDraft(serviceForLead(initialLead), initialLead) : null;
  const [consultations, setConsultations] = useState(initialConsultations);
  const [activeTotal, setActiveTotal] = useState(initialActiveTotal);
  const [total, setTotal] = useState(pagination.total);
  const [draft, setDraft] = useState<Draft | null>(leadDraft);
  const [sectionId, setSectionId] = useState("context");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(storageAvailable ? null : "Run the database migration before saving consultation records.");

  const playbook = draft ? getConsultationPlaybook(draft.serviceSlug) : null;
  const currentSection = playbook?.sections.find((section) => section.id === sectionId) ?? playbook?.sections[0];
  const totalFields = playbook ? consultationFieldCount(playbook) : 0;
  const answeredFields = playbook ? playbook.sections.flatMap((section) => section.fields).filter((field) => Boolean(draft?.responses[field.id]?.trim())).length : 0;
  const requiredFields = playbook ? playbook.sections.flatMap((section) => section.fields).filter((field) => field.required) : [];
  const answeredRequired = requiredFields.filter((field) => Boolean(draft?.responses[field.id]?.trim())).length;
  const progress = totalFields ? Math.round(answeredFields / totalFields * 100) : 0;
  const currentPagination = createPagination(total, pagination.page, pagination.pageSize);
  const previousHref = currentPagination.hasPrevious ? `/dashboard/consultations?page=${currentPagination.page - 1}` : null;
  const nextHref = currentPagination.hasNext ? `/dashboard/consultations?page=${currentPagination.page + 1}` : null;

  function openRecord(record: ConsultationRecord) {
    setDraft(record);
    setSectionId("context");
    setNotice(null);
  }

  function start(serviceSlug: ServiceSlug) {
    setDraft(newDraft(serviceSlug));
    setSectionId("context");
    setNotice(null);
  }

  function update(patch: Partial<Draft>) {
    setDraft((current) => current ? { ...current, ...patch } : current);
  }

  async function save() {
    if (!draft || saving) return;
    if (!draft.clientName.trim() && !draft.business.trim()) { setNotice("Add a client or business name before saving."); return; }
    setSaving(true); setNotice(null);
    const payload: ConsultationInput = {
      leadId: draft.leadId, serviceSlug: draft.serviceSlug, clientName: draft.clientName, business: draft.business,
      email: draft.email, consultationDate: draft.consultationDate, status: draft.status, responses: draft.responses,
    };
    try {
      const response = await fetch("/api/consultations", {
        method: draft.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft.id ? { id: draft.id, consultation: payload } : payload),
      });
      if (!response.ok) throw new Error();
      const saved = (await response.json() as { consultation: ConsultationRecord }).consultation;
      const previous = consultations.find((item) => item.id === saved.id);
      setConsultations((current) => [saved, ...current.filter((item) => item.id !== saved.id)].slice(0, pagination.pageSize));
      if (!previous) setTotal((current) => current + 1);
      const wasActive = previous ? previous.status !== "archived" : false;
      const isActive = saved.status !== "archived";
      if (wasActive !== isActive) setActiveTotal((current) => current + (isActive ? 1 : -1));
      setDraft(saved); setNotice("Consultation saved.");
    } catch { setNotice("The consultation could not be saved. Check the database migration and try again."); }
    finally { setSaving(false); }
  }

  async function remove() {
    if (!draft?.id || !window.confirm("Delete this consultation record? This cannot be undone.")) return;
    setSaving(true); setNotice(null);
    try {
      const response = await fetch("/api/consultations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: draft.id }) });
      if (!response.ok) throw new Error();
      setConsultations((current) => current.filter((item) => item.id !== draft.id));
      setTotal((current) => Math.max(0, current - 1));
      if (draft.status !== "archived") setActiveTotal((current) => Math.max(0, current - 1));
      setDraft(null); setNotice("Consultation deleted.");
    } catch { setNotice("The consultation could not be deleted."); }
    finally { setSaving(false); }
  }

  async function copySummary() {
    if (!draft) return;
    try { await navigator.clipboard.writeText(summaryFor(draft)); setNotice("Development briefing copied as Markdown."); }
    catch { setNotice("Clipboard access was unavailable."); }
  }

  return <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-7 lg:px-9"><div className="mx-auto max-w-[1600px]">
    <header className="mb-6 flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between"><div><Link href="/dashboard" className="mb-3 inline-flex min-h-10 items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5" />Command Center</Link><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Consultation operations</div><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Discovery Playbooks</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Service-specific guides, durable consultation notes, and a clean handoff into scoping and development.</p></div><div className="flex flex-wrap items-center gap-2"><Badge className="border-border bg-secondary text-muted-foreground">{activeTotal} active</Badge><Button variant="ghost" asChild><Link href="/dashboard/marketing"><Megaphone />Marketing</Link></Button>{draft && <Button variant="outline" onClick={() => setDraft(null)}><X />Close record</Button>}<Button onClick={() => start("manufacturing-software")}><Plus />New consultation</Button></div></header>

    {notice && <div role="status" className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground"><span>{notice}</span><button onClick={() => setNotice(null)} aria-label="Dismiss notice"><X className="size-3.5" /></button></div>}

    {!draft ? <div className="grid gap-6 xl:grid-cols-[1fr_320px]"><section><div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="text-lg font-semibold">Choose the work</h2><p className="mt-1 text-xs text-muted-foreground">Each template follows the service from first conversation to development readiness.</p></div></div><div className="grid gap-3 md:grid-cols-2">{consultationPlaybooks.map((item) => { const service = getConsultationService(item); const Icon = serviceIcons[service.icon]; return <Card key={item.serviceSlug} className="group overflow-hidden transition hover:border-primary/35"><CardContent className="p-5"><div className="flex items-start justify-between gap-4"><span className="grid size-10 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary"><Icon className="size-5" /></span><span className="font-mono text-[9px] text-muted-foreground">{service.number} · {consultationFieldCount(item)} prompts</span></div><h3 className="mt-5 text-lg font-semibold">{service.name}</h3><p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">{item.objective}</p><div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="text-[11px] text-muted-foreground">{item.sections.length} guided sections</span><Button size="sm" onClick={() => start(item.serviceSlug)}>Start template</Button></div></CardContent></Card>; })}</div></section><section><div className="mb-4"><h2 className="text-lg font-semibold">Recent consultations</h2><p className="mt-1 text-xs text-muted-foreground">Resume without rebuilding context.</p></div><div className="space-y-2">{consultations.length ? consultations.map((record) => { const item = getConsultationPlaybook(record.serviceSlug)!; const service = getConsultationService(item); return <button key={record.id} onClick={() => openRecord(record)} className="w-full rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/35 hover:bg-accent/30"><div className="flex items-center justify-between gap-2"><Badge variant="secondary">{statusLabels[record.status]}</Badge><span className="font-mono text-[9px] text-muted-foreground">{new Date(record.updatedAt).toLocaleDateString()}</span></div><div className="mt-3 font-medium">{record.business || record.clientName}</div><div className="mt-1 text-xs text-muted-foreground">{service.name}{record.clientName && record.business ? ` · ${record.clientName}` : ""}</div></button>; }) : <Card><CardContent className="grid min-h-44 place-items-center text-center"><div><ClipboardCheck className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 text-xs leading-5 text-muted-foreground">Saved consultations will appear here.</p></div></CardContent></Card>}</div><PaginationControls pagination={currentPagination} previousHref={previousHref} nextHref={nextHref} noun="consultations" /></section></div> : playbook && currentSection ? <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)_320px]">
      <nav className="space-y-4 xl:sticky xl:top-5 xl:self-start"><Card><CardContent className="p-3"><div className="px-2 pb-3 pt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Record sections</div><div className="space-y-1">{playbook.sections.map((section, index) => { const complete = section.fields.filter((field) => draft.responses[field.id]?.trim()).length; return <button key={section.id} onClick={() => setSectionId(section.id)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-xs transition", section.id === currentSection.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}><span className="font-mono text-[9px]">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 truncate">{section.title}</span><span className="font-mono text-[9px]">{complete}/{section.fields.length}</span></button>; })}</div></CardContent></Card><Card><CardContent className="p-4"><div className="flex items-end justify-between"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Overall capture</div><div className="mt-1 text-2xl font-semibold">{progress}%</div></div><div className="text-right text-[10px] text-muted-foreground">Required<br />{answeredRequired}/{requiredFields.length}</div></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div></CardContent></Card><div className="grid grid-cols-2 gap-2 xl:grid-cols-1"><Button onClick={() => void save()} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save />}Save record</Button><Button variant="outline" onClick={() => void copySummary()}><ClipboardCopy />Copy briefing</Button>{draft.id && <Button variant="ghost" className="col-span-2 text-red-400 hover:text-red-300 xl:col-span-1" onClick={() => void remove()} disabled={saving}><Trash2 />Delete</Button>}</div></nav>

      <section className="min-w-0 space-y-4"><Card className="bg-card/80"><CardContent className="p-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium">Client name<Input className="mt-2" value={draft.clientName} onChange={(event) => update({ clientName: event.target.value })} /></label><label className="text-xs font-medium">Business<Input className="mt-2" value={draft.business} onChange={(event) => update({ business: event.target.value })} /></label><label className="text-xs font-medium">Email<Input className="mt-2" type="email" value={draft.email} onChange={(event) => update({ email: event.target.value })} /></label><label className="text-xs font-medium">Consultation date<Input className="mt-2" type="date" value={draft.consultationDate} onChange={(event) => update({ consultationDate: event.target.value })} /></label><label className="text-xs font-medium">Service<select className={cn(selectClass, "mt-2")} value={draft.serviceSlug} onChange={(event) => { update({ serviceSlug: event.target.value as ServiceSlug, responses: {} }); setSectionId("context"); }}>{consultationPlaybooks.map((item) => <option key={item.serviceSlug} value={item.serviceSlug}>{getConsultationService(item).name}</option>)}</select></label><label className="text-xs font-medium">Stage<select className={cn(selectClass, "mt-2")} value={draft.status} onChange={(event) => update({ status: event.target.value as ConsultationStatus })}>{consultationStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label></div></CardContent></Card>
        <div className="rounded-xl border border-border bg-card/70 p-5 sm:p-6"><div className="mb-6 flex flex-col justify-between gap-3 border-b border-border pb-5 sm:flex-row sm:items-start"><div><div className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">Guided discovery · {getConsultationService(playbook).name}</div><h2 className="mt-2 text-2xl font-semibold">{currentSection.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{currentSection.description}</p></div><Badge variant="secondary">{currentSection.fields.length} prompts</Badge></div><div className="space-y-3">{currentSection.fields.map((field) => <Field key={field.id} field={field} value={draft.responses[field.id] ?? ""} onChange={(value) => update({ responses: { ...draft.responses, [field.id]: value } })} />)}</div><div className="mt-6 flex items-center justify-between border-t border-border pt-5"><Button variant="ghost" disabled={playbook.sections[0].id === currentSection.id} onClick={() => { const index = playbook.sections.findIndex((section) => section.id === currentSection.id); setSectionId(playbook.sections[Math.max(0, index - 1)].id); }}>Previous</Button><span className="font-mono text-[9px] text-muted-foreground">{playbook.sections.findIndex((section) => section.id === currentSection.id) + 1} / {playbook.sections.length}</span><Button variant="outline" disabled={playbook.sections.at(-1)?.id === currentSection.id} onClick={() => { const index = playbook.sections.findIndex((section) => section.id === currentSection.id); setSectionId(playbook.sections[Math.min(playbook.sections.length - 1, index + 1)].id); }}>Next section</Button></div></div>
      </section><PlaybookGuide serviceSlug={draft.serviceSlug} />
    </div> : null}
  </div></main>;
}
