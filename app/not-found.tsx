import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileQuestion } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { TrackedLink } from "@/components/conversion-tracker";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested 4TWENTY.DEV page could not be found.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <main className="relative flex min-h-screen flex-col overflow-hidden"><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_65%_0%,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_38%)]" /><header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><BrandMark /><ThemeToggle /></header><section className="relative mx-auto grid w-full max-w-7xl flex-1 place-items-center px-5 py-20 sm:px-8"><div className="max-w-2xl"><div className="grid size-12 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><FileQuestion className="size-5" aria-hidden="true" /></div><div className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">404 · Missing route</div><h1 className="mt-4 text-5xl font-semibold leading-[.95] tracking-[-0.055em] sm:text-7xl">This handoff went missing.</h1><p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">The page may have moved, but the useful paths are still here: review the services, inspect selected work, or start with the workflow that is causing trouble.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground">Return home <ArrowRight className="size-4" aria-hidden="true" /></Link><TrackedLink href="/workflow-audit" event="workflow_audit_cta_click" metadata={{ placement: "404" }} className="inline-flex h-11 items-center rounded-lg border border-border bg-card px-5 text-sm font-medium">Book a workflow audit</TrackedLink><Link href="/#contact" className="inline-flex h-11 items-center rounded-lg px-4 text-sm text-muted-foreground hover:text-foreground">Start a conversation</Link></div></div></section><SiteFooter /></main>;
}
