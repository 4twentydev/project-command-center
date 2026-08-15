import { NextRequest } from "next/server";
import { requireOwner } from "@/lib/owner-session";
import { publicHTTPSHead } from "@/lib/public-network-url";
import {
  createOperationalContext,
  fetchWithTimeout,
  jsonWithRequestId,
  sanitizedErrorCode,
  upstreamRateLimit,
  upstreamResponseStatus,
  type IntegrationReport,
} from "@/lib/operational-observability";

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

function rejectedReport(error: unknown, authenticated: boolean): IntegrationReport {
  return { status: sanitizedErrorCode(error) === "timeout" ? "timeout" : "unavailable", authenticated };
}

async function githubStatus(repositoryUrl: string) {
  const repository = githubRepository(repositoryUrl);
  const authenticated = Boolean(process.env.GITHUB_TOKEN);
  if (!repository) return { data: null, report: { status: "invalid_response", authenticated } satisfies IntegrationReport };
  const headers: HeadersInit = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const base = `https://api.github.com/repos/${repository.owner}/${repository.repo}`;
  const results = await Promise.allSettled([
    fetchWithTimeout(base, { headers, next: { revalidate: 60 } }),
    fetchWithTimeout(`${base}/commits?per_page=1`, { headers, next: { revalidate: 60 } }),
    fetchWithTimeout(`${base}/pulls?state=open&per_page=5&sort=updated&direction=desc`, { headers, next: { revalidate: 60 } }),
    fetchWithTimeout(`${base}/issues?state=open&per_page=10&sort=updated&direction=desc`, { headers, next: { revalidate: 60 } }),
  ]);
  const [repoResult, commitResult, pullResult, issueResult] = results;
  if (!repoResult || repoResult.status === "rejected") return { data: null, report: rejectedReport(repoResult?.reason, authenticated) };
  const rateLimit = upstreamRateLimit(repoResult.value);
  if (!repoResult.value.ok) return {
    data: { available: false, status: repoResult.value.status },
    report: { status: upstreamResponseStatus(repoResult.value), authenticated, httpStatus: repoResult.value.status, rateLimit },
  };

  const failures: string[] = [];
  async function optionalJSON(result: PromiseSettledResult<Response> | undefined, operation: string) {
    if (!result || result.status === "rejected" || !result.value.ok) { failures.push(operation); return []; }
    try { return await result.value.json() as unknown[]; } catch { failures.push(operation); return []; }
  }
  let repo: Record<string, unknown>;
  try {
    const payload: unknown = await repoResult.value.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid response");
    repo = payload as Record<string, unknown>;
  } catch {
    return { data: null, report: { status: "invalid_response", authenticated, httpStatus: repoResult.value.status, rateLimit } satisfies IntegrationReport };
  }
  const [commits, pulls, issueRows] = await Promise.all([
    optionalJSON(commitResult, "commits"),
    optionalJSON(pullResult, "pull_requests"),
    optionalJSON(issueResult, "issues"),
  ]);
  const commit = commits[0] as Record<string, unknown> | undefined;
  const commitDetails = commit?.commit && typeof commit.commit === "object" ? commit.commit as { message?: unknown; author?: { date?: unknown } } : null;
  const report: IntegrationReport = { status: failures.length ? "unavailable" : "ok", authenticated, httpStatus: repoResult.value.status, rateLimit, failures: failures.length ? failures : undefined };
  return {
    data: {
      available: true,
      private: Boolean(repo.private),
      defaultBranch: String(repo.default_branch ?? ""),
      openIssues: Number(repo.open_issues_count ?? 0),
      pushedAt: String(repo.pushed_at ?? ""),
      latestCommit: commit ? {
        sha: String(commit.sha ?? "").slice(0, 7),
        message: String(commitDetails?.message ?? "").split("\n")[0],
        url: String(commit.html_url ?? ""),
        date: commitDetails?.author?.date ? String(commitDetails.author.date) : undefined,
      } : null,
      pullRequests: pulls.map((pull) => pull as { number: number; title: string; html_url: string; draft?: boolean; updated_at: string }).map((pull) => ({ number: pull.number, title: pull.title, url: pull.html_url, draft: Boolean(pull.draft), updatedAt: pull.updated_at })),
      issues: issueRows.map((issue) => issue as { number: number; title: string; html_url: string; updated_at: string; pull_request?: unknown }).filter((issue) => !issue.pull_request).slice(0, 5).map((issue) => ({ number: issue.number, title: issue.title, url: issue.html_url, updatedAt: issue.updated_at })),
    },
    report,
  };
}

async function vercelStatus(deploymentUrl: string) {
  const authenticated = Boolean(process.env.VERCEL_TOKEN);
  const check = await publicHTTPSHead(deploymentUrl);
  if (!check) return { data: null, report: { status: "invalid_response", authenticated } satisfies IntegrationReport };
  const host = check.url.hostname;
  const reachable = check.status !== null && check.status < 500;
  const fallback = { reachable, state: null, url: host, checkedAt: new Date().toISOString() };
  if (!process.env.VERCEL_TOKEN) return { data: fallback, report: { status: "not_configured", authenticated: false } satisfies IntegrationReport };
  const query = process.env.VERCEL_TEAM_ID ? `?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}` : "";
  try {
    const response = await fetchWithTimeout(`https://api.vercel.com/v13/deployments/${encodeURIComponent(host)}${query}`, { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` }, cache: "no-store" });
    const rateLimit = upstreamRateLimit(response);
    if (!response.ok) return { data: fallback, report: { status: upstreamResponseStatus(response), authenticated, httpStatus: response.status, rateLimit } satisfies IntegrationReport };
    let deployment: Record<string, unknown>;
    try {
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid response");
      deployment = payload as Record<string, unknown>;
    } catch {
      return { data: fallback, report: { status: "invalid_response", authenticated, httpStatus: response.status, rateLimit } satisfies IntegrationReport };
    }
    return {
      data: {
        reachable,
        state: String(deployment.readyState ?? deployment.state ?? "") || null,
        target: deployment.target ? String(deployment.target) : null,
        createdAt: typeof deployment.createdAt === "number" ? deployment.createdAt : undefined,
        url: String(deployment.url ?? host),
        checkedAt: new Date().toISOString(),
      },
      report: { status: "ok", authenticated, httpStatus: response.status, rateLimit } satisfies IntegrationReport,
    };
  } catch (error) {
    return { data: fallback, report: rejectedReport(error, authenticated) };
  }
}

export async function GET(request: NextRequest) {
  const context = createOperationalContext(request, "/api/project-status");
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) {
    unauthorized.headers.set("x-request-id", context.requestId);
    context.completed(unauthorized.status, { status: "unauthorized" });
    return unauthorized;
  }
  const repo = request.nextUrl.searchParams.get("repo");
  const deployment = request.nextUrl.searchParams.get("deployment");
  if (!repo && !deployment) {
    context.completed(400, { status: "invalid_request" });
    return jsonWithRequestId(context, { error: "A repository or deployment URL is required" }, { status: 400 });
  }
  const [github, vercel] = await Promise.all([
    repo ? githubStatus(repo) : Promise.resolve({ data: null, report: { status: "not_configured", authenticated: false } satisfies IntegrationReport }),
    deployment ? vercelStatus(deployment) : Promise.resolve({ data: null, report: { status: "not_configured", authenticated: false } satisfies IntegrationReport }),
  ]);
  const githubReport: IntegrationReport = github.report;
  const vercelReport: IntegrationReport = vercel.report;
  const integrations = { github: githubReport, vercel: vercelReport };
  const degraded = [repo ? githubReport.status : "ok", deployment ? vercelReport.status : "ok"].some((status) => !["ok", "not_configured"].includes(status));
  context.completed(200, { status: degraded ? "partial" : "ok", rateLimitRemaining: githubReport.rateLimit?.remaining });
  return jsonWithRequestId(context, { github: github.data, vercel: vercel.data, integrations, fetchedAt: new Date().toISOString() });
}
