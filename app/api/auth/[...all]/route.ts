import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

function getHandlers() {
  return toNextJsHandler(getAuth());
}

export async function GET(request: Request) {
  return getHandlers().GET(request);
}

export async function POST(request: Request) {
  const path = new URL(request.url).pathname;
  if (path.endsWith("/sign-up/email")) {
    if (process.env.ALLOW_OWNER_SIGNUP !== "true") {
      return Response.json({ message: "Owner registration is disabled." }, { status: 403 });
    }
    const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
    const body = await request.clone().json().catch(() => null) as { email?: string } | null;
    if (!ownerEmail || body?.email?.trim().toLowerCase() !== ownerEmail) {
      return Response.json({ message: "Registration is restricted." }, { status: 403 });
    }
  }
  return getHandlers().POST(request);
}
