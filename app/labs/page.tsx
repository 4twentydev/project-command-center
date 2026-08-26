import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CommandCenterButton } from "@/components/command-center-button";
import { LabExperimentCard } from "@/components/lab-experiment-card";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { publicLabExperiments } from "@/lib/labs";

export const metadata: Metadata = {
  title: "Applied R&D, Prototypes & Experiments",
  description: "Yorkstead Labs: Functional prototypes, edge hardware telemetry spikes, and applied industrial R&D explorations.",
  alternates: { canonical: "/labs" },
};

export default function LabsPage() {
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
          <Link href="/work" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
            Work
          </Link>
          <Link href="/labs" className="px-3 py-2 text-xs text-foreground font-semibold border-b-2 border-primary">
            Labs
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
            Applied Industrial R&D // Experimental Lab Spikes
          </div>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl">
            Applied R&D with <span className="text-primary">explicit boundaries.</span>
          </h1>
          <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
            Yorkstead Labs is where we test operational ideas, edge hardware protocols, and functional prototypes before deciding whether they belong in our core platform.
          </p>

          <div className="mt-8 rounded-lg border border-amber-500/40 bg-amber-500/[0.04] p-4 text-xs font-mono text-muted-foreground space-y-1">
            <div className="flex items-center gap-2 text-amber-500 font-bold">
              <ShieldAlert className="size-4 shrink-0" />
              <span>EXPERIMENTAL DISCLAIMER</span>
            </div>
            <p>
              Prototypes on this page are non-production explorations. Each record explicitly states its current maturity, known limitations, and synthetic data sources. Dangerous industrial operations or live billing integrations are strictly blocked.
            </p>
          </div>
        </div>
      </section>

      {/* Experiments Showcase Grid */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="space-y-8">
          {publicLabExperiments.map((experiment) => (
            <LabExperimentCard key={experiment.slug} experiment={experiment} />
          ))}
        </div>
      </section>

      {/* Contact & Consultation Banner */}
      <section className="relative border-t border-border bg-card/35">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary mb-2">
            R&D Collaborations
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Have a custom machine protocol or prototype in mind?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            We partner with manufacturers and technical operators on focused proof-of-concept development and workflow spikes.
          </p>
          <div className="mt-6">
            <Link
              href="/#contact"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <span>Discuss an R&D Prototype</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
