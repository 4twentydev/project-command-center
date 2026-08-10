import { isConversionEventName, recordConversionEvent } from "@/lib/conversion-analytics";
import { hashedRequestAddress } from "@/lib/request-privacy";

export const runtime = "nodejs";

const metadataKeys = new Set(["field", "fields", "service", "caseStudy", "placement", "destination", "projectType"]);
const privatePaths = ["/api", "/account", "/dashboard", "/login"];

function safePath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || privatePaths.some((prefix) => value.startsWith(prefix))) return "/";
  return value.slice(0, 200);
}

function safeMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const metadata: Record<string, string | string[]> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!metadataKeys.has(key)) continue;
    if (typeof item === "string") metadata[key] = item.slice(0, 120);
    if (Array.isArray(item)) metadata[key] = item.filter((entry): entry is string => typeof entry === "string").slice(0, 20).map((entry) => entry.slice(0, 80));
  }
  return metadata;
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 2048) return new Response(null, { status: 413 });
  try {
    const body = await request.json() as { event?: unknown; path?: unknown; metadata?: unknown };
    if (!isConversionEventName(body.event)) return new Response(null, { status: 400 });
    await recordConversionEvent({ event: body.event, path: safePath(body.path), metadata: safeMetadata(body.metadata), visitorHash: hashedRequestAddress(request.headers, "conversion-analytics", true) });
    return new Response(null, { status: 202 });
  } catch (error) {
    console.error("Conversion event unavailable", error instanceof Error ? error.message : "unknown error");
    return new Response(null, { status: 202 });
  }
}
