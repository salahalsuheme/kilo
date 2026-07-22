import { and, desc, eq, isNull } from "drizzle-orm";
import {
  computeCurrentAssetValue,
  todayIsoDate,
} from "@workspace/finance-domain";
import { db } from "../../db/index.js";
import { companyAssets } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

function mapAssetRow(row: typeof companyAssets.$inferSelect) {
  const initialValue = toNumber(row.initialValue);
  const annualDepreciationRate = toNumber(row.annualDepreciationRate);

  return {
    id: row.id,
    assetType: row.assetType,
    acquiredDate: row.acquiredDate,
    referenceNumber: row.referenceNumber,
    initialValue,
    currentValue: computeCurrentAssetValue(
      initialValue,
      annualDepreciationRate,
      row.acquiredDate,
    ),
    annualDepreciationRate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listCompanyAssets(orgId: number) {
  const rows = await db
    .select()
    .from(companyAssets)
    .where(and(eq(companyAssets.orgId, orgId), isNull(companyAssets.deletedAt)))
    .orderBy(desc(companyAssets.acquiredDate), desc(companyAssets.createdAt));

  return { data: rows.map(mapAssetRow) };
}

export async function getCompanyAsset(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(companyAssets)
    .where(
      and(
        eq(companyAssets.orgId, orgId),
        eq(companyAssets.id, id),
        isNull(companyAssets.deletedAt),
      ),
    )
    .limit(1);
  return row ? mapAssetRow(row) : null;
}

export async function createCompanyAsset(
  orgId: number,
  body: {
    assetType: string;
    referenceNumber: string;
    initialValue: number;
    annualDepreciationRate: number;
  },
) {
  const [row] = await db
    .insert(companyAssets)
    .values({
      orgId,
      assetType: body.assetType,
      acquiredDate: todayIsoDate(),
      referenceNumber: body.referenceNumber,
      initialValue: String(body.initialValue),
      annualDepreciationRate: String(body.annualDepreciationRate),
    })
    .returning();

  await recordActivity(
    orgId,
    "finance",
    `إضافة أصل: ${body.referenceNumber} — ${body.assetType}`,
  );

  return mapAssetRow(row);
}

export async function updateCompanyAsset(
  orgId: number,
  id: number,
  body: {
    assetType: string;
    referenceNumber: string;
    initialValue: number;
    annualDepreciationRate: number;
  },
) {
  const existing = await getCompanyAsset(orgId, id);
  if (!existing) return null;

  const [row] = await db
    .update(companyAssets)
    .set({
      assetType: body.assetType,
      referenceNumber: body.referenceNumber,
      initialValue: String(body.initialValue),
      annualDepreciationRate: String(body.annualDepreciationRate),
      updatedAt: new Date(),
    })
    .where(and(eq(companyAssets.orgId, orgId), eq(companyAssets.id, id)))
    .returning();

  return row ? mapAssetRow(row) : null;
}

export async function deleteCompanyAsset(orgId: number, id: number): Promise<boolean> {
  const existing = await getCompanyAsset(orgId, id);
  if (!existing) return false;

  await db
    .update(companyAssets)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(companyAssets.orgId, orgId), eq(companyAssets.id, id)));

  return true;
}
