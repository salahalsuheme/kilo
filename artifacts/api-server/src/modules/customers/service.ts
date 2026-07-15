import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import type { z } from "zod";
import { ListCustomersQueryParams } from "@workspace/api-zod";
import type { CreateCustomerBodyInput, UpdateCustomerBodyInput } from "@workspace/customers-domain";
import {
  formatCustomerDisplayName,
  resolveEstablishmentFields,
} from "@workspace/customers-domain";
import { db } from "../../db/index.js";
import { customers } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import { resolveCustomerTaxFields } from "./domain/customer-tax.js";

function mapCustomer(row: typeof customers.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    clientType: row.clientType,
    idNumber: row.idNumber,
    birthDate: row.birthDate,
    mobile: row.mobile,
    licenseNumber: row.licenseNumber,
    nationality: row.nationality,
    hasTaxNumber: row.hasTaxNumber,
    taxNumber: row.taxNumber,
    establishmentName: row.establishmentName,
    establishmentNumber: row.establishmentNumber,
    invoiceType: row.invoiceType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function resolveBodyEstablishment(body: CreateBody | UpdateBody) {
  return resolveEstablishmentFields(
    body.clientType,
    body.establishmentName,
    body.establishmentNumber,
  );
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

  const filters = [eq(customers.orgId, orgId), isNull(customers.deletedAt)];
  if (clientType) {
    filters.push(eq(customers.clientType, clientType));
  }
  if (search) {
    filters.push(
      or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.mobile, `%${search}%`),
        ilike(customers.idNumber, `%${search}%`),
        ilike(customers.establishmentName, `%${search}%`),
        ilike(customers.establishmentNumber, `%${search}%`),
      )!,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(customers)
    .where(where);

  const rows = await db
    .select()
    .from(customers)
    .where(where)
    .orderBy(desc(customers.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data: rows.map(mapCustomer),
    total,
    page,
    pageSize,
  };
}

export async function getCustomer(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.orgId, orgId), eq(customers.id, id), isNull(customers.deletedAt)))
    .limit(1);
  return row ? mapCustomer(row) : null;
}

export async function createCustomer(
  orgId: number,
  body: CreateBody,
) {
  const tax = resolveCustomerTaxFields(body);
  const establishment = resolveBodyEstablishment(body);
  const [row] = await db
    .insert(customers)
    .values({
      orgId,
      name: body.name,
      clientType: body.clientType,
      idNumber: body.idNumber,
      birthDate: body.birthDate,
      mobile: body.mobile,
      licenseNumber: body.licenseNumber,
      nationality: body.nationality,
      hasTaxNumber: tax.hasTaxNumber,
      taxNumber: tax.taxNumber,
      establishmentName: establishment.establishmentName,
      establishmentNumber: establishment.establishmentNumber,
      invoiceType: tax.invoiceType,
    })
    .returning();

  await recordActivity(
    orgId,
    "customer",
    `إضافة عميل: ${formatCustomerDisplayName(row.name, row.establishmentName)}`,
  );
  return mapCustomer(row);
}

export async function updateCustomer(
  orgId: number,
  id: number,
  body: UpdateBody,
) {
  const tax = resolveCustomerTaxFields(body);
  const establishment = resolveBodyEstablishment(body);
  const [row] = await db
    .update(customers)
    .set({
      name: body.name,
      clientType: body.clientType,
      idNumber: body.idNumber,
      birthDate: body.birthDate,
      mobile: body.mobile,
      licenseNumber: body.licenseNumber,
      nationality: body.nationality,
      hasTaxNumber: tax.hasTaxNumber,
      taxNumber: tax.taxNumber,
      establishmentName: establishment.establishmentName,
      establishmentNumber: establishment.establishmentNumber,
      invoiceType: tax.invoiceType,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.orgId, orgId), eq(customers.id, id), isNull(customers.deletedAt)))
    .returning();

  if (row) {
    await recordActivity(
      orgId,
      "customer",
      `تعديل عميل: ${formatCustomerDisplayName(row.name, row.establishmentName)}`,
    );
    return mapCustomer(row);
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
    await recordActivity(orgId, "customer", `حذف عميل: ${row.name}`);
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
