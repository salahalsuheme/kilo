import { and, count, eq, gte, isNotNull, lt, sql } from "drizzle-orm";
import { roundMoney } from "@workspace/contracts-domain";
import { GetFinanceReportQueryParams } from "@workspace/api-zod";
import type { z } from "zod";
import { db } from "../../db/index.js";
import {
  invoices,
  purchaseInvoices,
  subscriptionInvoices,
} from "../../db/schema.js";

type ReportParams = z.infer<typeof GetFinanceReportQueryParams>;

/** Saudi Arabia (AST) is UTC+3 year-round — no DST. */
const RIYADH_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

function emptySalesSummary() {
  return { count: 0, amountExVat: 0, outputVat: 0, totalInclVat: 0 };
}

function emptyExpenseSummary() {
  return {
    purchasesExVat: 0,
    purchasesInputVat: 0,
    subscriptionsExVat: 0,
    subscriptionsInputVat: 0,
    totalExpensesExVat: 0,
    totalExpensesInclVat: 0,
    purchasesInclVat: 0,
    subscriptionsInclVat: 0,
    totalInputVat: 0,
  };
}

function emptyPeriodReport() {
  return {
    sales: emptySalesSummary(),
    expenses: emptyExpenseSummary(),
    outputVat: 0,
    inputVat: 0,
    vatPayable: 0,
    netProfit: 0,
  };
}

/** Midnight on day 1 of the given month in Asia/Riyadh, as a UTC instant. */
function riyadhMonthStart(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1) - RIYADH_UTC_OFFSET_MS);
}

function yearBounds(year: number) {
  return {
    start: riyadhMonthStart(year, 1),
    end: riyadhMonthStart(year + 1, 1),
  };
}

function monthBounds(year: number, month: number) {
  const start = riyadhMonthStart(year, month);
  const end = month === 12 ? riyadhMonthStart(year + 1, 1) : riyadhMonthStart(year, month + 1);
  return { start, end };
}

async function sumPaidSales(orgId: number, start: Date, end: Date) {
  const [row] = await db
    .select({
      count: count(),
      amountExVat: sql<string>`COALESCE(SUM(${invoices.amountExVat}), 0)`,
      outputVat: sql<string>`COALESCE(SUM(${invoices.taxAmount}), 0)`,
      totalInclVat: sql<string>`COALESCE(SUM(${invoices.totalInclVat}), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.orgId, orgId),
        eq(invoices.status, "paid"),
        isNotNull(invoices.paidAt),
        gte(invoices.paidAt, start),
        lt(invoices.paidAt, end),
      ),
    );

  return {
    count: row?.count ?? 0,
    amountExVat: roundMoney(toNumber(row?.amountExVat ?? 0)),
    outputVat: roundMoney(toNumber(row?.outputVat ?? 0)),
    totalInclVat: roundMoney(toNumber(row?.totalInclVat ?? 0)),
  };
}

async function sumPaidPurchases(orgId: number, start: Date, end: Date) {
  const [row] = await db
    .select({
      amountExVat: sql<string>`COALESCE(SUM(${purchaseInvoices.amountExVat}), 0)`,
      inputVat: sql<string>`COALESCE(SUM(${purchaseInvoices.taxAmount}), 0)`,
      totalInclVat: sql<string>`COALESCE(SUM(${purchaseInvoices.totalInclVat}), 0)`,
    })
    .from(purchaseInvoices)
    .where(
      and(
        eq(purchaseInvoices.orgId, orgId),
        eq(purchaseInvoices.status, "paid"),
        isNotNull(purchaseInvoices.paidAt),
        gte(purchaseInvoices.paidAt, start),
        lt(purchaseInvoices.paidAt, end),
      ),
    );

  return {
    amountExVat: roundMoney(toNumber(row?.amountExVat ?? 0)),
    inputVat: roundMoney(toNumber(row?.inputVat ?? 0)),
    totalInclVat: roundMoney(toNumber(row?.totalInclVat ?? 0)),
  };
}

async function sumPaidSubscriptionInvoices(orgId: number, start: Date, end: Date) {
  const [row] = await db
    .select({
      amountExVat: sql<string>`COALESCE(SUM(${subscriptionInvoices.amountExVat}), 0)`,
      inputVat: sql<string>`COALESCE(SUM(${subscriptionInvoices.taxAmount}), 0)`,
      totalInclVat: sql<string>`COALESCE(SUM(${subscriptionInvoices.totalInclVat}), 0)`,
    })
    .from(subscriptionInvoices)
    .where(
      and(
        eq(subscriptionInvoices.orgId, orgId),
        eq(subscriptionInvoices.status, "paid"),
        isNotNull(subscriptionInvoices.paidAt),
        gte(subscriptionInvoices.paidAt, start),
        lt(subscriptionInvoices.paidAt, end),
      ),
    );

  return {
    amountExVat: roundMoney(toNumber(row?.amountExVat ?? 0)),
    inputVat: roundMoney(toNumber(row?.inputVat ?? 0)),
    totalInclVat: roundMoney(toNumber(row?.totalInclVat ?? 0)),
  };
}

async function buildPeriodReport(orgId: number, start: Date, end: Date) {
  const sales = await sumPaidSales(orgId, start, end);
  const paidPurchases = await sumPaidPurchases(orgId, start, end);
  const paidSubscriptions = await sumPaidSubscriptionInvoices(orgId, start, end);

  const outputVat = sales.outputVat;
  const inputVat = roundMoney(paidPurchases.inputVat + paidSubscriptions.inputVat);
  const vatPayable = roundMoney(outputVat - inputVat);
  const totalExpensesExVat = roundMoney(
    paidPurchases.amountExVat + paidSubscriptions.amountExVat,
  );
  const totalExpensesInclVat = roundMoney(
    paidPurchases.totalInclVat + paidSubscriptions.totalInclVat,
  );
  const netProfit = roundMoney(
    sales.totalInclVat - totalExpensesInclVat - vatPayable,
  );

  return {
    sales,
    expenses: {
      purchasesExVat: paidPurchases.amountExVat,
      purchasesInputVat: paidPurchases.inputVat,
      subscriptionsExVat: paidSubscriptions.amountExVat,
      subscriptionsInputVat: paidSubscriptions.inputVat,
      totalExpensesExVat,
      totalExpensesInclVat,
      purchasesInclVat: paidPurchases.totalInclVat,
      subscriptionsInclVat: paidSubscriptions.totalInclVat,
      totalInputVat: inputVat,
    },
    outputVat,
    inputVat,
    vatPayable,
    netProfit,
  };
}

export async function getFinanceReport(orgId: number, params: ReportParams) {
  const year = params.year;
  const month = params.month ?? null;

  const annualBounds = yearBounds(year);
  const annual = await buildPeriodReport(orgId, annualBounds.start, annualBounds.end);

  const monthly =
    month != null
      ? await buildPeriodReport(
          orgId,
          monthBounds(year, month).start,
          monthBounds(year, month).end,
        )
      : emptyPeriodReport();

  return {
    year,
    month,
    monthly,
    annual,
    currency: "SAR",
  };
}
