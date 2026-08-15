import { afterAll, describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

const databaseURL = process.env.TEST_DATABASE_URL;
const databaseTest = databaseURL ? test : test.skip;
const pool = databaseURL ? new Pool({ connectionString: databaseURL }) : null;

async function expectPostgresError(query: Promise<unknown>, code: string) {
  let caught: unknown;
  try {
    await query;
  } catch (error) {
    caught = error;
  }
  expect(caught).toMatchObject({ code });
}

afterAll(async () => {
  await pool?.end();
});

describe("PostgreSQL migration integration", () => {
  databaseTest("records every tracked migration with a complete checksum", async () => {
    const expected = readdirSync(resolve(process.cwd(), "migrations")).filter((name) => name.endsWith(".sql")).length;
    const result = await pool!.query<{ count: number }>("SELECT COUNT(*)::int AS count FROM application_migrations WHERE char_length(checksum) = 64");
    expect(result.rows[0]?.count).toBe(expected);
  });

  databaseTest("enforces inquiry status and snapshot relationship constraints", async () => {
    await expectPostgresError(
      pool!.query("INSERT INTO contact_inquiries (name, email, message, ip_hash, status) VALUES ($1, $2, $3, $4, $5)", ["Test", "test@example.com", "Test message", "test-hash", "invalid"]),
      "23514",
    );
    await expectPostgresError(
      pool!.query("INSERT INTO workspace_snapshots (workspace_id, data) VALUES ($1, $2::jsonb)", ["missing-workspace", "{}"]),
      "23503",
    );
  });
});
