import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Layers, Search, Zap } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CommandCenterButton } from "@/components/command-center-button";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "How We Build // Engineering Method & Delivery Contract",
  description: "Learn how Yorkstead Systems engineers industrial software from shopfloor workflow audits to production-grade vertical slices.",
  alternates: { canonical: "/how-we-build" },
};

const buildSteps = [
  {
    number: "01",
    title: "The Diagnostic First Step (Workflow Audit)",
    tag: "90-Minute Technical Inspection",
    icon: Search,
    summary: "We don't start with sales presentations or 50-page speculative requirement documents. We map the exact friction in your current workflow.",
    details: [
      "Walk the physical handoff path from RFQ intake to shipping dock",
      "Identify duplicate spreadsheet entries, missing traveler signoffs, and revision leaks",
      "Define the single smallest high-leverage vertical slice to implement first",
      "Deliver a concrete architecture blueprint with clear milestones and fixed pricing",
    ],
    ctaText: "Book a Workflow Audit",
    ctaHref: "/workflow-audit",
  },
  {
    number: "02",
    title: "Single Truth Schema & Tenant Isolation",
    tag: "Core Data Foundation",
    icon: Layers,
    summary: "Every operational system starts with a rigorous domain model. No messy multi-app synchronization hacks or loose JSON blobs.",
    details: [
      "Integer-cents financial arithmetic for zero rounding drift",
      "Strict organizational boundary enforcement on every database query",
      "Append-only security audit log recording every state transition",
      "Private file storage with time-limited cryptographic URL signing",
    ],
    ctaText: "Explore Platform Architecture",
    ctaHref: "/platform",
  },
  {
    number: "03",
    title: "Role-Scoped Vertical Slice Delivery",
    tag: "Ergonomic Implementation",
    icon: Zap,
    summary: "We build complete end-to-end paths for each specific human role—from machine operator touchscreens to executive margin dashboards.",
    details: [
      "Touch-first shopfloor travelers with CAD drawing locks and QR blocker alerts",
      "Phone-first mobile checklists with offline resilience and photo proof-of-work",
      "Commercial estimating workbenches with automated yield factor calculations",
      "Rigorous automated test suites covering happy paths, edge cases, and permission boundaries",
    ],
    ctaText: "Test Interactive Sandboxes",
    ctaHref: "/demos",
  },
  {
    number: "04",
    title: "Production Verification & Iterative Polish",
    tag: "Zero-Downtime Rollout",
    icon: ShieldCheck,
    summary: "We deploy working software directly to your team and verify adoption on the shop floor before expanding scope.",
    details: [
      "Direct pairing with estimators, operators, and field leads during initial rollout",
      "Instant rollback and deterministic migration recovery safeguards",
      "Measured performance benchmarks replacing vague marketing promises",
      "Continuous declarative extension without brittle code forks",
    ],
    ctaText: "Start a Conversation",
    ctaHref: "/#contact",
  },
];

export default function HowWeBuildPage() {
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
          <Link href="/platform" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
            Platform
          </Link>
          <Link href="/demos" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
            Demos
          </Link>
          <Link href="/work" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
            Work
          </Link>
          <Link href="/how-we-build" className="px-3 py-2 text-xs text-foreground font-semibold border-b-2 border-primary">
            How We Build
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
            Engineering Method // High-Integrity Delivery
          </div>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl">
            How we engineer <span className="text-primary">industrial software.</span>
          </h1>
          <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
            We don&apos;t build speculative prototypes that fail in production or lock you into opaque multi-year consulting retainers. We operate with a strict engineering contract: diagnose the real friction, build the smallest complete vertical slice, and verify adoption on the floor.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 font-mono text-xs">
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

      {/* 4 Build Methodology Steps */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="space-y-8">
          {buildSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} className="overflow-hidden bg-card/75 border-border transition hover:border-primary/40">
                <CardContent className="grid gap-6 p-6 md:grid-cols-[70px_1.2fr_1fr] md:items-start md:p-8">
                  {/* Number & Icon */}
                  <div className="flex items-center justify-between md:block">
                    <span className="font-mono text-xs text-muted-foreground">{step.number}</span>
                    <div className="mt-0 grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary md:mt-6">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="min-w-0 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-[9px] uppercase tracking-wider bg-primary/20 text-primary border-primary/30">
                        {step.tag}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.summary}</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block">
                        Concrete Execution Checklist
                      </span>
                      <ul className="space-y-2 font-mono text-xs text-foreground/90">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                            <span className="text-xs leading-snug">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Next Step Action */}
                  <div className="flex flex-col justify-between h-full border-t border-border pt-6 md:border-l md:border-t-0 md:pl-7 md:pt-0 space-y-6">
                    <div className="rounded border border-border/80 bg-muted/20 p-4 font-mono text-xs space-y-2">
                      <span className="text-[9px] uppercase text-primary font-bold block">Delivery Principle</span>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Every milestone must leave the repository in a buildable, automated-tested, and deployable state.
                      </p>
                    </div>

                    <Link
                      href={step.ctaHref}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-xs font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
                    >
                      <span>{step.ctaText}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative border-t border-border bg-card/35">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary mb-2">
            The Diagnostic First Step
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Start with an honest evaluation of your operation.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            Book our 90-minute Workflow Audit to uncover your highest-ROI software opportunities with zero sales pitch.
          </p>
          <div className="mt-6">
            <Link
              href="/workflow-audit"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <span>Schedule Workflow Audit</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
