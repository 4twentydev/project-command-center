import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers, GitMerge, CheckCircle2, Lock } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CommandCenterButton } from "@/components/command-center-button";
import { PlatformRoleViewer } from "@/components/platform-role-viewer";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { platformModules } from "@/lib/platform";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Platform Architecture & Operational Model",
  description: "Learn how Yorkstead Operations combines a single data model, strict tenant isolation, and composable modules into tailored interfaces.",
  alternates: { canonical: "/platform" },
};

export default function PlatformPage() {
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
          <Link href="/platform" className="px-3 py-2 text-xs text-foreground font-semibold border-b-2 border-primary">
            Platform
          </Link>
          <Link href="/demos" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
            Demos
          </Link>
          <Link href="/work" className="hidden px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:block">
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
            Productized-Custom Architecture // Modular Monolith
          </div>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl">
            One shared data model. <span className="text-primary">Tailored role views.</span>
          </h1>
          <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
            Instead of stitching together five disconnected SaaS apps or maintaining a brittle custom code fork, Yorkstead Operations delivers a productized modular monolith. You get the stability of an enterprise platform with the exact workflow configuration your shop requires.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 font-mono text-xs">
            <Link
              href="/demos"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <span>Explore Interactive Demos</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/workflow-audit"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium transition hover:border-primary/40"
            >
              <span>Book Workflow Audit</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Core Architecture Pillars */}
      <section className="relative mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="grid gap-6 md:grid-cols-3 font-mono text-xs">
          <Card className="bg-card/75 border-border p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Layers className="size-4" />
              <span>1. SINGLE DATA TRUTH</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Quotes, job packets, digital travelers, inventory ledger transactions, and shipping manifests share one coherent database schema. No duplicate data entry or sync delays.
            </p>
          </Card>

          <Card className="bg-card/75 border-border p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Lock className="size-4" />
              <span>2. STRICT TENANT ISOLATION</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Every organization is hard-isolated at the database and API query layer. Demo sandboxes run in strict sandbox isolation with zero external side effects.
            </p>
          </Card>

          <Card className="bg-card/75 border-border p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold">
              <GitMerge className="size-4" />
              <span>3. BOUNDED EXTENSIONS</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Custom business rules, machine rates, checklist steps, and approval thresholds configure declaratively without creating separate unmaintainable codebase forks.
            </p>
          </Card>
        </div>
      </section>

      {/* Role Perspectives Interactive Section */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8 space-y-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
            Role-Scoped Ergonomics
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Each role sees what moves their work. Nothing more.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Operators don&apos;t need to see pricing margins. Estimators don&apos;t need machine calibration logs. The platform shapes each interface around the active persona.
          </p>
        </div>

        <PlatformRoleViewer />
      </section>

      {/* Composable Modules Catalog Grid */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8 space-y-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
            Platform Capabilities
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Composable operational building blocks.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Activate the modules your operation needs today. Add quality containment, maintenance scheduling, or logistics load builders as you scale.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
          {platformModules.map((mod) => (
            <Card key={mod.id} className="bg-card/75 border-border flex flex-col justify-between p-5 space-y-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="font-mono text-[8px] uppercase tracking-wider">
                  {mod.category === "core_foundation" ? "Core Foundation" : "Operational Module"}
                </Badge>
                <h3 className="text-base font-semibold text-foreground tracking-tight">{mod.name}</h3>
                <p className="text-muted-foreground text-[11px] leading-relaxed">{mod.summary}</p>
              </div>

              <div className="pt-3 border-t border-border/80 space-y-1.5">
                <span className="text-[9px] uppercase text-muted-foreground block">Key Features</span>
                {mod.keyCapabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[10px] text-foreground">
                    <CheckCircle2 className="size-3 text-primary shrink-0" />
                    <span className="truncate">{cap}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative border-t border-border bg-card/35">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary mb-2">
            Engineering Consultation
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Ready to configure a system for your shop?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            Book a workflow audit to map your physical shopfloor handoffs into a unified operational software architecture.
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
