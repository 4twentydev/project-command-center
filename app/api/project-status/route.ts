import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/owner-session";

export const runtime = "nodejs";

function githubRepository(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname !== "github.com") return null;
    const [owner, rawRepo] = url.pathname.split("/").filter(Boolean);
    if (!owner || !rawRepo) return null;
    return { owner, repo: rawRepo.replace(/\.git$/, "") };
  } catch { return null; }
}

async function githubStatus(repositoryUrl: string) {
  const repository = githubRepository(repositoryUrl);
  if (!repository) return null;
  const headers: HeadersInit = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const base = `https://api.github.com/repos/${repository.owner}/${repository.repo}`;
  const [repoResponse, commitResponse, pullResponse, issueResponse] = await Promise.all([
    fetch(base, { headers, next: { revalidate: 60 } }),
    fetch(`${base}/commits?per_page=1`, { headers, next: { revalidate: 60 } }),
    fetch(`${base}/pulls?state=open&per_page=5&sort=updated&direction=desc`, { headers, next: { revalidate: 60 } }),
    fetch(`${base}/issues?state=open&per_page=10&sort=updated&direction=desc`, { headers, next: { revalidate: 60 } }),
  ]);
  if (!repoResponse.ok) return { available: false, status: repoResponse.status };
  const repo = await repoResponse.json();
  const commits = commitResponse.ok ? await commitResponse.json() : [];
  const commit = commits[0];
  const pulls = pullResponse.ok ? await pullResponse.json() : [];
  const issueRows = issueResponse.ok ? await issueResponse.json() : [];
  return {
    available: true,
    private: Boolean(repo.private),
    defaultBranch: repo.default_branch as string,
    openIssues: repo.open_issues_count as number,
    pushedAt: repo.pushed_at as string,
    latestCommit: commit ? {
      sha: String(commit.sha).slice(0, 7),
      message: String(commit.commit.message).split("\n")[0],
      url: commit.html_url as string,
      date: commit.commit.author?.date as string | undefined,
    } : null,
    pullRequests: pulls.map((pull: { number: number; title: string; html_url: string; draft?: boolean; updated_at: string }) => ({ number: pull.number, title: pull.title, url: pull.html_url, draft: Boolean(pull.draft), updatedAt: pull.updated_at })),
    issues: issueRows.filter((issue: { pull_request?: unknown }) => !issue.pull_request).slice(0, 5).map((issue: { number: number; title: string; html_url: string; updated_at: string }) => ({ number: issue.number, title: issue.title, url: issue.html_url, updatedAt: issue.updated_at })),
  };
}

async function vercelStatus(deploymentUrl: string) {
  let host: string;
  try { host = new URL(deploymentUrl).hostname; } catch { return null; }
  const reachableResponse = await fetch(deploymentUrl, { method: "HEAD", redirect: "manual", cache: "no-store" }).catch(() => null);
  const reachable = Boolean(reachableResponse && reachableResponse.status < 500);
  if (!process.env.VERCEL_TOKEN) return { reachable, state: null, url: host, checkedAt: new Date().toISOString() };
  const query = process.env.VERCEL_TEAM_ID ? `?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}` : "";
  const response = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(host)}${query}`, {
    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` }, cache: "no-store",
  });
  if (!response.ok) return { reachable, state: null, url: host, checkedAt: new Date().toISOString() };
  const deployment = await response.json();
  return {
    reachable,
    state: (deployment.readyState ?? deployment.state) as string | null,
    target: deployment.target as string | null,
    createdAt: deployment.createdAt as number | undefined,
    url: deployment.url as string,
    checkedAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  const repo = request.nextUrl.searchParams.get("repo");
  const deployment = request.nextUrl.searchParams.get("deployment");
  if (!repo && !deployment) return NextResponse.json({ error: "A repository or deployment URL is required" }, { status: 400 });
  const [github, vercel] = await Promise.all([
    repo ? githubStatus(repo).catch(() => null) : null,
    deployment ? vercelStatus(deployment).catch(() => null) : null,
  ]);
  return NextResponse.json({ github, vercel, fetchedAt: new Date().toISOString() });
}
