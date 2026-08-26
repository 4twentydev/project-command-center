'use client';

import * as React from "react";
import Link from "next/link";
import { CaseStudyCard } from "@/components/case-study-card";
import { ProjectStatusLegend } from "@/components/project-status-legend";
import { caseStudies } from "@/lib/case-studies";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export function WorkPortfolio() {
  const [activeCategory, setActiveCategory] = React.useState<"all" | "client" | "platform" | "labs">("all");

  const categories = [
    { id: "all", label: "All Systems & Profiles", count: caseStudies.length },
    { id: "client", label: "Client Engagements", count: 2 },
    { id: "platform", label: "Platforms & Internal Tools", count: 3 },
    { id: "labs", label: "Labs & Prototypes", count: 2 },
  ] as const;

  const filteredStudies = caseStudies.filter((study) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "client") return ["elward-flow", "acm-weekly"].includes(study.slug);
    if (activeCategory === "platform") return ["work-control", "jwld-store", "employee-barcodes"].includes(study.slug);
    if (activeCategory === "labs") return ["shop-inventory", "sic-pizza-pos"].includes(study.slug);
    return true;
  });

  return (
    <div className="space-y-10">
      {/* Category Tabs & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        <Link
          href="/demos"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
        >
          <Sparkles className="size-3.5" />
          <span>Explore 4 Interactive Sandboxes</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Legend */}
      <ProjectStatusLegend />

      {/* Case Studies Grid */}
      <div className="space-y-6">
        {filteredStudies.map((study) => (
          <CaseStudyCard key={study.slug} study={study} />
        ))}
      </div>

      {/* Portfolio Governance & Honest Labeling Guarantee */}
      <div className="rounded-xl border border-border bg-card/60 p-6 sm:p-8 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-primary font-bold">
          <ShieldCheck className="size-4" />
          <span>PORTFOLIO GOVERNANCE & EVIDENCE INTEGRITY</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Every profile on this page distinguishes live, deployed software from exploratory prototypes and intended outcomes. Quantified performance metrics are published only when backed by measured evidence; illustrative metrics are explicitly labeled.
        </p>
      </div>
    </div>
  );
}
