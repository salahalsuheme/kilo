import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import type { z } from "zod";
import { ListVehiclesQueryParams } from "@workspace/api-zod";
import type { CreateVehicleBodyInput, UpdateVehicleBodyInput } from "@workspace/vehicles-domain";
import {
  MANUAL_VEHICLE_STATUSES,
  VEHICLE_STATUS_ERRORS,
  computeRemainingPeriodicMaintenanceDays,
  resolveMaintenanceCounterOnStatusChange,
  validateVehicleDeletion,
} from "@workspace/vehicles-domain";
import { db } from "../../db/index.js";
import { cars } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";

function mapVehicle(row: typeof cars.$inferSelect) {
  return {
    id: row.id,
    brand: row.brand,
    modelYear: row.modelYear,
    coolingType: row.coolingType,
    registrationColor: row.registrationColor,
    chassisNumber: row.chassisNumber,
    serialNumber: row.serialNumber,
    plateNumber: row.plateNumber,
    registrationExpiryDate: row.registrationExpiryDate,
    inspectionExpiryDate: row.inspectionExpiryDate,
    odometer: row.odometer,
    periodicMaintenanceInterval: row.periodicMaintenanceInterval,
    remainingPeriodicMaintenanceDays: computeRemainingPeriodicMaintenanceDays({
      periodicMaintenanceAnchorAt: row.periodicMaintenanceAnchorAt,
      maintenanceCounterPausedRemainingDays: row.maintenanceCounterPausedRemainingDays,
      periodicMaintenanceInterval: row.periodicMaintenanceInterval,
      status: row.status,
    }),
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type ListParams = z.infer<typeof ListVehiclesQueryParams>;
type CreateBody = CreateVehicleBodyInput;
type UpdateBody = UpdateVehicleBodyInput;

function isManualStatus(status: string): status is (typeof MANUAL_VEHICLE_STATUSES)[number] {
  return (MANUAL_VEHICLE_STATUSES as readonly string[]).includes(status);
}

function validateManualStatus(status: string): string | null {
  if (status === "rented") return VEHICLE_STATUS_ERRORS.cannotSetRentedManually;
  if (!isManualStatus(status)) return VEHICLE_STATUS_ERRORS.invalidManualStatus;
  return null;
}

async function getVehicleRow(orgId: number, id: number) {
  const [row] = await db
    .select()
    .from(cars)
    .where(and(eq(cars.orgId, orgId), eq(cars.id, id), isNull(cars.deletedAt)))
    .limit(1);
  return row ?? null;
}

export async function listVehicles(
  orgId: number,
  params: Partial<ListParams>,
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.trim();
  const status = params.status;

  const filters = [eq(cars.orgId, orgId), isNull(cars.deletedAt)];
  if (status) {
    filters.push(eq(cars.status, status));
  }
  if (search) {
    filters.push(
      or(
        ilike(cars.brand, `%${search}%`),
        ilike(cars.plateNumber, `%${search}%`),
        ilike(cars.chassisNumber, `%${search}%`),
        ilike(cars.serialNumber, `%${search}%`),
      )!,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(cars)
    .where(where);

  const rows = await db
    .select()
    .from(cars)
    .where(where)
    .orderBy(desc(cars.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data: rows.map(mapVehicle),
    total,
    page,
    pageSize,
  };
}

export async function getVehicle(orgId: number, id: number) {
  const row = await getVehicleRow(orgId, id);
  return row ? mapVehicle(row) : null;
}

export async function createVehicle(
  orgId: number,
  body: CreateBody,
) {
  const statusError = validateManualStatus(body.status);
  if (statusError) return { error: statusError };

  const now = new Date();
  const [row] = await db
    .insert(cars)
    .values({
      orgId,
      brand: body.brand,
      modelYear: body.modelYear,
      coolingType: body.coolingType,
      registrationColor: body.registrationColor,
      chassisNumber: body.chassisNumber,
      serialNumber: body.serialNumber,
      plateNumber: body.plateNumber,
      registrationExpiryDate: body.registrationExpiryDate,
      inspectionExpiryDate: body.inspectionExpiryDate,
      odometer: body.odometer,
      periodicMaintenanceInterval: body.periodicMaintenanceInterval,
      periodicMaintenanceAnchorAt: now,
      maintenanceCounterPausedRemainingDays:
        body.status === "stopped"
          ? computeRemainingPeriodicMaintenanceDays({
              periodicMaintenanceAnchorAt: now,
              maintenanceCounterPausedRemainingDays: null,
              periodicMaintenanceInterval: body.periodicMaintenanceInterval,
              status: "available",
            })
          : null,
      status: body.status,
    })
    .returning();

  await recordActivity(orgId, "vehicle", `إضافة مركبة: ${row.brand} — ${row.plateNumber}`);
  return { data: mapVehicle(row) };
}

export async function updateVehicle(
  orgId: number,
  id: number,
  body: UpdateBody,
) {
  const existingRow = await getVehicleRow(orgId, id);
  if (!existingRow) return null;

  if (existingRow.status === "rented") {
    if (body.status !== "rented") {
      return { error: VEHICLE_STATUS_ERRORS.cannotChangeRentedStatus };
    }
  } else {
    const statusError = validateManualStatus(body.status);
    if (statusError) return { error: statusError };
  }

  const counterFields =
    existingRow.status !== body.status
      ? resolveMaintenanceCounterOnStatusChange(existingRow.status, body.status, {
          periodicMaintenanceAnchorAt: existingRow.periodicMaintenanceAnchorAt,
          maintenanceCounterPausedRemainingDays: existingRow.maintenanceCounterPausedRemainingDays,
          periodicMaintenanceInterval: body.periodicMaintenanceInterval,
        })
      : {
          periodicMaintenanceAnchorAt: existingRow.periodicMaintenanceAnchorAt,
          maintenanceCounterPausedRemainingDays: existingRow.maintenanceCounterPausedRemainingDays,
        };

  const [row] = await db
    .update(cars)
    .set({
      brand: body.brand,
      modelYear: body.modelYear,
      coolingType: body.coolingType,
      registrationColor: body.registrationColor,
      chassisNumber: body.chassisNumber,
      serialNumber: body.serialNumber,
      plateNumber: body.plateNumber,
      registrationExpiryDate: body.registrationExpiryDate,
      inspectionExpiryDate: body.inspectionExpiryDate,
      odometer: body.odometer,
      periodicMaintenanceInterval: body.periodicMaintenanceInterval,
      periodicMaintenanceAnchorAt: counterFields.periodicMaintenanceAnchorAt,
      maintenanceCounterPausedRemainingDays: counterFields.maintenanceCounterPausedRemainingDays,
      status: body.status,
      updatedAt: new Date(),
    })
    .where(and(eq(cars.orgId, orgId), eq(cars.id, id), isNull(cars.deletedAt)))
    .returning();

  if (row) {
    await recordActivity(orgId, "vehicle", `تعديل مركبة: ${row.brand} — ${row.plateNumber}`);
    return { data: mapVehicle(row) };
  }
  return null;
}

export async function deleteVehicle(orgId: number, id: number) {
  const existing = await getVehicle(orgId, id);
  if (!existing) return null;

  const deleteError = validateVehicleDeletion(existing.status);
  if (deleteError) return { error: deleteError };

  const [row] = await db
    .update(cars)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(cars.orgId, orgId), eq(cars.id, id), isNull(cars.deletedAt)))
    .returning();

  if (row) {
    await recordActivity(orgId, "vehicle", `حذف مركبة: ${row.brand} — ${row.plateNumber}`);
    return { deleted: true as const };
  }
  return null;
}
