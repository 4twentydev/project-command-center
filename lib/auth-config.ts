import { isIP } from "node:net";
import { isValidEmailAddress } from "@/lib/semantic-validation";

const developmentDefaults = {
  baseURL: "http://localhost:3000",
  databaseURL: "postgresql://localhost:5432/work_ctrl",
  ownerEmail: "owner@example.com",
  secret: "local-development-secret-change-before-deploying",
} as const;

export type AuthConfiguration = {
  baseURL: string;
  databaseURL: string;
  ownerEmail: string;
  relyingPartyId: string;
  secret: string;
  bootstrapToken?: string;
};

type AuthEnvironment = Partial<Record<"BETTER_AUTH_URL" | "DATABASE_URL" | "OWNER_EMAIL" | "PASSKEY_RP_ID" | "BETTER_AUTH_SECRET" | "OWNER_BOOTSTRAP_TOKEN", string>>;

function configuredValue(name: keyof AuthEnvironment, value: string | undefined, fallback: string, production: boolean) {
  if (value && value !== "[SENSITIVE]") return value;
  if (production) throw new Error(`${name} must be configured in production`);
  return fallback;
}

export function hasStrongSecret(value: string) {
  const normalized = value.toLowerCase();
  return value.length >= 32
    && value.trim() === value
    && !/\s/.test(value)
    && new Set(value).size >= 12
    && !["change-me", "changeme", "example", "placeholder", "replace-with", "secret"].some((fragment) => normalized.includes(fragment));
}

function parseBaseURL(value: string, production: boolean) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("BETTER_AUTH_URL must be a valid absolute URL");
  }
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("BETTER_AUTH_URL must be an origin without credentials, path, query, or fragment");
  if (production && (url.protocol !== "https:" || url.port)) throw new Error("BETTER_AUTH_URL must use HTTPS without a custom port in production");
  if (!production && !["http:", "https:"].includes(url.protocol)) throw new Error("BETTER_AUTH_URL must use HTTP or HTTPS");
  return url;
}

function parseDatabaseURL(value: string) {
  try {
    const url = new URL(value);
    if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || !url.pathname || url.pathname === "/") throw new Error();
    return value;
  } catch {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
  }
}

function parseRelyingPartyId(value: string, origin: URL, production: boolean) {
  const relyingPartyId = value.trim().toLowerCase().replace(/\.$/, "");
  if (!relyingPartyId || relyingPartyId.includes(":") || relyingPartyId.includes("/") || relyingPartyId.includes("@")) throw new Error("PASSKEY_RP_ID must be a hostname");
  const originHostname = origin.hostname.toLowerCase().replace(/\.$/, "");
  const matchesOrigin = originHostname === relyingPartyId || originHostname.endsWith(`.${relyingPartyId}`);
  if (!matchesOrigin) throw new Error("PASSKEY_RP_ID must equal the authentication hostname or one of its parent domains");
  if (production && (isIP(relyingPartyId) !== 0 || !relyingPartyId.includes("."))) throw new Error("PASSKEY_RP_ID must be a registrable domain in production");
  return relyingPartyId;
}

export function resolveAuthConfiguration(environment: AuthEnvironment = {
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  OWNER_EMAIL: process.env.OWNER_EMAIL,
  PASSKEY_RP_ID: process.env.PASSKEY_RP_ID,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  OWNER_BOOTSTRAP_TOKEN: process.env.OWNER_BOOTSTRAP_TOKEN,
}, nodeEnvironment = process.env.NODE_ENV): AuthConfiguration {
  const production = nodeEnvironment === "production";
  const baseURL = configuredValue("BETTER_AUTH_URL", environment.BETTER_AUTH_URL, developmentDefaults.baseURL, production);
  const origin = parseBaseURL(baseURL, production);
  const databaseURL = parseDatabaseURL(configuredValue("DATABASE_URL", environment.DATABASE_URL, developmentDefaults.databaseURL, production));
  const ownerEmail = configuredValue("OWNER_EMAIL", environment.OWNER_EMAIL, developmentDefaults.ownerEmail, production).trim().toLowerCase();
  if (!isValidEmailAddress(ownerEmail)) throw new Error("OWNER_EMAIL must be a valid operational email address");
  const secret = configuredValue("BETTER_AUTH_SECRET", environment.BETTER_AUTH_SECRET, developmentDefaults.secret, production);
  if (production && !hasStrongSecret(secret)) throw new Error("BETTER_AUTH_SECRET must contain at least 32 high-entropy characters in production");
  const relyingPartyId = parseRelyingPartyId(configuredValue("PASSKEY_RP_ID", environment.PASSKEY_RP_ID, origin.hostname, production), origin, production);
  const bootstrapToken = environment.OWNER_BOOTSTRAP_TOKEN && environment.OWNER_BOOTSTRAP_TOKEN !== "[SENSITIVE]" ? environment.OWNER_BOOTSTRAP_TOKEN : undefined;
  if (bootstrapToken && !hasStrongSecret(bootstrapToken)) throw new Error("OWNER_BOOTSTRAP_TOKEN must contain at least 32 high-entropy characters");
  return { baseURL: origin.origin, databaseURL, ownerEmail, relyingPartyId, secret, bootstrapToken };
}
