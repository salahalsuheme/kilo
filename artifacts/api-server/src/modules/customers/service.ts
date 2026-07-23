import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import type { z } from "zod";
import { ListCustomersQueryParams } from "@workspace/api-zod";
import type { CreateCustomerBodyInput, UpdateCustomerBodyInput } from "@workspace/customers-domain";
import {
  formatCustomerDisplayName,
  isNonIndividualClientType,
} from "@workspace/customers-domain";
import { db } from "../../db/index.js";
import { customers, establishments } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import { getEstablishment } from "../establishments/service.js";
import { resolveCustomerTaxFields } from "./domain/customer-tax.js";

type CustomerRow = typeof customers.$inferSelect;
type EstablishmentRow = typeof establishments.$inferSelect;

function mapCustomer(row: CustomerRow, establishment: EstablishmentRow | null) {
  return {
    id: row.id,
    name: row.name,
    clientType: row.clientType,
    establishmentId: row.establishmentId,
    establishmentName: establishment?.name ?? null,
    establishmentNumber: establishment?.establishmentNumber ?? null,
    establishmentClientType: establishment?.clientType ?? null,
    idNumber: row.idNumber,
    birthDate: row.birthDate,
    mobile: row.mobile,
    licenseNumber: row.licenseNumber,
    nationality: row.nationality,
    hasTaxNumber: row.hasTaxNumber,
    taxNumber: row.taxNumber,
    invoiceType: row.invoiceType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function loadEstablishmentForCustomer(
  orgId: number,
  establishmentId: number | null,
): Promise<EstablishmentRow | null> {
  if (!establishmentId) return null;
  const establishment = await getEstablishment(orgId, establishmentId);
  return establishment
    ? {
        id: establishment.id,
        orgId,
        name: establishment.name,
        clientType: establishment.clientType,
        establishmentNumber: establishment.establishmentNumber,
        hasTaxNumber: establishment.hasTaxNumber,
        taxNumber: establishment.taxNumber,
        invoiceType: establishment.invoiceType,
        deletedAt: null,
        createdAt: establishment.createdAt,
        updatedAt: establishment.updatedAt,
      }
    : null;
}

type ListParams = z.infer<typeof ListCustomersQueryParams>;
type CreateBody = CreateCustomerBodyInput;
type UpdateBody = UpdateCustomerBodyInput;

export async function listCustomers(
  orgId: number,
  params: Partial<ListParams>,
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();
  const clientType = params.clientType;
  const establishmentId = params.establishmentId;

  const filters = [eq(customers.orgId, orgId), isNull(customers.deletedAt)];
  if (clientType) {
    filters.push(eq(customers.clientType, clientType));
  }
  if (establishmentId) {
    filters.push(eq(customers.establishmentId, establishmentId));
  }
  if (search) {
    filters.push(
      or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.mobile, `%${search}%`),
        ilike(customers.idNumber, `%${search}%`),
        ilike(establishments.name, `%${search}%`),
        ilike(establishments.establishmentNumber, `%${search}%`),
      )!,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(customers)
    .leftJoin(establishments, eq(customers.establishmentId, establishments.id))
    .where(where);

  const rows = await db
    .select({
      customer: customers,
      establishment: establishments,
    })
    .from(customers)
    .leftJoin(establishments, eq(customers.establishmentId, establishments.id))
    .where(where)
    .orderBy(desc(customers.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data: rows.map((row) =>
      mapCustomer(
        row.customer,
        row.establishment && !row.establishment.deletedAt ? row.establishment : null,
      ),
    ),
    total,
    page,
    pageSize,
  };
}

export async function getCustomer(orgId: number, id: number) {
  const [row] = await db
    .select({
      customer: customers,
      establishment: establishments,
    })
    .from(customers)
    .leftJoin(establishments, eq(customers.establishmentId, establishments.id))
    .where(and(eq(customers.orgId, orgId), eq(customers.id, id), isNull(customers.deletedAt)))
    .limit(1);

  if (!row) return null;
  return mapCustomer(
    row.customer,
    row.establishment && !row.establishment.deletedAt ? row.establishment : null,
  );
}

async function resolveCustomerPersistFields(orgId: number, body: CreateBody | UpdateBody) {
  if (!isNonIndividualClientType(body.clientType)) {
    const tax = resolveCustomerTaxFields(body);
    return {
      establishmentId: null,
      clientType: body.clientType,
      hasTaxNumber: tax.hasTaxNumber,
      taxNumber: tax.taxNumber,
      invoiceType: tax.invoiceType,
    };
  }

  const establishment = await getEstablishment(orgId, body.establishmentId!);
  if (!establishment) {
    return { error: "المنشأة غير موجودة" as const };
  }
  if (establishment.clientType !== body.clientType) {
    return { error: "نوع العميل لا يطابق نوع المنشأة" as const };
  }

  return {
    establishmentId: establishment.id,
    clientType: establishment.clientType,
    hasTaxNumber: establishment.hasTaxNumber,
    taxNumber: establishment.taxNumber,
    invoiceType: establishment.invoiceType,
  };
}

export async function createCustomer(
  orgId: number,
  body: CreateBody,
) {
  const resolved = await resolveCustomerPersistFields(orgId, body);
  if ("error" in resolved) {
    throw Object.assign(new Error(resolved.error), { statusCode: 400 });
  }

  const [row] = await db
    .insert(customers)
    .values({
      orgId,
      name: body.name,
      clientType: resolved.clientType,
      establishmentId: resolved.establishmentId,
      idNumber: body.idNumber,
      birthDate: body.birthDate,
      mobile: body.mobile,
      licenseNumber: body.licenseNumber,
      nationality: body.nationality,
      hasTaxNumber: resolved.hasTaxNumber,
      taxNumber: resolved.taxNumber,
      invoiceType: resolved.invoiceType,
    })
    .returning();

  const establishment = await loadEstablishmentForCustomer(orgId, row.establishmentId);
  await recordActivity(
    orgId,
    "customer",
    `إضافة سائق: ${formatCustomerDisplayName(row.name, establishment?.name)}`,
  );
  return mapCustomer(row, establishment);
}

export async function updateCustomer(
  orgId: number,
  id: number,
  body: UpdateBody,
) {
  const resolved = await resolveCustomerPersistFields(orgId, body);
  if ("error" in resolved) {
    throw Object.assign(new Error(resolved.error), { statusCode: 400 });
  }

  const [row] = await db
    .update(customers)
    .set({
      name: body.name,
      clientType: resolved.clientType,
      establishmentId: resolved.establishmentId,
      idNumber: body.idNumber,
      birthDate: body.birthDate,
      mobile: body.mobile,
      licenseNumber: body.licenseNumber,
      nationality: body.nationality,
      hasTaxNumber: resolved.hasTaxNumber,
      taxNumber: resolved.taxNumber,
      invoiceType: resolved.invoiceType,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.orgId, orgId), eq(customers.id, id), isNull(customers.deletedAt)))
    .returning();

  if (row) {
    const establishment = await loadEstablishmentForCustomer(orgId, row.establishmentId);
    await recordActivity(
      orgId,
      "customer",
      `تعديل سائق: ${formatCustomerDisplayName(row.name, establishment?.name)}`,
    );
    return mapCustomer(row, establishment);
  }
  return null;
}

export async function deleteCustomer(orgId: number, id: number) {
  const [row] = await db
    .update(customers)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(customers.orgId, orgId), eq(customers.id, id), isNull(customers.deletedAt)))
    .returning();

  if (row) {
    await recordActivity(orgId, "customer", `حذف سائق: ${row.name}`);
    return true;
  }
  return false;
}

export async function countCustomers(orgId: number) {
  const [{ value }] = await db
    .select({ value: count() })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), isNull(customers.deletedAt)));
  return value;
}
