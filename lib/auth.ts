import { passkey } from "@better-auth/passkey";
import { brand } from "@/lib/brand";
import { betterAuth } from "better-auth";
import { Pool } from "pg";

function environmentValue(name: string, value: string | undefined, developmentFallback: string) {
  if (value && value !== "[SENSITIVE]") return value;
  if (process.env.NODE_ENV === "production") throw new Error(`${name} must be configured in production`);
  return developmentFallback;
}

function createAuth() {
  const baseURL = environmentValue("BETTER_AUTH_URL", process.env.BETTER_AUTH_URL, "http://localhost:3000");
  const relyingPartyId = environmentValue("PASSKEY_RP_ID", process.env.PASSKEY_RP_ID, new URL(baseURL).hostname);
  const databaseURL = environmentValue("DATABASE_URL", process.env.DATABASE_URL, "postgresql://localhost:5432/work_ctrl");
  const secret = environmentValue("BETTER_AUTH_SECRET", process.env.BETTER_AUTH_SECRET, "local-development-secret-change-before-deploying");

  return betterAuth({
    appName: brand.name,
    baseURL,
    secret,
    database: new Pool({ connectionString: databaseURL }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
    },
    plugins: [
      passkey({
        rpID: relyingPartyId,
        rpName: brand.name,
        origin: baseURL,
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "required",
        },
      }),
    ],
  });

}

let authInstance: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  authInstance ??= createAuth();
  return authInstance;
}
