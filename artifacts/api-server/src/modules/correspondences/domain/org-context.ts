import { eq } from "drizzle-orm";
import { resolveOrgBusinessNameDisplay } from "@workspace/settings-domain";
import { db } from "../../../db/index.js";
import { orgSettings, organizations } from "../../../db/schema.js";
import { mapNotificationEmailRow } from "../../settings/domain/notification-email.js";

export async function loadCorrespondenceOrgContext(orgId: number) {
  const [row] = await db
    .select({
      settings: orgSettings,
      organizationName: organizations.name,
    })
    .from(orgSettings)
    .innerJoin(organizations, eq(organizations.id, orgSettings.orgId))
    .where(eq(orgSettings.orgId, orgId))
    .limit(1);

  if (!row) {
    return null;
  }

  const businessName = resolveOrgBusinessNameDisplay(
    row.settings.businessName,
    row.organizationName,
  );

  return {
    businessName,
    logoUrl: row.settings.logoUrl,
    notificationEmailEnabled: row.settings.notificationEmailEnabled,
    notificationEmail: mapNotificationEmailRow(row.settings),
    smtpPassword: row.settings.notificationSmtpPassword,
  };
}
