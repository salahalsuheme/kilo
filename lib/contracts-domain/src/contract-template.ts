const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

export function renderContractTemplate(
  body: string,
  variables: Record<string, string>,
): string {
  return body.replace(PLACEHOLDER_PATTERN, (_match, key: string) => variables[key] ?? "");
}

export function formatContractDateTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export interface ContractTemplateDriverInput {
  name: string;
  idNumber: string;
  mobile: string;
  nationality: string;
  licenseNumber?: string | null;
}

export interface ContractTemplateEstablishmentInput {
  name: string;
  fullName: string;
  number: string;
  clientTypeLabel: string;
}

export interface ContractTemplateContextInput {
  org: { businessName: string };
  driver: ContractTemplateDriverInput;
  establishment?: ContractTemplateEstablishmentInput | null;
  car: {
    brand: string;
    modelYear: number;
    plateNumber: string;
    coolingTypeLabel: string;
  };
  contract: {
    number?: string;
    authorizationNumber?: string;
    startAt: Date | string;
    endAt: Date | string;
    rentalDays: number;
    amountExVat: number;
    taxAmount: number;
    totalInclVat: number;
  };
}

export function buildContractTemplateVariables(
  input: ContractTemplateContextInput,
): Record<string, string> {
  const { org, driver, establishment, car, contract } = input;
  const establishmentName = establishment?.name.trim() ?? "";
  const establishmentFullName = establishment?.fullName.trim() ?? "";
  const establishmentNumber = establishment?.number.trim() ?? "";
  const establishmentTypeLabel = establishment?.clientTypeLabel.trim() ?? "";

  return {
    "org.businessName": org.businessName,
    "driver.name": driver.name.trim(),
    "driver.idNumber": driver.idNumber,
    "driver.mobile": driver.mobile,
    "driver.nationality": driver.nationality,
    "driver.licenseNumber": driver.licenseNumber ?? "",
    "establishment.name": establishmentName,
    "establishment.fullName": establishmentFullName,
    "establishment.number": establishmentNumber,
    "establishment.typeLabel": establishmentTypeLabel,
    "customer.name": driver.name.trim(),
    "customer.idNumber": driver.idNumber,
    "customer.mobile": driver.mobile,
    "customer.nationality": driver.nationality,
    "customer.licenseNumber": driver.licenseNumber ?? "",
    "customer.establishmentName": establishmentName,
    "customer.establishmentFullName": establishmentFullName,
    "customer.establishmentNumber": establishmentNumber,
    "car.brand": car.brand,
    "car.modelYear": String(car.modelYear),
    "car.plateNumber": car.plateNumber,
    "car.coolingType": car.coolingTypeLabel,
    "contract.number": contract.number ?? "",
    "contract.authorizationNumber": contract.authorizationNumber?.trim() ?? "",
    "contract.startAt": formatContractDateTime(contract.startAt),
    "contract.endAt": formatContractDateTime(contract.endAt),
    "contract.rentalDays": String(contract.rentalDays),
    "contract.amountExVat": contract.amountExVat.toFixed(2),
    "contract.taxAmount": contract.taxAmount.toFixed(2),
    "contract.totalInclVat": contract.totalInclVat.toFixed(2),
  };
}
