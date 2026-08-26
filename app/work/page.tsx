import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Github, MoveUpRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CommandCenterButton } from "@/components/command-center-button";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { WorkPortfolio } from "@/components/work-portfolio";

export const metadata: Metadata = {
  title: "Selected Work & Systems Portfolio",
  description: "Detailed project profiles of live industrial systems, internal platforms, commerce engines, and working operational prototypes.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_0%,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_38%)]" />

      {/* Header */}
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <BrandMark />
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <Link href="/solutions" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
            Solutions
          </Link>
          <Link href="/demos" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
            Demos
          </Link>
          <Link href="/work" className="px-3 py-2 text-xs text-foreground font-semibold border-b-2 border-primary">
            Work
          </Link>
          <Link href="/about" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground lg:block">
            About
          </Link>
          <Link href="/#contact" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
            Contact
          </Link>
          <ThemeToggle />
          <CommandCenterButton />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-5 pt-12 pb-12 sm:px-8 sm:pt-16 sm:pb-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Verified Systems & Profiles // Evidence-Led
            </div>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl">
              Systems with an <span className="text-primary">operating point of view.</span>
            </h1>
            <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
              Five live systems and two working prototypes spanning release control, internal operations, online commerce, inventory visibility, tableside POS, and production analytics.
            </p>
          </div>

          <a
            href="https://github.com/rivetworks"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-mono text-xs text-muted-foreground transition hover:text-foreground hover:border-primary/40 shrink-0"
          >
            <Github className="size-4" />
            <span>View GitHub</span>
            <MoveUpRight className="size-3.5" />
          </a>
        </div>
      </section>

      {/* Interactive Portfolio Section */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <WorkPortfolio />
      </section>

      {/* Consultation Banner */}
      <section className="relative border-t border-border bg-card/35">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary mb-2">
            Scope Your System
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Have a custom operational problem worth solving?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            We build focused, durable software for companies beyond spreadsheets and paper. Start with a direct, confidential consultation.
          </p>
          <div className="mt-6">
            <Link
              href="/#contact"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <span>Start a Project Conversation</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
