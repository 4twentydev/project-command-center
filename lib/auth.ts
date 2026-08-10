import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { Pool } from "pg";

function readableEnvironmentValue(value: string | undefined, fallback: string) {
  return value && value !== "[SENSITIVE]" ? value : fallback;
}

const baseURL = readableEnvironmentValue(process.env.BETTER_AUTH_URL, "http://localhost:3000");
const relyingPartyId = readableEnvironmentValue(process.env.PASSKEY_RP_ID, new URL(baseURL).hostname);
const databaseURL = readableEnvironmentValue(process.env.DATABASE_URL, "postgresql://localhost:5432/work_ctrl");
const secret = readableEnvironmentValue(process.env.BETTER_AUTH_SECRET, "local-development-secret-change-before-deploying");

export const auth = betterAuth({
  appName: "4TWENTY.DEV",
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
      rpName: "4TWENTY.DEV",
      origin: baseURL,
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "required",
      },
    }),
  ],
});
