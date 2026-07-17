const DEV_SESSION_FALLBACK = "kilo-local-dev-only-not-for-production";
const DEV_DATABASE_FALLBACK = "postgresql://postgres:postgres@localhost:5432/kilo_app";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;

  if (isProduction()) {
    throw new Error("DATABASE_URL is required in production.");
  }

  return DEV_DATABASE_FALLBACK;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;

  if (isProduction()) {
    throw new Error("SESSION_SECRET is required in production (use a long random value).");
  }

  return DEV_SESSION_FALLBACK;
}

export function getCorsOrigins(): string[] {
  const configured = parseOrigins(process.env.CORS_ORIGIN);
  if (configured.length > 0) return configured;

  if (isProduction()) {
    return ["https://app.kilo-sa.com"];
  }

  return ["http://localhost:5174"];
}

export function getApiPublicUrl(): string {
  const configured = process.env.API_PUBLIC_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (isProduction()) {
    return "https://app.kilo-sa.com";
  }

  const port = process.env.PORT ?? process.env.API_PORT ?? "8080";
  return `http://localhost:${port}`;
}

export function getListenPort(): number {
  const raw = process.env.PORT ?? process.env.API_PORT ?? "8080";
  const port = Number(raw);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Invalid port: ${raw}`);
  }
  return port;
}

export function getBootstrapAdminEmail(): string {
  return process.env.KILO_ADMIN_EMAIL?.trim() || "admin@kilo-sa.com";
}

export function getBootstrapAdminPassword(): string | null {
  const password = process.env.KILO_ADMIN_PASSWORD?.trim();
  if (password) return password;

  if (isProduction()) {
    return null;
  }

  return process.env.KILO_DEV_ADMIN_PASSWORD?.trim() || "dev-only-change-me";
}

export function validateProductionEnv(): void {
  if (!isProduction()) return;

  requireEnv("DATABASE_URL");
  requireEnv("SESSION_SECRET");

  const secret = process.env.SESSION_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters in production.");
  }

  if (DEV_SESSION_FALLBACK === secret) {
    throw new Error("SESSION_SECRET must not use the development fallback in production.");
  }
}
