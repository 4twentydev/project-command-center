import {
  FlaskConical,
  AlertTriangle,
  Database,
  Archive,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import type { LabExperiment } from "@/lib/labs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function LabExperimentCard({ experiment }: { experiment: LabExperiment }) {
  const isArchived = experiment.status === "archived";

  return (
    <Card className={`overflow-hidden border-border transition hover:border-primary/40 ${
      isArchived ? "bg-card/40 opacity-80" : "bg-card/75"
    }`}>
      <CardContent className="grid gap-6 p-6 md:grid-cols-[70px_1.2fr_1fr] md:items-start md:p-8">
        {/* Number & Icon */}
        <div className="flex items-center justify-between md:block">
          <span className="font-mono text-xs text-muted-foreground">{experiment.number}</span>
          <div className={`mt-0 grid size-11 place-items-center rounded-xl border md:mt-6 ${
            isArchived
              ? "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
              : "border-primary/20 bg-primary/10 text-primary"
          }`}>
            {isArchived ? <Archive className="size-5" /> : <FlaskConical className="size-5" />}
          </div>
        </div>

        {/* Experiment Core Content */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={`font-mono text-[9px] uppercase tracking-wider ${
                isArchived
                  ? "bg-muted text-muted-foreground border-border"
                  : "bg-primary/20 text-primary border-primary/30"
              }`}
            >
              {experiment.maturity}
            </Badge>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {experiment.category}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">{experiment.title}</h3>
            <p className="mt-1 font-mono text-xs text-primary">{experiment.kicker}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{experiment.purpose}</p>
          </div>

          {/* Operational Hypothesis */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-1 font-mono text-xs">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">
              Operational Hypothesis
            </span>
            <p className="text-foreground text-xs leading-relaxed">{experiment.operationalHypothesis}</p>
          </div>

          {/* Key Findings */}
          <div className="space-y-2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
              Observed Architectural Findings
            </span>
            <ul className="space-y-1.5 font-mono text-xs text-foreground/90">
              {experiment.findings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-[11px] leading-tight">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Limitations, Data Source & Interaction Handoff */}
        <div className="flex flex-col justify-between h-full border-t border-border pt-6 md:border-l md:border-t-0 md:pl-7 md:pt-0 space-y-6">
          <div className="space-y-4">
            {/* Limitations Notice */}
            <div className="rounded border border-amber-500/30 bg-amber-500/[0.04] p-3 space-y-1 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[9px] uppercase">
                <AlertTriangle className="size-3 shrink-0" />
                <span>Prototype Limitations</span>
              </div>
              <p className="text-muted-foreground text-[10px] leading-relaxed">
                {experiment.limitations}
              </p>
            </div>

            {/* Data Source */}
            <div className="rounded border border-border/60 bg-muted/20 p-3 space-y-1 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[9px] uppercase font-bold">
                <Database className="size-3 text-primary" />
                <span>Synthetic Data Source</span>
              </div>
              <p className="text-muted-foreground text-[10px]">{experiment.dataSource}</p>
            </div>

            {/* Technologies */}
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                Evaluated Technologies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {experiment.technologies.map((t) => (
                  <Badge key={t} variant="outline" className="font-mono text-[9px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            {experiment.interactionUrl ? (
              <a
                href={experiment.interactionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-xs font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
              >
                <span>{experiment.interactionType}</span>
                <ExternalLink className="size-3.5" />
              </a>
            ) : (
              <div className="rounded border border-border bg-card p-2.5 text-center font-mono text-[10px] text-muted-foreground">
                {experiment.interactionType}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
