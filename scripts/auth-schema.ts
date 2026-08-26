import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const databaseURL = process.env.DATABASE_URL;
if (!databaseURL) throw new Error("DATABASE_URL is required to migrate the authentication schema");

export const auth = betterAuth({
  database: new Pool({ connectionString: databaseURL }),
  plugins: [passkey()],
});
