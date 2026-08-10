import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Boxes, ChartNoAxesCombined, Factory, Gauge, Mail, PackageCheck, PanelsTopLeft, ScanLine, Wrench } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { FounderPortrait } from "@/components/founder-portrait";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand, brandMailto } from "@/lib/brand";
import { founder, founderExperience, founderStructuredData } from "@/lib/founder";

export const metadata: Metadata = {
  title: "About Brandon York",
  description: `Meet ${brand.founder}, the founder behind ${brand.name}, and the production, fabrication, operations, and software experience that informs the work.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${brand.founder} · ${brand.name}`,
    description: "Production and fabrication experience translated into practical custom software and automation.",
    url: "/about",
    type: "profile",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${brand.name} — ${brand.descriptor}` }],
  },
  twitter: { card: "summary_large_image", title: `About ${brand.founder} · ${brand.name}`, description: "Production and fabrication experience translated into practical custom software and automation.", images: ["/opengraph-image"] },
};

const experienceIcons = [Factory, ScanLine, PanelsTopLeft, PackageCheck, ChartNoAxesCombined, Boxes, Wrench];

export default function AboutPage() {
  return <main className="min-h-screen overflow-hidden">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(founderStructuredData).replace(/</g, "\\u003c") }} />
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_0%,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_38%)]" />
    <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><BrandMark /><div className="flex items-center gap-2"><ThemeToggle /><Link href="/" className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5" aria-hidden="true" />Home</Link></div></header>

    <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1fr_380px] lg:items-center lg:gap-20"><div><div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">About 4TWENTY.DEV</div><h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[.96] tracking-[-0.055em] sm:text-7xl">The operational perspective comes first.</h1><p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">I’m {founder.name}. I build custom software and automation for businesses where the work moves through offices, shop floors, material racks, machines, packaging stations, trucks, and customer handoffs.</p><p className="mt-5 max-w-2xl text-sm leading-7 text-foreground/85">My background crosses manufacturing and production management, CNC operation, digital fabrication, exterior architectural panel production, inventory, shipping, packaging, metrics, and process improvement. The software work grows out of that operating experience.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/#contact" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground">Talk directly with Brandon <ArrowRight className="size-4" aria-hidden="true" /></Link><Link href="/workflow-audit" className="inline-flex h-11 items-center rounded-lg border border-border bg-card px-5 text-sm font-medium">Start with a workflow audit</Link></div></div><FounderPortrait priority className="mx-auto w-full max-w-[380px] lg:mx-0" /></section>

    <section aria-labelledby="experience-heading" className="relative border-y border-border bg-card/35"><div className="mx-auto max-w-7xl px-5 py-24 sm:px-8"><div className="grid gap-12 lg:grid-cols-[.62fr_1.38fr]"><div><div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Relevant experience</div><h2 id="experience-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Experience connected by the flow of work.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">This is not a résumé timeline. These are the operating areas that shape how problems are diagnosed and how systems are designed.</p></div><div className="grid border-y border-border sm:grid-cols-2">{founderExperience.map((item, index) => { const Icon = experienceIcons[index]; return <div key={item} className="flex min-h-28 gap-4 border-t border-border py-5 first:border-t-0 sm:border-l sm:px-5 sm:[&:nth-child(-n+2)]:border-t-0 sm:[&:nth-child(odd)]:border-l-0"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" aria-hidden="true" /></div><div><span className="font-mono text-[9px] text-primary">0{index + 1}</span><h3 className="mt-2 text-sm font-medium leading-6">{item}</h3></div></div>; })}</div></div></div></section>

    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8"><div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr]"><div><div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Why it changes the work</div><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A system has to survive contact with the operation.</h2></div><div className="space-y-6 text-sm leading-7 text-muted-foreground"><p>A production problem rarely stays inside one screen. A delayed quote affects scheduling. Uncertain inventory affects purchasing and delivery. Duplicate entry creates mismatched information. Poor visibility sends an owner back into every decision.</p><p>That is why I start by tracing the work: who needs what, where information changes hands, what gets repeated, what the team cannot see, and which constraint is actually driving the delay.</p><p className="text-foreground/90">Sometimes the answer is a focused application or automation. Sometimes it is a better process, a clearer metric, or a smaller tool than anyone expected. The goal is a usable operating improvement—not software for its own sake.</p></div></div><div className="mt-16 grid border-y border-border md:grid-cols-[1fr_auto]"><div className="py-7 md:pr-8"><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-primary"><Gauge className="size-3.5" aria-hidden="true" />Direct engagement</div><h2 className="mt-3 text-2xl font-semibold tracking-tight">Bring the messy workflow.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">You will talk directly with Brandon about the current process, the operating constraint, and what a useful next step could look like.</p></div><div className="flex flex-col justify-center gap-3 border-t border-border py-7 md:border-l md:border-t-0 md:pl-8"><Link href="/#contact" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground">Start a conversation <ArrowRight className="size-4" aria-hidden="true" /></Link><a href={brandMailto} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium"><Mail className="size-4 text-primary" aria-hidden="true" />{brand.email}</a></div></div></section>

    <SiteFooter />
  </main>;
}
