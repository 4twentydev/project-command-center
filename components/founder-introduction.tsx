import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FounderPortrait } from "@/components/founder-portrait";
import { founder } from "@/lib/founder";

export function FounderIntroduction() {
  return <section id="about" aria-labelledby="founder-heading" className="relative border-b border-border">
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:grid-cols-[240px_1fr] md:items-center lg:grid-cols-[280px_1fr] lg:gap-16">
      <FounderPortrait compact className="max-w-[240px] md:max-w-none" />
      <div className="max-w-3xl"><div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Behind the work</div><h2 id="founder-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Brandon York builds from both sides of the operation.</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">{founder.shortIntroduction}</p><p className="mt-4 text-sm leading-7 text-foreground/85">The point is not to force a shop into a generic web product. It is to understand the real handoffs, constraints, and decisions first—then build the smallest useful system around them.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/about" className="inline-flex h-11 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-5 text-sm font-medium text-primary transition hover:bg-primary/15">More about Brandon <ArrowRight className="size-4" aria-hidden="true" /></Link><Link href="#contact" className="inline-flex h-11 items-center rounded-lg px-4 text-sm text-muted-foreground transition hover:text-foreground">Talk directly with Brandon</Link></div></div>
    </div>
  </section>;
}
