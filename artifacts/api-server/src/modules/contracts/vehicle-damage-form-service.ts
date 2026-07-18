import { and, eq, isNull } from "drizzle-orm";
import {
  VEHICLE_DAMAGE_FORM_ERRORS,
  VehicleDamageFormBodySchema,
  hasVehicleDamageForm,
  parseVehicleDamageMarkers,
  type VehicleDamageFormBodyInput,
  type VehicleDamageMarker,
} from "@workspace/contracts-domain";
import { db } from "../../db/index.js";
import { contracts } from "../../db/schema.js";
import { recordActivity } from "../bootstrap/service.js";

export type VehicleDamageFormResponse = {
  contractId: number;
  contractNumber: string;
  markers: VehicleDamageMarker[];
  updatedAt: string;
};

async function getContractDamageRow(orgId: number, contractId: number) {
  const [row] = await db
    .select({
      id: contracts.id,
      contractNumber: contracts.contractNumber,
      vehicleDamageMarkers: contracts.vehicleDamageMarkers,
      updatedAt: contracts.updatedAt,
    })
    .from(contracts)
    .where(
      and(
        eq(contracts.orgId, orgId),
        eq(contracts.id, contractId),
        isNull(contracts.deletedAt),
      ),
    )
    .limit(1);

  return row ?? null;
}

function mapDamageFormRow(
  row: NonNullable<Awaited<ReturnType<typeof getContractDamageRow>>>,
): VehicleDamageFormResponse {
  const markers = parseVehicleDamageMarkers(row.vehicleDamageMarkers) ?? [];
  return {
    contractId: row.id,
    contractNumber: row.contractNumber,
    markers,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getContractVehicleDamageForm(orgId: number, contractId: number) {
  const row = await getContractDamageRow(orgId, contractId);
  if (!row) return null;
  if (!hasVehicleDamageForm(parseVehicleDamageMarkers(row.vehicleDamageMarkers))) {
    return null;
  }
  return mapDamageFormRow(row);
}

export async function upsertContractVehicleDamageForm(
  orgId: number,
  contractId: number,
  body: VehicleDamageFormBodyInput,
) {
  const parsed = VehicleDamageFormBodySchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }
  if (parsed.data.markers.length === 0) {
    return { error: VEHICLE_DAMAGE_FORM_ERRORS.emptyMarkers };
  }

  const row = await getContractDamageRow(orgId, contractId);
  if (!row) return null;

  const now = new Date();
  const [updated] = await db
    .update(contracts)
    .set({
      vehicleDamageMarkers: parsed.data.markers,
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
      id: contracts.id,
      contractNumber: contracts.contractNumber,
      vehicleDamageMarkers: contracts.vehicleDamageMarkers,
      updatedAt: contracts.updatedAt,
    });

  if (!updated) return null;

  await recordActivity(
    orgId,
    "contract",
    `حفظ نموذج أضرار المركبة: ${updated.contractNumber}`,
  );

  return { data: mapDamageFormRow(updated) };
}

export async function deleteContractVehicleDamageForm(orgId: number, contractId: number) {
  const row = await getContractDamageRow(orgId, contractId);
  if (!row) return false;
  if (!hasVehicleDamageForm(parseVehicleDamageMarkers(row.vehicleDamageMarkers))) {
    return false;
  }

  const [updated] = await db
    .update(contracts)
    .set({ vehicleDamageMarkers: null, updatedAt: new Date() })
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
    `حذف نموذج أضرار المركبة: ${updated.contractNumber}`,
  );

  return true;
}

export function contractHasVehicleDamageForm(
  markers: VehicleDamageMarker[] | null | undefined,
): boolean {
  return hasVehicleDamageForm(markers);
}
