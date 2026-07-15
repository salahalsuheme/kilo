import { z } from "zod";
import {
  getVehicleModelYearMax,
  isValidIsoDateString,
  VEHICLE_FIELD_ERRORS,
  VEHICLE_MODEL_YEAR_MIN,
} from "./vehicle-field-errors.js";

const trimmedRequired = (message: string) => z.string().trim().min(1, message);

const dateSchema = (requiredMessage: string, invalidMessage: string) =>
  trimmedRequired(requiredMessage).refine(isValidIsoDateString, { message: invalidMessage });

/** Base object matching OpenAPI CreateVehicleBody field shapes. */
export const VehicleBodyObjectSchema = z.object({
  brand: trimmedRequired(VEHICLE_FIELD_ERRORS.brand),
  modelYear: z
    .number({ message: VEHICLE_FIELD_ERRORS.modelYear })
    .int(VEHICLE_FIELD_ERRORS.modelYearInvalid)
    .min(VEHICLE_MODEL_YEAR_MIN, VEHICLE_FIELD_ERRORS.modelYearInvalid)
    .max(getVehicleModelYearMax(), VEHICLE_FIELD_ERRORS.modelYearInvalid),
  coolingType: z.enum(["refrigerated", "non_refrigerated"], {
    message: VEHICLE_FIELD_ERRORS.coolingType,
  }),
  registrationColor: trimmedRequired(VEHICLE_FIELD_ERRORS.registrationColor),
  chassisNumber: trimmedRequired(VEHICLE_FIELD_ERRORS.chassisNumber),
  serialNumber: trimmedRequired(VEHICLE_FIELD_ERRORS.serialNumber),
  plateNumber: trimmedRequired(VEHICLE_FIELD_ERRORS.plateNumber),
  registrationExpiryDate: dateSchema(
    VEHICLE_FIELD_ERRORS.registrationExpiryDate,
    VEHICLE_FIELD_ERRORS.registrationExpiryDateInvalid,
  ),
  inspectionExpiryDate: dateSchema(
    VEHICLE_FIELD_ERRORS.inspectionExpiryDate,
    VEHICLE_FIELD_ERRORS.inspectionExpiryDateInvalid,
  ),
  odometer: z
    .number({ message: VEHICLE_FIELD_ERRORS.odometer })
    .int(VEHICLE_FIELD_ERRORS.odometerInvalid)
    .min(0, VEHICLE_FIELD_ERRORS.odometerInvalid),
  periodicMaintenanceInterval: z.enum(["every_1_month", "every_2_months", "every_3_months"], {
    message: VEHICLE_FIELD_ERRORS.periodicMaintenanceInterval,
  }),
  status: z.enum(["available", "rented", "stopped", "suspended"], {
    message: VEHICLE_FIELD_ERRORS.status,
  }),
});

/** Mirrors OpenAPI CreateVehicleBody with Arabic validation messages. */
export const CreateVehicleBodySchema = VehicleBodyObjectSchema;

export const UpdateVehicleBodySchema = CreateVehicleBodySchema;

export type CreateVehicleBodyInput = z.infer<typeof CreateVehicleBodySchema>;
export type UpdateVehicleBodyInput = z.infer<typeof UpdateVehicleBodySchema>;
