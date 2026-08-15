import { normalizeMarketingWorkspace } from "@/lib/marketing-workspace";
import { getMarketingWorkspace, saveMarketingWorkspace } from "@/lib/marketing-storage";
import { requireOwner } from "@/lib/owner-session";
import { readRequestTextWithLimit } from "@/lib/request-body";

export const runtime = "nodejs";
const workspaceBodyLimit = 2_000_000;

export async function GET(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  try {
    return Response.json(await getMarketingWorkspace());
  } catch (error) {
    console.error("Marketing workspace read failed", error);
    return Response.json({ error: "Marketing workspace could not be loaded" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  try {
    const body = await readRequestTextWithLimit(request, workspaceBodyLimit);
    if (!body.ok) return Response.json({ error: "Marketing workspace is too large" }, { status: 413 });
    const workspace = normalizeMarketingWorkspace(JSON.parse(body.value));
    if (!workspace) return Response.json({ error: "Invalid marketing workspace" }, { status: 400 });
    const updatedAt = await saveMarketingWorkspace(workspace, request.headers.get("x-workspace-version"));
    if (!updatedAt) return Response.json({ error: "Marketing workspace changed in another session" }, { status: 409 });
    return Response.json({ ok: true, updatedAt });
  } catch (error) {
    console.error("Marketing workspace save failed", error);
    return Response.json({ error: "Marketing workspace could not be saved" }, { status: 503 });
  }
}
