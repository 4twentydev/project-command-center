import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CommandCenterButton } from "@/components/command-center-button";
import { SolutionCard } from "@/components/solution-card";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { publicSolutions } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Operational Solutions & Capabilities",
  description: "Problem-led operational software solutions for manufacturers, custom fabrication shops, and field service contractors.",
  alternates: { canonical: "/solutions" },
};

export default function SolutionsPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_0%,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_38%)]" />

      {/* Header */}
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <BrandMark />
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <Link href="/solutions" className="px-3 py-2 text-xs text-foreground font-semibold border-b-2 border-primary">
            Solutions
          </Link>
          <Link href="/demos" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
            Demos
          </Link>
          <Link href="/#work" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
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
      <section className="relative mx-auto max-w-7xl px-5 pt-12 pb-16 sm:px-8 sm:pt-16 sm:pb-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            Outcome-Led Engineering // Composable Systems
          </div>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl">
            From stubborn friction to <span className="text-primary">working operating systems.</span>
          </h1>
          <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
            We don&apos;t build bloated feature dumps. We target the exact points where quotes stall, drawings get scrapped, inventory drifts, and field crews lose paperwork.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/workflow-audit"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <span>Book a Workflow Audit</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/demos"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium transition hover:border-primary/40"
            >
              <span>Explore Interactive Demos</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Solutions Cards Grid */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="space-y-8">
          {publicSolutions.map((solution) => (
            <SolutionCard key={solution.slug} solution={solution} />
          ))}
        </div>
      </section>

      {/* Diagnostic Callout Banner */}
      <section className="relative border-t border-border bg-card/35">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary mb-2">
            The Diagnostic First Step
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Not sure which bottleneck is costing you the most?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            Our 90-minute Workflow Audit dissects your current paper, spreadsheet, and software handoffs to deliver a concrete engineering plan with zero sales fluff.
          </p>
          <div className="mt-6">
            <Link
              href="/workflow-audit"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <span>Schedule Your Workflow Audit</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
