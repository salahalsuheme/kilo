export function buildRentalInvoiceLineDescription(input: {
  vehicleBrand: string;
  vehiclePlateNumber: string;
  contractNumber: string;
}): string {
  return `تأجير مركبة ${input.vehicleBrand} — لوحة ${input.vehiclePlateNumber} — عقد ${input.contractNumber}`;
}
