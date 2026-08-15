export const defaultTimeZone = "America/Denver";

const validTimeZones = new Set<string>();
const invalidTimeZones = new Set<string>();

export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  const timeZone = value.trim();
  if (validTimeZones.has(timeZone)) return true;
  if (invalidTimeZones.has(timeZone)) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(0);
    validTimeZones.add(timeZone);
    return true;
  } catch {
    invalidTimeZones.add(timeZone);
    return false;
  }
}

export function normalizeTimeZone(value: unknown, fallback = defaultTimeZone) {
  if (isValidTimeZone(value)) return value.trim();
  return isValidTimeZone(fallback) ? fallback.trim() : defaultTimeZone;
}

export function dateKeyInTimeZone(date = new Date(), timeZone = defaultTimeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimeZone(timeZone), year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function dateKeyAsUTC(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return dateKeyAsUTC(value).toISOString().slice(0, 10) === value;
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const date = dateKeyAsUTC(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetweenDateKeys(start: string, end: string) {
  return Math.round((dateKeyAsUTC(end).getTime() - dateKeyAsUTC(start).getTime()) / 86_400_000);
}

export function weekdayLabelForDateKey(dateKey: string, locale?: string) {
  return dateKeyAsUTC(dateKey).toLocaleDateString(locale, { weekday: "narrow", timeZone: "UTC" });
}
