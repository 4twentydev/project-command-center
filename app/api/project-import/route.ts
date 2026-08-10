import { NextResponse } from "next/server";

type GitHubRepo = { name: string; html_url: string; homepage?: string | null; description: string | null; private: boolean; language: string | null; topics?: string[]; pushed_at: string };
type VercelProject = { name: string; targets?: { production?: { alias?: string[]; url?: string } }; latestDeployments?: Array<{ url?: string; target?: string }> };

export async function GET() {
  const githubHeaders: HeadersInit = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_TOKEN) githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const githubEndpoint = process.env.GITHUB_TOKEN ? "https://api.github.com/user/repos?per_page=100&sort=pushed&affiliation=owner" : "https://api.github.com/users/4twentydev/repos?per_page=100&sort=pushed&type=owner";
  const githubPromise = fetch(githubEndpoint, { headers: githubHeaders, cache: "no-store" }).then(async (response) => response.ok ? await response.json() as GitHubRepo[] : []);
  const vercelPromise = process.env.VERCEL_TOKEN ? (() => { const query = new URLSearchParams({ limit: "100" }); if (process.env.VERCEL_TEAM_ID) query.set("teamId", process.env.VERCEL_TEAM_ID); return fetch(`https://api.vercel.com/v9/projects?${query}`, { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` }, cache: "no-store" }).then(async (response) => response.ok ? ((await response.json()) as { projects?: VercelProject[] }).projects ?? [] : []); })() : Promise.resolve([] as VercelProject[]);
  const [repositories, vercelProjects] = await Promise.all([githubPromise, vercelPromise]);
  const candidates = repositories.map((repository) => { const vercel = vercelProjects.find((project) => project.name.toLowerCase() === repository.name.toLowerCase()); const production = vercel?.targets?.production; const host = production?.alias?.[0] ?? production?.url ?? vercel?.latestDeployments?.find((item) => item.target === "production")?.url; return { id: repository.html_url, name: repository.name, description: repository.description ?? "Imported from GitHub.", repo: repository.html_url, deployment: host ? `https://${host}` : repository.homepage || undefined, stack: [repository.language, ...(repository.topics ?? []).slice(0, 3)].filter((item): item is string => Boolean(item)), private: repository.private, pushedAt: repository.pushed_at, vercelProject: vercel?.name }; });
  return NextResponse.json({ candidates, authenticatedGitHub: Boolean(process.env.GITHUB_TOKEN), authenticatedVercel: Boolean(process.env.VERCEL_TOKEN) });
}
