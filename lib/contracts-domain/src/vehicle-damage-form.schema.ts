import { z } from "zod";

export const VEHICLE_DAMAGE_MARKER_MAX = 200;

export const VehicleDamageMarkerSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const VehicleDamageFormBodySchema = z.object({
  markers: z
    .array(VehicleDamageMarkerSchema)
    .max(VEHICLE_DAMAGE_MARKER_MAX, "عدد نقاط الأضرار كبير جداً"),
});

export type VehicleDamageMarker = z.infer<typeof VehicleDamageMarkerSchema>;
export type VehicleDamageFormBodyInput = z.infer<typeof VehicleDamageFormBodySchema>;

export function hasVehicleDamageForm(
  markers: VehicleDamageMarker[] | null | undefined,
): boolean {
  return Array.isArray(markers) && markers.length > 0;
}

export function parseVehicleDamageMarkers(value: unknown): VehicleDamageMarker[] | null {
  const parsed = VehicleDamageFormBodySchema.safeParse({ markers: value ?? [] });
  if (!parsed.success) return null;
  return parsed.data.markers;
}

export const VEHICLE_DAMAGE_DIAGRAM_SRC = "/vehicle-damage-diagram.png";
