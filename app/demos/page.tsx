import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Terminal, RefreshCcw } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CommandCenterButton } from "@/components/command-center-button";
import { DemoCard } from "@/components/demo-card";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { publicDemos } from "@/lib/demos";

export const metadata: Metadata = {
  title: "Interactive Operations Sandboxes & Demos",
  description: "Live, deterministic operations sandboxes running synthetic industrial workflows spanning manufacturing, facility maintenance, signage fabrication, and mobile fleets.",
  alternates: { canonical: "/demos" },
};

export default function DemosPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_0%,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_38%)]" />

      {/* Header */}
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <BrandMark />
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <Link href="/#services" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
            Software + automation
          </Link>
          <Link href="/demos" className="px-3 py-2 text-xs text-foreground font-semibold border-b-2 border-primary">
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
            Live Sandboxes // Deterministic Operations
          </div>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl">
            Software with an operating point of view. <span className="text-primary">Test the real workflows.</span>
          </h1>
          <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
            Explore live, interactive sandboxes built on Yorkstead Operations. Each environment demonstrates honest problem-solving across estimating, shopfloor traveler routing, quality containment, and field dispatch.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              <span>100% Synthetic Datasets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCcw className="size-4 text-primary" />
              <span>Deterministic Instant Reset</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Terminal className="size-4 text-primary" />
              <span>Zero Live Gateway Charges</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demos Showcase Grid */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="space-y-8">
          {publicDemos.map((demo) => (
            <DemoCard key={demo.slug} demo={demo} />
          ))}
        </div>
      </section>

      {/* Contact Banner */}
      <section className="relative border-t border-border bg-card/35">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary mb-2">
            Tailored Engineering
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Need a workflow engine configured for your shop?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            Let&apos;s map your actual quoting, shopfloor, and shipping bottlenecks into a dedicated operational system.
          </p>
          <div className="mt-6">
            <Link
              href="/#contact"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <span>Schedule Workflow Consultation</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
