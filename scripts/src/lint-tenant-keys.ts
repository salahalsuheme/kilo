#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");
const ROOT = join(REPO_ROOT, "artifacts", "kilo-app", "src");

const ALLOWED_DIRECT_IMPORTERS = new Set<string>([
  "lib/api-client-react-tenant.ts",
  "App.tsx",
  "pages/login.tsx",
  "components/auth/login-form.tsx",
  "components/auth/login-shell.tsx",
]);

const RAW_API_MODULE = "@workspace/api-client-react";
const RAW_API_GENERATED = resolve(
  REPO_ROOT,
  "lib",
  "api-client-react",
  "src",
  "generated",
  "api.ts",
);
const WRAPPER_FILE = join(ROOT, "lib", "api-client-react-tenant.ts");

const GLOBAL_QUERY_HOOKS: ReadonlySet<string> = new Set([
  "useGetMe",
  "useHealthCheck",
]);

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules") continue;
      walk(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function checkWrapperCoverage(): string[] {
  const generated = readFileSync(RAW_API_GENERATED, "utf8");
  const wrapper = readFileSync(WRAPPER_FILE, "utf8");
  const hookNames = [...generated.matchAll(/export function (use[A-Z]\w+)/g)].map((m) => m[1]);
  const keyGetters = new Set(
    [...generated.matchAll(/export const (get[A-Z]\w+QueryKey)/g)].map((m) => m[1]),
  );

  const violations: string[] = [];
  for (const hook of hookNames) {
    if (GLOBAL_QUERY_HOOKS.has(hook)) continue;
    const keyName = `get${hook.slice(3)}QueryKey`;
    if (!keyGetters.has(keyName)) continue;
    if (!wrapper.includes(`export const ${hook}`)) {
      violations.push(`Missing tenant wrapper for ${hook}`);
    }
  }
  return violations;
}

function findRawApiImports(): string[] {
  const violations: string[] = [];
  for (const file of walk(ROOT)) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (ALLOWED_DIRECT_IMPORTERS.has(rel)) continue;
    const content = readFileSync(file, "utf8");
    if (content.includes(RAW_API_MODULE)) {
      violations.push(`${rel}: direct import of ${RAW_API_MODULE}`);
    }
  }
  return violations;
}

function main() {
  const errors = [...checkWrapperCoverage(), ...findRawApiImports()];
  if (errors.length > 0) {
    console.error("lint:tenant-keys failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }
  console.log("lint:tenant-keys passed");
}

main();
