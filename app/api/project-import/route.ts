import { requireOwner } from "@/lib/owner-session";
import {
  createOperationalContext,
  fetchWithTimeout,
  jsonWithRequestId,
  sanitizedErrorCode,
  upstreamRateLimit,
  upstreamResponseStatus,
  type IntegrationReport,
} from "@/lib/operational-observability";

type GitHubRepo = { name: string; html_url: string; homepage?: string | null; description: string | null; private: boolean; language: string | null; topics?: string[]; pushed_at: string };
type VercelProject = { name: string; targets?: { production?: { alias?: string[]; url?: string } }; latestDeployments?: Array<{ url?: string; target?: string }> };
type IntegrationResult<T> = { data: T; report: IntegrationReport };

async function requestJSON<T>(url: string, init: RequestInit, authenticated: boolean, validate: (value: unknown) => T | null): Promise<IntegrationResult<T | null>> {
  try {
    const response = await fetchWithTimeout(url, init);
    const status = upstreamResponseStatus(response);
    const report = { status, authenticated, httpStatus: response.status, rateLimit: upstreamRateLimit(response) } satisfies IntegrationReport;
    if (!response.ok) return { data: null, report };
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { data: null, report: { ...report, status: "invalid_response" } };
    }
    const data = validate(payload);
    return data === null ? { data: null, report: { ...report, status: "invalid_response" } } : { data, report };
  } catch (error) {
    return { data: null, report: { status: sanitizedErrorCode(error) === "timeout" ? "timeout" : "unavailable", authenticated } };
  }
}

export async function GET(request: Request) {
  const context = createOperationalContext(request, "/api/project-import");
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) {
    unauthorized.headers.set("x-request-id", context.requestId);
    context.completed(unauthorized.status, { status: "unauthorized" });
    return unauthorized;
  }

  const githubAuthenticated = Boolean(process.env.GITHUB_TOKEN);
  const githubHeaders: HeadersInit = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_TOKEN) githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const githubEndpoint = githubAuthenticated ? "https://api.github.com/user/repos?per_page=100&sort=pushed&affiliation=owner" : "https://api.github.com/users/4twentydev/repos?per_page=100&sort=pushed&type=owner";
  const githubPromise = requestJSON(githubEndpoint, { headers: githubHeaders, cache: "no-store" }, githubAuthenticated, (value) => Array.isArray(value) ? value as GitHubRepo[] : null);

  const vercelPromise: Promise<IntegrationResult<VercelProject[] | null>> = process.env.VERCEL_TOKEN
    ? (() => {
        const query = new URLSearchParams({ limit: "100" });
        if (process.env.VERCEL_TEAM_ID) query.set("teamId", process.env.VERCEL_TEAM_ID);
        return requestJSON(`https://api.vercel.com/v9/projects?${query}`, { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` }, cache: "no-store" }, true, (value) => {
          if (!value || typeof value !== "object" || !("projects" in value) || !Array.isArray((value as { projects?: unknown }).projects)) return null;
          return (value as { projects: VercelProject[] }).projects;
        });
      })()
    : Promise.resolve({ data: [], report: { status: "not_configured", authenticated: false } });

  const [github, vercel] = await Promise.all([githubPromise, vercelPromise]);
  const repositories = github.data ?? [];
  const vercelProjects = vercel.data ?? [];
  const candidates = repositories.map((repository) => {
    const project = vercelProjects.find((candidate) => candidate.name.toLowerCase() === repository.name.toLowerCase());
    const production = project?.targets?.production;
    const host = production?.alias?.[0] ?? production?.url ?? project?.latestDeployments?.find((item) => item.target === "production")?.url;
    return {
      id: repository.html_url,
      name: repository.name,
      description: repository.description ?? "Imported from GitHub.",
      repo: repository.html_url,
      deployment: host ? `https://${host}` : repository.homepage || undefined,
      stack: [repository.language, ...(repository.topics ?? []).slice(0, 3)].filter((item): item is string => Boolean(item)),
      private: repository.private,
      pushedAt: repository.pushed_at,
      vercelProject: project?.name,
    };
  });
  const integrations = { github: github.report, vercel: vercel.report };
  if (github.report.status !== "ok") {
    context.failed(502, { code: github.report.status }, { dependency: "github", status: github.report.status, rateLimitRemaining: github.report.rateLimit?.remaining });
    return jsonWithRequestId(context, { error: "GitHub repository discovery is unavailable", candidates: [], integrations }, { status: 502 });
  }
  context.completed(200, { status: vercel.report.status === "ok" || vercel.report.status === "not_configured" ? "ok" : "partial", itemCount: candidates.length, rateLimitRemaining: github.report.rateLimit?.remaining });
  return jsonWithRequestId(context, { candidates, integrations });
}
