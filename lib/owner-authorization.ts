export function ownerEmailMatches(sessionEmail: string | null | undefined, configuredOwnerEmail: string) {
  return typeof sessionEmail === "string" && sessionEmail.toLowerCase() === configuredOwnerEmail.toLowerCase();
}
