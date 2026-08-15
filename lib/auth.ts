import { passkey } from "@better-auth/passkey";
import { brand } from "@/lib/brand";
import { resolveAuthConfiguration, type AuthConfiguration } from "@/lib/auth-config";
import { ownerBootstrapAllowed } from "@/lib/owner-bootstrap";
import { betterAuth } from "better-auth";
import { Pool } from "pg";

let authConfiguration: AuthConfiguration | undefined;
let authPool: Pool | undefined;

export function getAuthConfiguration() {
  authConfiguration ??= resolveAuthConfiguration();
  return authConfiguration;
}

function getAuthPool() {
  authPool ??= new Pool({ connectionString: getAuthConfiguration().databaseURL });
  return authPool;
}

export async function authUserExists() {
  const result = await getAuthPool().query<{ exists: boolean }>('SELECT EXISTS (SELECT 1 FROM "user") AS exists');
  return result.rows[0]?.exists === true;
}

function createAuth() {
  const configuration = getAuthConfiguration();

  return betterAuth({
    appName: brand.name,
    baseURL: configuration.baseURL,
    secret: configuration.secret,
    database: getAuthPool(),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user, context) => {
            const allowed = ownerBootstrapAllowed({
              ownerEmail: configuration.ownerEmail,
              requestedEmail: user.email.trim().toLowerCase(),
              expectedToken: configuration.bootstrapToken,
              providedToken: context?.request?.headers.get("x-owner-bootstrap-token") ?? null,
              ownerExists: await authUserExists(),
            });
            if (!allowed) return false;
          },
        },
      },
    },
    plugins: [
      passkey({
        rpID: configuration.relyingPartyId,
        rpName: brand.name,
        origin: configuration.baseURL,
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
