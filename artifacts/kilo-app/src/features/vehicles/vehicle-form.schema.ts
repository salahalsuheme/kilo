import { z } from "zod";
import {
  VehicleBodyObjectSchema,
  VEHICLE_FIELD_ERRORS,
  VEHICLE_MODEL_YEAR_MIN,
  getVehicleModelYearMax,
} from "@workspace/vehicles-domain";

const trimmedRequired = (message: string) => z.string().trim().min(1, message);

const vehicleFormFields = {
  modelYear: z.coerce
    .number<number>({ message: VEHICLE_FIELD_ERRORS.modelYear })
    .int(VEHICLE_FIELD_ERRORS.modelYearInvalid)
    .min(VEHICLE_MODEL_YEAR_MIN, VEHICLE_FIELD_ERRORS.modelYearInvalid)
    .max(getVehicleModelYearMax(), VEHICLE_FIELD_ERRORS.modelYearInvalid),
  odometer: z.coerce
    .number<number>({ message: VEHICLE_FIELD_ERRORS.odometer })
    .int(VEHICLE_FIELD_ERRORS.odometerInvalid)
    .min(0, VEHICLE_FIELD_ERRORS.odometerInvalid),
};

export const createVehicleFormSchema = VehicleBodyObjectSchema.extend(vehicleFormFields);

export const vehicleFormSchema = VehicleBodyObjectSchema.extend({
  ...vehicleFormFields,
  serialNumber: trimmedRequired(VEHICLE_FIELD_ERRORS.serialNumber),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export {
  COOLING_TYPE_LABELS,
  MANUAL_VEHICLE_STATUS_LABELS,
  PERIODIC_MAINTENANCE_INTERVAL_LABELS,
  VEHICLE_FIELD_LABELS,
  VEHICLE_STATUS_LABELS,
  formatRemainingPeriodicMaintenanceDays,
} from "@workspace/vehicles-domain";

export { VEHICLE_MODEL_YEAR_MIN, getVehicleModelYearMax } from "@workspace/vehicles-domain";

export function buildModelYearOptions(): number[] {
  const max = new Date().getFullYear();
  const years: number[] = [];
  for (let year = max; year >= 2015; year--) {
    years.push(year);
  }
  return years;
}
