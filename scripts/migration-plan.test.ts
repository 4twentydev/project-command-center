import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { canonicalMigrationSource, parseMigration, validateMigrationPlan } from "@/scripts/migration-plan";

const migrationsDirectory = resolve(import.meta.dir, "../migrations");

describe("application migration plan", () => {
  test("loads ordered, unique, nonempty migrations", async () => {
    const fileNames = (await readdir(migrationsDirectory)).filter((fileName) => fileName.endsWith(".sql")).sort();
    const migrations = await Promise.all(fileNames.map(async (fileName) => parseMigration(fileName, await readFile(resolve(migrationsDirectory, fileName), "utf8"))));
    expect(migrations.map((migration) => migration.version)).toEqual(["0001", "0002"]);
    expect(new Set(migrations.map((migration) => migration.version)).size).toBe(migrations.length);
    expect(migrations.every((migration) => migration.statements.length > 0)).toBeTrue();
    expect(migrations.every((migration) => /^[0-9a-f]{64}$/.test(migration.checksum))).toBeTrue();
    expect(() => validateMigrationPlan(migrations)).not.toThrow();
  });

  test("keeps checksums stable across operating-system line endings", () => {
    const lf = "SELECT 1;\n--> statement-breakpoint\nSELECT 2;\n";
    const crlf = lf.replaceAll("\n", "\r\n");
    expect(parseMigration("0001_example.sql", lf).checksum).toBe(parseMigration("0001_example.sql", crlf).checksum);
    expect(canonicalMigrationSource(crlf)).toBe(lf);
  });

  test("rejects malformed migration files before database access", () => {
    expect(() => parseMigration("migration.sql", "SELECT 1")).toThrow("Invalid migration filename");
    expect(() => parseMigration("0001_empty.sql", "   ")).toThrow("contains no SQL statements");
    const migration = parseMigration("0001_example.sql", "SELECT 1");
    expect(() => validateMigrationPlan([migration, migration])).toThrow("versions must be unique");
  });

  test("declares the required constraints, relationships, and query indexes", async () => {
    const plan = (await Promise.all((await readdir(migrationsDirectory)).filter((fileName) => fileName.endsWith(".sql")).map((fileName) => readFile(resolve(migrationsDirectory, fileName), "utf8")))).map(canonicalMigrationSource).join("\n");
    for (const expected of [
      "contact_inquiries_status_check",
      "contact_inquiries_notification_status_check",
      "consultations_status_check",
      "workspace_snapshots_workspace_id_fkey",
      "contact_inquiries_ip_hash_created_at_idx",
      "contact_inquiries_due_follow_up_idx",
      "contact_inquiries_created_at_id_idx",
      "conversion_events_visitor_hash_idx",
    ]) expect(plan).toContain(expected);
  });
});
