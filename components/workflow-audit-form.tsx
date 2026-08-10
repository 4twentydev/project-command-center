"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { submitWorkflowAudit, type WorkflowAuditState } from "@/app/actions/workflow-audit";
import { trackConversionEvent } from "@/components/conversion-tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brand } from "@/lib/brand";
import { workflowAuditContactMethods, workflowAuditEmployeeRanges, workflowAuditIndustries, type WorkflowAuditField } from "@/lib/workflow-audit";
import { cn } from "@/lib/utils";

const initialState: WorkflowAuditState = { status: "idle", message: "" };
const selectClass = "h-11 w-full rounded-lg border border-border bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="text-xs text-red-500 dark:text-red-400">{message}</p> : null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button className="h-11 w-full sm:w-auto" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Send />}{pending ? "Submitting securely…" : "Request workflow audit"}</Button>;
}

export function WorkflowAuditBookingLink({ href, className }: { href: string; className?: string }) {
  return <a href={href} target="_blank" rel="noreferrer" onClick={() => trackConversionEvent("workflow_audit_booking_click")} className={className}>Book the review call <ArrowRight className="size-4" /></a>;
}

export function WorkflowAuditForm({ bookingURL }: { bookingURL: string | null }) {
  const [state, action] = useActionState(submitWorkflowAudit, initialState);
  const started = useRef(false);
  const trackStart = () => { if (!started.current) { started.current = true; trackConversionEvent("workflow_audit_form_start"); } };
  const trackInvalid = (event: React.InvalidEvent<HTMLFormElement>) => {
    const field = (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).name as WorkflowAuditField;
    if (field) trackConversionEvent("workflow_audit_validation_error", field);
  };

  if (state.status === "success" || state.status === "duplicate") {
    return <div role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-6 sm:p-8"><div className="grid size-11 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-5" /></div><div className="mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">{state.status === "duplicate" ? "Already received" : "Intake received"}</div><h2 className="mt-2 text-2xl font-semibold tracking-tight">The next step is a direct review.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{state.message}</p><div className="mt-6 flex flex-wrap gap-3">{bookingURL ? <WorkflowAuditBookingLink href={bookingURL} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground" /> : <a href={`mailto:${brand.email}?subject=${encodeURIComponent("Workflow audit follow-up | 4TWENTY.DEV")}`} className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium">Email a follow-up <ArrowRight className="size-4" /></a>}<Link href="/" className="inline-flex h-11 items-center rounded-lg px-4 text-sm text-muted-foreground hover:text-foreground">Return to {brand.name}</Link></div></div>;
  }

  return <form action={action} onFocusCapture={trackStart} onInvalidCapture={trackInvalid} className="space-y-6" noValidate={false}>
    <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="audit-name">Name</Label><Input id="audit-name" name="name" autoComplete="name" minLength={2} maxLength={100} required aria-invalid={Boolean(state.errors?.name)} aria-describedby={state.errors?.name ? "audit-name-error" : undefined} /><FieldError id="audit-name-error" message={state.errors?.name} /></div><div className="space-y-2"><Label htmlFor="audit-business">Business</Label><Input id="audit-business" name="business" autoComplete="organization" minLength={2} maxLength={160} required aria-invalid={Boolean(state.errors?.business)} aria-describedby={state.errors?.business ? "audit-business-error" : undefined} /><FieldError id="audit-business-error" message={state.errors?.business} /></div></div>
    <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="audit-email">Email</Label><Input id="audit-email" name="email" type="email" autoComplete="email" maxLength={180} required aria-invalid={Boolean(state.errors?.email)} aria-describedby={state.errors?.email ? "audit-email-error" : undefined} /><FieldError id="audit-email-error" message={state.errors?.email} /></div><div className="space-y-2"><Label htmlFor="audit-phone">Phone <span className="text-muted-foreground">(optional)</span></Label><Input id="audit-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={40} aria-invalid={Boolean(state.errors?.phone)} aria-describedby={state.errors?.phone ? "audit-phone-error" : undefined} /><FieldError id="audit-phone-error" message={state.errors?.phone} /></div></div>
    <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="audit-industry">Industry</Label><select id="audit-industry" name="industry" defaultValue="" required className={selectClass} aria-invalid={Boolean(state.errors?.industry)} aria-describedby={state.errors?.industry ? "audit-industry-error" : undefined}><option value="" disabled>Select the closest fit</option>{workflowAuditIndustries.map((item) => <option key={item}>{item}</option>)}</select><FieldError id="audit-industry-error" message={state.errors?.industry} /></div><div className="space-y-2"><Label htmlFor="audit-employees">Number of employees <span className="text-muted-foreground">(optional)</span></Label><select id="audit-employees" name="employees" defaultValue="" className={selectClass} aria-invalid={Boolean(state.errors?.employees)} aria-describedby={state.errors?.employees ? "audit-employees-error" : undefined}><option value="">Prefer not to say</option>{workflowAuditEmployeeRanges.map((item) => <option key={item}>{item}</option>)}</select><FieldError id="audit-employees-error" message={state.errors?.employees} /></div></div>
    <div className="space-y-2"><Label htmlFor="audit-tools">Current tools</Label><Textarea id="audit-tools" name="currentTools" minLength={2} maxLength={1200} required placeholder="Spreadsheets, QuickBooks, paper travelers, whiteboards, scheduling apps…" aria-invalid={Boolean(state.errors?.currentTools)} aria-describedby={state.errors?.currentTools ? "audit-tools-error" : "audit-tools-help"} /><p id="audit-tools-help" className="text-xs leading-5 text-muted-foreground">List only the tools involved in this workflow—no passwords, customer records, or proprietary files.</p><FieldError id="audit-tools-error" message={state.errors?.currentTools} /></div>
    <div className="space-y-2"><Label htmlFor="audit-workflow">Most frustrating workflow</Label><Textarea id="audit-workflow" name="frustratingWorkflow" minLength={20} maxLength={4000} required placeholder="Where does the work slow down, get re-entered, become uncertain, or pull the owner back in?" aria-invalid={Boolean(state.errors?.frustratingWorkflow)} aria-describedby={state.errors?.frustratingWorkflow ? "audit-workflow-error" : undefined} /><FieldError id="audit-workflow-error" message={state.errors?.frustratingWorkflow} /></div>
    <div className="grid gap-5 sm:grid-cols-[.65fr_1.35fr]"><div className="space-y-2"><Label htmlFor="audit-hours">Hours lost per week <span className="text-muted-foreground">(optional estimate)</span></Label><Input id="audit-hours" name="hoursLost" type="number" inputMode="decimal" min="0" max="168" step="0.5" aria-invalid={Boolean(state.errors?.hoursLost)} aria-describedby={state.errors?.hoursLost ? "audit-hours-error" : undefined} /><FieldError id="audit-hours-error" message={state.errors?.hoursLost} /></div><div className="space-y-2"><Label htmlFor="audit-contact">Preferred contact method</Label><select id="audit-contact" name="preferredContact" defaultValue="Email" required className={selectClass} aria-invalid={Boolean(state.errors?.preferredContact)} aria-describedby={state.errors?.preferredContact ? "audit-contact-error" : undefined}>{workflowAuditContactMethods.map((item) => <option key={item}>{item}</option>)}</select><FieldError id="audit-contact-error" message={state.errors?.preferredContact} /></div></div>
    <div className="space-y-2"><Label htmlFor="audit-outcome">Desired outcome</Label><Textarea id="audit-outcome" name="desiredOutcome" minLength={20} maxLength={3000} required placeholder="What would become clearer, faster, or easier to manage if this workflow worked properly?" aria-invalid={Boolean(state.errors?.desiredOutcome)} aria-describedby={state.errors?.desiredOutcome ? "audit-outcome-error" : undefined} /><FieldError id="audit-outcome-error" message={state.errors?.desiredOutcome} /></div>
    <div className="sr-only" aria-hidden="true"><Label htmlFor="audit-website">Website</Label><Input id="audit-website" name="website" tabIndex={-1} autoComplete="off" /></div>
    {state.message ? <div role="alert" className={cn("rounded-lg border px-3 py-2.5 text-xs leading-5", "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400")}>{state.message}</div> : null}
    <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xl text-xs leading-5 text-muted-foreground">Your intake is stored privately in the owner’s lead pipeline. No mailing list, advertising profile, or third-party analytics identifier is created.</p><SubmitButton /></div>
  </form>;
}
