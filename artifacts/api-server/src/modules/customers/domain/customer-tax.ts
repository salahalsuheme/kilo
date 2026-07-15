import {
  deriveInvoiceType,
  normalizeTaxNumber,
  validateCustomerTaxInput,
} from "@workspace/customers-domain";
import type { CreateCustomerBodyInput, UpdateCustomerBodyInput } from "@workspace/customers-domain";

type CustomerBody = CreateCustomerBodyInput | UpdateCustomerBodyInput;

export function validateCustomerBodyTax(body: CustomerBody): string | null {
  return validateCustomerTaxInput(body.hasTaxNumber, body.taxNumber);
}

export function resolveCustomerTaxFields(body: CustomerBody) {
  const hasTaxNumber = body.hasTaxNumber;
  const taxNumber = hasTaxNumber ? normalizeTaxNumber(body.taxNumber) : null;
  const invoiceType = deriveInvoiceType(body.clientType, hasTaxNumber, taxNumber);
  return { hasTaxNumber, taxNumber, invoiceType };
}
