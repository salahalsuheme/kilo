import { resolveOrgBusinessNameDisplay } from "@workspace/settings-domain";
import { eq } from "drizzle-orm";
import { PutSettingsBody } from "@workspace/api-zod";
import { EMPTY_NATIONAL_ADDRESS } from "@workspace/settings-domain";
import type { z } from "zod";
import { db } from "../../db/index.js";
import { orgSettings, organizations } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import {
  mapNationalAddressRow,
  mergeSettingsNationalAddress,
} from "./domain/national-address.js";
import { resolveSettingsTaxNumber } from "./domain/org-tax.js";
import { resolveSettingsUnifiedNumber } from "./domain/org-unified-number.js";

function mapSettings(
  row: typeof orgSettings.$inferSelect,
  organizationName?: string | null,
) {
  return {
    businessName: resolveOrgBusinessNameDisplay(row.businessName, organizationName),
    logoUrl: row.logoUrl,
    stampUrl: row.stampUrl,
    signatureUrl: row.signatureUrl,
    taxEnabled: row.taxEnabled,
    taxRate: Number(row.taxRate),
    taxNumber: row.taxNumber,
    unifiedNumber: row.unifiedNumber,
    nationalAddress: mapNationalAddressRow(row),
    notificationEmailEnabled: row.notificationEmailEnabled,
    notificationSmsEnabled: row.notificationSmsEnabled,
  };
}

function nationalAddressToColumns(address: ReturnType<typeof mapNationalAddressRow>) {
  return {
    nationalAddressRegion: address.region,
    nationalAddressCity: address.city,
    nationalAddressDistrict: address.district,
    nationalAddressStreet: address.street,
    nationalAddressBuildingNumber: address.buildingNumber,
    nationalAddressAdditionalNumber: address.additionalNumber,
    nationalAddressPostalCode: address.postalCode,
    nationalAddressShortAddress: address.shortAddress,
  };
}

export async function getOrCreateSettings(orgId: number) {
  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  let [settings] = await db
    .select()
    .from(orgSettings)
    .where(eq(orgSettings.orgId, orgId))
    .limit(1);

  if (!settings) {
    [settings] = await db
      .insert(orgSettings)
      .values({
        orgId,
        businessName: org?.name ?? "كيلو",
      })
      .returning();
  }

  return mapSettings(settings, org?.name);
}

export async function updateSettings(orgId: number, body: z.infer<typeof PutSettingsBody>) {
  const current = await getOrCreateSettings(orgId);
  const nextNationalAddress = mergeSettingsNationalAddress(
    current.nationalAddress ?? EMPTY_NATIONAL_ADDRESS,
    body.nationalAddress ?? undefined,
  );

  const [row] = await db
    .update(orgSettings)
    .set({
      businessName: body.businessName ?? undefined,
      taxEnabled: body.taxEnabled ?? undefined,
      taxRate: body.taxRate != null ? String(body.taxRate) : undefined,
      taxNumber:
        body.taxNumber !== undefined ? resolveSettingsTaxNumber(body.taxNumber) : undefined,
      unifiedNumber:
        body.unifiedNumber !== undefined
          ? resolveSettingsUnifiedNumber(body.unifiedNumber)
          : undefined,
      ...(body.nationalAddress
        ? nationalAddressToColumns(nextNationalAddress)
        : {}),
      notificationEmailEnabled: body.notificationEmailEnabled ?? undefined,
      notificationSmsEnabled: body.notificationSmsEnabled ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(orgSettings.orgId, orgId))
    .returning();

  await recordActivity(orgId, "settings", "تحديث إعدادات الشركة");
  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  return mapSettings(row, org?.name);
}

export async function updateLogo(orgId: number, logoUrl: string) {
  await getOrCreateSettings(orgId);
  const [row] = await db
    .update(orgSettings)
    .set({ logoUrl, updatedAt: new Date() })
    .where(eq(orgSettings.orgId, orgId))
    .returning();
  await recordActivity(orgId, "settings", "تحديث شعار الشركة");
  return { logoUrl: row.logoUrl! };
}

export async function updateStamp(orgId: number, stampUrl: string) {
  await getOrCreateSettings(orgId);
  const [row] = await db
    .update(orgSettings)
    .set({ stampUrl, updatedAt: new Date() })
    .where(eq(orgSettings.orgId, orgId))
    .returning();
  await recordActivity(orgId, "settings", "تحديث ختم الشركة");
  return { stampUrl: row.stampUrl! };
}

export async function updateSignature(orgId: number, signatureUrl: string) {
  await getOrCreateSettings(orgId);
  const [row] = await db
    .update(orgSettings)
    .set({ signatureUrl, updatedAt: new Date() })
    .where(eq(orgSettings.orgId, orgId))
    .returning();
  await recordActivity(orgId, "settings", "تحديث توقيع الشركة");
  return { signatureUrl: row.signatureUrl! };
}
