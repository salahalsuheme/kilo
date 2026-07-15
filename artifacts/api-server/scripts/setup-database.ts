import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { assertKiloDatabase, databaseNameFromUrl } from "../src/db/assert-kilo-database.js";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "../.env");

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(envPath);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing in artifacts/api-server/.env");
  process.exit(1);
}

assertKiloDatabase(databaseUrl);

const dbName = databaseNameFromUrl(databaseUrl);
const adminUrl =
  process.env.KILO_ADMIN_DATABASE_URL ?? databaseUrl.replace(`/${dbName}`, "/postgres");

async function ensureDatabaseExists(): Promise<void> {
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  if (exists.rowCount === 0) {
    console.log(`Creating database "${dbName}"...`);
    await admin.query(`CREATE DATABASE ${dbName}`);
  } else {
    console.log(`Database "${dbName}" already exists.`);
  }
  await admin.end();
}

async function main() {
  await ensureDatabaseExists();

  if (process.env.KILO_DEV_RESET === "1") {
    console.log("KILO_DEV_RESET=1 — recreating public schema...");
    const resetClient = new pg.Client({ connectionString: databaseUrl });
    await resetClient.connect();
    await resetClient.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    await resetClient.end();
  }

  const { runMigrations } = await import("../src/db/migrate.js");
  const { ensureSeedData } = await import("../src/modules/bootstrap/service.js");

  await runMigrations();
  await ensureSeedData();

  const check = new pg.Client({ connectionString: databaseUrl });
  await check.connect();
  const tables = await check.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename",
  );
  const users = await check.query("SELECT email FROM users ORDER BY id");
  await check.end();

  console.log(`Kilo database ready on "${dbName}".`);
  console.log("tables:", tables.rows.map((r) => r.tablename).join(", "));
  console.log("users:", users.rows.map((r) => r.email).join(", ") || "(none)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
