import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import {
  computeAmountsFromTotalInclVat,
  formatBillingPeriod,
  billingPeriodToInvoiceDate,
} from "@workspace/finance-domain";
import type { BillingCycle, FinanceInvoiceStatus } from "@workspace/finance-domain";
import { ListSubscriptionInvoicesQueryParams } from "@workspace/api-zod";
import type { z } from "zod";
import { db } from "../../db/index.js";
import { fixedSubscriptions, subscriptionInvoices } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import { getOrgTaxContext } from "./domain/tax-context.js";

type ListParams = z.infer<typeof ListSubscriptionInvoicesQueryParams>;

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

function mapSubscriptionRow(row: typeof fixedSubscriptions.$inferSelect) {
  return {
    id: row.id,
    invoiceDate: row.invoiceDate,
    referenceNumber: row.referenceNumber,
    companyName: row.companyName,
    items: row.items,
    billingCycle: row.billingCycle as BillingCycle,
    amountExVat: toNumber(row.amountExVat),
    taxRate: toNumber(row.taxRate),
    taxAmount: toNumber(row.taxAmount),
    totalInclVat: toNumber(row.totalInclVat),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapSubscriptionInvoiceRow(row: typeof subscriptionInvoices.$inferSelect) {
  return {
    id: row.id,
    subscriptionId: row.subscriptionId,
    invoiceDate: row.invoiceDate,
    referenceNumber: row.referenceNumber,
    companyName: row.companyName,
    items: row.items,
    billingCycle: row.billingCycle as BillingCycle,
    billingPeriod: row.billingPeriod,
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

export async function listFixedSubscriptions(orgId: number) {
  const rows = await db
    .select()
    .from(fixedSubscriptions)
    .where(and(eq(fixedSubscriptions.orgId, orgId), isNull(fixedSubscriptions.deletedAt)))
    .orderBy(desc(fixedSubscriptions.createdAt));

  return { data: rows.map(mapSubscriptionRow) };
}

export async function getFixedSubscription(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(fixedSubscriptions)
    .where(
      and(
        eq(fixedSubscriptions.orgId, orgId),
        eq(fixedSubscriptions.id, id),
        isNull(fixedSubscriptions.deletedAt),
      ),
    )
    .limit(1);
  return row ? mapSubscriptionRow(row) : null;
}

export async function createSubscriptionInvoiceDraft(
  orgId: number,
  subscription: typeof fixedSubscriptions.$inferSelect,
  billingPeriod: string,
  invoiceDate?: string,
): Promise<void> {
  const cycle = subscription.billingCycle as BillingCycle;
  const resolvedInvoiceDate =
    invoiceDate ?? billingPeriodToInvoiceDate(billingPeriod, cycle);

  await db
    .insert(subscriptionInvoices)
    .values({
      orgId,
      subscriptionId: subscription.id,
      invoiceDate: resolvedInvoiceDate,
      referenceNumber: subscription.referenceNumber,
      companyName: subscription.companyName,
      items: subscription.items,
      billingCycle: subscription.billingCycle,
      billingPeriod,
      amountExVat: subscription.amountExVat,
      taxRate: subscription.taxRate,
      taxAmount: subscription.taxAmount,
      totalInclVat: subscription.totalInclVat,
      status: "draft",
    })
    .onConflictDoNothing();
}

export async function createFixedSubscription(
  orgId: number,
  body: {
    invoiceDate: string;
    referenceNumber: string;
    companyName: string;
    items: string;
    billingCycle: BillingCycle;
    totalInclVat: number;
  },
) {
  const amounts = await resolveAmounts(orgId, body.totalInclVat);
  const [row] = await db
    .insert(fixedSubscriptions)
    .values({
      orgId,
      invoiceDate: body.invoiceDate,
      referenceNumber: body.referenceNumber,
      companyName: body.companyName,
      items: body.items,
      billingCycle: body.billingCycle,
      amountExVat: String(amounts.amountExVat),
      taxRate: String(amounts.taxRate),
      taxAmount: String(amounts.taxAmount),
      totalInclVat: String(amounts.totalInclVat),
    })
    .returning();

  const billingPeriod = formatBillingPeriod(
    new Date(`${body.invoiceDate}T12:00:00`),
    body.billingCycle,
  );
  await createSubscriptionInvoiceDraft(orgId, row, billingPeriod, body.invoiceDate);

  await recordActivity(
    orgId,
    "finance",
    `إضافة اشتراك ثابت: ${body.referenceNumber} — ${body.companyName}`,
  );

  return mapSubscriptionRow(row);
}

export async function updateFixedSubscription(
  orgId: number,
  id: number,
  body: {
    invoiceDate: string;
    referenceNumber: string;
    companyName: string;
    items: string;
    billingCycle: BillingCycle;
    totalInclVat: number;
  },
) {
  const existing = await getFixedSubscription(orgId, id);
  if (!existing) return null;

  const amounts = await resolveAmounts(orgId, body.totalInclVat);
  const [row] = await db
    .update(fixedSubscriptions)
    .set({
      invoiceDate: body.invoiceDate,
      referenceNumber: body.referenceNumber,
      companyName: body.companyName,
      items: body.items,
      billingCycle: body.billingCycle,
      amountExVat: String(amounts.amountExVat),
      taxRate: String(amounts.taxRate),
      taxAmount: String(amounts.taxAmount),
      totalInclVat: String(amounts.totalInclVat),
      updatedAt: new Date(),
    })
    .where(and(eq(fixedSubscriptions.orgId, orgId), eq(fixedSubscriptions.id, id)))
    .returning();

  return row ? mapSubscriptionRow(row) : null;
}

export async function deleteFixedSubscription(orgId: number, id: number): Promise<boolean> {
  const existing = await getFixedSubscription(orgId, id);
  if (!existing) return false;

  await db
    .update(fixedSubscriptions)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(fixedSubscriptions.orgId, orgId), eq(fixedSubscriptions.id, id)));

  return true;
}

export async function listSubscriptionInvoices(orgId: number, params: Partial<ListParams>) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();
  const status = params.status;

  const filters = [eq(subscriptionInvoices.orgId, orgId)];
  if (status) {
    filters.push(eq(subscriptionInvoices.status, status));
  }
  if (search) {
    filters.push(
      or(
        ilike(subscriptionInvoices.referenceNumber, `%${search}%`),
        ilike(subscriptionInvoices.companyName, `%${search}%`),
        ilike(subscriptionInvoices.items, `%${search}%`),
        ilike(subscriptionInvoices.billingPeriod, `%${search}%`),
      )!,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(subscriptionInvoices)
    .where(where);

  const rows = await db
    .select()
    .from(subscriptionInvoices)
    .where(where)
    .orderBy(desc(subscriptionInvoices.invoiceDate), desc(subscriptionInvoices.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data: rows.map(mapSubscriptionInvoiceRow),
    total,
    page,
    pageSize,
  };
}

export async function getSubscriptionInvoice(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(subscriptionInvoices)
    .where(and(eq(subscriptionInvoices.orgId, orgId), eq(subscriptionInvoices.id, id)))
    .limit(1);
  return row ? mapSubscriptionInvoiceRow(row) : null;
}

export async function updateSubscriptionInvoice(
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
  const existing = await getSubscriptionInvoice(orgId, id);
  if (!existing) return null;

  const amounts = await resolveAmounts(orgId, body.totalInclVat);
  const [row] = await db
    .update(subscriptionInvoices)
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
    .where(and(eq(subscriptionInvoices.orgId, orgId), eq(subscriptionInvoices.id, id)))
    .returning();

  return row ? mapSubscriptionInvoiceRow(row) : null;
}

export async function deleteSubscriptionInvoice(orgId: number, id: number): Promise<boolean> {
  const existing = await getSubscriptionInvoice(orgId, id);
  if (!existing) return false;

  await db
    .delete(subscriptionInvoices)
    .where(and(eq(subscriptionInvoices.orgId, orgId), eq(subscriptionInvoices.id, id)));

  return true;
}

export async function updateSubscriptionInvoiceStatus(
  orgId: number,
  id: number,
  status: FinanceInvoiceStatus,
) {
  const [existing] = await db
    .select()
    .from(subscriptionInvoices)
    .where(and(eq(subscriptionInvoices.orgId, orgId), eq(subscriptionInvoices.id, id)))
    .limit(1);

  if (!existing) return null;

  const now = new Date();
  const [row] = await db
    .update(subscriptionInvoices)
    .set({
      status,
      paidAt: status === "paid" ? now : null,
      updatedAt: now,
    })
    .where(and(eq(subscriptionInvoices.orgId, orgId), eq(subscriptionInvoices.id, id)))
    .returning();

  if (row && status === "paid") {
    await recordActivity(
      orgId,
      "finance",
      `تسجيل فاتورة اشتراك مدفوعة: ${row.referenceNumber} — ${row.companyName} (${row.billingPeriod})`,
    );
  }

  return row ? mapSubscriptionInvoiceRow(row) : null;
}

export async function ensureSubscriptionInvoicesForOrg(orgId: number): Promise<void> {
  const rows = await db
    .select()
    .from(fixedSubscriptions)
    .where(and(eq(fixedSubscriptions.orgId, orgId), isNull(fixedSubscriptions.deletedAt)));

  const now = new Date();
  for (const subscription of rows) {
    const billingPeriod = formatBillingPeriod(now, subscription.billingCycle as BillingCycle);
    await createSubscriptionInvoiceDraft(orgId, subscription, billingPeriod);
  }
}

export async function ensureSubscriptionInvoicesForAllOrgs(): Promise<void> {
  const orgRows = await db
    .selectDistinct({ orgId: fixedSubscriptions.orgId })
    .from(fixedSubscriptions)
    .where(isNull(fixedSubscriptions.deletedAt));

  for (const { orgId } of orgRows) {
    await ensureSubscriptionInvoicesForOrg(orgId);
  }
}
