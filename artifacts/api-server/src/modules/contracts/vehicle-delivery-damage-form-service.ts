import { and, eq, isNull } from "drizzle-orm";
import {
  VEHICLE_DELIVERY_DAMAGE_FORM_ERRORS,
  VehicleDamageFormBodySchema,
  hasVehicleDamageForm,
  type VehicleDamageFormBodyInput,
} from "@workspace/contracts-domain";
import { db } from "../../db/index.js";
import { contracts } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";
import {
  deliveryMarkersFromRow,
  getContractHandoverRow,
  mapDeliveryHandoverFormRow,
  receiptMarkersFromRow,
} from "./vehicle-handover-context.js";

export type VehicleDeliveryDamageFormResponse = Awaited<
  ReturnType<typeof mapDeliveryHandoverFormRow>
>;

function canManageDeliveryHandover(
  row: NonNullable<Awaited<ReturnType<typeof getContractHandoverRow>>>,
): boolean {
  if (row.status === "draft") return false;
  return hasVehicleDamageForm(receiptMarkersFromRow(row));
}

export async function getContractVehicleDeliveryDamageForm(orgId: number, contractId: number) {
  const row = await getContractHandoverRow(orgId, contractId);
  if (!row) return null;
  if (!canManageDeliveryHandover(row)) return null;

  const priorMarkers = receiptMarkersFromRow(row) ?? [];
  const markers = deliveryMarkersFromRow(row) ?? [];
  return mapDeliveryHandoverFormRow(row, markers, priorMarkers, row.updatedAt);
}

export async function upsertContractVehicleDeliveryDamageForm(
  orgId: number,
  contractId: number,
  body: VehicleDamageFormBodyInput,
) {
  const parsed = VehicleDamageFormBodySchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }
  if (parsed.data.markers.length === 0) {
    return { error: VEHICLE_DELIVERY_DAMAGE_FORM_ERRORS.emptyMarkers };
  }

  const row = await getContractHandoverRow(orgId, contractId);
  if (!row) return null;
  if (!canManageDeliveryHandover(row)) {
    return { error: VEHICLE_DELIVERY_DAMAGE_FORM_ERRORS.notAllowed };
  }

  const now = new Date();
  const [updated] = await db
    .update(contracts)
    .set({
      vehicleDeliveryDamageMarkers: parsed.data.markers,
      updatedAt: now,
    })
    .where(
      and(
        eq(contracts.orgId, orgId),
        eq(contracts.id, contractId),
        isNull(contracts.deletedAt),
      ),
    )
    .returning({
      vehicleDeliveryDamageMarkers: contracts.vehicleDeliveryDamageMarkers,
      updatedAt: contracts.updatedAt,
    });

  if (!updated) return null;

  await recordActivity(
    orgId,
    "contract",
    `حفظ محضر تسليم المركبة: ${row.contractNumber}`,
  );

  const markers =
    deliveryMarkersFromRow({
      ...row,
      vehicleDeliveryDamageMarkers: updated.vehicleDeliveryDamageMarkers,
    }) ?? [];
  const priorMarkers = receiptMarkersFromRow(row) ?? [];
  return {
    data: mapDeliveryHandoverFormRow(row, markers, priorMarkers, updated.updatedAt),
  };
}

export async function deleteContractVehicleDeliveryDamageForm(orgId: number, contractId: number) {
  const row = await getContractHandoverRow(orgId, contractId);
  if (!row) return false;
  if (!canManageDeliveryHandover(row)) return false;
  if (!hasVehicleDamageForm(deliveryMarkersFromRow(row))) {
    return false;
  }

  const [updated] = await db
    .update(contracts)
    .set({ vehicleDeliveryDamageMarkers: null, updatedAt: new Date() })
    .where(
      and(
        eq(contracts.orgId, orgId),
        eq(contracts.id, contractId),
        isNull(contracts.deletedAt),
      ),
    )
    .returning({ contractNumber: contracts.contractNumber });

  if (!updated) return false;

  await recordActivity(
    orgId,
    "contract",
    `حذف محضر تسليم المركبة: ${updated.contractNumber}`,
  );

  return true;
}

export function contractHasVehicleDeliveryDamageForm(
  markers: VehicleDamageFormBodyInput["markers"] | null | undefined,
): boolean {
  return hasVehicleDamageForm(markers);
}
