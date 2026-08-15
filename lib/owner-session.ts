import { getAuth, getAuthConfiguration } from "@/lib/auth";
import { ownerEmailMatches } from "@/lib/owner-authorization";

export async function getOwnerSession(requestHeaders: Headers) {
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session || !ownerEmailMatches(session.user.email, getAuthConfiguration().ownerEmail)) return null;
  return session;
}
export async function requireOwner(requestHeaders: Headers) {
  const session = await getOwnerSession(requestHeaders);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}
