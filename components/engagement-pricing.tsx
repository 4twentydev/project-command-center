import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { engagementPlanningNote, engagements } from "@/lib/engagements";

export function EngagementPricing() {
  return <section id="pricing" aria-labelledby="pricing-heading" className="relative border-y border-border bg-card/35">
    <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl"><div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Ways to engage</div><h2 id="pricing-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Start at the size of the problem.</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">A clear first step for diagnosis, one contained improvement, or a connected operating system.</p></div>
        <p className="max-w-xl border-l-2 border-primary/40 pl-4 text-xs leading-5 text-muted-foreground">{engagementPlanningNote}</p>
      </div>
      <div className="mt-12 grid border-y border-border lg:grid-cols-3">
        {engagements.map((engagement, index) => <article key={engagement.id} className="flex flex-col border-t border-border py-8 first:border-t-0 lg:border-l lg:border-t-0 lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0">
          <div className="font-mono text-[9px] text-primary">0{index + 1}</div>
          <h3 className="mt-5 text-xl font-semibold tracking-tight">{engagement.title}</h3>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-primary">{engagement.priceLabel}</p>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">{engagement.summary}</p>
          <p className="mt-4 border-y border-border py-3 text-xs text-foreground/80">{engagement.timing}</p>
          <ul className="mt-5 flex-1 space-y-3">{engagement.includes.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><Check className="mt-1.5 size-3.5 shrink-0 text-primary" aria-hidden="true" /><span>{item}</span></li>)}</ul>
          <Link href={engagement.cta.href} className="mt-8 inline-flex h-11 items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary transition hover:bg-primary/15">{engagement.cta.label}<ArrowRight className="size-4" aria-hidden="true" /></Link>
        </article>)}
      </div>
    </div>
  </section>;
}
