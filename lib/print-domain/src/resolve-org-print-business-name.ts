import { resolveOrgBusinessNameDisplay } from "@workspace/settings-domain";

export function resolveOrgPrintBusinessName(
  settings: { businessName?: string | null },
  organizationName?: string | null,
): string {
  const name = resolveOrgBusinessNameDisplay(
    settings.businessName,
    organizationName,
    "",
  );
  return name || "—";
}
