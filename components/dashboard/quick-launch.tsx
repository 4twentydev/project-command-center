"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardCheck,
  Database,
  ExternalLink,
  FileText,
  FolderGit2,
  Github,
  Globe,
  Inbox,
  KeyRound,
  Lightbulb,
  ListChecks,
  Mail,
  Megaphone,
  Pencil,
  Plus,
  Rocket,
  Search,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import type { Project } from "@/lib/projects";
import type { ProjectIntelligenceEntry } from "@/lib/project-intelligence-client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { statusStyles } from "@/components/dashboard/dashboard-styles";

export type QuickLaunchTab = "all" | "projects" | "consoles" | "operations";

export function resolveProjectLinks(
  project: Project,
  intelligenceEntry?: ProjectIntelligenceEntry,
  githubUsername = "4twentydev",
  vercelTeam = "4twentydev"
) {
  const vercelProjectSlug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const liveUrl = project.deployment || (intelligenceEntry?.data?.vercel?.url ? `https://${intelligenceEntry.data.vercel.url}` : undefined);
  const repoUrl = project.repo || (githubUsername ? `https://github.com/${githubUsername}/${vercelProjectSlug}` : undefined);
  const vercelConsoleUrl = `https://vercel.com/${vercelTeam}/${vercelProjectSlug}`;
  return { liveUrl, repoUrl, vercelConsoleUrl, vercelProjectSlug };
}

export interface QuickLaunchProps {
  projects: Project[];
  intelligence: Record<string, ProjectIntelligenceEntry>;
  githubUsername?: string;
  vercelTeam?: string;
  onNewTask: () => void;
  onNewIdea: () => void;
  onNewProject: () => void;
  onOpenProject: (id: string) => void;
  onEditProject: (project: Project) => void;
  onImportOpen?: () => void;
}

export function QuickLaunch({
  projects,
  intelligence,
  githubUsername = "4twentydev",
  vercelTeam = "4twentydev",
  onNewTask,
  onNewIdea,
  onNewProject,
  onOpenProject,
  onEditProject,
  onImportOpen,
}: QuickLaunchProps) {
  const [tab, setTab] = useState<QuickLaunchTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const devConsoles = [
    {
      id: "github-org",
      label: "GitHub",
      category: "Source & Releases",
      url: `https://github.com/${githubUsername}`,
      icon: <Github className="size-4 text-foreground" />,
      description: `@${githubUsername} repositories & teams`,
    },
    {
      id: "vercel-team",
      label: "Vercel",
      category: "Edge & Deployments",
      url: `https://vercel.com/${vercelTeam}`,
      icon: <Rocket className="size-4 text-violet-400" />,
      description: `${vercelTeam} projects & deployment health`,
    },
    {
      id: "neon-console",
      label: "Neon Postgres",
      category: "Database Cloud",
      url: "https://console.neon.tech",
      icon: <Database className="size-4 text-emerald-400" />,
      description: "Postgres branches, pools & storage",
    },
    {
      id: "resend-console",
      label: "Resend",
      category: "Transactional Email",
      url: "https://resend.com",
      icon: <Mail className="size-4 text-primary" />,
      description: "Contact notifications & domain status",
    },
  ];

  const operationsLinks = [
    {
      id: "leads",
      label: "Client Leads",
      href: "/dashboard/leads",
      icon: <Inbox className="size-4 text-primary" />,
      hint: "Pipeline & intake records",
    },
    {
      id: "marketing",
      label: "Marketing Ops",
      href: "/dashboard/marketing",
      icon: <Megaphone className="size-4 text-amber-400" />,
      hint: "Field, content & campaigns",
    },
    {
      id: "consultations",
      label: "Consultations",
      href: "/dashboard/consultations",
      icon: <ClipboardCheck className="size-4 text-emerald-400" />,
      hint: "Discovery & scoping playbooks",
    },
    {
      id: "one-sheet",
      label: "Print Collateral",
      href: "/dashboard/marketing/one-sheet",
      icon: <FileText className="size-4 text-cyan-400" />,
      hint: "Printable studio one-sheet",
    },
    {
      id: "account-passkeys",
      label: "Passkeys & Auth",
      href: "/account",
      icon: <KeyRound className="size-4 text-muted-foreground" />,
      hint: "Windows Hello & mobile keys",
    },
  ];

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.repo?.toLowerCase().includes(q) ||
        p.deployment?.toLowerCase().includes(q) ||
        p.stack?.some((s) => s.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="p-5">
        {/* Header & Quick Action Buttons */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-400" />
            <div>
              <h2 className="text-sm font-semibold">Quick launch & jump links</h2>
              <p className="text-xs text-muted-foreground">Direct jumps to live sites, repos, consoles & operations.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onNewTask}>
              <ListChecks className="size-3.5 text-amber-400" />
              <span className="hidden sm:inline">New task</span>
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onNewIdea}>
              <Lightbulb className="size-3.5 text-amber-300" />
              <span className="hidden sm:inline">Capture</span>
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onNewProject}>
              <Plus className="size-3.5 text-primary" />
              <span className="hidden sm:inline">New project</span>
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-border bg-background/50 p-1">
          {(
            [
              { id: "all", label: "All Links" },
              { id: "projects", label: `Projects (${projects.length})` },
              { id: "consoles", label: "Dev Consoles" },
              { id: "operations", label: "Operations" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex-1 rounded-md px-2.5 py-1.5 text-xs transition",
                tab === item.id ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-accent"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Optional Search if in projects or all view with > 3 projects */}
        {(tab === "all" || tab === "projects") && projects.length > 3 && (
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter live sites, repos, or projects..."
              className="h-8 w-full rounded-md border border-border bg-background/60 pl-8 pr-3 text-xs outline-none focus:border-primary"
            />
          </div>
        )}

        <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
          {/* Projects Live Sites & Repositories */}
          {(tab === "all" || tab === "projects") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  Project Live Sites & Repositories
                </div>
                {onImportOpen && (
                  <button
                    onClick={onImportOpen}
                    className="text-[10px] text-primary hover:underline"
                  >
                    Import from GitHub
                  </button>
                )}
              </div>

              {filteredProjects.length ? (
                <div className="space-y-2">
                  {filteredProjects.map((project) => {
                    const { liveUrl, repoUrl, vercelConsoleUrl } = resolveProjectLinks(
                      project,
                      intelligence[project.id],
                      githubUsername,
                      vercelTeam
                    );

                    return (
                      <div
                        key={project.id}
                        className="group flex flex-col gap-2 rounded-xl border border-border/70 bg-background/45 p-3 transition hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onOpenProject(project.id)}
                              className="truncate text-left text-xs font-semibold hover:text-primary transition"
                            >
                              {project.name}
                            </button>
                            <Badge className={cn("text-[9px] px-1.5 py-0", statusStyles[project.status])}>
                              {project.status}
                            </Badge>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                            {liveUrl ? (
                              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 truncate max-w-[200px]">
                                <Globe className="size-3 shrink-0" />
                                {liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-muted-foreground/60">No live URL</span>
                            )}
                            {project.repo && (
                              <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground truncate max-w-[160px]">
                                <FolderGit2 className="size-3 shrink-0" />
                                {project.repo.replace(/^https?:\/\/github\.com\//, "")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Direct Jump Buttons */}
                        <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
                          {liveUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 px-2 text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              asChild
                            >
                              <a href={liveUrl} target="_blank" rel="noreferrer" title="Open live production site">
                                <Globe className="size-3" />
                                <span>Live Site</span>
                                <ArrowUpRight className="size-2.5 opacity-70" />
                              </a>
                            </Button>
                          )}

                          {repoUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                              asChild
                            >
                              <a href={repoUrl} target="_blank" rel="noreferrer" title="Open GitHub repository">
                                <Github className="size-3.5" />
                                <span className="hidden sm:inline">Repo</span>
                              </a>
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1 px-2 text-[10px] text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                            asChild
                          >
                            <a href={vercelConsoleUrl} target="_blank" rel="noreferrer" title="Open in Vercel Dashboard">
                              <Rocket className="size-3" />
                              <span className="hidden sm:inline">Vercel</span>
                            </a>
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={() => onEditProject(project)}
                            title="Edit project links"
                          >
                            <Pencil className="size-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid min-h-24 place-items-center rounded-lg border border-dashed border-border/70 text-center text-xs text-muted-foreground p-4">
                  {searchQuery ? "No matching projects found." : "No projects configured yet."}
                </div>
              )}
            </div>
          )}

          {/* Dev Consoles Section */}
          {(tab === "all" || tab === "consoles") && (
            <div className="space-y-2">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground px-1">
                Developer Consoles & Cloud Hubs
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {devConsoles.map((console) => (
                  <Button
                    key={console.id}
                    variant="outline"
                    className="h-auto justify-start p-3 text-left bg-background/40 hover:bg-accent/60"
                    asChild
                  >
                    <a href={console.url} target="_blank" rel="noreferrer">
                      <div className="mr-2 grid size-8 shrink-0 place-items-center rounded-lg border border-border/70 bg-card">
                        {console.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-xs font-semibold">
                          <span>{console.label}</span>
                          <ExternalLink className="size-2.5 text-muted-foreground/60" />
                        </div>
                        <div className="truncate text-[10px] text-muted-foreground">{console.description}</div>
                      </div>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Operator Systems Section */}
          {(tab === "all" || tab === "operations") && (
            <div className="space-y-2">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground px-1">
                Operations & Management Surfaces
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {operationsLinks.map((op) => (
                  <Button
                    key={op.id}
                    variant="outline"
                    className="h-auto justify-start p-3 text-left bg-background/40 hover:bg-accent/60"
                    asChild
                  >
                    <Link href={op.href}>
                      <div className="mr-2 grid size-8 shrink-0 place-items-center rounded-lg border border-border/70 bg-card">
                        {op.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold">{op.label}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{op.hint}</div>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
