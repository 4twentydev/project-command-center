import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Wrench, Zap } from "lucide-react";
import type { SolutionOutcome } from "@/lib/solutions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function SolutionCard({ solution }: { solution: SolutionOutcome }) {
  return (
    <Card className="overflow-hidden bg-card/75 border-border transition hover:border-primary/40">
      <CardContent className="grid gap-6 p-6 md:grid-cols-[70px_1.2fr_1fr] md:items-start md:p-8">
        {/* Number & Icon */}
        <div className="flex items-center justify-between md:block">
          <span className="font-mono text-xs text-muted-foreground">{solution.number}</span>
          <div className="mt-0 grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary md:mt-6">
            <Wrench className="size-5" />
          </div>
        </div>

        {/* Problem vs Solution */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[9px] uppercase tracking-wider bg-primary/20 text-primary border-primary/30">
              {solution.status}
            </Badge>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {solution.kicker}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">{solution.title}</h3>
          </div>

          {/* Friction vs Solution Grid */}
          <div className="space-y-3 font-mono text-xs">
            <div className="rounded-lg border border-destructive/30 bg-destructive/[0.04] p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-destructive font-bold text-[10px] uppercase">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>The Operational Drag</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">{solution.coreProblem}</p>
              <p className="text-foreground text-[11px] font-semibold">{solution.operationalBottleneck}</p>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase">
                <Zap className="size-3.5 shrink-0" />
                <span>How We Engineer The Fix</span>
              </div>
              <p className="text-foreground text-xs leading-relaxed">{solution.howWeSolveIt}</p>
            </div>
          </div>
        </div>

        {/* Composable Capabilities & Diagnostic Handoff */}
        <div className="flex flex-col justify-between h-full border-t border-border pt-6 md:border-l md:border-t-0 md:pl-7 md:pt-0 space-y-6">
          <div className="space-y-4">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block mb-2.5">
                Composable Capabilities
              </span>
              <ul className="space-y-2 font-mono text-xs text-foreground/90">
                {solution.composableCapabilities.map((cap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-[11px] leading-tight">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded border border-border/70 bg-muted/20 p-3 space-y-1 font-mono text-xs">
              <span className="text-[9px] uppercase text-muted-foreground block font-bold">Diagnostic Focus</span>
              <p className="text-muted-foreground text-[11px]">{solution.diagnosticFocus}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {solution.demoUrl && (
              <a
                href={solution.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-xs font-semibold text-primary transition hover:bg-primary/20"
              >
                <span>Test Live In Sandbox</span>
                <ArrowRight className="size-3.5" />
              </a>
            )}
            <Link
              href="/workflow-audit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <span>Book Workflow Audit</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
