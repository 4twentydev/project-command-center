import { getAuth, getAuthConfiguration } from "@/lib/auth";

export async function getOwnerSession(requestHeaders: Headers) {
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session || session.user.email.toLowerCase() !== getAuthConfiguration().ownerEmail) return null;
  return session;
}
export async function requireOwner(requestHeaders: Headers) {
  const session = await getOwnerSession(requestHeaders);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}
