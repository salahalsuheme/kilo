import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import type { z } from "zod";
import { ListInvoicesQueryParams } from "@workspace/api-zod";
import { formatInvoiceNumber } from "@workspace/invoices-domain";
import type { InvoiceStatus } from "@workspace/invoices-domain";
import type { InvoiceType } from "@workspace/customers-domain";
import { formatCustomerDisplayName } from "@workspace/customers-domain";
import { db } from "../../db/index.js";
import { cars, contracts, customers, invoices } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import { getOrCreateSettings } from "../settings/service.js";

type ListParams = z.infer<typeof ListInvoicesQueryParams>;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface ContractInvoiceAmounts {
  amountExVat: number;
  taxRate: number;
  taxAmount: number;
  totalInclVat: number;
}

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

function mapInvoiceRow(
  row: typeof invoices.$inferSelect,
  customerName: string,
  vehicleBrand: string,
  vehiclePlateNumber: string,
) {
  return {
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    contractId: row.contractId,
    customerName,
    vehicleBrand,
    vehiclePlateNumber,
    invoiceType: row.invoiceType as InvoiceType,
    status: row.status as InvoiceStatus,
    totalInclVat: toNumber(row.totalInclVat),
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createDraftInvoiceForContract(
  tx: DbTransaction,
  orgId: number,
  contract: {
    id: number;
    contractSeq: number;
    customerId: number;
    carId: number;
    createdAt: Date;
  },
  invoiceType: InvoiceType,
  amounts: ContractInvoiceAmounts,
): Promise<void> {
  const year = contract.createdAt.getFullYear();
  const invoiceNumber = formatInvoiceNumber(contract.contractSeq, 1, year);

  await tx.insert(invoices).values({
    orgId,
    contractId: contract.id,
    customerId: contract.customerId,
    carId: contract.carId,
    invoiceSeq: 1,
    invoiceNumber,
    invoiceType,
    status: "draft",
    amountExVat: String(amounts.amountExVat),
    taxRate: String(amounts.taxRate),
    taxAmount: String(amounts.taxAmount),
    totalInclVat: String(amounts.totalInclVat),
  });
}

export async function deleteDraftInvoiceForContract(
  orgId: number,
  contractId: number,
): Promise<void> {
  await db
    .delete(invoices)
    .where(
      and(
        eq(invoices.orgId, orgId),
        eq(invoices.contractId, contractId),
        eq(invoices.status, "draft"),
      ),
    );
}

export async function syncDraftInvoiceForContract(
  orgId: number,
  contractId: number,
  customerId: number,
  carId: number,
  invoiceType: InvoiceType,
  amounts: ContractInvoiceAmounts,
): Promise<void> {
  await db
    .update(invoices)
    .set({
      customerId,
      carId,
      invoiceType,
      amountExVat: String(amounts.amountExVat),
      taxRate: String(amounts.taxRate),
      taxAmount: String(amounts.taxAmount),
      totalInclVat: String(amounts.totalInclVat),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(invoices.orgId, orgId),
        eq(invoices.contractId, contractId),
        eq(invoices.status, "draft"),
      ),
    );
}

export async function markInvoicePaidForContract(
  orgId: number,
  contractId: number,
  customerName: string,
): Promise<void> {
  const now = new Date();
  const [row] = await db
    .update(invoices)
    .set({ status: "paid", paidAt: now, updatedAt: now })
    .where(
      and(
        eq(invoices.orgId, orgId),
        eq(invoices.contractId, contractId),
        eq(invoices.status, "draft"),
      ),
    )
    .returning({ invoiceNumber: invoices.invoiceNumber });

  if (row) {
    await recordActivity(
      orgId,
      "invoice",
      `تسجيل فاتورة مدفوعة: ${row.invoiceNumber} — ${customerName}`,
    );
  }
}

export async function listInvoices(orgId: number, params: Partial<ListParams>) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();
  const status = params.status;

  const filters = [eq(invoices.orgId, orgId)];
  if (status) {
    filters.push(eq(invoices.status, status));
  }
  if (search) {
    filters.push(
      or(
        ilike(invoices.invoiceNumber, `%${search}%`),
        ilike(customers.name, `%${search}%`),
        ilike(cars.plateNumber, `%${search}%`),
        ilike(cars.brand, `%${search}%`),
      )!,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .innerJoin(cars, eq(invoices.carId, cars.id))
    .where(where);

  const rows = await db
    .select({
      invoice: invoices,
      customerName: customers.name,
      customerEstablishmentName: customers.establishmentName,
      vehicleBrand: cars.brand,
      vehiclePlateNumber: cars.plateNumber,
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .innerJoin(cars, eq(invoices.carId, cars.id))
    .where(where)
    .orderBy(desc(invoices.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data: rows.map((row) =>
      mapInvoiceRow(
        row.invoice,
        formatCustomerDisplayName(row.customerName, row.customerEstablishmentName),
        row.vehicleBrand,
        row.vehiclePlateNumber,
      ),
    ),
    total,
    page,
    pageSize,
  };
}

export async function getInvoice(orgId: number, id: number) {
  const [row] = await db
    .select({
      invoice: invoices,
      customerName: customers.name,
      customerEstablishmentName: customers.establishmentName,
      customerIdNumber: customers.idNumber,
      customerMobile: customers.mobile,
      customerTaxNumber: customers.taxNumber,
      vehicleBrand: cars.brand,
      vehiclePlateNumber: cars.plateNumber,
      vehicleModelYear: cars.modelYear,
      contractNumber: contracts.contractNumber,
      contractStartAt: contracts.startAt,
      contractEndAt: contracts.endAt,
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .innerJoin(cars, eq(invoices.carId, cars.id))
    .innerJoin(contracts, eq(invoices.contractId, contracts.id))
    .where(and(eq(invoices.orgId, orgId), eq(invoices.id, id)))
    .limit(1);

  if (!row) return null;

  const settings = await getOrCreateSettings(orgId);
  const inv = row.invoice;

  return {
    ...mapInvoiceRow(
      inv,
      formatCustomerDisplayName(row.customerName, row.customerEstablishmentName),
      row.vehicleBrand,
      row.vehiclePlateNumber,
    ),
    amountExVat: toNumber(inv.amountExVat),
    taxRate: toNumber(inv.taxRate),
    taxAmount: toNumber(inv.taxAmount),
    customerIdNumber: row.customerIdNumber,
    customerMobile: row.customerMobile,
    customerTaxNumber: row.customerTaxNumber,
    customerEstablishmentName: row.customerEstablishmentName,
    vehicleModelYear: row.vehicleModelYear,
    contractNumber: row.contractNumber,
    contractStartAt: row.contractStartAt.toISOString(),
    contractEndAt: row.contractEndAt.toISOString(),
    sellerBusinessName: settings.businessName,
    sellerLogoUrl: settings.logoUrl,
    sellerTaxNumber: settings.taxNumber,
  };
}
