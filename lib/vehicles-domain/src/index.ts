export type {
  VehicleStatus,
  VehicleCoolingType,
  VehiclePeriodicMaintenanceInterval,
} from "./types.js";
export {
  VEHICLE_BODY_INVALID,
  VEHICLE_FIELD_ERRORS,
  VEHICLE_MODEL_YEAR_MIN,
  VEHICLE_STATUS_ERRORS,
  getVehicleModelYearMax,
  isValidIsoDateString,
} from "./vehicle-field-errors.js";
export {
  VEHICLE_DUPLICATE_ERRORS,
  VEHICLE_DUPLICATE_FALLBACK,
  VEHICLE_UNIQUE_INDEXES,
  messageForVehicleUniqueViolation,
} from "./vehicle-unique.js";
export {
  CreateVehicleBodySchema,
  UpdateVehicleBodySchema,
  VehicleBodyObjectSchema,
  type CreateVehicleBodyInput,
  type UpdateVehicleBodyInput,
} from "./vehicle-body.schema.js";
export {
  COOLING_TYPE_LABELS,
  MANUAL_VEHICLE_STATUSES,
  MANUAL_VEHICLE_STATUS_LABELS,
  PERIODIC_MAINTENANCE_INTERVAL_LABELS,
  VEHICLE_STATUS_LABELS,
  type ManualVehicleStatus,
} from "./vehicle-labels.js";
export { VEHICLE_FIELD_LABELS } from "./vehicle-field-labels.js";
export {
  VEHICLE_DELETE_ERRORS,
  canDeleteVehicle,
  validateVehicleDeletion,
} from "./vehicle-delete.js";
export {
  remainingCalendarDaysUntil,
  expiryDateToEndAt,
} from "./vehicle-expiry.js";
export {
  PERIODIC_MAINTENANCE_INTERVAL_DAYS,
  computeRemainingPeriodicMaintenanceDays,
  maintenanceDueAtFromRemaining,
  formatRemainingPeriodicMaintenanceDays,
  resolveMaintenanceCounterOnStatusChange,
  type MaintenanceCounterFields,
  type MaintenanceCounterState,
} from "./vehicle-periodic-maintenance.js";
export { isVehicleRentable } from "./vehicle-rental-eligibility.js";
