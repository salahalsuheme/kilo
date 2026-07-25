import type { CustomerFormValues } from "@/features/customers/customer-form.schema";
import type { VehicleFormValues } from "@/features/vehicles/vehicle-form.schema";
import type { CreateCustomerBody, CreateVehicleBody } from "@/lib/api-client-react-tenant";
import { isNonIndividualClientType } from "@workspace/customers-domain";

export function toCreateCustomerBody(values: CustomerFormValues): CreateCustomerBody {
  const nonIndividual = isNonIndividualClientType(values.clientType);
  return {
    name: values.name,
    clientType: values.clientType,
    establishmentId: nonIndividual ? Number(values.establishmentId) : null,
    idNumber: values.idNumber,
    birthDate: values.birthDate,
    mobile: values.mobile,
    licenseNumber: values.licenseNumber,
    nationality: values.nationality,
    hasTaxNumber: nonIndividual ? false : values.hasTaxNumber,
    taxNumber: nonIndividual
      ? null
      : values.hasTaxNumber
        ? values.taxNumber?.trim() || null
        : null,
  };
}

export function toCreateVehicleBody(values: VehicleFormValues): CreateVehicleBody {
  return {
    brand: values.brand,
    modelYear: values.modelYear,
    coolingType: values.coolingType,
    registrationColor: values.registrationColor,
    chassisNumber: values.chassisNumber,
    serialNumber: values.serialNumber,
    plateNumber: values.plateNumber,
    registrationExpiryDate: values.registrationExpiryDate,
    inspectionExpiryDate: values.inspectionExpiryDate,
    odometer: values.odometer,
    periodicMaintenanceInterval: values.periodicMaintenanceInterval,
    status: values.status,
  };
}
