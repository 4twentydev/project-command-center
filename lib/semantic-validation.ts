import { isValidDateKey } from "@/lib/date-time";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const emailLocalPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i;
const domainLabelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

export function isValidDateValue(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const datePrefix = value.slice(0, 10);
  if (isValidDateKey(value)) return true;
  if (!isoDateTimePattern.test(value) || !isValidDateKey(datePrefix)) return false;
  return Number.isFinite(Date.parse(value));
}

export function isValidEmailAddress(value: unknown, maximum = 320): value is string {
  if (typeof value !== "string" || value.length > maximum || /[\s\u0000-\u001f\u007f]/.test(value)) return false;
  const separator = value.lastIndexOf("@");
  if (separator < 1 || separator !== value.indexOf("@")) return false;
  const local = value.slice(0, separator);
  const domain = value.slice(separator + 1);
  if (local.length > 64 || !emailLocalPattern.test(local) || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  const labels = domain.split(".");
  return domain.length <= 253 && labels.length > 1 && labels.every((label) => domainLabelPattern.test(label));
}

export function validUUID(value: unknown) {
  return typeof value === "string" && uuidPattern.test(value) ? value : null;
}

export function normalizeHTTPSURL(value: unknown, maximum = 500) {
  if (typeof value !== "string") return undefined;
  const candidate = value.trim();
  if (!candidate || candidate.length > maximum) return undefined;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function uniqueById<T extends { id: string }>(records: T[]) {
  const seen = new Set<string>();
  return records.filter((record) => {
    if (seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  });
}
