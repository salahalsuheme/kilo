const REQUIRED_DATABASE = "kilo_app";
const BLOCKED_DATABASES = new Set(["targa_erp", "targa", "postgres"]);

export function databaseNameFromUrl(connectionString: string): string {
  const match = connectionString.match(/\/([^/?]+)(?:\?|$)/);
  if (!match?.[1]) {
    throw new Error(`Invalid DATABASE_URL: could not parse database name.`);
  }
  return decodeURIComponent(match[1]);
}

export function assertKiloDatabase(connectionString: string): void {
  const dbName = databaseNameFromUrl(connectionString);

  if (BLOCKED_DATABASES.has(dbName)) {
    throw new Error(
      `Kilo refused to connect to "${dbName}". Use a dedicated Kilo database, not Targa.`,
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction && dbName !== REQUIRED_DATABASE) {
    throw new Error(
      `Kilo must use database "${REQUIRED_DATABASE}" in development, not "${dbName}". Update artifacts/api-server/.env.`,
    );
  }
}
