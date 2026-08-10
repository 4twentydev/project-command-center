"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialContactState: ContactState = { status: "idle", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button className="h-11 w-full sm:w-auto" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Send />}{pending ? "Sending…" : "Send project brief"}</Button>;
}

export function ContactForm() {
  const [state, action] = useActionState(submitContact, initialContactState);
  return <form action={action} className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" autoComplete="name" placeholder="Your name" aria-invalid={Boolean(state.errors?.name)} required />{state.errors?.name && <p className="text-xs text-red-400">{state.errors.name}</p>}</div><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" aria-invalid={Boolean(state.errors?.email)} required />{state.errors?.email && <p className="text-xs text-red-400">{state.errors.email}</p>}</div></div>
    <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="company">Company <span className="text-muted-foreground">(optional)</span></Label><Input id="company" name="company" autoComplete="organization" placeholder="Company or shop" /></div><div className="space-y-2"><Label htmlFor="projectType">What are we building?</Label><select id="projectType" name="projectType" defaultValue="" className="h-11 w-full rounded-lg border border-border bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"><option value="" disabled>Select a project type</option><option>Custom web application</option><option>Workflow automation</option><option>Website or client portal</option><option>CNC / signage system</option><option>Prototype or consulting</option><option>Something else</option></select></div></div>
    <div className="space-y-2"><Label htmlFor="budget">Working budget</Label><select id="budget" name="budget" defaultValue="" className="h-11 w-full rounded-lg border border-border bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"><option value="" disabled>Select a range if you have one</option><option>Under $2,500</option><option>$2,500–$5,000</option><option>$5,000–$10,000</option><option>$10,000+</option><option>Not sure yet</option></select></div>
    <div className="space-y-2"><Label htmlFor="message">What problem needs solving?</Label><Textarea id="message" name="message" placeholder="Describe what is slowing you down, what you have tried, and what a useful result would look like." aria-invalid={Boolean(state.errors?.message)} required />{state.errors?.message && <p className="text-xs text-red-400">{state.errors.message}</p>}</div>
    <div className="sr-only" aria-hidden="true"><Label htmlFor="website">Website</Label><Input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    {state.message && <div role="status" className={cn("flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs leading-5", state.status === "success" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400")}>{state.status === "success" && <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}{state.message}</div>}
    <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-md text-xs leading-5 text-muted-foreground">No mailing list and no sales pipeline theater—just a direct project conversation.</p><SubmitButton /></div>
  </form>;
}
