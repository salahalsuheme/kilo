import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { computeAmountsFromTotalInclVat } from "@workspace/finance-domain";
import type { FinanceInvoiceStatus } from "@workspace/finance-domain";
import { ListPurchasesQueryParams } from "@workspace/api-zod";
import type { z } from "zod";
import { db } from "../../db/index.js";
import { purchaseInvoices } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import { getOrgTaxContext } from "./domain/tax-context.js";

type ListParams = z.infer<typeof ListPurchasesQueryParams>;

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

function mapPurchaseRow(row: typeof purchaseInvoices.$inferSelect) {
  return {
    id: row.id,
    invoiceDate: row.invoiceDate,
    referenceNumber: row.referenceNumber,
    companyName: row.companyName,
    items: row.items,
    amountExVat: toNumber(row.amountExVat),
    taxRate: toNumber(row.taxRate),
    taxAmount: toNumber(row.taxAmount),
    totalInclVat: toNumber(row.totalInclVat),
    status: row.status as FinanceInvoiceStatus,
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function resolveAmounts(orgId: number, totalInclVat: number) {
  const tax = await getOrgTaxContext(orgId);
  return computeAmountsFromTotalInclVat(totalInclVat, tax.taxEnabled, tax.taxRate);
}

export async function listPurchases(orgId: number, params: Partial<ListParams>) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();
  const status = params.status;

  const filters = [eq(purchaseInvoices.orgId, orgId)];
  if (status) {
    filters.push(eq(purchaseInvoices.status, status));
  }
  if (search) {
    filters.push(
      or(
        ilike(purchaseInvoices.referenceNumber, `%${search}%`),
        ilike(purchaseInvoices.companyName, `%${search}%`),
        ilike(purchaseInvoices.items, `%${search}%`),
      )!,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(purchaseInvoices)
    .where(where);

  const rows = await db
    .select()
    .from(purchaseInvoices)
    .where(where)
    .orderBy(desc(purchaseInvoices.invoiceDate), desc(purchaseInvoices.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data: rows.map(mapPurchaseRow),
    total,
    page,
    pageSize,
  };
}

export async function getPurchase(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(purchaseInvoices)
    .where(and(eq(purchaseInvoices.orgId, orgId), eq(purchaseInvoices.id, id)))
    .limit(1);
  return row ? mapPurchaseRow(row) : null;
}

export async function createPurchase(
  orgId: number,
  body: {
    invoiceDate: string;
    referenceNumber: string;
    companyName: string;
    items: string;
    totalInclVat: number;
  },
) {
  const amounts = await resolveAmounts(orgId, body.totalInclVat);
  const [row] = await db
    .insert(purchaseInvoices)
    .values({
      orgId,
      invoiceDate: body.invoiceDate,
      referenceNumber: body.referenceNumber,
      companyName: body.companyName,
      items: body.items,
      amountExVat: String(amounts.amountExVat),
      taxRate: String(amounts.taxRate),
      taxAmount: String(amounts.taxAmount),
      totalInclVat: String(amounts.totalInclVat),
      status: "draft",
    })
    .returning();

  await recordActivity(
    orgId,
    "finance",
    `إضافة فاتورة مشتريات مسودة: ${body.referenceNumber} — ${body.companyName}`,
  );

  return mapPurchaseRow(row);
}

export async function updatePurchase(
  orgId: number,
  id: number,
  body: {
    invoiceDate: string;
    referenceNumber: string;
    companyName: string;
    items: string;
    totalInclVat: number;
  },
) {
  const existing = await getPurchase(orgId, id);
  if (!existing) return null;

  const amounts = await resolveAmounts(orgId, body.totalInclVat);
  const [row] = await db
    .update(purchaseInvoices)
    .set({
      invoiceDate: body.invoiceDate,
      referenceNumber: body.referenceNumber,
      companyName: body.companyName,
      items: body.items,
      amountExVat: String(amounts.amountExVat),
      taxRate: String(amounts.taxRate),
      taxAmount: String(amounts.taxAmount),
      totalInclVat: String(amounts.totalInclVat),
      updatedAt: new Date(),
    })
    .where(and(eq(purchaseInvoices.orgId, orgId), eq(purchaseInvoices.id, id)))
    .returning();

  return row ? mapPurchaseRow(row) : null;
}

export async function deletePurchase(orgId: number, id: number): Promise<boolean> {
  const existing = await getPurchase(orgId, id);
  if (!existing) return false;

  await db
    .delete(purchaseInvoices)
    .where(and(eq(purchaseInvoices.orgId, orgId), eq(purchaseInvoices.id, id)));

  return true;
}

export async function updatePurchaseStatus(
  orgId: number,
  id: number,
  status: FinanceInvoiceStatus,
) {
  const existing = await getPurchase(orgId, id);
  if (!existing) return null;

  const now = new Date();
  const [row] = await db
    .update(purchaseInvoices)
    .set({
      status,
      paidAt: status === "paid" ? now : null,
      updatedAt: now,
    })
    .where(and(eq(purchaseInvoices.orgId, orgId), eq(purchaseInvoices.id, id)))
    .returning();

  if (row && status === "paid") {
    await recordActivity(
      orgId,
      "finance",
      `تسجيل فاتورة مشتريات مدفوعة: ${row.referenceNumber} — ${row.companyName}`,
    );
  }

  return row ? mapPurchaseRow(row) : null;
}
