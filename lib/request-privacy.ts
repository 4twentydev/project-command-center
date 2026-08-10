import { createHash } from "node:crypto";

export function hashedRequestAddress(requestHeaders: Headers, purpose: string, rotateDaily = false, date = new Date()) {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip")?.trim() ?? "unknown";
  const salt = process.env.ANALYTICS_HASH_SALT ?? process.env.CONTACT_HASH_SALT ?? process.env.BETTER_AUTH_SECRET ?? "4twenty-request";
  const rotation = rotateDaily ? date.toISOString().slice(0, 10) : "stable";
  return createHash("sha256").update(`${salt}:${purpose}:${rotation}:${forwarded}`).digest("hex");
}
