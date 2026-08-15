import { createHash } from "node:crypto";

export const statementBreakpoint = "--> statement-breakpoint";
const migrationFilePattern = /^(\d{4})_([a-z0-9-]+)\.sql$/;

export type Migration = {
  version: string;
  name: string;
  checksum: string;
  statements: string[];
};

export function canonicalMigrationSource(source: string) {
  return source.replace(/\r\n?/g, "\n");
}

export function parseMigration(fileName: string, source: string): Migration {
  const match = migrationFilePattern.exec(fileName);
  if (!match) throw new Error(`Invalid migration filename: ${fileName}`);
  const canonicalSource = canonicalMigrationSource(source);
  const statements = canonicalSource.split(statementBreakpoint).map((statement) => statement.trim()).filter(Boolean);
  if (!statements.length) throw new Error(`Migration ${fileName} contains no SQL statements`);
  return {
    version: match[1],
    name: match[2],
    checksum: createHash("sha256").update(canonicalSource).digest("hex"),
    statements,
  };
}

export function validateMigrationPlan(migrations: Migration[]) {
  if (!migrations.length) throw new Error("No application migrations were found");
  const versions = migrations.map((migration) => migration.version);
  if (new Set(versions).size !== versions.length) throw new Error("Application migration versions must be unique");
  const sortedVersions = [...versions].sort((left, right) => left.localeCompare(right));
  if (!versions.every((version, index) => version === sortedVersions[index])) throw new Error("Application migrations must be ordered by version");
}
