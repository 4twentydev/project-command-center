import Link from "next/link";
import { ArrowRight, Gauge, Layers3, ScanLine } from "lucide-react";
import type { CaseStudy } from "@/lib/case-studies";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const icons = { gauge: Gauge, "scan-line": ScanLine, layers: Layers3 };

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  const Icon = icons[study.icon];
  return <Link href={`/work/${study.slug}`} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background" aria-label={`View the ${study.title} project profile`}><Card className="overflow-hidden bg-card/70 transition group-hover:border-primary/30"><CardContent className="grid gap-6 p-6 md:grid-cols-[80px_1fr_.8fr] md:items-center md:p-8"><div className="flex items-center justify-between md:block"><span className="font-mono text-xs text-muted-foreground">{study.number}</span><div className="mt-0 grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary md:mt-7"><Icon className="size-5" /></div></div><div><div className="flex flex-wrap items-center gap-2"><ProjectStatusBadge status={study.status} /><span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{study.kicker}</span></div><h3 className="mt-4 text-2xl font-semibold tracking-tight">{study.title}</h3><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{study.summary}</p><div className="mt-5 flex flex-wrap gap-2">{study.technologies.slice(0, 4).map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div></div><div className="border-t border-border pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0"><div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Operating signal</div><p className="mt-3 text-sm font-medium leading-6">{study.signal}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-primary">View project profile <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span></div></CardContent></Card></Link>;
}
