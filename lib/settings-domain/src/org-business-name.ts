export function resolveOrgBusinessNameDisplay(
  businessName: string | null | undefined,
  organizationName?: string | null,
  fallback = "",
): string {
  const fromSettings = businessName?.trim();
  if (fromSettings) return fromSettings;
  const fromOrg = organizationName?.trim();
  if (fromOrg) return fromOrg;
  return fallback;
}
