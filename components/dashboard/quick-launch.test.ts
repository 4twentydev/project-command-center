import { describe, expect, test } from "bun:test";
import { resolveProjectLinks } from "@/components/dashboard/quick-launch";
import type { Project } from "@/lib/projects";
import type { ProjectIntelligenceEntry } from "@/lib/project-intelligence-client";

describe("quick launch project link resolution", () => {
  const baseProject: Project = {
    id: "proj-1",
    name: "JWLD Store",
    eyebrow: "Next.js + Shopify",
    description: "Custom storefront",
    status: "Active",
    kind: "Software",
    stack: ["Next.js", "Tailwind", "Shopify"],
    repo: "https://github.com/4twentydev/jwld-store",
    deployment: "https://jwld.store",
    updatedAt: "2026-08-20T12:00:00Z",
    updatedLabel: "Updated yesterday",
    note: "Review checkout",
    progress: 85,
    accent: "cyan",
  };

  test("resolves direct liveUrl, repoUrl, and vercelConsoleUrl from project data", () => {
    const links = resolveProjectLinks(baseProject);

    expect(links.liveUrl).toBe("https://jwld.store");
    expect(links.repoUrl).toBe("https://github.com/4twentydev/jwld-store");
    expect(links.vercelProjectSlug).toBe("jwld-store");
    expect(links.vercelConsoleUrl).toBe("https://vercel.com/4twentydev/jwld-store");
  });

  test("falls back to intelligence vercel URL when deployment is empty", () => {
    const projectWithoutDeployment = { ...baseProject, deployment: undefined };
    const intelEntry: ProjectIntelligenceEntry = {
      status: "fresh",
      data: {
        github: null,
        vercel: {
          reachable: true,
          state: "READY",
          url: "jwld-store.vercel.app",
          checkedAt: "2026-08-24T12:00:00Z",
        },
        integrations: {
          github: { status: "ok", authenticated: true },
          vercel: { status: "ok", authenticated: true },
        },
        fetchedAt: "2026-08-24T12:00:00Z",
      },
    };

    const links = resolveProjectLinks(projectWithoutDeployment, intelEntry);
    expect(links.liveUrl).toBe("https://jwld-store.vercel.app");
  });

  test("derives github repository URL from team settings when repo field is absent", () => {
    const projectWithoutRepo = { ...baseProject, repo: undefined, name: "Pizza POS Terminal" };
    const links = resolveProjectLinks(projectWithoutRepo, undefined, "custom-org", "custom-team");

    expect(links.repoUrl).toBe("https://github.com/custom-org/pizza-pos-terminal");
    expect(links.vercelConsoleUrl).toBe("https://vercel.com/custom-team/pizza-pos-terminal");
    expect(links.vercelProjectSlug).toBe("pizza-pos-terminal");
  });
});
