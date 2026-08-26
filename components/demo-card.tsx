import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import type { PublicDemo } from "@/lib/demos";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function DemoCard({ demo }: { demo: PublicDemo }) {
  return (
    <Card className="overflow-hidden bg-card/75 border-border transition hover:border-primary/40">
      <CardContent className="grid gap-6 p-6 md:grid-cols-[70px_1.15fr_1fr] md:items-start md:p-8">
        {/* Number & Icon */}
        <div className="flex items-center justify-between md:block">
          <span className="font-mono text-xs text-muted-foreground">{demo.number}</span>
          <div className="mt-0 grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary md:mt-6">
            <Zap className="size-5" />
          </div>
        </div>

        {/* Core Content */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[9px] uppercase tracking-wider bg-primary/20 text-primary border-primary/30">
              {demo.maturity}
            </Badge>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {demo.industry}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">{demo.title}</h3>
            <p className="mt-1 font-mono text-xs text-primary">{demo.kicker}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{demo.summary}</p>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-1.5 font-mono text-xs">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">
              Operational Problem Addressed
            </span>
            <p className="text-foreground text-xs leading-relaxed">{demo.operationalProblem}</p>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
              Workflows Demonstrated in Sandbox
            </span>
            <ul className="space-y-1.5 font-mono text-xs text-foreground/90">
              {demo.workflowsShown.map((wf, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-[11px] leading-tight">{wf}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Metrics, Disclaimer & Launch Action */}
        <div className="flex flex-col justify-between h-full border-t border-border pt-6 md:border-l md:border-t-0 md:pl-7 md:pt-0 space-y-6">
          <div className="space-y-4">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                Operational Benchmark Signals
              </span>
              <div className="grid grid-cols-3 gap-2">
                {demo.metrics.map((m) => (
                  <div key={m.label} className="rounded border border-border bg-card p-2 text-center font-mono">
                    <span className="text-[8px] uppercase text-muted-foreground block truncate">{m.label}</span>
                    <strong className="text-foreground text-xs">{m.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-border/60 bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[9px] uppercase">
                <ShieldCheck className="size-3 text-primary" />
                <span>Synthetic Isolation Guarantee</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {demo.dataDisclaimer}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={demo.canonicalLaunchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-xs font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <span>Launch Live Sandbox</span>
              <ArrowRight className="size-4" />
            </a>
            <span className="mt-2 block text-center font-mono text-[9px] text-muted-foreground">
              Direct handoff to ops.yorkstead.com/demo
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
