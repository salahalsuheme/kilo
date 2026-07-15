import { eq } from "drizzle-orm";
import { PutSettingsBody } from "@workspace/api-zod";
import type { z } from "zod";
import { db } from "../../db/index.js";
import { orgSettings, organizations } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import { resolveSettingsTaxNumber } from "./domain/org-tax.js";

function mapSettings(row: typeof orgSettings.$inferSelect) {
  return {
    businessName: row.businessName,
    logoUrl: row.logoUrl,
    taxEnabled: row.taxEnabled,
    taxRate: Number(row.taxRate),
    taxNumber: row.taxNumber,
    notificationEmailEnabled: row.notificationEmailEnabled,
    notificationSmsEnabled: row.notificationSmsEnabled,
  };
}

export async function getOrCreateSettings(orgId: number) {
  let [settings] = await db
    .select()
    .from(orgSettings)
    .where(eq(orgSettings.orgId, orgId))
    .limit(1);

  if (!settings) {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);
    [settings] = await db
      .insert(orgSettings)
      .values({
        orgId,
        businessName: org?.name ?? "كيلو",
      })
      .returning();
  }

  return mapSettings(settings);
}

export async function updateSettings(orgId: number, body: z.infer<typeof PutSettingsBody>) {
  const [row] = await db
    .update(orgSettings)
    .set({
      businessName: body.businessName ?? undefined,
      taxEnabled: body.taxEnabled ?? undefined,
      taxRate: body.taxRate != null ? String(body.taxRate) : undefined,
      taxNumber:
        body.taxNumber !== undefined ? resolveSettingsTaxNumber(body.taxNumber) : undefined,
      notificationEmailEnabled: body.notificationEmailEnabled ?? undefined,
      notificationSmsEnabled: body.notificationSmsEnabled ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(orgSettings.orgId, orgId))
    .returning();

  await recordActivity(orgId, "settings", "تحديث إعدادات الشركة");
  return mapSettings(row);
}

export async function updateLogo(orgId: number, logoUrl: string) {
  await getOrCreateSettings(orgId);
  const [row] = await db
    .update(orgSettings)
    .set({ logoUrl, updatedAt: new Date() })
    .where(eq(orgSettings.orgId, orgId))
    .returning();
  await recordActivity(orgId, "settings", "تحديث شعار الشركة");
  return { logoUrl: row.logoUrl };
}
