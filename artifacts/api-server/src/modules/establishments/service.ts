import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import type { z } from "zod";
import { ListEstablishmentsQueryParams } from "@workspace/api-zod";
import type {
  CreateEstablishmentBodyInput,
  UpdateEstablishmentBodyInput,
} from "@workspace/establishments-domain";
import {
  formatEstablishmentFullName,
  resolveEstablishmentNumberFromBody,
  resolveEstablishmentTaxFields,
  type EstablishmentType,
} from "@workspace/establishments-domain";
import { db } from "../../db/index.js";
import { establishments } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";

function mapEstablishment(row: typeof establishments.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    clientType: row.clientType,
    establishmentNumber: row.establishmentNumber,
    hasTaxNumber: row.hasTaxNumber,
    taxNumber: row.taxNumber,
    invoiceType: row.invoiceType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type ListParams = z.infer<typeof ListEstablishmentsQueryParams>;
type CreateBody = CreateEstablishmentBodyInput;
type UpdateBody = UpdateEstablishmentBodyInput;

export async function listEstablishments(orgId: number, params: Partial<ListParams>) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();
  const clientType = params.clientType;

  const filters = [eq(establishments.orgId, orgId), isNull(establishments.deletedAt)];
  if (clientType) {
    filters.push(eq(establishments.clientType, clientType));
  }
  if (search) {
    filters.push(
      or(
        ilike(establishments.name, `%${search}%`),
        ilike(establishments.establishmentNumber, `%${search}%`),
      )!,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(establishments)
    .where(where);

  const rows = await db
    .select()
    .from(establishments)
    .where(where)
    .orderBy(desc(establishments.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data: rows.map(mapEstablishment),
    total,
    page,
    pageSize,
  };
}

export async function getEstablishment(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(establishments)
    .where(
      and(eq(establishments.orgId, orgId), eq(establishments.id, id), isNull(establishments.deletedAt)),
    )
    .limit(1);
  return row ? mapEstablishment(row) : null;
}

export async function createEstablishment(orgId: number, body: CreateBody) {
  const tax = resolveEstablishmentTaxFields(body);
  const establishmentNumber = resolveEstablishmentNumberFromBody(body.establishmentNumber);
  if (!establishmentNumber) {
    throw new Error("invalid establishment number");
  }

  const [row] = await db
    .insert(establishments)
    .values({
      orgId,
      name: body.name.trim(),
      clientType: body.clientType,
      establishmentNumber,
      hasTaxNumber: tax.hasTaxNumber,
      taxNumber: tax.taxNumber,
      invoiceType: tax.invoiceType,
    })
    .returning();

  await recordActivity(
    orgId,
    "customer",
    `إضافة منشأة: ${formatEstablishmentFullName(row.clientType as EstablishmentType, row.name)}`,
  );
  return mapEstablishment(row);
}

export async function updateEstablishment(orgId: number, id: number, body: UpdateBody) {
  const tax = resolveEstablishmentTaxFields(body);
  const establishmentNumber = resolveEstablishmentNumberFromBody(body.establishmentNumber);
  if (!establishmentNumber) {
    throw new Error("invalid establishment number");
  }

  const [row] = await db
    .update(establishments)
    .set({
      name: body.name.trim(),
      clientType: body.clientType,
      establishmentNumber,
      hasTaxNumber: tax.hasTaxNumber,
      taxNumber: tax.taxNumber,
      invoiceType: tax.invoiceType,
      updatedAt: new Date(),
    })
    .where(
      and(eq(establishments.orgId, orgId), eq(establishments.id, id), isNull(establishments.deletedAt)),
    )
    .returning();

  if (row) {
    await recordActivity(
      orgId,
      "customer",
      `تعديل منشأة: ${formatEstablishmentFullName(row.clientType as EstablishmentType, row.name)}`,
    );
    return mapEstablishment(row);
  }
  return null;
}

export async function deleteEstablishment(orgId: number, id: number) {
  const [row] = await db
    .update(establishments)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(establishments.orgId, orgId), eq(establishments.id, id), isNull(establishments.deletedAt)),
    )
    .returning();

  if (row) {
    await recordActivity(orgId, "customer", `حذف منشأة: ${row.name}`);
    return true;
  }
  return false;
}
