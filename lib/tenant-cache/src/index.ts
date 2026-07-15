export const ORG_KEY_PREFIX = "org" as const;

export type TenantOrgId = number | string;

export type TenantQueryKey = readonly [
  typeof ORG_KEY_PREFIX,
  TenantOrgId,
  ...unknown[],
] & { readonly __tenant: unique symbol };

export function withOrgKey<TBase extends readonly unknown[]>(
  orgId: TenantOrgId | null | undefined,
  baseKey: TBase,
): TenantQueryKey {
  const safeOrgId: TenantOrgId = orgId ?? "__no_org__";
  return [ORG_KEY_PREFIX, safeOrgId, ...baseKey] as unknown as TenantQueryKey;
}

export const GLOBAL_QUERY_KEYS: readonly string[] = [
  "/api/auth/me",
  "/api/healthz",
];

import type { QueryClient, QueryKey } from "@tanstack/react-query";

export function isGlobalQueryKey(key: QueryKey): boolean {
  if (!Array.isArray(key) || key.length === 0) return false;
  const head = key[0];
  if (typeof head !== "string") return false;
  return GLOBAL_QUERY_KEYS.some(
    (g) => head === g || head.startsWith(`${g}/`) || head.startsWith(`${g}?`),
  );
}

export async function purgeOrgCache(
  queryClient: QueryClient,
  orgId: TenantOrgId | null | undefined,
): Promise<void> {
  const predicate = (queryKey: QueryKey) => {
    if (!Array.isArray(queryKey) || queryKey.length === 0) return false;
    if (
      orgId != null &&
      queryKey[0] === ORG_KEY_PREFIX &&
      queryKey[1] === orgId
    ) {
      return true;
    }
    if (queryKey[0] === ORG_KEY_PREFIX) return false;
    return !isGlobalQueryKey(queryKey);
  };

  await queryClient.cancelQueries({ predicate: (q) => predicate(q.queryKey) });
  queryClient.removeQueries({ predicate: (q) => predicate(q.queryKey) });
}
