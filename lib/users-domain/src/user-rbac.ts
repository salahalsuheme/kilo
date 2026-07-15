import type { UserRole } from "./types.js";

const MANAGER_ALIASES = new Set(["manager", "admin"]);

export function normalizeUserRole(role: string): UserRole {
  if (MANAGER_ALIASES.has(role)) return "manager";
  return "employee";
}

export function isManager(role: string): boolean {
  return MANAGER_ALIASES.has(role);
}

/** Routes hidden from employees in navigation and direct access. */
export const MANAGER_ONLY_PATHS = ["/settings", "/finance", "/users"] as const;

export function isManagerOnlyPath(path: string): boolean {
  return MANAGER_ONLY_PATHS.some(
    (restricted) => path === restricted || path.startsWith(`${restricted}/`),
  );
}

export function canAccessPath(role: string, path: string): boolean {
  if (!isManagerOnlyPath(path)) return true;
  return isManager(role);
}
