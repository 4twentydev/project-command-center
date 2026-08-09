"use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowUpRight, Box, CheckCircle2, ChevronRight, CircleDot, Clock3,
  Command, Github, Grid2X2, Hammer, LayoutDashboard, ListFilter, MoreHorizontal,
  Plus, Rocket, Search, Sparkles, TerminalSquare, Wrench,
} from "lucide-react";
import { projects, type Project, type ProjectKind, type ProjectStatus } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const statusStyles: Record<ProjectStatus, string> = {
  Active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  Planning: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  Shipped: "border-cyan-500/20 bg-cyan-500/10 text-cyan-500",
  Paused: "border-border bg-muted text-muted-foreground",
};

const accentStyles = {
  cyan: "from-cyan-400/75 to-blue-500/10 group-hover:shadow-cyan-400/20",
  amber: "from-amber-400/75 to-orange-500/10 group-hover:shadow-amber-400/20",
  violet: "from-violet-400/75 to-fuchsia-500/10 group-hover:shadow-violet-400/20",
  lime: "from-lime-400/75 to-emerald-500/10 group-hover:shadow-lime-400/20",
};

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl">
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r", accentStyles[project.accent])} />
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className={cn("h-1.5 w-1.5 rounded-full", project.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/50")} />
              {project.eyebrow}
            </div>
            <h3 className="text-lg font-semibold tracking-tight">{project.name}</h3>
          </div>
          <Button size="icon" variant="ghost" aria-label={`More actions for ${project.name}`}><MoreHorizontal /></Button>
        </div>

        <p className="min-h-12 text-sm leading-6 text-muted-foreground">{project.description}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          <Badge className={statusStyles[project.status]}>{project.status}</Badge>
          {project.stack.map((item) => <Badge key={item} className="border-border bg-secondary/70 text-muted-foreground">{item}</Badge>)}
        </div>

        <div className="mt-6 border-t border-border/70 pt-4">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Momentum</span><span>{project.progress}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full rounded-full bg-gradient-to-r", accentStyles[project.accent])} style={{ width: `${project.progress}%` }} /></div>
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-background/50 p-3 text-xs leading-5 text-muted-foreground">
          <span className="mr-1.5 font-semibold text-foreground">Next:</span>{project.note}
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground"><Clock3 className="size-3" />{project.updatedLabel}</span>
          <div className="flex items-center gap-1">
            {project.repo && <Button asChild size="icon" variant="ghost"><a href={project.repo} target="_blank" rel="noreferrer" aria-label={`${project.name} repository`}><Github /></a></Button>}
            {project.deployment && <Button asChild size="icon" variant="ghost"><a href={project.deployment} target="_blank" rel="noreferrer" aria-label={`${project.name} deployment`}><ArrowUpRight /></a></Button>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"All" | ProjectKind>("All");
  const kinds: Array<"All" | ProjectKind> = ["All", "Software", "CNC", "Business", "Experiment"];
  const filtered = useMemo(() => projects.filter((project) => {
    const matchesKind = kind === "All" || project.kind === kind;
    const haystack = `${project.name} ${project.description} ${project.stack.join(" ")} ${project.status}`.toLowerCase();
    return matchesKind && haystack.includes(query.toLowerCase());
  }), [kind, query]);
  const active = projects.filter((project) => project.status === "Active").length;
  const avgMomentum = Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_-10%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card/30 p-4 backdrop-blur lg:flex">
          <div className="flex h-14 items-center gap-3 px-2">
            <div className="grid size-9 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary"><Command className="size-5" /></div>
            <div><div className="text-sm font-bold tracking-tight">WORK//CTRL</div><div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Project operating system</div></div>
          </div>
          <nav className="mt-8 space-y-1 text-sm">
            <a className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 font-medium text-primary" href="#"><LayoutDashboard className="size-4" />Command center</a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#projects"><Grid2X2 className="size-4" />Projects<span className="ml-auto font-mono text-[10px]">{projects.length}</span></a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" href="#activity"><Activity className="size-4" />Activity</a>
          </nav>
          <div className="mt-8 px-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Workspaces</div>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground"><Box className="size-4 text-cyan-400" />Software</div>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground"><Wrench className="size-4 text-amber-400" />CNC + Shop</div>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground"><Sparkles className="size-4 text-violet-400" />Experiments</div>
          </div>
          <div className="mt-auto rounded-xl border border-border bg-background/60 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium"><TerminalSquare className="size-4 text-primary" />System online</div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">ThinkPad P14s · Win 11 · Bun</div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-16 sm:px-6 xl:px-10">
          <header className="flex h-20 items-center justify-between border-b border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><CircleDot className="size-3 text-emerald-400" /><span className="hidden sm:inline">All systems nominal</span></div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground md:flex"><Search className="size-3.5" />Quick find <kbd className="ml-5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px]">⌘ K</kbd></div>
              <ThemeToggle />
              <Button><Plus />New project</Button>
            </div>
          </header>

          <section className="py-10">
            <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Sunday · August 09 · 17:42</div><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your work, in formation.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">A single operational view across software, CNC, and the businesses you&apos;re building.</p></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="size-4 text-emerald-400" />Last sync 2 minutes ago</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Active now</div><div className="mt-1 text-2xl font-semibold">{active}</div></div><Activity className="size-5 text-emerald-400" /></CardContent></Card>
              <Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Overall momentum</div><div className="mt-1 text-2xl font-semibold">{avgMomentum}%</div></div><Rocket className="size-5 text-primary" /></CardContent></Card>
              <Card><CardContent className="flex items-center justify-between p-4"><div><div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Next review</div><div className="mt-1 text-2xl font-semibold">Mon</div></div><ChevronRight className="size-5 text-muted-foreground" /></CardContent></Card>
            </div>
          </section>

          <section id="projects">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div><h2 className="text-base font-semibold">Project grid</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} of {projects.length} projects visible</p></div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, stacks..." className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 sm:w-64" /></label>
                <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1"><ListFilter className="mx-2 size-3.5 shrink-0 text-muted-foreground" />{kinds.map((item) => <button key={item} onClick={() => setKind(item)} className={cn("rounded-md px-2.5 py-1.5 text-xs transition", kind === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>{item}</button>)}</div>
              </div>
            </div>

            {filtered.length ? <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{filtered.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <Card><CardContent className="grid min-h-64 place-items-center text-center"><div><Search className="mx-auto mb-3 size-6 text-muted-foreground" /><h3 className="font-medium">No projects found</h3><p className="mt-1 text-sm text-muted-foreground">Try another search or workspace filter.</p></div></CardContent></Card>}
          </section>

          <section id="activity" className="mt-10 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Card><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Recent signals</h2><p className="mt-1 text-xs text-muted-foreground">The last meaningful movement across your workspace.</p></div><Button variant="ghost" size="sm">View all <ChevronRight /></Button></div><div className="space-y-1">{projects.slice(0, 4).map((project, index) => <div key={project.id} className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-accent/50"><div className={cn("size-2 rounded-full", index === 0 ? "bg-emerald-400" : "bg-muted-foreground/40")} /><div className="min-w-0 flex-1"><div className="truncate text-xs"><span className="font-medium">{project.name}</span><span className="text-muted-foreground"> · {project.note}</span></div></div><span className="shrink-0 font-mono text-[9px] text-muted-foreground">{project.updatedLabel}</span></div>)}</div></CardContent></Card>
            <Card><CardContent className="p-5"><div className="mb-5 flex items-center gap-2"><Hammer className="size-4 text-amber-400" /><h2 className="text-sm font-semibold">Quick launch</h2></div><div className="grid grid-cols-2 gap-2"><Button variant="outline" className="h-auto justify-start p-3"><Github />Open GitHub</Button><Button variant="outline" className="h-auto justify-start p-3"><Rocket />Vercel</Button><Button variant="outline" className="h-auto justify-start p-3"><TerminalSquare />New terminal</Button><Button variant="outline" className="h-auto justify-start p-3"><Plus />Capture idea</Button></div></CardContent></Card>
          </section>
        </main>
      </div>
    </div>
  );
}
