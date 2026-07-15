import { eq } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { orgSettings } from "../../../db/schema.js";
import { getOrCreateSettings } from "../../settings/service.js";

export interface OrgTaxContext {
  taxEnabled: boolean;
  taxRate: number;
}

export async function getOrgTaxContext(orgId: number): Promise<OrgTaxContext> {
  const settings = await getOrCreateSettings(orgId);
  return {
    taxEnabled: settings.taxEnabled,
    taxRate: settings.taxRate,
  };
}

export async function readOrgTaxContext(orgId: number): Promise<OrgTaxContext> {
  const [row] = await db
    .select({
      taxEnabled: orgSettings.taxEnabled,
      taxRate: orgSettings.taxRate,
    })
    .from(orgSettings)
    .where(eq(orgSettings.orgId, orgId))
    .limit(1);

  if (!row) {
    return getOrgTaxContext(orgId);
  }

  return {
    taxEnabled: row.taxEnabled,
    taxRate: Number(row.taxRate),
  };
}
