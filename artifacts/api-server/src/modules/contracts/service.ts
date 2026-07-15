import { and, count, desc, eq, gte, ilike, inArray, isNull, lt, max, or, sql } from "drizzle-orm";
import type { z } from "zod";
import { ListContractsQueryParams } from "@workspace/api-zod";
import {
  CONTRACT_STATUS_ERRORS,
  computePenaltyTotal,
  contractOverdueDays,
  formatContractNumberWithYear,
  getDraftActivationError,
  isValidContractStatusTransition,
  remainingRentalDays,
  rentalDurationDays,
  type ContractStatus,
  type CreateContractBodyInput,
  type UpdateContractBodyInput,
  type UpdateContractStatusBodyInput,
} from "@workspace/contracts-domain";
import type { InvoiceType } from "@workspace/customers-domain";
import { formatCustomerDisplayName } from "@workspace/customers-domain";
import { isVehicleRentable } from "@workspace/vehicles-domain";
import { db } from "../../db/index.js";
import { cars, contracts, customers } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import {
  createDraftInvoiceForContract,
  deleteDraftInvoiceForContract,
  markInvoicePaidForContract,
  syncDraftInvoiceForContract,
} from "../invoices/service.js";
import {
  buildRenderedContractContent,
  getContractCar,
  getContractCustomer,
  getContractTemplate,
  getOrgTaxSettings,
  resolveContractAmounts,
} from "./domain/contract-context.js";

type ListParams = z.infer<typeof ListContractsQueryParams>;
type CreateBody = CreateContractBodyInput;
type UpdateBody = UpdateContractBodyInput;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

function mapContractRow(
  row: typeof contracts.$inferSelect,
  customerName: string,
  vehicleBrand: string,
  vehiclePlateNumber: string,
  vehicleCoolingType: string,
) {
  const startAt = row.startAt;
  const endAt = row.endAt;
  const status = row.status as ContractStatus;
  const overdueDays = contractOverdueDays(endAt, status);
  const penaltyTotal = computePenaltyTotal(overdueDays);
  return {
    id: row.id,
    contractNumber: row.contractNumber,
    customerId: row.customerId,
    customerName,
    carId: row.carId,
    vehicleBrand,
    vehiclePlateNumber,
    vehicleCoolingType,
    templateId: row.templateId,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    status,
    amountExVat: toNumber(row.amountExVat),
    taxRate: toNumber(row.taxRate),
    taxAmount: toNumber(row.taxAmount),
    totalInclVat: toNumber(row.totalInclVat),
    rentalDurationDays: rentalDurationDays(startAt, endAt),
    remainingDays: remainingRentalDays(endAt, status),
    overdueDays,
    penaltyTotal,
    renderedContent: row.renderedContent,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function syncContractExpirations(orgId: number): Promise<void> {
  await syncContractStatuses(orgId);
}

async function syncContractStatuses(orgId: number): Promise<void> {
  const now = new Date();

  await db
    .update(contracts)
    .set({ status: "overdue", updatedAt: now })
    .where(
      and(
        eq(contracts.orgId, orgId),
        eq(contracts.status, "active"),
        lt(contracts.endAt, now),
        isNull(contracts.deletedAt),
      ),
    );

  const reverted = await db
    .update(contracts)
    .set({ status: "active", updatedAt: now })
    .where(
      and(
        eq(contracts.orgId, orgId),
        eq(contracts.status, "overdue"),
        gte(contracts.endAt, now),
        isNull(contracts.deletedAt),
      ),
    )
    .returning({ carId: contracts.carId });

  for (const row of reverted) {
    await db
      .update(cars)
      .set({ status: "rented", updatedAt: now })
      .where(and(eq(cars.orgId, orgId), eq(cars.id, row.carId), isNull(cars.deletedAt)));
  }
}

const RENTED_CONTRACT_STATUSES: ContractStatus[] = ["active", "overdue"];

async function releaseCarIfIdle(orgId: number, carId: number): Promise<void> {
  const [rentedContract] = await db
    .select({ id: contracts.id })
    .from(contracts)
    .where(
      and(
        eq(contracts.orgId, orgId),
        eq(contracts.carId, carId),
        inArray(contracts.status, RENTED_CONTRACT_STATUSES),
        isNull(contracts.deletedAt),
      ),
    )
    .limit(1);

  if (!rentedContract) {
    await db
      .update(cars)
      .set({ status: "available", updatedAt: new Date() })
      .where(and(eq(cars.orgId, orgId), eq(cars.id, carId), isNull(cars.deletedAt)));
  }
}

async function assertReferences(orgId: number, body: CreateBody): Promise<string | null> {
  const [customer, car, template] = await Promise.all([
    getContractCustomer(orgId, body.customerId),
    getContractCar(orgId, body.carId),
    getContractTemplate(orgId, body.templateId),
  ]);
  if (!customer) return CONTRACT_STATUS_ERRORS.customerNotFound;
  if (!car) return CONTRACT_STATUS_ERRORS.carNotFound;
  if (!template) return CONTRACT_STATUS_ERRORS.templateNotFound;
  return null;
}

async function assertCarAvailableForActivation(
  orgId: number,
  carId: number,
  contractId: number,
): Promise<string | null> {
  const car = await getContractCar(orgId, carId);
  if (!car) return CONTRACT_STATUS_ERRORS.carNotFound;
  if (!isVehicleRentable(car.status)) {
    if (car.status === "stopped") return CONTRACT_STATUS_ERRORS.carInMaintenance;
    if (car.status === "suspended") return CONTRACT_STATUS_ERRORS.carTemporarilySuspended;
    return CONTRACT_STATUS_ERRORS.carNotAvailable;
  }

  const [blocking] = await db
    .select({ id: contracts.id })
    .from(contracts)
    .where(
      and(
        eq(contracts.orgId, orgId),
        eq(contracts.carId, carId),
        inArray(contracts.status, RENTED_CONTRACT_STATUSES),
        isNull(contracts.deletedAt),
        sql`${contracts.id} <> ${contractId}`,
      ),
    )
    .limit(1);

  if (blocking) return CONTRACT_STATUS_ERRORS.carNotAvailable;
  return null;
}

export async function listContracts(orgId: number, params: Partial<ListParams>) {
  await syncContractStatuses(orgId);

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();
  const status = params.status;

  const filters = [eq(contracts.orgId, orgId), isNull(contracts.deletedAt)];
  if (status) {
    filters.push(eq(contracts.status, status));
  }
  if (search) {
    filters.push(
      or(
        ilike(contracts.contractNumber, `%${search}%`),
        ilike(customers.name, `%${search}%`),
        ilike(cars.plateNumber, `%${search}%`),
        ilike(cars.brand, `%${search}%`),
      )!,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(contracts)
    .innerJoin(customers, eq(contracts.customerId, customers.id))
    .innerJoin(cars, eq(contracts.carId, cars.id))
    .where(where);

  const rows = await db
    .select({
      contract: contracts,
      customerName: customers.name,
      customerEstablishmentName: customers.establishmentName,
      vehicleBrand: cars.brand,
      vehiclePlateNumber: cars.plateNumber,
      vehicleCoolingType: cars.coolingType,
    })
    .from(contracts)
    .innerJoin(customers, eq(contracts.customerId, customers.id))
    .innerJoin(cars, eq(contracts.carId, cars.id))
    .where(where)
    .orderBy(desc(contracts.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data: rows.map((row) =>
      mapContractRow(
        row.contract,
        formatCustomerDisplayName(row.customerName, row.customerEstablishmentName),
        row.vehicleBrand,
        row.vehiclePlateNumber,
        row.vehicleCoolingType,
      ),
    ),
    total,
    page,
    pageSize,
  };
}

export async function getContract(orgId: number, id: number) {
  await syncContractStatuses(orgId);

  const [row] = await db
    .select({
      contract: contracts,
      customerName: customers.name,
      customerEstablishmentName: customers.establishmentName,
      vehicleBrand: cars.brand,
      vehiclePlateNumber: cars.plateNumber,
      vehicleCoolingType: cars.coolingType,
    })
    .from(contracts)
    .innerJoin(customers, eq(contracts.customerId, customers.id))
    .innerJoin(cars, eq(contracts.carId, cars.id))
    .where(
      and(eq(contracts.orgId, orgId), eq(contracts.id, id), isNull(contracts.deletedAt)),
    )
    .limit(1);

  return row
    ? mapContractRow(
        row.contract,
        formatCustomerDisplayName(row.customerName, row.customerEstablishmentName),
        row.vehicleBrand,
        row.vehiclePlateNumber,
        row.vehicleCoolingType,
      )
    : null;
}

async function nextContractSeq(tx: DbTransaction, orgId: number): Promise<number> {
  const [row] = await tx
    .select({ value: max(contracts.contractSeq) })
    .from(contracts)
    .where(eq(contracts.orgId, orgId));
  return (row?.value ?? 0) + 1;
}

async function insertContract(orgId: number, body: CreateBody, status: ContractStatus = "draft") {
  const refError = await assertReferences(orgId, body);
  if (refError) return { error: refError as string };

  const customer = await getContractCustomer(orgId, body.customerId);
  if (!customer) return { error: CONTRACT_STATUS_ERRORS.customerNotFound };

  const taxSettings = await getOrgTaxSettings(orgId);
  const amounts = resolveContractAmounts(body, taxSettings.taxEnabled, taxSettings.taxRate);

  const invoiceType = customer.invoiceType as InvoiceType;
  const createdAt = new Date();

  const row = await db.transaction(async (tx) => {
    const contractSeq = await nextContractSeq(tx, orgId);
    const contractNumber = formatContractNumberWithYear(contractSeq, createdAt.getFullYear());
    const renderedContent = await buildRenderedContractContent(
      orgId,
      body,
      amounts,
      contractNumber,
    );
    if (!renderedContent) {
      throw new Error(CONTRACT_STATUS_ERRORS.templateNotFound);
    }

    const [inserted] = await tx
      .insert(contracts)
      .values({
        orgId,
        contractSeq,
        contractNumber,
        customerId: body.customerId,
        carId: body.carId,
        templateId: body.templateId,
        startAt: body.startAt,
        endAt: body.endAt,
        status,
        amountExVat: String(amounts.amountExVat),
        taxRate: String(amounts.taxRate),
        taxAmount: String(amounts.taxAmount),
        totalInclVat: String(amounts.totalInclVat),
        renderedContent,
        createdAt,
      })
      .returning();

    await createDraftInvoiceForContract(
      tx,
      orgId,
      {
        id: inserted.id,
        contractSeq,
        customerId: body.customerId,
        carId: body.carId,
        createdAt,
      },
      invoiceType,
      amounts,
    );

    return inserted;
  });

  await recordActivity(orgId, "contract", `إضافة عقد مسودة: ${customer.name}`);
  return { data: await getContract(orgId, row.id) };
}

export async function createContract(orgId: number, body: CreateBody) {
  return insertContract(orgId, body, "draft");
}

export async function updateContract(orgId: number, id: number, body: UpdateBody) {
  const existing = await getContract(orgId, id);
  if (!existing) return null;
  if (existing.status !== "draft") {
    return { error: CONTRACT_STATUS_ERRORS.editOnlyDraft };
  }

  const refError = await assertReferences(orgId, body);
  if (refError) return { error: refError };

  const taxSettings = await getOrgTaxSettings(orgId);
  const amounts = resolveContractAmounts(body, taxSettings.taxEnabled, taxSettings.taxRate);
  const renderedContent = await buildRenderedContractContent(
    orgId,
    body,
    amounts,
    existing.contractNumber,
  );
  if (!renderedContent) {
    return { error: CONTRACT_STATUS_ERRORS.templateNotFound };
  }

  const [row] = await db
    .update(contracts)
    .set({
      customerId: body.customerId,
      carId: body.carId,
      templateId: body.templateId,
      startAt: body.startAt,
      endAt: body.endAt,
      amountExVat: String(amounts.amountExVat),
      taxRate: String(amounts.taxRate),
      taxAmount: String(amounts.taxAmount),
      totalInclVat: String(amounts.totalInclVat),
      renderedContent,
      updatedAt: new Date(),
    })
    .where(and(eq(contracts.orgId, orgId), eq(contracts.id, id), isNull(contracts.deletedAt)))
    .returning();

  if (!row) return null;

  const customer = await getContractCustomer(orgId, body.customerId);
  if (customer) {
    await syncDraftInvoiceForContract(
      orgId,
      id,
      body.customerId,
      body.carId,
      customer.invoiceType as InvoiceType,
      amounts,
    );
  }

  await recordActivity(orgId, "contract", `تعديل عقد مسودة: ${existing.customerName}`);
  return { data: await getContract(orgId, id) };
}

export async function deleteContract(orgId: number, id: number): Promise<boolean | { error: string }> {
  const existing = await getContract(orgId, id);
  if (!existing) return false;
  if (existing.status !== "draft") {
    return { error: CONTRACT_STATUS_ERRORS.deleteOnlyDraft };
  }

  const [row] = await db
    .update(contracts)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(contracts.orgId, orgId), eq(contracts.id, id), isNull(contracts.deletedAt)))
    .returning();

  if (row) {
    await deleteDraftInvoiceForContract(orgId, id);
    await recordActivity(orgId, "contract", `حذف عقد مسودة: ${existing.customerName}`);
    return true;
  }
  return false;
}

function isValidStatusTransition(
  current: ContractStatus,
  next: ContractStatus,
): boolean {
  return isValidContractStatusTransition(current, next);
}

export async function updateContractStatus(
  orgId: number,
  id: number,
  body: UpdateContractStatusBodyInput,
) {
  const existing = await getContract(orgId, id);
  if (!existing) return null;

  const nextStatus = body.status;
  if (!isValidStatusTransition(existing.status, nextStatus)) {
    return { error: CONTRACT_STATUS_ERRORS.invalidTransition };
  }

  if (nextStatus === "active") {
    if (existing.status === "draft") {
      const activationError = getDraftActivationError(new Date(existing.endAt));
      if (activationError) return { error: activationError };
    }
    const carError = await assertCarAvailableForActivation(orgId, existing.carId, id);
    if (carError) return { error: carError };
  }

  const [row] = await db
    .update(contracts)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(and(eq(contracts.orgId, orgId), eq(contracts.id, id), isNull(contracts.deletedAt)))
    .returning();

  if (!row) return null;

  if (nextStatus === "active") {
    await db
      .update(cars)
      .set({ status: "rented", updatedAt: new Date() })
      .where(and(eq(cars.orgId, orgId), eq(cars.id, existing.carId), isNull(cars.deletedAt)));
    await markInvoicePaidForContract(orgId, id, existing.customerName);
  }

  if (nextStatus === "cancelled" || nextStatus === "closed") {
    await releaseCarIfIdle(orgId, existing.carId);
  }

  await recordActivity(
    orgId,
    "contract",
    `تغيير حالة العقد (${existing.customerName}) إلى ${nextStatus}`,
  );

  return { data: await getContract(orgId, id) };
}
