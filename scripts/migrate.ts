import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import { parseMigration, validateMigrationPlan } from "@/scripts/migration-plan";

const migrationsDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../migrations");
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((fileName) => fileName.endsWith(".sql"))
  .sort((left, right) => left.localeCompare(right));
const migrations = await Promise.all(migrationFiles.map(async (fileName) => parseMigration(fileName, await readFile(resolve(migrationsDirectory, fileName), "utf8"))));

validateMigrationPlan(migrations);
if (process.argv.includes("--check")) {
  console.log(`Validated ${migrations.length} application migrations (${migrations.map((migration) => migration.version).join(", ")}).`);
  process.exit(0);
}

const databaseURL = process.env.DATABASE_URL;
if (!databaseURL || databaseURL === "[SENSITIVE]") throw new Error("DATABASE_URL is not configured");

async function runPostgresMigrations(connectionString: string) {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS application_migrations (
      version TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      checksum TEXT NOT NULL CHECK (char_length(checksum) = 64),
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    const appliedRows = await client.query<{ version: string; checksum: string }>("SELECT version, checksum FROM application_migrations ORDER BY version");
    const applied = new Map(appliedRows.rows.map((row) => [row.version, row.checksum]));

    for (const migration of migrations) {
      const recordedChecksum = applied.get(migration.version);
      if (recordedChecksum && recordedChecksum !== migration.checksum) throw new Error(`Migration ${migration.version} checksum differs from the applied database record`);
      if (recordedChecksum) {
        console.log(`Skipping ${migration.version} ${migration.name} (already applied).`);
        continue;
      }
      await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
      try {
        await client.query("SELECT pg_advisory_xact_lock(hashtext('project-command-center-application-migrations'))");
        for (const statement of migration.statements) await client.query(statement);
        await client.query("INSERT INTO application_migrations (version, name, checksum) VALUES ($1, $2, $3)", [migration.version, migration.name, migration.checksum]);
        await client.query("COMMIT");
        console.log(`Applied ${migration.version} ${migration.name}.`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

async function runNeonMigrations(connectionString: string) {
  const sql = neon(connectionString);
  await sql.transaction([sql`CREATE TABLE IF NOT EXISTS application_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  checksum TEXT NOT NULL CHECK (char_length(checksum) = 64),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`]);

  const appliedRows = await sql`SELECT version, checksum FROM application_migrations ORDER BY version`;
  const applied = new Map(appliedRows.map((row) => [String(row.version), String(row.checksum)]));

  for (const migration of migrations) {
    const recordedChecksum = applied.get(migration.version);
    if (recordedChecksum && recordedChecksum !== migration.checksum) throw new Error(`Migration ${migration.version} checksum differs from the applied database record`);
    if (recordedChecksum) {
      console.log(`Skipping ${migration.version} ${migration.name} (already applied).`);
      continue;
    }
    await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(hashtext('project-command-center-application-migrations'))`,
      ...migration.statements.map((statement) => sql.query(statement)),
      sql`INSERT INTO application_migrations (version, name, checksum) VALUES (${migration.version}, ${migration.name}, ${migration.checksum})`,
    ], { isolationLevel: "Serializable" });
    console.log(`Applied ${migration.version} ${migration.name}.`);
  }
}

if (process.env.MIGRATION_DATABASE_DRIVER === "postgres") await runPostgresMigrations(databaseURL);
else await runNeonMigrations(databaseURL);

console.log("Application database migrations completed.");
