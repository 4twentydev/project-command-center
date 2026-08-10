import { auth } from "@/lib/auth";

export async function getOwnerSession(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders });
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!session || !ownerEmail || session.user.email.toLowerCase() !== ownerEmail) return null;
  return session;
}
export async function requireOwner(requestHeaders: Headers) {
  const session = await getOwnerSession(requestHeaders);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}
