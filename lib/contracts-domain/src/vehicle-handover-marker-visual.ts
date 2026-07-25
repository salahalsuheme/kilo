import type { VehicleDamageMarker } from "./vehicle-damage-form.schema.js";

/** نقاط محضر الاستلام (أضرار سابقة) تُعرض بالأصفر في محضر التسليم. */
export type VehicleHandoverPriorMarker = VehicleDamageMarker;

/** نقاط جديدة في محضر التسليم (أضرار المستأجر الحالي) تُعرض بالأحمر. */
export type VehicleHandoverNewMarker = VehicleDamageMarker;

export const VEHICLE_HANDOVER_MARKER_COLORS = {
  prior: {
    fill: "#eab308",
    stroke: "#a16207",
  },
  new: {
    fill: "#dc2626",
    stroke: "#991b1b",
  },
} as const;
