import { isConversionEventName, recordConversionEvent } from "@/lib/conversion-analytics";
import { hashedRequestAddress } from "@/lib/request-privacy";

export const runtime = "nodejs";

const fields = new Set(["name", "business", "email", "phone", "industry", "employees", "currentTools", "frustratingWorkflow", "hoursLost", "desiredOutcome", "preferredContact"]);

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 2048) return new Response(null, { status: 413 });
  try {
    const body = await request.json() as { event?: unknown; path?: unknown; field?: unknown };
    if (!isConversionEventName(body.event)) return new Response(null, { status: 400 });
    const path = typeof body.path === "string" && body.path.startsWith("/workflow-audit") ? body.path : "/workflow-audit";
    const metadata: Record<string, string> = typeof body.field === "string" && fields.has(body.field) ? { field: body.field } : {};
    await recordConversionEvent({ event: body.event, path, metadata, visitorHash: hashedRequestAddress(request.headers, "conversion-analytics", true) });
    return new Response(null, { status: 202 });
  } catch (error) {
    console.error("Conversion event unavailable", error instanceof Error ? error.message : "unknown error");
    return new Response(null, { status: 202 });
  }
}
