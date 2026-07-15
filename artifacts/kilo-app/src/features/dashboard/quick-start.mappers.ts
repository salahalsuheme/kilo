import type { CustomerFormValues } from "@/features/customers/customer-form.schema";
import type { VehicleFormValues } from "@/features/vehicles/vehicle-form.schema";
import type { CreateCustomerBody, CreateVehicleBody } from "@/lib/api-client-react-tenant";
import { isNonIndividualClientType } from "@workspace/customers-domain";

export function toCreateCustomerBody(values: CustomerFormValues): CreateCustomerBody {
  return {
    name: values.name,
    clientType: values.clientType,
    idNumber: values.idNumber,
    birthDate: values.birthDate,
    mobile: values.mobile,
    licenseNumber: values.licenseNumber,
    nationality: values.nationality,
    hasTaxNumber: values.hasTaxNumber,
    taxNumber: values.hasTaxNumber ? values.taxNumber?.trim() || null : null,
    establishmentName: isNonIndividualClientType(values.clientType)
      ? values.establishmentName.trim()
      : null,
    establishmentNumber: isNonIndividualClientType(values.clientType)
      ? values.establishmentNumber.trim()
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
