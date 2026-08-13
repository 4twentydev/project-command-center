import { normalizeMarketingWorkspace } from "@/lib/marketing-workspace";
import { saveMarketingWorkspace } from "@/lib/marketing-storage";
import { requireOwner } from "@/lib/owner-session";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  if (Number(request.headers.get("content-length") ?? 0) > 2_000_000) return Response.json({ error: "Marketing workspace is too large" }, { status: 413 });
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 2_000_000) return Response.json({ error: "Marketing workspace is too large" }, { status: 413 });
    const workspace = normalizeMarketingWorkspace(JSON.parse(raw));
    if (!workspace) return Response.json({ error: "Invalid marketing workspace" }, { status: 400 });
    const updatedAt = await saveMarketingWorkspace(workspace, request.headers.get("x-workspace-version"));
    if (!updatedAt) return Response.json({ error: "Marketing workspace changed in another session" }, { status: 409 });
    return Response.json({ ok: true, updatedAt });
  } catch (error) {
    console.error("Marketing workspace save failed", error);
    return Response.json({ error: "Marketing workspace could not be saved" }, { status: 503 });
  }
}
