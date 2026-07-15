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

export interface ContractTemplateContextInput {
  org: { businessName: string };
  customer: {
    name: string;
    idNumber: string;
    mobile: string;
    nationality: string;
    licenseNumber?: string | null;
    establishmentName?: string | null;
    establishmentNumber?: string | null;
  };
  car: {
    brand: string;
    modelYear: number;
    plateNumber: string;
    coolingTypeLabel: string;
  };
  contract: {
    number?: string;
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
  const { org, customer, car, contract } = input;
  return {
    "org.businessName": org.businessName,
    "customer.name": customer.name.trim(),
    "customer.establishmentName": customer.establishmentName?.trim() ?? "",
    "customer.establishmentNumber": customer.establishmentNumber?.trim() ?? "",
    "customer.idNumber": customer.idNumber,
    "customer.mobile": customer.mobile,
    "customer.nationality": customer.nationality,
    "customer.licenseNumber": customer.licenseNumber ?? "",
    "car.brand": car.brand,
    "car.modelYear": String(car.modelYear),
    "car.plateNumber": car.plateNumber,
    "car.coolingType": car.coolingTypeLabel,
    "contract.number": contract.number ?? "",
    "contract.startAt": formatContractDateTime(contract.startAt),
    "contract.endAt": formatContractDateTime(contract.endAt),
    "contract.rentalDays": String(contract.rentalDays),
    "contract.amountExVat": contract.amountExVat.toFixed(2),
    "contract.taxAmount": contract.taxAmount.toFixed(2),
    "contract.totalInclVat": contract.totalInclVat.toFixed(2),
  };
}
