import { toNextJsHandler } from "better-auth/next-js";
import { authUserExists, getAuth, getAuthConfiguration } from "@/lib/auth";
import { ownerBootstrapAllowed } from "@/lib/owner-bootstrap";
import { readRequestTextWithLimit } from "@/lib/request-body";

export const runtime = "nodejs";
const ownerSignupBodyLimit = 20_000;

function getHandlers() {
  return toNextJsHandler(getAuth());
}

export async function GET(request: Request) {
  if (new URL(request.url).pathname === "/api/auth/bootstrap-status") {
    try {
      const configuration = getAuthConfiguration();
      if (!configuration.bootstrapToken) return Response.json({ available: false });
      return Response.json({ available: !await authUserExists() });
    } catch (error) {
      console.error("Owner bootstrap status failed", error instanceof Error ? error.message : "Unknown error");
      return Response.json({ available: false }, { status: 503 });
    }
  }
  return getHandlers().GET(request);
}

export async function POST(request: Request) {
  const path = new URL(request.url).pathname;
  if (path === "/api/auth/sign-up/email") {
    let configuration;
    try {
      configuration = getAuthConfiguration();
    } catch (error) {
      console.error("Owner bootstrap configuration failed", error instanceof Error ? error.message : "Unknown error");
      return Response.json({ message: "Owner registration is unavailable." }, { status: 503 });
    }
    const bodyResult = await readRequestTextWithLimit(request.clone(), ownerSignupBodyLimit);
    if (!bodyResult.ok) return Response.json({ message: "Owner registration request is too large." }, { status: 413 });
    let body: { email?: unknown } | null = null;
    try {
      const payload: unknown = JSON.parse(bodyResult.value);
      body = payload && typeof payload === "object" ? payload as { email?: unknown } : null;
    } catch {
      return Response.json({ message: "Owner registration request is invalid." }, { status: 400 });
    }
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
    const bootstrapRequest = { ownerEmail: configuration.ownerEmail, requestedEmail: email, expectedToken: configuration.bootstrapToken, providedToken: request.headers.get("x-owner-bootstrap-token") };
    if (!ownerBootstrapAllowed({ ...bootstrapRequest, ownerExists: false })) {
      return Response.json({ message: "Registration is restricted." }, { status: 403 });
    }
    try {
      if (!ownerBootstrapAllowed({ ...bootstrapRequest, ownerExists: await authUserExists() })) return Response.json({ message: "Owner registration is complete." }, { status: 403 });
    } catch (error) {
      console.error("Owner bootstrap account check failed", error instanceof Error ? error.message : "Unknown error");
      return Response.json({ message: "Owner registration is unavailable." }, { status: 503 });
    }
  }
  return getHandlers().POST(request);
}
