import { timingSafeEqual } from "node:crypto";

export function bootstrapTokenMatches(expected: string | undefined, provided: string | null) {
  if (!expected || !provided) return false;
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  return expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes);
}

export function ownerBootstrapAllowed({ ownerEmail, requestedEmail, expectedToken, providedToken, ownerExists }: {
  ownerEmail: string;
  requestedEmail: string | null;
  expectedToken: string | undefined;
  providedToken: string | null;
  ownerExists: boolean;
}) {
  return !ownerExists && requestedEmail === ownerEmail && bootstrapTokenMatches(expectedToken, providedToken);
}
